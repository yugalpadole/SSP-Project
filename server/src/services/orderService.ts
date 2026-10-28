import db from '../db';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerId: number;
  customerName: string;
  customerPhone: string;
  shopId: number;
  orderType: 'delivery' | 'reserve_collect';
  deliveryAddress?: string;
  customerNotes?: string;
  items: CreateOrderItemInput[];
}

export class OrderService {
  /**
   * Creates an order or reservation with strict inventory verification inside an atomic transaction.
   */
  static createOrder(input: CreateOrderInput) {
    const {
      customerId,
      customerName,
      customerPhone,
      shopId,
      orderType,
      deliveryAddress,
      customerNotes,
      items,
    } = input;

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one product.');
    }

    const tx = db.transaction(() => {
      // 1. Get shop details
      const shop = db
        .prepare('SELECT * FROM shops WHERE id = ?')
        .get(shopId) as any;
      if (!shop) {
        throw new Error('Shop not found.');
      }

      if (orderType === 'delivery' && !shop.is_delivery_enabled) {
        throw new Error('Home delivery is currently disabled for this shop.');
      }

      // 2. Validate all products and stock
      let subtotal = 0;
      const orderItemsToInsert: any[] = [];

      for (const item of items) {
        const product = db
          .prepare('SELECT * FROM products WHERE id = ? AND shop_id = ?')
          .get(item.productId, shopId) as any;

        if (!product || !product.is_active) {
          throw new Error(`Product ID ${item.productId} is not available from this shop.`);
        }

        const availableStock = product.stock_quantity - (product.reserved_quantity || 0);
        if (item.quantity > availableStock) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${Math.max(0, availableStock)}`
          );
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItemsToInsert.push({
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          price: product.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      const deliveryCharge = orderType === 'delivery' ? (shop.delivery_charge || 0) : 0;
      const totalAmount = subtotal + deliveryCharge;

      // 3. Compute reservation expiry if reserve_collect
      let reservationExpiresAt: string | null = null;
      if (orderType === 'reserve_collect') {
        const expiryMins = shop.reservation_expiry_minutes || 60;
        const expiryDate = new Date(Date.now() + expiryMins * 60 * 1000);
        reservationExpiresAt = expiryDate.toISOString();
      }

      // Generate human-friendly order number: EBZ-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `EBZ-${dateStr}-${randomCode}`;

      // Initial status
      const initialStatus = 'pending';

      const insertOrder = db.prepare(`
        INSERT INTO orders (
          order_number, customer_id, shop_id, order_type, status,
          subtotal, delivery_charge, total_amount, delivery_address,
          customer_name, customer_phone, customer_notes, reservation_expires_at,
          stock_released
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `);

      const result = insertOrder.run(
        orderNumber,
        customerId,
        shopId,
        orderType,
        initialStatus,
        subtotal,
        deliveryCharge,
        totalAmount,
        deliveryAddress || null,
        customerName,
        customerPhone,
        customerNotes || null,
        reservationExpiresAt
      );

      const orderId = result.lastInsertRowid;

      // Insert items and adjust inventory
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, unit, price, quantity, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of orderItemsToInsert) {
        insertItem.run(
          orderId,
          item.productId,
          item.productName,
          item.unit,
          item.price,
          item.quantity,
          item.totalPrice
        );

        if (orderType === 'reserve_collect') {
          // Increase reserved quantity
          db.prepare(`
            UPDATE products
            SET reserved_quantity = reserved_quantity + ?
            WHERE id = ?
          `).run(item.quantity, item.productId);
        } else {
          // Immediate deduction for delivery orders
          db.prepare(`
            UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ?
          `).run(item.quantity, item.productId);
        }
      }

      return {
        id: orderId,
        orderNumber,
        orderType,
        status: initialStatus,
        totalAmount,
        reservationExpiresAt,
      };
    });

    return tx();
  }

  /**
   * Cancel an order or reservation safely releasing stock exactly once.
   */
  static cancelOrder(orderId: number, cancelledBy: 'customer' | 'shopkeeper', reason?: string) {
    const tx = db.transaction(() => {
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
      if (!order) {
        throw new Error('Order not found.');
      }

      if (['completed', 'cancelled', 'expired'].includes(order.status)) {
        throw new Error(`Cannot cancel order in "${order.status}" status.`);
      }

      // Release stock if not yet released
      if (order.stock_released === 0) {
        const items = db
          .prepare('SELECT * FROM order_items WHERE order_id = ?')
          .all(orderId) as any[];

        for (const item of items) {
          if (order.order_type === 'reserve_collect') {
            db.prepare(`
              UPDATE products
              SET reserved_quantity = MAX(0, reserved_quantity - ?)
              WHERE id = ?
            `).run(item.quantity, item.product_id);
          } else {
            db.prepare(`
              UPDATE products
              SET stock_quantity = stock_quantity + ?
              WHERE id = ?
            `).run(item.quantity, item.product_id);
          }
        }

        db.prepare('UPDATE orders SET stock_released = 1 WHERE id = ?').run(orderId);
      }

      const cancellationMsg = reason || `Cancelled by ${cancelledBy}`;
      db.prepare(`
        UPDATE orders
        SET status = 'cancelled', cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cancellationMsg, orderId);

      return { success: true, status: 'cancelled' };
    });

    return tx();
  }

