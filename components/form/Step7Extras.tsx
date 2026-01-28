"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IntakeFormData, coverLetterOptions } from "@/lib/form-schema";
import { Upload, FileText, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Step7Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step7Extras({ form }: Step7Props) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const hasCoverLetter = watch("hasCoverLetter");
  const [coverLetterFileName, setCoverLetterFileName] = useState<string | null>(
    null
  );

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("coverLetterFile", file);
      setCoverLetterFileName(file.name);
    }
  };

  const clearCoverLetter = () => {
    setValue("coverLetterFile", undefined);
    setCoverLetterFileName(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">Extra materials</h2>
        <p className="text-muted-foreground">
          Optional but helpful - skip what doesn&apos;t apply
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-navy">Do you have a cover letter already?</Label>
          <RadioGroup
            value={hasCoverLetter}
            onValueChange={(value) =>
              setValue(
                "hasCoverLetter",
                value as IntakeFormData["hasCoverLetter"],
                { shouldValidate: true }
              )
            }
            className="mt-3 space-y-2"
          >
            {coverLetterOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  hasCoverLetter === option.value
                    ? "border-coral bg-coral/5"
                    : "border-border hover:border-coral/50"
                }`}
              >
                <RadioGroupItem value={option.value} />
                <span className="text-navy">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {hasCoverLetter === "yes" && (
          <div>
            <Label className="text-navy">Upload your cover letter</Label>
            <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center">
              {coverLetterFileName ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-success" />
                  <span className="font-medium text-navy">
                    {coverLetterFileName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCoverLetter}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    PDF or DOCX
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleCoverLetterChange}
                    className="mt-2"
                  />
                </>
              )}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="certifications" className="text-navy">
            List any certifications, courses or training you have completed
          </Label>
          <Textarea
            id="certifications"
            {...register("certifications")}
            placeholder="e.g., Google Analytics Certified, PMP, AWS Solutions Architect..."
            className="mt-2"
            rows={3}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Online courses totally count too
          </p>
        </div>

        <div>
          <Label htmlFor="tools" className="text-navy">
            What tools or skills do you use or are learning?
          </Label>
          <Textarea
            id="tools"
            {...register("tools")}
            placeholder="e.g., Excel, Power BI, Figma, Salesforce, Python, Canva..."
            className="mt-2"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
