import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppProvider from "@/components/AppProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "PrayCircle — United in prayer",
  description:
    "Share prayer intentions and pray for one another. A Catholic prayer community uniting the world in prayer.",
  applicationName: "PrayCircle",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PrayCircle",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1322",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Header />
          <main className="shell">
            {children}
            <Footer />
          </main>
          <BottomNav />
          <CookieBanner />
        </AppProvider>
      </body>
    </html>
  );
}
