import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useProfile } from "../context/ProfileContext";
import { ProfileForm } from "../components/qr/ProfileForm";
import { MenuUploader } from "../components/qr/MenuUploader";
import { QRCard } from "../components/qr/QRCard";
import { CheckCircle2, User, FileUp, QrCode as QrCodeIcon, ChevronRight } from "lucide-react";

const STEPS = [
  { id: 1, label: "Business Profile", icon: User,        desc: "Fill in your business details" },
  { id: 2, label: "Upload Menu",      icon: FileUp,      desc: "PDF or image of your menu"   },
  { id: 3, label: "Generate QR",      icon: QrCodeIcon,  desc: "Download & print your QR"    },
];

export function QRCodes() {
  const { business, menus, qrCode, updateProfile } = useProfile();

  // Resume from last saved onboarding step
  const [step, setStep] = useState<number>(business?.onboarding_step ?? 1);

  useEffect(() => {
    if (business?.onboarding_step) {
      setStep(business.onboarding_step);
    }
  }, [business?.onboarding_step]);

  const goTo = async (n: number) => {
    setStep(n);
    // Persist progress so user resumes here on next login
    try { await updateProfile({ onboarding_step: n }); } catch { /* non-fatal */ }
  };

  const canAdvance = (from: number) => {
    if (from === 1) return !!business?.name;
    if (from === 2) return menus.length > 0;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">QR Menu Setup</h1>
        <p className="text-slate-500 mt-1">Set up your digital menu and generate a permanent QR code.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const completed = step > s.id || (s.id === 3 && !!qrCode);
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

      {/* Step content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <ProfileForm />}
              {step === 2 && <MenuUploader />}
              {step === 3 && <QRCard />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => step > 1 && goTo(step - 1)}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-0 transition-colors"
            >
              ← Back
            </button>
            {step < 3 && (
              <button
                onClick={() => canAdvance(step) && goTo(step + 1)}
                disabled={!canAdvance(step)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-md"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Sidebar info */}
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

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-800 text-sm">Checklist</h4>
            {[
              { done: !!business?.name,      label: "Business profile filled" },
              { done: !!business?.is_published, label: "Menu page is public"   },
              { done: menus.length > 0,      label: "Menu file uploaded"       },
              { done: !!qrCode,              label: "QR code generated"        },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm ${item.done ? "text-emerald-700" : "text-slate-400"}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? "text-emerald-500" : "text-slate-300"}`} />
                {item.label}
              </div>
            ))}
          </div>

          {business?.slug && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
              <p className="text-slate-500 mb-1 font-semibold uppercase tracking-wider">Your menu URL</p>
              <p className="font-mono text-slate-800 break-all">{window.location.origin}/{business.slug}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
