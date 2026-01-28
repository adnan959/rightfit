"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IntakeFormData, timelineOptions } from "@/lib/form-schema";

interface Step4Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step4Timeline({ form }: Step4Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const timeline = watch("timeline");

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">
          Your timeline & location
        </h2>
        <p className="text-muted-foreground">Quick context about your search</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-navy">
            When would you ideally like to start a new role?
          </Label>
          <RadioGroup
            value={timeline}
            onValueChange={(value) =>
              setValue("timeline", value as IntakeFormData["timeline"], {
                shouldValidate: true,
              })
            }
            className="mt-3 space-y-2"
          >
            {timelineOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  timeline === option.value
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-coral/50"
                }`}
              >
                <RadioGroupItem value={option.value} />
                <span className="text-navy">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
          {errors.timeline && (
            <p className="text-sm text-destructive mt-1">
              {errors.timeline.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="location" className="text-navy">
            Where are you currently based?
          </Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="e.g., London, UK or Remote"
            className="mt-2"
          />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
