import React, { useState } from "react";
import { useProfile, UpdateProfilePayload } from "../../context/ProfileContext";
import { toast } from "sonner";
import { Loader2, Save, Store, Phone, Globe, MapPin, Palette } from "lucide-react";

export function ProfileForm() {
  const { business, updateProfile, loading } = useProfile();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<UpdateProfilePayload>({
    name:           business?.name           ?? "",
    description:    business?.description    ?? "",
    email:          business?.email          ?? "",
    phone:          business?.phone          ?? "",
    whatsapp_number:business?.whatsapp_number?? "",
    website:        business?.website        ?? "",
    address_line1:  business?.address_line1  ?? "",
    city:           business?.city           ?? "",
    state:          business?.state          ?? "",
    postal_code:    business?.postal_code    ?? "",
    country:        business?.country        ?? "US",
    primary_color:  business?.primary_color  ?? "#1e293b",
    secondary_color:business?.secondary_color?? "#8b5cf6",
    is_published:   business?.is_published   ?? false,
  });

  const set = (field: keyof UpdateProfilePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ ...form, onboarding_step: Math.max(business?.onboarding_step ?? 1, 2) });
      toast.success("Business profile saved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all bg-white";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900">Business Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Business Name *</label>
            <input required className={inputCls} value={form.name ?? ""} onChange={set("name")} placeholder="e.g. Joe's Cafe" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} value={form.description ?? ""} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell customers what makes you special..." />
          </div>
          <div>
            <label className={labelCls}>Business Email</label>
            <input type="email" className={inputCls} value={form.email ?? ""} onChange={set("email")} placeholder="info@mycafe.com" />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input type="tel" className={inputCls} value={form.phone ?? ""} onChange={set("phone")} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number</label>
            <input type="tel" className={inputCls} value={form.whatsapp_number ?? ""} onChange={set("whatsapp_number")} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input type="url" className={inputCls} value={form.website ?? ""} onChange={set("website")} placeholder="https://mycafe.com" />
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900">Address</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Street Address</label>
            <input className={inputCls} value={form.address_line1 ?? ""} onChange={set("address_line1")} placeholder="123 Main St" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} value={form.city ?? ""} onChange={set("city")} placeholder="New York" />
          </div>
          <div>
            <label className={labelCls}>State / Province</label>
            <input className={inputCls} value={form.state ?? ""} onChange={set("state")} placeholder="NY" />
          </div>
          <div>
            <label className={labelCls}>Postal Code</label>
            <input className={inputCls} value={form.postal_code ?? ""} onChange={set("postal_code")} placeholder="10001" />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input className={inputCls} value={form.country ?? "US"} onChange={set("country")} placeholder="US" />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
            <Palette className="w-4 h-4 text-pink-600" />
          </div>
          <h3 className="font-bold text-slate-900">Branding Colors</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color ?? "#1e293b"} onChange={set("primary_color")} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1" />
              <span className="text-sm font-mono text-slate-600">{form.primary_color}</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Secondary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.secondary_color ?? "#8b5cf6"} onChange={set("secondary_color")} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1" />
              <span className="text-sm font-mono text-slate-600">{form.secondary_color}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <p className="font-semibold text-slate-900 text-sm">Make business public</p>
          <p className="text-xs text-slate-500 mt-0.5">Allow customers to view your menu page</p>
        </div>
        <button
          type="button"
          onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.is_published ? "bg-purple-600" : "bg-slate-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_published ? "translate-x-5" : ""}`} />
        </button>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
