"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";
import { useActiveOrganizationContext } from "@/hooks/contexts/active-organization";

export default function LeaveOrganizationPage() {
  const router = useRouter();
  const { activeOrg } = useActiveOrganizationContext()

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await authClient.organization.leave({
        organizationId: activeOrg.id!
      });

      if (res.error) {
        toast.error(res.error.message);
        return;
      }

      toast.success("You have left the organization");
      router.push("/organizations");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to leave organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg py-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Leave organization
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You are about to leave this organization.
            You will immediately lose access to:
          </p>

          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Organization projects and data</li>
            <li>Internal tools and dashboards</li>
            <li>Member-only resources</li>
          </ul>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(Boolean(v))}
            />
            <label
              htmlFor="confirm"
              className="text-sm leading-tight text-muted-foreground"
            >
              I understand that this action cannot be undone.
            </label>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={!confirmed || loading}
            >
              {loading ? "Leaving..." : "Leave organization"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
