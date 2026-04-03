import React from 'react';
import { Link } from 'react-router';
import { Ghost, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Ghost className="w-12 h-12 text-purple-600" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Page not found</h2>
      <p className="text-slate-500 mb-10 max-w-sm">Sorry, the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button onClick={() => window.history.back()} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold bg-white hover:bg-slate-100 transition flex items-center gap-2 w-full sm:w-auto justify-center">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <Link to="/" className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-md flex items-center gap-2 w-full sm:w-auto justify-center">
          <Home className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </div>
  );
}
