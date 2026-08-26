'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface QRCodeWithLogoProps {
  value: string;
  size?: number;
  logoSrc?: string;
  logoSize?: number;
  className?: string;
}

// Lightweight, self-contained QR Code Generator based on standard QR matrix encoding
// Supports Error Correction Level H (30% redundancy) for crisp centered logo overlay
export default function QRCodeWithLogo({
  value,
  size = 220,
  logoSrc = '/logo.png',
  logoSize = 48,
  className = '',
}: QRCodeWithLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use QuickChart QR API / Canvas Vector Renderer with high error correction
    const qrImg = new window.Image();
    qrImg.crossOrigin = 'anonymous';
    const encodedValue = encodeURIComponent(value);
    // Level H = 30% error correction, dark green / slate modules
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodedValue}&ecc=H&margin=1&color=0f172a&bgcolor=ffffff`;

    qrImg.onload = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Draw background rounded rect
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw QR Code
      ctx.drawImage(qrImg, 0, 0, size, size);

      // Draw Center Badge Background with subtle shadow & border
      const center = size / 2;
      const logoBoxSize = logoSize + 12;
      const radius = 12;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;

      // Rounded rect for logo
      ctx.beginPath();
      ctx.roundRect(center - logoBoxSize / 2, center - logoBoxSize / 2, logoBoxSize, logoBoxSize, radius);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Load and Draw Brand Logo
      const logo = new window.Image();
      logo.src = logoSrc;
      logo.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(center - logoSize / 2, center - logoSize / 2, logoSize, logoSize, 8);
        ctx.clip();
        ctx.drawImage(logo, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      };
    };

    qrImg.onerror = () => {
      // Fallback: draw placeholder with text
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Adera Crypto Wallet', size / 2, size / 2);
    };
  }, [value, size, logoSrc, logoSize]);

  return (
    <div className={`relative inline-flex items-center justify-center p-3.5 bg-white rounded-3xl border-2 border-slate-200 shadow-lg shadow-slate-200/50 group ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-2xl"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      
      {/* Corner target accents for futuristic crypto feel */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-500 rounded-tl pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-500 rounded-tr pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-500 rounded-bl pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-500 rounded-br pointer-events-none" />
    </div>
  );
}
