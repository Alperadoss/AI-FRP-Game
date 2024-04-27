import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "@next/font/local";

const zeldaFont = localFont({
  src: [
    {
      path: "../../public/fonts/zeldaFont.ttf",
      weight: "400",
    },
  ],
  variable: "--font-zelda",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Realm Refiner",
  description: "AI FRP Game",
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "./favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${zeldaFont.variable} font-sans`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
