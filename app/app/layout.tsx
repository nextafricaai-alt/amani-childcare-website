import type { Metadata } from "next";
import { OsProvider } from "@/lib/os/context";
import OsShell from "@/components/os/shell";

export const metadata: Metadata = {
  title: { default: "Pikadon OS", template: "%s · Pikadon OS" },
  description: "The Pikadon operating system for parents, caregivers, branch managers and the network.",
  robots: { index: false, follow: false },
};

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return (
    <OsProvider>
      <OsShell>{children}</OsShell>
    </OsProvider>
  );
}
