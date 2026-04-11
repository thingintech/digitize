import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, Button, Input } from '../components/ui';
import {
  Plus, UploadCloud, Edit2, Trash2, SwitchCamera,
  Image as ImageIcon, ChevronLeft, Loader2, Sparkles, Check, X, Camera, ArrowLeft, ArrowRight, Coffee, Info, QrCode, Facebook, Instagram, MessageCircle, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'sonner';

export function MenuManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { business, loading: profileLoading } = useProfile();

  const [activeTab, setActiveTab] = useState<'upload' | 'items' | 'simple-form'>('upload');
  const [isEmpty, setIsEmpty] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPublishing, setIsPublishing] = useState(false);

  // Simple Form
  const [categoryName, setCategoryName] = useState('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null); // base64
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Item detail page
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [detailEditing, setDetailEditing] = useState<{ name: string; price: string; description: string }>({ name: '', price: '', description: '' });
  const detailFileRef = useRef<HTMLInputElement>(null);

  // Templates
  const templates = [
    { id: 'cafeteria', name: 'Cafeteria Dark', subtitle: 'Rich dark brown coffee shop style', primaryColor: '#6b2d0f', secondaryColor: '#e8c89a', background: 'bg-[#2a0f05]', text: 'text-white', accent: 'bg-[#3d1a08]' },
    { id: 'temp2', name: 'temp 2', subtitle: 'Black photo-style cafe layout', primaryColor: '#0b0d10', secondaryColor: '#f8fafc', background: 'bg-[#0b0d10]', text: 'text-white', accent: 'bg-[#1a1c20]' },
  ];

  // Helper: localStorage keys
  // Priority: explicitly set active slug → local business profile slug → Supabase business id → 'local'
  const _localProfileSlug = (() => { try { return JSON.parse(localStorage.getItem('local_business_profile') || '{}').slug || null; } catch { return null; } })();
  const activeSlug = localStorage.getItem('digitize_active_menu_slug') || business?.id || _localProfileSlug || 'local';
  const lsKey = `digitize_template_${activeSlug}`;
  const menuDataKey = `digitize_menu_data_${activeSlug}`;

  // Load saved settings from localStorage (or fall back to defaults)
  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem(lsKey) || '{}'); } catch { return {}; }
  };
  const saved = getSaved();
  const initTemplate = templates.find(t => t.id === saved.templateId) ?? templates[0];

  const [selectedTemplate, setSelectedTemplate] = useState(initTemplate);
  const [templateName, setTemplateName] = useState<string>(saved.templateName ?? initTemplate.name);
  const [templatePrimary, setTemplatePrimary] = useState<string>(saved.primaryColor ?? initTemplate.primaryColor);
  const [templateSecondary, setTemplateSecondary] = useState<string>(saved.secondaryColor ?? initTemplate.secondaryColor);
  const [templateStyle] = useState<'cafeteria' | 'temp2'>(() => (saved.templateId === 'temp2' ? 'temp2' : 'cafeteria'));
  const [showingTemplates, setShowingTemplates] = useState(false);
  const [cameFromEditor, setCameFromEditor] = useState(false);
  const [hasConfirmedQR, setHasConfirmedQR] = useState(() => localStorage.getItem(`digitize_qr_confirmed_${business?.id ?? 'local'}`) === 'true');
  const [localBusiness, setLocalBusiness] = useState<any>(null);

  useEffect(() => {
    try { setLocalBusiness(JSON.parse(localStorage.getItem('local_business_profile') || 'null')); } catch {}
  }, []);

  // Editing mode
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingCell, setEditingCell] = useState<{ itemId: string; field: 'name' | 'price' } | null>(null);
  const [editingItemData, setEditingItemData] = useState<{ name: string; price: string } | null>(null);
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [cafeteriaSubtitle, setCafeteriaSubtitle] = useState<string>(saved.cafeteriaSubtitle ?? 'CAFETERIA');
  const [footerHandle, setFooterHandle] = useState<string>(saved.footerHandle ?? '@yourhandle');
  const [footerWebsite, setFooterWebsite] = useState<string>(saved.footerWebsite ?? 'yourwebsite.com');
  const [showAddInCategory, setShowAddInCategory] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlinePrice, setInlinePrice] = useState('');

  // Landing page state
  const [editorView, setEditorView] = useState<'landing' | 'menu'>('landing');
  const [landingHeadline, setLandingHeadline] = useState<string>(saved.landingHeadline ?? 'Welcome to');
  const [landingSubtext, setLandingSubtext] = useState<string>(saved.landingSubtext ?? 'Explore our delicious offerings');
  const [landingLogo, setLandingLogo] = useState<string | null>(saved.landingLogo ?? null);
  const landingLogoRef = useRef<HTMLInputElement>(null);

  // Expanded Landing Features
  const [socialFacebook, setSocialFacebook] = useState<string>(saved.socialFacebook ?? '');
  const [socialInstagram, setSocialInstagram] = useState<string>(saved.socialInstagram ?? '');
  const [socialTiktok, setSocialTiktok] = useState<string>(saved.socialTiktok ?? '');
  const [socialWhatsapp, setSocialWhatsapp] = useState<string>(saved.socialWhatsapp ?? '');
  const [reviewLink, setReviewLink] = useState<string>(saved.reviewLink ?? '');
  const [openingHours, setOpeningHours] = useState<string>(saved.openingHours ?? 'Mon - Sun: 9:00 AM - 10:00 PM');
  const [showHoursConfig, setShowHoursConfig] = useState(false);

  // Auto-save template settings to localStorage on every change
  useEffect(() => {
    const settings = {
      templateId: selectedTemplate.id,
      templateName,
      primaryColor: templatePrimary,
      secondaryColor: templateSecondary,
      cafeteriaSubtitle,
      footerHandle,
      footerWebsite,
      landingHeadline,
      landingSubtext,
      landingLogo,
      socialFacebook, socialInstagram, socialTiktok, socialWhatsapp, reviewLink, openingHours
    };
    try { localStorage.setItem(lsKey, JSON.stringify(settings)); } catch {}
  }, [selectedTemplate.id, templateStyle, templateName, templatePrimary, templateSecondary, cafeteriaSubtitle, footerHandle, footerWebsite, landingHeadline, landingSubtext, landingLogo, socialFacebook, socialInstagram, socialTiktok, socialWhatsapp, reviewLink, openingHours, lsKey]);

  // ── Image helpers ──────────────────────────────────────────────────
  const compressImage = (file: File, maxSize = 600): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (file: File | null | undefined) => {
    if (!file) return;
    try {
      const b64 = await compressImage(file);
      setImageData(b64);
    } catch { toast.error('Failed to load image'); }
  };
  const loadMenuData = () => {
    try { return JSON.parse(localStorage.getItem(menuDataKey) || '{"items":[],"categories":[]}'); }
    catch { return { items: [], categories: [] }; }
  };

  const publishToSupabase = async () => {
    if (!business?.id) {
      toast.error("No active business found to publish to.");
      return;
    }

    setIsPublishing(true);
    const publishToast = toast.loading("Publishing your menu to the cloud...");

    try {
      // 1. Mark business as published
      const { error: bizError } = await supabase
        .from('businesses')
        .update({ is_published: true })
        .eq('id', business.id);

      if (bizError) throw bizError;

      // 2. Sync Template
      const templatePayload = {
        business_id: business.id,
        slug: business.slug,
        template_id: selectedTemplate.id,
        template_name: templateName,
        primary_color: templatePrimary,
        secondary_color: templateSecondary,
        cafeteria_subtitle: cafeteriaSubtitle,
        footer_handle: footerHandle,
        footer_website: footerWebsite,
        landing_headline: landingHeadline,
        landing_subtext: landingSubtext,
        landing_logo: landingLogo,
        social_facebook: socialFacebook,
        social_instagram: socialInstagram,
        social_tiktok: socialTiktok,
        social_whatsapp: socialWhatsapp,
        review_link: reviewLink,
        opening_hours: openingHours,
        updated_at: new Date().toISOString()
      };

      const { error: tempError } = await supabase
        .from('menu_templates')
        .upsert(templatePayload, { onConflict: 'business_id,slug' });

      if (tempError) throw tempError;

      // 3. Sync Categories and Items
      // Note: To be safe, we'll delete existing ones and re-insert 
      // OR we could do a complex diff. Bulk re-insert is easier for now.
      
      // Delete existing items first (due to FK)
      await supabase.from('menu_items').delete().eq('business_id', business.id);
      // Delete existing categories
      await supabase.from('menu_categories').delete().eq('business_id', business.id);

      // Insert new categories
      const categoryMap = new Map();
      for (const cat of categories) {
        const { data: newCat, error: catError } = await supabase
          .from('menu_categories')
          .insert({
            business_id: business.id,
            name: cat.name,
            sort_order: categories.indexOf(cat)
          })
          .select()
          .single();
        
        if (catError) throw catError;
        categoryMap.set(cat.id, newCat.id);
      }

      // Insert menu items
      const itemsToInsert = menuItems.map(item => ({
        business_id: business.id,
        category_id: categoryMap.get(item.category_id) || null,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        image_url: item.image_url,
        sort_order: menuItems.indexOf(item)
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('menu_items')
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      }

      toast.success("Successfully published to live menu!", { id: publishToast });
    } catch (err: any) {
      console.error("Publishing error:", err);
      toast.error(`Failed to publish: ${err.message}`, { id: publishToast });
    } finally {
      setIsPublishing(false);
    }
  };

  const saveMenuData = (items: any[], cats: any[]) => {
    try { localStorage.setItem(menuDataKey, JSON.stringify({ items, categories: cats })); } catch {}
  };

  const genId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadMenuData();
    if (data.categories?.length) setCategories(data.categories);
    if (data.items?.length) {
      setMenuItems(data.items);
      setIsEmpty(false);
      setActiveTab('items');
    } else {
      setIsEmpty(true);
      setActiveTab('upload');
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuDataKey]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !itemName || !price) { toast.error('Please fill in all fields.'); return; }
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice)) { toast.error('Please enter a valid price number.'); return; }

    // Find or create category locally
    let cat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    let newCats = categories;
    if (!cat) {
      cat = { id: genId(), name: categoryName };
      newCats = [...categories, cat];
      setCategories(newCats);
    }

    const newItem = {
      id: genId(),
      name: itemName,
      price: numericPrice,
      description: '',
      image_url: imageData ?? null,
      is_featured: false,
      is_available: true,
      category: { name: cat.name },
    };

    const newItems = [newItem, ...menuItems];
    setMenuItems(newItems);
    saveMenuData(newItems, newCats);
    setIsEmpty(false);
    setCategoryName(''); setItemName(''); setPrice(''); setImageData(null);
    toast.success('Item added!');
    if (cameFromEditor) { setCameFromEditor(false); setActiveTab('items'); setIsEditingTemplate(true); }
    else { setActiveTab('items'); }
  };

  const handleDelete = (id: string) => {
    const remaining = menuItems.filter(i => i.id !== id);
    setMenuItems(remaining);
    saveMenuData(remaining, categories);
    if (remaining.length === 0) { setIsEmpty(true); setActiveTab('upload'); setIsEditingTemplate(false); }
    toast.success('Item deleted.');
  };

  const handleSaveItemField = (itemId: string, field: 'name' | 'price') => {
    if (!editingItemData) { setEditingCell(null); return; }
    const item = menuItems.find(i => i.id === itemId);
    if (!item) { setEditingCell(null); return; }
    let updated = { ...item };
    if (field === 'name' && editingItemData.name.trim()) updated.name = editingItemData.name.trim();
    if (field === 'price') {
      const num = parseFloat(editingItemData.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) updated.price = num;
    }
    setEditingCell(null); setEditingItemData(null);
    const newItems = menuItems.map(i => i.id === itemId ? updated : i);
    setMenuItems(newItems);
    saveMenuData(newItems, categories);
    toast.success('Saved ✓');
  };

  const handleSaveCategory = (oldName: string) => {
    if (!editingCategoryName.trim() || editingCategoryName === oldName) { setEditingCategoryKey(null); return; }
    const newCats = categories.map(c => c.name === oldName ? { ...c, name: editingCategoryName } : c);
    const newItems = menuItems.map(i => i.category?.name === oldName ? { ...i, category: { name: editingCategoryName } } : i);
    setCategories(newCats);
    setMenuItems(newItems);
    saveMenuData(newItems, newCats);
    setEditingCategoryKey(null);
    toast.success('Category renamed!');
  };

  const handleInlineAdd = (catName: string) => {
    if (!inlineName || !inlinePrice) return;
    const num = parseFloat(inlinePrice.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { toast.error('Invalid price — use numbers only'); return; }

    let cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    let newCats = categories;
    if (!cat) {
      cat = { id: genId(), name: catName };
      newCats = [...categories, cat];
      setCategories(newCats);
    }

    const newItem = {
      id: genId(),
      name: inlineName,
      price: num,
      description: '',
      image_url: null,
      is_featured: false,
      is_available: true,
      category: { name: cat.name },
    };

    const newItems = [newItem, ...menuItems];
    setMenuItems(newItems);
    saveMenuData(newItems, newCats);
    setIsEmpty(false);
    setInlineName('');
    setInlinePrice('');
    setShowAddInCategory(null);
    toast.success('Item added!');
  };

  // ── INLINE ITEM ROW (used in editing mode) ──────────────────────────────
  const InlineItemRow = ({ item, dark, photoDark }: { item: any; dark?: boolean; photoDark?: boolean }) => {
    const editingName = editingCell?.itemId === item.id && editingCell?.field === 'name';
    const editingPrice = editingCell?.itemId === item.id && editingCell?.field === 'price';
    const cc = photoDark ? '#f8fafc' : dark ? '#f5f0eb' : '#1e293b';
    const ac = photoDark ? '#64748b' : dark ? '#e8c89a' : selectedTemplate.primaryColor;
    const inr = (p: string | number) => {
      const n = Number.parseFloat(String(p));
      return Number.isNaN(n) ? '₹0' : `₹${Math.round(n)}`;
    };
    const priceLabel = photoDark ? inr(item.price) : `$${parseFloat(String(item.price)).toFixed(2)}`;
    const rowSize = photoDark ? 'text-sm' : 'text-xs';
    return (
      <div className="flex justify-between items-center group gap-2 py-0.5">
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {editingName ? (
            <input autoFocus value={editingItemData?.name ?? item.name} onChange={e => setEditingItemData(p => p ? { ...p, name: e.target.value } : null)}
              onBlur={() => handleSaveItemField(item.id, 'name')} onKeyDown={e => { if (e.key === 'Enter') handleSaveItemField(item.id, 'name'); if (e.key === 'Escape') setEditingCell(null); }}
              className={`flex-1 bg-transparent border-b ${rowSize} focus:outline-none`} style={{ borderColor: ac, color: cc }} />
          ) : (
            <span onClick={() => { setEditingCell({ itemId: item.id, field: 'name' }); setEditingItemData({ name: item.name, price: String(item.price) }); }}
              title="Click to edit" className={`${rowSize} cursor-text hover:opacity-60 transition-opacity truncate`} style={{ color: cc, textTransform: dark && !photoDark ? 'uppercase' : 'none', letterSpacing: dark && !photoDark ? '0.04em' : 'normal' }}>
              {item.name}
            </span>
          )}
          <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-red-500/20 p-0.5 rounded">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
        <div className="shrink-0">
          {editingPrice ? (
            <input autoFocus value={editingItemData?.price ?? String(item.price)} onChange={e => setEditingItemData(p => p ? { ...p, price: e.target.value } : null)}
              onBlur={() => handleSaveItemField(item.id, 'price')} onKeyDown={e => { if (e.key === 'Enter') handleSaveItemField(item.id, 'price'); if (e.key === 'Escape') setEditingCell(null); }}
              className={`w-20 bg-transparent border-b ${rowSize} text-right focus:outline-none`} style={{ borderColor: ac, color: cc }} />
          ) : (
            <span onClick={() => { setEditingCell({ itemId: item.id, field: 'price' }); setEditingItemData({ name: item.name, price: String(item.price) }); }}
              title="Click to edit price" className={`${rowSize} font-bold cursor-text hover:opacity-60`} style={{ color: photoDark ? '#f8fafc' : dark ? '#f5f0eb' : '#10b981' }}>
              {priceLabel}
            </span>
          )}
        </div>
      </div>
    );
  };

  const InlineCatHeader = ({ cat, dark }: { cat: string; dark?: boolean }) => {
    const ac = dark ? '#e8c89a' : selectedTemplate.primaryColor;
    return editingCategoryKey === cat ? (
      <input autoFocus value={editingCategoryName} onChange={e => setEditingCategoryName(e.target.value)}
        onBlur={() => handleSaveCategory(cat)} onKeyDown={e => { if (e.key === 'Enter') handleSaveCategory(cat); if (e.key === 'Escape') setEditingCategoryKey(null); }}
        className="bg-transparent border-b text-xs font-bold uppercase tracking-widest focus:outline-none w-full" style={{ borderColor: ac, color: ac }} />
    ) : (
      <div onClick={() => { setEditingCategoryKey(cat); setEditingCategoryName(cat); }}
        title="Click to rename" className="text-xs font-bold uppercase tracking-widest cursor-text hover:opacity-60 transition-opacity" style={{ color: ac }}>
        {cat}
      </div>
    );
  };

  // ── FULL-SCREEN TEMPLATE EDITOR ──────────────────────────────────────────
  if (isEditingTemplate) {
    const grouped: Record<string, any[]> = {};
    menuItems.forEach(i => { const c = i.category?.name || 'Other'; if (!grouped[c]) grouped[c] = []; grouped[c].push(i); });
    const catEntries = Object.entries(grouped);
    const normalizedEntries = catEntries.length ? catEntries : [['Menu', menuItems] as [string, any[]]];
    const hotEntry = normalizedEntries.find(([cat]) => /hot|espresso|coffee|tea/i.test(cat)) || normalizedEntries[0];
    const coldEntry = normalizedEntries.find(([cat]) => /cold|shake|frappe|iced/i.test(cat)) || normalizedEntries[1] || normalizedEntries[0];
    const hotItems = hotEntry?.[1] || [];
    const coldItems = coldEntry?.[1] || [];
    const hotCatName = hotEntry?.[0] || 'Hot';
    const coldCatName = coldEntry?.[0] || 'Cold';

    const AddItemInline = ({ cat, dark, photoDark }: { cat: string; dark?: boolean; photoDark?: boolean }) => {
      const bc = photoDark ? '#64748b' : dark ? '#e8c89a' : selectedTemplate.primaryColor;
      const fc = photoDark ? '#f8fafc' : dark ? '#fff' : '#000';
      return (
      showAddInCategory === cat ? (
        <div className="flex gap-2 mt-2 items-center">
          <input autoFocus placeholder="Item name" value={inlineName} onChange={e => setInlineName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInlineAdd(cat)}
            className="flex-1 bg-transparent border-b text-xs focus:outline-none placeholder:opacity-40" style={{ borderColor: bc, color: fc }} />
          <input placeholder={photoDark ? '95' : '$0.00'} value={inlinePrice} onChange={e => setInlinePrice(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInlineAdd(cat)}
            className="w-14 bg-transparent border-b text-xs text-right focus:outline-none placeholder:opacity-40" style={{ borderColor: bc, color: fc }} />
          <button onClick={() => handleInlineAdd(cat)}><Check className="w-3.5 h-3.5 text-green-400" /></button>
          <button onClick={() => { setShowAddInCategory(null); setInlineName(''); setInlinePrice(''); }}><X className="w-3.5 h-3.5 text-red-400" /></button>
        </div>
      ) : (
        <button onClick={() => setShowAddInCategory(cat)}
          className="mt-1.5 flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-30 hover:opacity-80 transition-opacity"
          style={{ color: bc }}>
          <Plus className="w-3 h-3" /> Add item
        </button>
      )
      );
    };

    return (
      <div className="min-h-screen bg-slate-100">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
            <button onClick={() => setIsEditingTemplate(false)} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex-1 flex items-center justify-center gap-1.5 text-center">
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-bold text-slate-800">Editing — </span>
              <span className="text-sm font-semibold" style={{ color: selectedTemplate.primaryColor }}>{selectedTemplate.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setCameFromEditor(true); setIsEditingTemplate(false); setActiveTab('simple-form'); }}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                <Plus className="w-3 h-3" /> Add Item
              </button>
              <button onClick={() => { setIsEditingTemplate(false); toast.success('Template saved!'); }}
                className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-lg text-white transition"
                style={{ backgroundColor: selectedTemplate.primaryColor }}>
                <Check className="w-3 h-3" /> Done
              </button>
            </div>
          </div>
          <div className="max-w-md mx-auto px-6 pb-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 flex items-center gap-1"><Info className="w-3 h-3"/> Tap any text to edit.</p>
            <div className="flex bg-slate-200 rounded-lg p-0.5" style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
               <button onClick={() => setEditorView('landing')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${editorView === 'landing' ? 'bg-white shadow relative z-10 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Front Page</button>
               <button onClick={() => setEditorView('menu')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${editorView === 'menu' ? 'bg-white shadow relative z-10 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Full Menu</button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8">

          {/* ── CAFETERIA DARK ── */}
          {selectedTemplate.id === 'cafeteria' && (
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-slate-800" style={{ backgroundColor: '#2a0f05', minHeight: '80vh' }}>
              {editorView === 'landing' ? (
                 <div className="flex flex-col items-center justify-center p-10 h-full text-center" style={{ minHeight: '75vh' }}>
                   <div 
                     className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-8 overflow-hidden cursor-pointer hover:opacity-80 transition relative group shadow-2xl" 
                     style={{ borderColor: '#6b2d0f', backgroundColor: '#3d1a08' }}
                     onClick={() => landingLogoRef.current?.click()}
                   >
                      {landingLogo ? (
                        <img src={landingLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 opacity-50 text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold tracking-widest">CHANGE</span>
                      </div>
                   </div>
                   <input ref={landingLogoRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                     if(e.target.files?.[0]) {
                       try {
                         const base64 = await compressImage(e.target.files[0], 400);
                         setLandingLogo(base64);
                       } catch {}
                     }
                   }} />

                   <div contentEditable suppressContentEditableWarning onBlur={e => setLandingHeadline(e.currentTarget.textContent || '')}
                     className="text-[#e8c89a] text-[10px] tracking-[0.4em] uppercase focus:outline-none cursor-text hover:bg-white/5 rounded px-2 py-1 mb-2 transition">
                     {landingHeadline}
                   </div>
                   <div className="text-white text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
                     {templateName}
                   </div>
                   <div contentEditable suppressContentEditableWarning onBlur={e => setLandingSubtext(e.currentTarget.textContent || '')}
                     className="text-white/60 text-sm focus:outline-none cursor-text hover:bg-white/5 rounded px-2 py-1 mb-12 max-w-[250px] mx-auto italic transition">
                     {landingSubtext}
                   </div>

                   <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mb-6">
                     <button 
                        onClick={() => setEditorView('menu')}
                        className="w-full py-3.5 rounded-full font-bold uppercase tracking-widest text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#6b2d0f', color: '#e8c89a' }}>
                        <Coffee className="w-4 h-4" /> View Menu
                     </button>

                     <div className="relative">
                       <button 
                          onClick={() => setShowHoursConfig(!showHoursConfig)}
                          className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border shadow-lg"
                          style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: '#6b2d0f', color: '#e8c89a' }}>
                          <Info className="w-3.5 h-3.5" /> Opening Hours
                       </button>
                       {showHoursConfig && (
                         <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-black/90 backdrop-blur-xl rounded-xl z-30 border border-white/10 shadow-2xl">
                           <textarea value={openingHours} onChange={e => setOpeningHours(e.target.value)} rows={3} className="w-full bg-white/10 border-none text-white text-xs p-2 rounded focus:ring-1 focus:ring-amber-500 mb-2 resize-none text-center" placeholder="Mon-Fri: 9am - 10pm"/>
                           <button onClick={() => setShowHoursConfig(false)} className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-900/50 hover:bg-amber-800 text-amber-200 rounded transition">Save & Close</button>
                         </div>
                       )}
                     </div>

                     <div className="relative group">
                       <button 
                          className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border shadow-lg"
                          style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: '#6b2d0f', color: '#e8c89a' }}>
                          <Sparkles className="w-3.5 h-3.5" /> Leave a Review
                       </button>
                       <div className="absolute top-1/2 right-full mr-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-black text-white text-[10px] p-2 rounded pointer-events-auto border border-white/10 z-20 flex flex-col items-end gap-1">
                          <span className="text-white/50 px-1 font-semibold uppercase">Review Link</span>
                          <input value={reviewLink} onChange={e => setReviewLink(e.target.value)} placeholder="https://g.page/..." className="bg-white/10 text-white border-none w-32 p-1.5 text-[10px] rounded focus:outline-none focus:ring-1 focus:ring-amber-500" />
                       </div>
                     </div>
                   </div>

                   {/* Social Row */}
                   <div className="flex justify-center gap-4 mt-auto mb-10 z-10">
                      {[ 
                        { icon: Facebook, val: socialFacebook, set: setSocialFacebook, label: 'Facebook' }, 
                        { icon: Instagram, val: socialInstagram, set: setSocialInstagram, label: 'Instagram' }, 
                        { icon: Play, val: socialTiktok, set: setSocialTiktok, label: 'TikTok' }, 
                        { icon: MessageCircle, val: socialWhatsapp, set: setSocialWhatsapp, label: 'WhatsApp' } 
                      ].map((soc, idx) => (
                        <div key={idx} className="relative group flex flex-col items-center">
                          <button className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition shadow-xl ${soc.val ? 'border-amber-700/80 bg-amber-900/30 text-amber-200 hover:bg-amber-800/40' : 'border-white/10 bg-black/20 text-white/30 hover:bg-black/40'}`}>
                             <soc.icon className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-black/90 backdrop-blur-md text-white text-[10px] p-2 rounded pointer-events-auto border border-white/10 z-30 flex flex-col items-center gap-1 shadow-2xl">
                             <span className="font-bold tracking-widest uppercase">{soc.label} URL</span>
                             <input value={soc.val} onChange={e => soc.set(e.target.value)} placeholder="https://" className="bg-white/10 px-2 py-1.5 rounded text-center w-32 border border-transparent focus:border-amber-500 focus:outline-none transition" />
                          </div>
                        </div>
                      ))}
                   </div>

                   <div className="absolute bottom-6 inset-x-0 text-center">
                     <p className="text-[9px] opacity-30 text-white font-mono uppercase tracking-widest">Powered by Thing in Tech</p>
                   </div>
                 </div>
               ) : (
                 /* ── FULL MENU VIEW (reference design) ── */
                 <div style={{ backgroundColor: '#2c1206', minHeight: '75vh', position: 'relative', overflowX: 'hidden' }}>

                   {/* Decorative coffee beans */}
                   <svg viewBox="0 0 120 78" style={{position:'absolute',top:-18,left:-30,width:130,opacity:.65,transform:'rotate(-22deg)',pointerEvents:'none',zIndex:0}}>
                     <ellipse cx="60" cy="39" rx="58" ry="36" fill="#5c2a10"/><ellipse cx="60" cy="39" rx="54" ry="32" fill="#6b3015"/>
                     <path d="M60 4 Q80 39 60 74" stroke="#3d1a08" strokeWidth="3.5" fill="none"/>
                     <path d="M60 4 Q40 39 60 74" stroke="#3d1a08" strokeWidth="3.5" fill="none"/>
                     <ellipse cx="42" cy="20" rx="8" ry="5" fill="#7a3515" opacity=".5" transform="rotate(-15 42 20)"/>
                   </svg>
                   <svg viewBox="0 0 100 65" style={{position:'absolute',top:30,right:-28,width:95,opacity:.55,transform:'rotate(18deg)',pointerEvents:'none',zIndex:0}}>
                     <ellipse cx="50" cy="32" rx="48" ry="30" fill="#5c2a10"/><ellipse cx="50" cy="32" rx="44" ry="27" fill="#6b3015"/>
                     <path d="M50 3 Q68 32 50 61" stroke="#3d1a08" strokeWidth="3" fill="none"/>
                     <path d="M50 3 Q32 32 50 61" stroke="#3d1a08" strokeWidth="3" fill="none"/>
                   </svg>
                   <svg viewBox="0 0 90 58" style={{position:'absolute',bottom:110,left:-20,width:90,opacity:.5,transform:'rotate(28deg)',pointerEvents:'none',zIndex:0}}>
                     <ellipse cx="45" cy="29" rx="43" ry="27" fill="#5c2a10"/><ellipse cx="45" cy="29" rx="39" ry="23" fill="#6b3015"/>
                     <path d="M45 3 Q62 29 45 55" stroke="#3d1a08" strokeWidth="3" fill="none"/>
                     <path d="M45 3 Q28 29 45 55" stroke="#3d1a08" strokeWidth="3" fill="none"/>
                   </svg>
                   <svg viewBox="0 0 80 52" style={{position:'absolute',bottom:60,right:-22,width:85,opacity:.6,transform:'rotate(-35deg)',pointerEvents:'none',zIndex:0}}>
                     <ellipse cx="40" cy="26" rx="38" ry="24" fill="#5c2a10"/><ellipse cx="40" cy="26" rx="34" ry="20" fill="#6b3015"/>
                     <path d="M40 3 Q56 26 40 49" stroke="#3d1a08" strokeWidth="2.5" fill="none"/>
                     <path d="M40 3 Q24 26 40 49" stroke="#3d1a08" strokeWidth="2.5" fill="none"/>
                   </svg>

                   {/* ── Header ── */}
                   <div style={{position:'relative',zIndex:1,textAlign:'center',paddingTop:28,paddingBottom:12,paddingLeft:16,paddingRight:16}}>
                     {/* Logo — click to change */}
                     <div
                       onClick={() => landingLogoRef.current?.click()}
                       className="group"
                       style={{width:64,height:64,borderRadius:'50%',border:'2px solid #d4a97a',backgroundColor:'#3d1a08',margin:'0 auto 10px',overflow:'hidden',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}
                     >
                       {landingLogo
                         ? <img src={landingLogo} alt="logo" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                         : <Coffee style={{width:28,height:28,color:'#d4a97a'}} />}
                       <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0}} className="group-hover:opacity-100 transition-opacity">
                         <span style={{color:'#fff',fontSize:8,fontWeight:700,letterSpacing:2,textTransform:'uppercase'}}>Change</span>
                       </div>
                     </div>
                     <input ref={landingLogoRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                       if(e.target.files?.[0]) { try { setLandingLogo(await compressImage(e.target.files[0], 400)); } catch {} }
                     }} />

                     {/* Business Name */}
                     <div
                       contentEditable suppressContentEditableWarning
                       onBlur={e => setTemplateName(e.currentTarget.textContent || '')}
                       style={{color:'#fff',fontSize:26,fontWeight:700,fontFamily:'Georgia,serif',letterSpacing:'0.06em',cursor:'text',outline:'none',display:'inline-block',padding:'2px 6px',borderRadius:4}}
                       className="hover:bg-white/5 transition"
                       title="Click to edit"
                     >{templateName}</div>

                     {/* Subtitle */}
                     <div style={{marginTop:2}}>
                       <span
                         contentEditable suppressContentEditableWarning
                         onBlur={e => setCafeteriaSubtitle(e.currentTarget.textContent || '')}
                         style={{color:'#d4a97a',fontSize:10,letterSpacing:'0.35em',textTransform:'uppercase',cursor:'text',outline:'none',padding:'2px 4px',borderRadius:3}}
                         className="hover:bg-white/5 transition"
                         title="Click to edit"
                       >• {cafeteriaSubtitle} •</span>
                     </div>

                     {/* Horizontal rule */}
                     <div style={{borderTop:'1px solid rgba(212,169,122,0.35)',marginTop:14,marginBottom:14}} />

                     {/* MENU */}
                     <div style={{color:'#fff',fontSize:36,fontWeight:900,letterSpacing:'0.28em',textTransform:'uppercase',lineHeight:1}}>MENU</div>
                   </div>

                   {/* ── Two-column category grid ── */}
                   <div style={{position:'relative',zIndex:1,padding:'4px 14px 16px'}}>
                     {catEntries.length === 0 ? (
                       <div style={{padding:'40px 0',textAlign:'center',color:'#d4a97a'}}>
                         <p style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.3em',marginBottom:12}}>No items yet.</p>
                         <button onClick={() => { setCameFromEditor(true); setIsEditingTemplate(false); setActiveTab('simple-form'); }}
                           style={{border:'1px solid #d4a97a',color:'#d4a97a',padding:'6px 16px',borderRadius:8,fontSize:10,textTransform:'uppercase',letterSpacing:'0.2em',background:'none',cursor:'pointer'}}>
                           Add First Item
                         </button>
                       </div>
                     ) : (() => {
                       const half = Math.ceil(catEntries.length / 2);
                       const col1 = catEntries.slice(0, half);
                       const col2 = catEntries.slice(half);
                       const RenderCol = (cols: [string, any[]][]) => (
                         <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:18}}>
                           {cols.map(([cat, items]) => (
                             <div key={cat}>
                               <div style={{color:'#d4a97a',fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.25em',marginBottom:6}}>
                                 <InlineCatHeader cat={cat} dark />
                               </div>
                               <div style={{borderTop:'1px solid rgba(212,169,122,0.6)',marginBottom:6}} />
                               <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                 {items.map(item => <InlineItemRow key={item.id} item={item} dark />)}
                               </div>
                               <AddItemInline cat={cat} dark />
                             </div>
                           ))}
                         </div>
                       );
                       return (
                         <div style={{display:'flex',gap:12}}>
                           {RenderCol(col1)}
                           <div style={{width:1,backgroundColor:'rgba(92,42,16,0.8)',flexShrink:0}} />
                           {RenderCol(col2)}
                         </div>
                       );
                     })()}
                   </div>

                   {/* ── Footer ── */}
                   <div style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(212,169,122,0.25)',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                     <span
                       contentEditable suppressContentEditableWarning
                       onBlur={e => setFooterHandle(e.currentTarget.textContent || '')}
                       style={{color:'#d4a97a',fontSize:10,letterSpacing:'0.15em',textTransform:'lowercase',cursor:'text',outline:'none',padding:'2px 4px',borderRadius:3}}
                       className="hover:bg-white/5 transition"
                       title="Click to edit"
                     >{footerHandle}</span>
                     <span
                       contentEditable suppressContentEditableWarning
                       onBlur={e => setFooterWebsite(e.currentTarget.textContent || '')}
                       style={{color:'#d4a97a',fontSize:10,letterSpacing:'0.15em',textTransform:'lowercase',cursor:'text',outline:'none',padding:'2px 4px',borderRadius:3}}
                       className="hover:bg-white/5 transition"
                       title="Click to edit"
                     >{footerWebsite}</span>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* ── TEMP 2 (photo-style) — matches public preview ── */}
          {selectedTemplate.id === 'temp2' && (
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-slate-800 bg-[#0b0d10] min-h-[80vh]">
              {editorView === 'landing' ? (
                <div className="relative min-h-[75vh] overflow-hidden bg-black px-3 py-5 text-white sm:px-5 sm:py-7">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-[10%] top-[6%] h-[38%] w-[55%] rotate-[-1deg] bg-[#141416] opacity-90" />
                    <div className="absolute -right-[6%] top-[20%] h-[34%] w-[46%] rotate-[2deg] bg-[#1a1c20] opacity-85" />
                    <div className="absolute bottom-[8%] left-[14%] h-[24%] w-[40%] rotate-[1deg] bg-[#121214] opacity-80" />
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.05),transparent)]" />

                  <div className="relative z-10 flex min-h-[70vh] flex-col pb-6">
                    <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8">
                      <div className="flex flex-col justify-center">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => setLandingHeadline(e.currentTarget.textContent || '')}
                          className="text-[9px] font-medium uppercase tracking-[0.45em] text-white/45 outline-none focus:ring-1 focus:ring-white/20 sm:text-[10px]"
                        >{landingHeadline}</div>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => setTemplateName(e.currentTarget.textContent || '')}
                          className="mt-3 font-sans text-3xl font-bold uppercase leading-[0.98] tracking-[0.02em] outline-none focus:ring-1 focus:ring-white/20 sm:text-4xl"
                          title="Business name"
                        >{templateName}</div>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => setLandingSubtext(e.currentTarget.textContent || '')}
                          className="mt-4 max-w-md text-xs leading-relaxed text-white/55 outline-none focus:ring-1 focus:ring-white/20 sm:text-sm"
                        >{landingSubtext}</div>

                        <div className="mt-6 flex items-baseline gap-3">
                          <span className="font-serif text-3xl font-light italic text-white/90 sm:text-4xl">Hot</span>
                          <span className="h-px flex-1 bg-gradient-to-r from-white/50 to-transparent" />
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditorView('menu')}
                            className="group inline-flex items-center gap-2 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black shadow-sm transition hover:bg-white/90 sm:text-xs"
                          >
                            View menu
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </button>
                          <span className="text-[10px] text-white/35">Preview — tap Full Menu above</span>
                        </div>
                      </div>

                      <div
                        className="relative min-h-[200px] cursor-pointer overflow-hidden bg-[#0d0d0f] shadow-lg ring-1 ring-white/10 sm:min-h-[260px]"
                        onClick={() => landingLogoRef.current?.click()}
                        title="Click to change hero image"
                      >
                        {landingLogo ? (
                          <img src={landingLogo} alt="" className="h-full w-full min-h-[200px] object-cover sm:min-h-[260px]" />
                        ) : (
                          <img
                            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
                            alt=""
                            className="h-full w-full min-h-[200px] object-cover opacity-95 sm:min-h-[260px]"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/35 hover:opacity-100">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Change image</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-white/[0.08] pt-6">
                      <div className="grid items-center gap-4 md:grid-cols-[1fr_1.1fr] md:gap-6">
                        <div className="relative aspect-[5/4] max-h-[140px] overflow-hidden bg-[#111] ring-1 ring-white/10 sm:max-h-[160px]">
                          <img
                            src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80"
                            alt=""
                            className="h-full w-full object-cover opacity-95"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
                        </div>
                        <div>
                          <div className="mb-2 flex items-center gap-3">
                            <span className="h-px flex-1 bg-gradient-to-l from-white/40 to-transparent" />
                            <span className="font-serif text-3xl font-light italic text-white/90 sm:text-4xl">Cold</span>
                          </div>
                          <p className="text-[11px] text-white/40">Cold section preview — full list in Full Menu.</p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-6 text-center text-[8px] font-mono uppercase tracking-[0.35em] text-white/25">Powered by Thing in Tech</p>
                  </div>

                  <input ref={landingLogoRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                    if (e.target.files?.[0]) {
                      try { setLandingLogo(await compressImage(e.target.files[0], 400)); } catch {}
                    }
                  }} />
                </div>
              ) : (
                <div className="min-h-[75vh] px-3 py-5 text-white font-sans">
                  <div className="relative overflow-hidden bg-black/60 p-4 sm:p-6">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
                    <div className="relative z-10 grid gap-4 md:grid-cols-[1.15fr_1fr]">
                      <div>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => setTemplateName(e.currentTarget.textContent || '')}
                          className="text-3xl sm:text-4xl font-semibold uppercase tracking-wide leading-tight outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                          title="Click to edit"
                        >{templateName}</div>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-3xl sm:text-4xl font-light">Hot</span>
                          <span className="h-px flex-1 bg-white/60" />
                        </div>
                        <div className="mt-4 space-y-1 pr-1 max-h-[52vh] overflow-y-auto">
                          {hotItems.length === 0 && menuItems.length === 0 ? (
                            <div className="py-6 text-center text-white/50 text-xs">
                              <p className="mb-3 uppercase tracking-widest">No items yet</p>
                              <button
                                type="button"
                                onClick={() => { setCameFromEditor(true); setIsEditingTemplate(false); setActiveTab('simple-form'); }}
                                className="border border-white/30 px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white/10"
                              >
                                Add first item
                              </button>
                            </div>
                          ) : (
                            <>
                              {hotItems.slice(0, 12).map(item => <InlineItemRow key={item.id} item={item} photoDark />)}
                              <AddItemInline cat={hotCatName} photoDark />
                            </>
                          )}
                        </div>
                      </div>
                      <div
                        className="relative min-h-[220px] overflow-hidden bg-white/5 cursor-pointer group"
                        onClick={() => landingLogoRef.current?.click()}
                      >
                        {landingLogo ? (
                          <img src={landingLogo} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <img
                            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-[8px] uppercase tracking-wider text-white/80 opacity-0 group-hover:opacity-100 transition">Hero image</div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-[1fr_1.15fr]">
                      <div className="relative min-h-[200px] overflow-hidden bg-white/5">
                        <img
                          src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80"
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div className="bg-black/60 px-3 py-4 sm:px-5">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="h-px flex-1 bg-white/60" />
                          <span className="text-3xl sm:text-4xl font-light">Cold</span>
                        </div>
                        <div className="space-y-1 max-h-[48vh] overflow-y-auto">
                          {coldItems.slice(0, 12).map(item => <InlineItemRow key={item.id} item={item} photoDark />)}
                          {menuItems.length > 0 && <AddItemInline cat={coldCatName} photoDark />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <input ref={landingLogoRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                    if (e.target.files?.[0]) {
                      try { setLandingLogo(await compressImage(e.target.files[0], 400)); } catch {}
                    }
                  }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ITEM DETAIL PAGE ─────────────────────────────────────────────────────
  if (selectedItem) {
    const item = menuItems.find(i => i.id === selectedItem.id) ?? selectedItem;
    const handleDetailSave = () => {
      const updated = {
        ...item,
        name: detailEditing.name || item.name,
        price: parseFloat(detailEditing.price.replace(/[^0-9.]/g, '')) || item.price,
        description: detailEditing.description,
      };
      const newItems = menuItems.map(i => i.id === item.id ? updated : i);
      setMenuItems(newItems);
      saveMenuData(newItems, categories);
      setSelectedItem(updated);
      toast.success('Saved!');
    };
    const handleDetailPhoto = async (file: File | null | undefined) => {
      if (!file) return;
      try {
        const b64 = await compressImage(file);
        const updated = { ...item, image_url: b64 };
        const newItems = menuItems.map(i => i.id === item.id ? updated : i);
        setMenuItems(newItems);
        saveMenuData(newItems, categories);
        setSelectedItem(updated);
        toast.success('Photo updated!');
      } catch { toast.error('Failed to load image'); }
    };
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedItem(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-bold text-lg flex-1 truncate">{item.name}</span>
          <button onClick={handleDetailSave} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition" style={{ backgroundColor: '#6b2d0f' }}>
            <Check className="w-3.5 h-3.5" /> Save
          </button>
        </div>

        {/* Photo section */}
        <div className="relative w-full" style={{ backgroundColor: '#1a0a02' }}>
          <div className="max-w-lg mx-auto">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full max-h-72 object-cover" />
            ) : (
              <div className="w-full h-56 flex flex-col items-center justify-center gap-3" style={{ color: '#7a4020' }}>
                <ImageIcon className="w-16 h-16 opacity-30" />
                <span className="text-xs uppercase tracking-widest opacity-50">No photo yet</span>
              </div>
            )}
            {/* Photo overlay button */}
            <button
              onClick={() => detailFileRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-sm"
            >
              <Camera className="w-4 h-4" /> {item.image_url ? 'Change Photo' : 'Add Photo'}
            </button>
            <input ref={detailFileRef} type="file" accept="image/*" className="hidden" onChange={e => handleDetailPhoto(e.target.files?.[0])} />
          </div>
        </div>

        {/* Details */}
        <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: '#3d1a08', color: '#e8c89a' }}>
            {item.category?.name || 'Uncategorized'}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7a4020' }}>Item Name</label>
            <input
              value={detailEditing.name}
              onChange={e => setDetailEditing(p => ({ ...p, name: e.target.value }))}
              placeholder={item.name}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7a4020' }}>Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
              <input
                value={detailEditing.price}
                onChange={e => setDetailEditing(p => ({ ...p, price: e.target.value }))}
                placeholder={parseFloat(item.price).toFixed(2)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7a4020' }}>Description</label>
            <textarea
              value={detailEditing.description}
              onChange={e => setDetailEditing(p => ({ ...p, description: e.target.value }))}
              placeholder={item.description || 'Add a description...'}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-700 resize-none"
            />
          </div>

          <button onClick={() => { handleDelete(item.id); setSelectedItem(null); }}
            className="w-full mt-4 py-3 rounded-xl border border-red-900 text-red-400 text-sm font-bold uppercase tracking-widest hover:bg-red-900/20 transition flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Item
          </button>
        </div>
      </div>
    );
  }
  const { qrCode } = useProfile();
  const hasLocalQR = !!localStorage.getItem('local_qr_code');

  if (!qrCode && !hasLocalQR) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <QrCode className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">QR Code Required</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">You must generate a QR code for your business before you can create and manage your digital menu.</p>
        </div>
        <button onClick={() => navigate('/dashboard/qr')} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 transition text-white rounded-xl font-bold shadow-md">
          Go to QR Setup
        </button>
      </div>
    );
  }

  const isDashboardView = !localStorage.getItem('digitize_active_menu_slug');

  if (isDashboardView) {
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem('local_qr_codes') || '[]'); } catch (e) {}
    if (!Array.isArray(arr)) arr = [];
    const legacyQR = localStorage.getItem('local_qr_code');
    if (arr.length === 0 && legacyQR) {
        try { arr.push(JSON.parse(legacyQR)); } catch (e) {}
    }
    const allQRs = arr.length > 0 ? arr : (qrCode ? [qrCode] : []);

    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Menu Space</h1>
          <p className="text-slate-500 mt-1">Select a menu area below to edit its contents, layout, and style.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {allQRs.map((renderQR, idx) => {
             const manualSlug = renderQR.encoded_path ? renderQR.encoded_path.replace('/', '') : (business?.slug || 'local');
             const publicUrl = renderQR.destination_url || (business ? `${window.location.origin}/${manualSlug}` : '');
             return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center max-w-3xl hover:border-purple-200 transition-colors">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                     <h3 className="text-xl font-bold text-slate-900">Menu for: {manualSlug}</h3>
                   </div>
                   <p className="text-sm font-mono text-slate-500 mt-1">Bound to section URL: <a href={publicUrl} target="_blank" className="text-purple-600 hover:underline">{publicUrl}</a></p>
                </div>
                <button onClick={() => {
                   localStorage.setItem('digitize_active_menu_slug', manualSlug);
                   window.location.reload();
                }} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md">
                   Edit Menu Content →
                </button>
              </div>
             )
          })}
        </div>
      </div>
    );
  }

  if (!saved.templateId && !showingTemplates) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto mt-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Design Templates</h2>
          <p className="text-slate-600">Select a theme for your digital menu.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
          {templates.map(t => (
            <div key={t.id} className="border-2 border-slate-200 hover:border-purple-500 rounded-2xl p-4 flex flex-col items-center cursor-pointer transition">
              <div className="h-24 w-full rounded-xl overflow-hidden flex shrink-0 mb-4 shadow">
                 <div style={{ width: '60%', backgroundColor: t.primaryColor }} className="h-full" />
                 <div style={{ width: '40%', backgroundColor: t.secondaryColor }} className="h-full" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{t.name}</h3>
              <p className="text-[11px] text-slate-500 mb-4">{t.subtitle}</p>
              <button onClick={() => {
                const newData = { templateId: t.id, templateName: t.name, primaryColor: t.primaryColor, secondaryColor: t.secondaryColor, landingHeadline: '', landingSubtext: '', landingLogo: null };
                localStorage.setItem(lsKey, JSON.stringify(newData));
                setSelectedTemplate(t);
                setTemplateName(t.name);
                setTemplatePrimary(t.primaryColor);
                setTemplateSecondary(t.secondaryColor);
                setShowingTemplates(true);
              }} className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition">
                Use this template
              </button>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-4 text-left">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">Did you know?</h4>
            <p className="text-sm">Your menu updates instantly on all QR scans. No need to reprint anything!</p>
          </div>
        </div>

        <div className="flex items-center gap-4 my-8">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="border border-slate-200 rounded-2xl p-6 text-center bg-slate-50 transition hover:border-purple-300">
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg mb-1">Upload Menu File Only</h3>
          <p className="text-sm text-slate-500 mb-4">Have an existing PDF or image? Upload it directly.</p>
          <button onClick={() => {
             const newData = { templateId: 'upload-only' };
             localStorage.setItem(lsKey, JSON.stringify(newData));
             setShowingTemplates(true);
             setActiveTab('upload');
          }} className="px-6 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-100 transition shadow-sm">
            Upload PDF / Image
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => {
            localStorage.removeItem('digitize_active_menu_slug');
            window.location.reload();
          }} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-purple-600 transition">
             <ArrowLeft className="w-4 h-4" /> Back to Menu Space
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Menu Manager</h1>
          <p className="text-slate-500 mt-1">Organize and update your digital menu for <span className="font-semibold text-purple-600">{business?.name || 'Your Business'}</span>.</p>

          {/* Template picker */}
          <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Design Template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((t) => {
                const isActive = selectedTemplate.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(t);
                      setTemplateName(t.name);
                      setTemplatePrimary(t.primaryColor);
                      setTemplateSecondary(t.secondaryColor);
                    }}
                    className={`text-left flex items-center gap-3 p-3 rounded-xl border-2 transition ${isActive ? 'border-amber-700/40 bg-amber-950/5' : 'border-slate-200 hover:border-purple-300'}`}
                  >
                    <div className="h-10 w-14 rounded-lg overflow-hidden flex shrink-0">
                      <div style={{ width: '60%', backgroundColor: t.primaryColor }} className="h-full" />
                      <div style={{ width: '40%', backgroundColor: t.secondaryColor }} className="h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.subtitle}</p>
                    </div>
                    {isActive && <span className="ml-auto text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">Active</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Template Name</label>
                <input value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Primary Color</label>
                <input type="color" value={templatePrimary} onChange={e => setTemplatePrimary(e.target.value)} className="w-full h-10 p-0 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Secondary Color</label>
                <input type="color" value={templateSecondary} onChange={e => setTemplateSecondary(e.target.value)} className="w-full h-10 p-0 border rounded-lg" />
              </div>
            </div>            <div className="mt-3">
              <button
                onClick={() => {
                  setSelectedTemplate({ ...selectedTemplate, name: templateName, primaryColor: templatePrimary, secondaryColor: templateSecondary });
                  setActiveTab('items');
                  setIsEditingTemplate(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-white text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: selectedTemplate.primaryColor }}>
                <Edit2 className="w-4 h-4" /> Apply & Edit Design
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          {!isEmpty && (
            <Button 
              variant="primary" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg border-indigo-500"
              onClick={publishToSupabase}
              disabled={isPublishing}
            >
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              Publish to Live
            </Button>
          )}
          {activeTab === 'items' && !isEmpty && (
            <Button variant="outline" className="border-slate-200 text-slate-700 bg-white shadow-sm"
              onClick={() => window.open(`/${activeSlug}`, '_blank')}>
              <SwitchCamera className="w-4 h-4 mr-2" /> Preview Menu
            </Button>
          )}
          {activeTab !== 'simple-form' ? (
            <Button variant="primary" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg" onClick={() => setActiveTab('simple-form')}>
              <Plus className="w-4 h-4 mr-2" /> Add Manually
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => {
              if (cameFromEditor) { setCameFromEditor(false); setActiveTab('items'); setIsEditingTemplate(true); }
              else { setActiveTab(isEmpty ? 'upload' : 'items'); }
            }}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'upload' && isEmpty ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-4xl mx-auto mt-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Let's build your first menu</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
              You don't have to build it item-by-item. <span className="text-purple-600 font-semibold underline decoration-2 underline-offset-4">Digitize your menu</span> by uploading a PDF or a photo, and our AI will do the rest.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="group relative overflow-hidden bg-white border-2 border-slate-200 rounded-3xl p-8 hover:border-purple-500 hover:shadow-2xl transition-all cursor-pointer text-center"
                onClick={() => toast.info('Digitization coming soon! Try adding items manually for now.')}>
                <div className="absolute top-0 right-0 p-3">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">AI Digitization</span>
                </div>
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Menu File</h3>
                <p className="text-sm text-slate-500">Fastest way! Image or PDF. We'll handle prices and names automatically.</p>
              </div>
              <div className="group bg-slate-50 border-2 border-transparent rounded-3xl p-8 hover:bg-white hover:border-slate-300 hover:shadow-2xl transition-all cursor-pointer text-center"
                onClick={() => setActiveTab('simple-form')}>
                <div className="w-16 h-16 bg-white text-slate-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Add Manually</h3>
                <p className="text-sm text-slate-500">Perfect for smaller menus or testing things out. Fast and reliable.</p>
              </div>
            </div>
          </motion.div>

        ) : activeTab === 'simple-form' ? (
          <motion.div key="manual" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-2xl mx-auto mt-6">
            <Card className="shadow-2xl border-slate-200 overflow-hidden ring-1 ring-slate-100">
              <div className="bg-slate-900 text-white p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold">New Menu Item</h2>
                <p className="text-slate-400 text-sm mt-1">Fill in the details to add to {business?.name}</p>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category Name</label>
                    <Input placeholder="e.g. Mains, Desserts, Beverages" value={categoryName} onChange={e => setCategoryName(e.target.value)} required className="h-12 text-lg focus:ring-purple-500" list="categories-list" />
                    <datalist id="categories-list">{categories.map(c => <option key={c.id} value={c.name} />)}</datalist>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-slate-700">Item Name</label>
                      <Input placeholder="e.g. Truffle Fries" value={itemName} onChange={e => setItemName(e.target.value)} required className="h-12 focus:ring-purple-500" />
                    </div>
                    <div className="space-y-2 col-span-1">
                      <label className="text-sm font-bold text-slate-700">Price (USD)</label>
                      <Input placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} required className="h-12 focus:ring-purple-500 font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">Photo (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-purple-300 cursor-pointer transition-all">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <span className="text-sm font-medium text-slate-600 block">Drag & drop photo here</span>
                      <span className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</span>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => {
                      if (cameFromEditor) { setCameFromEditor(false); setActiveTab('items'); setIsEditingTemplate(true); }
                      else { setActiveTab(isEmpty ? 'upload' : 'items'); }
                    }} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" className="flex-1 h-12 bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save to Menu'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Preview (read-only) */}
            <div className={`rounded-3xl overflow-hidden border ${selectedTemplate.background} ${selectedTemplate.text} shadow-sm`}>
              <div className="p-3 flex items-center justify-between" style={{ backgroundColor: selectedTemplate.primaryColor }}>
                <span className="text-xs font-bold uppercase tracking-wider text-white">Menu Directory — {selectedTemplate.name}</span>
                <span className="text-xs font-medium text-white">{menuItems.length} items</span>
              </div>
              <div className="bg-white/90 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr>
                      {['Category', 'Item & Description', 'Price', 'Actions'].map(h => (
                        <th key={h} className="p-4 font-bold text-slate-900 text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {menuItems.map(item => (
                      <tr key={item.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => { setSelectedItem(item); setDetailEditing({ name: item.name, price: String(item.price), description: item.description || '' }); }}
                      >
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">{item.category?.name || 'Mains'}</span>
                        </td>
                        <td className="p-4 text-slate-700">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                              {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{item.name}</span>
                              <span className="text-xs text-slate-500 truncate max-w-[200px] block">Freshly made, high quality ingredients.</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-emerald-600 font-bold text-lg">${parseFloat(item.price).toFixed(2)}</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50" onClick={() => setIsEditingTemplate(true)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-9 w-9 p-0 text-red-300 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {menuItems.length === 0 && (
                  <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                    <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="font-medium">No menu items found for this business.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('simple-form')}>Start adding manually</Button>
                  </div>
                )}
              </div>
            </div>

            {!isEmpty && (
              <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-xl"><Sparkles className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h4 className="font-bold text-purple-900 text-sm">Did you know?</h4>
                  <p className="text-purple-700 text-xs mt-0.5">Your menu updates instantly on all QR scans. No need to reprint anything!</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
