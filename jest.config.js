const tsconfig = require('./tsconfig.json')
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig)

module.exports = {
  // collectCoverageFrom: [
  //   '**/*.{js,jsx,ts,tsx}',
  //   '!**/*.d.ts',
  //   '!**/node_modules/**'
  // ],
  testMatch: ['**/specs/**/*.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper,
}
