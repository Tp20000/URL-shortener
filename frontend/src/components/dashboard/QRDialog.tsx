import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { qrAPI } from '@/lib/api';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  urlId: string;
  shortUrl: string;
}

export function QRDialog({ open, onOpenChange, urlId, shortUrl }: QRDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && urlId) {
      fetchQR();
    }
  }, [open, urlId]);

  const fetchQR = async () => {
    setIsLoading(true);
    try {
      const res = await qrAPI.get(urlId, 'png', 400);
      setQrDataUrl(res.data.data.qrCode);
    } catch (err: any) {
      toast.error('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${urlId.slice(0, 8)}.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription className="truncate">{shortUrl}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {isLoading ? (
            <div className="flex h-64 w-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="h-64 w-64 rounded-lg border p-2"
            />
          ) : (
            <p className="text-muted-foreground">Failed to load QR code</p>
          )}

          <Button onClick={handleDownload} disabled={!qrDataUrl} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}