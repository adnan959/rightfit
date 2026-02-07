"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Star, Users, Clock } from "lucide-react";
import { AvatarCircles } from "@/components/ui/avatar-circles";

const avatars = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/90.jpg",
  "https://randomuser.me/api/portraits/men/86.jpg",
];

export function Hero() {
  return (
    <section className="relative py-16 md:py-20 px-4 overflow-hidden">
      {/* Background decoration - bolder blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-coral/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1000px] mx-auto text-center">
        {/* Avatar social proof */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <AvatarCircles avatarUrls={avatars} numPeople={500} />
          <p className="text-sm font-semibold text-navy-light">
            <span className="text-coral">500+</span> professionals helped
          </p>
        </div>

        {/* Main headline - mixed typography */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl text-navy leading-tight mb-6 text-balance">
          <span className="font-extrabold">
            If you applied to 10+ jobs this week and got nothing…
          </span>{" "}
          <span className="font-extrabold text-coral">
            you probably have a CV problem.
          </span>
        </h1>

        {/* Subtext */}
        <div className="text-lg md:text-xl text-navy-light mb-10 space-y-4 max-w-2xl mx-auto">
          <p>
            If you know you can do the job but you keep hearing nothing back,
            it&apos;s usually one of two things:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral"></span>
              Your CV is too vague
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral"></span>
              Your best work is buried
            </li>
          </ul>
        </div>

        {/* Hero illustration - before/after CV transformation */}
        <div className="mb-12 py-4">
          <Image
            src="/hero-illustration-v5.png"
            alt="Before and after CV transformation - from cluttered to clean, structured resume"
            width={1200}
            height={600}
            className="w-full max-w-[900px] mx-auto mix-blend-multiply"
            priority
          />
        </div>

        {/* Value prop */}
        <p className="text-xl md:text-2xl font-medium text-navy mb-2">
          I rewrite your CV so your impact is obvious in seconds.
        </p>
        <p className="text-navy-light mb-6">
          Not &quot;nice&quot;. Not fluffy. Just clear.
        </p>

        {/* CTA Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border shadow-soft p-8 md:p-10 text-center">
          <p className="text-2xl md:text-3xl font-bold text-navy mb-5">
            $30 CV rewrite. Ready to send.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-coral hover:bg-coral-dark text-white px-12 py-7 text-xl rounded-full shadow-warm transition-all hover:scale-105"
          >
            <Link href="/form">Revamp your CV</Link>
          </Button>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-navy-light mt-6 mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-coral" />
              <span>50+ CVs rewritten</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-coral" />
              <span>48-96 hour turnaround</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-coral" />
              <span>ATS-optimized</span>
            </div>
          </div>

          <p className="text-sm text-navy-light italic">
            A CV doesn&apos;t get you hired. It gets you the
            conversation. That&apos;s the goal.
          </p>
        </div>
      </div>
    </section>
  );
}
