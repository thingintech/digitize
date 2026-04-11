import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, Store, Phone, Globe, MapPin, Palette } from "lucide-react";
import { useBusiness } from "../../context/BusinessContext";

export function LocalProfileForm() {
  const { business, updateBusiness, isLoading } = useBusiness();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    website: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    primary_color: "#1e293b",
    secondary_color: "#8b5cf6",
  });

  // Sync form with business data from context
  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || "",
        description: business.description || "",
        email: business.email || "",
        phone: business.phone || "",
        whatsapp_number: business.whatsapp_number || "",
        website: business.website || "",
        address_line1: business.address_line1 || "",
        city: business.city || "",
        state: business.state || "",
        postal_code: business.postal_code || "",
        country: business.country || "US",
        primary_color: business.primary_color || "#1e293b",
        secondary_color: business.secondary_color || "#8b5cf6",
      });
    }
  }, [business]);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Business name is required");
      return;
    }

    setSaving(true);
    try {
      await updateBusiness(form);
    } catch (err: unknown) {
      console.error('Failed to update business:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all bg-white dark:bg-slate-950 dark:text-slate-100";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Store className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Business Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Business Name *</label>
            <input required className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Joe's Cafe" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell customers what makes you special..." />
          </div>
          <div>
            <label className={labelCls}>Business Email</label>
            <input type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="info@mycafe.com" />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input type="tel" className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number</label>
            <input type="tel" className={inputCls} value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input type="url" className={inputCls} value={form.website} onChange={set("website")} placeholder="https://mycafe.com" />
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Address</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Address Line 1</label>
            <input className={inputCls} value={form.address_line1} onChange={set("address_line1")} placeholder="123 Main Street" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} value={form.city} onChange={set("city")} placeholder="New York" />
          </div>
          <div>
            <label className={labelCls}>State/Province</label>
            <input className={inputCls} value={form.state} onChange={set("state")} placeholder="NY" />
          </div>
          <div>
            <label className={labelCls}>Postal Code</label>
            <input className={inputCls} value={form.postal_code} onChange={set("postal_code")} placeholder="10001" />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input className={inputCls} value={form.country} onChange={set("country")} placeholder="US" />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Branding</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Primary Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm(p => ({ ...p, primary_color: e.target.value }))} className="w-12 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer" />
              <input className={inputCls} value={form.primary_color} onChange={set("primary_color")} placeholder="#1e293b" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Secondary Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.secondary_color} onChange={(e) => setForm(p => ({ ...p, secondary_color: e.target.value }))} className="w-12 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer" />
              <input className={inputCls} value={form.secondary_color} onChange={set("secondary_color")} placeholder="#8b5cf6" />
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-purple-600 text-white hover:bg-slate-800 dark:hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-md flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </div>
    </form>
  );
}