import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  activeShopId: number | null;
  activeShopName: string | null;
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  // Conflict modal state
  conflictingItem: { product: Product; quantity: number } | null;
  resolveConflict: (replace: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [conflictingItem, setConflictingItem] = useState<{ product: Product; quantity: number } | null>(null);

  // Load cart from database whenever user is authenticated or changes
  const fetchDbCart = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/cart?userId=${user.id}`, {
        headers: { 'x-user-id': String(user.id) },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from database', e);
    }
  };

  useEffect(() => {
    fetchDbCart();
  }, [user?.id]);

  const activeShopId = items.length > 0 ? items[0].shopId : null;
  const activeShopName = items.length > 0 ? items[0].shopName : null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: Product, quantity = 1): boolean => {
    const shopId = product.shop_id;
    const shopName = product.shop_name || 'Local Shop';

    // Check single-shop rule
    if (items.length > 0 && activeShopId !== null && activeShopId !== shopId) {
      // Conflict! Ask user to switch or clear
      setConflictingItem({ product, quantity });
      return false;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        const maxAvail = product.available_stock !== undefined ? product.available_stock : product.stock_quantity;
        next[existingIndex].quantity = Math.min(newQty, maxAvail);
        return next;
      } else {
        return [...prev, { product, quantity, shopId, shopName }];
      }
    });

    // Sync to database
    if (user?.id) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
        body: JSON.stringify({ productId: product.id, shopId, quantity }),
      }).catch((e) => console.error('Failed to persist cart item to DB', e));
    }

    return true;
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxAvail = item.product.available_stock !== undefined ? item.product.available_stock : item.product.stock_quantity;
          return {
            ...item,
            quantity: Math.min(quantity, maxAvail),
          };
        }
        return item;
      })
    );

    // Sync to database
    if (user?.id) {
      fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
        body: JSON.stringify({ quantity }),
      }).catch((e) => console.error('Failed to update cart quantity in DB', e));
    }
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));

    // Sync to database
    if (user?.id) {
      fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': String(user.id) },
      }).catch((e) => console.error('Failed to remove cart item from DB', e));
    }
  };

  const clearCart = () => {
    setItems([]);

    // Sync to database
    if (user?.id) {
      fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'x-user-id': String(user.id) },
      }).catch((e) => console.error('Failed to clear cart in DB', e));
    }
  };

  const resolveConflict = (replace: boolean) => {
    if (replace && conflictingItem) {
      const { product, quantity } = conflictingItem;
      setItems([
        {
          product,
          quantity,
          shopId: product.shop_id,
          shopName: product.shop_name || 'Local Shop',
        },
      ]);

      if (user?.id) {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
          body: JSON.stringify({ productId: product.id, shopId: product.shop_id, quantity, replaceCart: true }),
        }).catch((e) => console.error('Failed to replace cart in DB', e));
      }
    }
    setConflictingItem(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        activeShopId,
        activeShopName,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        conflictingItem,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
