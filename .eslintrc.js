module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: ["*.d.ts"],
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
};
