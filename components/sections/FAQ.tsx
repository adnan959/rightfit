"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Will this guarantee I get a job?",
      answer:
        "No. And if someone promises that, run. This is about getting you more conversations.",
    },
    {
      question: "Does it work with ATS?",
      answer:
        "Yes. Clean formatting, normal headings, no design junk that breaks parsing.",
    },
    {
      question: "What do you need from me?",
      answer:
        "All the info you can provide about what you've done, worked for, accomplishments, impacts, etc.",
    },
    {
      question: "What if I don't have metrics?",
      answer:
        "That's normal. We'll use what's true and frame it clearly. Numbers help, but clarity matters more than people think.",
    },
    {
      question: "How long does it take?",
      answer: "48-96 hours.",
    },
    {
      question: "What if I don't like it?",
      answer:
        "If something feels off or doesn't sound like you, tell me. The goal is: accurate, clear, and strong. Aimed for recruiter.",
    },
    {
      question: "Is this for students or early-career people?",
      answer:
        "Yes, if you've got anything real we can turn into signal: projects, internships, freelance, startup work.",
    },
    {
      question: "Do you do LinkedIn or cover letters?",
      answer: "Optional add-ons. CV first because it's the foundation.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-20 px-4 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">FAQ</h2>
        <p className="text-muted-foreground mb-8">(real, trust-first)</p>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-xl border border-border px-6 data-[state=open]:shadow-soft"
            >
              <AccordionTrigger className="text-left font-medium text-navy hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-navy-light pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
