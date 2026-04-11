import React, { useState } from "react";
import { Search, ChevronLeft, MapPin, Star, MessageCircle, Info, FileText, Image as ImgIcon, Coffee, ArrowRight } from "lucide-react";
import { Badge } from "../components/ui";
import { usePublicBusiness, UploadedMenu } from "../context/PublicBusinessContext";
import { NotFound } from "./NotFound";

export function PublicMenu() {
  const { business, template, uploadedMenus, categories, menuItems, loading, error } = usePublicBusiness();
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
    </div>
  );

  if (error || !business) return <NotFound />;

  const showUploadedMenu = uploadedMenus.length > 0;
  const showStructuredMenu = menuItems.length > 0 && !showUploadedMenu;

  // Retrieve full template settings from context
  const templateStyles = template || {} as any;

  const activeMenu = showUploadedMenu ? (uploadedMenus.find(m => m.id === selectedMenuId) || uploadedMenus[0]) : null;

  // Group items by category
  const actualCats = categories.filter(c => c !== "All");
  const catEntries = actualCats.map(cat => {
    return [cat, menuItems.filter(i => i.category === cat)] as [string, typeof menuItems];
  }).filter(([, items]) => items.length > 0);

  // Theme
  const bgColor = '#2a0f05';
  const primaryC = templateStyles.primary_color || '#6b2d0f';
  const secC = templateStyles.secondary_color || '#e8c89a';
  const accentC = '#3d1a08';

  // Social / extras from template
  const socialFacebook = templateStyles.social_facebook || '';
  const socialInstagram = templateStyles.social_instagram || '';
  const socialTiktok = templateStyles.social_tiktok || '';
  const socialWhatsapp = templateStyles.social_whatsapp || '';
  const reviewLink = templateStyles.review_link || '';
  const openingHours = templateStyles.opening_hours || '';

  const hasSocials = socialFacebook || socialInstagram || socialTiktok || socialWhatsapp;
  const isTemp2 = templateStyles.template_id === 'temp2';
  const normalizedEntries = catEntries.length ? catEntries : [['Menu', menuItems] as [string, typeof menuItems]];
  const hotEntry = normalizedEntries.find(([cat]) => /hot|espresso|coffee|tea/i.test(cat)) || normalizedEntries[0];
  const coldEntry = normalizedEntries.find(([cat]) => /cold|shake|frappe|iced/i.test(cat)) || normalizedEntries[1] || normalizedEntries[0];
  const hotItems = hotEntry?.[1] || [];
  const coldItems = coldEntry?.[1] || [];

  const formatInr = (price: any) => {
    const num = Number.parseFloat(String(price));
    if (Number.isNaN(num)) return "₹0";
    return `₹${Math.round(num)}`;
  };

  if (showLanding && (showStructuredMenu || showUploadedMenu)) {
    if (isTemp2) {
      const rawName = (templateStyles.template_name || business.name).replace(/\s+/g, " ").trim();
      const nameParts = rawName.split(/\s+/);
      const titleFirst = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : rawName;
      const titleLast = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;
      const eyebrow = templateStyles.landing_headline || "Welcome";
      const sub = templateStyles.landing_subtext || "Hand-pulled espresso, signature cold brews, and seasonal specials.";
      const heroImg =
        templateStyles.landing_logo ||
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80";
      const coldImg = "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80";

      return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
          {/* Layered charcoal panels */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-[12%] top-[8%] h-[42%] w-[58%] rotate-[-1deg] bg-[#141416] opacity-90" />
            <div className="absolute -right-[8%] top-[22%] h-[38%] w-[48%] rotate-[2deg] bg-[#1a1c20] opacity-85" />
            <div className="absolute bottom-[6%] left-[18%] h-[28%] w-[44%] rotate-[1deg] bg-[#121214] opacity-80" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]" />

          <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
            <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12">
              <div className="flex flex-col justify-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-white/45 sm:text-[11px]">{eyebrow}</p>
                <h1 className="mt-4 font-sans text-[clamp(2.25rem,7vw,3.75rem)] font-bold uppercase leading-[0.98] tracking-[0.02em] text-white">
                  <span className="block">{titleFirst}</span>
                  {titleLast && (
                    <span className="mt-1 block text-[0.92em] font-semibold text-white/95">{titleLast}</span>
                  )}
                </h1>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">{sub}</p>

                <div className="mt-8 flex items-baseline gap-4">
                  <span className="font-serif text-4xl font-light italic text-white/90 sm:text-5xl">Hot</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/50 to-transparent" aria-hidden />
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowLanding(false)}
                    className="group inline-flex items-center gap-3 bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/90 active:scale-[0.98]"
                  >
                    View menu
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </button>
                  <span className="text-[11px] text-white/35">Tap to explore hot & cold</span>
                </div>
              </div>

              <div className="relative min-h-[280px] lg:min-h-[min(62vh,420px)]">
                <div className="absolute -inset-px bg-gradient-to-br from-white/12 via-transparent to-transparent opacity-60" />
                <div className="relative h-full min-h-[280px] overflow-hidden bg-[#0d0d0f] shadow-[0_25px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
                  <img src={heroImg} alt="" className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>
              </div>
            </div>

            {/* Bottom strip — Cold preview */}
            <div className="mt-10 border-t border-white/[0.08] pt-10 sm:mt-14">
              <div className="grid items-center gap-6 md:grid-cols-[1fr_1.15fr] md:gap-10">
                <div className="relative aspect-[5/4] max-h-[200px] overflow-hidden bg-[#111] ring-1 ring-white/10 sm:max-h-[220px]">
                  <img src={coldImg} alt="" className="h-full w-full object-cover opacity-95" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                </div>
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <span className="h-px flex-1 bg-gradient-to-l from-white/45 to-transparent" />
                    <span className="font-serif text-4xl font-light italic text-white/90 sm:text-5xl">Cold</span>
                  </div>
                  <p className="text-sm text-white/45">Iced classics, blended drinks, and more inside.</p>
                  <button
                    type="button"
                    onClick={() => setShowLanding(false)}
                    className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/50 underline-offset-4 transition hover:text-white/80 hover:underline"
                  >
                    Open full menu
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-auto pt-12 text-center text-[9px] font-mono uppercase tracking-[0.35em] text-white/25">
              Powered by Thing in Tech
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
        <div className="max-w-2xl mx-auto min-h-screen flex flex-col shadow-2xl relative" style={{ backgroundColor: bgColor }}>
           <div className="flex flex-col items-center justify-center px-10 pt-12 pb-6 h-full text-center flex-1">
             {templateStyles.landing_logo ? (
                <div className="w-32 h-32 rounded-full border-4 mb-6 overflow-hidden shadow-2xl" style={{ borderColor: primaryC, backgroundColor: accentC }}>
                  <img src={templateStyles.landing_logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 mb-6 flex items-center justify-center shadow-2xl" style={{ borderColor: primaryC, backgroundColor: accentC }}>
                  <Coffee className="w-12 h-12 opacity-40 text-white" />
                </div>
              )}

             <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: secC }}>
               {templateStyles.landing_headline || 'Welcome to'}
             </div>
             <div className="text-white text-4xl font-bold mb-3 leading-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
               {templateStyles.template_name || business.name}
             </div>
             <div className="text-white/60 text-sm mb-8 max-w-[250px] mx-auto italic">
               {templateStyles.landing_subtext || 'Explore our delicious offerings'}
             </div>

             {/* 3 Action buttons */}
             <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mb-8">
               <button
                  onClick={() => setShowLanding(false)}
                  className="w-full py-3.5 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryC, color: secC }}>
                  <Coffee className="w-4 h-4" /> View Menu
               </button>

               {openingHours && (
                 <details className="group">
                   <summary className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border cursor-pointer list-none hover:opacity-90 transition shadow-lg"
                     style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderColor: primaryC, color: secC }}>
                     <Info className="w-3.5 h-3.5" /> Opening Hours
                   </summary>
                   <div className="mt-2 bg-black/60 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10 text-center">
                     <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{openingHours}</p>
                   </div>
                 </details>
               )}

               {reviewLink && (
                 <a href={reviewLink} target="_blank" rel="noopener noreferrer"
                   className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border hover:opacity-90 active:scale-95 transition shadow-lg"
                   style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderColor: primaryC, color: secC }}>
                   <Star className="w-3.5 h-3.5" /> Leave a Review
                 </a>
               )}
             </div>

             {/* Social icons row */}
             {hasSocials && (
               <div className="flex justify-center gap-5 mb-10">
                 {socialFacebook && (
                   <a href={socialFacebook} target="_blank" rel="noopener noreferrer"
                     className="w-11 h-11 rounded-full flex items-center justify-center border-2 hover:opacity-80 transition shadow-xl"
                     style={{ borderColor: primaryC, backgroundColor: accentC, color: secC }}>
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                   </a>
                 )}
                 {socialInstagram && (
                   <a href={socialInstagram} target="_blank" rel="noopener noreferrer"
                     className="w-11 h-11 rounded-full flex items-center justify-center border-2 hover:opacity-80 transition shadow-xl"
                     style={{ borderColor: primaryC, backgroundColor: accentC, color: secC }}>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                   </a>
                 )}
                 {socialTiktok && (
                   <a href={socialTiktok} target="_blank" rel="noopener noreferrer"
                     className="w-11 h-11 rounded-full flex items-center justify-center border-2 hover:opacity-80 transition shadow-xl"
                     style={{ borderColor: primaryC, backgroundColor: accentC, color: secC }}>
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                   </a>
                 )}
                 {socialWhatsapp && (
                   <a href={`https://wa.me/${socialWhatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                     className="w-11 h-11 rounded-full flex items-center justify-center border-2 hover:opacity-80 transition shadow-xl"
                     style={{ borderColor: primaryC, backgroundColor: accentC, color: secC }}>
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                 </a>
               )}
             </div>
           )}

           <div className="absolute bottom-6 inset-x-0 text-center">
             <p className="text-[9px] opacity-30 text-white font-mono uppercase tracking-widest">Powered by Thing in Tech</p>
           </div>
         </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col shadow-2xl relative" style={{ backgroundColor: bgColor }}>
        
        {/* Uploaded menu tabs (PDF / image) */}
        {showUploadedMenu && (
          <div className="p-4 flex-1">
            {uploadedMenus.length > 1 && (
              <div className="overflow-x-auto flex gap-2 pb-3 hide-scrollbar">
                {uploadedMenus.map(m => (
                  <button key={m.id} onClick={() => setSelectedMenuId(m.id)}
                    style={activeMenu?.id === m.id ? { backgroundColor: secC, color: bgColor } : { backgroundColor: accentC, color: secC }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all">
                    {m.file_type === "pdf" ? <FileText className="w-3.5 h-3.5" /> : <ImgIcon className="w-3.5 h-3.5" />}
                    {m.label}
                  </button>
                ))}
              </div>
            )}
            {activeMenu?.file_type === "pdf" ? (
              <div className="rounded-2xl border overflow-hidden shadow-sm h-[85vh]" style={{ borderColor: primaryC }}>
                <iframe src={activeMenu.public_url + "#toolbar=0"} className="w-full h-full" title={activeMenu.label} />
              </div>
            ) : activeMenu ? (
              <img src={activeMenu.public_url} alt={activeMenu.label} className="w-full rounded-2xl shadow-sm border object-contain" style={{ borderColor: primaryC }} />
            ) : null}
          </div>
        )}

        {/* Structured menu — reference design */}
        {showStructuredMenu && (
          isTemp2 ? (
            <div className="min-h-screen bg-[#0b0d10] text-white font-sans">
              <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
                <div className="relative overflow-hidden bg-black/60 p-5 sm:p-7">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
                  <div className="relative z-10 grid gap-5 md:grid-cols-[1.15fr_1fr]">
                    <div>
                      <h1 className="text-5xl sm:text-6xl leading-[0.95] font-semibold uppercase tracking-wide">
                        {(templateStyles.template_name || business.name).replace(/\s+/g, " ")}
                      </h1>

                      <div className="mt-6 flex items-center gap-4">
                        <span className="text-5xl font-light">Hot</span>
                        <span className="h-px flex-1 bg-white/60" />
                      </div>

                      <div className="mt-6 space-y-2 pr-2">
                        {hotItems.slice(0, 9).map((item) => (
                          <div key={item.id} className="flex items-end justify-between gap-3">
                            <span className="flex-1 text-xl sm:text-[2rem] leading-tight text-white/95">{item.name}</span>
                            <span className="text-xl sm:text-[2rem] leading-tight text-white/90">{formatInr(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative min-h-[330px] overflow-hidden bg-white/5">
                      <img
                        src={templateStyles.landing_logo || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"}
                        alt="Hot coffee"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="relative z-10 mt-7 grid gap-5 md:grid-cols-[1fr_1.15fr]">
                    <div className="relative min-h-[300px] overflow-hidden bg-white/5">
                      <img
                        src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80"
                        alt="Cold coffee"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>

                    <div className="bg-black/60 px-4 py-5 sm:px-6">
                      <div className="mb-4 flex items-center gap-4">
                        <span className="h-px flex-1 bg-white/60" />
                        <span className="text-5xl font-light">Cold</span>
                      </div>

                      <div className="space-y-2">
                        {coldItems.slice(0, 9).map((item) => (
                          <div key={item.id} className="flex items-end justify-between gap-3">
                            <span className="flex-1 text-xl sm:text-[2rem] leading-tight text-white/95">{item.name}</span>
                            <span className="text-xl sm:text-[2rem] leading-tight text-white/90">{formatInr(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div style={{ backgroundColor: '#2c1206', minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ── Coffee bean decorations ── */}
            <svg viewBox="0 0 140 90" style={{position:'absolute',top:-25,left:-35,width:150,opacity:.65,transform:'rotate(-22deg)',pointerEvents:'none'}}>
              <ellipse cx="70" cy="45" rx="68" ry="43" fill="#5c2a10"/><ellipse cx="70" cy="45" rx="63" ry="38" fill="#6b3015"/>
              <path d="M70 4 Q93 45 70 86" stroke="#3d1a08" strokeWidth="4" fill="none"/>
              <path d="M70 4 Q47 45 70 86" stroke="#3d1a08" strokeWidth="4" fill="none"/>
              <ellipse cx="50" cy="22" rx="10" ry="6" fill="#7a3515" opacity=".45" transform="rotate(-15 50 22)"/>
            </svg>
            <svg viewBox="0 0 110 72" style={{position:'absolute',top:20,right:-32,width:120,opacity:.55,transform:'rotate(20deg)',pointerEvents:'none'}}>
              <ellipse cx="55" cy="36" rx="53" ry="34" fill="#5c2a10"/><ellipse cx="55" cy="36" rx="49" ry="30" fill="#6b3015"/>
              <path d="M55 3 Q76 36 55 69" stroke="#3d1a08" strokeWidth="3.5" fill="none"/>
              <path d="M55 3 Q34 36 55 69" stroke="#3d1a08" strokeWidth="3.5" fill="none"/>
            </svg>
            <svg viewBox="0 0 95 62" style={{position:'absolute',top:'42%',left:-22,width:95,opacity:.45,transform:'rotate(32deg)',pointerEvents:'none'}}>
              <ellipse cx="47" cy="31" rx="45" ry="29" fill="#5c2a10"/><ellipse cx="47" cy="31" rx="41" ry="25" fill="#6b3015"/>
              <path d="M47 3 Q65 31 47 59" stroke="#3d1a08" strokeWidth="3" fill="none"/>
              <path d="M47 3 Q29 31 47 59" stroke="#3d1a08" strokeWidth="3" fill="none"/>
            </svg>
            <svg viewBox="0 0 120 78" style={{position:'absolute',top:'38%',right:-30,width:115,opacity:.5,transform:'rotate(-28deg)',pointerEvents:'none'}}>
              <ellipse cx="60" cy="39" rx="58" ry="36" fill="#5c2a10"/><ellipse cx="60" cy="39" rx="54" ry="32" fill="#6b3015"/>
              <path d="M60 4 Q80 39 60 74" stroke="#3d1a08" strokeWidth="3.5" fill="none"/>
              <path d="M60 4 Q40 39 60 74" stroke="#3d1a08" strokeWidth="3.5" fill="none"/>
            </svg>
            <svg viewBox="0 0 100 65" style={{position:'absolute',bottom:120,left:-18,width:100,opacity:.55,transform:'rotate(15deg)',pointerEvents:'none'}}>
              <ellipse cx="50" cy="32" rx="48" ry="30" fill="#5c2a10"/><ellipse cx="50" cy="32" rx="44" ry="26" fill="#6b3015"/>
              <path d="M50 3 Q68 32 50 61" stroke="#3d1a08" strokeWidth="3" fill="none"/>
              <path d="M50 3 Q32 32 50 61" stroke="#3d1a08" strokeWidth="3" fill="none"/>
            </svg>
            <svg viewBox="0 0 85 55" style={{position:'absolute',bottom:60,right:-20,width:90,opacity:.6,transform:'rotate(-38deg)',pointerEvents:'none'}}>
              <ellipse cx="42" cy="27" rx="40" ry="25" fill="#5c2a10"/><ellipse cx="42" cy="27" rx="36" ry="21" fill="#6b3015"/>
              <path d="M42 3 Q58 27 42 51" stroke="#3d1a08" strokeWidth="2.5" fill="none"/>
              <path d="M42 3 Q26 27 42 51" stroke="#3d1a08" strokeWidth="2.5" fill="none"/>
            </svg>

            {/* ── Header ── */}
            <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'36px 20px 16px'}}>
              {/* Logo */}
              {templateStyles.landing_logo ? (
                <div style={{width:72,height:72,borderRadius:'50%',border:'2px solid #d4a97a',backgroundColor:'#3d1a08',margin:'0 auto 12px',overflow:'hidden'}}>
                  <img src={templateStyles.landing_logo} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                </div>
              ) : (
                <div style={{width:72,height:72,borderRadius:'50%',border:'2px solid #d4a97a',backgroundColor:'#3d1a08',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Coffee style={{width:32,height:32,color:'#d4a97a'}} />
                </div>
              )}
              {/* Business name */}
              <h1 style={{color:'#fff',fontSize:'clamp(22px,5vw,34px)',fontWeight:700,fontFamily:'Georgia,serif',letterSpacing:'0.06em',margin:'0 0 4px'}}>
                {templateStyles.template_name || business.name}
              </h1>
              {/* Subtitle */}
              <p style={{color:'#d4a97a',fontSize:'clamp(9px,2vw,11px)',letterSpacing:'0.35em',textTransform:'uppercase',margin:0}}>
                • {templateStyles.cafeteria_subtitle || business.description || 'Cafeteria'} •
              </p>
              {/* Divider */}
              <div style={{borderTop:'1px solid rgba(212,169,122,0.35)',margin:'18px auto 18px',maxWidth:400}} />
              {/* MENU */}
              <div style={{color:'#fff',fontSize:'clamp(32px,8vw,56px)',fontWeight:900,letterSpacing:'0.28em',textTransform:'uppercase',lineHeight:1}}>
                MENU
              </div>
            </div>

            {/* ── Two-column item grid ── */}
            <div style={{position:'relative',zIndex:1,padding:'8px 20px 24px',maxWidth:760,margin:'0 auto'}}>
              {(() => {
                const half = Math.ceil(catEntries.length / 2);
                const col1 = catEntries.slice(0, half);
                const col2 = catEntries.slice(half);
                const ColBlock = (cols: [string, typeof menuItems][]) => (
                  <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:24}}>
                    {cols.map(([cat, items]) => (
                      <div key={cat}>
                        <p style={{color:'#d4a97a',fontSize:'clamp(9px,2vw,11px)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.25em',margin:'0 0 6px'}}>
                          {cat}
                        </p>
                        <div style={{borderTop:'1px solid rgba(212,169,122,0.55)',marginBottom:10}} />
                        {items.map(item => (
                          <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8,marginBottom:6}}>
                            <span style={{color:'#f0e8df',fontSize:'clamp(10px,2.2vw,13px)',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',flex:1}}>
                              {item.name}
                            </span>
                            <span style={{color:'#f0e8df',fontSize:'clamp(10px,2.2vw,13px)',fontWeight:500,whiteSpace:'nowrap',flexShrink:0}}>
                              ${parseFloat(String(item.price)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
                return (
                  <div style={{display:'flex',gap:20}}>
                    {ColBlock(col1)}
                    {col2.length > 0 && (
                      <>
                        <div style={{width:1,backgroundColor:'rgba(92,42,16,0.9)',flexShrink:0,alignSelf:'stretch'}} />
                        {ColBlock(col2)}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ── Footer ── */}
            <div style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(212,169,122,0.25)',padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',maxWidth:760,margin:'0 auto'}}>
              {templateStyles.footer_handle && (
                <span style={{color:'#d4a97a',fontSize:'clamp(9px,2vw,11px)',letterSpacing:'0.15em'}}>{templateStyles.footer_handle}</span>
              )}
              {templateStyles.footer_website && (
                <span style={{color:'#d4a97a',fontSize:'clamp(9px,2vw,11px)',letterSpacing:'0.15em'}}>{templateStyles.footer_website}</span>
              )}
            </div>
          </div>
          )
        )}

        {/* Empty state */}
        {!showUploadedMenu && !showStructuredMenu && (
          <div className="flex flex-col items-center justify-center flex-1 p-12 text-center" style={{ color: secC }}>
            <p className="font-semibold uppercase tracking-widest text-sm opacity-50">Menu coming soon</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html:`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}} />
    </div>
  );
}
