"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Mail,
  Linkedin,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Pin,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  type SubmissionWithRelations,
  type SubmissionStatus,
  type NoteType,
  type ReviewNote,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  CAREER_STAGE_LABELS,
  TIMELINE_LABELS,
} from "@/lib/db/types";
import { formatDateTime, formatDistanceToNow } from "@/lib/utils";

type TabType = "overview" | "cv-review" | "billing" | "activity";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [submission, setSubmission] = useState<SubmissionWithRelations | null>(null);
  const [fileUrls, setFileUrls] = useState<{
    cv: string | null;
    coverLetter: string | null;
    rewrittenCv: string | null;
  }>({ cv: null, coverLetter: null, rewrittenCv: null });
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchSubmission = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`);
      const data = await response.json();

      if (data.success) {
        setSubmission(data.submission);
        setFileUrls(data.fileUrls);
      }
    } catch (error) {
      console.error("Failed to fetch submission:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleStatusChange = async (status: SubmissionStatus) => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSubmission((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSavingNote(true);
    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: id,
          note_type: noteType,
          content: newNote,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission((prev) =>
          prev
            ? {
                ...prev,
                review_notes: [data.note, ...(prev.review_notes || [])],
              }
            : null
        );
        setNewNote("");
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/admin/notes?id=${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSubmission((prev) =>
          prev
            ? {
                ...prev,
                review_notes: prev.review_notes?.filter((n) => n.id !== noteId),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Loading...">
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading submission...</div>
        </div>
      </AdminShell>
    );
  }

  if (!submission) {
    return (
      <AdminShell title="Not Found">
        <div className="flex h-64 flex-col items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-gray-500">Submission not found</p>
          <Link href="/admin">
            <Button variant="link" className="mt-4">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "cv-review", label: "CV Review" },
    { id: "billing", label: "Billing" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <AdminShell
      title={submission.full_name}
      actions={
        <div className="flex items-center gap-3">
          <Select
            value={submission.status}
            onValueChange={(v) => handleStatusChange(v as SubmissionStatus)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      }
    >
      {/* Status Badges */}
      <div className="mb-6 flex items-center gap-3">
        <Badge className={STATUS_COLORS[submission.status]} variant="secondary">
          {STATUS_LABELS[submission.status]}
        </Badge>
        <Badge className={PRIORITY_COLORS[submission.priority]} variant="secondary">
          {PRIORITY_LABELS[submission.priority]}
        </Badge>
        <span className="text-sm text-gray-500">
          Submitted {formatDistanceToNow(submission.created_at)}
        </span>
      </div>

      {/* Tabs */}
      <AdminTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab submission={submission} fileUrls={fileUrls} />
      )}

      {activeTab === "cv-review" && (
        <CVReviewTab
          submission={submission}
          fileUrls={fileUrls}
          newNote={newNote}
          setNewNote={setNewNote}
          noteType={noteType}
          setNoteType={setNoteType}
          isSavingNote={isSavingNote}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {activeTab === "billing" && <BillingTab submission={submission} />}

      {activeTab === "activity" && <ActivityTab submission={submission} />}
    </AdminShell>
  );
}

// Overview Tab Component
function OverviewTab({
  submission,
  fileUrls,
}: {
  submission: SubmissionWithRelations;
  fileUrls: { cv: string | null; coverLetter: string | null };
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <span>{submission.full_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <a href={`mailto:${submission.email}`} className="text-coral-600 hover:underline">
              {submission.email}
            </a>
          </div>
          {submission.linkedin_url && (
            <div className="flex items-center gap-3">
              <Linkedin className="h-5 w-5 text-gray-400" />
              <a
                href={submission.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-coral-600 hover:underline"
              >
                LinkedIn Profile
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span>{submission.location}</span>
          </div>
        </CardContent>
      </Card>

      {/* Career Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Career Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-gray-400" />
            <span>{submission.job_titles}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span>{TIMELINE_LABELS[submission.timeline]}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Career Stage:</span>
            <p>{CAREER_STAGE_LABELS[submission.career_stage]}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Industries:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {submission.industries.map((ind) => (
                <Badge key={ind} variant="secondary">
                  {ind}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fileUrls.cv ? (
            <a
              href={fileUrls.cv}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
            >
              <FileText className="h-5 w-5 text-coral-500" />
              <span className="flex-1">Original CV</span>
              <Download className="h-4 w-4 text-gray-400" />
            </a>
          ) : (
            <p className="text-sm text-gray-500">No CV uploaded</p>
          )}
          {fileUrls.coverLetter && (
            <a
              href={fileUrls.coverLetter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="flex-1">Cover Letter</span>
              <Download className="h-4 w-4 text-gray-400" />
            </a>
          )}
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submission.current_job_role && (
            <div>
              <span className="text-sm text-gray-500">Current Role:</span>
              <p className="mt-1">{submission.current_job_role}</p>
            </div>
          )}
          {submission.achievements && (
            <div>
              <span className="text-sm text-gray-500">Achievements:</span>
              <p className="mt-1">{submission.achievements}</p>
            </div>
          )}
          {submission.challenges.length > 0 && (
            <div>
              <span className="text-sm text-gray-500">Challenges:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {submission.challenges.map((ch) => (
                  <Badge key={ch} variant="outline">
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {submission.certifications && (
            <div>
              <span className="text-sm text-gray-500">Certifications:</span>
              <p className="mt-1">{submission.certifications}</p>
            </div>
          )}
          {submission.tools && (
            <div>
              <span className="text-sm text-gray-500">Tools:</span>
              <p className="mt-1">{submission.tools}</p>
            </div>
          )}
          {submission.additional_context && (
            <div>
              <span className="text-sm text-gray-500">Additional Context:</span>
              <p className="mt-1">{submission.additional_context}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// CV Review Tab Component
function CVReviewTab({
  submission,
  fileUrls,
  newNote,
  setNewNote,
  noteType,
  setNoteType,
  isSavingNote,
  onAddNote,
  onDeleteNote,
}: {
  submission: SubmissionWithRelations;
  fileUrls: { cv: string | null };
  newNote: string;
  setNewNote: (v: string) => void;
  noteType: NoteType;
  setNoteType: (v: NoteType) => void;
  isSavingNote: boolean;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
}) {
  const aiGrade = submission.ai_grades?.[0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {aiGrade ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Overall Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{aiGrade.overall_score}</span>
                  <span className="text-gray-400">/100</span>
                </div>
              </div>
              <Badge
                className={
                  aiGrade.overall_score >= 70
                    ? "bg-green-100 text-green-800"
                    : aiGrade.overall_score >= 50
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {aiGrade.label}
              </Badge>

              {/* Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Breakdown</h4>
                {Object.entries(aiGrade.breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-coral-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Issues */}
              {aiGrade.top_issues?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Top Issues</h4>
                  <ul className="space-y-2">
                    {aiGrade.top_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {aiGrade.recommendations?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recommendations</h4>
                  <ul className="space-y-2">
                    {aiGrade.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <AlertTriangle className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2">No AI analysis available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes & Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes & Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Note Form */}
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <Select
                value={noteType}
                onValueChange={(v) => setNoteType(v as NoteType)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="ai_feedback">AI Feedback</SelectItem>
                  <SelectItem value="prompt">Prompt</SelectItem>
                  <SelectItem value="rewrite_instruction">Rewrite Instruction</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={onAddNote}
                disabled={isSavingNote || !newNote.trim()}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            <Textarea
              placeholder="Add a note, correction, or rewrite instruction..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {submission.review_notes?.map((note: ReviewNote) => (
              <div
                key={note.id}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {note.note_type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(note.created_at)}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {note.is_pinned && <Pin className="h-4 w-4 text-coral-500" />}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{note.content}</p>
              </div>
            ))}

            {(!submission.review_notes || submission.review_notes.length === 0) && (
              <p className="text-center text-sm text-gray-400">No notes yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CV Preview */}
      {fileUrls.cv && (
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Original CV</CardTitle>
            <a href={fileUrls.cv} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </a>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                CV file available for download. Full preview coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Billing Tab Component
function BillingTab({ submission }: { submission: SubmissionWithRelations }) {
  const payment = submission.payments?.[0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          {payment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="text-xl font-semibold">
                  ${(payment.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge
                  className={
                    payment.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : payment.status === "refunded"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Date</span>
                <span>{formatDateTime(payment.created_at)}</span>
              </div>
              {payment.stripe_payment_intent_id && (
                <div>
                  <span className="text-gray-500">Stripe ID</span>
                  <p className="font-mono text-sm">{payment.stripe_payment_intent_id}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Clock className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2">No payment recorded</p>
              <p className="text-sm">Manual invoicing in use</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" disabled>
            Create Invoice
          </Button>
          <Button variant="outline" className="w-full" disabled>
            Process Refund
          </Button>
          <p className="text-center text-xs text-gray-400">
            Stripe integration coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ submission }: { submission: SubmissionWithRelations }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {submission.activity_log && submission.activity_log.length > 0 ? (
          <div className="space-y-4">
            {submission.activity_log.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="h-full w-px bg-gray-200" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(activity.created_at)} by {activity.actor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <Clock className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2">No activity recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
