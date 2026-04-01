import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { supabase } from "../../utils/supabase";
import { resolveSubdomain } from "../services/qrService";
import { Search, ChevronLeft, MapPin, Star, MessageCircle, Info, FileText, Image as ImgIcon } from "lucide-react";
import { Badge } from "../components/ui";

interface Business {
  id: string; name: string; slug: string; logo_url: string | null;
  description: string | null; primary_color: string | null;
  cover_image_url: string | null; city: string | null; 
  phone: string | null; whatsapp_number: string | null;
}
interface UploadedMenu {
  id: string; label: string; file_type: "pdf" | "image"; public_url: string;
}
interface MenuItem {
  id: string; name: string; description: string | null; price: number;
  image_url: string | null; is_featured: boolean; category: string;
}

export function PublicMenu() {
  const { businessSlug: routeSlug } = useParams<{ businessSlug: string }>();

  // Support arriving via subdomain (e.g. joe-cafe.myapp.com) OR path param (/joe-cafe).
  // Subdomain is read at runtime so the domain itself is never hard-coded.
  const slug = resolveSubdomain() ?? routeSlug ?? "";

  const [business,    setBusiness]    = useState<Business | null>(null);
  const [uploadedMenus, setUploadedMenus] = useState<UploadedMenu[]>([]);
  const [categories,  setCategories]  = useState<string[]>(["All"]);
  const [menuItems,   setMenuItems]   = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeMenu,  setActiveMenu]  = useState<UploadedMenu | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    loadData();
  }, [slug]);

  async function loadData() {
    setLoading(true);

    const { data: biz, error } = await supabase
      .from("businesses")
      .select("id,name,slug,logo_url,cover_image_url,city,whatsapp_number,description,phone,primary_color")
      .eq("slug", slug)
      .single();

    if (error || !biz) { setLoading(false); return; }
    setBusiness(biz);

    // Parallel fetch: uploaded menu files + structured items
    const [{ data: uploadedData }, { data: cData }, { data: iData }] = await Promise.all([
      supabase.from("business_menus")
        .select("id,label,file_type,public_url")
        .eq("business_id", biz.id).eq("is_active", true).order("sort_order"),
      supabase.from("menu_categories")
        .select("id,name").eq("business_id", biz.id).order("sort_order"),
      supabase.from("menu_items")
        .select("id,name,description,price,image_url,is_featured,category:menu_categories(name)")
        .eq("business_id", biz.id).eq("is_available", true).order("sort_order"),
    ]);

    if (uploadedData?.length) {
      setUploadedMenus(uploadedData as UploadedMenu[]);
      setActiveMenu(uploadedData[0] as UploadedMenu);
    }

    if (cData) setCategories(["All", ...cData.map(c => c.name)]);
    if (iData) {
      setMenuItems(iData.map((i: any) => ({
        id: i.id, name: i.name, description: i.description, price: i.price,
        image_url: i.image_url, is_featured: i.is_featured,
        category: Array.isArray(i.category) ? (i.category[0]?.name ?? "") : (i.category?.name ?? ""),
      })));
    }

    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Menu Not Found</h2>
        <p className="text-slate-500">We couldn't find the menu you're looking for.</p>
      </div>
    </div>
  );

  const showUploadedMenu = uploadedMenus.length > 0;
  const showStructuredMenu = menuItems.length > 0 && !showUploadedMenu;
  const filteredItems = activeCategory === "All" ? menuItems : menuItems.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 max-w-md mx-auto relative shadow-2xl">
      {/* Cover image */}
      <div className="h-52 bg-slate-800 relative bg-cover bg-center"
        style={{ backgroundImage: business.cover_image_url ? `url(${business.cover_image_url})` : undefined }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Info className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-4 inset-x-4 flex items-end gap-4 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg shrink-0 overflow-hidden">
            {business.logo_url
              ? <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              : <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-2xl text-slate-800">{business.name.substring(0,2).toUpperCase()}</span>
                </div>}
          </div>
          <div className="pb-1 text-white flex-1">
            <h1 className="text-2xl font-bold tracking-tight leading-none mb-1">{business.name}</h1>
            <div className="flex items-center gap-3 text-sm opacity-90 font-medium">
              <span className="flex items-center"><Star className="w-3.5 h-3.5 text-yellow-400 mr-1 fill-yellow-400" />4.8</span>
              <span className="w-1 h-1 bg-white/50 rounded-full" />
              <a href={`tel:${business.phone}`} className="flex items-center hover:underline italic"><MapPin className="w-3.5 h-3.5 mr-1" />{business.city ?? "Location"}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Description / About */}
      {business.description && (
        <div className="px-6 py-6 bg-white border-b border-slate-100">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Our Story</h3>
           <p className="text-slate-600 leading-relaxed text-sm">{business.description}</p>
        </div>
      )}

      {/* Uploaded menu tabs (PDF / image) */}
      {showUploadedMenu && (
        <>
          {uploadedMenus.length > 1 && (
            <div className="overflow-x-auto flex gap-2 px-4 py-3 bg-white border-b border-slate-200 hide-scrollbar">
              {uploadedMenus.map(m => (
                <button key={m.id} onClick={() => setActiveMenu(m)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${activeMenu?.id === m.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {m.file_type === "pdf" ? <FileText className="w-3.5 h-3.5" /> : <ImgIcon className="w-3.5 h-3.5" />}
                  {m.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-4">
            {activeMenu?.file_type === "pdf" ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" style={{ height: "75vh" }}>
                <iframe src={activeMenu.public_url + "#toolbar=0"} className="w-full h-full" title={activeMenu.label} />
              </div>
            ) : activeMenu ? (
              <img src={activeMenu.public_url} alt={activeMenu.label} className="w-full rounded-2xl shadow-sm border border-slate-200 object-contain" />
            ) : null}
          </div>
        </>
      )}

      {/* Structured menu items (fallback if no uploads) */}
      {showStructuredMenu && (
        <>
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-20 shadow-sm">
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search menu..." className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto hide-scrollbar px-4 pb-4 flex gap-2 snap-x">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all snap-start
                    ${activeCategory === cat ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-4">
            <h2 className="font-bold text-lg text-slate-900">{activeCategory === "All" ? "All Items" : activeCategory}</h2>
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-100">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    {item.is_featured && <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4 bg-orange-100 text-orange-700">POPULAR</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-2">{item.description}</p>
                  <p className="font-bold text-slate-900">${parseFloat(String(item.price)).toFixed(2)}</p>
                </div>
                {item.image_url && (
                  <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!showUploadedMenu && !showStructuredMenu && (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600">Menu coming soon</p>
          <p className="text-sm text-slate-400">{business.name} is still setting up their digital menu.</p>
        </div>
      )}

      {/* WhatsApp FAB */}
      {business.whatsapp_number && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-md px-4 z-50">
          <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g,"")}`}
            target="_blank" rel="noopener noreferrer"
            style={{ backgroundColor: business.primary_color || '#25D366' }}
            className="w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <MessageCircle className="w-6 h-6" />Order via WhatsApp
          </a>
        </div>
      )}

      {/* Powered by footer */}
      <div className="text-center py-6 text-xs text-slate-400">
        Powered by <span className="font-semibold text-slate-600">Thing in Tech</span>
      </div>

      <style dangerouslySetInnerHTML={{__html:`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}} />
    </div>
  );
}
