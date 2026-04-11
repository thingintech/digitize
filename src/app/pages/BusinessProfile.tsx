import React from "react";
import { useNavigate } from "react-router";
import { LocalProfileForm } from "../components/qr/LocalProfileForm";
import { useBusiness } from "../context/BusinessContext";

export function BusinessProfile() {
  const navigate = useNavigate();
  const { business } = useBusiness();

  // A profile is "complete enough" if it has a name
  const hasProfile = !!business?.name;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Business Profile</h1>
        <p className="text-slate-500 mt-1">Set up or edit your business details.</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <LocalProfileForm />
        <div className="flex justify-end mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              navigate('/dashboard/qr');
            }}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-md"
          >
            {hasProfile ? "Continue to QR Setup →" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
