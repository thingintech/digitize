import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useBusiness } from "../context/BusinessContext";
import { QRCard } from "../components/qr/QRCard";
import { CheckCircle2, Globe, QrCode as QrCodeIcon, ChevronRight, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { supabase } from "../../utils/supabase";

const STEPS = [
  { id: 1, label: "URL Slug", icon: Globe, desc: "Choose your menu web link" },
  { id: 2, label: "Generate QR", icon: QrCodeIcon, desc: "Download & print your QR" },
];

export function QRCodes() {
  const navigate = useNavigate();
  const { business, qrCodes, isReady, isLoading, refetch } = useBusiness();

  const [slug, setSlug] = useState(business?.slug || "");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync slug with business
  React.useEffect(() => {
    if (business?.slug) {
      setSlug(business.slug);
      setStep(2);
    }
  }, [business?.slug]);

  const goTo = async (n: number) => {
    if (step === 1 && n === 2) {
      if (!slug.trim()) {
        toast.error('URL Slug is required');
        return;
      }
    }
    setStep(n);
  };

  const handleDeleteQR = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refetch();
      setConfirmDeleteId(null);
      toast.success(`QR Area deleted successfully.`);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete QR area');
    }
  };

  if (!isReady || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-medium animate-pulse">Syncing QR settings...</p>
      </div>
    );
  }

  if (!business || !business.name) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center text-center py-20">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Setup Required</h1>
        <p className="text-slate-500 max-w-sm">You must create a Business Profile before setting up your QR menu.</p>
        <button 
          onClick={() => navigate('/dashboard/profile')}
          className="px-6 py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl shadow font-semibold"
        >
          Create Business Profile
        </button>
      </div>
    );
  }

  // Dashboard view if QR exists
  if (qrCodes.length > 0 && !isCreatingNew) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">QR Space</h1>
            <p className="text-slate-500 mt-1">Manage your active QR codes and distinct menu links below.</p>
          </div>
          <button
            onClick={() => {
              setIsCreatingNew(true);
              setStep(1);
            }}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shrink-0 shadow-sm"
          >
            + Create New QR Area
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {qrCodes.map((qr) => {
             const publicUrl = `${window.location.origin}/${qr.code}`;

             return (
              <div key={qr.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start max-w-3xl hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <div className="w-40 h-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all hover:scale-[1.02]">
                   {qr?.qr_image_url ? (
                     <img src={qr.qr_image_url} alt="QR" className="w-full h-full object-contain p-2" />
                   ) : (
                     <QrCodeIcon className="w-10 h-10 text-slate-300" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">QR Area: {qr.code}</h3>
                     <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">Active</span>
                   </div>
                   <p className="text-sm font-mono text-slate-500 mb-4 mt-1 break-all">
                     URL: <a href={publicUrl} target="_blank" className="text-slate-700 dark:text-slate-300 hover:text-purple-600 hover:underline">{publicUrl}</a>
                   </p>

                   {/* ── Linked Menu section ── */}
                   <div className="rounded-xl border p-4 mb-5 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                     <div className="flex items-center justify-between gap-3">
                       <div className="flex items-center gap-2.5">
                         <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                         </div>
                         <div>
                           <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                             Linked Menu
                           </p>
                           <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mt-0.5">
                             Standard Menu
                           </p>
                         </div>
                       </div>
                       <button
                         onClick={() => {
                           navigate('/dashboard/menu');
                         }}
                         className="shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs transition bg-purple-200 dark:bg-purple-900/40 hover:bg-purple-300 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-100"
                       >
                         Edit Menu →
                       </button>
                     </div>
                   </div>

                   <p className="text-[11px] text-slate-400 mb-4 uppercase tracking-wider font-semibold">Last updated: {new Date(qr.created_at).toLocaleString()}</p>
      
                   <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => {
                        setIsCreatingNew(true);
                        setStep(2);
                      }} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 shadow-sm text-white rounded-xl font-bold text-sm transition">
                        Edit QR Style
                      </button>
                      <button onClick={() => window.open(publicUrl, "_blank")} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition flex items-center gap-1.5">
                        <ExternalLink className="w-4 h-4" /> Open Menu
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(qr.id)}
                        className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold text-sm transition flex items-center gap-1.5"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">QR Menu Setup</h1>
          <p className="text-slate-500 mt-1">
            Generate your permanent QR code.
          </p>
        </div>
        {qrCodes.length > 0 && (
          <button onClick={() => setIsCreatingNew(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
            Cancel
          </button>
        )}
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const completed = step > s.id;
          const active    = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => goTo(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left flex-1 min-w-0
                  ${active    ? "bg-slate-900 dark:bg-purple-600 text-white shadow-lg" : ""}
                  ${completed && !active ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100" : ""}
                  ${!active && !completed ? "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 hover:bg-slate-200" : ""}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold
                  ${active    ? "bg-white/20" : ""}
                  ${completed && !active ? "bg-emerald-200 dark:bg-emerald-800" : ""}
                  ${!active && !completed ? "bg-slate-200 dark:bg-slate-800" : ""}`}
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-6 min-h-[300px]">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Choose your URL Slug</h3>
                    <p className="text-sm text-slate-500 mb-6">
                      This will be the web address people visit when they scan your QR.
                    </p>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL Slug</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
                        {window.location.origin}/
                      </span>
                      <input 
                        className="w-full px-4 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50 disabled:bg-slate-50 dark:text-slate-100" 
                        value={slug} 
                        onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                        placeholder="my-cafe" 
                        disabled={true} // For now, we use the business slug
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">Slug is currently tied to your business profile name.</p>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <QRCard onQrChange={() => {
                    refetch();
                    setIsCreatingNew(false);
                  }} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
             <button
               onClick={() => step > 1 && setStep(step - 1)}
               disabled={step === 1}
               className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-0 transition-colors"
             >
               ← Back
             </button>
             {step < 2 && (
               <button
                 onClick={() => setStep(2)}
                 disabled={!slug.trim()}
                 className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-purple-600 text-white hover:bg-slate-800 dark:hover:bg-purple-700 disabled:opacity-40 transition-colors shadow-md"
               >
                 Next →
               </button>
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
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Delete QR Area?</h3>
                <p className="text-slate-500 text-sm">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQR(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm text-white transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}