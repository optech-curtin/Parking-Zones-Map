import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@arcgis/core/assets/esri/themes/light/main.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Campus Planning - Parking",
  description: "A Parking Lot Playground for Campus Planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
