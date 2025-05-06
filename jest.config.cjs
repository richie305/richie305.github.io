module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/tests/setup/supabase-mock.js",
  ],
};
