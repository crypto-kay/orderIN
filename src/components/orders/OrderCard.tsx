import { CheckCircle, Edit, ShoppingCart, Trash2 } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import type { Order } from '../../types/Order';
import { Button } from '../ui/Button';

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDelete: (id: string) => void;
}

export default function OrderCard({ order, onEdit, onUpdateStatus, onDelete }: OrderCardProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800';
      case 'Served':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const { updatingId } = useOrderStore();
  const isUpdating = updatingId === order.id;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
            {isUpdating && (
              <span className="ml-2 text-gray-500">(updating...)</span>
            )}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Created: {formatDate(order.createdAt)}
          {order.updatedAt && ` • Updated: ${formatDate(order.updatedAt)}`}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(order)}
          className="text-blue-600 hover:text-blue-800"
          disabled={isUpdating}
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        {order.status !== 'Cancelled' && order.status !== 'Served' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to cancel this order?')) {
                onUpdateStatus(order.id, 'Cancelled');
              }
            }}
            className="text-red-600 hover:text-red-800"
            disabled={isUpdating}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        {order.status === 'Pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'Preparing')}
            className="text-blue-600 hover:text-blue-800"
            disabled={isUpdating}
          >
            <Edit className="w-4 h-4 mr-1" />
            Start Preparing
          </Button>
        )}
        {order.status === 'Preparing' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateStatus(order.id, 'Served')}
            className="text-green-600 hover:text-green-800"
            disabled={isUpdating}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Served
          </Button>
        )}
        {order.status === 'Served' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
                onDelete(order.id);
              }
            }}
            className="text-red-600 hover:text-red-800"
            disabled={isUpdating}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
        {order.status === 'Cancelled' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
                onDelete(order.id);
              }
            }}
            className="text-red-600 hover:text-red-800"
            disabled={isUpdating}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center mb-2">
          <ShoppingCart className="w-5 h-5 mr-2 text-gray-500" />
          <span className="font-medium">Items: {order.items.length}</span>
        </div>
        
        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500 ml-2">× {item.quantity}</span>
              </div>
              <div className="text-right font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold">₹{order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}