import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, LoadingSpinner } from '../components/ui';
import { Plus, UploadCloud, Edit2, Trash2, SwitchCamera, Image as ImageIcon, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
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

  // Simple Form State
  const [categoryName, setCategoryName] = useState('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch data on load
  useEffect(() => {
    async function fetchMenuData() {
      if (!user || !business) {
        // if (!profileLoading) setLoading(false);
        // return;
      }

      setLoading(true);

      try {
        const bId = business.id;

        // Fetch Categories
        const { data: cData, error: cError } = await supabase
          .from('menu_categories')
          .select('id, name')
          .eq('business_id', bId)
          .order('sort_order');

        if (cError) throw cError;
        if (cData) setCategories(cData);

        // Fetch Items
        const { data: iData, error: iError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, image_url, is_featured, is_available, category:menu_categories(name)')
          .eq('business_id', bId)
          .order('created_at', { ascending: false });

        if (iError) throw iError;

        if (iData && iData.length > 0) {
          setMenuItems(iData);
          setIsEmpty(false);
          setActiveTab('items');
        } else {
          setIsEmpty(true);
          setActiveTab('upload');
        }
      } catch (err: any) {
        console.error("Menu fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!profileLoading) {
      fetchMenuData();
    }
  }, [user, business, profileLoading]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !itemName || !price || !business) return;

    setIsSubmitting(true);
    try {
      // 1. Check if category exists or create a new one
      let catId = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())?.id;

      if (!catId) {
        const { data: newCat, error: catErr } = await supabase
          .from('menu_categories')
          .insert({ business_id: business.id, name: categoryName })
          .select('id, name')
          .single();

        if (catErr) throw catErr;
        if (newCat) {
          catId = newCat.id;
          setCategories([...categories, newCat]);
        }
      }

      // 2. Insert Menu Item into Supabase
      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (isNaN(numericPrice)) {
        toast.error("Please enter a valid price number.");
        setIsSubmitting(false);
        return;
      }

      const { data: newItem, error: itemErr } = await supabase
        .from('menu_items')
        .insert({
          business_id: business.id,
          category_id: catId,
          name: itemName,
          price: numericPrice,
          is_available: true
        })
        .select('id, name, description, price, image_url, is_featured, is_available, category:menu_categories(name)')
        .single();

      if (itemErr) throw itemErr;

      // 3. Update UI
      if (newItem) {
        setMenuItems([newItem, ...menuItems]);
        setIsEmpty(false);
        setActiveTab('items');
        setCategoryName(''); setItemName(''); setPrice('');
        toast.success("Item added successfully!");
      }
    } catch (err: any) {
      toast.error("Failed to add item: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      const remainingItems = menuItems.filter(item => item.id !== id);
      setMenuItems(remainingItems);
      if (remainingItems.length === 0) {
        setIsEmpty(true);
        setActiveTab('upload');
      }
      toast.success("Item deleted.");
    } else {
      toast.error("Failed to delete item.");
    }
  };

  // // Rendering States
  // if (profileLoading || (loading && menuItems.length === 0 && !business)) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[400px]">
  //       <LoadingSpinner />
  //       <p className="text-slate-500 font-medium animate-pulse">Loading your menu...</p>
  //     </div>
  //   );
  // }

  if (!business) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center max-w-2xl mx-auto mt-20">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Plus className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Your Business First</h2>
        <p className="text-slate-600 mb-8">We couldn't find a business profile linked to your account. Please complete your registration first.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold">Start Setup</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Menu Manager</h1>
          <p className="text-slate-500 mt-1">Organize and update your digital menu for <span className="font-semibold text-purple-600">{business.name}</span>.</p>
        </div>

        <div className="flex gap-3">
          {activeTab === 'items' && !isEmpty && (
            <Button variant="outline" className="border-slate-200 text-slate-700 bg-white shadow-sm" onClick={() => window.open(`/${business.slug}`, '_blank')}>
              <SwitchCamera className="w-4 h-4 mr-2" />
              Preview Menu
            </Button>
          )}

          {activeTab !== 'simple-form' ? (
            <Button variant="primary" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg" onClick={() => setActiveTab('simple-form')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Manually
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setActiveTab(isEmpty ? 'upload' : 'items')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'upload' && isEmpty ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-4xl mx-auto mt-10"
          >
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full" />
              <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                <img src="https://images.unsplash.com/photo-1652795386123-6e622fbf5164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMGlsbHVzdHJhdGlvbiUyMG9yJTIwZnJpZW5kbHklMjBjaGVmfGVufDF8fHx8MTc3NTAzNTczOXww&ixlib=rb-4.1.0&q=80&w=1080" alt="Friendly Chef" className="w-full h-full object-cover" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-4">Let's build your first menu</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
              You don't have to build it item-by-item. <span className="text-purple-600 font-semibold underline decoration-2 underline-offset-4">Digitize your menu</span> by uploading a PDF or a photo, and our AI will do the rest.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="group relative overflow-hidden bg-white border-2 border-slate-200 rounded-3xl p-8 hover:border-purple-500 hover:shadow-2xl transition-all cursor-pointer text-center" onClick={() => toast.info("Digitization is coming soon! Try adding items manually for now.")}>
                <div className="absolute top-0 right-0 p-3">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">AI Digitization</span>
                </div>
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Menu File</h3>
                <p className="text-sm text-slate-500">Fastest way! Image or PDF. We'll handle prices and names automatically.</p>
              </div>

              <div className="group bg-slate-50 border-2 border-transparent rounded-3xl p-8 hover:bg-white hover:border-slate-300 hover:shadow-2xl transition-all cursor-pointer text-center" onClick={() => setActiveTab('simple-form')}>
                <div className="w-16 h-16 bg-white text-slate-700 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Add Manually</h3>
                <p className="text-sm text-slate-500">Perfect for smaller menus or testing things out. Fast and reliable.</p>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'simple-form' ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-2xl mx-auto mt-6"
          >
            <Card className="shadow-2xl border-slate-200 overflow-hidden ring-1 ring-slate-100">
              <div className="bg-slate-900 text-white p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-3">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold">New Menu Item</h2>
                <p className="text-slate-400 text-sm mt-1">Fill in the details to add to {business.name}</p>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category Name</label>
                    <Input placeholder="e.g. Mains, Desserts, Beverages" value={categoryName} onChange={e => setCategoryName(e.target.value)} required className="h-12 text-lg focus:ring-purple-500" list="categories-list" />
                    <datalist id="categories-list">
                      {categories.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
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
                    <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => { setActiveTab(isEmpty ? 'upload' : 'items'); }} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" className="flex-1 h-12 bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save to Menu"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-1 px-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 py-3">Menu Directory</span>
                <span className="text-xs font-medium text-slate-500">{menuItems.length} items listed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr>
                      <th className="p-4 font-bold text-slate-900 text-sm">Category</th>
                      <th className="p-4 font-bold text-slate-900 text-sm">Item & Description</th>
                      <th className="p-4 font-bold text-slate-900 text-sm">Price</th>
                      <th className="p-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">{item.category?.name || 'Mains'}</span>
                        </td>
                        <td className="p-4 text-slate-700">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                              {item.image_url ?
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> :
                                <ImageIcon className="w-5 h-5 text-slate-300 font-bold" />
                              }
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
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50"><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-9 w-9 p-0 text-red-300 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

            {/* Quick Tutorial Tip */}
            {!isEmpty && (
              <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
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
