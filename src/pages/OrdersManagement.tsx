import { useEffect, useState } from 'react';
import OrderCard from '../components/orders/OrderCard';
import OrderForm from '../components/orders/OrderForm';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useOrderStore } from '../stores/orderStore';
import type { Order } from '../types/Order';

export default function OrdersManagement() {
  const { orders, loadOrders, loading, error } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    let filtered = orders;

    if (activeTab === 'all') {
      filtered = orders;
    } else if (activeTab === 'active') {
      filtered = orders.filter(order => order.status === 'Pending' || order.status === 'Preparing');
    } else if (activeTab === 'completed') {
      filtered = orders.filter(order => order.status === 'Served');
    } else if (activeTab === 'cancelled') {
      filtered = orders.filter(order => order.status === 'Cancelled');
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, activeTab, searchTerm]);

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsFormOpen(false); // Close the modal, use the side panel instead
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const { deleteOrder } = useOrderStore.getState();
      deleteOrder(id).then(() => {
        // Refresh orders after successful delete
        setTimeout(() => {
          const { loadOrders } = useOrderStore.getState();
          loadOrders();
        }, 100);
      });
    }
  };

  const getStatusCount = (status: Order['status']) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
                <Button
                  onClick={handleCreateOrder}
                  className="mb-4"
                >
                  Create New Order
                </Button>
              </div>

              <div className="mb-4">
                <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by order ID or item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-t-lg font-medium ${
                    activeTab === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-t-lg font-medium ${
                    activeTab === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Active ({getStatusCount('Pending') + getStatusCount('Preparing')})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-t-lg font-medium ${
                    activeTab === 'completed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Completed ({getStatusCount('Served')})
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-4 py-2 rounded-t-lg font-medium ${
                    activeTab === 'cancelled'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancelled ({getStatusCount('Cancelled')})
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders found
                </div>
              ) : (
                filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onEdit={handleEditOrder}
                    onUpdateStatus={async (id, status) => {
                      const { updateOrder } = useOrderStore.getState();
                      try {
                        await updateOrder(id, { status });
                        // Refresh orders after successful update
                        setTimeout(() => {
                          const { loadOrders } = useOrderStore.getState();
                          loadOrders();
                        }, 100);
                      } catch (error) {
                        console.error('Failed to update order status:', error);
                        alert('Failed to update order status. Please try again.');
                      }
                    }}
                    onDelete={handleDeleteOrder}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingOrder ? 'Edit Order' : 'Order Details'}
              </h2>
              
              {editingOrder ? (
                <OrderForm
                  order={editingOrder}
                  onSave={() => {
                    setEditingOrder(null);
                    setIsFormOpen(false);
                  }}
                  onCancel={() => {
                    setEditingOrder(null);
                    setIsFormOpen(false);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select an order to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <OrderForm
              onSave={() => {
                setEditingOrder(null);
                setIsFormOpen(false);
              }}
              onCancel={() => {
                setEditingOrder(null);
                setIsFormOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}