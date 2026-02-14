import type { Metadata } from "next";
// import { Geist } from "next/font/google";
import "./globals.css";
import Providers from './providers';
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { companyInfo } from "@/config";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });


export const dynamic = 'force-dynamic';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: companyInfo.name,
  description: companyInfo.description,
  icons: {
    icon: '/native-logo-2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

