/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  testMatch: [
    "<rootDir>/backend/tests/**/*.test.js",
    "<rootDir>/backend/tests/**/*.test.ts",
    "<rootDir>/backend/tests/**/*Test.js",
    "<rootDir>/backend/tests/**/*Tests.js",
    "<rootDir>/backend/tests/**/*Test.ts",
    "<rootDir>/backend/tests/**/*Tests.ts"
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
    "!backend/comportamiento_observador.demo.js"
  ],

  coverageDirectory: "coverage",

  // lcov.info es lo que SonarQube lee
  coverageReporters: ["text", "lcov", "clover"],

  // En CI se excluyen los tests que requieren BD real
  testPathIgnorePatterns: process.env.CI
    ? ["<rootDir>/backend/tests/TransactionTests.js"]
    : []
};
