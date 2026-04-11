import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '../components/ui';
import { ArrowUpRight, ArrowDownRight, Users, QrCode, Utensils, Star, Smartphone } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'sonner';

export function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { business, loading: profileLoading } = useProfile();
  const [stats, setStats] = useState([
    { title: 'Total Scans', value: '0', change: '0%', positive: true, icon: QrCode },
    { title: 'Active Menu Items', value: '0', change: '0', positive: true, icon: Utensils },
    { title: 'Customer Reviews', value: '4.8', change: '4.8', positive: true, icon: Star },
    { title: 'Unique Visitors', value: '0', change: '0%', positive: true, icon: Users },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user || !business) {
        if (!profileLoading) setLoading(false);
        return;
      }
      
      try {
        const bId = business.id;

        // 2. Fetch Item Count
        const { count: itemCount } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', bId);

        // 3. Fetch Scan Count
        const { count: scanCount } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', bId)
          .eq('event_type', 'qr_scan');

        // 4. Fetch Visitor Count (Simplified)
        const { count: visitorCount } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', bId)
          .eq('event_type', 'page_view');

        setStats([
          { title: 'Total Scans', value: (scanCount || 0).toLocaleString(), change: '+0%', positive: true, icon: QrCode },
          { title: 'Active Menu Items', value: (itemCount || 0).toString(), change: '+0', positive: true, icon: Utensils },
          { title: 'Customer Reviews', value: '4.8', change: '+0', positive: true, icon: Star },
          { title: 'Unique Visitors', value: (visitorCount || 0).toLocaleString(), change: '+0%', positive: true, icon: Users },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }

    if (!profileLoading) {
      fetchStats();
    }
  }, [user, business, profileLoading]);

  if (loading || profileLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 w-64 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 w-96 rounded mt-2"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 w-32 rounded"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 w-36 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 w-24 rounded"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 w-16 rounded"></div>
                  </div>
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 w-32 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your digital storefront today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Smartphone className="w-4 h-4 mr-2" />
            Preview Menu
          </Button>
          <Button variant="primary">Download QR Code</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <stat.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`flex items-center font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.change}
                </span>
                <span className="text-slate-500 ml-2">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions with your digital storefront</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { time: 'Just now', title: 'Live Dashboard', desc: 'Real-time counters are now active and synced with Supabase.', type: 'system' },
                { time: '10 minutes ago', title: 'New 5-star review', desc: '"Great coffee and friendly staff!" - Sarah M.', type: 'review' },
                { time: '2 hours ago', title: 'Menu updated', desc: 'You updated the price of "Avocado Toast" to $12.00', type: 'menu' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                    {i !== 2 && <div className="w-px h-full bg-slate-200 dark:bg-slate-800 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.desc}</p>
                    <span className="text-xs text-slate-400 mt-2 block">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 text-left" onClick={() => navigate('/dashboard/menu')}>
              <Utensils className="w-5 h-5 mr-3 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Add Menu Item</p>
                <p className="text-xs text-slate-500">Create a new dish or drink</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 text-left" onClick={() => navigate('/dashboard/qr')}>
              <QrCode className="w-5 h-5 mr-3 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Print QR Code</p>
                <p className="text-xs text-slate-500">Download high-res PDF</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3 px-4 text-left" onClick={() => navigate('/dashboard/support')}>
              <Star className="w-5 h-5 mr-3 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Help & Support</p>
                <p className="text-xs text-slate-500">Get assistance with your setup</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
