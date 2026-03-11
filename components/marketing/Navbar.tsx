"use client";

import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  // We handle scroll state locally here since this is a UI specific interaction
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Very naive check for client side - if we have the Authentication cookie
    // Since it's probably HttpOnly, this check might fail. We can also check localStorage,
    // or rely on a generic "Get Started / Dashboard" button that redirects.
    // For now we'll just check if there's any cookie, but the redirect logic handles protection anyway.
    setIsAuthenticated(document.cookie.includes('Authentication='));

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

      const getAuthUrl = (path: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_AUTH_URL || 'http://localhost:3002';
        if (!currentUrl) return `${baseUrl}${path}`;
        return `${baseUrl}${path}?redirect=${encodeURIComponent(currentUrl)}`;
    };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'
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

          {isAuthenticated ? (
            <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full transition-all active:scale-95">
              Dashboard
            </Link>
          ) : (
            <>
              <a href={getAuthUrl("/login")} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Login
              </a>
              <a href={getAuthUrl("/signup")} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition-all active:scale-95">
                Get Started
              </a>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;