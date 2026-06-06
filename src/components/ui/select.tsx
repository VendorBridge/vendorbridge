import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))]",
        "bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]",
        "ring-offset-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
