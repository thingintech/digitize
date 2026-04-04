import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LocalProfileForm } from "../components/qr/LocalProfileForm";

export function BusinessProfile() {
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('local_business_profile');
    if (saved) {
      setHasProfile(true);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Profile</h1>
        <p className="text-slate-500 mt-1">Set up or edit your business details.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <LocalProfileForm />
        <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              navigate('/dashboard/qr');
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
          >
            {hasProfile ? "Continue to QR Setup →" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
