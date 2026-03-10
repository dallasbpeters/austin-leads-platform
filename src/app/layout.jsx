import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";

export const metadata = {
  title: "Austin Leads Platform",
  description: "Multi-tenant Next.js platform for Austin and Texas local service domains.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
