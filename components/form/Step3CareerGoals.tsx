"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  IntakeFormData,
  industryOptions,
  careerStageOptions,
} from "@/lib/form-schema";

interface Step3Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step3CareerGoals({ form }: Step3Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedIndustries = watch("industries") || [];
  const careerStage = watch("careerStage");

  const toggleIndustry = (value: string) => {
    const current = selectedIndustries;
    const updated = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    setValue("industries", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">
          Where are you headed?
        </h2>
        <p className="text-muted-foreground">Help me understand your goals</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-navy">
            Which industry are you targeting right now?
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select all that apply
          </p>
          <div className="grid grid-cols-2 gap-2">
            {industryOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedIndustries.includes(option.value)
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-coral/50"
                }`}
              >
                <Checkbox
                  checked={selectedIndustries.includes(option.value)}
                  onCheckedChange={() => toggleIndustry(option.value)}
                />
                <span className="text-sm text-navy">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.industries && (
            <p className="text-sm text-destructive mt-1">
              {errors.industries.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="jobTitles" className="text-navy">
            What job titles are you applying or planning to apply for?
          </Label>
          <Textarea
            id="jobTitles"
            {...register("jobTitles")}
            placeholder="e.g., Product Manager, Senior PM, Head of Product"
            className="mt-2"
            rows={3}
          />
          <p className="text-sm text-muted-foreground mt-1">
            You can list more than one
          </p>
          {errors.jobTitles && (
            <p className="text-sm text-destructive mt-1">
              {errors.jobTitles.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-navy">
            Are you a student, recent graduate, career switcher or already
            working?
          </Label>
          <RadioGroup
            value={careerStage}
            onValueChange={(value) =>
              setValue("careerStage", value as IntakeFormData["careerStage"], {
                shouldValidate: true,
              })
            }
            className="mt-3 space-y-2"
          >
            {careerStageOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  careerStage === option.value
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-coral/50"
                }`}
              >
                <RadioGroupItem value={option.value} />
                <span className="text-navy">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
          {errors.careerStage && (
            <p className="text-sm text-destructive mt-1">
              {errors.careerStage.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
