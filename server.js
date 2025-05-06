// Import Sentry instrumentation first
require("./instrument");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { fileURLToPath } = require("url");
const { dirname } = require("path");
const Sentry = require("@sentry/node");

const app = express();

// ... existing code ...

// Add Sentry error handler before other error middleware
app.use(Sentry.Handlers.errorHandler());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// ... rest of existing code ...
