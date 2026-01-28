"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IntakeFormData } from "@/lib/form-schema";

interface Step1Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step1BasicInfo({ form }: Step1Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">Let&apos;s get started</h2>
        <p className="text-muted-foreground">
          Just the basics to kick things off
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-navy">
            What is your full name?
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="Enter your full name"
            className="mt-2"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-navy">
            What email should I contact you on?
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="mt-2"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Where should I send your new CV?
          </p>
        </div>
      </div>
    </div>
  );
}
