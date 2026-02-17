const OFF = 0;
const WARNING = 1;
const ERROR = 2;

const a11yWarn = Object.keys(require("eslint-plugin-jsx-a11y").rules).reduce(
  (acc, rule) => {
    acc[`jsx-a11y/${rule}`] = WARNING;
    return acc;
  },
  {}
);

module.exports = {
  // Stop ESLint from looking for a configuration file in parent folders
  root: true,

  extends: [
    "next",
    "eslint:recommended",
    "airbnb",
    "plugin:prettier/recommended",
    "prettier",
  ],
  rules: {
    // JavaScript rules
    eqeqeq: OFF,
    radix: OFF,
    "no-underscore-dangle": OFF,
    "no-var": WARNING,
    "no-unused-vars": ERROR,
    "object-shorthand": WARNING,
    "dot-notation": WARNING,
    "no-else-return": WARNING,
    "import/prefer-default-export": OFF,
    "no-use-before-define": OFF,
    "prefer-regex-literals": OFF,
    "import/no-mutable-exports": "off",
    "prefer-const": WARNING,
    "no-cond-assign": "off",
    "no-console": ERROR,
    "prefer-template": WARNING,
    "no-extra-boolean-cast": WARNING,
    camelcase: "off",
    "no-nested-ternary": WARNING,
    "spaced-comment": WARNING,
    "no-lonely-if": WARNING,

    // React rules
    "react/prop-types": OFF,
    "react/react-in-jsx-scope": OFF,
    "react/function-component-definition": OFF,
    "react/jsx-fragments": [WARNING, "syntax"], // Shorthand syntax for React fragments
    "react/jsx-filename-extension": [WARNING, { extensions: [".js", ".jsx"] }],
    "prettier/prettier": WARNING,
    "react-hooks/rules-of-hooks": ERROR, // Checks rules of Hooks
    ...a11yWarn,
    "jsx-a11y/media-has-caption": "off",
    "@next/next/no-img-element": "off",
    "no-unneeded-ternary": "off",
    "jsx-a11y/click-events-have-key-event": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "no-param-reassign": "off",
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [["@", "./"]],
        extensions: [".js", ".jsx", ".json"],
      },
    },
    react: {
      version: "detect",
    },
  },
};
