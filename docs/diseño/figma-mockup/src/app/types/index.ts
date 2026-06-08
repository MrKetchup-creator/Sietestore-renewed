export type UserRole = 'admin' | 'employee';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export type Category = 'Dama' | 'Caballero' | 'Gorra';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Única';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: Category;
  type: string; // camisa, pantalón, vestido, gorra, etc.
  size: Size;
  color: string;
  brand: string;
  salePrice: number;
  cost: number;
  stock: number;
  minStock: number;
  description: string;
  location: string;
  entryDate: string;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  size: Size;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  clientName?: string;
  clientId?: string;
  employeeName: string;
}

export interface Client {
  id: string;
  name: string;
  idNumber: string;
  phone: string;
  email: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  products: string[];
}

export interface DashboardStats {
  monthSales: number;
  daySales: number;
  totalProducts: number;
  lowStockProducts: number;
}
