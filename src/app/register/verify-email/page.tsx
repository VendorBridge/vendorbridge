"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";
  const error = searchParams.get("error");
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      // Simulate resend API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResendStatus("Verification email resent successfully! (Check terminal console)");
    } catch {
      setResendStatus("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl transition-all duration-300">
      
      {/* Header icon */}
      <div className="flex justify-center mb-6">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <Mail className="size-8" />
        </div>
      </div>

      {error ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center text-red-500 mb-2">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Verification Failed
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {error === "invalid_or_expired"
              ? "The verification token is invalid or has expired. Please try registering again."
              : "An error occurred during verification. Please request a new link."}
          </p>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Verify your email
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            We sent a verification link to <span className="font-semibold text-[hsl(var(--foreground))]">{email}</span>. 
            Please check your inbox and click the link to complete registration.
          </p>
        </div>
      )}

      {/* Resend actions */}
      <div className="mt-8 space-y-4">
        <Button
          onClick={handleResend}
          disabled={resending}
          className="w-full h-11"
        >
          {resending ? "Resending..." : "Resend Email"}
        </Button>

        {resendStatus && (
          <p className="text-xs text-center font-medium text-emerald-500 animate-in fade-in duration-300">
            {resendStatus}
          </p>
        )}

        <div className="flex justify-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Login
          </Link>
        </div>
      </div>

      {/* Demo helper info */}
      <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
        <p className="font-bold mb-1 flex items-center gap-1.5">
          <Sparkles className="size-3.5" /> Hackathon Demo Notice
        </p>
        <p className="leading-relaxed">
          Because actual email delivery requires credentials, the verification link has been printed in the server terminal log. Click the link in your console to verify.
        </p>
      </div>

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[hsl(var(--background))]">
      <Suspense fallback={<div className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
