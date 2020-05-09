module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    extends: [
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        "plugin:react/recommended",
    ],
    plugins: ["eslint-plugin-import"],
    rules: {
        "@typescript-eslint/explicit-function-return-type": 0,
        "react/prop-types": 0,
        "import/order": [
            "error",
            {
                pathGroups: [
                    {
                        pattern: "~/**",
                        group: "external",
                    },
                ],
            },
        ],
        "@typescript-eslint/camelcase": 0,
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
