import React from 'react';
import type { Table } from '../../types/Table';
import { Button } from '../ui/Button';

interface QRCodeCardProps {
  table: Table;
  onRegenerate: () => void;
}

export default function QRCodeCard({ table, onRegenerate }: QRCodeCardProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!table.qrSvg) return;

    setIsDownloading(true);
    try {
      const { svgToPngBlob } = await import('../../lib/qr');
      const blob = await svgToPngBlob(table.qrSvg, 300, 300);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-${table.number || table.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ DOWNLOAD_ERROR', error);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Table {table.number}
        </h3>
        <div className="text-sm text-gray-500">
          {table.name && ` • ${table.name}`}
          {table.zone && ` • ${table.zone}`}
          {table.status && ` • Status: ${table.status}`}
        </div>
      </div>

      <div className="space-y-4">
        {table.qrSvg ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-center mb-4">
              <div 
                className="mx-auto" 
                dangerouslySetInnerHTML={{ __html: table.qrSvg }}
              />
            </div>
            <div className="flex justify-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="text-blue-600 hover:text-blue-800"
              >
                {isGenerating ? 'Regenerating...' : 'Regenerate QR Code'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="text-green-600 hover:text-green-800"
              >
                {isDownloading ? 'Downloading...' : 'Download PNG'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No QR code generated yet
          </div>
        )}
      </div>
    </div>
  );
}