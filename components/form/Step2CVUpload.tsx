"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IntakeFormData } from "@/lib/form-schema";
import { Upload, FileText, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Step2Props {
  form: UseFormReturn<IntakeFormData>;
}

export function Step2CVUpload({ form }: Step2Props) {
  const { register, setValue, watch } = form;
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (
          file.type === "application/pdf" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          setValue("cvFile", file);
          setFileName(file.name);
        }
      }
    },
    [setValue]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("cvFile", file);
      setFileName(file.name);
    }
  };

  const clearFile = () => {
    setValue("cvFile", undefined);
    setFileName(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-navy mb-2">Drop your CV</h2>
        <p className="text-muted-foreground">
          Don&apos;t worry if it&apos;s rough - that&apos;s why you&apos;re here
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-navy">Upload your current CV</Label>
          <div
            className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-coral bg-coral/5"
                : fileName
                ? "border-success bg-success/5"
                : "border-border hover:border-coral/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-success" />
                <div className="text-left">
                  <p className="font-medium text-navy">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    File uploaded successfully
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-navy mb-1">
                  Drag and drop your CV here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF or DOCX (max 10MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ position: "absolute" }}
                />
              </>
            )}
          </div>
          <div className="relative">
            {!fileName && (
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="mt-2 w-full"
              />
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="linkedinUrl" className="text-navy">
            Share your LinkedIn profile link (if you have one)
          </Label>
          <Input
            id="linkedinUrl"
            {...register("linkedinUrl")}
            placeholder="https://linkedin.com/in/yourprofile"
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            If you don&apos;t have one yet, just skip this
          </p>
        </div>
      </div>
    </div>
  );
}
