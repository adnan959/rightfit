"use client";

import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Generic interface that works with any form containing fullName and email
interface Step1Props<T extends FieldValues> {
  form: UseFormReturn<T>;
}

export function Step1BasicInfo<T extends { fullName: string; email: string }>({ form }: Step1Props<T>) {
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
            {...register("fullName" as Path<T>)}
            placeholder="Enter your full name"
            className="mt-2"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">
              {(errors.fullName as { message?: string })?.message}
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
            {...register("email" as Path<T>)}
            placeholder="you@example.com"
            className="mt-2"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {(errors.email as { message?: string })?.message}
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
