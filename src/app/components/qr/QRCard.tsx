import React, { useState, useEffect } from "react";
import { useBusiness } from "../../context/BusinessContext";
import { toast } from "sonner";
import {
  Download, Copy, RefreshCw, Loader2, QrCode,
  CheckCircle2, ExternalLink, Sparkles,
  ChevronUp, ChevronDown, Ban
} from "lucide-react";

export function QRCard({ onQrChange }: { onQrChange?: (exists: boolean) => void }) {
  const { business, qrCodes, generateQR } = useBusiness();
  const [generating, setGenerating] = useState(false);
  
  // Find the most recent QR code for this business (based on code matching slug)
  const qrCode = qrCodes.find(q => q.code === business?.slug);

  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(200);
  const [qrStyle, setQrStyle] = useState<'square' | 'rounded' | 'dots'>('square');
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(40);
  const [qrFrame, setQrFrame] = useState('none');
  const [isFrameOpen, setIsFrameOpen] = useState(true);

  // Sync state with existing QR code if it exists
  useEffect(() => {
    if (qrCode) {
      setFgColor(qrCode.foreground_color || "#0f172a");
      setBgColor(qrCode.background_color || "#ffffff");
      setQrSize(qrCode.qr_size || 200);
      setQrStyle((qrCode.qr_style as 'square' | 'rounded' | 'dots') || 'square');
      setLogoUrl(qrCode.logo_url || "");
      setLogoSize(qrCode.logo_size || 40);
      setQrFrame(qrCode.qr_frame || 'none');
    }
  }, [qrCode]);

  const encodedPath = business ? `/${business.slug}` : "";
  const publicUrl   = business
    ? `${window.location.origin}/${business.slug}`
    : "";

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateQR({
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        size: qrSize,
        style: qrStyle,
        logoUrl: logoUrl,
        logoSize: logoSize,
        frame: qrFrame
      });
      if (onQrChange) onQrChange(true);
      toast.success("QR code generated and saved!");
    } catch (err: unknown) {
      // Error handled by context
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

  const qrFrames = [
    {
      id: 'f1',
      render: () => (
        <div className="flex flex-col items-center">
          <div className="p-[3px] bg-slate-100 dark:bg-slate-800 rounded-[5px] border border-slate-200 dark:border-slate-700">
            <QrCode className="w-[38px] h-[38px] text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
          </div>
          <div className="text-[10px] tracking-tight font-bold mt-1 text-slate-800 dark:text-slate-200 transition-colors group-hover:text-purple-600">Scan me!</div>
        </div>
      )
    },
    {
      id: 'f2',
      render: () => (
        <div className="w-[58px] border-[1.5px] border-slate-800 dark:border-slate-200 rounded-lg overflow-hidden flex flex-col pt-1.5 bg-white dark:bg-slate-900 shadow-sm mt-1">
          <div className="mx-auto bg-slate-100 dark:bg-slate-800 p-0.5 rounded-sm">
             <QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
          </div>
          <div className="w-full border-t-[1.5px] border-slate-800 dark:border-slate-200 mt-1">
            <div className="text-[9px] font-bold text-center py-0.5 text-slate-800 dark:text-slate-200 group-hover:text-purple-600 transition-colors">Scan me!</div>
          </div>
        </div>
      )
    },
    {
      id: 'f3',
      render: () => (
        <div className="w-[58px] border-[3px] border-slate-900 dark:border-slate-100 rounded-xl overflow-hidden flex flex-col pt-1 bg-white dark:bg-slate-900 shadow-sm mt-1">
          <div className="mx-auto rounded-sm bg-white dark:bg-slate-900 p-0.5">
             <QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
          </div>
          <div className="w-full bg-slate-900 dark:bg-slate-100 pt-0.5 pb-1">
            <div className="text-[9px] font-bold text-center py-[2px] text-white dark:text-slate-900">Scan me!</div>
          </div>
        </div>
      )
    },
    {
      id: 'f4',
      render: () => (
        <div className="w-[58px] rounded-t-[10px] rounded-b-[10px] overflow-hidden flex flex-col border-[1px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-1">
          <div className="p-1 px-[5px] flex justify-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <QrCode className="w-9 h-9 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
          </div>
          <div className="w-full bg-slate-900 dark:bg-slate-100 flex justify-center py-[4px]">
             <div className="text-[8px] leading-none font-bold text-white dark:text-slate-900 rounded-full bg-slate-900 dark:bg-slate-100 px-[6px]">Scan me!</div>
          </div>
        </div>
      )
    },
    {
      id: 'f5',
      render: () => (
        <div className="w-[58px] border-[2.5px] border-slate-900 dark:border-slate-100 rounded-xl overflow-hidden flex flex-col shadow-sm mt-1">
          <div className="bg-slate-900 dark:bg-slate-100 w-full flex justify-center pt-1 pb-1">
            <div className="text-[9px] font-bold text-white dark:text-slate-900 leading-none">Scan me!</div>
          </div>
          <div className="bg-white dark:bg-slate-900 flex justify-center py-1">
            <QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
          </div>
        </div>
      )
    },
    {
      id: 'f6',
      render: () => (
        <div className="relative flex flex-col items-center mt-[10px]">
           <div className="w-[56px] border-[1.5px] border-slate-900 dark:border-slate-100 rounded-xl p-[2px] bg-white dark:bg-slate-900 pb-[14px]">
             <div className="flex justify-center mt-1"><QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} /></div>
           </div>
           <div className="absolute bottom-[-6px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[8px] font-bold px-[6px] py-[3px]" style={{borderRadius: '8px 8px 8px 8px'}}>Scan me!</div>
           <div className="absolute bottom-[8px] border-t-4 border-t-slate-900 dark:border-t-slate-100 border-x-4 border-x-transparent w-0 h-0"></div>
        </div>
      )
    },
    {
      id: 'f7',
      render: () => (
        <div className="w-[54px] border-[1.5px] border-slate-800 dark:border-slate-200 rounded-xl overflow-hidden flex flex-col pt-1.5 bg-white dark:bg-slate-900 relative mt-1">
          <div className="mx-auto rounded bg-white dark:bg-slate-900 p-0.5">
             <QrCode className="w-7 h-7 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />
          </div>
          <div className="w-full bg-slate-800 dark:bg-slate-200 mt-[5px] pb-[6px] relative z-10 flex flex-col items-center">
            <div className="text-[7px] font-bold leading-none text-white dark:text-slate-900 tracking-widest mt-1">SCAN ME</div>
          </div>
          <div className="absolute top-0 right-0 w-[14px] h-[14px] bg-slate-800 dark:bg-slate-200 border-b-[1.5px] border-l-[1.5px] border-white dark:border-slate-900" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
        </div>
      )
    },
    {
      id: 'f8',
      render: () => (
        <div className="relative flex flex-col items-center mt-1">
           <div className="w-[56px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] p-1.5 pb-2 shadow-sm relative">
             <div className="bg-white dark:bg-slate-900 p-1 rounded-[5px] border border-slate-100 dark:border-slate-800 flex justify-center shadow-sm">
               <QrCode className="w-7 h-7 text-slate-700 dark:text-slate-200" strokeWidth={1.5} />
             </div>
             <div className="text-[8px] font-bold text-slate-800 dark:text-slate-200 mt-2 text-center ml-2 italic group-hover:text-purple-600">Scan me!</div>
           </div>
        </div>
      )
    },
    {
      id: 'f9',
      render: () => (
        <div className="relative mt-2">
           <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[24px] h-[7px] border-t-2 border-r-2 border-l-2 border-slate-800 dark:border-slate-200 rounded-t-[4px] z-0"></div>
           <div className="w-[56px] bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-slate-200 rounded-lg shadow-sm relative pt-[10px] pb-1 z-10 flex flex-col items-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
             <div className="bg-white dark:bg-slate-900 rounded-md p-0.5 border border-slate-100 dark:border-slate-800"><QrCode className="w-7 h-7 text-slate-800 dark:text-slate-200" strokeWidth={1.5} /></div>
             <div className="w-full bg-slate-800 dark:bg-slate-200 mt-1 flex justify-center py-[2px]">
               <div className="text-[7.5px] font-bold text-white dark:text-slate-900 leading-none">Scan me!</div>
             </div>
           </div>
        </div>
      )
    },
    {
      id: 'f10',
      render: () => (
        <div className="relative mt-1">
           <div className="w-[56px] bg-slate-900 dark:bg-slate-100 rounded-t-[10px] pt-[6px] pb-[4px] px-1.5 shadow-sm">
             <div className="flex justify-center bg-white dark:bg-slate-900 rounded-md p-[3px]"><QrCode className="w-8 h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} /></div>
           </div>
           <div className="w-[62px] -ml-[3px] bg-slate-900 dark:bg-slate-100 h-4 rounded-b-[4px] flex items-center justify-center shadow-sm">
              <div className="text-[8px] font-bold text-white dark:text-slate-900 tracking-wide">Scan me!</div>
           </div>
        </div>
      )
    }
  ];

  // ── CSS frame overlay — shows immediately on selection ──
  const FrameWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!qrFrame || qrFrame === 'none') return <>{children}</>;
    const darkFrames = ['f2','f3','f4','f5','f6','f7','f9','f10'];
    const isDark = darkFrames.includes(qrFrame);
    const isTop = qrFrame === 'f5';
    const borderColor = isDark ? '#0f172a' : '#cbd5e1';
    const labelBg = isDark ? '#0f172a' : '#f1f5f9';
    const labelFg = isDark ? '#ffffff' : '#0f172a';
    const label = (
      <div style={{ backgroundColor: labelBg, color: labelFg, textAlign: 'center', padding: '10px 8px', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Scan me!
      </div>
    );
    return (
      <div style={{ border: `3px solid ${borderColor}`, borderRadius: 12, overflow: 'hidden', display: 'inline-flex', flexDirection: isTop ? 'column-reverse' : 'column', background: '#fff' }}>
        {children}
        {label}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* QR Preview */}
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900/50 dark:to-purple-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[300px] justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-3xl" />

        {qrCode?.qr_image_url ? (
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full font-medium text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> QR Generated — Safe to Print
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => window.open(publicUrl, "_blank")}>
              <FrameWrapper>
                <img
                  src={qrCode.qr_image_url}
                  alt="QR Code"
                  className="w-52 h-52 object-contain hover:scale-105 transition-transform block"
                />
              </FrameWrapper>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 inline-block">
                Encodes: <span className="text-purple-600 dark:text-purple-400 font-bold">{encodedPath}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Domain-free — works on any hosting platform, forever
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-lg border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-purple-500" />
              </div>
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900 dark:text-white">Generate Your QR Code</p>
              <p className="text-sm text-slate-500 mt-1">Choose colors and customize your unique QR</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-3.5 h-3.5" />
              Domain-free & permanent
            </div>
          </div>
        )}
      </div>

      {/* QR code frame accordion */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div 
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors select-none group"
          onClick={() => setIsFrameOpen(!isFrameOpen)}
        >
          <div>
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">QR code frame</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Frames improve your QR code visibility, leading to more scans</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
            {isFrameOpen ? <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />}
          </div>
        </div>
        
        {isFrameOpen && (
          <div className="px-5 pb-5 pt-1">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-5" />
            <div className="grid grid-cols-5 gap-2">
              {/* Frame none */}
              <button
                type="button"
                onClick={() => setQrFrame('none')}
                className={`group w-full aspect-square rounded-[14px] border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                  qrFrame === 'none' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-[0_0_0_2px_rgba(124,58,237,0.1)]' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <Ban className={`w-7 h-7 stroke-[1.5] transition-colors ${qrFrame === 'none' ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              </button>
              
              {qrFrames.map(frame => (
                <button
                  type="button"
                  key={frame.id}
                  onClick={() => setQrFrame(frame.id)}
                  className={`group w-full aspect-square rounded-[14px] border-[1.5px] flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                    qrFrame === frame.id 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-[0_0_0_2px_rgba(124,58,237,0.1)]' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="scale-[0.72] origin-center">
                    {frame.render()}
                  </div>
                </button>
              ))}
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
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer p-0.5"
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
                className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === c ? "border-purple-600 scale-110 shadow-md" : "border-slate-300 dark:border-slate-700 hover:scale-105"}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer p-0.5"
              title="Custom background"
            />
          </div>
        </div>
      </div>

      {/* Advanced Design Options */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Advanced Design</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Size
            </label>
            <select
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={150}>Small (150px)</option>
              <option value={200}>Medium (200px)</option>
              <option value={250}>Large (250px)</option>
              <option value={300}>Extra Large (300px)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Style
            </label>
            <select
              value={qrStyle}
              onChange={(e) => setQrStyle(e.target.value as 'square' | 'rounded' | 'dots')}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="dots">Dots</option>
            </select>
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Logo (Optional)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setLogoUrl(url);
                }
              }}
              className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-400 hover:file:bg-purple-100 dark:hover:file:bg-purple-900/50"
            />
            {logoUrl && (
              <button
                onClick={() => setLogoUrl("")}
                className="px-3 py-2 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {logoUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img src={logoUrl} alt="Logo preview" className="w-8 h-8 rounded border dark:border-slate-800" />
              <span className="text-xs text-slate-500">Logo will be centered in QR code</span>
            </div>
          )}
        </div>

        {logoUrl && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Logo Size
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Small</span>
              <span>{logoSize}px</span>
              <span>Large</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu link */}
      {business && (
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate flex-1">{publicUrl}</span>
          <button onClick={copyLink} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <a href={publicUrl} target="_blank" rel="noopener" className="shrink-0 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating || !business}
          className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          {generating
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Setting up...</>
            : qrCode
              ? <><RefreshCw className="w-5 h-5" /> Regenerate QR</>
              : <><Sparkles className="w-5 h-5" /> Start Setup</>}
        </button>
        {qrCode?.qr_image_url && (
          <button
            onClick={downloadPNG}
            className="flex-1 h-12 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
          >
            <Download className="w-5 h-5" /> Download PNG
          </button>
        )}
      </div>

      {/* Architecture note */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
        <strong>Future-proof:</strong> This QR image encodes only the path{" "}
        <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded font-mono">{encodedPath}</code> — never the
        full domain. If you ever migrate to a new domain, the printed QR codes your customers
        already have will continue working without any reprinting.
      </div>
    </div>
  );
}
