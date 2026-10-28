-- ================================================================
-- eBazaar: Supabase PostgreSQL Database Schema & Seed Data
-- Run this script in your Supabase Dashboard:
-- 1. Click the ">_" icon (SQL Editor) on the left sidebar
-- 2. Click "+ New query"
-- 3. Paste this entire script and click "Run" (or Ctrl + Enter)
-- 4. Go back to "Table Editor" (the grid icon) to see all data!
-- ================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK(role IN ('customer', 'shopkeeper')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shops Table (Stores registered by Shopkeepers)
CREATE TABLE IF NOT EXISTS public.shops (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  rating NUMERIC(3, 1) DEFAULT 4.8,
  review_count INTEGER DEFAULT 0,
  is_delivery_enabled BOOLEAN DEFAULT TRUE,
  delivery_charge NUMERIC(10, 2) DEFAULT 25.0,
  min_order_amount NUMERIC(10, 2) DEFAULT 99.0,
  estimated_delivery_time TEXT DEFAULT '20-40 mins',
  serviceable_areas TEXT DEFAULT 'Yevalewadi, Khadakwasla, Wagholi, Uruli Kanchan',
  reservation_expiry_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  image_url TEXT
);

-- 5. Products Table (Catalog for each shop)
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  mrp NUMERIC(10, 2) NOT NULL,
  unit TEXT DEFAULT '1 unit',
  image_url TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 15,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  locality TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id BIGINT NOT NULL REFERENCES public.users(id),
  shop_id BIGINT NOT NULL REFERENCES public.shops(id),
  order_type TEXT NOT NULL CHECK(order_type IN ('delivery', 'reserve_collect')),
  status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled', 'expired')),
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_charge NUMERIC(10, 2) DEFAULT 0.0,
  total_amount NUMERIC(10, 2) NOT NULL,
  delivery_address TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_notes TEXT,
  reservation_expires_at TIMESTAMPTZ,
  stock_released BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  unit TEXT,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL
);

-- 9. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES public.users(id),
  customer_name TEXT NOT NULL,
  shop_id BIGINT NOT NULL REFERENCES public.shops(id),
  product_id BIGINT REFERENCES public.products(id),
  order_id BIGINT NOT NULL UNIQUE REFERENCES public.orders(id),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id BIGINT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 11. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);

-- ================================================================
-- 12. SEED STARTER DATA (Pune & Yevalewadi)
-- ================================================================

