"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { BackButton } from "./BackButton";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmbedRoute = pathname.startsWith("/embed/");

  if (isEmbedRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {pathname !== "/" ? (
        <div className="section-shell py-3">
          <BackButton href="/" />
        </div>
      ) : null}
      {children}
      <Footer />
    </>
  );
}

