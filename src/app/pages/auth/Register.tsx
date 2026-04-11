import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { toast } from 'sonner';

/**
 * Register.tsx
 *
 * Collects: owner full name, business name, email, password.
 *
 * The DB trigger `handle_new_user()` handles ALL database row creation:
 *   - profiles         (owner personal record)
 *   - businesses       (company record)
 *   - business_members (owner → business link)
 *   - subscriptions    (free plan)
 *   - menu_templates   (default public page config)
 *
 * Do NOT manually insert into any of those tables here — the trigger
 * is the single source of truth to avoid duplicate-insert race conditions.
 */

export function Register() {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { session } = useAuth();
  const { refreshProfile } = useProfile();

  React.useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      /**
       * Sign up via Supabase Auth.
       * Pass both the owner's personal name and the business name as metadata.
       * The DB trigger reads:
       *   raw_user_meta_data->>'full_name'      → profiles.full_name
       *   raw_user_meta_data->>'business_name'  → businesses.name
       */
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            business_name: businessName.trim(),
          },
        },
      });

      if (authError) throw authError;

      // Email confirmation required — no session yet.
      if (!authData.session) {
        toast.info(
          'Please check your email to verify your account before logging in.',
          { duration: 6000 }
        );
        navigate('/login');
        return;
      }

      // Instant session (email confirmation disabled).
      // The trigger has already created all rows — just refresh context.
      if (authData.user && authData.session) {
        // Small delay to allow the trigger to commit before we query.
        await new Promise((resolve) => setTimeout(resolve, 800));
        await refreshProfile();
        toast.success('Welcome! Your business is ready.');
        navigate('/dashboard/selection');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Start Free Setup</h1>
          <p className="text-slate-500 text-sm mt-1">
            Takes 3 minutes. No credit card required.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Owner's personal name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Your Name
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="E.g. John Smith"
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Business name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Business Name
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="E.g. Acme Café"
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center mt-1"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:underline font-medium">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
