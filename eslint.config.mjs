import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    rules: {
      "semi": ["error", "always"],
      "indent": ["warn", 4, { "SwitchCase": 1 }],
      "prefer-const": ["warn"],
      "no-undef": ["off"],
      "key-spacing": ["warn", { "mode": "minimum", "beforeColon": false}],
      "curly": ["warn", "multi"]
    },
  }
];