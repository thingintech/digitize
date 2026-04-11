import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '../../components/ui';
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

/**
 * Settings.tsx
 *
 * Persists to:
 *   businesses       → name, website, timezone, currency
 *   profiles         → full_name
 *   business_settings (key: 'preferences') → email_notifications, language
 *   auth.users       → password (via supabase.auth.updateUser)
 */

export function Settings() {
  const { user } = useAuth();
  const { business, updateProfile, refreshProfile } = useProfile();

  // ─── Business fields (from businesses table) ───────────────────────────────
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');

  // ─── Profile fields (from profiles table) ──────────────────────────────────
  const [ownerName, setOwnerName] = useState('');

  // ─── Preferences (from business_settings key='preferences') ────────────────
  const [language, setLanguage] = useState('en');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // ─── Security ──────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ─── Loading states ────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [prefLoading, setPrefLoading] = useState(true);

  // Seed form from live data
  useEffect(() => {
    if (business) {
      setBusinessName(business.name || '');
      setWebsite(business.website || '');
      setTimezone(business.timezone || 'America/New_York');
      setCurrency(business.currency || 'USD');
    }
    if (user) {
      setOwnerName(
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        ''
      );
    }
  }, [business, user]);

  // Load preferences from business_settings
  useEffect(() => {
    if (!business?.id) return;
    (async () => {
      setPrefLoading(true);
      try {
        const { data } = await supabase
          .from('business_settings')
          .select('value')
          .eq('business_id', business.id)
          .eq('key', 'preferences')
          .maybeSingle();

        if (data?.value) {
          const prefs = data.value as any;
          if (prefs.language) setLanguage(prefs.language);
          if (typeof prefs.email_notifications === 'boolean') {
            setEmailNotifications(prefs.email_notifications);
          }
        }
      } catch (err) {
        console.error('[Settings] Failed to load preferences:', err);
      } finally {
        setPrefLoading(false);
      }
    })();
  }, [business?.id]);

  // ─── Save business profile + preferences ───────────────────────────────────
  const handleSave = async () => {
    if (!business?.id) return;
    setSaving(true);
    try {
      // 1. Update businesses table (name, website, timezone, currency)
      await updateProfile({
        name: businessName.trim(),
        website: website.trim(),
        timezone,
        currency,
      });

      // 2. Update owner name in profiles table
      if (user?.id && ownerName.trim()) {
        await supabase
          .from('profiles')
          .update({ full_name: ownerName.trim() })
          .eq('id', user.id);
      }

      // 3. Upsert preferences into business_settings
      await supabase
        .from('business_settings')
        .upsert(
          {
            business_id: business.id,
            key: 'preferences',
            value: { language, email_notifications: emailNotifications },
          },
          { onConflict: 'business_id,key' }
        );

      await refreshProfile();
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      console.error('[Settings] Save error:', err);
      toast.error(err.message || 'Unable to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Password change ────────────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">
          Configure your account, business details, and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details as the account owner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="owner-name">Your Name</Label>
              <Input
                id="owner-name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email Address</Label>
              <Input
                id="contact-email"
                type="email"
                value={user?.email || ''}
                placeholder="you@example.com"
                disabled
              />
              <p className="text-xs text-slate-400 mt-1">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Your business name, website, and regional settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
              />
            </div>
            <div>
              <Label htmlFor="website-url">Website</Label>
              <Input
                id="website-url"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="mt-1">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="EGP">EGP (ج.م)</SelectItem>
                    <SelectItem value="SAR">SAR (﷼)</SelectItem>
                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="mt-1">
                    <SelectValue placeholder="Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">New York (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Chicago (CT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Los Angeles (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                    <SelectItem value="Africa/Cairo">Cairo (EET)</SelectItem>
                    <SelectItem value="Asia/Riyadh">Riyadh (AST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Language and notification defaults.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage} disabled={prefLoading}>
              <SelectTrigger id="language" className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic (عربي)</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 mt-1">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-slate-500">Updates about features and account activity.</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => setEmailNotifications(Boolean(checked))}
              disabled={prefLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" disabled={saving} onClick={() => window.location.reload()}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>

      {/* Security */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password safely and securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 8 chars)"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={updatingPassword}>
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System & Data */}
      <Card className="mt-6 border-amber-200 dark:border-amber-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
            System &amp; Data
          </CardTitle>
          <CardDescription>
            Tools to manage local data and synchronized state. Use these if you experience UI
            flickering or see outdated information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Wipe Local Cache</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Clears all legacy localStorage data. Your database records stay safe.
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white dark:bg-slate-900 border-amber-200 hover:bg-amber-100 text-amber-700 dark:text-amber-400 shrink-0"
              onClick={() => {
                const keys = Object.keys(localStorage);
                const digitizeKeys = keys.filter(
                  (k) => k.startsWith('digitize_') || k.startsWith('local_')
                );
                digitizeKeys.forEach((k) => localStorage.removeItem(k));
                toast.success(`Cleared ${digitizeKeys.length} legacy items from cache`);
                setTimeout(() => window.location.reload(), 1000);
              }}
            >
              Wipe &amp; Reload
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Refresh Database Sync</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Force a fresh fetch from Supabase to ensure everything is perfectly in sync.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => {
                    setTimeout(() => {
                      window.location.reload();
                      resolve(true);
                    }, 500);
                  }),
                  {
                    loading: 'Syncing with Supabase...',
                    success: 'Data synchronized!',
                    error: 'Sync failed',
                  }
                );
              }}
            >
              Full Sync
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
