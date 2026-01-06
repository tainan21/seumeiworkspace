"use client";

import { useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { QrCode, Download, Loader2 } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface QRCodeGeneratorProps {
  url: string;
}

export function QRCodeGenerator({ url }: QRCodeGeneratorProps) {
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [qrSize, setQrSize] = useState("200");
  const { toast } = useToast();

  const generateQRCode = useCallback(() => {
    if (!showQR) {
      setLoading(true);
      setError(false);
    }
    setShowQR(!showQR);
  }, [showQR]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
    toast({
      title: "❌ Erro ao gerar QR Code",
      description: "Não foi possível carregar o QR Code. Tente novamente.",
      variant: "destructive",
      duration: 3000,
    });
  };

  const downloadQRCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `whatsapp-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "📥 QR Code baixado!",
        description: "O arquivo foi salvo na sua pasta de downloads",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Erro no download",
        description: "Não foi possível baixar o QR Code",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={generateQRCode}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <QrCode className="mr-2 h-4 w-4" />
          )}
          {showQR ? "Ocultar QR Code" : "Gerar QR Code"}
        </Button>

        {showQR && !loading && !error && (
          <>
            <Select value={qrSize} onValueChange={setQrSize}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="150">150x150</SelectItem>
                <SelectItem value="200">200x200</SelectItem>
                <SelectItem value="300">300x300</SelectItem>
                <SelectItem value="400">400x400</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={downloadQRCode} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Baixar PNG
            </Button>
          </>
        )}
      </div>

      {showQR && (
        <div className="flex justify-center">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            {loading && (
              <div className="flex h-48 w-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}

            {error && (
              <div className="flex h-48 w-48 items-center justify-center text-center text-sm text-gray-500">
                <div>
                  <QrCode className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  Erro ao carregar QR Code
                </div>
              </div>
            )}

            {!error && (
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt={`QR Code para WhatsApp: ${url}`}
                className={`transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
                style={{ width: `${qrSize}px`, height: `${qrSize}px` }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            )}

            <div className="mt-3 text-center text-xs text-gray-500">
              Escaneie com a câmera do WhatsApp
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
