import { AppShell } from "@/components/layout/app-shell";

export default function QuotationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
