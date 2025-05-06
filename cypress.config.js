import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "tests/e2e/support/e2e.js",
    specPattern: "tests/e2e/**/*.cy.js",
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      installLogsPrinter(on);
      // implement node event listeners here
    },
  },
});
