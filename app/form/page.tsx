import { IntakeForm } from "@/components/form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Start Your CV Revamp | Rightfit",
  description:
    "Fill out this form to get your CV rewritten. $30, delivered in 48-96 hours.",
};

export default function FormPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Welcome message */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">
          Drop the details, we&apos;ll do the magic
        </h1>
        <p className="text-muted-foreground">
          Give us the tea on your career plans and where you need support, and
          we&apos;ll turn it into a job-ready profile that gets attention.
          Short, sweet and worth it.
        </p>
      </div>

      {/* Form */}
      <IntakeForm />

      {/* Footer */}
      <footer className="max-w-2xl mx-auto mt-12 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Questions? Email us at hello@rightfit.com
        </p>
      </footer>
    </main>
  );
}
