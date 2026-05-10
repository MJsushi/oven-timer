import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap", // ✅ safari เก่ากว่า support ดีกว่า
  fallback: [
    "Arial",
    "Helvetica",
    "sans-serif",
  ],
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

  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}) {
  return (
    <html
      lang="th"
      className={orbitron.variable}
    >
      <body
        style={{
          margin: 0,
          background: "#050505",
          color: "white",
          fontFamily:
            "var(--font-orbitron), Arial, sans-serif",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        {children}
      </body>
    </html>
  );
}