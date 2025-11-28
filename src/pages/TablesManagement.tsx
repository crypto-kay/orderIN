import React, { useEffect, useState } from 'react';
import { useTableStore } from '../../stores/tableStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import TableForm from '../components/tables/TableForm';
import QRCodeCard from '../components/tables/QRCodeCard';
import type { Table } from '../../types/Table';

export default function TablesManagement() {
  const { tables, loadTables, loading, error } = useTableStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const filteredTables = tables.filter(table =>
    table.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.number?.toString().includes(searchTerm)
  );

  const handleCreateTable = () => {
    setEditingTable(null);
    setIsFormOpen(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTable(null);
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      // TODO: Import and use deleteTable from tableStore
      console.log('🗑️ Deleting table:', id);
      // await deleteTable(id);
      // loadTables(); // Refresh list
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tables Management</h1>
        <Button
          onClick={handleCreateTable}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Create New Table
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search tables by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tables found. Create your first table to get started.
          </div>
        ) : (
          filteredTables.map(table => (
            <div key={table.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Table {table.number}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {table.name && ` • ${table.name}`}
                    {table.zone && ` • ${table.zone}`}
                    {table.status && ` • Status: ${table.status}`}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTable(table)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTable(table.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <QRCodeCard
                  table={table}
                  onRegenerate={() => {
                    // TODO: Import and use regenerateQr from tableStore
                    console.log('🔄 Regenerating QR for table:', table.id);
                  }}
                  onDownload={() => {
                    console.log('📥 Downloading QR for table:', table.id);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <TableForm
              table={editingTable}
              onSave={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}