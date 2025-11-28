export interface Order {
  id: string;
  _id?: string; // PouchDB document ID
  _rev?: string; // PouchDB revision
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Served' | 'Cancelled';
  createdAt: string;
  updatedAt?: string;
}