// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@commercelayer/eslint-config-ts-react',
    'plugin:storybook/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json'),
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  }
}
