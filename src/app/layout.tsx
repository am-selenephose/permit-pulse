import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receivable Radar — CALL-E Accounts Receivable Agent",
  description: "A purpose-bounded CALL-E phone agent that turns overdue invoice follow-ups into structured collections evidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
