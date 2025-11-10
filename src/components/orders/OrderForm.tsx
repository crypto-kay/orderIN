import React, { useEffect, useState } from 'react';
import { useMenuStore } from '../../stores/menuStore';
import { useOrderStore } from '../../stores/orderStore';
import type { Order } from '../../types/Order';
import type { MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';

interface OrderFormProps {
  order?: Order;
  onSave: (order?: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function OrderForm({ order, onSave, onCancel }: OrderFormProps) {
  const { items, loadItems } = useMenuStore();
  const { addOrder, updateOrder, loading } = useOrderStore();
  
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>>(order?.items || []);

  // Ensure menu items are loaded when component mounts
  useEffect(() => {
    if (items.length === 0) {
      loadItems();
    }
  }, [items.length, loadItems]);

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddItem = (menuItemId: string) => {
    const menuItem = items.find((item) => item.id === menuItemId);
    if (!menuItem) return;

    const existingItem = selectedItems.find((item) => item.id === menuItemId);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item => 
        item.id === menuItemId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    // Prevent removal if order is being prepared
    if (order?.status === 'Preparing') {
      return;
    }
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setSelectedItems(selectedItems.map((item) => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    const orderData = {
      items: selectedItems,
      total: calculateTotal(),
      status: 'Pending' as const,
    };

    if (order) {
      updateOrder(order.id, { ...orderData, status: order.status }).then(() => {
        // Refresh orders after successful update
        setTimeout(() => {
          const { loadOrders } = useOrderStore.getState();
          loadOrders();
        }, 200);
      });
    } else {
      addOrder(orderData);
    }
    
    onSave();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {order ? 'Edit Order' : 'Create New Order'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-2">
            Order Items
          </Label>
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No items added yet. Add items from the menu below.
              </p>
            ) : (
              selectedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">₹{item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={order?.status === 'Preparing'}
                      aria-disabled={order?.status === 'Preparing'}
                      className={`w-8 h-8 rounded border flex items-center justify-center ${
                        order?.status === 'Preparing' 
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                          : 'border-red-300 text-red-500 hover:bg-red-50'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {order?.status === 'Preparing' && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Items can't be removed while an order is being prepared. You can still add new items.
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="menu" className="block text-sm font-medium text-gray-700 mb-2">
            Add Menu Items
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {items.filter((menuItem: MenuItem) => menuItem.isAvailable !== false).map((menuItem: MenuItem) => (
              <button
                key={menuItem.id}
                type="button"
                onClick={() => handleAddItem(menuItem.id)}
                className="p-2 text-left border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="font-medium">{menuItem.name}</div>
                <div className="text-sm text-gray-500">₹{menuItem.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-bold">₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || selectedItems.length === 0}
            className="min-w-32"
          >
            {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}