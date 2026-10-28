import db, { initDatabase } from './db';

export function runSeed() {
  initDatabase();

  console.log('[Seed] Seeding initial database data...');

  // Clear existing records to ensure fresh consistent data
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM customer_addresses;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM shops;
    DELETE FROM users;
  `);

  // 1. Seed Users (passwords are simple string for demo / easy login)
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, phone, role, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const customerUser = insertUser.run(
    'Rahul Verma',
    'customer@ebazaar.com',
    'password123',
    '+919876543201',
    'customer',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  );
  const customerId = customerUser.lastInsertRowid;

  const shopkeeperUser = insertUser.run(
    'Ramesh Sharma',
    'shopkeeper@ebazaar.com',
    'password123',
    '+919876543210',
    'shopkeeper',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeperId = shopkeeperUser.lastInsertRowid;

  const shopkeeper2 = insertUser.run(
    'Pooja Nair',
    'pooja@ebazaar.com',
    'password123',
    '+919876543211',
    'shopkeeper',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeper2Id = shopkeeper2.lastInsertRowid;

  const shopkeeper3 = insertUser.run(
    'Arjun Mehta',
    'arjun@ebazaar.com',
    'password123',
    '+919876543212',
    'shopkeeper',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeper3Id = shopkeeper3.lastInsertRowid;

  // 2. Seed Shops
  const insertShop = db.prepare(`
    INSERT INTO shops (
      user_id, name, slug, description, category, address, locality, pincode,
      phone, whatsapp_number, opening_hours, logo_url, banner_url, rating,
      review_count, is_delivery_enabled, delivery_charge, min_order_amount,
      estimated_delivery_time, serviceable_areas, reservation_expiry_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const shop1 = insertShop.run(
    shopkeeperId,
    'Sharma Fresh Veggies & Fruits',
    'sharma-fresh-veggies-fruits',
    'Neighborhood favorite for organic fruits, farm-picked greens, and fresh kitchen staples directly from local farmers.',
    'Fruits & Vegetables',
    'Shop No. 4, Kondhwa-Saswad Road, Near Gram Panchayat Office, Yevalewadi',
    'Yevalewadi',
    '411048',
    '+919876543210',
    '+919876543210',
    '7:00 AM - 9:30 PM',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80',
    4.9,
    142,
    1,
    25.0,
    99.0,
    '25-35 mins',
    'Yevalewadi, Kondhwa Budruk, Undri, Pisoli, Saswad Rural',
    60
  );
  const shop1Id = shop1.lastInsertRowid;

  const shop2 = insertShop.run(
    shopkeeper2Id,
    'Green Grocers Supermarket',
    'green-grocers-supermarket',
    'One-stop daily essentials: premium pulses, farm grains, daily dairy, spices, and household needs with quick doorstep delivery.',
    'Groceries',
    'Sinhagad Road, Near Khadakwasla Dam Chowk, Khadakwasla',
    'Khadakwasla',
    '411024',
    '+919876543211',
    '+919876543211',
    '8:00 AM - 10:00 PM',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1000&q=80',
    4.8,
    98,
    1,
    30.0,
    149.0,
    '30-45 mins',
    'Khadakwasla, Donje, Dhayari Gaon, Narhe, Kirkatwadi',
    90
  );
  const shop2Id = shop2.lastInsertRowid;

  const shop3 = insertShop.run(
    shopkeeper3Id,
    'City Electronics & Mobile Hub',
    'city-electronics-mobile-hub',
    'Genuine smartphone accessories, fast GaN chargers, premium cables, earbuds, and home gadget essentials.',
    'Electronics',
    'Bakori Road Phata, Wagholi Gaothan, Wagholi',
    'Wagholi',
    '412207',
    '+919876543212',
    '+919876543212',
    '10:00 AM - 9:00 PM',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80',
    4.7,
    64,
    1,
    40.0,
    199.0,
    '30-50 mins',
    'Wagholi, Bakori, Kesnand, Lohegaon, Ubale Nagar',
    120
  );
  const shop3Id = shop3.lastInsertRowid;

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Groceries',
      slug: 'groceries',
      icon: 'ShoppingBag',
      description: 'Staples, flours, oils, pulses, spices, and breakfast pantry goods.',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Fruits & Vegetables',
      slug: 'fruits-and-vegetables',
      icon: 'Apple',
      description: 'Fresh farm produce, leafy greens, exotic fruits, and root vegetables.',
      image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      icon: 'Shirt',
      description: 'Ethnic wear, handloom cottons, footwear, and stylish local apparel.',
      image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Electronics',
      slug: 'electronics',
      icon: 'Smartphone',
      description: 'Cables, chargers, earphones, power banks, and tech accessories.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Stationery',
      slug: 'stationery',
      icon: 'BookOpen',
      description: 'Notebooks, gel pens, art materials, and office supply essentials.',
      image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Personal Care',
      slug: 'personal-care',
      icon: 'Heart',
      description: 'Ayurvedic soaps, herbal face washes, skincare, and grooming.',
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Home Essentials',
      slug: 'home-essentials',
      icon: 'Home',
      description: 'Kitchen storage, eco cleaning supplies, diffusers, and organizers.',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, icon, description, image_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const categoryMap: Record<string, number> = {};
  for (const cat of categoriesData) {
    const res = insertCategory.run(cat.name, cat.slug, cat.icon, cat.description, cat.image_url);
    categoryMap[cat.slug] = Number(res.lastInsertRowid);
  }

  // 4. Seed Products
  const insertProduct = db.prepare(`
    INSERT INTO products (
      shop_id, category_id, name, slug, description, price, mrp, unit,
      image_url, stock_quantity, reserved_quantity, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  // Products for Shop 1 (Sharma Fresh)
  insertProduct.run(
    shop1Id,
    categoryMap['fruits-and-vegetables'],
    'Farm Fresh Hybrid Tomatoes',
    'farm-fresh-hybrid-tomatoes',
    'Juicy, vine-ripened local tomatoes rich in lycopene. Perfect for curries, salads, and gravies.',
    32.0,
    45.0,
    '1 kg',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    45,
    3
  );

  insertProduct.run(
    shop1Id,
    categoryMap['fruits-and-vegetables'],
    'Organic Mysore Bananas (Yellaki)',
    'organic-mysore-bananas-yellaki',
    'Sweet and naturally ripened small Yellaki bananas. High potassium natural energy booster.',
    65.0,
    80.0,
    '1 kg (~12 pcs)',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
    30,
    0
  );

  insertProduct.run(
    shop1Id,
    categoryMap['fruits-and-vegetables'],
    'Fresh Crisp Green Spinach (Palak)',
    'fresh-crisp-green-spinach-palak',
    'Hydroponically grown pesticide-free spinach bunch. Crisp, clean, ready to cook.',
    28.0,
    35.0,
    '1 bunch (250g)',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
    25,
    2
  );

  insertProduct.run(
    shop1Id,
    categoryMap['fruits-and-vegetables'],
    'Himachal Royal Shimla Apples',
    'himachal-royal-shimla-apples',
    'Crunchy, sweet, and hand-selected crisp Shimla red apples.',
    160.0,
    195.0,
    '1 kg (4-5 pcs)',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
    20,
    1
  );

  insertProduct.run(
    shop1Id,
    categoryMap['groceries'],
    'Organic Sharbati Whole Wheat Atta',
    'organic-sharbati-whole-wheat-atta',
    'Stone-ground 100% whole wheat flour for fluffy and soft rotis.',
    260.0,
    290.0,
    '5 kg',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    18,
    0
  );

  // Products for Shop 2 (Green Grocers Supermarket) - Overlapping for price comparison!
  insertProduct.run(
    shop2Id,
    categoryMap['fruits-and-vegetables'],
    'Farm Fresh Hybrid Tomatoes',
    'farm-fresh-hybrid-tomatoes-indiranagar',
    'Fresh local red tomatoes sorted and cleaned. Daily morning arrival.',
    35.0, // Comparing with 32.0 in Shop 1!
    45.0,
    '1 kg',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    60,
    5
  );

  insertProduct.run(
    shop2Id,
    categoryMap['groceries'],
    'Organic Sharbati Whole Wheat Atta',
    'organic-sharbati-whole-wheat-atta-gg',
    'Stone-ground 100% whole wheat flour for fluffy and soft rotis.',
    255.0, // Comparing with 260.0 in Shop 1!
    290.0,
    '5 kg',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    24,
    1
  );

  insertProduct.run(
    shop2Id,
    categoryMap['groceries'],
    'Royal Daawat Rozana Basmati Rice',
    'royal-daawat-rozana-basmati-rice',
    'Aromatic long-grain basmati rice, aged for perfection in biryanis and pulao.',
    380.0,
    440.0,
    '5 kg',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    15,
    0
  );

  insertProduct.run(
    shop2Id,
    categoryMap['personal-care'],
    'Khadi Naturals Neem & Tea Tree Face Wash',
    'khadi-naturals-neem-face-wash',
    'Herbal anti-acne purifying cleanser free from sulfates and parabens.',
    175.0,
    220.0,
    '210 ml',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
    22,
    0
  );

  insertProduct.run(
    shop2Id,
    categoryMap['home-essentials'],
    'Eco-Friendly Bamboo Kitchen Towel Roll',
    'eco-friendly-bamboo-kitchen-towel',
    'Super absorbent, reusable, biodegradable organic bamboo fiber wipes.',
    145.0,
    180.0,
    'Pack of 2',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
    35,
    1
  );

  // Products for Shop 3 (City Electronics)
  insertProduct.run(
    shop3Id,
    categoryMap['electronics'],
    '65W GaN Fast Charger Dual Port (Type-C + USB)',
    '65w-gan-fast-charger-dual-port',
    'Ultra-compact GaN fast charger compatible with laptops, iPhones, and Android phones.',
    899.0,
    1499.0,
    '1 unit',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80',
    16,
    2
  );

  insertProduct.run(
    shop3Id,
    categoryMap['electronics'],
    'Braided 100W Fast Charging Type-C to Type-C Cable',
    'braided-100w-fast-charging-cable',
    'Tangle-free military-grade nylon braided 1.8m cable with high speed data transfer.',
    299.0,
    499.0,
    '1.8 meters',
    'https://images.unsplash.com/photo-1608248597359-59749fb8c130?auto=format&fit=crop&w=500&q=80',
    40,
    0
  );

  insertProduct.run(
    shop3Id,
    categoryMap['electronics'],
    'True Wireless Earbuds with ANC & Low Latency',
    'true-wireless-earbuds-anc',
    'Clear calling ENC mics, 32-hour playback battery, deep bass and sweat resistance.',
    1249.0,
    2199.0,
    '1 pair',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
    12,
    1
  );

  // 5. Seed Customer Address
  const insertAddr = db.prepare(`
    INSERT INTO customer_addresses (
      user_id, label, recipient_name, phone, street, locality, city, pincode, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAddr.run(
    customerId,
    'Home',
    'Rahul Verma',
    '+919876543201',
    'Flat 304, Green Palms Residency, Kondhwa-Saswad Road',
    'Yevalewadi',
    'Pune',
    '411048',
    1
  );

  insertAddr.run(
    customerId,
    'Work',
    'Rahul Verma',
    '+919876543201',
    'Sinhagad Road, Near Khadakwasla Chowk',
    'Khadakwasla',
    'Pune',
    '411024',
    0
  );

  // 6. Seed Sample Orders (one completed so customer can test reviews, one active reservation)
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_number, customer_id, shop_id, order_type, status,
      subtotal, delivery_charge, total_amount, delivery_address,
      customer_name, customer_phone, customer_notes, reservation_expires_at,
      stock_released, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), datetime('now', '-2 days'))
  `);

  const pastOrderRes = insertOrder.run(
    'EBZ-20261024-8192',
    customerId,
    shop1Id,
    'delivery',
    'completed',
    122.0,
    25.0,
    147.0,
    'Flat 304, Green Palms Residency, Kondhwa-Saswad Road, Yevalewadi, Pune - 411048',
    'Rahul Verma',
    '+919876543201',
    'Please ring the doorbell twice.',
    null,
    1
  );
  const pastOrderId = pastOrderRes.lastInsertRowid;

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, unit, price, quantity, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrderItem.run(pastOrderId, 1, 'Farm Fresh Hybrid Tomatoes', '1 kg', 32.0, 2, 64.0);
  insertOrderItem.run(pastOrderId, 3, 'Fresh Crisp Green Spinach (Palak)', '1 bunch (250g)', 28.0, 2, 56.0);

  // Seed sample review for past order
  db.prepare(`
    INSERT INTO reviews (customer_id, customer_name, shop_id, product_id, order_id, rating, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    customerId,
    'Rahul Verma',
    shop1Id,
    1,
    pastOrderId,
    5,
    'Super crisp and farm-fresh tomatoes! Delivered within 25 minutes in neat paper bags.'
  );

  // Active reservation order to showcase reserve & collect expiry countdown!
  const expiryTime = new Date(Date.now() + 45 * 60 * 1000).toISOString();
  const activeReservationRes = db.prepare(`
    INSERT INTO orders (
      order_number, customer_id, shop_id, order_type, status,
      subtotal, delivery_charge, total_amount, delivery_address,
      customer_name, customer_phone, customer_notes, reservation_expires_at,
      stock_released
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    'EBZ-20261026-4421',
    customerId,
    shop1Id,
    'reserve_collect',
    'ready_for_pickup',
    160.0,
    0.0,
    160.0,
    null,
    'Rahul Verma',
    '+919876543201',
    'Will pick up on my evening jog.',
    expiryTime
  );
  const activeReservationId = activeReservationRes.lastInsertRowid;

  insertOrderItem.run(activeReservationId, 4, 'Himachal Royal Shimla Apples', '1 kg (4-5 pcs)', 160.0, 1, 160.0);

  console.log('[Seed] Database successfully populated with initial realistic shops, products, categories & demo accounts!');
}

if (require.main === module) {
  runSeed();
}
