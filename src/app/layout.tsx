import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

/* Midnight Atlas app shell: dark-first, conversation-led, with the landing experience as the primary route. */

export const metadata: Metadata = {
  title: "lingo. — Speak first. Understand more.",
  description: "Lingo — learn languages by actually speaking them.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#090b10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
        {analyticsEndpoint && analyticsWebsiteId ? (
          <script
            defer
            src={`${analyticsEndpoint}/umami`}
            data-website-id={analyticsWebsiteId}
          />
        ) : null}
      </body>
    </html>
  );
}
