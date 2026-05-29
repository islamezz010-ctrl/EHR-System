"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PatientBillItem } from "@/lib/patient-bills";
import { cn, formatCurrency } from "@/lib/utils";

type StripePayButtonProps = {
  bills: PatientBillItem[];
  totalDue: number;
  onPaymentComplete: (billIds: string[]) => void;
  className?: string;
};

export function StripePayButton({
  bills,
  totalDue,
  onPaymentComplete,
  className,
}: StripePayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [mockOpen, setMockOpen] = useState(false);
  const [mockProcessing, setMockProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payableBills = bills.filter(
    (bill) => bill.patientOwes > 0 && bill.status !== "Paid",
  );

  const handlePay = async () => {
    if (payableBills.length === 0 || totalDue <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bills: payableBills.map((bill) => ({
            id: bill.id,
            description: bill.description,
            patientOwes: bill.patientOwes,
          })),
        }),
      });

      if (response.status === 503) {
        setMockOpen(true);
        return;
      }

      // Ensure response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.includes("application/json")) {
        const errorText = !contentType?.includes("application/json")
          ? "Server error occurred."
          : (await response.json()).error;
        throw new Error(errorText ?? "Unable to start Stripe checkout.");
      }

      const data = (await response.json()) as {
        sessionId?: string;
        url?: string;
        error?: string;
      };

      if (!data.url && !data.sessionId) {
        throw new Error(data.error ?? "Unable to start Stripe checkout.");
      }

      if (data.url) {
        sessionStorage.setItem(
          "medi-dash-pending-bills",
          payableBills.map((bill) => bill.id).join(","),
        );
        window.location.href = data.url;
        return;
      }

      // Fallback for demo mode if no checkout URL is available
      setMockOpen(true);
    } catch (payError) {
      setError(
        payError instanceof Error
          ? payError.message
          : "Payment could not be started.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMockPay = async () => {
    setMockProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onPaymentComplete(payableBills.map((bill) => bill.id));
    setMockProcessing(false);
    setMockOpen(false);
  };

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <Button
          size="lg"
          className="w-full bg-[#635bff] hover:bg-[#5851ea] text-white"
          disabled={loading || totalDue <= 0 || payableBills.length === 0}
          onClick={handlePay}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CreditCard className="size-4" />
          )}
          Pay {formatCurrency(totalDue)} with Stripe
        </Button>
        {error ? (
          <p className="text-center text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}
      </div>

      <Dialog open={mockOpen} onOpenChange={setMockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="rounded bg-[#635bff] px-2 py-0.5 text-xs font-bold text-white">
                stripe
              </span>
              Secure checkout
            </DialogTitle>
            <DialogDescription>
              Demo mode — add Stripe keys to{" "}
              <code className="text-xs">.env.local</code> for live checkout. Use
              card 4242 4242 4242 4242 in test mode.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount due</span>
              <span className="font-semibold">{formatCurrency(totalDue)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {payableBills.length} outstanding bill
              {payableBills.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="space-y-3">
            <Input placeholder="4242 4242 4242 4242" aria-label="Card number" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="MM / YY" aria-label="Expiry" />
              <Input placeholder="CVC" aria-label="CVC" />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-[#635bff] hover:bg-[#5851ea] text-white"
              disabled={mockProcessing}
              onClick={handleMockPay}
            >
              {mockProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Pay {formatCurrency(totalDue)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
