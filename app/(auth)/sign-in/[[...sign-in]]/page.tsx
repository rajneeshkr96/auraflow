'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Mail, Lock, Instagram, AlertCircle } from 'lucide-react';

// Simple Google Icon Component for the button
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.109 C -21.864 50.259 -21.734 49.449 -21.484 48.689 L -21.484 45.609 L -25.464 45.609 C -26.284 47.239 -26.754 49.129 -26.754 51.109 C -26.754 53.089 -26.284 54.979 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.729 C -12.984 43.729 -11.404 44.339 -10.154 45.529 L -6.734 42.109 C -8.804 40.189 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.729 -14.754 43.729 Z" />
    </g>
  </svg>
);

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Handle Email/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard'); 
      } else {
        console.log(result);
        setError("Further verification required.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.errors?.[0]?.longMessage || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Social Login (Generic Helper)
  const handleOAuthLogin = async (strategy: 'oauth_instagram' | 'oauth_google') => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Welcome back</h1>
        <p className="text-slate-500 font-medium">Enter your credentials to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Error Message Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
            <Link 
                href="/forgot-password" 
                className="text-xs font-bold text-indigo-600 hover:underline"
            >
                Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          disabled={isLoading || !isLoaded}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Log in to Auraflow'}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">or continue with</span></div>
        </div>

        {/* OAuth Buttons (Side by Side) */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => handleOAuthLogin('oauth_google')}
            className="w-full py-3.5 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm text-slate-700"
          >
            <GoogleIcon /> Google
          </button>

          <button 
            type="button"
            onClick={() => handleOAuthLogin('oauth_instagram')}
            className="w-full py-3.5 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm text-slate-700"
          >
            <Instagram size={18} className="text-pink-600" /> Instagram
          </button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm font-medium text-slate-500">
        Don't have an account? {' '}
        <Link href="/sign-up" className="text-indigo-600 font-bold hover:underline">
            Start free trial
        </Link>
      </p>
    </>
  );
}