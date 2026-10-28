import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ebazaar.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('customer', 'shopkeeper')),
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      address TEXT NOT NULL,
      locality TEXT NOT NULL,
      pincode TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      opening_hours TEXT DEFAULT '8:00 AM - 9:30 PM',
      logo_url TEXT,
      banner_url TEXT,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 0,
      is_delivery_enabled INTEGER DEFAULT 1,
      delivery_charge REAL DEFAULT 25.0,
      min_order_amount REAL DEFAULT 99.0,
      estimated_delivery_time TEXT DEFAULT '20-40 mins',
      serviceable_areas TEXT DEFAULT 'Yevalewadi, Khadakwasla, Wagholi, Uruli Kanchan',
      reservation_expiry_minutes INTEGER DEFAULT 60,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      description TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      mrp REAL NOT NULL,
      unit TEXT DEFAULT '1 unit',
      image_url TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 15,
      reserved_quantity INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT DEFAULT 'Home',
      recipient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street TEXT NOT NULL,
      locality TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL REFERENCES users(id),
      shop_id INTEGER NOT NULL REFERENCES shops(id),
      order_type TEXT NOT NULL CHECK(order_type IN ('delivery', 'reserve_collect')),
      status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled', 'expired')),
      subtotal REAL NOT NULL,
      delivery_charge REAL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      delivery_address TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_notes TEXT,
      reservation_expires_at DATETIME,
      stock_released INTEGER DEFAULT 0,
      cancellation_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES users(id),
      customer_name TEXT NOT NULL,
      shop_id INTEGER NOT NULL REFERENCES shops(id),
      product_id INTEGER REFERENCES products(id),
      order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    -- Indices for quick querying
    CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
  `);
}

export default db;
