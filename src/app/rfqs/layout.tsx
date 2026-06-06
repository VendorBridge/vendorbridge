import { AppShell } from "@/components/layout/app-shell";

export default function RfqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
