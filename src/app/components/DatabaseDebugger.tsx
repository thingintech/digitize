import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, X, ChevronUp, ChevronDown, CheckCircle2, User, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

export function DatabaseDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();
  const { business, menus, qrCode, loading: profileLoading, isReady, error, refreshProfile } = useProfile();

  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-80 max-h-[600px] overflow-hidden pointer-events-auto flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
               <div className="flex items-center gap-2">
                 <Database className="w-4 h-4 text-purple-400" />
                 <span className="text-sm font-bold text-slate-100 italic tracking-tight">DATA WATCHER</span>
               </div>
               <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
               >
                 <X className="w-4 h-4 text-slate-400" />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] font-mono scrollbar-hide">
              
              {/* ERROR ALERT */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
                   <span className="font-bold uppercase block mb-1">Critical Error:</span>
                   {error}
                </div>
              )}

              {/* STATUS */}
              <section className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">LIFECYCLE</div>
                <div className="grid grid-cols-2 gap-2">
                  <StatusPill label="Ready" active={isReady} />
                  <StatusPill label="Loading" active={profileLoading || authLoading} />
                </div>
                <button 
                  onClick={() => refreshProfile()}
                  className="w-full py-1.5 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors uppercase text-[10px] font-bold"
                >
                  Force Data Sync
                </button>
              </section>

              {/* AUTH */}
              <section className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
                  <User className="w-3 h-3" /> Identity
                </div>
                <DataBox data={{ 
                  email: user?.email,
                  id: user?.id ? user.id.slice(0, 8) + '...' : 'Guest',
                  profile_name: profile?.full_name 
                }} />
              </section>

              {/* BUSINESS */}
              <section className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Business Context
                </div>
                <DataBox data={{ 
                  business_name: business?.name || 'NOT FOUND',
                  slug: business?.slug,
                  id: business?.id ? business.id.slice(0, 8) + '...' : 'NULL'
                }} />
              </section>

              {/* ASSETS */}
              <section className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Assets</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 px-1 italic">
                    <span>Menus</span>
                    <span>{menus.length} Loaded</span>
                  </div>
                  <div className="flex justify-between text-slate-400 px-1 italic">
                    <span>Active QR</span>
                    <span>{qrCode ? 'Generated' : 'Missing'}</span>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto flex items-center gap-2 py-3 px-6 rounded-full shadow-lg transition-all border ${
          isOpen 
          ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-purple-500/10' 
          : 'bg-white border-slate-200 text-slate-900 hover:border-purple-300'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-amber-500'} ${isReady ? 'animate-pulse' : ''}`} />
        <span className="text-[11px] font-bold tracking-widest uppercase">Data Layer</span>
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </motion.button>
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
      active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    }`}>
      {active ? <CheckCircle2 className="w-2.5 h-2.5" /> : <div className="w-2.5 h-2.5 border-1.5 border-amber-400 border-t-transparent rounded-full animate-spin" />}
      <span>{label}</span>
    </div>
  );
}

function DataBox({ data }: { data: any }) {
  return (
    <div className="bg-black/40 border border-slate-800 rounded-xl p-3 text-slate-300 overflow-x-auto">
      <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
