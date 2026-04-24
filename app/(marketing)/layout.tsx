import React from 'react';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;