import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, ...compat.config({
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    
    // NO explicit any IS ONLY FOR DEMO PURPOSES
    '@typescript-eslint/no-explicit-any': 'off',
  }
}), {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];

export default eslintConfig;
