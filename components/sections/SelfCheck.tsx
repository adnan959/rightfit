"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export function SelfCheck() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const checklistItems = [
    "My summary could describe anyone",
    "My bullets sound like job duties",
    "I barely show impact (money, time, growth, quality, speed)",
    "My CV is hard to scan quickly",
    "My best work is buried halfway down",
    "It's longer than it needs to be",
    "It's not obvious what role I'm aiming for",
    "I apply to roles I'm qualified for and hear nothing",
  ];

  const handleCheck = (index: number) => {
    setCheckedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const checkedCount = checkedItems.length;
  const showWarning = checkedCount >= 3;

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Self-check{" "}
          <span className="text-muted-foreground font-normal text-xl">
            (quick and honest)
          </span>
        </h2>

        <p className="text-lg text-navy-light mb-2">
          Here&apos;s how you can guess if your CV has a problem.
        </p>

        <p className="text-lg font-medium text-navy mb-6">
          If 3 of these hit home, your CV is probably leaking interviews:
        </p>

        <div className="space-y-4 mb-8">
          {checklistItems.map((item, index) => (
            <label
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                checkedItems.includes(index)
                  ? "border-coral bg-coral/5"
                  : "border-border hover:border-coral/50"
              }`}
            >
              <Checkbox
                checked={checkedItems.includes(index)}
                onCheckedChange={() => handleCheck(index)}
                className="mt-0.5"
              />
              <span className="text-navy">{item}</span>
            </label>
          ))}
        </div>

        {showWarning && (
          <div className="bg-coral/10 border border-coral/20 rounded-xl p-6 mb-8">
            <p className="text-lg text-navy">
              <span className="font-semibold">
                {checkedCount} out of 8 checked.
              </span>{" "}
              If that&apos;s you, it&apos;s alright. This is exactly what we
              fix.
            </p>
          </div>
        )}

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-coral hover:bg-coral-dark text-white px-8 py-6 text-lg rounded-full shadow-warm transition-all hover:scale-105"
          >
            <Link href="/form">Upload your CV</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
