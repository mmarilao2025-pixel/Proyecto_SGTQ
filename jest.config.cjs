/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  roots: ["<rootDir>/backend/tests"],

  testMatch: [
    "**/*.test.js",
    "**/*.test.ts",
    "**/*Test.js",
    "**/*Tests.js",
    "**/*Test.ts",
    "**/*Tests.ts"
  ],

  moduleFileExtensions: ["js", "ts", "json"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json"
      }
    ]
  },

  collectCoverage: true,

  collectCoverageFrom: [
    "backend/**/*.js",
    "backend/**/*.ts",
    "shared/**/*.js",
    "!backend/tests/**",
    "!backend/server.js"
  ],

  coverageDirectory: "coverage",

  // lcov.info es lo que SonarQube lee
  coverageReporters: ["text", "lcov", "clover"],

  // En CI se excluyen los tests que requieren BD real
  testPathIgnorePatterns: process.env.CI
    ? ["<rootDir>/backend/tests/TransactionTests.js"]
    : []
};
