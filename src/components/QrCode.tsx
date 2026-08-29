import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

const QrCode: React.FC<QrCodeProps> = ({ value, size = 200, className }) => {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: "#000000", light: "#ffffff" } })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => console.error("QR generation failed", err));
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <div className={`bg-secondary rounded-md ${className}`} style={{ width: size, height: size }} />;
  }

  return <img src={dataUrl} alt="QR code" width={size} height={size} className={className} />;
};

export default QrCode;
