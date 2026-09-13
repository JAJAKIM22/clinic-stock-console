import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Catch unused vars/imports, but allow a leading underscore for
      // intentionally-unused function args (common in event handlers).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      // `any` is disallowed by default via nextTs; kept as an error here
      // deliberately rather than downgraded — this project talks to an
      // external API and untyped `any` responses are exactly where bugs
      // hide. Type DummyJSON responses explicitly instead of reaching
      // for `any`.
      "@typescript-eslint/no-explicit-any": "error",
      // Allow console.warn/console.error (useful for surfacing fetch
      // failures during development) but flag stray console.log so
      // debug logging doesn't get committed.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
