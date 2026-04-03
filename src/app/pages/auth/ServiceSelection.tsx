import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, Button } from '../../components/ui';
import { QrCode, Globe, Star, Check } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function ServiceSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [services, setServices] = useState({
    qr_menu: true,
    website: true,
    feedback_form: true,
  });

  useEffect(() => {
    async function getBusiness() {
      if (!user) return;
      const { data, error } = await supabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setBusinessId(data.business_id);
      } else if (error) {
        console.error("Error fetching business:", error);
      }
    }
    getBusiness();
  }, [user]);

  const toggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = async () => {
    if (!businessId) {
      toast.error("No business found. Head to dashboard to create one.");
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('business_settings')
        .upsert({
          business_id: businessId,
          key: 'enabled_services',
          value: services,
        }, { onConflict: 'business_id,key' });

      if (error) throw error;
      
      toast.success("Ready to go!");
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const serviceList = [
    {
      id: 'qr_menu',
      title: 'QR for Menu',
      description: 'Generate QR codes that customers can scan to view your digital menu.',
      icon: QrCode,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      id: 'website',
      title: 'Business Website',
      description: 'A beautiful, SEO-optimized landing page for your business.',
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'feedback_form',
      title: 'Review Feedback Form',
      description: 'Collect private feedback and public reviews from your customers.',
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 px-4 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Step 2 of 2
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Choose your services
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Select the tools you'd like to activate for your business right now. You can change this later.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {serviceList.map((service) => (
            <Card 
              key={service.id} 
              className={`cursor-pointer transition-all border-2 ${services[service.id as keyof typeof services] ? 'border-purple-600 shadow-md ring-1 ring-purple-600/10' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => toggleService(service.id as keyof typeof services)}
            >
              <CardContent className="p-6 flex items-center gap-6">
                <div className={`p-4 rounded-xl ${service.bgColor} ${service.color} shrink-0`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                  <p className="text-slate-500 mt-1 text-sm sm:text-base leading-relaxed">{service.description}</p>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${services[service.id as keyof typeof services] ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'}`}>
                  {services[service.id as keyof typeof services] && <Check className="w-5 h-5 stroke-[3]" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Button 
            className="w-full sm:w-64 h-14 text-lg font-bold rounded-xl shadow-lg hover:translate-y-[-2px] active:translate-y-[0px] transition-all" 
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
