import React, { useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import { Utensils, Globe, Check, ArrowRight, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export function OnboardingWizard() {
  const { business, updateProfile, uploadLogo, uploadMenu, loading } = useProfile();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [bizData, setBizData] = useState({
    name: business?.name || "",
    description: business?.description || "",
    phone: business?.phone || "",
    whatsapp: business?.whatsapp_number || "",
    address: business?.address_line1 || "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [menuFile, setMenuFile] = useState<File | null>(null);

  // Don't show if no business or onboarding is already done
  // We use onboarding_step >= 4 to mark completion
  if (!business || (business.onboarding_step && business.onboarding_step >= 4)) {
    return null;
  }

  const handleNext = async () => {
    setIsSubmitting(true);
    try {
      if (step === 1) {
        await updateProfile({ onboarding_step: 1 });
        setStep(2);
      } else if (step === 2) {
        // Save profile data
        await updateProfile({
          name: bizData.name,
          description: bizData.description,
          phone: bizData.phone,
          whatsapp_number: bizData.whatsapp,
          address_line1: bizData.address,
          onboarding_step: 2,
        });
        setStep(3);
      } else if (step === 3) {
        // Logo upload or skip
        if (logoFile) {
          await uploadLogo(logoFile);
        }
        await updateProfile({ onboarding_step: 3 });
        setStep(4);
      } else if (step === 4) {
        // Skip or finish
        await updateProfile({ onboarding_step: 4 });
        toast.success("Welcome aboard!");
      }
    } catch (err) {
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setIsSubmitting(true);
    try {
      await uploadLogo(logoFile);
      setStep(4);
      toast.success("Logo uploaded!");
    } catch (err) {
      toast.error("Failed to upload logo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMenu = async () => {
    if (!menuFile) return;
    setIsSubmitting(true);
    try {
      await uploadMenu(menuFile, "Main Menu");
      await updateProfile({ onboarding_step: 4 });
      toast.success("Menu uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload menu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-purple-600 to-blue-700 p-8 text-white">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-all ${
                    s <= step ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Step {step} of 4
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-extrabold leading-tight">
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                  Thing in Tech
                </span>
              </h2>
              <p className="text-purple-100 text-lg leading-relaxed">
                We're excited to help you digitize your business. Let's get you set up in less than 2 minutes.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold">Business Profile</h2>
              <p className="text-purple-100 opacity-90">
                Tell us a bit more about your business.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold">Brand Identity</h2>
              <p className="text-purple-100 opacity-90">
                Upload your logo to make your menu truly yours.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold">Your Digital Menu</h2>
              <p className="text-purple-100 opacity-90">
                Upload your menu now or skip to do it later.
              </p>
            </div>
          )}
        </div>

        <div className="p-8 bg-white dark:bg-slate-900">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Professional Presence</h4>
                    <p className="text-sm text-slate-500">Get a beautiful landing page for your customers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Smart QR Menus</h4>
                    <p className="text-sm text-slate-500">Printable QR codes that never expire.</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Get Started"}
                {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Business Name</label>
                <Input 
                  value={bizData.name} 
                  onChange={e => setBizData({...bizData, name: e.target.value})}
                  placeholder="e.g. Blue Lagoon Cafe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Short Description</label>
                <Textarea 
                  value={bizData.description} 
                  onChange={e => setBizData({...bizData, description: e.target.value})}
                  placeholder="Tell customers what makes you special..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">WhatsApp</label>
                  <Input 
                    value={bizData.whatsapp} 
                    onChange={e => setBizData({...bizData, whatsapp: e.target.value})}
                    placeholder="+1..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                  <Input 
                    value={bizData.address} 
                    onChange={e => setBizData({...bizData, address: e.target.value})}
                    placeholder="Cairo"
                  />
                </div>
              </div>
              <Button 
                onClick={handleNext} 
                className="w-full h-12 mt-2 font-bold bg-slate-900 hover:bg-slate-800"
                disabled={isSubmitting || !bizData.name}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  logoFile ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-purple-400 hover:bg-purple-50"
                }`}
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <input 
                  id="logo-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoFile(e.target.files?.[0] || null)}
                />
                {logoFile ? (
                  <>
                    <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 overflow-hidden p-1 border border-green-200">
                      <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <p className="font-bold text-green-700">Perfect!</p>
                    <button className="text-xs text-green-600 mt-2 underline" onClick={(e) => {
                      e.stopPropagation();
                      setLogoFile(null);
                    }}>Change logo</button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-900">Upload your Logo</p>
                    <p className="text-sm text-slate-500">Square images work best</p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleUploadLogo} 
                  className="w-full h-12 font-bold bg-slate-900 hover:bg-slate-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : logoFile ? "Apply Logo" : "Skip this step"}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  menuFile ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-purple-400 hover:bg-purple-50"
                }`}
                onClick={() => document.getElementById('menu-upload')?.click()}
              >
                <input 
                  id="menu-upload"
                  type="file" 
                  className="hidden" 
                  accept="application/pdf,image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMenuFile(e.target.files?.[0] || null)}
                />
                {menuFile ? (
                  <>
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <p className="font-bold text-green-700">{menuFile.name}</p>
                    <button className="text-xs text-green-600 mt-2 underline" onClick={(e) => {
                      e.stopPropagation();
                      setMenuFile(null);
                    }}>Change file</button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-900">Click to upload menu</p>
                    <p className="text-sm text-slate-500">PDF or Images accepted</p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleUploadMenu} 
                  className="w-full h-12 font-bold bg-slate-900 hover:bg-slate-800"
                  disabled={isSubmitting || !menuFile}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                </Button>
                <button 
                   onClick={handleNext}
                   disabled={isSubmitting}
                   className="text-slate-400 hover:text-slate-600 text-sm font-medium py-2 transition-colors"
                >
                  Skip for now, I'll do it later
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
