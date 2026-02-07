import {
  Hero,
  RecruiterMindset,

  WhyCVsFail,
  WhatYoureBuying,
  SelfCheck,
  HowItWorks,
  Deliverables,
  Proof,
  Testimonials,
  IndustryCarousel,
  TheOffer,
  WhoThisIsFor,
  FAQ,
  FinalCTA,
} from "@/components/sections";
import { Navbar } from "@/components/ui/Navbar";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* How recruiters actually think */}
      <RecruiterMindset />

      {/* Why CVs fail */}
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

      {/* Testimonials */}
      <Testimonials />

      {/* Industry carousel */}
      <IndustryCarousel />

      {/* The $30 offer */}
      <TheOffer />

      {/* Who this is for / not for */}
      <WhoThisIsFor />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Brand */}
            <div>
              <p className="text-xl font-bold text-coral mb-1">ApplyBetter</p>
              <p className="text-sm text-navy-light">
                Built with care for job seekers who deserve better.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <a
                href="#how-it-works"
                className="text-navy-light hover:text-coral transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-navy-light hover:text-coral transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-navy-light hover:text-coral transition-colors"
              >
                FAQ
              </a>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-sm text-navy-light">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:hello@applybetter.co"
                className="hover:text-coral transition-colors"
              >
                hello@applybetter.co
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-navy-light">
            <p>&copy; {new Date().getFullYear()} ApplyBetter. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-navy transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-navy transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
