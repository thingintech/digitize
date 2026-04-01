import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LayoutDashboard, FileText, QrCode, MapPin, BarChart3, Settings, Bell, LogOut, Search, HelpCircle } from 'lucide-react';
import { Input, Button } from '../components/ui';
import logoImg from '../../assets/621512a35355742a817b6afc8fd95aa05e5b4349.png';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
  const { profile, user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu Manager', path: '/dashboard/menu', icon: FileText },
    { name: 'QR Codes', path: '/dashboard/qr', icon: QrCode },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    { name: 'Support', path: '/dashboard/support', icon: HelpCircle },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
            <img src={logoImg} alt="Thing in Tech Logo" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Thing in Tech</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0 uppercase font-bold">
              {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-slate-900 dark:text-white">{profile?.full_name || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <button onClick={handleSignOut} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex-1 flex items-center gap-4">
            {/* Mobile menu button could go here */}
            <div className="relative w-64 hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 bg-slate-100 border-transparent dark:bg-slate-800 dark:border-transparent focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 rounded-full">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              View Public Menu
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
