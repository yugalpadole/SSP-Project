export type UserRole = 'customer' | 'shopkeeper';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export interface Shop {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  address: string;
  locality: string;
  pincode: string;
  phone: string;
  whatsapp_number: string;
  opening_hours: string;
  logo_url: string;
  banner_url: string;
  rating: number;
  review_count: number;
  is_delivery_enabled: number | boolean;
  delivery_charge: number;
  min_order_amount: number;
  estimated_delivery_time: string;
  serviceable_areas: string;
  reservation_expiry_minutes: number;
  product_count?: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image_url: string;
  product_count?: number;
}

export interface Product {
  id: number;
  shop_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  unit: string;
  image_url: string;
  stock_quantity: number;
  reserved_quantity: number;
  available_stock: number;
  is_active: number;
  category_name?: string;
  shop_name?: string;
  shop_locality?: string;
  shop_slug?: string;
  shop_rating?: number;
  is_delivery_enabled?: number | boolean;
  delivery_charge?: number;
  estimated_delivery_time?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shopId: number;
  shopName: string;
}

export interface CustomerAddress {
  id: number;
  user_id: number;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  locality: string;
  city: string;
  pincode: string;
  is_default: number | boolean;
}

export type OrderType = 'delivery' | 'reserve_collect';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit?: string;
  price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  shop_id: number;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  delivery_address?: string;
  customer_name: string;
  customer_phone: string;
  customer_notes?: string;
  reservation_expires_at?: string;
  stock_released: number;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  shop_name?: string;
  shop_phone?: string;
  shop_whatsapp?: string;
  shop_address?: string;
  shop_locality?: string;
  has_reviewed?: number;
  items?: OrderItem[];
}

export interface Review {
  id: number;
  customer_id: number;
  customer_name: string;
  shop_id: number;
  product_id?: number;
  order_id: number;
  rating: number;
  comment: string;
  created_at: string;
}
