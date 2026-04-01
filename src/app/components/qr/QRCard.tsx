import React, { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { toast } from "sonner";
import {
  Download, Copy, RefreshCw, Loader2, QrCode,
  CheckCircle2, ExternalLink, Zap
} from "lucide-react";

export function QRCard() {
  const { business, qrCode, generateQR } = useProfile();
  const [generating, setGenerating] = useState(false);
  const [fgColor, setFgColor] = useState(qrCode?.foreground_color ?? "#0f172a");
  const [bgColor, setBgColor] = useState(qrCode?.background_color ?? "#ffffff");

  // The QR encodes ONLY "/{slug}" — the domain is NEVER in the image.
  // Even after a domain migration the printed QR stays valid forever.
  const encodedPath = business ? `/${business.slug}` : "";
  const publicUrl   = business
    ? `${window.location.origin}/${business.slug}`
    : "";

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateQR({ foregroundColor: fgColor, backgroundColor: bgColor });
      toast.success("QR code generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate QR");
    } finally {
      setGenerating(false);
    }
  };

  const downloadPNG = async () => {
    if (!qrCode?.qr_image_url) return;
    const res  = await fetch(qrCode.qr_image_url);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${business?.slug ?? "qr"}-menu-qr.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("QR code downloaded!");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied to clipboard!");
  };

  const presetColors = ["#0f172a","#7c3aed","#0369a1","#15803d","#b91c1c","#000000"];

  return (
    <div className="space-y-6">
      {/* QR Preview */}
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-slate-50 to-purple-50 rounded-2xl border border-slate-200 min-h-[300px] justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl" />

        {qrCode?.qr_image_url ? (
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-medium text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> QR Generated — Safe to Print
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
              <img
                src={qrCode.qr_image_url}
                alt="QR Code"
                className="w-52 h-52 object-contain"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                Encodes: <span className="text-purple-600 font-bold">{encodedPath}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Domain-free — works on any hosting platform, forever
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center z-10">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">No QR code yet</p>
              <p className="text-sm text-slate-400 mt-1">Customize colors below and generate your QR</p>
            </div>
          </div>
        )}
      </div>

      {/* Color customization */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            QR Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {presetColors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFgColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${fgColor === c ? "border-purple-600 scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={fgColor}
              onChange={e => setFgColor(e.target.value)}
              className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer p-0.5"
              title="Custom color"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Background
          </label>
          <div className="flex items-center gap-2">
            {["#ffffff","#f8fafc","#fef9f0","#f0fdf4"].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setBgColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === c ? "border-purple-600 scale-110 shadow-md" : "border-slate-300 hover:scale-105"}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer p-0.5"
              title="Custom background"
            />
          </div>
        </div>
      </div>

      {/* Menu link */}
      {business && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <span className="text-xs font-mono text-slate-600 truncate flex-1">{publicUrl}</span>
          <button onClick={copyLink} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <a href={publicUrl} target="_blank" rel="noopener" className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating || !business}
          className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
        >
          {generating
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            : qrCode
              ? <><RefreshCw className="w-5 h-5" /> Regenerate QR</>
              : <><Zap className="w-5 h-5" /> Generate QR Code</>}
        </button>
        {qrCode?.qr_image_url && (
          <button
            onClick={downloadPNG}
            className="flex-1 h-12 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" /> Download PNG
          </button>
        )}
      </div>

      {/* Architecture note */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
        <strong>Future-proof:</strong> This QR image encodes only the path{" "}
        <code className="bg-amber-100 px-1 rounded font-mono">{encodedPath}</code> — never the
        full domain. If you ever migrate to a new domain, the printed QR codes your customers
        already have will continue working without any reprinting.
      </div>
    </div>
  );
}
