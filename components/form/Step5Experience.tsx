"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IntakeFormData } from "@/lib/form-schema";

interface Step5Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step5Experience({ form }: Step5Props) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">
          Tell me about your work
        </h2>
        <p className="text-muted-foreground">
          This is the substance - the more detail, the better
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="currentRole" className="text-navy">
            Briefly tell me about your current or most recent role
          </Label>
          <Textarea
            id="currentRole"
            {...register("currentRole")}
            placeholder="What's your title? What does your day-to-day look like? What are you responsible for?"
            className="mt-2"
            rows={5}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Don&apos;t worry about perfect wording - just tell me what you do
          </p>
          {errors.currentRole && (
            <p className="text-sm text-destructive mt-1">
              {errors.currentRole.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="achievements" className="text-navy">
            What achievements are you most proud of so far?
          </Label>
          <Textarea
            id="achievements"
            {...register("achievements")}
            placeholder="Projects you led, problems you solved, results you achieved, things that went well..."
            className="mt-2"
            rows={5}
          />
          <p className="text-sm text-muted-foreground mt-1">
            If you&apos;re not sure, write what you think went well or what
            people praised you for
          </p>
          {errors.achievements && (
            <p className="text-sm text-destructive mt-1">
              {errors.achievements.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
