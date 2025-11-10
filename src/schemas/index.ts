import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1, 'Username is required'),
  role: z.enum(['admin', 'staff', 'kitchen']),
  pin: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LoginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  pin: z.string().min(4, 'PIN must be at least 4 characters'),
});

// Menu schemas
export const ModifierOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Option name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
});

export const MenuItemModifierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Modifier name is required'),
  options: z.array(ModifierOptionSchema),
  required: z.boolean(),
  multiSelect: z.boolean(),
});

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean(),
  modifiers: z.array(MenuItemModifierSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MenuItemFormSchema = z.object({
  id: z.preprocess((val) => {
    if (val === '' || val === null) return undefined;
    return val;
  }, z.string().uuid().optional()),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.preprocess((val) => (typeof val === 'string' ? parseFloat(val) : val), z.number().min(0, 'Price must be non-negative')),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean(),
  modifiers: z.array(MenuItemModifierSchema).optional(),
});

// Order schemas
export const SelectedModifierSchema = z.object({
  modifierId: z.string().uuid(),
  optionIds: z.array(z.string().uuid()),
});

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be non-negative'),
  modifiers: z.array(SelectedModifierSchema).optional(),
  notes: z.string().optional(),
});

export const CustomerInfoSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  tableNumber: z.number().positive().optional(),
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  tax: z.number().min(0, 'Tax must be non-negative'),
  total: z.number().min(0, 'Total must be non-negative'),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'online']).optional(),
  customerInfo: CustomerInfoSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const OrderFormSchema = z.object({
  tableNumber: z.number().positive().optional(),
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
  customerInfo: CustomerInfoSchema.optional(),
});

// Table schemas
export const TableSchema = z.object({
  id: z.string().uuid(),
  number: z.number().positive(),
  capacity: z.number().positive(),
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']),
  currentOrderId: z.string().uuid().optional(),
  qrCodeUrl: z.string().url(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Complaint schemas
export const ComplaintSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  category: z.enum(['food', 'service', 'ambiance', 'payment', 'other']),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  resolution: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ComplaintFormSchema = z.object({
  orderId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  category: z.enum(['food', 'service', 'ambiance', 'payment', 'other']),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['low', 'medium', 'high']),
});

// Settings schemas
export const CafeSettingsSchema = z.object({
  id: z.string().uuid(),
  cafeName: z.string().min(1, 'OrderIN name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  currency: z.string().min(1, 'Currency is required'),
  paymentModes: z.object({
    payBefore: z.boolean(),
    payAfter: z.boolean(),
    onlinePayments: z.boolean(),
  }),
  printing: z.object({
    enabled: z.boolean(),
    printerName: z.string().optional(),
    autoPrintOrders: z.boolean(),
    autoPrintBills: z.boolean(),
  }),
  cloudSync: z.object({
    enabled: z.boolean(),
    endpoint: z.string().url().optional(),
    lastSync: z.date().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SettingsFormSchema = z.object({
  cafeName: z.string().min(1, 'OrderIN name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  currency: z.string().min(1, 'Currency is required'),
  paymentModes: z.object({
    payBefore: z.boolean(),
    payAfter: z.boolean(),
    onlinePayments: z.boolean(),
  }),
  printing: z.object({
    enabled: z.boolean(),
    printerName: z.string().optional(),
    autoPrintOrders: z.boolean(),
    autoPrintBills: z.boolean(),
  }),
  cloudSync: z.object({
    enabled: z.boolean(),
    endpoint: z.string().url().optional(),
  }),
});

// API Response schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Sync status schema
export const SyncStatusSchema = z.object({
  isOnline: z.boolean(),
  lastSync: z.date().optional(),
  pendingChanges: z.number().min(0),
  syncInProgress: z.boolean(),
  error: z.string().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuItemForm = z.infer<typeof MenuItemFormSchema>;
export type MenuItemModifier = z.infer<typeof MenuItemModifierSchema>;
export type ModifierOption = z.infer<typeof ModifierOptionSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderForm = z.infer<typeof OrderFormSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type SelectedModifier = z.infer<typeof SelectedModifierSchema>;
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type Table = z.infer<typeof TableSchema>;
export type Complaint = z.infer<typeof ComplaintSchema>;
export type ComplaintForm = z.infer<typeof ComplaintFormSchema>;
export type CafeSettings = z.infer<typeof CafeSettingsSchema>;
export type SettingsForm = z.infer<typeof SettingsFormSchema>;
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type SyncStatus = z.infer<typeof SyncStatusSchema>;