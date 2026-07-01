import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [

  {
    ignores: [
    "node_modules/**",
    "frontend/dist/**",
    "coverage/**",
    "docs/**",
    "backend/tests/SingletonTest.ts"
    ]
  },

  // Backend JavaScript
  {
    files: ["backend/**/*.js", "shared/**/*.js"],

    languageOptions: {
      globals: {
        ...globals.node
      }
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-prototype-builtins": "warn"
    }
  },

  // Frontend TypeScript
  ...tseslint.config({
    files: ["frontend/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }),
    // Tests JavaScript
  {
    files: ["backend/tests/**/*.js"],
    languageOptions: {
        globals: {
        ...globals.node,
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly"
        }
    }
    },

    // Tests TypeScript
    ...tseslint.config({
    files: ["backend/tests/**/*.ts"],
    languageOptions: {
        globals: {
        ...globals.node,
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly"
        }
    }
    })
];