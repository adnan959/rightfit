"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IntakeFormData, challengeOptions } from "@/lib/form-schema";

interface Step6Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step6Challenges({ form }: Step6Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedChallenges = watch("challenges") || [];

  const toggleChallenge = (value: string) => {
    const current = selectedChallenges;
    const updated = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];
    setValue("challenges", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">
          What&apos;s been hard?
        </h2>
        <p className="text-muted-foreground">
          This helps me understand where to focus
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-navy">
            What do you find hardest about job applications right now?
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select all that apply
          </p>
          <div className="space-y-2">
            {challengeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedChallenges.includes(option.value)
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-coral/50"
                }`}
              >
                <Checkbox
                  checked={selectedChallenges.includes(option.value)}
                  onCheckedChange={() => toggleChallenge(option.value)}
                />
                <span className="text-navy">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.challenges && (
            <p className="text-sm text-destructive mt-1">
              {errors.challenges.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="additionalContext" className="text-navy">
            Is there anything else you want me to know about your situation or
            goals?
          </Label>
          <Textarea
            id="additionalContext"
            {...register("additionalContext")}
            placeholder="Any context that might help me understand your situation better..."
            className="mt-2"
            rows={4}
          />
          <p className="text-sm text-muted-foreground mt-1">Optional</p>
        </div>
      </div>
    </div>
  );
}
