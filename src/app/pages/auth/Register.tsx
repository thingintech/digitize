import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../../../utils/supabase';

export function Register() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Step 1: Sign up the user via Supabase Auth
    // The handle_new_user trigger in Postgres will auto-create their profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: businessName, // Store business name as their display name for now
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Step 2: Create their new business in the database
      // Generating a simple slug from the business name
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      const { data: bData, error: bError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          slug: slug + '-' + Math.floor(Math.random() * 1000), // Ensure unique slug
          is_active: true,
          is_published: true,
        })
        .select()
        .single();

      if (bError) {
        console.error("Failed to setup business automatically:", bError);
        // We won't block them from entering the app, they can setup later
      } else if (bData) {
        // Step 3: Link them as the 'owner' of this newly created business
        await supabase.from('business_members').insert({
          business_id: bData.id,
          user_id: authData.user.id,
          role: 'owner'
        });
      }

      // Automatically redirect to dashboard where onboarding wizard will handle the rest
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-900">Start Free Setup</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Takes 3 minutes. No credit card required.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Business Name"
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            required
            disabled={loading}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            required
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (minimum 6 characters)"
            minLength={6}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline font-medium">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
