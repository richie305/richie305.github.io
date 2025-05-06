const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://381085484692b9faf33c0da9f1aaa8e8@o4509276967337984.ingest.us.sentry.io/4509277045325824",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // Enable performance monitoring
  tracesSampleRate: 1.0,
  // Set environment
  environment: process.env.NODE_ENV || "development",
  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});

module.exports = Sentry;
