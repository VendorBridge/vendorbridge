import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-[var(--radius)] border border-[hsl(var(--border))]",
        "bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]",
        "ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors duration-150",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
