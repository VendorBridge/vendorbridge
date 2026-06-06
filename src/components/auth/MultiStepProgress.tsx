"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  icon: string;
}

interface MultiStepProgressProps {
  currentStep: number;
  steps: Step[];
}

export default function MultiStepProgress({ currentStep, steps }: MultiStepProgressProps) {
  return (
    <div className="w-full mb-8">
      {/* Step indicators */}
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : isActive
                        ? "text-white shadow-lg shadow-primary/30"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  )}
                  style={
                    isActive
                      ? { background: "hsl(var(--primary))" }
                      : undefined
                  }
                >
                  {isCompleted ? (
                    <Check className="size-5" strokeWidth={3} />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1.5 font-medium transition-colors duration-300 whitespace-nowrap",
                    isActive
                      ? "text-[hsl(var(--primary))]"
                      : isCompleted
                        ? "text-emerald-500"
                        : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-3 mb-5">
                  <div className="h-0.5 rounded-full overflow-hidden bg-[hsl(var(--border))]">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700 ease-in-out"
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
