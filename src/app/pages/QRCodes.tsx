import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useProfile } from "../context/ProfileContext";
import { QRCard } from "../components/qr/QRCard";
import { CheckCircle2, Globe, QrCode as QrCodeIcon, ChevronRight, Trash2, AlertTriangle } from "lucide-react";

const STEPS = [
  { id: 1, label: "URL Slug", icon: Globe, desc: "Choose your menu web link" },
  { id: 2, label: "Generate QR", icon: QrCodeIcon, desc: "Download & print your QR" },
];

export function QRCodes() {
  const navigate = useNavigate();
  const { business, qrCode, loading } = useProfile();

  const [localBusiness, setLocalBusiness] = useState<any>(null);
  const [slug, setSlug] = useState("");
  const [hasLocalQR, setHasLocalQR] = useState(false);
  const [localQRs, setLocalQRs] = useState<any[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingQR, setIsEditingQR] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('local_business_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalBusiness(parsed);
        if (parsed.slug) setSlug(parsed.slug);
      } catch (err) { }
    }

    let arr = [];
    try { arr = JSON.parse(localStorage.getItem('local_qr_codes') || '[]'); } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    
    // Add legacy single fallback if array is empty
    const legacyQR = localStorage.getItem('local_qr_code');
    if (arr.length === 0 && legacyQR) {
        try { arr.push(JSON.parse(legacyQR)); } catch (e) {}
    }

    setLocalQRs(arr);
    setHasLocalQR(arr.length > 0 || !!legacyQR);

    if (arr.length > 0 || legacyQR || qrCode) {
      setStep(2);
    }
  }, [qrCode, isCreatingNew, isEditingQR]);

  const saveSlug = () => {
    if (!slug.trim()) {
      toast.error('URL Slug is required');
      return false;
    }
    
    // Check if another QR code already uses this slug
    if (isCreatingNew) {
       const alreadyExists = localQRs.some(qr => qr.encoded_path === `/${slug}`);
       if (alreadyExists) {
         toast.error(`The slug "${slug}" is already used by another QR code. Please choose a different one.`);
         return false;
       }
    }

    const updated = { ...localBusiness, slug };
    localStorage.setItem('local_business_profile', JSON.stringify(updated));
    setLocalBusiness(updated);
    return true;
  };

  const goTo = async (n: number) => {
    if (step === 1 && n === 2) {
      if (!saveSlug()) return;
    }
    setStep(n);
  };

  const handleDeleteQR = (slugToDelete: string) => {
    // Remove from local_qr_codes array
    let arr: any[] = [];
    try { arr = JSON.parse(localStorage.getItem('local_qr_codes') || '[]'); } catch {}
    const updated = arr.filter((qr: any) => qr.encoded_path !== `/${slugToDelete}`);
    localStorage.setItem('local_qr_codes', JSON.stringify(updated));

    // If this was the legacy single QR, remove it too
    try {
      const legacy = JSON.parse(localStorage.getItem('local_qr_code') || 'null');
      if (legacy?.encoded_path === `/${slugToDelete}`) localStorage.removeItem('local_qr_code');
    } catch {}

    // Delete the linked menu data
    localStorage.removeItem(`digitize_menu_data_${slugToDelete}`);
    localStorage.removeItem(`digitize_template_${slugToDelete}`);
    localStorage.removeItem(`digitize_qr_confirmed_${slugToDelete}`);

    // If the active menu slug was this one, clear it
    if (localStorage.getItem('digitize_active_menu_slug') === slugToDelete) {
      localStorage.removeItem('digitize_active_menu_slug');
    }

    // Update state
    setLocalQRs(updated);
    setHasLocalQR(updated.length > 0);
    setConfirmDeleteSlug(null);
    toast.success(`QR Area "${slugToDelete}" and its menu have been deleted.`);
  };

  const currentBusiness = business || localBusiness;
  const qrExists = !!qrCode || hasLocalQR;

  if ((loading && !business)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-medium animate-pulse">Syncing QR settings...</p>
      </div>
    );
  }

  if (!currentBusiness || !currentBusiness.name) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center text-center py-20">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Setup Required</h1>
        <p className="text-slate-500 max-w-sm">You must create a Business Profile before setting up your QR menu.</p>
        <button 
          onClick={() => navigate('/dashboard/profile')}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl shadow font-semibold"
        >
          Create Business Profile
        </button>
      </div>
    );
  }

  if (qrExists && !isEditingQR && !isCreatingNew) {
    const allQRs = localQRs.length > 0 ? localQRs : (qrCode ? [qrCode] : []);

    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">QR Space</h1>
            <p className="text-slate-500 mt-1">Manage your active QR codes and distinct menu links below.</p>
          </div>
          <button
            onClick={() => {
              setIsCreatingNew(true);
              setStep(1);
              setSlug('');
            }}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shrink-0 shadow-sm"
          >
            + Create New QR Area
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {allQRs.map((renderQR, idx) => {
             const manualSlug = renderQR.encoded_path ? renderQR.encoded_path.replace('/', '') : currentBusiness.slug;
             const publicUrl = renderQR.destination_url || (currentBusiness ? `${window.location.origin}/${manualSlug}` : '');

             // Read linked menu data for this slug
             let menuData: any = { items: [], categories: [] };
             let templateData: any = {};
             try { menuData = JSON.parse(localStorage.getItem(`digitize_menu_data_${manualSlug}`) || '{"items":[],"categories":[]}'); } catch {}
             try { templateData = JSON.parse(localStorage.getItem(`digitize_template_${manualSlug}`) || '{}'); } catch {}
             const menuItemCount = menuData.items?.length ?? 0;
             const hasMenu = menuItemCount > 0 || templateData.templateId;
             const templateName = templateData.templateName || templateData.templateId ? (templateData.templateName || 'Cafeteria Dark') : null;

             return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start max-w-3xl hover:border-purple-200 transition-colors">
                <div className="w-40 h-40 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all hover:scale-[1.02]">
                   {renderQR?.qr_image_url ? (
                     <img src={renderQR.qr_image_url} alt="QR" className="w-full h-full object-contain p-2" />
                   ) : (
                     <QrCodeIcon className="w-10 h-10 text-slate-300" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-xl font-bold text-slate-900">QR Area: {manualSlug}</h3>
                     <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-slate-200">Local draft</span>
                   </div>
                   <p className="text-sm font-mono text-slate-500 mb-4 mt-1 break-all">
                     URL: <a href={publicUrl} target="_blank" className="text-slate-700 hover:text-purple-600 hover:underline">{publicUrl}</a>
                   </p>

                   {/* ── Linked Menu section ── */}
                   <div className={`rounded-xl border p-4 mb-5 ${hasMenu ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                     <div className="flex items-center justify-between gap-3">
                       <div className="flex items-center gap-2.5">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${hasMenu ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                           {hasMenu ? (
                             <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                           ) : (
                             <QrCodeIcon className="w-4 h-4 text-amber-500" />
                           )}
                         </div>
                         <div>
                           <p className={`text-xs font-bold uppercase tracking-wider ${hasMenu ? 'text-emerald-700' : 'text-amber-700'}`}>
                             Linked Menu
                           </p>
                           {hasMenu ? (
                             <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                               {menuItemCount > 0 ? `${menuItemCount} item${menuItemCount !== 1 ? 's' : ''}` : 'Template set'}
                               {templateName && <span className="text-emerald-600 font-normal ml-1.5">· {templateName}</span>}
                             </p>
                           ) : (
                             <p className="text-sm text-amber-700 mt-0.5">No menu set up yet</p>
                           )}
                         </div>
                       </div>
                       <button
                         onClick={() => {
                           localStorage.setItem('digitize_active_menu_slug', manualSlug);
                           navigate('/dashboard/menu');
                         }}
                         className={`shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs transition ${hasMenu ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-900' : 'bg-amber-200 hover:bg-amber-300 text-amber-900'}`}
                       >
                         {hasMenu ? 'Edit Menu →' : 'Set Up Menu →'}
                       </button>
                     </div>
                   </div>

                   <p className="text-[11px] text-slate-400 mb-4 uppercase tracking-wider font-semibold">Last updated: {renderQR?.generated_at ? new Date(renderQR.generated_at).toLocaleString() : new Date().toLocaleString()}</p>
      
                   <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => {
                        setLocalBusiness({ ...currentBusiness, slug: manualSlug });
                        setIsEditingQR(true);
                      }} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 shadow-sm text-white rounded-xl font-bold text-sm transition">
                        Edit QR Style
                      </button>
                      <button onClick={() => window.open(publicUrl, "_blank")} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition">
                        Open Menu ↗
                      </button>
                      <button
                        onClick={() => setConfirmDeleteSlug(manualSlug)}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-xl font-bold text-sm transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                   </div>
                </div>
              </div>
             )
          })}
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">QR Menu Setup</h1>
        <p className="text-slate-500 mt-1">
          {qrExists
            ? "Your QR is ready. You can now use the Menu Maker." 
            : "Generate your permanent QR code."
          }
        </p>
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const completed = step > s.id || (s.id === 2 && qrExists);
          const active    = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => goTo(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left flex-1 min-w-0
                  ${active    ? "bg-slate-900 text-white shadow-lg"       : ""}
                  ${completed && !active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : ""}
                  ${!active && !completed ? "bg-slate-100 text-slate-400 hover:bg-slate-200" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold
                  ${active    ? "bg-white/20"     : ""}
                  ${completed && !active ? "bg-emerald-200" : ""}
                  ${!active && !completed ? "bg-slate-200"  : ""}`}
                >
                  {completed && !active ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-semibold truncate">{s.label}</p>
                  <p className={`text-[11px] truncate ${active ? "opacity-70" : "opacity-60"}`}>{s.desc}</p>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-6 min-h-[50vh]">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Choose your URL Slug</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {localBusiness?.slug 
                        ? "Your URL slug has been set and cannot be changed." 
                        : "This will be the web address people visit when they scan your QR."}
                    </p>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL Slug</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                        {window.location.origin}/
                      </span>
                      <input 
                        className="w-full px-4 py-2.5 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50 disabled:bg-slate-50" 
                        value={slug} 
                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                        placeholder="my-cafe" 
                        disabled={!isCreatingNew && !!localBusiness?.slug}
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  {isEditingQR && (
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-lg">Edit QR Style</h3>
                      <button onClick={() => setIsEditingQR(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition">
                        Cancel
                      </button>
                    </div>
                  )}
                  <QRCard localBusiness={localBusiness} onQrChange={exists => {
                    setHasLocalQR(exists);
                    if (exists) {
                      let arr = [];
                      try { arr = JSON.parse(localStorage.getItem('local_qr_codes') || '[]'); } catch (e) {}
                      if (!Array.isArray(arr)) arr = [];
                      setLocalQRs(arr);
                      setIsEditingQR(false); // return to dashboard
                      setIsCreatingNew(false);
                    }
                  }} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
             {step === 2 && qrExists ? (
               <button
                 onClick={() => navigate('/dashboard/menu')}
                 className="px-6 py-2.5 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md ml-auto flex items-center gap-2"
               >
                 Go to Menu Maker →
               </button>
             ) : (
               <>
                 <button
                   onClick={() => step > 1 && goTo(step - 1)}
                   disabled={step === 1}
                   className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-0 transition-colors"
                 >
                   ← Back
                 </button>
                 {step < 2 && (
                   <button
                     onClick={() => goTo(step + 1)}
                     disabled={step === 1 && !slug.trim()}
                     className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-md"
                   >
                     Next →
                   </button>
                 )}
               </>
             )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-1">Domain-free QR</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Your QR code encodes only a path — never a domain. Even if you switch hosting providers,
              your printed QRs work forever.
            </p>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {confirmDeleteSlug && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Delete QR Area?</h3>
                <p className="text-slate-500 text-sm">This cannot be undone.</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-800 font-semibold">Slug: <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono">{confirmDeleteSlug}</code></p>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                <li className="flex items-center gap-1.5">• QR code image will be removed</li>
                <li className="flex items-center gap-1.5">• All linked menu items will be deleted</li>
                <li className="flex items-center gap-1.5">• Template settings will be deleted</li>
                <li className="flex items-center gap-1.5">• The public URL will stop working</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteSlug(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQR(confirmDeleteSlug)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm text-white transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}