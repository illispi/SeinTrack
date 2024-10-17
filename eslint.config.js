import js from "@eslint/js";
import ts from "typescript-eslint";
import tailwind from "eslint-plugin-tailwindcss";

export default [
  // add eslint built-in
  js.configs.recommended,
  // add `typescript-eslint` flat config simply
  // if you would like use more another configuration,
  // see the section: https://typescript-eslint.io/getting-started#details
  ...ts.configs.recommended,
  ...tailwind.configs["flat/recommended"],
];