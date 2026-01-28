import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rightfit | $30 CV Rewrite That Gets You Interviews",
  description:
    "Your CV is costing you interviews. I rewrite your CV so your impact is obvious in seconds. $30, ready to send in 48-96 hours.",
  keywords: [
    "CV rewrite",
    "resume writing",
    "job search",
    "career help",
    "CV review",
    "professional CV",
    "ATS friendly CV",
  ],
  authors: [{ name: "Rightfit" }],
  openGraph: {
    title: "Rightfit | $30 CV Rewrite That Gets You Interviews",
    description:
      "Your CV is costing you interviews. I rewrite your CV so your impact is obvious in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rightfit | $30 CV Rewrite That Gets You Interviews",
    description:
      "Your CV is costing you interviews. I rewrite your CV so your impact is obvious in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
