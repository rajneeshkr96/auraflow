
import React from 'react';
import { LayoutGrid, Twitter, Instagram, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="pt-32 pb-12 px-6 border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutGrid className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Auraflow</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed mb-8">
              Take your streaming game to the next level with our professional AI-driven automation suite.
            </p>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
              <Github className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-widest">Product</h5>
            <ul className="space-y-4 text-xs font-bold text-slate-400">
              <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-600">Stream Designer</a></li>
              <li><a href="#" className="hover:text-indigo-600">Overlays</a></li>
              <li><a href="#" className="hover:text-indigo-600">Scheduling</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-widest">Compare</h5>
            <ul className="space-y-4 text-xs font-bold text-slate-400">
              <li><a href="#" className="hover:text-indigo-600">vs StreamYard</a></li>
              <li><a href="#" className="hover:text-indigo-600">vs Restream</a></li>
              <li><a href="#" className="hover:text-indigo-600">vs OBS</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-sm mb-6 uppercase tracking-widest">Legal</h5>
            <ul className="space-y-4 text-xs font-bold text-slate-400">
              <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Auraflow. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
