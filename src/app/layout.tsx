import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESP32 Marauder CLI",
  description: "Web Serial powered CLI interface for ESP32 Marauder with command guide, live terminal, and signal monitor.",
  applicationName: "ESP32 Marauder CLI",
  keywords: ["ESP32 Marauder", "Web Serial", "Next.js", "WiFi security", "CLI"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ESP32 Marauder CLI",
    description: "Web Serial powered CLI interface for ESP32 Marauder.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
