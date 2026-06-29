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
    "!backend/tests/**"
  ],

  coverageDirectory: "coverage",

  coverageReporters: [
    "text",
    "lcov"
  ]
};