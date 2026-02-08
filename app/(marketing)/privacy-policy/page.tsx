import React from 'react';

const PrivacyView: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
        <p className="text-slate-400 font-bold mb-12 uppercase tracking-widest text-xs italic">Last updated: February 08, 2026</p>

        <div className="space-y-12 text-slate-600 leading-relaxed font-medium">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p>Welcome to Auraflow. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@auraflow.io.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
            <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Personal Data:</strong> Name, email address, social media handles, and profile information.</li>
              <li><strong>Authentication Data:</strong> Passwords, password hints, and similar security information used for authentication and account access.</li>
              <li><strong>Payment Data:</strong> Data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
              <li><strong>Social Media Login Data:</strong> We provide you with the option to register with us using your existing social media account details, like your Facebook, Twitter or other social media account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>To facilitate account creation and logon process.</li>
              <li>To post testimonials.</li>
              <li>To request feedback.</li>
              <li>To enable user-to-user communications.</li>
              <li>To manage user accounts.</li>
              <li>To send administrative information to you.</li>
              <li>To protect our Services.</li>
              <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
              <li>To respond to legal requests and prevent harm.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Sharing Your Information</h2>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Retention & Deletion</h2>
            <p className="mb-4">We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).</p>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Request Data Deletion</h3>
            <p>You have the right to request deletion of your personal information. If you would like to request the deletion of your account and associated data, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-4">
              <li>Log in to your account and navigate to Settings {'>'} Security {'>'} Delete Account.</li>
              <li>Alternatively, you can email us at <strong>privacy@auraflow.io</strong> with the subject line "Data Deletion Request". Please include your account email address and username.</li>
            </ol>
            <p className="mt-4">Upon receiving your request, we will delete your personal information from our active databases. However, storing some information may be necessary to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Use and/or comply with applicable legal requirements.</p>
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
