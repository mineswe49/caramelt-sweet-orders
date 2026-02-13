export type OrderStatus =
  | "PENDING_ADMIN_ACCEPTANCE"
  | "ACCEPTED"
  | "PAID_CONFIRMED"
  | "CANCELLED";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_code: string;
  requested_prep_date: string;
  confirmed_prep_date: string | null;
  notes: string | null;
  payment_method: string;
  status: OrderStatus;
  is_paid: boolean;
  paid_at: string | null;
  admin_comment: string | null;
  created_at: string;
  // Optional: populated from customer relation
  customer?: Customer;
  // Optional: flattened customer fields for backward compatibility
  full_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
