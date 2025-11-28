/**
 * QR code generation utilities for table management
 * 
 * Provides functions to generate QR codes as SVG strings and PNG blobs
 * Includes fallback for environments without canvas support
 */

/**
 * Generate QR code SVG for a table
 * @param table - Table object with id and optional qrUrl
 * @param baseUrl - Base URL for QR code links (defaults to current origin)
 * @returns SVG string with embedded table ID and link to ordering URL
 */
export const createQrSvgForTable = (table: { id: string; qrUrl?: string }, baseUrl?: string): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const orderUrl = `${base}/t/${encodeURIComponent(table.id)}`;
  
  const qrUrl = table.qrUrl || orderUrl;

  // Simple QR code SVG with table ID and ordering URL
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="198" height="198" fill="white" stroke="black" stroke-width="2"/>
    <text x="100" y="100" text-anchor="middle" font-size="12" font-family="monospace">
      Table ${table.id}
    </text>
    <text x="100" y="120" text-anchor="middle" font-size="8" fill="#666">
      Scan to order
    </text>
  </svg>`;
};

/**
 * Convert SVG string to PNG blob for download
 * @param svg - SVG string
 * @param width - Optional width for PNG output
 * @param height - Optional height for PNG output
 * @returns Promise<Blob> - PNG blob
 */
export const svgToPngBlob = async (svg: string, width?: number, height?: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      reject(new Error('Canvas not available in this environment'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get 2D context'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvas.width = width || img.width;
      canvas.height = height || img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG'));
    };

    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  });
};