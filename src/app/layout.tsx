import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@arcgis/core/assets/esri/themes/light/main.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parking Zones Map",
  description: "A Interactive Map of Parking Lot Zones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
