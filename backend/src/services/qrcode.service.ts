import QRCode from 'qrcode';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler.middleware';
import prisma from '../config/database';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  format?: 'png' | 'svg';
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 300,
  margin: 2,
  darkColor: '#000000',
  lightColor: '#ffffff',
  format: 'png',
};

export const qrcodeService = {
  /**
   * Generate QR code as a Data URL (base64 PNG)
   */
  async generateDataUrl(
    shortCode: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const url = `${env.baseUrl}/${shortCode}`;
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: opts.width,
        margin: opts.margin,
        color: {
          dark: opts.darkColor || '#000000',
          light: opts.lightColor || '#ffffff',
        },
      });

      return dataUrl;
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  },

  /**
   * Generate QR code as SVG string
   */
  async generateSvg(
    shortCode: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const url = `${env.baseUrl}/${shortCode}`;
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        width: opts.width,
        margin: opts.margin,
        color: {
          dark: opts.darkColor || '#000000',
          light: opts.lightColor || '#ffffff',
        },
      });

      return svg;
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  },

  /**
   * Generate QR code as Buffer (for direct download)
   */
  async generateBuffer(
    shortCode: string,
    options: QRCodeOptions = {}
  ): Promise<Buffer> {
    const url = `${env.baseUrl}/${shortCode}`;
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const buffer = await QRCode.toBuffer(url, {
        width: opts.width,
        margin: opts.margin,
        color: {
          dark: opts.darkColor || '#000000',
          light: opts.lightColor || '#ffffff',
        },
      });

      return buffer;
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  },

  /**
   * Get QR code for a URL (verifies URL exists and user has access)
   */
  async getQRCodeForUrl(
    urlId: string,
    userId: string | undefined,
    options: QRCodeOptions = {}
  ) {
    const url = await prisma.url.findUnique({
      where: { id: urlId },
      select: {
        id: true,
        shortCode: true,
        customAlias: true,
        originalUrl: true,
        title: true,
        userId: true,
        isActive: true,
      },
    });

    if (!url) {
      throw new AppError('URL not found', 404);
    }

    if (!url.isActive) {
      throw new AppError('This URL is inactive', 400);
    }

    // Use custom alias if available, otherwise short code
    const code = url.customAlias || url.shortCode;
    const shortUrl = `${env.baseUrl}/${code}`;

    const format = options.format || 'png';
    let qrCode: string;

    if (format === 'svg') {
      qrCode = await this.generateSvg(code, options);
    } else {
      qrCode = await this.generateDataUrl(code, options);
    }

    return {
      url: {
        id: url.id,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        originalUrl: url.originalUrl,
        title: url.title,
        shortUrl,
      },
      qrCode,
      format,
    };
  },
};