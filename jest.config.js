export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: ["app.js", "!**/node_modules/**", "!**/vendor/**"],
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/tests/**/*.test.js"],
  transformIgnorePatterns: ["/node_modules/(?!(identity-obj-proxy)/)"],
};
