
import React from 'react';

const PrivacyView: React.FC = () => {
  return (

      <main className="min-h-screen bg-white text-slate-900">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
          <p className="text-slate-400 font-bold mb-12 uppercase tracking-widest text-xs italic">Last updated: October 24, 2023</p>
          
          <div className="space-y-12 text-slate-600 leading-relaxed font-medium">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p>Welcome to Auraflow. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@auraflow.io.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Personal data (name, email, handle)</li>
                <li>Usage data (analytics, interaction history)</li>
                <li>Device data (IP address, browser type)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Sharing Your Information</h2>
              <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
            </section>

            <section className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
              <h2 className="text-xl font-bold text-indigo-900 mb-4">Contact Us</h2>
              <p className="text-indigo-800">If you have any questions about this Privacy Policy, please email us at <span className="font-bold underline">privacy@auraflow.io</span></p>
            </section>
          </div>
        </div>
      </main>

  );
};

export default PrivacyView;
