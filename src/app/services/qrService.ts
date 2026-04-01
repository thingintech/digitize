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
  } = options;

  if (!encodedPath.startsWith('/')) {
    throw new Error(`encodedPath must start with "/". Received: "${encodedPath}"`);
  }

  // Render QR to a canvas element (off-screen)
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, encodedPath, {
    width,
    margin,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
    errorCorrectionLevel: 'H', // High = more robust for print
  });

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
