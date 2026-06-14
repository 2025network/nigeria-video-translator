import type { Metadata } from "next";
import { AppChrome } from "./components/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SermonBridge",
    template: "%s | SermonBridge",
  },
  description:
    "Live sermon translation for every nation, language, and church.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}

