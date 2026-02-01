"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Send,
  Download,
  Upload,
  Eye,
  File,
  X,
  CheckCircle,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import type { SubmissionWithRelations } from "@/lib/db/types";
import type { CVVersion } from "@/lib/dummy-data";
import { formatDateTime } from "@/lib/utils";

interface FilesSectionProps {
  order: SubmissionWithRelations;
  cvVersions: CVVersion[];
  onVersionsChange: (versions: CVVersion[]) => void;
  onDelivery?: () => void;
}

export function FilesSection({
  order,
  cvVersions,
  onVersionsChange,
  onDelivery,
}: FilesSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryComplete, setDeliveryComplete] = useState(false);

  const hasRewrittenCV = cvVersions.length > 0 || order.rewritten_cv_path;
  const canDeliver = hasRewrittenCV && order.status !== "delivered" && order.status !== "refunded";
  const isDelivered = order.status === "delivered";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return "Only PDF and DOCX files are allowed";
    }

    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setUploadError(null);
      setUploadSuccess(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }

      const newVersion: CVVersion = {
        id: `cv_v${cvVersions.length + 1}_${order.id}`,
        submission_id: order.id,
        version_number: cvVersions.length + 1,
        file_path: `cv-files/${order.id}_v${cvVersions.length + 1}.${file.name.split(".").pop()}`,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
      };

      onVersionsChange([newVersion, ...cvVersions]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    [cvVersions, onVersionsChange, order.id]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadError(null);
      setUploadSuccess(false);

      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }

      const newVersion: CVVersion = {
        id: `cv_v${cvVersions.length + 1}_${order.id}`,
        submission_id: order.id,
        version_number: cvVersions.length + 1,
        file_path: `cv-files/${order.id}_v${cvVersions.length + 1}.${file.name.split(".").pop()}`,
        file_name: file.name,
        uploaded_at: new Date().toISOString(),
      };

      onVersionsChange([newVersion, ...cvVersions]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      e.target.value = "";
    },
    [cvVersions, onVersionsChange, order.id]
  );

  const handleDelivery = async () => {
    setIsDelivering(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsDelivering(false);
    setShowDeliveryConfirm(false);
    setDeliveryComplete(true);
    
    // Call parent callback
    onDelivery?.();
    
    // Reset after animation
    setTimeout(() => setDeliveryComplete(false), 5000);
  };

  return (
    <>
      <Card className={deliveryComplete ? "ring-2 ring-green-500 ring-offset-2" : ""}>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Send className="h-3.5 w-3.5" />
              Delivery
            </CardTitle>
            {isDelivered && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Delivered
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {/* Delivery Complete Celebration */}
          {deliveryComplete && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <PartyPopper className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">CV Sent Successfully!</p>
                  <p className="text-xs text-green-600">Customer notified via email.</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivered State */}
          {isDelivered && !deliveryComplete && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">CV Delivered</p>
                  <p className="text-xs text-green-600">
                    Sent on {order.delivered_at ? formatDateTime(order.delivered_at) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Zone */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
              isDragging
                ? "border-coral-500 bg-coral-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
          >
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
            />
            <Upload className={`h-8 w-8 ${isDragging ? "text-coral-500" : "text-gray-400"}`} />
            <p className="mt-2 text-sm font-medium text-gray-700">
              Drop rewritten CV here or click to upload
            </p>
            <p className="text-xs text-gray-400">PDF or DOCX, max 10MB</p>
          </label>

          {/* Upload Messages */}
          {uploadError && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {uploadError}
              <button onClick={() => setUploadError(null)} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 p-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              File uploaded successfully!
            </div>
          )}

          {/* CV Versions List */}
          {cvVersions.length > 0 && (
            <div className="mt-3 space-y-2">
              {cvVersions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 bg-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100">
                    <File className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        V{version.version_number}
                      </Badge>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{version.file_name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Deliver CV Button */}
          {!isDelivered && (
            <Button
              onClick={() => setShowDeliveryConfirm(true)}
              disabled={!canDeliver}
              className="w-full mt-3"
            >
              <Send className="mr-2 h-4 w-4" />
              Deliver CV
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={showDeliveryConfirm} onOpenChange={setShowDeliveryConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-coral-500" />
              Deliver CV to Customer
            </DialogTitle>
            <DialogDescription>
              This will send the CV to {order.full_name} and mark the order as delivered.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <div className="rounded-lg bg-gray-50 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium">{order.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CV Version:</span>
                <span className="font-medium">
                  {cvVersions.length > 0 ? `V${cvVersions[0].version_number}` : "Latest"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelivery}
              disabled={isDelivering}
            >
              {isDelivering ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Deliver CV
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
