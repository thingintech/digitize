/**
 * qrService.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║            FUTURE-PROOF QR DOMAIN ARCHITECTURE              ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  ❌ Naive approach (breaks on domain change):               ║
 * ║     QR encodes → "https://myapp.com/restaurant-joe"         ║
 * ║     Domain changes → QR breaks → must reprint               ║
 * ║                                                              ║
 * ║  ✅ Our approach (permanent QR):                            ║
 * ║     QR encodes → "/restaurant-joe"  (path ONLY)             ║
 * ║     Actual domain is read from window.location.origin        ║
 * ║     at runtime on the landing page.                          ║
 * ║                                                              ║
 * ║  Storage strategy:                                           ║
 * ║     File path = qr-codes/{business_id}.png                  ║
 * ║     Regenerating OVERWRITES the same path → same public URL  ║
 * ║     → No reprint needed even after design changes.           ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import QRCode from 'qrcode';

export interface QROptions {
  foregroundColor?: string;   // defaults to '#0f172a' (slate-900)
  backgroundColor?: string;   // defaults to '#ffffff'
  width?: number;             // pixels, defaults to 512
  margin?: number;            // quiet zone modules, defaults to 2
  style?: 'square' | 'rounded' | 'dots'; // QR code style
  logoUrl?: string;           // URL of logo to embed
  logoSize?: number;          // Size of logo in pixels
}

export interface QRGenerateResult {
  blob: Blob;
  dataUrl: string;
}

/**
 * Generates a QR code PNG that encodes ONLY the path (e.g. "/my-cafe").
 *
 * The domain is intentionally excluded so the QR image is
 * permanently valid regardless of future domain migrations.
 *
 * @param encodedPath - The path to encode, e.g. "/my-cafe". Must start with "/".
 * @param options     - Visual customization options.
 * @returns           Blob (for Storage upload) + data URL (for preview).
 */
export async function generateQRImage(
  encodedPath: string,
  options: QROptions = {},
): Promise<QRGenerateResult> {
  const {
    foregroundColor = '#0f172a',
    backgroundColor = '#ffffff',
    width = 512,
    margin = 2,
    style = 'square',
    logoUrl,
    logoSize = 40,
  } = options;

  if (!encodedPath.startsWith('/')) {
    throw new Error(`encodedPath must start with "/". Received: "${encodedPath}"`);
  }

  // Render QR to a canvas element (off-screen)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = width;
  canvas.height = width;

  await QRCode.toCanvas(canvas, encodedPath, {
    width,
    margin,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
    errorCorrectionLevel: 'H', // High = more robust for print
  });

  // Apply style modifications
  if (style !== 'square') {
    const imageData = ctx.getImageData(0, 0, width, width);
    const data = imageData.data;

    // Create a new canvas for styled QR
    const styledCanvas = document.createElement('canvas');
    const styledCtx = styledCanvas.getContext('2d')!;
    styledCanvas.width = width;
    styledCanvas.height = width;

    // Fill background
    styledCtx.fillStyle = backgroundColor;
    styledCtx.fillRect(0, 0, width, width);

    // Draw styled modules
    const moduleSize = (width - 2 * margin * 8) / 29; // QR code is 29x29 modules
    const startX = margin * 8;
    const startY = margin * 8;

    for (let y = 0; y < 29; y++) {
      for (let x = 0; x < 29; x++) {
        const moduleX = startX + x * moduleSize;
        const moduleY = startY + y * moduleSize;

        // Check if this module should be dark
        const pixelX = Math.floor(moduleX + moduleSize / 2);
        const pixelY = Math.floor(moduleY + moduleSize / 2);
        const pixelIndex = (pixelY * width + pixelX) * 4;
        const isDark = data[pixelIndex] < 128; // Dark pixel threshold

        if (isDark) {
          styledCtx.fillStyle = foregroundColor;

          if (style === 'dots') {
            // Draw circles for dots style
            styledCtx.beginPath();
            styledCtx.arc(moduleX + moduleSize / 2, moduleY + moduleSize / 2, moduleSize / 2 - 1, 0, 2 * Math.PI);
            styledCtx.fill();
          } else if (style === 'rounded') {
            // Draw rounded rectangles
            const radius = Math.min(moduleSize / 4, 2);
            styledCtx.beginPath();
            styledCtx.roundRect(moduleX + 1, moduleY + 1, moduleSize - 2, moduleSize - 2, radius);
            styledCtx.fill();
          }
        }
      }
    }

    // Copy styled canvas back to main canvas
    ctx.clearRect(0, 0, width, width);
    ctx.drawImage(styledCanvas, 0, 0);
  }

  // Add logo if provided
  if (logoUrl) {
    try {
      const logoImg = new Image();
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoUrl;
      });

      const logoX = (width - logoSize) / 2;
      const logoY = (width - logoSize) / 2;

      // Create a white background for logo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

      // Draw logo
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.warn('Failed to load logo:', error);
    }
  }

  // Export canvas → PNG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => {
      if (b) resolve(b);
      else reject(new Error('canvas.toBlob returned null'));
    }, 'image/png');
  });

  const dataUrl = canvas.toDataURL('image/png');

  return { blob, dataUrl };
}

