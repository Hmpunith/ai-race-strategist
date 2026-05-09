import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Race Strategist | IBM Granite Powered F1 Strategy",
  description: "An AI-powered Formula 1 strategy assistant that analyzes race telemetry and provides intelligent race strategy recommendations using IBM Granite.",
  keywords: ["F1", "Formula 1", "AI", "Race Strategy", "IBM Granite", "Telemetry"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
