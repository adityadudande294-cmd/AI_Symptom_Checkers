import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TriageSafe AI - Clinical Symptom Checker & Triage Platform",
  description: "A medically governed, privacy-conscious clinical symptom checker with deterministic emergency red-flag escalation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
