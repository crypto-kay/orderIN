/**
 * QR code generation utilities for table management
 *
 * Provides functions to generate QR codes as SVG strings and PNG blobs
 * Uses qrcode library for proper QR code generation
 */

import QRCode from 'qrcode';

/**
 * Generate QR code SVG for a table
 * @param table - Table object with id and optional qrUrl
 * @param baseUrl - Base URL for QR code links (defaults to current origin)
 * @returns SVG string with embedded table ID and link to ordering URL
 */
export const createQrSvgForTable = async (table: { id: string; qrUrl?: string }, baseUrl?: string): Promise<string> => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const orderUrl = `${base}/order?tableId=${encodeURIComponent(table.id)}`;

  const qrUrl = table.qrUrl || orderUrl;

  try {
    // Generate QR code as SVG using qrcode library
    const svgString = await QRCode.toString(qrUrl, {
      type: 'svg',
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return svgString;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error generating QR code:', error);
    }
    // Fallback to simple SVG placeholder
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="198" height="198" fill="white" stroke="black" stroke-width="2"/>
      <text x="100" y="100" text-anchor="middle" font-size="12" font-family="monospace">
        Table ${table.id}
      </text>
      <text x="100" y="120" text-anchor="middle" font-size="8" fill="#666">
        Scan to order
      </text>
    </svg>`;
  }
};

/**
 * Convert SVG string to PNG blob for download
 * @param svg - SVG string
 * @param width - Optional width for PNG output
 * @param height - Optional height for PNG output
 * @returns Promise<Blob> - PNG blob
 */
export const svgToPngBlob = async (svg: string, width: number = 200, height: number = 200): Promise<Blob> => {
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

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png', 0.95);
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG'));
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  });
};

/**
 * Generate QR code data URL for a table
 * @param table - Table object with id and optional qrUrl
 * @param baseUrl - Base URL for QR code links
 * @returns Promise<string> - Data URL for QR code image
 */
export const createQrDataUrl = async (table: { id: string; qrUrl?: string }, baseUrl?: string): Promise<string> => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const orderUrl = `${base}/order?tableId=${encodeURIComponent(table.id)}`;

  const qrUrl = table.qrUrl || orderUrl;

  try {
    // Generate QR code as data URL using qrcode library
    const dataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return dataUrl;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error generating QR code data URL:', error);
    }
    throw error;
  }
};