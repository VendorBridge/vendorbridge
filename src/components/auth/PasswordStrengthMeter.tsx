"use client";

import { checkPasswordStrength, type PasswordStrengthResult } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result: PasswordStrengthResult = checkPasswordStrength(password);

  if (result.strength === "empty") return null;

  const criteria = [
    { label: "At least 8 characters", met: result.checks.minLength },
    { label: "Uppercase letter (A–Z)", met: result.checks.hasUppercase },
    { label: "Lowercase letter (a–z)", met: result.checks.hasLowercase },
    { label: "Number (0–9)", met: result.checks.hasNumber },
    { label: "Special character (!@#…)", met: result.checks.hasSpecial },
  ];

  const segments = 5;
  const filledSegments = result.score;

  return (
    <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor:
                  i < filledSegments ? result.color : "hsl(var(--border))",
                opacity: i < filledSegments ? 1 : 0.5,
              }}
            />
          ))}
        </div>
        <p
          className="text-xs font-semibold transition-colors duration-300"
          style={{ color: result.color }}
        >
          {result.label}
        </p>
      </div>

      {/* Criteria checklist */}
      <ul className="grid grid-cols-1 gap-1">
        {criteria.map((c) => (
          <li
            key={c.label}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-300",
              c.met
                ? "text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            <span
              className={cn(
                "flex-shrink-0 size-4 rounded-full flex items-center justify-center transition-all duration-300",
                c.met
                  ? "bg-emerald-500"
                  : "border border-[hsl(var(--border))]"
              )}
            >
              {c.met && <Check className="size-2.5 text-white" strokeWidth={3} />}
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
