/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/strict-type-checked',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint'
  ],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '.eslintrc.cjs',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    "import/extensions": [
        "error",
        "ignorePackages"
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": true
      }
    ],
    "import/prefer-default-export": "off",
    "max-len": [
      "error",
      {
        "code": 120,
        "ignoreComments": true,
      }
    ],
    'no-console': 'off',
    // Allow for-of loops
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement"
    ],
  }
}
