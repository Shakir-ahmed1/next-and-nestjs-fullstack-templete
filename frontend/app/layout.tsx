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

export const metadata: Metadata = {
  title: companyInfo.name,
  description: companyInfo.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      {/* <body
        className={`${geistSans.className} antialiased`}
      > */}
      <body
        // className={`antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

