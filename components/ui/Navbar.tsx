"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#what-you-get", label: "What You Get" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-coral hover:text-coral-dark transition-colors"
          >
            Rightfit
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-navy-light hover:text-coral transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <Button
              asChild
              size="sm"
              className="bg-coral hover:bg-coral-dark text-white rounded-full px-4"
            >
              <a href="#free-audit">Free Audit</a>
            </Button>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-navy hover:text-coral transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              // X icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-80 border-t border-gray-100" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 bg-white space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="block py-3 px-4 text-navy-light hover:text-coral hover:bg-coral/5 rounded-lg transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Button
              asChild
              className="w-full bg-coral hover:bg-coral-dark text-white rounded-full"
              onClick={handleLinkClick}
            >
              <a href="#free-audit">Free Quick Audit</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