  /**
   * Update order status by shopkeeper (accept, reject, prepare, ready_for_pickup, out_for_delivery, completed).
   */
  static updateOrderStatus(orderId: number, newStatus: string, shopId: number) {
    const tx = db.transaction(() => {
      const order = db
        .prepare('SELECT * FROM orders WHERE id = ? AND shop_id = ?')
        .get(orderId, shopId) as any;

      if (!order) {
        throw new Error('Order not found for your shop.');
      }

      if (['completed', 'cancelled', 'expired'].includes(order.status)) {
        throw new Error(`Order is already ${order.status} and cannot be modified.`);
      }

      // If rejected, release stock exactly once
      if (newStatus === 'cancelled' || newStatus === 'rejected') {
        return this.cancelOrder(orderId, 'shopkeeper', 'Rejected by shopkeeper');
      }

      // If completing a reserve & collect order:
      // Deduct from stock_quantity and release reserved_quantity
      if (newStatus === 'completed' && order.order_type === 'reserve_collect') {
        const items = db
          .prepare('SELECT * FROM order_items WHERE order_id = ?')
          .all(orderId) as any[];

        for (const item of items) {
          db.prepare(`
            UPDATE products
            SET stock_quantity = MAX(0, stock_quantity - ?),
                reserved_quantity = MAX(0, reserved_quantity - ?)
            WHERE id = ?
          `).run(item.quantity, item.quantity, item.product_id);
        }
        // Completed orders never expire
        db.prepare('UPDATE orders SET stock_released = 1 WHERE id = ?').run(orderId);
      }

      db.prepare(`
        UPDATE orders
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, orderId);

      return { success: true, status: newStatus };
    });

    return tx();
  }

  /**
   * Auto-expire eligible reservations past their expiration timestamp.
   * Releases reserved stock exactly once.
   * Completed orders are never expired.
   */
  static processExpiredReservations() {
    try {
      const nowIso = new Date().toISOString();
      const expiredOrders = db
        .prepare(`
          SELECT id, order_number FROM orders
          WHERE order_type = 'reserve_collect'
            AND status IN ('pending', 'confirmed', 'preparing', 'ready_for_pickup')
            AND reservation_expires_at IS NOT NULL
            AND reservation_expires_at < ?
            AND stock_released = 0
        `)
        .all(nowIso) as any[];

      for (const order of expiredOrders) {
        db.transaction(() => {
          const items = db
            .prepare('SELECT * FROM order_items WHERE order_id = ?')
            .all(order.id) as any[];

          for (const item of items) {
            db.prepare(`
              UPDATE products
              SET reserved_quantity = MAX(0, reserved_quantity - ?)
              WHERE id = ?
            `).run(item.quantity, item.product_id);
          }

          db.prepare(`
            UPDATE orders
            SET status = 'expired', stock_released = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(order.id);

          console.log(`[Expiry Worker] Reservation ${order.order_number} expired. Stock released.`);
        })();
      }
    } catch (err) {
      console.error('[Expiry Worker] Error processing expirations:', err);
    }
  }
}
