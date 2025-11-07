import { motion } from 'framer-motion';
import { CheckCircle, Edit, Plus, Trash2, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MenuItemForm } from '../components/menu/MenuItemForm';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useMenuStore } from '../stores/menuStore';
import type { MenuItem } from '../types';
import { formatINR } from '../utils/currency';

const MenuManagement: React.FC = () => {
  const items = useMenuStore(s => s.items);
  const loadItems = useMenuStore(s => s.loadItems);
  const deleteItem = useMenuStore(s => s.deleteItem);
  const toggleAvailability = useMenuStore(s => s.toggleAvailability);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadItems().catch(e => console.warn('loadItems failed', e));
  }, [loadItems]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (window as any).__ORDERIN_STORE = useMenuStore.getState();
    console.log('DEBUG: exposed __ORDERIN_STORE (inspect in console)');
    // Also update it every 1s for convenience (remove later)
    const interval = setInterval(() => {
      try { (window as any).__ORDERIN_STORE = useMenuStore.getState(); } catch(e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setMessage(null);
  };

  const handleSave = async (item: MenuItem) => {
    try {
      console.log("🟦 HANDLE SAVE", item);
      const isEdit = !!editingItem?.id;
      
      if (isEdit) {
        await useMenuStore.getState().updateItem(item);
        setMessage({ type: 'success', text: 'Item updated successfully' });
      } else {
        await useMenuStore.getState().addItem(item);
        setMessage({ type: 'success', text: 'Item added successfully' });
      }
      
      handleCloseForm();
      console.log('MenuManagement.handleSave done', item.id);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Menu save failed', err);
      setMessage({ type: 'error', text: `Failed to ${editingItem?.id ? 'update' : 'add'} item` });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await deleteItem(id);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    await toggleAvailability(id);
  };

  const formatPrice = (price: number) => {
    return formatINR(price);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {message && (
        <div className={`max-w-7xl mx-auto mb-4 p-3 rounded-md ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-100 text-sm">
          <div><strong>Debug</strong> — items in store: <span data-testid="debug-items-count">{items?.length ?? 0}</span></div>
          <ul className="mt-2 max-h-32 overflow-y-auto text-xs">
            {(items ?? []).map(it => (
              <li key={it.id} className="py-0.5">
                <span className="font-medium">{it.name}</span> — <span className="text-muted text-xs">{it.id}</span>
              </li>
            ))}
          </ul>
        </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item.id)}
                      aria-label="Toggle availability"
                      className="hover:opacity-80 transition h-8 w-8 p-0"
                    >
                      {item.isAvailable ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete item"
                      className="hover:text-red-700 text-red-600 transition h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-2xl font-bold">{formatPrice(item.price)}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {isFormOpen && (
          <MenuItemForm
            initial={editingItem}
            onSave={handleSave}
            onCancel={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
};

export default MenuManagement;