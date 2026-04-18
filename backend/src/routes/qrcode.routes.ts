import { Router } from 'express';
import { qrcodeController } from '../controllers/qrcode.controller';
import { optionalAuth } from '../middlewares/optionalAuth.middleware';

const router = Router();

// QR code generation — works for anyone (optional auth)
router.use(optionalAuth);

// Get QR code as base64/SVG JSON response
router.get('/:id', qrcodeController.getQRCode);

// Download QR code as PNG file
router.get('/:id/download', qrcodeController.downloadQRCode);

export default router;