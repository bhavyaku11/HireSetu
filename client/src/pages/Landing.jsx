import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import CredibilityStat from '../components/landing/CredibilityStat';
import AtsEducation from '../components/landing/AtsEducation';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-50 font-body text-surface-900 selection:bg-brand-500/20 selection:text-brand-700 flex flex-col">
      {/* Header Bar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <AtsEducation />
        <CredibilityStat />
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
