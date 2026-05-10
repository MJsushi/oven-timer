import {
  Geist,
  Geist_Mono,
  DotGothic16,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dotFont = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dot",
});

export const metadata = {
  title: "Oven Timer",

  description: "Production Timer",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,

    statusBarStyle:
      "black-translucent",

    title: "Oven Timer",
  },

  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${dotFont.variable}
        h-full
        antialiased
      `}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}