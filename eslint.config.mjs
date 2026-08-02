import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // *.cjs build helpers are legitimately CommonJS, so the TypeScript
    // import rules don't apply to them.
    ignores: [".next/**", "node_modules/**", "figma/**", "out/**", "next-env.d.ts", "**/*.cjs"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
