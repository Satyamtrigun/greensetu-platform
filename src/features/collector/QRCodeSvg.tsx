import { QRCodeSVG } from "qrcode.react";

export function QRCodeSvg({ value, size = 160 }: { value: string; size?: number }) {
  return <QRCodeSVG value={value} size={size} level="M" />;
}
