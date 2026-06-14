import type { Metadata } from "next";
import { AppChrome } from "./components/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SermonBridge",
    template: "%s | SermonBridge",
  },
  description:
    "Live sermon translation widgets for churches, websites, WordPress, YouTube Live, and mobile apps.",
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

