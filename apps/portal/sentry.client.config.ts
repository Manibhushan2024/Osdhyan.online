// Sentry — Browser / Client-side configuration
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production to control how many transactions are sampled
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Replay — only capture 5% of sessions in prod, 100% with errors
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media by default (privacy-first)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ignore noisy browser errors that aren't actionable
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    /^Network Error$/,
    /^Request aborted$/,
    /^ChunkLoadError/,
    /^Loading chunk \d+ failed/,
    // Firebase / Agora SDK noise
    "FirebaseError",
  ],

  environment: process.env.NODE_ENV,

  // Only send errors in production; log them locally in dev
  enabled: process.env.NODE_ENV === "production",
});
