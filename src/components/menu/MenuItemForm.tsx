import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

const MenuItemFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be > 0"),
  category: z.string().min(1, "Category is required"),
  isAvailable: z.boolean(),
  description: z.string().optional(),
});

export type MenuItemFormValues = z.infer<typeof MenuItemFormSchema>;

interface MenuItemFormProps {
  initial?: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ initial, onSave, onCancel }) => {
  // DEV-STUB: store methods are handled by parent onSave; remove unused hook usage
  
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    setValue,
    control,
    getValues
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(MenuItemFormSchema),
    defaultValues: {
      id: initial?.id ?? undefined,
      name: initial?.name || '',
      price: initial?.price || 0,
      category: initial?.category || '',
      isAvailable: initial?.isAvailable ?? true,
      description: initial?.description || ''
    }
  });

  useEffect(() => {
    console.log('MenuItemForm mounted. initial=', initial);
    return () => console.log('MenuItemForm unmounted');
  }, [initial]);

  useEffect(() => {
    if (initial) {
      setValue('name', initial.name);
      setValue('price', initial.price);
      setValue('category', initial.category);
      setValue('isAvailable', initial.isAvailable ?? true);
      setValue('description', initial.description || '');
    }
  }, [initial, setValue]);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const onNative = (ev: Event) => console.log('FORM native submit event', ev);
    el.addEventListener('submit', onNative);
    return () => el.removeEventListener('submit', onNative);
  }, []);

  const onInvalid = (formErrors: any) => {
    console.log('🛑 FORM_INVALID', formErrors);
    setError('root', { message: 'Validation failed — check fields' });
  };

  const onSubmit = async (data: MenuItemFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log('FORM_ERRORS (pre-submit):', errors);
      console.log("🟩 FORM SUBMIT ATTEMPT", data);
      const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
      const now = new Date();
      const menuItem: MenuItem = {
        id: data.id ?? (crypto?.randomUUID?.() ?? "00000000-0000-0000-0000-000000000000"),
        name: data.name.trim(),
        price: Number.isFinite(price) ? price : 0,
        category: data.category.trim(),
        isAvailable: Boolean(data.isAvailable),
        description: data.description?.trim() ?? "",
        createdAt: initial?.createdAt ?? now,
        updatedAt: now
      };

      console.log('onSave called with item', menuItem);
      await onSave(menuItem);
      reset();
    } catch (error) {
      console.error('onSubmit error', error);
      setError('root', { message: 'Failed to save menu item' });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Beverages',
    'Salads',
    'Pizza',
    'Desserts',
    'Appetizers',
    'Main Courses',
    'Soups'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              {initial ? 'Edit Menu Item' : 'Add Menu Item'}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Enter item name"
                  {...register('name', { required: true })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  autoComplete="off"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('price', {
                    required: true,
                    valueAsNumber: true
                  })}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  autoComplete="off"
                  placeholder="Enter item description"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  autoComplete="off"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  {...register('isAvailable')}
                />
                <Label htmlFor="isAvailable" className="text-sm font-medium">
                  Available
                </Label>
              </div>

              {errors.root && (
                <p className="text-sm text-red-600">{errors.root.message}</p>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <button
                  id="orderin-menu-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 focus:outline-none disabled:opacity-50"
                >
                  {initial ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};