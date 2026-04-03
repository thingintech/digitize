import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FileText,
  QrCode,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Search,
  HelpCircle,
  Menu as MenuIcon,
  X,
  ExternalLink,
  ChevronRight,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input, Button, LoadingSpinner } from '../components/ui';
import logoImg from '/assets/preview.png';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { OnboardingWizard } from '../components/OnboardingWizard';

export function DashboardLayout() {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const { business, isReady, loading: profileLoading, lifecycle } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Business Profile', path: '/dashboard/profile', icon: User },
    { name: 'Menu Maker', path: '/dashboard/menu', icon: FileText },
    { name: 'QR Setup', path: '/dashboard/qr', icon: QrCode },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const activeItem = navItems.find(item =>
    item.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.path)
  ) || { name: 'Dashboard' };

  // Wait gracefully for data using the unified loading state merged from both contexts
  const [showRetry, setShowRetry] = useState(false);
  const { refreshProfile } = useProfile();

  React.useEffect(() => {
    if (!isReady) {
      const wait = setTimeout(() => setShowRetry(true), 4000);
      return () => clearTimeout(wait);
    } else {
      setShowRetry(false);
    }
  }, [isReady]);

  React.useEffect(() => {
    if (isReady && !authLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, isReady, authLoading]);

  if (!isReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
            <LoadingSpinner className="relative scale-150 text-purple-600" />
          </div>
          <div className="text-center p-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Syncing space...</h2>
            <p className="text-sm text-slate-500 mt-1">Preparing your business dashboard</p>

            {showRetry && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center gap-3">
                <p className="text-xs text-red-500/80 font-bold bg-red-500/10 px-3 py-1 rounded-full">Taking longer than expected?</p>
                <Button variant="secondary" onClick={() => refreshProfile()} className="font-bold border-slate-200">
                  Force Retry Connection
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 z-[70] shadow-2xl p-6 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img src={business?.logo_url || logoImg} alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
                  <span className="font-black text-xl tracking-tighter">DIGITIZE</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl">
                  <X className="w-5 h-5 text-slate-500" />
                </Button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <MobileNavLink key={item.name} item={item} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
              </nav>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <button onClick={handleSignOut} className="flex items-center gap-3 text-red-500 hover:text-red-600 px-3 py-2 w-full transition-colors font-bold">
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col hidden md:flex relative group">

        <div className="h-20 flex items-center px-8 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
              <img src={logoImg} alt="Logo" className="w-8 h-8 relative" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase italic">Digitize</span>
          </div>
        </div>

        {/* Business Context */}
        <div className="px-6 py-6">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center gap-3 transition-all hover:border-purple-200 dark:hover:border-purple-800">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden shrink-0">
              {business?.logo_url ? (
                <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-purple-600 dark:text-purple-400 font-bold">{business?.name?.[0] || 'D'}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-ellipsis overflow-hidden">Workspace</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{business?.name || 'Loading...'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-1 py-1">
          {navItems.map((item) => (
            <DesktopNavLink key={item.name} item={item} />
          ))}
        </nav>

        {/* User Card */}
        <div className="p-6">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-5 shadow-inner relative overflow-hidden group/card transition-all hover:ring-2 ring-purple-500/20">
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500/50 p-0.5 shrink-0 bg-slate-700">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  className="w-full h-full rounded-full"
                  alt="Avatar"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-slate-400 font-medium">Account</p>
                <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'Admin User'}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative overflow-hidden">

        {/* Header */}
        <header className="h-20 flex-shrink-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between px-6 md:px-10 z-50 sticky top-0">

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 -ml-2 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </Button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Dashboard</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-purple-600 dark:text-purple-400">{activeItem.name}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                {activeItem.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl px-3 py-2 border border-slate-200/50 dark:border-slate-800/50 transition-all focus-within:ring-2 ring-purple-500/20">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Universal search..."
                className="bg-transparent border-none text-sm outline-none w-48 text-slate-600 placeholder:text-slate-400"
              />
            </div>

            <div className="w-px h-8 bg-slate-200/50 dark:bg-slate-800/50 mx-2 hidden sm:block" />

            <Button variant="ghost" size="sm" className="relative w-10 h-10 p-0 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 overflow-visible">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-4 ring-white dark:ring-slate-950"></span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="hidden sm:flex rounded-2xl shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 font-bold gap-2 px-6"
              onClick={() => business?.slug && window.open(`/${business.slug}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" /> Live View
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <div className="max-w-7xl mx-auto p-6 md:p-10 min-h-full">
            <Outlet />
          </div>
        </div>

        <OnboardingWizard />
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function DesktopNavLink({ item }: { item: any }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      className={({ isActive }) =>
        `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all relative group ${isActive
          ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md shadow-purple-500/5 ring-1 ring-slate-200/60 dark:ring-slate-800/60'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-full"
            />
          )}
          <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-500' : 'text-slate-400'}`} />
          <span className="relative z-10">{item.name}</span>
        </>
      )}
    </NavLink>
  );
}

function MobileNavLink({ item, onClick }: { item: any; onClick: () => void }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold transition-all ${isActive
          ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/50'
        }`
      }
    >
      <item.icon className="w-6 h-6" />
      {item.name}
    </NavLink>
  );
}
