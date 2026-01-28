import {
  Hero,
  RecruiterMindset,
  QuickIntro,
  WhyCVsFail,
  WhatYoureBuying,
  SelfCheck,
  HowItWorks,
  Deliverables,
  Proof,
  TheOffer,
  Referral,
  WhoThisIsFor,
  FAQ,
  FinalCTA,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* How recruiters actually think */}
      <RecruiterMindset />

      {/* Personal introduction */}
      <QuickIntro />

      {/* Common CV problems */}
      <WhyCVsFail />

      {/* What you're actually buying */}
      <WhatYoureBuying />

      {/* Interactive self-check */}
      <SelfCheck />

      {/* 3-step process */}
      <HowItWorks />

      {/* What you get / won't do */}
      <Deliverables />

      {/* Social proof */}
      <Proof />

      {/* The $30 offer */}
      <TheOffer />

      {/* Referral program */}
      <Referral />

      {/* Who this is for / not for */}
      <WhoThisIsFor />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Rightfit. All rights reserved.</p>
          <p className="mt-2">
            Built with care for job seekers who deserve better.
          </p>
        </div>
      </footer>
    </main>
  );
}
