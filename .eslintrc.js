module.exports = {
  extends: ["next/core-web-vitals", "plugin:react-hooks/recommended"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-array-index-key": "warn",
    "react/jsx-no-useless-fragment": "warn",
    "@next/next/no-img-element": "error",
    "@next/next/no-html-link-for-pages": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
  },
};
