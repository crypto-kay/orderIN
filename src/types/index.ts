// User & Authentication
export interface User {
  id: string; // UUID
  username: string;
  role: 'admin' | 'staff' | 'kitchen';
  pin?: string; // For local auth
  createdAt: Date;
  updatedAt: Date;
}

// Menu Management
export interface MenuItem {
  id: string; // UUID
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  modifiers?: MenuItemModifier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemModifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  multiSelect: boolean;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

// Order Management
export interface Order {
  id: string; // UUID
  tableNumber?: number;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online';
  customerInfo?: CustomerInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  modifiers?: SelectedModifier[];
  notes?: string;
}

export interface SelectedModifier {
  modifierId: string;
  optionIds: string[];
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

// Tables
export interface Table {
  id: string; // UUID
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: string;
  qrCodeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Complaints
export interface Complaint {
  id: string; // UUID
  orderId?: string;
  customerName?: string;
  customerContact?: string;
  category: 'food' | 'service' | 'ambiance' | 'payment' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings
export interface CafeSettings {
  id: string; // UUID
  cafeName: string;
  address?: string;
  phone?: string;
  email?: string;
  taxRate: number;
  currency: string;
  paymentModes: {
    payBefore: boolean;
    payAfter: boolean;
    onlinePayments: boolean;
  };
  printing: {
    enabled: boolean;
    printerName?: string;
    autoPrintOrders: boolean;
    autoPrintBills: boolean;
  };
  cloudSync: {
    enabled: boolean;
    endpoint?: string;
    lastSync?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  lastSync?: Date;
  pendingChanges: number;
  syncInProgress: boolean;
  error?: string;
}

// Navigation types
export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: User['role'][];
};

// Form types
export interface LoginForm {
  username: string;
  pin: string;
}

export interface MenuItemForm {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  modifiers?: MenuItemModifier[];
}

export interface OrderForm {
  tableNumber?: number;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  items: OrderItem[];
  customerInfo?: CustomerInfo;
}

export interface ComplaintForm {
  orderId?: string;
  customerName?: string;
  customerContact?: string;
  category: Complaint['category'];
  description: string;
  severity: Complaint['severity'];
}

export interface SettingsForm {
  cafeName: string;
  address?: string;
  phone?: string;
  email?: string;
  taxRate: number;
  currency: string;
  paymentModes: CafeSettings['paymentModes'];
  printing: CafeSettings['printing'];
  cloudSync: CafeSettings['cloudSync'];
}