import React from 'react';
import Link from 'next/link'; // Replaced onBack with Next.js Link
import { LayoutGrid, ArrowLeft, Star, Users } from 'lucide-react';
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Column: Fixed Shell (Logo + Footer) + Dynamic Content */}
      <div className="flex-1 flex flex-col px-6 md:px-12 lg:px-24 py-12">
        
        {/* Header: Logo & Back Link */}
        <div className="flex items-center justify-between mb-20">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <LayoutGrid className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Auraflow</span>
          </Link>
          
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>

        {/* Dynamic Content (The Page) */}
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          © {new Date().getFullYear()} Auraflow. Security & Privacy Guaranteed.
        </div>
      </div>

      {/* Right Column: Static Branding & Social Proof */}
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center p-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
        
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase mb-8 border border-white/5">
            Join the creator revolution
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-8">
            Scale your <span className="text-indigo-400">Instagram</span> without the manual effort.
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400 flex-shrink-0">
                <Users size={20} />
              </div>
              <div>
                <div className="text-white font-bold mb-1">4,000+ Creators</div>
                <div className="text-slate-400 text-sm font-medium">From fitness coaches to e-commerce brands, we power the best.</div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm font-medium leading-relaxed italic mb-4">
                "The Closer Agent booked 12 coaching calls in the first week. I used to spend 4 hours a day in DMs, now I spend zero."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white">S</div>
                <span className="text-xs font-bold text-white">Sarah @ GlowUp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}