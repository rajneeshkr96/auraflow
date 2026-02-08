'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';



const SignupPage: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verification State
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Submit Registration Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      // Try with just email and password first
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      // Send the email with the OTP code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Switch UI to verification mode
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign-up error:', err);

      // Extract error message
      let errorMessage = "Something went wrong during sign up.";
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].longMessage || err.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Email Code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/dashboard'); // Redirect to dashboard
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);

      let errorMessage = "Invalid verification code.";
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].longMessage || err.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI FOR VERIFICATION STEP ---
  if (pendingVerification) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Verify Email</h1>
          <p className="text-slate-500 font-medium">We've sent a code to <span className="text-slate-900 font-bold">{email}</span></p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-4 text-center text-2xl tracking-[1em] font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Account'}
          </button>

          <button
            type="button"
            onClick={() => setPendingVerification(false)}
            className="w-full text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            Back to Sign Up
          </button>
        </form>
      </div>
    );
  }

  // --- UI FOR REGISTRATION STEP ---
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Get Started</h1>
        <p className="text-slate-500 font-medium">Join 4,000+ creators scaling their Instagram today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* First Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              required
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        <div className="py-2">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            By signing up, you agree to our <span className="text-slate-900 font-bold hover:underline cursor-pointer">Terms</span> and <span className="text-slate-900 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        <button
          disabled={isLoading || !isLoaded}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Start 7-Day Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-medium text-slate-500">
        Already have an account? {' '}
        <Link href="/sign-in" className="text-indigo-600 font-bold hover:underline">Log in here</Link>
      </p>

      {/* Trust bar */}
      <div className="mt-12 flex items-center justify-center gap-8 grayscale opacity-40">
        <div className="h-4 w-16 bg-slate-300 rounded" />
        <div className="h-4 w-20 bg-slate-300 rounded" />
        <div className="h-4 w-12 bg-slate-300 rounded" />
      </div>
    </div>
  );
};

export default SignupPage;