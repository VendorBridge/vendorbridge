import { AppShell } from "@/components/layout/app-shell";

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
