// eslint-disable-next-line no-undef
module.exports = async () => {
  return {
    testEnvironment: 'jsdom',
    setupFiles: ['dotenv/config'],
    verbose: true,
    testMatch: ['**/specs/**/*.spec.[jt]s?(x)'],
  }
}
