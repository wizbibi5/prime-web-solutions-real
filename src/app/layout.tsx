import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/lib/auth";
import { LayoutProtection } from "@/components/layout-protection";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Prime Web Solutions - Professional Websites for Local Businesses",
  description: "We help restaurants, cafés, and local businesses grow online with stunning, mobile-friendly websites that turn visitors into customers. Get your free consultation today.",
  keywords: ["web design", "restaurant websites", "local business", "web development", "online presence"],
  authors: [{ name: "Prime Web Solutions" }],
  openGraph: {
    title: "Prime Web Solutions - Professional Websites for Local Businesses",
    description: "We help restaurants, cafés, and local businesses grow online with stunning, mobile-friendly websites.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <LanguageProvider>
                  <LayoutProtection>
                    {children}
                  </LayoutProtection>
                </LanguageProvider>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
