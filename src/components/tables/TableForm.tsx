import React, { useState } from 'react';
import { useTableStore } from '../../stores/tableStore';
import { createQrSvgForTable, svgToPngBlob } from '../../lib/qr';
import type { Table } from '../../types/Table';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface TableFormData {
  name?: string;
  number?: string;
  zone?: string;
}

export default function TableForm({ table, onSave, onCancel }: {
  table?: Table;
  onSave: (table: Table) => void;
  onCancel: () => void;
}) {
  const { addTable, updateTable, loading, error } = useTableStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TableFormData>(
    table ? {
      name: table.name,
      number: table.number.toString(),
      zone: table.zone,
    } : {}
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (table) {
        // Update existing table
        await updateTable(table.id, {
          name: formData.name,
          number: formData.number ? parseInt(formData.number) : undefined,
          zone: formData.zone,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new table
        await addTable({
          name: formData.name!,
          number: formData.number ? parseInt(formData.number) : undefined,
          zone: formData.zone,
          status: 'available',
        });
      }
      
      onSave(table || ({} as Table));
    } catch (error: unknown) {
      console.error('❌ TABLE_FORM_ERROR', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateQr = async () => {
    if (!table) return;
    
    try {
      await useTableStore.getState().regenerateQR(table.id);
    } catch (error: unknown) {
      console.error('❌ QR_REGENERATE_ERROR', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {table ? 'Edit Table' : 'Create New Table'}
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
          <Label htmlFor="name">Table Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter table name"
            required
          />
        </div>

        <div>
          <Label htmlFor="number">Table Number</Label>
          <Input
            id="number"
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="Enter table number"
          />
        </div>

        <div>
          <Label htmlFor="zone">Zone (Optional)</Label>
          <Input
            id="zone"
            type="text"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            placeholder="e.g., Main Hall, Patio Area"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="min-w-32"
          >
            {isSubmitting ? 'Saving...' : table ? 'Update Table' : 'Create Table'}
          </Button>
        </div>
      </form>

      {table && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateQr}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800"
            >
              Regenerate QR Code
            </Button>
          </div>

          {table.qrSvg && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div 
                className="mx-auto" 
                dangerouslySetInnerHTML={{ __html: table.qrSvg }}
              />
            </div>
          )}

          {table.qrUrl && (
            <div className="mt-4">
              <Label htmlFor="qrUrl">QR Ordering URL</Label>
              <Input
                id="qrUrl"
                type="url"
                value={table.qrUrl}
                onChange={(e) => updateTable(table.id, { qrUrl: e.target.value })}
                placeholder="https://orderin.local/table/..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}