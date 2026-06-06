"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  min?: Date;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  min,
  disabled,
  className,
  id,
}: DatePickerProps) {
  const minStr = min ? format(min, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  const valueStr = value ? format(value, "yyyy-MM-dd") : "";

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type="date"
        value={valueStr}
        min={minStr}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? new Date(val + "T00:00:00") : undefined);
        }}
        className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
    </div>
  );
}
