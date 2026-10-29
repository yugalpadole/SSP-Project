import db, { initDatabase } from './db';

export function runSeed() {
  initDatabase();

  console.log('[Seed] Seeding rich database data with multi-shop price comparison...');

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
    'Manoj Kulkarni',
    'manoj@ebazaar.com',
    'password123',
    '+919876543213',
    'shopkeeper',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeper3Id = shopkeeper3.lastInsertRowid;

  const shopkeeper4 = insertUser.run(
    'Sunita Patil',
    'sunita@ebazaar.com',
    'password123',
    '+919876543214',
    'shopkeeper',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeper4Id = shopkeeper4.lastInsertRowid;

  const shopkeeper5 = insertUser.run(
    'Arjun Mehta',
    'arjun@ebazaar.com',
    'password123',
    '+919876543212',
    'shopkeeper',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeper5Id = shopkeeper5.lastInsertRowid;

  const shopkeeper6 = insertUser.run(
    'Vikram Joshi',
    'vikram@ebazaar.com',
    'password123',
    '+919876543215',
    'shopkeeper',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
  );
  const shopkeeper6Id = shopkeeper6.lastInsertRowid;

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
    'Yevalewadi, Kondhwa Budruk, Undri, Pisoli, Saswad Rural, Khadakwasla, Pune',
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
    'Khadakwasla, Donje, Dhayari Gaon, Narhe, Kirkatwadi, Yevalewadi, Pune',
    90
  );
  const shop2Id = shop2.lastInsertRowid;

  const shop3 = insertShop.run(
    shopkeeper3Id,
    'Apna Kirana & Daily Mart',
    'apna-kirana-daily-mart',
    'Your trusted local store offering unbeatable wholesale prices on branded groceries, dairy, snacks, and home cleaning essentials.',
    'Groceries',
    'Undri-Pisoli Link Road, Near Bishop School Chowk, Undri & Pisoli',
    'Undri & Pisoli',
    '411060',
    '+919876543213',
    '+919876543213',
    '7:30 AM - 10:00 PM',
    'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1000&q=80',
    4.8,
    115,
    1,
    20.0,
    79.0,
    '20-30 mins',
    'Undri & Pisoli, Yevalewadi, Kondhwa Budruk, Saswad Rural, Pune',
    60
  );
  const shop3Id = shop3.lastInsertRowid;

  const shop4 = insertShop.run(
    shopkeeper4Id,
    'Khadakwasla Fresh Mart & Organics',
    'khadakwasla-fresh-mart-organics',
    'Pesticide-free organic vegetables, fresh dairy milk, farm butter, and indigenous regional fruits harvested daily at dawn.',
    'Fruits & Vegetables',
    'Main Bazaar Peth, Near Khadakwasla Bus Terminal, Khadakwasla',
    'Khadakwasla',
    '411024',
    '+919876543214',
    '+919876543214',
    '6:30 AM - 9:00 PM',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
    4.9,
    87,
    1,
    25.0,
    99.0,
    '25-35 mins',
    'Khadakwasla, Dhayari Gaon, Kirkatwadi, Narhe, Yevalewadi, Pune',
    60
  );
  const shop4Id = shop4.lastInsertRowid;

  const shop5 = insertShop.run(
    shopkeeper5Id,
    'City Electronics & Mobile Hub',
    'city-electronics-mobile-hub',
    'Genuine smartphone accessories, fast GaN chargers, premium cables, earbuds, and home gadget essentials.',
    'Electronics',
    'Bakori Road Phata, Wagholi Gaothan, Wagholi',
    'Wagholi',
    '412207',
    '+919876543212',
    '+919876543212',
    '10:00 AM - 9:30 PM',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80',
    4.7,
    68,
    1,
    40.0,
    199.0,
    '30-50 mins',
    'Wagholi, Bakori, Kesnand, Lohegaon, Ubale Nagar, Pune',
    120
  );
  const shop5Id = shop5.lastInsertRowid;

  const shop6 = insertShop.run(
    shopkeeper6Id,
    'Apex Gadgets & Tech Corner',
    'apex-gadgets-tech-corner',
    'Premium quality electronics accessories, high-speed PD cables, Bluetooth audio gear, and certified chargers at warehouse prices.',
    'Electronics',
    'Commercial Square, Katraj-Kondhwa Bypass, Yevalewadi',
    'Yevalewadi',
    '411048',
    '+919876543215',
    '+919876543215',
    '9:30 AM - 9:00 PM',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80',
    4.8,
    54,
    1,
    30.0,
    149.0,
    '20-35 mins',
    'Yevalewadi, Kondhwa, Undri, Khadakwasla, Pune',
    90
  );
  const shop6Id = shop6.lastInsertRowid;

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

  // Helper to slugify
  const makeSlug = (str: string, shopId: number) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-s${shopId}`;

  // Product definitions with cross-shop offerings
  const catalog = [
    // -------------------------------------------------------------
    // 1. Farm Fresh Hybrid Tomatoes
    // -------------------------------------------------------------
    {
      name: 'Farm Fresh Hybrid Tomatoes',
      cat: 'fruits-and-vegetables',
      desc: 'Juicy, vine-ripened local tomatoes rich in lycopene. Perfect for curries, salads, and gravies.',
      unit: '1 kg',
      img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
      mrp: 45.0,
      offers: [
        { shopId: shop1Id, price: 32.0, stock: 45, reserved: 3 }, // Sharma Fresh
        { shopId: shop2Id, price: 35.0, stock: 60, reserved: 5 }, // Green Grocers
        { shopId: shop4Id, price: 28.0, stock: 50, reserved: 2 }, // Khadakwasla Fresh (Best Deal!)
      ]
    },
    // -------------------------------------------------------------
    // 2. Organic Mysore Bananas (Yellaki)
    // -------------------------------------------------------------
    {
      name: 'Organic Mysore Bananas (Yellaki)',
      cat: 'fruits-and-vegetables',
      desc: 'Sweet and naturally ripened small Yellaki bananas. High potassium natural energy booster.',
      unit: '1 kg (~12 pcs)',
      img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
      mrp: 80.0,
      offers: [
        { shopId: shop1Id, price: 65.0, stock: 30, reserved: 0 }, // Best Deal!
        { shopId: shop2Id, price: 72.0, stock: 25, reserved: 1 },
        { shopId: shop4Id, price: 68.0, stock: 35, reserved: 2 },
      ]
    },
    // -------------------------------------------------------------
    // 3. Fresh Crisp Green Spinach (Palak)
    // -------------------------------------------------------------
    {
      name: 'Fresh Crisp Green Spinach (Palak)',
      cat: 'fruits-and-vegetables',
      desc: 'Hydroponically grown pesticide-free spinach bunch. Crisp, clean, ready to cook.',
      unit: '1 bunch (250g)',
      img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
      mrp: 35.0,
      offers: [
        { shopId: shop1Id, price: 28.0, stock: 25, reserved: 2 },
        { shopId: shop2Id, price: 30.0, stock: 20, reserved: 0 },
        { shopId: shop4Id, price: 24.0, stock: 40, reserved: 1 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 4. Himachal Royal Shimla Apples
    // -------------------------------------------------------------
    {
      name: 'Himachal Royal Shimla Apples',
      cat: 'fruits-and-vegetables',
      desc: 'Crunchy, sweet, and hand-selected crisp Shimla red apples packed with fiber.',
      unit: '1 kg (4-5 pcs)',
      img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
      mrp: 195.0,
      offers: [
        { shopId: shop1Id, price: 160.0, stock: 20, reserved: 1 },
        { shopId: shop2Id, price: 175.0, stock: 15, reserved: 0 },
        { shopId: shop4Id, price: 152.0, stock: 28, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 5. Fresh Alphonso Mangoes Ratnagiri Grade-A
    // -------------------------------------------------------------
    {
      name: 'Fresh Alphonso Mangoes Ratnagiri Grade-A',
      cat: 'fruits-and-vegetables',
      desc: 'World famous GI-tagged Ratnagiri Hapus mangoes. Naturally ripened, heavenly aroma, rich pulp.',
      unit: '1 Dozen (12 pcs)',
      img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80',
      mrp: 950.0,
      offers: [
        { shopId: shop1Id, price: 749.0, stock: 18, reserved: 1 }, // Best Deal!
        { shopId: shop2Id, price: 799.0, stock: 12, reserved: 0 },
        { shopId: shop4Id, price: 770.0, stock: 15, reserved: 2 },
      ]
    },
    // -------------------------------------------------------------
    // 6. Fresh Farm Green Peas (Matar)
    // -------------------------------------------------------------
    {
      name: 'Fresh Farm Green Peas (Matar)',
      cat: 'fruits-and-vegetables',
      desc: 'Sweet, tender pods filled with plump green peas. Harvested fresh from local farms.',
      unit: '1 kg',
      img: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=500&q=80',
      mrp: 75.0,
      offers: [
        { shopId: shop1Id, price: 58.0, stock: 30, reserved: 0 },
        { shopId: shop4Id, price: 52.0, stock: 35, reserved: 3 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 7. Organic Sharbati Whole Wheat Atta
    // -------------------------------------------------------------
    {
      name: 'Organic Sharbati Whole Wheat Atta',
      cat: 'groceries',
      desc: 'Stone-ground 100% whole wheat flour for fluffy and soft rotis with rich nutritional goodness.',
      unit: '5 kg',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
      mrp: 290.0,
      offers: [
        { shopId: shop1Id, price: 260.0, stock: 18, reserved: 0 },
        { shopId: shop2Id, price: 255.0, stock: 24, reserved: 1 },
        { shopId: shop3Id, price: 245.0, stock: 40, reserved: 3 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 8. Royal Daawat Rozana Basmati Rice
    // -------------------------------------------------------------
    {
      name: 'Royal Daawat Rozana Basmati Rice',
      cat: 'groceries',
      desc: 'Aromatic long-grain basmati rice, aged for perfection in daily meals, biryanis, and pulao.',
      unit: '5 kg',
      img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
      mrp: 440.0,
      offers: [
        { shopId: shop1Id, price: 395.0, stock: 14, reserved: 0 },
        { shopId: shop2Id, price: 380.0, stock: 20, reserved: 1 },
        { shopId: shop3Id, price: 365.0, stock: 32, reserved: 2 }, // Best Deal!
        { shopId: shop4Id, price: 375.0, stock: 18, reserved: 0 },
      ]
    },
    // -------------------------------------------------------------
    // 9. Tata Salt Vacuum Evaporated Iodised Salt
    // -------------------------------------------------------------
    {
      name: 'Tata Salt Vacuum Evaporated Iodised Salt',
      cat: 'groceries',
      desc: 'Desh Ka Namak. Pure, vacuum-evaporated iodised salt for balanced daily iodine intake.',
      unit: '1 kg',
      img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80',
      mrp: 28.0,
      offers: [
        { shopId: shop1Id, price: 28.0, stock: 50, reserved: 0 },
        { shopId: shop2Id, price: 26.0, stock: 45, reserved: 2 },
        { shopId: shop3Id, price: 24.0, stock: 65, reserved: 4 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 10. Fortune Sunlite Refined Sunflower Oil
    // -------------------------------------------------------------
    {
      name: 'Fortune Sunlite Refined Sunflower Oil',
      cat: 'groceries',
      desc: 'Light, healthy refined sunflower oil enriched with Vitamins A & D. Heart-friendly cooking.',
      unit: '1 L',
      img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
      mrp: 165.0,
      offers: [
        { shopId: shop1Id, price: 145.0, stock: 25, reserved: 1 },
        { shopId: shop2Id, price: 142.0, stock: 30, reserved: 0 },
        { shopId: shop3Id, price: 138.0, stock: 48, reserved: 3 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 11. Amul Taaza Homogenised Toned Milk
    // -------------------------------------------------------------
    {
      name: 'Amul Taaza Homogenised Toned Milk',
      cat: 'groceries',
      desc: 'Fresh, nutritious toned milk with minimum 3.0% milk fat and 8.5% milk SNF. Long life tetra pack.',
      unit: '1 L',
      img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
      mrp: 75.0,
      offers: [
        { shopId: shop1Id, price: 72.0, stock: 35, reserved: 2 },
        { shopId: shop2Id, price: 70.0, stock: 40, reserved: 1 },
        { shopId: shop3Id, price: 71.0, stock: 50, reserved: 0 },
        { shopId: shop4Id, price: 68.0, stock: 30, reserved: 3 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 12. Amul Salted Butter
    // -------------------------------------------------------------
    {
      name: 'Amul Salted Butter',
      cat: 'groceries',
      desc: 'Pure pasteurised butter made from fresh cream. Taste that makes breakfasts legendary.',
      unit: '500 g',
      img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80',
      mrp: 285.0,
      offers: [
        { shopId: shop1Id, price: 275.0, stock: 15, reserved: 0 },
        { shopId: shop2Id, price: 270.0, stock: 22, reserved: 1 },
        { shopId: shop3Id, price: 265.0, stock: 30, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 13. Fresh Malai Paneer
    // -------------------------------------------------------------
    {
      name: 'Fresh Malai Paneer',
      cat: 'groceries',
      desc: 'Soft, creamy traditional cottage cheese block. High protein essential for paneer tikka and curries.',
      unit: '200 g',
      img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
      mrp: 95.0,
      offers: [
        { shopId: shop1Id, price: 85.0, stock: 20, reserved: 1 },
        { shopId: shop2Id, price: 89.0, stock: 16, reserved: 0 },
        { shopId: shop4Id, price: 82.0, stock: 25, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 14. Maggi 2-Minute Masala Instant Noodles
    // -------------------------------------------------------------
    {
      name: 'Maggi 2-Minute Masala Instant Noodles',
      cat: 'groceries',
      desc: 'India\'s favorite instant noodles infused with roasted spices. Pack of 6 individual servings.',
      unit: 'Pack of 6 (420g)',
      img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80',
      mrp: 90.0,
      offers: [
        { shopId: shop1Id, price: 85.0, stock: 30, reserved: 0 },
        { shopId: shop2Id, price: 82.0, stock: 35, reserved: 2 },
        { shopId: shop3Id, price: 78.0, stock: 55, reserved: 4 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 15. Brooke Bond Red Label Natural Care Tea
    // -------------------------------------------------------------
    {
      name: 'Brooke Bond Red Label Natural Care Tea',
      cat: 'groceries',
      desc: 'Blend of CTC tea with 5 Ayurvedic ingredients: Tulsi, Ashwagandha, Mulethi, Ginger, and Cardamom.',
      unit: '500 g',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
      mrp: 280.0,
      offers: [
        { shopId: shop1Id, price: 260.0, stock: 15, reserved: 0 },
        { shopId: shop2Id, price: 255.0, stock: 20, reserved: 1 },
        { shopId: shop3Id, price: 242.0, stock: 30, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 16. Cadbury Dairy Milk Silk Chocolate Bar
    // -------------------------------------------------------------
    {
      name: 'Cadbury Dairy Milk Silk Chocolate Bar',
      cat: 'groceries',
      desc: 'Irresistibly smooth, melt-in-mouth milk chocolate crafted with rich cocoa and creamy milk.',
      unit: '150 g',
      img: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=500&q=80',
      mrp: 175.0,
      offers: [
        { shopId: shop1Id, price: 170.0, stock: 22, reserved: 0 },
        { shopId: shop2Id, price: 168.0, stock: 28, reserved: 1 },
        { shopId: shop3Id, price: 162.0, stock: 45, reserved: 3 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 17. Haldiram's Nagpur Aloo Bhujia
    // -------------------------------------------------------------
    {
      name: 'Haldiram\'s Nagpur Aloo Bhujia',
      cat: 'groceries',
      desc: 'Crispy spicy potato noodle snack flavored with mint and red chillies. Perfect tea-time snack.',
      unit: '400 g',
      img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80',
      mrp: 120.0,
      offers: [
        { shopId: shop2Id, price: 110.0, stock: 25, reserved: 0 },
        { shopId: shop3Id, price: 104.0, stock: 40, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 18. Dettol Original Germ Protection Liquid Handwash
    // -------------------------------------------------------------
    {
      name: 'Dettol Original Germ Protection Liquid Handwash',
      cat: 'personal-care',
      desc: 'Proven 99.9% germ protection with pine fragrance and added moisturizing agents.',
      unit: '200 ml',
      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
      mrp: 99.0,
      offers: [
        { shopId: shop2Id, price: 94.0, stock: 25, reserved: 1 },
        { shopId: shop3Id, price: 88.0, stock: 45, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 19. Khadi Naturals Neem & Tea Tree Face Wash
    // -------------------------------------------------------------
    {
      name: 'Khadi Naturals Neem & Tea Tree Face Wash',
      cat: 'personal-care',
      desc: 'Herbal anti-acne purifying cleanser free from sulfates and parabens. Refreshing daily glow.',
      unit: '210 ml',
      img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
      mrp: 220.0,
      offers: [
        { shopId: shop2Id, price: 175.0, stock: 22, reserved: 0 },
        { shopId: shop3Id, price: 165.0, stock: 30, reserved: 1 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 20. Colgate Total Complete Health Toothpaste
    // -------------------------------------------------------------
    {
      name: 'Colgate Total Complete Health Toothpaste',
      cat: 'personal-care',
      desc: 'Antibacterial formula providing 12-hour whole mouth protection against plaque and cavities.',
      unit: '150 g',
      img: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=500&q=80',
      mrp: 145.0,
      offers: [
        { shopId: shop2Id, price: 135.0, stock: 30, reserved: 1 },
        { shopId: shop3Id, price: 128.0, stock: 50, reserved: 3 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 21. Nivea Soft Light Moisturizing Cream
    // -------------------------------------------------------------
    {
      name: 'Nivea Soft Light Moisturizing Cream',
      cat: 'personal-care',
      desc: 'Non-greasy hydrating cream with Jojoba Oil and Vitamin E for instant refreshing softness.',
      unit: '200 ml',
      img: 'https://images.unsplash.com/photo-1608248597359-59749fb8c130?auto=format&fit=crop&w=500&q=80',
      mrp: 310.0,
      offers: [
        { shopId: shop2Id, price: 265.0, stock: 18, reserved: 0 },
        { shopId: shop3Id, price: 248.0, stock: 25, reserved: 1 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 22. Eco-Friendly Bamboo Kitchen Towel Roll
    // -------------------------------------------------------------
    {
      name: 'Eco-Friendly Bamboo Kitchen Towel Roll',
      cat: 'home-essentials',
      desc: 'Super absorbent, reusable, biodegradable organic bamboo fiber wipes. Washable up to 80 times.',
      unit: 'Pack of 2',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
      mrp: 180.0,
      offers: [
        { shopId: shop2Id, price: 145.0, stock: 35, reserved: 1 },
        { shopId: shop3Id, price: 138.0, stock: 42, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 23. Surf Excel Easy Wash Detergent Powder
    // -------------------------------------------------------------
    {
      name: 'Surf Excel Easy Wash Detergent Powder',
      cat: 'home-essentials',
      desc: 'Superior stain removal technology in 1 wash. Leaves clothes smelling fresh and ultra clean.',
      unit: '1 kg',
      img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80',
      mrp: 145.0,
      offers: [
        { shopId: shop2Id, price: 132.0, stock: 28, reserved: 1 },
        { shopId: shop3Id, price: 124.0, stock: 50, reserved: 4 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 24. Vim Dishwash Gel Lemon
    // -------------------------------------------------------------
    {
      name: 'Vim Dishwash Gel Lemon',
      cat: 'home-essentials',
      desc: 'With the power of 100 lemons. Cleans greasy utensils effortlessly without scratching.',
      unit: '500 ml',
      img: 'https://images.unsplash.com/photo-1585670270608-b404fb880c71?auto=format&fit=crop&w=500&q=80',
      mrp: 130.0,
      offers: [
        { shopId: shop2Id, price: 115.0, stock: 30, reserved: 2 },
        { shopId: shop3Id, price: 108.0, stock: 45, reserved: 1 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 25. 65W GaN Fast Charger Dual Port (Type-C + USB)
    // -------------------------------------------------------------
    {
      name: '65W GaN Fast Charger Dual Port (Type-C + USB)',
      cat: 'electronics',
      desc: 'Ultra-compact GaN fast charger compatible with MacBooks, iPhones, iPads, and Android phones.',
      unit: '1 unit',
      img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80',
      mrp: 1499.0,
      offers: [
        { shopId: shop5Id, price: 899.0, stock: 16, reserved: 2 },
        { shopId: shop6Id, price: 849.0, stock: 22, reserved: 1 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 26. Braided 100W Fast Charging Type-C to Type-C Cable
    // -------------------------------------------------------------
    {
      name: 'Braided 100W Fast Charging Type-C to Type-C Cable',
      cat: 'electronics',
      desc: 'Tangle-free military-grade nylon braided 1.8m cable with high speed data transfer and E-Marker chip.',
      unit: '1.8 meters',
      img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80',
      mrp: 499.0,
      offers: [
        { shopId: shop5Id, price: 299.0, stock: 40, reserved: 0 },
        { shopId: shop6Id, price: 269.0, stock: 35, reserved: 2 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 27. True Wireless Earbuds with ANC & Low Latency
    // -------------------------------------------------------------
    {
      name: 'True Wireless Earbuds with ANC & Low Latency',
      cat: 'electronics',
      desc: 'Clear calling quad ENC mics, 36-hour total playback, punchy bass, IPX5 sweat resistance.',
      unit: '1 pair',
      img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80',
      mrp: 2199.0,
      offers: [
        { shopId: shop5Id, price: 1249.0, stock: 12, reserved: 1 },
        { shopId: shop6Id, price: 1179.0, stock: 18, reserved: 0 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 28. boAt BassHeads 100 Wired Earphones with Mic
    // -------------------------------------------------------------
    {
      name: 'boAt BassHeads 100 Wired Earphones with Mic',
      cat: 'electronics',
      desc: 'Hawk-inspired design with 10mm dynamic drivers for super extra bass and in-line microphone.',
      unit: '1 unit',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
      mrp: 499.0,
      offers: [
        { shopId: shop5Id, price: 379.0, stock: 25, reserved: 1 },
        { shopId: shop6Id, price: 339.0, stock: 30, reserved: 0 }, // Best Deal!
      ]
    },
    // -------------------------------------------------------------
    // 29. Classmate Pulse Spiral Bound Notebook (Pack of 3)
    // -------------------------------------------------------------
    {
      name: 'Classmate Pulse Spiral Bound Notebook (Pack of 3)',
      cat: 'stationery',
      desc: 'High brightness ozone-treated paper, 300 pages each, stylish poly cover and single-line ruling.',
      unit: 'Pack of 3 (300 pgs)',
      img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=500&q=80',
      mrp: 210.0,
      offers: [
        { shopId: shop3Id, price: 175.0, stock: 35, reserved: 1 }, // Best Deal!
        { shopId: shop6Id, price: 190.0, stock: 20, reserved: 0 },
      ]
    },
    // -------------------------------------------------------------
    // 30. Handcrafted Pure Cotton Ethnic Kurta
    // -------------------------------------------------------------
    {
      name: 'Handcrafted Pure Cotton Ethnic Kurta',
      cat: 'fashion',
      desc: 'Breathable artisanal handloom cotton kurta with mandarin collar. Comfortable festive and casual wear.',
      unit: '1 piece (Size L)',
      img: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=500&q=80',
      mrp: 1299.0,
      offers: [
        { shopId: shop2Id, price: 699.0, stock: 12, reserved: 0 }, // Best Deal!
      ]
    },
  ];

  // Insert all products and multi-shop listings
  let totalInserted = 0;
  for (const item of catalog) {
    const catId = categoryMap[item.cat];
    if (!catId) continue;

    for (const offer of item.offers) {
      insertProduct.run(
        offer.shopId,
        catId,
        item.name,
        makeSlug(item.name, offer.shopId),
        item.desc,
        offer.price,
        item.mrp,
        item.unit,
        item.img,
        offer.stock,
        offer.reserved
      );
      totalInserted++;
    }
  }

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

  // 6. Seed Sample Orders
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

  const tomatoProd = db.prepare('SELECT id FROM products WHERE shop_id = ? AND name = ?').get(shop1Id, 'Farm Fresh Hybrid Tomatoes') as any;
  const spinachProd = db.prepare('SELECT id FROM products WHERE shop_id = ? AND name = ?').get(shop1Id, 'Fresh Crisp Green Spinach (Palak)') as any;
  const appleProd = db.prepare('SELECT id FROM products WHERE shop_id = ? AND name = ?').get(shop1Id, 'Himachal Royal Shimla Apples') as any;

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, unit, price, quantity, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  if (tomatoProd) {
    insertOrderItem.run(pastOrderId, tomatoProd.id, 'Farm Fresh Hybrid Tomatoes', '1 kg', 32.0, 2, 64.0);
  }
  if (spinachProd) {
    insertOrderItem.run(pastOrderId, spinachProd.id, 'Fresh Crisp Green Spinach (Palak)', '1 bunch (250g)', 28.0, 2, 56.0);
  }

  // Seed sample review for past order
  db.prepare(`
    INSERT INTO reviews (customer_id, customer_name, shop_id, product_id, order_id, rating, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    customerId,
    'Rahul Verma',
    shop1Id,
    tomatoProd ? tomatoProd.id : null,
    pastOrderId,
    5,
    'Super crisp and farm-fresh tomatoes! Delivered within 25 minutes in neat paper bags.'
  );

  // Active reservation order
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

  if (appleProd) {
    insertOrderItem.run(activeReservationId, appleProd.id, 'Himachal Royal Shimla Apples', '1 kg (4-5 pcs)', 160.0, 1, 160.0);
  }

  console.log(`[Seed] Database successfully populated with 6 shops, ${totalInserted} product listings across multiple shops, categories & demo accounts!`);
}

if (require.main === module) {
  runSeed();
}
