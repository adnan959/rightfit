"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, Loader2, Mail } from "lucide-react";
import { GradeResults } from "./GradeResults";
import { CVGradeResult } from "@/lib/cv-reviewer-skill";

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = "upload" | "grading" | "basic_result" | "email_capture" | "full_result";

export function CVUploadModal({ isOpen, onClose }: CVUploadModalProps) {
  const [state, setState] = useState<ModalState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [email, setEmail] = useState("");
  const [gradeResult, setGradeResult] = useState<CVGradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a PDF or DOCX file");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleGradeCV = async () => {
    if (!file) return;

    setState("grading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("fullAnalysis", "false");

      const response = await fetch("/api/grade-cv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to grade CV");
      }

      setGradeResult(data.grade);
      setState("basic_result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("upload");
    }
  };

  const handleGetFullReport = () => {
    setState("email_capture");
  };

  const handleSubmitEmail = async () => {
    if (!email || !gradeResult) return;

    try {
      // Capture lead
      await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "free_audit",
          cvGradeScore: gradeResult.overallScore,
        }),
      });

      // Get full analysis
      setState("grading");
      
      const formData = new FormData();
      formData.append("cv", file!);
      formData.append("fullAnalysis", "true");

      const response = await fetch("/api/grade-cv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get full report");
      }

      setGradeResult(data.grade);
      setState("full_result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("email_capture");
    }
  };

  const handleClose = () => {
    // Reset state
    setState("upload");
    setFile(null);
    setEmail("");
    setGradeResult(null);
    setError(null);
    onClose();
  };

  const renderContent = () => {
    switch (state) {
      case "upload":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                Free CV Quick Audit
              </DialogTitle>
              <DialogDescription>
                Upload your CV and get an instant grade. See what recruiters see.
              </DialogDescription>
            </DialogHeader>

            <div
              className={`mt-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-coral bg-coral/5"
                  : file
                  ? "border-success bg-success/5"
                  : "border-border hover:border-coral/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-success" />
                  <div className="text-left">
                    <p className="font-medium text-navy">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Ready to analyze
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-navy mb-1">
                    Drag and drop your CV here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF or DOCX (max 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      Browse files
                    </label>
                  </Button>
                </>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}

            <Button
              onClick={handleGradeCV}
              disabled={!file}
              className="w-full mt-6 bg-coral hover:bg-coral-dark text-white"
            >
              Grade My CV
            </Button>
          </>
        );

      case "grading":
        return (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-coral animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-navy mb-2">
              Analyzing your CV...
            </p>
            <p className="text-muted-foreground">
              This usually takes 10-20 seconds
            </p>
          </div>
        );

      case "basic_result":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                Your CV Score
              </DialogTitle>
            </DialogHeader>

            {gradeResult && (
              <GradeResults result={gradeResult} isBasic={true} />
            )}

            <div className="mt-6 p-4 bg-secondary rounded-xl border border-border">
              <p className="text-navy font-medium mb-2">
                Want the full breakdown?
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Get detailed analysis for each category plus specific
                recommendations to fix your CV.
              </p>
              <Button
                onClick={handleGetFullReport}
                className="w-full bg-coral hover:bg-coral-dark text-white"
              >
                Get Full Report (Free)
              </Button>
            </div>
          </>
        );

      case "email_capture":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                Where should we send your full report?
              </DialogTitle>
              <DialogDescription>
                Enter your email to get the detailed breakdown and
                recommendations.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleSubmitEmail}
                disabled={!email}
                className="w-full bg-coral hover:bg-coral-dark text-white"
              >
                Send My Full Report
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll only email you about your CV. No spam, ever.
              </p>
            </div>
          </>
        );

      case "full_result":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                Your Full CV Analysis
              </DialogTitle>
            </DialogHeader>

            {gradeResult && (
              <GradeResults result={gradeResult} isBasic={false} />
            )}

            <div className="mt-6 p-4 bg-coral/10 rounded-xl border border-coral/20">
              <p className="text-navy font-medium mb-2">
                Ready to fix these issues?
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Get a professional CV rewrite for just $30. Ready in 48-96
                hours.
              </p>
              <Button
                asChild
                className="w-full bg-coral hover:bg-coral-dark text-white"
              >
                <a href="/form">Start My CV Revamp - $30</a>
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
