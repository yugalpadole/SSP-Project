import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export class SupabaseService {
  static isConfigured(): boolean {
    return supabase !== null;
  }

  // 1. Auth & Users
  static async getUser(email: string) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (error) return null;
    return data;
  }

  static async getUserById(id: number) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, avatar_url, created_at')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'customer' | 'shopkeeper';
    avatar_url?: string;
  }) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // 2. Shops
  static async getShopByUserId(userId: number) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data;
  }

  static async getShopById(id: number | string) {
    if (!supabase) return null;
    const query = isNaN(Number(id))
      ? supabase.from('shops').select('*').eq('slug', id).single()
      : supabase.from('shops').select('*').eq('id', Number(id)).single();
    const { data, error } = await query;
    if (error) return null;
    return data;
  }

  static async createShop(shopData: any) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('shops')
      .insert([shopData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async updateShop(shopId: number, shopData: any) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('shops')
      .update(shopData)
      .eq('id', shopId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // 3. Categories
  static async getCategories() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });
    if (error) return [];
    return data;
  }

  // 4. Products
  static async getProducts(filters?: {
    shopId?: number;
    categoryId?: number;
    search?: string;
  }) {
    if (!supabase) return [];
    let query = supabase.from('products').select('*, shops(name, locality, slug), categories(name)').eq('is_active', true);

    if (filters?.shopId) {
      query = query.eq('shop_id', filters.shopId);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('id', { ascending: false });
    if (error) return [];
    return data;
  }

  static async createProduct(productData: any) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async updateProduct(productId: number, productData: any) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // 5. Cart Items
  static async getCart(userId: number) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, shop_id, products(*), shops(name, locality)')
      .eq('user_id', userId)
      .order('id', { ascending: true });
    if (error) return [];
    return data;
  }

  static async addToCart(userId: number, productId: number, shopId: number, quantity: number) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: userId, product_id: productId, shop_id: shopId, quantity, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,product_id' }
      )
      .select();
    if (error) throw new Error(error.message);
    return data;
  }

  // 6. Orders
  static async getOrdersByShop(shopId: number, status?: string) {
    if (!supabase) return [];
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return [];
    return data;
  }

  static async updateOrderStatus(orderId: number, status: string) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
