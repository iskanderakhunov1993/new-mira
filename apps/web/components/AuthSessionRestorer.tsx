"use client";

import { useEffect } from "react";
import { shouldRefreshSession } from "@/lib/domain/session-lifetime";
import { createClient } from "@/lib/supabase/client";

export function AuthSessionRestorer() {
  useEffect(() => {
    const supabase = createClient();
    let restoring = false;

    const restore = async () => {
      if (restoring) return;
      restoring = true;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session && shouldRefreshSession(data.session.expires_at)) {
          await supabase.auth.refreshSession();
        }
      } finally {
        restoring = false;
      }
    };

    const restoreWhenVisible = () => {
      if (document.visibilityState === "visible") void restore();
    };

    void restore();
    window.addEventListener("pageshow", restore);
    window.addEventListener("focus", restore);
    document.addEventListener("visibilitychange", restoreWhenVisible);

    return () => {
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("focus", restore);
      document.removeEventListener("visibilitychange", restoreWhenVisible);
    };
  }, []);

  return null;
}
