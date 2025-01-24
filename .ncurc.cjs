module.exports = {
  reject: [
    'pnpm',
    'iframe-resizer'
  ],
  filterResults: (name, { upgradedVersionSemver }) => {
    if (
      name === '@types/node' && parseInt(upgradedVersionSemver?.major) >= 22 ||
      name === 'eslint' && parseInt(upgradedVersionSemver?.major) >= 9 ||
      name === 'rapid-form' && parseInt(upgradedVersionSemver?.major) >= 3
    ) {
      return false
    }

    return true
  }
}