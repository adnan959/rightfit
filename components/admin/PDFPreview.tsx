"use client";

import { useState } from "react";
import { FileText, Download, ExternalLink, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewProps {
  filePath: string | null;
  fileName?: string;
  onDownload?: () => void;
}

export function PDFPreview({ filePath, fileName, onDownload }: PDFPreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine file type from path or name
  const fileExtension = (fileName || filePath || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  const isPDF = fileExtension === "pdf";
  const isDOCX = fileExtension === "docx" || fileExtension === "doc";

  // Generate a preview URL (in production, this would be a real file URL)
  const previewUrl = filePath ? `/api/files/${filePath}` : null;

  const handleClick = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
    onDownload?.();
  };

  // If no file or DOCX (can't preview), show placeholder
  if (!filePath || isDOCX || hasError) {
    return (
      <div
        className="relative h-full min-h-[300px] rounded-lg border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-coral-300 transition-colors group"
        onClick={handleClick}
      >
        <div className="flex flex-col items-center text-center p-6">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 group-hover:bg-coral-100 transition-colors">
            <File className="h-8 w-8 text-gray-400 group-hover:text-coral-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {fileName || "Original CV"}
          </p>
          {isDOCX && (
            <p className="text-xs text-gray-500 mt-1">
              DOCX preview not available
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4 group-hover:border-coral-300 group-hover:text-coral-600"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
    );
  }

  // PDF preview using object/embed
  return (
    <div
      className="relative h-full min-h-[300px] rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-coral-300 transition-colors group"
      onClick={handleClick}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-2">Loading preview...</p>
          </div>
        </div>
      )}

      {/* PDF Preview using object tag */}
      <object
        data={previewUrl || ""}
        type="application/pdf"
        className="w-full h-full min-h-[300px]"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      >
        {/* Fallback if object tag doesn't work */}
        <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
          <FileText className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">PDF preview not supported</p>
          <Button variant="outline" size="sm" className="mt-3">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open PDF
          </Button>
        </div>
      </object>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />

      {/* Click to download indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white rounded-full p-2 shadow-md">
          <ExternalLink className="h-4 w-4 text-gray-600" />
        </div>
      </div>

      {/* Fade overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

      {/* File name badge */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-coral-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">
              {fileName || "Original CV"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
