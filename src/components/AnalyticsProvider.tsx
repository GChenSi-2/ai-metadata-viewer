"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// One-time PostHog init (runs as the module loads on the client).
if (typeof window !== "undefined" && POSTHOG_KEY && POSTHOG_HOST) {
  // posthog-js exposes __loaded on the singleton once init() has run.
  const loaded = (posthog as unknown as { __loaded?: boolean }).__loaded;
  if (!loaded) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Privacy posture — must match the app's "100% client-side" claim:
      persistence: "memory",          // no cookies, no localStorage
      autocapture: false,             // don't blanket-capture clicks / inputs
      disable_session_recording: true,
      respect_dnt: true,
      capture_pageview: false,        // we capture pageviews manually below
      // Strip URL search params from auto-collected $current_url to avoid
      // accidentally recording sensitive query strings.
      sanitize_properties: (props) => {
        if (typeof props.$current_url === "string") {
          try {
            const u = new URL(props.$current_url);
            props.$current_url = u.origin + u.pathname;
          } catch { /* ignore */ }
        }
        return props;
      },
    });
  }
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;
    // Build a stable, search-param-free URL for the pageview event.
    const url = typeof window !== "undefined"
      ? window.location.origin + pathname
      : pathname;
    posthog.capture("$pageview", { $current_url: url });
    // We intentionally depend on searchParams so route changes that only
    // swap query strings still re-fire pageviews, but we drop the value
    // from the URL we record.
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
