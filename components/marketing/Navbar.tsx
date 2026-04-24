"use client";
import React, { useState, useEffect } from 'react';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    setCurrentUrl(window.location.href);
    setIsAuthenticated(document.cookie.includes('Authentication='));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getAuthUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_AUTH_URL || 'http://localhost:3003';
    if (!currentUrl) return `${baseUrl}${path}`;
    return `${baseUrl}${path}?redirect=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex items-center gap-8 px-6 py-3 rounded-full transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] w-full max-w-4xl' 
            : 'bg-transparent w-full max-w-5xl'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutGrid className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">Auraflow</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground ml-auto">
          <Link href="/features" className="hover:text-foreground transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
        </div>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {isAuthenticated ? (
            <Link href="/dashboard" className="group flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95">
              Dashboard
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <a href={getAuthUrl("/login")} className="hidden sm:block text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4">
                Login
              </a>
              <a href={getAuthUrl("/signup")} className="group flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-full transition-all hover:shadow-[0_8px_20px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95">
                Join Us
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </>
          )}
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;