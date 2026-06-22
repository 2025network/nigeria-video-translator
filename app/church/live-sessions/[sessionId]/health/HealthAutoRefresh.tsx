"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function HealthAutoRefresh() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, 5000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-50/58" aria-live="polite">
      <RefreshCw className="h-3.5 w-3.5" />
      Auto-refreshing every 5 seconds
      {lastRefresh ? ` · Checked ${lastRefresh.toLocaleTimeString()}` : ""}
    </div>
  );
}
