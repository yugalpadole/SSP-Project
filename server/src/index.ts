import express, { Request, Response } from 'express';
import cors from 'cors';
import db, { initDatabase } from './db';
import { runSeed } from './seed';
import { OrderService } from './services/orderService';

// Ensure tables exist
initDatabase();

// Auto-seed if database is empty so products and categories are always available
try {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as any;
  if (!catCount || catCount.count === 0) {
    console.log('[eBazaar Server] Database is empty. Auto-seeding initial data...');
    runSeed();
  }
} catch (e) {
  console.warn('[eBazaar Server] Auto-seed check error:', e);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Background worker to check expired reservations every 30 seconds
setInterval(() => {
  OrderService.processExpiredReservations();
}, 30000);

// ==========================================
// AUTHENTICATION & USERS
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, shopName, shopCategory, locality, address, whatsappNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    if (!['customer', 'shopkeeper'].includes(role)) {
      return res.status(400).json({ error: 'Role must be customer or shopkeeper.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const tx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO users (name, email, password, phone, role, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        name.trim(),
        cleanEmail,
        password,
        phone ? phone.trim() : null,
        role,
        `https://images.unsplash.com/photo-${role === 'shopkeeper' ? '1570295999919-56ceb5ecca61' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=200&q=80`
      );

      const userId = Number(result.lastInsertRowid);
      let shop = null;

      if (role === 'shopkeeper') {
        const generatedSlug = (shopName || `${name}'s Bazaar`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);

        const shopRes = db.prepare(`
          INSERT INTO shops (
            user_id, name, slug, description, category, address, locality,
            pincode, phone, whatsapp_number, opening_hours, logo_url, banner_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          userId,
          shopName || `${name}'s Store`,
          generatedSlug,
          'Your friendly neighborhood shop delivering fresh goods and honest service.',
          shopCategory || 'Groceries',
          address || 'Main Road, Market Complex',
          locality || 'Yevalewadi',
          '411048',
          phone || '+919876543210',
          whatsappNumber || phone || '+919876543210',
          '8:00 AM - 9:30 PM',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80'
        );

        shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopRes.lastInsertRowid);
      }

      const user = db.prepare('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?').get(userId) as any;
      return { user, shop };
    });

    const data = tx();
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login (Supports login by Email OR Phone number)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const identifier = (email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required.' });
    }

    const cleanEmail = identifier.toLowerCase();
    const cleanPhoneDigits = identifier.replace(/[^0-9]/g, '');

    // Match strictly by email OR registered phone number
    const user = db.prepare(`
      SELECT id, name, email, password, phone, role, avatar_url, created_at
      FROM users
      WHERE email = ?
         OR phone = ?
         OR (phone IS NOT NULL AND REPLACE(REPLACE(phone, '+91', ''), ' ', '') = ?)
    `).get(cleanEmail, identifier, cleanPhoneDigits.length >= 7 ? cleanPhoneDigits : identifier) as any;

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email/phone and password.' });
    }

    // Role enforcement: Customer cannot sign into Shopkeeper portal and vice versa
    if (role && user.role !== role) {
      const activeRoleName = role === 'shopkeeper' ? 'Shopkeeper' : 'Customer';
      const actualRoleName = user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer';
      return res.status(403).json({
        error: `This account is registered as a ${actualRoleName}. You cannot sign in to the ${activeRoleName} portal with these credentials. Please switch to the ${actualRoleName} tab.`,
        roleMismatch: true,
        actualRole: user.role,
        expectedRole: role,
      });
    }

    let shop = null;
    if (user.role === 'shopkeeper') {
      shop = db.prepare('SELECT * FROM shops WHERE user_id = ?').get(user.id);
      if (!shop) {
        const slug = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-store-${user.id}`;
        const shopRes = db.prepare(`
          INSERT INTO shops (
            user_id, name, slug, description, category, address, locality,
            pincode, phone, whatsapp_number, opening_hours, logo_url, banner_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          user.id,
          `${user.name}'s Store`,
          slug,
          'Your friendly neighborhood shop delivering fresh goods and honest service.',
          'Groceries',
          'Main Road, Market Complex',
          'Yevalewadi',
          '411048',
          user.phone || '+919876543210',
          user.phone || '+919876543210',
          '8:00 AM - 9:30 PM',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80'
        );
        shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopRes.lastInsertRowid);
      }
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Password Recovery
app.post('/api/auth/recover', (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email.' });
    }

    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(newPassword, email.toLowerCase().trim());
    return res.json({ message: 'Password reset successfully. You may now log in.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get Current User Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = db.prepare('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let shop = null;
    if (user.role === 'shopkeeper') {
      shop = db.prepare('SELECT * FROM shops WHERE user_id = ?').get(user.id);
      if (!shop) {
        const slug = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-store-${user.id}`;
        const shopRes = db.prepare(`
          INSERT INTO shops (
            user_id, name, slug, description, category, address, locality,
            pincode, phone, whatsapp_number, opening_hours, logo_url, banner_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          user.id,
          `${user.name}'s Store`,
          slug,
          'Your friendly neighborhood shop delivering fresh goods and honest service.',
          'Groceries',
          'Main Road, Market Complex',
          'Yevalewadi',
          '411048',
          user.phone || '+919876543210',
          user.phone || '+919876543210',
          '8:00 AM - 9:30 PM',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80'
        );
        shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopRes.lastInsertRowid);
      }
    }

    return res.json({ user, shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update Profile
app.put('/api/auth/profile', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?')
      .run(name, phone, userId);

    const updated = db.prepare('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?').get(userId);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CATEGORIES & DISCOVERY
// ==========================================

app.get('/api/categories', (_req: Request, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all();
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/:slug', (req: Request, res: Response) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug) as any;
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const products = db.prepare(`
      SELECT p.*, s.name as shop_name, s.locality as shop_locality, s.slug as shop_slug,
             (p.stock_quantity - p.reserved_quantity) as available_stock
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      WHERE p.category_id = ? AND p.is_active = 1
    `).all(category.id);

    const shops = db.prepare(`
      SELECT DISTINCT s.*
      FROM shops s
      JOIN products p ON p.shop_id = s.id
      WHERE p.category_id = ?
    `).all(category.id);

    return res.json({ category, products, shops });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SHOPS (CUSTOMER)
// ==========================================

app.get('/api/shops', (req: Request, res: Response) => {
  try {
    const { search, category, locality } = req.query;
    let query = 'SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id AND p.is_active = 1) as product_count FROM shops s WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (s.name LIKE ? OR s.description LIKE ? OR s.locality LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND s.category = ?';
      params.push(category);
    }

    if (locality) {
      query += ' AND (s.locality LIKE ? OR s.serviceable_areas LIKE ?)';
      params.push(`%${locality}%`, `%${locality}%`);
    }

    query += ' ORDER BY s.rating DESC, s.name ASC';
    let shops = db.prepare(query).all(...params);
    // If no shops in specific locality, fallback to all shops so discovery remains active
    if (shops.length === 0 && locality) {
      shops = db.prepare('SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id AND p.is_active = 1) as product_count FROM shops s ORDER BY s.rating DESC').all();
    }
    return res.json(shops);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/shops/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shop = db.prepare('SELECT * FROM shops WHERE id = ? OR slug = ?').get(id, id) as any;
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }

    const products = db.prepare(`
      SELECT p.*, c.name as category_name,
             (p.stock_quantity - p.reserved_quantity) as available_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.shop_id = ? AND p.is_active = 1
      ORDER BY p.id ASC
    `).all(shop.id);

    const reviews = db.prepare(`
      SELECT r.*
      FROM reviews r
      WHERE r.shop_id = ?
      ORDER BY r.created_at DESC
      LIMIT 20
    `).all(shop.id);

    return res.json({ shop, products, reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PRODUCTS & PRICE COMPARISON (CUSTOMER)
// ==========================================

app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { search, category, locality, minPrice, maxPrice, inStock, shopId } = req.query;

    let query = `
      SELECT p.*, s.name as shop_name, s.locality as shop_locality, s.slug as shop_slug,
             s.is_delivery_enabled, s.rating as shop_rating, c.name as category_name,
             (p.stock_quantity - p.reserved_quantity) as available_stock,
             (SELECT COUNT(*) FROM products p2 WHERE LOWER(TRIM(p2.name)) = LOWER(TRIM(p.name)) AND p2.is_active = 1) as shop_count,
             (SELECT MIN(p2.price) FROM products p2 WHERE LOWER(TRIM(p2.name)) = LOWER(TRIM(p.name)) AND p2.is_active = 1) as lowest_market_price
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND (c.slug = ? OR c.name = ?)';
      params.push(category, category);
    }

    if (locality) {
      query += ' AND (s.locality LIKE ? OR s.serviceable_areas LIKE ?)';
      params.push(`%${locality}%`, `%${locality}%`);
    }

    if (shopId) {
      query += ' AND p.shop_id = ?';
      params.push(shopId);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(Number(maxPrice));
    }

    if (inStock === 'true' || inStock === '1') {
      query += ' AND (p.stock_quantity - p.reserved_quantity) > 0';
    }

    query += ' ORDER BY p.id DESC';
    let products = db.prepare(query).all(...params);
    if (products.length === 0 && locality && !search && !category && !shopId) {
      // Fallback to active catalog so user has items to explore
      products = db.prepare(`
        SELECT p.*, s.name as shop_name, s.locality as shop_locality, s.slug as shop_slug,
               s.is_delivery_enabled, s.rating as shop_rating, c.name as category_name,
               (p.stock_quantity - p.reserved_quantity) as available_stock,
               (SELECT COUNT(*) FROM products p2 WHERE LOWER(TRIM(p2.name)) = LOWER(TRIM(p.name)) AND p2.is_active = 1) as shop_count,
               (SELECT MIN(p2.price) FROM products p2 WHERE LOWER(TRIM(p2.name)) = LOWER(TRIM(p.name)) AND p2.is_active = 1) as lowest_market_price
        FROM products p
        JOIN shops s ON s.id = p.shop_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_active = 1
        ORDER BY p.id DESC
      `).all();
    }
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Single Product Details + Compare Other Shops
app.get('/api/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.prepare(`
      SELECT p.*, s.name as shop_name, s.locality as shop_locality, s.address as shop_address,
             s.slug as shop_slug, s.whatsapp_number as shop_whatsapp, s.is_delivery_enabled,
             s.delivery_charge, s.estimated_delivery_time, s.rating as shop_rating, s.review_count as shop_review_count,
             c.name as category_name,
             (p.stock_quantity - p.reserved_quantity) as available_stock
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
    `).get(req.params.id) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Find all sellers selling identical product
    const exactMatches = db.prepare(`
      SELECT p.id as product_id, p.price, p.mrp, p.unit, p.name as product_name, p.image_url,
             p.stock_quantity, p.reserved_quantity, (p.stock_quantity - p.reserved_quantity) as available_stock,
             s.id as shop_id, s.name as shop_name, s.locality as shop_locality, s.address as shop_address,
             s.rating as shop_rating, s.review_count as shop_review_count,
             s.delivery_charge, s.estimated_delivery_time, s.min_order_amount,
             s.is_delivery_enabled, s.slug as shop_slug
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(?)) AND p.is_active = 1
      ORDER BY p.price ASC
    `).all(product.name) as any[];

    // Fallback if only 1 seller found, look for similar items in same category
    let comparisonList = exactMatches;
    let isBroadComparison = false;
    if (comparisonList.length <= 1) {
      const broadMatches = db.prepare(`
        SELECT p.id as product_id, p.price, p.mrp, p.unit, p.name as product_name, p.image_url,
               p.stock_quantity, p.reserved_quantity, (p.stock_quantity - p.reserved_quantity) as available_stock,
               s.id as shop_id, s.name as shop_name, s.locality as shop_locality, s.address as shop_address,
               s.rating as shop_rating, s.review_count as shop_review_count,
               s.delivery_charge, s.estimated_delivery_time, s.min_order_amount,
               s.is_delivery_enabled, s.slug as shop_slug
        FROM products p
        JOIN shops s ON s.id = p.shop_id
        WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
        ORDER BY p.price ASC
        LIMIT 6
      `).all(product.category_id, product.id) as any[];

      if (broadMatches.length > 0) {
        comparisonList = [...exactMatches, ...broadMatches];
        isBroadComparison = true;
      }
    }

    const prices = comparisonList.map(s => s.price);
    const lowestPrice = prices.length ? Math.min(...prices) : product.price;
    const highestPrice = prices.length ? Math.max(...prices) : product.price;
    const maxSavings = Math.max(0, highestPrice - lowestPrice);

    // Compute lowest total (price + delivery charge)
    const totalsWithDelivery = comparisonList.map(s => s.price + (s.delivery_charge || 0));
    const lowestTotal = totalsWithDelivery.length ? Math.min(...totalsWithDelivery) : (product.price + (product.delivery_charge || 0));

    const allSellers = comparisonList.map(s => {
      const isCurrent = s.product_id === product.id;
      const isLowestPrice = s.price === lowestPrice;
      const totalWithDelivery = s.price + (s.delivery_charge || 0);
      const isLowestTotal = totalWithDelivery === lowestTotal;
      const savingsVsHighest = Math.max(0, highestPrice - s.price);
      return {
        ...s,
        isCurrent,
        isLowestPrice,
        isLowestTotal,
        totalWithDelivery,
        savingsVsHighest,
      };
    });

    const otherSellers = allSellers.filter(s => s.product_id !== product.id);

    const comparison = {
      isExactMatch: !isBroadComparison,
      totalSellers: allSellers.length,
      lowestPrice,
      highestPrice,
      maxSavings,
      lowestTotal,
      currentShopIsCheapest: product.price === lowestPrice,
      savingsIfSwitched: Math.max(0, product.price - lowestPrice),
      allSellers,
    };

    const reviews = db.prepare(`
      SELECT r.*
      FROM reviews r
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all(product.id);

    return res.json({ product, otherSellers, comparison, reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Compare prices for any product by ID or Name
app.get('/api/products/:id/compare', (req: Request, res: Response) => {
  try {
    const product = db.prepare(`
      SELECT p.*, s.name as shop_name, s.locality as shop_locality, s.delivery_charge
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      WHERE p.id = ?
    `).get(req.params.id) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const sellers = db.prepare(`
      SELECT p.id as product_id, p.price, p.mrp, p.unit, p.name as product_name, p.image_url,
             (p.stock_quantity - p.reserved_quantity) as available_stock,
             s.id as shop_id, s.name as shop_name, s.locality as shop_locality,
             s.rating as shop_rating, s.delivery_charge, s.estimated_delivery_time,
             s.is_delivery_enabled, s.slug as shop_slug
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(?)) AND p.is_active = 1
      ORDER BY p.price ASC
    `).all(product.name) as any[];

    const prices = sellers.map(s => s.price);
    const lowestPrice = prices.length ? Math.min(...prices) : product.price;
    const highestPrice = prices.length ? Math.max(...prices) : product.price;

    const allSellers = sellers.map(s => ({
      ...s,
      isCurrent: s.product_id === product.id,
      isLowestPrice: s.price === lowestPrice,
      totalWithDelivery: s.price + (s.delivery_charge || 0),
      savingsVsHighest: Math.max(0, highestPrice - s.price),
    }));

    return res.json({
      productName: product.name,
      currentProductId: product.id,
      lowestPrice,
      highestPrice,
      maxSavings: highestPrice - lowestPrice,
      sellers: allSellers,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ORDERS & RESERVATIONS (CUSTOMER)
// ==========================================

// Place Order / Reservation
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const result = OrderService.createOrder(req.body);
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to place order.' });
  }
});

// List Customer Orders
app.get('/api/orders/customer', (req: Request, res: Response) => {
  try {
    const customerId = req.headers['x-user-id'] || req.query.customerId;
    if (!customerId) {
      return res.status(401).json({ error: 'Customer ID required.' });
    }

    const orders = db.prepare(`
      SELECT o.*, s.name as shop_name, s.phone as shop_phone, s.whatsapp_number as shop_whatsapp,
             s.address as shop_address, s.locality as shop_locality,
             (SELECT COUNT(*) FROM reviews r WHERE r.order_id = o.id) as has_reviewed
      FROM orders o
      JOIN shops s ON s.id = o.shop_id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `).all(customerId) as any[];

    // Fetch items for each order
    const getItems = db.prepare(`
      SELECT oi.*, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `);

    const fullOrders = orders.map((ord) => ({
      ...ord,
      items: getItems.all(ord.id),
    }));

    return res.json(fullOrders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Cancel Order
app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, role } = req.body;
    const result = OrderService.cancelOrder(Number(id), role || 'customer', reason);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// REVIEWS
// ==========================================

app.get('/api/reviews/eligible', (req: Request, res: Response) => {
  try {
    const customerId = req.headers['x-user-id'] || req.query.customerId;
    if (!customerId) {
      return res.status(401).json({ error: 'Customer ID required.' });
    }

    // Eligible orders: status = 'completed', not reviewed yet
    const eligibleOrders = db.prepare(`
      SELECT o.id as order_id, o.order_number, o.shop_id, s.name as shop_name, o.created_at
      FROM orders o
      JOIN shops s ON s.id = o.shop_id
      WHERE o.customer_id = ? AND o.status = 'completed'
        AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.id)
      ORDER BY o.created_at DESC
    `).all(customerId);

    return res.json(eligibleOrders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { customerId, customerName, shopId, productId, orderId, rating, comment } = req.body;

    if (!customerId || !shopId || !orderId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required review fields.' });
    }

    // Validate that order is completed
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND customer_id = ?').get(orderId, customerId) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found for this customer.' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Reviews can only be submitted after order completion.' });
    }

    // Insert review and recalculate shop rating
    const tx = db.transaction(() => {
      const res = db.prepare(`
        INSERT INTO reviews (customer_id, customer_name, shop_id, product_id, order_id, rating, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(customerId, customerName || 'Verified Buyer', shopId, productId || null, orderId, rating, comment);

      // Update shop average rating and count
      const avg = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE shop_id = ?').get(shopId) as any;
      db.prepare('UPDATE shops SET rating = ROUND(?, 1), review_count = ? WHERE id = ?')
        .run(avg.avg_rating || 5.0, avg.count, shopId);

      return res.lastInsertRowid;
    });

    const reviewId = tx();
    return res.status(201).json({ success: true, reviewId });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'You have already submitted a review for this purchase.' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CUSTOMER ADDRESSES
// ==========================================

app.get('/api/users/addresses', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const addresses = db.prepare('SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(userId);
    return res.json(addresses);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/addresses', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { label, recipientName, phone, street, locality, city, pincode, isDefault } = req.body;

    if (!userId || !recipientName || !phone || !street || !locality || !city || !pincode) {
      return res.status(400).json({ error: 'All address fields are required.' });
    }

    const tx = db.transaction(() => {
      if (isDefault) {
        db.prepare('UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?').run(userId);
      }
      const res = db.prepare(`
        INSERT INTO customer_addresses (user_id, label, recipient_name, phone, street, locality, city, pincode, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, label || 'Home', recipientName, phone, street, locality, city, pincode, isDefault ? 1 : 0);
      return res.lastInsertRowid;
    });

    const addrId = tx();
    const created = db.prepare('SELECT * FROM customer_addresses WHERE id = ?').get(addrId);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/addresses/:id', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    db.prepare('DELETE FROM customer_addresses WHERE id = ? AND user_id = ?').run(req.params.id, userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SHOPKEEPER DASHBOARD & MANAGEMENT
// ==========================================

// Dashboard Metrics
app.get('/api/shopkeeper/dashboard', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    if (!shopId) {
      return res.status(401).json({ error: 'Shop ID required.' });
    }

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE shop_id = ? AND is_active = 1').get(shopId) as any;
    const stockStats = db.prepare(`
      SELECT SUM(stock_quantity - reserved_quantity) as available_stock,
             SUM(reserved_quantity) as total_reserved,
             COUNT(CASE WHEN (stock_quantity - reserved_quantity) <= 5 THEN 1 END) as low_stock_count
      FROM products WHERE shop_id = ? AND is_active = 1
    `).get(shopId) as any;

    const orderStats = db.prepare(`
      SELECT
        COUNT(CASE WHEN status = 'pending' AND order_type = 'reserve_collect' THEN 1 END) as new_reservations,
        COUNT(CASE WHEN status = 'pending' AND order_type = 'delivery' THEN 1 END) as pending_deliveries,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'ready_for_pickup' THEN 1 END) as ready_for_pickup_orders,
        COUNT(CASE WHEN status = 'out_for_delivery' THEN 1 END) as active_delivery_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue
      FROM orders WHERE shop_id = ?
    `).get(shopId) as any;

    const lowStockItems = db.prepare(`
      SELECT id, name, price, stock_quantity, reserved_quantity, (stock_quantity - reserved_quantity) as available_stock, image_url
      FROM products
      WHERE shop_id = ? AND is_active = 1 AND (stock_quantity - reserved_quantity) <= 5
      ORDER BY available_stock ASC
      LIMIT 6
    `).all(shopId);

    const products = db.prepare(`
      SELECT id, name, price, mrp, unit, stock_quantity, reserved_quantity, (stock_quantity - reserved_quantity) as available_stock, image_url
      FROM products
      WHERE shop_id = ? AND is_active = 1
      ORDER BY id DESC
      LIMIT 8
    `).all(shopId);

    const recentOrders = db.prepare(`
      SELECT o.*,
             COALESCE((SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id), 1) as item_count
      FROM orders o
      WHERE o.shop_id = ?
      ORDER BY o.created_at DESC
      LIMIT 8
    `).all(shopId);

    return res.json({
      totalProducts: totalProducts.count || 0,
      availableStock: stockStats.available_stock || 0,
      totalReserved: stockStats.total_reserved || 0,
      lowStockCount: stockStats.low_stock_count || 0,
      orders: orderStats,
      lowStockItems,
      products,
      recentOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Shop Profile
app.get('/api/shopkeeper/profile', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found.' });
    }
    return res.json(shop);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/shopkeeper/profile', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const {
      name, description, category, address, locality, pincode,
      phone, whatsappNumber, openingHours, logoUrl, bannerUrl
    } = req.body;

    db.prepare(`
      UPDATE shops SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        address = COALESCE(?, address),
        locality = COALESCE(?, locality),
        pincode = COALESCE(?, pincode),
        phone = COALESCE(?, phone),
        whatsapp_number = COALESCE(?, whatsapp_number),
        opening_hours = COALESCE(?, opening_hours),
        logo_url = COALESCE(?, logo_url),
        banner_url = COALESCE(?, banner_url)
      WHERE id = ?
    `).run(
      name, description, category, address, locality, pincode,
      phone, whatsappNumber, openingHours, logoUrl, bannerUrl, shopId
    );

    const updated = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Shopkeeper Products CRUD
app.get('/api/shopkeeper/products', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const { search, categoryId } = req.query;

    let query = `
      SELECT p.*, c.name as category_name,
             (p.stock_quantity - p.reserved_quantity) as available_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.shop_id = ? AND p.is_active = 1
    `;
    const params: any[] = [shopId];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY p.id DESC';
    const products = db.prepare(query).all(...params);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/shopkeeper/products', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const { name, categoryId, description, price, mrp, unit, imageUrl, stockQuantity } = req.body;

    if (!shopId || !name || !price) {
      return res.status(400).json({ error: 'Shop ID, product name, and price are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);

    const result = db.prepare(`
      INSERT INTO products (
        shop_id, category_id, name, slug, description, price, mrp, unit,
        image_url, stock_quantity, reserved_quantity, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
    `).run(
      shopId,
      categoryId || 1,
      name,
      slug,
      description || '',
      price,
      mrp || price,
      unit || '1 unit',
      imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
      stockQuantity || 10
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/shopkeeper/products/:id', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const { id } = req.params;
    const { name, categoryId, description, price, mrp, unit, imageUrl, stockQuantity } = req.body;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        mrp = COALESCE(?, mrp),
        unit = COALESCE(?, unit),
        image_url = COALESCE(?, image_url),
        stock_quantity = COALESCE(?, stock_quantity)
      WHERE id = ? AND shop_id = ?
    `).run(
      name, categoryId, description, price, mrp, unit, imageUrl, stockQuantity, id, shopId
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shopkeeper/products/:id', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const { id } = req.params;

    db.prepare('UPDATE products SET is_active = 0 WHERE id = ? AND shop_id = ?').run(id, shopId);
    return res.json({ success: true, message: 'Product removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Shopkeeper Inventory
app.get('/api/shopkeeper/inventory', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const inventory = db.prepare(`
      SELECT p.id, p.name, p.unit, p.price, p.stock_quantity, p.reserved_quantity,
             (p.stock_quantity - p.reserved_quantity) as available_stock,
             p.image_url, c.name as category_name,
             CASE
               WHEN (p.stock_quantity - p.reserved_quantity) <= 0 THEN 'out_of_stock'
               WHEN (p.stock_quantity - p.reserved_quantity) <= 5 THEN 'low_stock'
               ELSE 'in_stock'
             END as stock_status
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.shop_id = ? AND p.is_active = 1
      ORDER BY available_stock ASC
    `).all(shopId);

    return res.json(inventory);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/shopkeeper/inventory/:id', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const { id } = req.params;
    const { stockQuantity } = req.body;

    if (stockQuantity === undefined || stockQuantity < 0) {
      return res.status(400).json({ error: 'Valid stock quantity is required.' });
    }

    db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ? AND shop_id = ?')
      .run(stockQuantity, id, shopId);

    const updated = db.prepare(`
      SELECT id, name, stock_quantity, reserved_quantity, (stock_quantity - reserved_quantity) as available_stock
      FROM products WHERE id = ?
    `).get(id);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Shopkeeper Orders Management
app.get('/api/shopkeeper/orders', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const { status, type } = req.query;

    let query = 'SELECT o.* FROM orders o WHERE o.shop_id = ?';
    const params: any[] = [shopId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND o.order_type = ?';
      params.push(type);
    }

    query += ' ORDER BY o.created_at DESC';
    const orders = db.prepare(query).all(...params) as any[];

    const getItems = db.prepare(`
      SELECT oi.*, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `);

    const fullOrders = orders.map((ord) => ({
      ...ord,
      items: getItems.all(ord.id),
    }));

    return res.json(fullOrders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/shopkeeper/orders/:id/status', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const result = OrderService.updateOrderStatus(Number(id), status, Number(shopId));
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Delivery Settings
app.get('/api/shopkeeper/delivery-settings', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const settings = db.prepare(`
      SELECT is_delivery_enabled, delivery_charge, min_order_amount,
             estimated_delivery_time, serviceable_areas
      FROM shops WHERE id = ?
    `).get(shopId);

    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/shopkeeper/delivery-settings', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const {
      isDeliveryEnabled, deliveryCharge, minOrderAmount,
      estimatedDeliveryTime, serviceableAreas
    } = req.body;

    db.prepare(`
      UPDATE shops SET
        is_delivery_enabled = COALESCE(?, is_delivery_enabled),
        delivery_charge = COALESCE(?, delivery_charge),
        min_order_amount = COALESCE(?, min_order_amount),
        estimated_delivery_time = COALESCE(?, estimated_delivery_time),
        serviceable_areas = COALESCE(?, serviceable_areas)
      WHERE id = ?
    `).run(
      isDeliveryEnabled !== undefined ? (isDeliveryEnabled ? 1 : 0) : null,
      deliveryCharge,
      minOrderAmount,
      estimatedDeliveryTime,
      serviceableAreas,
      shopId
    );

    const updated = db.prepare(`
      SELECT is_delivery_enabled, delivery_charge, min_order_amount,
             estimated_delivery_time, serviceable_areas
      FROM shops WHERE id = ?
    `).get(shopId);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Reservation Settings
app.get('/api/shopkeeper/reservation-settings', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;
    const settings = db.prepare('SELECT reservation_expiry_minutes FROM shops WHERE id = ?').get(shopId);
    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/shopkeeper/reservation-settings', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.body.shopId;
    const { reservationExpiryMinutes } = req.body;

    if (!reservationExpiryMinutes || reservationExpiryMinutes < 15) {
      return res.status(400).json({ error: 'Reservation expiry must be at least 15 minutes.' });
    }

    db.prepare('UPDATE shops SET reservation_expiry_minutes = ? WHERE id = ?')
      .run(reservationExpiryMinutes, shopId);

    return res.json({ success: true, reservationExpiryMinutes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Sales & Analytics
app.get('/api/shopkeeper/sales', (req: Request, res: Response) => {
  try {
    const shopId = req.headers['x-shop-id'] || req.query.shopId;

    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_completed_orders,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        COUNT(CASE WHEN order_type = 'delivery' THEN 1 END) as delivery_orders_count,
        COUNT(CASE WHEN order_type = 'reserve_collect' THEN 1 END) as pickup_orders_count
      FROM orders
      WHERE shop_id = ? AND status = 'completed'
    `).get(shopId) as any;

    const popularProducts = db.prepare(`
      SELECT oi.product_id, oi.product_name, oi.unit,
             SUM(oi.quantity) as total_quantity_sold,
             SUM(oi.total_price) as total_revenue,
             p.image_url
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.shop_id = ? AND o.status = 'completed'
      GROUP BY oi.product_id
      ORDER BY total_quantity_sold DESC
      LIMIT 8
    `).all(shopId);

    const completedOrdersList = db.prepare(`
      SELECT o.*, (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      WHERE o.shop_id = ? AND o.status = 'completed'
      ORDER BY o.updated_at DESC
      LIMIT 20
    `).all(shopId);

    return res.json({
      summary,
      popularProducts,
      completedOrders: completedOrdersList,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DATABASE-BACKED CART ENDPOINTS (NO LOCALSTORAGE)
// ==========================================

// Get user cart from database
app.get('/api/cart', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.json([]);
    }

    const items = db.prepare(`
      SELECT ci.id as cart_item_id, ci.quantity, ci.shop_id,
             p.id, p.name, p.slug, p.description, p.price, p.mrp, p.unit, p.image_url,
             p.stock_quantity, p.reserved_quantity, (p.stock_quantity - p.reserved_quantity) as available_stock,
             s.name as shop_name, s.locality as shop_locality
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN shops s ON s.id = ci.shop_id
      WHERE ci.user_id = ? AND p.is_active = 1
      ORDER BY ci.id ASC
    `).all(userId) as any[];

    const formatted = items.map((it) => ({
      product: {
        id: it.id,
        shop_id: it.shop_id,
        name: it.name,
        slug: it.slug,
        description: it.description,
        price: it.price,
        mrp: it.mrp,
        unit: it.unit,
        image_url: it.image_url,
        stock_quantity: it.stock_quantity,
        available_stock: it.available_stock,
        shop_name: it.shop_name,
        shop_locality: it.shop_locality,
      },
      quantity: it.quantity,
      shopId: it.shop_id,
      shopName: it.shop_name,
    }));

    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Add or update cart item in database
app.post('/api/cart', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { productId, shopId, quantity } = req.body;

    if (!userId || !productId || !shopId) {
      return res.status(400).json({ error: 'User ID, product ID, and shop ID are required.' });
    }

    // Check single shop rule: If cart contains items from a different shop, clear or return conflict
    const existingShop = db.prepare('SELECT shop_id FROM cart_items WHERE user_id = ? LIMIT 1').get(userId) as any;
    if (existingShop && existingShop.shop_id !== shopId) {
      if (req.body.replaceCart) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
      } else {
        return res.status(409).json({ error: 'Cart contains items from another shop.' });
      }
    }

    db.prepare(`
      INSERT INTO cart_items (user_id, product_id, shop_id, quantity, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, product_id) DO UPDATE SET
        quantity = quantity + excluded.quantity,
        updated_at = CURRENT_TIMESTAMP
    `).run(userId, productId, shopId, quantity || 1);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update item quantity
app.put('/api/cart/:productId', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    } else {
      db.prepare(`
        UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND product_id = ?
      `).run(quantity, userId, productId);
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
app.delete('/api/cart/:productId', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const { productId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Clear entire cart
app.delete('/api/cart', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[E-Bazaar Server] Running on http://localhost:${PORT}`);
});
