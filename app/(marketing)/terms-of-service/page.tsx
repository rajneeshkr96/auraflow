
import React from 'react';

const TermsView: React.FC = () => {
  return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-black mb-4">Terms of Service</h1>
          <p className="text-slate-400 font-bold mb-12 uppercase tracking-widest text-xs italic">Last updated: October 24, 2023</p>
          
          <div className="space-y-12 text-slate-600 leading-relaxed font-medium">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
              <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Auraflow ("we," "us," or "our"), concerning your access to and use of the auraflow.io website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Intellectual Property Rights</h2>
              <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Representations</h2>
              <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Prohibited Activities</h2>
              <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
            </section>

            <section className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Questions?</h2>
              <p>If you have questions about these Terms, please contact support@auraflow.io.</p>
            </section>
          </div>
        </div>
      </main>
  );
};

export default TermsView;
