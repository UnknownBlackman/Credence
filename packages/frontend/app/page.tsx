"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MosaicBackground } from '@/components/MosaicBackground';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorks } from '@/components/HowItWorks';
import { ConnectedVaults } from '@/components/ConnectedVaults';
import { CreditLineSimulator } from '@/components/CreditLineSimulator';
import { PrivacyGuarantees } from '@/components/PrivacyGuarantees';
import { WaitlistModal } from '@/components/WaitlistModal';
import { Footer } from '@/components/Footer';

interface FadeUpSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeUpSection: React.FC<FadeUpSectionProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalParams, setModalParams] = useState<{
    amount: number;
    revenue: number;
    source: string;
  }>({
    amount: 1000000,
    revenue: 250000,
    source: 'stripe',
  });

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleApplyFromSimulator = (amount: number, revenue: number, source: string) => {
    setModalParams({ amount, revenue, source });
    setModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#FCFAF6] text-stone-900 font-sans selection:bg-amber-300/30 selection:text-amber-950">
      {/* 1. Subtle, Transparent Crystalline Gold Mosaic Canvas Background */}
      <MosaicBackground />

      {/* 2. Gold & White Frosted Navigation Header with Official Monolith Brand Mark */}
      <Navbar onGetStarted={handleOpenModal} />

      {/* 3. Main Product Page Content Stream */}
      <main className="relative z-10">
        {/* Hero Section with Initial Smooth Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroSection
            onGetStarted={handleOpenModal}
            onExploreHowItWorks={() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </motion.div>

        {/* 3-Step Concise "How It Works" with Fade-Up Transition */}
        <FadeUpSection>
          <HowItWorks onGetStarted={handleOpenModal} />
        </FadeUpSection>

        {/* External Infrastructure Vaults with Fade-Up Transition */}
        <FadeUpSection>
          <ConnectedVaults onGetStarted={handleOpenModal} />
        </FadeUpSection>

        {/* Real-time Interactive Credit Estimator with Fade-Up Transition */}
        <FadeUpSection>
          <CreditLineSimulator onApplyWithParameters={handleApplyFromSimulator} />
        </FadeUpSection>

        {/* Privacy & Zero-Knowledge Guarantee Comparison with Fade-Up Transition */}
        <FadeUpSection>
          <PrivacyGuarantees onGetStarted={handleOpenModal} />
        </FadeUpSection>
      </main>

      {/* 4. Minimalist Light-Themed Footer */}
      <Footer />

      {/* 5. Interactive Waitlist Modal Flow */}
      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialAmount={modalParams.amount}
        initialRevenue={modalParams.revenue}
        initialSource={modalParams.source}
      />
    </div>
  );
}
