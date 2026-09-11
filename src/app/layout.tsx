import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "PermitPulse — CALL-E Permit Status Agent", description: "A purpose-bounded CALL-E phone agent that turns permit-office calls into structured project next steps." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
