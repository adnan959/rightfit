"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  Key,
  CreditCard,
  Mail,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  // These would be checked from environment in a real implementation
  const integrations = [
    {
      name: "Supabase",
      description: "Database and file storage",
      icon: Database,
      configured: false, // Would check SUPABASE_URL
      configUrl: "https://supabase.com/dashboard",
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    },
    {
      name: "OpenAI",
      description: "CV grading AI",
      icon: Key,
      configured: true, // Assuming configured since CV grading works
      configUrl: "https://platform.openai.com/api-keys",
      envVars: ["OPENAI_API_KEY"],
    },
    {
      name: "Stripe",
      description: "Payment processing",
      icon: CreditCard,
      configured: false,
      configUrl: "https://dashboard.stripe.com/apikeys",
      envVars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"],
    },
    {
      name: "Email (Coming Soon)",
      description: "Transactional emails",
      icon: Mail,
      configured: false,
      configUrl: null,
      envVars: [],
    },
  ];

  return (
    <AdminShell
      title="Settings"
    >
      {/* Integration Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Status of external service connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <integration.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-gray-500">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.configured ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Configured
                    </Badge>
                  )}
                  {integration.configUrl && (
                    <a
                      href={integration.configUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Configure
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Required environment variables for full functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-900 p-4">
            <pre className="overflow-x-auto text-sm text-gray-100">
              <code>
{`# OpenAI API Key (required for CV grading)
OPENAI_API_KEY=sk-your-api-key-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Password
ADMIN_PASSWORD=your-secure-password

# Stripe (optional - for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
              </code>
            </pre>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Copy these to your <code className="rounded bg-gray-100 px-1">.env.local</code> file.
            See <code className="rounded bg-gray-100 px-1">.env.example</code> for a template.
          </p>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pricing Configuration</CardTitle>
          <CardDescription>Current service pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">CV Rewrite Service</h3>
              <p className="text-sm text-gray-500">Single fixed price</p>
            </div>
            <div className="text-2xl font-bold">$30</div>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Pricing changes require code updates. Future versions will support
            dynamic pricing through the dashboard.
          </p>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
