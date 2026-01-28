"use client";

export function RecruiterMindset() {
  const questions = [
    "What do you do?",
    "What level are you?",
    "What did you actually improve?",
    "What impact did you make?",
    "Should I keep reading?",
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Here&apos;s how it actually works:
        </h2>

        <p className="text-lg text-navy-light mb-6">
          Most recruiters aren&apos;t experts in your field, and they&apos;ll
          scan your CV in under 10 seconds.
        </p>

        <p className="text-lg text-navy mb-4">
          They&apos;re trying to figure out, fast:
        </p>

        <ul className="space-y-3 mb-8">
          {questions.map((question, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-coral/10 text-coral text-sm font-semibold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-lg text-navy">{question}</span>
            </li>
          ))}
        </ul>

        <div className="bg-secondary rounded-xl p-6 border border-border">
          <p className="text-lg text-navy">
            If your CV doesn&apos;t answer those quickly,{" "}
            <span className="font-semibold">you get skipped</span>. Even if
            you&apos;re genuinely good.
          </p>
        </div>
      </div>
    </section>
  );
}
