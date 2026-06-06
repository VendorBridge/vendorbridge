"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { submitRfqForApprovalAction } from "../../actions";

interface CompareActionsProps {
  rfqId: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  isRfqClosed: boolean;
}

export default function CompareActions({
  rfqId,
  quotationId,
  vendorId,
  vendorName,
  isRfqClosed,
}: CompareActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (confirm(`Are you sure you want to select ${vendorName}'s bid and submit this RFQ for Manager Approval?`)) {
      setLoading(true);
      try {
        const res = await submitRfqForApprovalAction({ rfqId, quotationId, vendorId });
        if (res.success) {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            router.refresh();
          }, 2000);
        } else {
          alert(res.error || "Failed to submit for approval.");
        }
      } catch (err) {
        alert("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (isRfqClosed) {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-semibold bg-amber-500/10 px-4 py-2.5 rounded-xl">
        <CheckCircle2 className="size-4" />
        <span>Submitted for Approval</span>
      </div>
    );
  }

  return (
    <>
      {success && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500 text-white shadow-2xl">
          <CheckCircle2 className="size-5" />
          <span className="font-medium text-sm">Submitted to Manager successfully!</span>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        size="sm"
        className="w-full rounded-xl gap-1.5 shadow-sm"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Send className="size-3.5" />
        )}
        {loading ? "Submitting..." : "Submit for Approval"}
      </Button>
    </>
  );
}
