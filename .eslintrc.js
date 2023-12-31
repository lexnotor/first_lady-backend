module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint/eslint-plugin", "prettier"],
    extends: ["plugin:@typescript-eslint/recommended", "prettier"],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: [".eslintrc.js"],
    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        quotes: ["warn", "double"],
        "jsx-quotes": ["warn", "prefer-double"],
        semi: ["warn", "always"],
        "react/prop-types": "off",
        "react/no-unescaped-entities": "off",
        "prettier/prettier": "warn",
        "no-console": "error",
        "prettier/prettier": "warn",
    },
};
