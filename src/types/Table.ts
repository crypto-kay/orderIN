/**
 * Table management types for QR ordering system
 * 
 * Tables can be assigned to specific zones for QR code ordering
 * Each table maintains its own QR code and status
 */

export interface Table {
  /** Application-level unique identifier */
  id: string;
  
  /** PouchDB document ID (mirrors id for consistency) */
  _id?: string;
  
  /** PouchDB revision for conflict handling */
  _rev?: string;
  
  /** Table number as displayed to customers */
  number: number;
  
  /** Table name/identifier */
  name?: string;
  
  /** Physical zone/location of the table */
  zone?: string;
  
  /** Generated QR code URL for ordering */
  qrUrl?: string;
  
  /** Generated QR code as SVG string */
  qrSvg?: string;
  
  /** Current table status */
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  
  /** Timestamp when table was created */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt?: string;
}