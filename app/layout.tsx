import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rightfit-six.vercel.app"),
  title: {
    default: "Rightfit | $30 CV Rewrite That Gets You Interviews",
    template: "%s | Rightfit",
  },
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
    "resume review",
    "CV makeover",
    "job application help",
  ],
  authors: [{ name: "Rightfit" }],
  creator: "Rightfit",
  publisher: "Rightfit",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rightfit-six.vercel.app",
    siteName: "Rightfit",
    title: "Rightfit | $30 CV Rewrite That Gets You Interviews",
    description:
      "Your CV is costing you interviews. I rewrite your CV so your impact is obvious in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rightfit - $30 CV Rewrite Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rightfit | $30 CV Rewrite That Gets You Interviews",
    description:
      "Your CV is costing you interviews. I rewrite your CV so your impact is obvious in seconds.",
    images: ["/og-image.png"],
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
