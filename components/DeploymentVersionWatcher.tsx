"use client";

import { useEffect, useRef } from "react";

const CURRENT_BUILD_ID = process.env.NEXT_PUBLIC_APP_BUILD_ID || "dev";
const CHECK_INTERVAL_MS = 60_000;

type VersionResponse = {
  buildId?: string;
};

export default function DeploymentVersionWatcher() {
  const isReloadingRef = useRef(false);

  useEffect(() => {
    //========================= API CALLS ==========================//
    //==============================================================//
    async function checkVersion() {
      if (isReloadingRef.current) return;

      try {
        const response = await fetch("/api/version", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) return;

        const data = (await response.json()) as VersionResponse;
        const latestBuildId = data.buildId;

        if (latestBuildId && latestBuildId !== CURRENT_BUILD_ID) {
          isReloadingRef.current = true;
          window.location.reload();
        }
      } catch {
        // Ignore transient network failures.
      }
    }

    void checkVersion();

    const intervalId = window.setInterval(() => {
      void checkVersion();
    }, CHECK_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkVersion();
      }
    }

    window.addEventListener("focus", checkVersion);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkVersion);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
