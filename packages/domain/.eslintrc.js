module.exports = {
  root: true,
  extends: ["@mrerr/eslint-config/base"],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: true,
    },
  },
  ignorePatterns: ["dist", ".eslintrc.js"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "import/namespace": "off",
    "import/order": "off",
    "import/no-duplicates": "off",
    "import/export": "off",
    "import/no-unresolved": "off",
  },
};
