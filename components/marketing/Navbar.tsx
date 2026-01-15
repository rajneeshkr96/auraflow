"use client";

import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

const Navbar = () => {
  // We handle scroll state locally here since this is a UI specific interaction
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutGrid className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Auraflow</span>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/features" className="hover:text-indigo-600 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          
          {/* State: When User is Logged OUT */}
          <SignedOut>
            {/* Removed mode="modal" so it redirects to the login page */}
            <SignInButton>
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                Login
              </button>
            </SignInButton>

            {/* Removed mode="modal" so it redirects to the signup page */}
            <SignUpButton>
              <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition-all active:scale-95 cursor-pointer">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>

          {/* State: When User is Logged IN */}
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;