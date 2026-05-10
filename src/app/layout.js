import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-orbitron",
});

export const metadata = {
  title: "Oven Timer",
  description: "Production Timer",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
      className={orbitron.variable}
    >
      <body>{children}</body>
    </html>
  );
}