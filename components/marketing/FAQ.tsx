
import React from 'react';
import { ChevronRight } from 'lucide-react';

const FAQ: React.FC = () => {
  return (
    <section className="py-32 px-6 border-t border-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">Frequently asked questions</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h4 className="font-bold text-slate-900">How to Live Stream 24/7 on YouTube?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">To live stream 24/7 on YouTube, you need to follow a few key steps including connecting your channel to Auraflow and uploading your videos to our cloud storage.</p>
              <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 group">
                Read guide <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
           <div className="space-y-4">
              <h4 className="font-bold text-slate-900">How to find your YouTube Stream Key?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Navigate to your YouTube Studio, click on "Go Live", and in the stream settings tab you will find your unique stream key to paste into Auraflow.</p>
              <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 group">
                Watch tutorial <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