-- Categories
INSERT INTO public.categories (id, name, slug, icon, description, image_url) VALUES
(1, 'Groceries', 'groceries', 'ShoppingBag', 'Staples, flours, oils, pulses, spices, and breakfast pantry goods.', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'),
(2, 'Fruits & Vegetables', 'fruits-and-vegetables', 'Apple', 'Fresh farm produce, leafy greens, exotic fruits, and root vegetables.', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80'),
(3, 'Fashion', 'fashion', 'Shirt', 'Ethnic wear, handloom cottons, footwear, and stylish local apparel.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80'),
(4, 'Electronics', 'electronics', 'Smartphone', 'Cables, chargers, earphones, power banks, and tech accessories.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'),
(5, 'Stationery', 'stationery', 'BookOpen', 'Notebooks, gel pens, art materials, and office supply essentials.', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80'),
(6, 'Personal Care', 'personal-care', 'Heart', 'Ayurvedic soaps, herbal face washes, skincare, and grooming.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'),
(7, 'Home Essentials', 'home-essentials', 'Home', 'Kitchen storage, eco cleaning supplies, diffusers, and organizers.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, icon = EXCLUDED.icon;

-- Users (Demo accounts: password is 'password123')
INSERT INTO public.users (id, name, email, password, phone, role, avatar_url) VALUES
(1, 'Rahul Verma (Customer)', 'customer@ebazaar.in', 'password123', '+919876543201', 'customer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
(2, 'Ramesh Sharma (Merchant)', 'shopkeeper@ebazaar.in', 'password123', '+919876543210', 'shopkeeper', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'),
(3, 'Priya Kulkarni (Grocer)', 'priya@greengrocers.in', 'password123', '+919876543211', 'shopkeeper', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'),
(4, 'Suresh Patil (Electronics)', 'suresh@cityelectronics.in', 'password123', '+919876543212', 'shopkeeper', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')
ON CONFLICT (id) DO NOTHING;

-- Shops (In Pune, Yevalewadi, Khadakwasla, Wagholi)
INSERT INTO public.shops (id, user_id, name, slug, description, category, address, locality, pincode, phone, whatsapp_number, opening_hours, logo_url, banner_url, rating, review_count, is_delivery_enabled, delivery_charge, min_order_amount, estimated_delivery_time, serviceable_areas, reservation_expiry_minutes) VALUES
(1, 2, 'Sharma Fresh Veggies & Fruits', 'sharma-fresh-veggies-fruits', 'Neighborhood favorite for organic fruits, farm-picked greens, and fresh kitchen staples directly from local farmers.', 'Fruits & Vegetables', 'Shop No. 4, Kondhwa-Saswad Road, Near Gram Panchayat Office, Yevalewadi', 'Yevalewadi', '411048', '+919876543210', '+919876543210', '7:00 AM - 9:30 PM', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80', 4.9, 142, TRUE, 25.0, 99.0, '25-35 mins', 'Yevalewadi, Kondhwa Budruk, Undri, Pisoli, Saswad Rural', 60),
(2, 3, 'Green Grocers Supermarket', 'green-grocers-supermarket', 'One-stop daily essentials: premium pulses, farm grains, daily dairy, spices, and household needs with quick doorstep delivery.', 'Groceries', 'Sinhagad Road, Near Khadakwasla Dam Chowk, Khadakwasla', 'Khadakwasla', '411024', '+919876543211', '+919876543211', '8:00 AM - 10:00 PM', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1000&q=80', 4.8, 98, TRUE, 30.0, 149.0, '30-45 mins', 'Khadakwasla, Donje, Dhayari Gaon, Narhe, Kirkatwadi', 90),
(3, 4, 'City Electronics & Mobile Hub', 'city-electronics-mobile-hub', 'Genuine smartphone accessories, fast GaN chargers, premium cables, earbuds, and home gadget essentials.', 'Electronics', 'Bakori Road Phata, Wagholi Gaothan, Wagholi', 'Wagholi', '412207', '+919876543212', '+919876543212', '10:00 AM - 9:00 PM', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80', 4.7, 64, TRUE, 40.0, 199.0, '30-50 mins', 'Wagholi, Bakori, Kesnand, Lohegaon, Ubale Nagar', 120)
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (id, shop_id, category_id, name, slug, description, price, mrp, unit, image_url, stock_quantity, reserved_quantity, is_active) VALUES
(1, 1, 2, 'Farm Fresh Hybrid Tomatoes', 'farm-fresh-hybrid-tomatoes', 'Plump, pesticide-free hybrid red tomatoes sourced fresh from local rural farmers.', 32.0, 48.0, '1 kg', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 45, 0, TRUE),
(2, 1, 2, 'Himachal Royal Shimla Apples', 'himachal-royal-shimla-apples', 'Crisp, naturally sweet red apples handpicked from Shimla orchards.', 160.0, 195.0, '1 kg (4-5 pcs)', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', 20, 0, TRUE),
(3, 1, 2, 'Nashik Fresh Red Onions', 'nashik-fresh-red-onions', 'Firm, pungent kitchen staple onions from Maharashtra onion mandi.', 28.0, 38.0, '1 kg', 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80', 60, 0, TRUE),
(4, 2, 1, 'Organic Sharbati Whole Wheat Atta', 'organic-sharbati-whole-wheat-atta', '100% stone-ground MP Sharbati wheat flour with zero maida or adulterants.', 255.0, 290.0, '5 kg bag', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 24, 0, TRUE),
(5, 2, 1, 'Organic Unpolished Toor Dal', 'organic-unpolished-toor-dal', 'Protein-rich, unpolished yellow pigeon peas. Naturally sun-dried.', 168.0, 195.0, '1 kg', 'https://images.unsplash.com/photo-1585996846529-650275815610?auto=format&fit=crop&w=600&q=80', 30, 0, TRUE),
(6, 2, 1, 'A2 Pure Bilona Desi Cow Ghee', 'a2-pure-bilona-desi-cow-ghee', 'Traditional bilona churned A2 cow milk ghee with rich aroma and golden granular texture.', 820.0, 950.0, '500 ml jar', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80', 12, 0, TRUE),
(7, 3, 4, 'Braided 100W Fast Charging Cable', 'braided-100w-fast-charging-cable', 'Heavy-duty nylon braided Type-C to Type-C cable with E-marker chip.', 299.0, 499.0, '1 pc (1.5m)', 'https://images.unsplash.com/photo-1608248597359-59749fb8c130?auto=format&fit=crop&w=600&q=80', 40, 0, TRUE),
(8, 3, 4, '65W GaN Dual Port Fast Charger', '65w-gan-dual-port-fast-charger', 'Ultra-compact GaN fast charger with USB-C and USB-A outputs.', 1249.0, 1799.0, '1 pc', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80', 15, 0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Customer Addresses
INSERT INTO public.customer_addresses (id, user_id, label, recipient_name, phone, street, locality, city, pincode, is_default) VALUES
(1, 1, 'Home', 'Rahul Verma', '+919876543201', 'Flat 304, Green Palms Residency, Kondhwa-Saswad Road', 'Yevalewadi', 'Pune', '411048', TRUE),
(2, 1, 'Work', 'Rahul Verma', '+919876543201', 'Sinhagad Road, Near Khadakwasla Chowk', 'Khadakwasla', 'Pune', '411024', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Adjust sequence IDs so subsequent auto-increments work cleanly
SELECT setval('public.users_id_seq', (SELECT MAX(id) FROM public.users));
SELECT setval('public.shops_id_seq', (SELECT MAX(id) FROM public.shops));
SELECT setval('public.categories_id_seq', (SELECT MAX(id) FROM public.categories));
SELECT setval('public.products_id_seq', (SELECT MAX(id) FROM public.products));
SELECT setval('public.customer_addresses_id_seq', (SELECT MAX(id) FROM public.customer_addresses));
