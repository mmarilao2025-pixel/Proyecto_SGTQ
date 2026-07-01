/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  testMatch: [
    "<rootDir>/backend/**/*.test.js",
    "<rootDir>/backend/**/*.test.ts",
    "<rootDir>/backend/**/*Test.js",
    "<rootDir>/backend/**/*Tests.js",
    "<rootDir>/backend/**/*Test.ts",
    "<rootDir>/backend/**/*Tests.ts"
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
    "!backend/server.js",
    "!backend/comportamiento_observador.demo.js",
    "!backend/**/*.test.js",
    "!backend/**/*.test.ts",
    "!backend/**/*Test.js",
    "!backend/**/*Tests.js",
    "!backend/**/*Test.ts",
    "!backend/**/*Tests.ts"
  ],

  coverageDirectory: "coverage",

  // lcov.info es lo que SonarQube lee
  coverageReporters: ["text", "lcov", "clover"],

  // En CI se excluyen los tests que requieren BD real
  testPathIgnorePatterns: process.env.CI
    ? ["<rootDir>/backend/tests/TransactionTests.js"]
    : []
};
