import { Response, NextFunction, Request } from 'express';
import { qrcodeService, QRCodeOptions } from '../services/qrcode.service';
import { AuthRequest, ApiResponse } from '../types';

export const qrcodeController = {
  /**
   * GET /api/qr/:id — Get QR code for a URL (returns JSON with base64/svg)
   */
  async getQRCode(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const urlId = req.params['id'] as string;
      const options: QRCodeOptions = {
        width: parseInt(req.query['width'] as string) || 300,
        margin: parseInt(req.query['margin'] as string) || 2,
        darkColor: (req.query['dark'] as string) || '#000000',
        lightColor: (req.query['light'] as string) || '#ffffff',
        format: (req.query['format'] as string) === 'svg' ? 'svg' : 'png',
      };

      const result = await qrcodeService.getQRCodeForUrl(
        urlId,
        req.user?.id,
        options
      );

      const response: ApiResponse = {
        success: true,
        message: 'QR code generated successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/qr/:id/download — Download QR code as PNG image
   */
  async downloadQRCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const urlId = req.params['id'] as string;
      const width = parseInt(req.query['width'] as string) || 300;

      // Find the URL
      const { url } = await qrcodeService.getQRCodeForUrl(urlId, undefined, {});

      const code = url.customAlias || url.shortCode;
      const buffer = await qrcodeService.generateBuffer(code, { width });

      const filename = `qr-${code}.png`;

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};