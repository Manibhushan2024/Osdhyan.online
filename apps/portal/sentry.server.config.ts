// Sentry — Server / Node.js configuration
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Do not send PII from the server
  sendDefaultPii: false,

  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
