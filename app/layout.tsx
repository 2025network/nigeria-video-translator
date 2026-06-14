import type { Metadata } from "next";
import { AppChrome } from "./components/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nigeria Video Translator",
    template: "%s | Nigeria Video Translator",
  },
  description:
    "A free public platform that helps people understand video content in Nigerian languages.",
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
