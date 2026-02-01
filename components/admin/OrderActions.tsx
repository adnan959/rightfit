"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, MessageSquare, AlertTriangle } from "lucide-react";
import type { SubmissionWithRelations } from "@/lib/db/types";

interface OrderActionsProps {
  order: SubmissionWithRelations;
  showSendMessage: boolean;
  setShowSendMessage: (show: boolean) => void;
  showRequestInfo: boolean;
  setShowRequestInfo: (show: boolean) => void;
  showRefundModal: boolean;
  setShowRefundModal: (show: boolean) => void;
  onRefund: (reason: string) => void;
}

const messageTemplates = [
  {
    id: "status_update",
    label: "Status Update",
    subject: "Update on your CV rewrite",
    body: `Hi {name},

Just wanted to let you know that I'm actively working on your CV rewrite. I've reviewed your current CV and the information you provided, and I'm making great progress.

You can expect to receive your rewritten CV within the next 24-48 hours.

Best,
The ApplyBetter Team`,
  },
  {
    id: "completion",
    label: "CV Ready for Review",
    subject: "Your rewritten CV is ready!",
    body: `Hi {name},

Great news - your rewritten CV is ready! I've attached it to this email.

Key changes I made:
• [List specific improvements]
• [Another improvement]
• [Another improvement]

Please review and let me know if you'd like any adjustments. I'm happy to make one round of revisions at no extra cost.

Best of luck with your job search!
The ApplyBetter Team`,
  },
  {
    id: "custom",
    label: "Custom Message",
    subject: "",
    body: "",
  },
];

const infoRequestTemplates = [
  {
    id: "clarification",
    label: "Need Clarification",
    subject: "Quick question about your CV",
    body: `Hi {name},

I'm working on your CV and had a quick question to make sure I get this right:

[Your question here]

Could you please reply with more details? This will help me create the best possible CV for you.

Thanks!
The ApplyBetter Team`,
  },
  {
    id: "missing_info",
    label: "Missing Information",
    subject: "Need additional info for your CV",
    body: `Hi {name},

I noticed that your submission was missing some information that would really strengthen your CV:

• [Missing item 1]
• [Missing item 2]

Could you please provide these details? It'll help me highlight your strengths better.

Thanks!
The ApplyBetter Team`,
  },
  {
    id: "achievements",
    label: "Need More Achievements",
    subject: "Help me showcase your achievements",
    body: `Hi {name},

Your experience is impressive, but I'd love to include more specific achievements. Can you share:

• Any metrics or numbers from your work (% improvements, $ saved, team size, etc.)
• Specific projects you're proud of
• Awards or recognition you've received

This will really make your CV stand out!

Thanks!
The ApplyBetter Team`,
  },
];

export function OrderActions({
  order,
  showSendMessage,
  setShowSendMessage,
  showRequestInfo,
  setShowRequestInfo,
  showRefundModal,
  setShowRefundModal,
  onRefund,
}: OrderActionsProps) {
  const [messageTemplate, setMessageTemplate] = useState("status_update");
  const [messageSubject, setMessageSubject] = useState(messageTemplates[0].subject);
  const [messageBody, setMessageBody] = useState(
    messageTemplates[0].body.replace("{name}", order.full_name.split(" ")[0])
  );

  const [infoTemplate, setInfoTemplate] = useState("clarification");
  const [infoSubject, setInfoSubject] = useState(infoRequestTemplates[0].subject);
  const [infoBody, setInfoBody] = useState(
    infoRequestTemplates[0].body.replace("{name}", order.full_name.split(" ")[0])
  );

  const [refundReason, setRefundReason] = useState("");

  const handleMessageTemplateChange = (templateId: string) => {
    setMessageTemplate(templateId);
    const template = messageTemplates.find((t) => t.id === templateId);
    if (template) {
      setMessageSubject(template.subject);
      setMessageBody(template.body.replace("{name}", order.full_name.split(" ")[0]));
    }
  };

  const handleInfoTemplateChange = (templateId: string) => {
    setInfoTemplate(templateId);
    const template = infoRequestTemplates.find((t) => t.id === templateId);
    if (template) {
      setInfoSubject(template.subject);
      setInfoBody(template.body.replace("{name}", order.full_name.split(" ")[0]));
    }
  };

  const handleSendMessage = () => {
    // In production, this would send an email via API
    console.log("Sending message:", { subject: messageSubject, body: messageBody });
    alert(`Message would be sent to ${order.email}\n\nSubject: ${messageSubject}`);
    setShowSendMessage(false);
  };

  const handleRequestInfo = () => {
    // In production, this would send an email via API
    console.log("Requesting info:", { subject: infoSubject, body: infoBody });
    alert(`Info request would be sent to ${order.email}\n\nSubject: ${infoSubject}`);
    setShowRequestInfo(false);
  };

  const handleRefund = () => {
    if (!refundReason.trim()) {
      alert("Please provide a reason for the refund");
      return;
    }
    onRefund(refundReason);
    setRefundReason("");
  };

  return (
    <>
      {/* Send Message Modal */}
      <Dialog open={showSendMessage} onOpenChange={setShowSendMessage}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Message to Customer
            </DialogTitle>
            <DialogDescription>
              Send an email to {order.full_name} ({order.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Template</Label>
              <Select value={messageTemplate} onValueChange={handleMessageTemplateChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={10}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendMessage(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Modal */}
      <Dialog open={showRequestInfo} onOpenChange={setShowRequestInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Request More Information
            </DialogTitle>
            <DialogDescription>
              Ask {order.full_name} for additional information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Template</Label>
              <Select value={infoTemplate} onValueChange={handleInfoTemplateChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {infoRequestTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                type="text"
                value={infoSubject}
                onChange={(e) => setInfoSubject(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={infoBody}
                onChange={(e) => setInfoBody(e.target.value)}
                rows={10}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfo(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestInfo}>
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Refund Order
            </DialogTitle>
            <DialogDescription>
              Process a refund for {order.full_name}. This action will change the order
              status to &quot;Refunded&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Refund Amount:</strong> $30.00
              </p>
              <p className="text-xs text-red-600 mt-1">
                Note: Actual Stripe refund processing is not yet implemented.
              </p>
            </div>

            <div>
              <Label>Reason for Refund</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please provide a reason for the refund..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
