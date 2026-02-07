"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: string;
  className?: string;
}

export function TextReveal({ children, className }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far through the container we've scrolled
      // Start revealing when top of container hits bottom of viewport
      // Finish when bottom of container hits top of viewport
      const totalDistance = rect.height + windowHeight;
      const scrolled = windowHeight - rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / totalDistance));

      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = children.split(" ");

  return (
    <div ref={containerRef} className={cn("relative min-h-[150vh]", className)}>
      <div className="sticky top-1/2 -translate-y-1/2 flex items-center justify-center px-4">
        <p className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-center leading-tight max-w-4xl mx-auto">
          {words.map((word, i) => {
            const wordProgress = i / words.length;
            // Map scroll progress so words reveal across 20%-80% of scroll
            const revealAt = 0.2 + wordProgress * 0.6;
            const isRevealed = progress >= revealAt;

            return (
              <span
                key={i}
                className="inline-block mr-[0.25em] transition-all duration-300"
                style={{
                  opacity: isRevealed ? 1 : 0.15,
                  color: isRevealed ? "var(--color-navy)" : "var(--color-navy)",
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
