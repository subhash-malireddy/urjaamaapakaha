import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/custom/nav/main-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "../auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Urjaamaapakaha",
  description:
    "An app by Subhash Malireddy to track energy consumption in a shared home",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} mr-3.5 ml-3.5 grid min-h-[100svh] grid-cols-1 grid-rows-[auto_1fr] antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainNav session={session} />
          <main className="flex justify-center p-4 sm:p-2">{children}</main>
          {/* Add padding at the bottom for the mobile nav */}
          <div className="h-14 md:h-0"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
