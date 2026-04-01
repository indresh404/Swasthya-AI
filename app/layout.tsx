import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swasthya AI | Patient Health Portal",
  description: "AI-driven personalized healthcare dashboard for interactive body analysis and medicine tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