/**
 * Composites a decorative frame around an existing QR code data URL.
 * Returns a new data URL with the frame baked in.
 */
export async function applyFrameToQR(qrDataUrl: string, frameId: string): Promise<string> {
  if (!frameId || frameId === 'none') return qrDataUrl;

  return new Promise<string>((resolve) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrW = qrImg.naturalWidth || 512;
      const qrH = qrImg.naturalHeight || 512;

      const border = Math.round(qrW * 0.035);
      const labelH = Math.round(qrW * 0.17);
      const isTop = frameId === 'f5'; // label on top for frame 5

      const canvasW = qrW + border * 2;
      const canvasH = qrH + border * 2 + labelH;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;

      // ── colours per frame ──
      const darkFrames = ['f2','f3','f4','f5','f6','f7','f9','f10'];
      const isDark = darkFrames.includes(frameId);
      const bgWhite = '#ffffff';
      const borderColor = isDark ? '#0f172a' : '#e2e8f0';
      const labelBg = isDark ? '#0f172a' : '#f1f5f9';
      const labelFg = isDark ? '#ffffff' : '#0f172a';

      // White background
      ctx.fillStyle = bgWhite;
      ctx.fillRect(0, 0, canvasW, canvasH);

      const qrTop = isTop ? labelH : border;
      const labelTop = isTop ? 0 : qrH + border * 2;

      // Draw QR image
      ctx.drawImage(qrImg, border, qrTop, qrW, qrH);

      // Label bar
      ctx.fillStyle = labelBg;
      ctx.fillRect(0, labelTop, canvasW, labelH);

      // Label text
      const fontSize = Math.max(16, Math.round(labelH * 0.4));
      ctx.fillStyle = labelFg;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Scan me!', canvasW / 2, labelTop + labelH / 2);

      // Outer border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = border;
      ctx.strokeRect(border / 2, border / 2, canvasW - border, canvasH - border);

      resolve(canvas.toDataURL('image/png'));
    };
    qrImg.onerror = () => resolve(qrDataUrl); // fallback — don't break
    qrImg.src = qrDataUrl;
  });
}


/**
 * Constructs the full target URL at runtime by reading the current domain.
 *
 * THIS FUNCTION IS NEVER CALLED DURING QR GENERATION.
 * It is used only on the /{slug} landing page to display the link
 * and track analytics — never baked into the QR PNG itself.
 *
 * @param slug - The business slug.
 * @returns Full URL using the current domain, e.g. "https://myapp.com/my-cafe"
 */
export function resolveQRTarget(slug: string): string {
  // window.location.origin always reflects the actual current domain.
  // If domain changes from myapp.com → newapp.com, this auto-updates.
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://localhost:5173'; // fallback for SSR / tests

  return `${base}/${slug}`;
}

/**
 * Reads the subdomain part from the current host.
 *
 * Used on the public /{slug} page to detect if a user
 * arrived via "my-cafe.myapp.com" style subdomain.
 *
 * Falls back to null for local dev (localhost / no subdomain).
 *
 * @example
 *   // host = "my-cafe.myapp.com"  → returns "my-cafe"
 *   // host = "myapp.com"          → returns null
 *   // host = "localhost:5173"     → returns null
 */
export function resolveSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.host;
  const parts = host.split('.');
  // 3+ parts = subdomain present (e.g. my-cafe.myapp.com)
  if (parts.length >= 3) return parts[0];
  return null;
}
