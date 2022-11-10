const countryLock = ['IT', 'US']

export default function isEmptyStates(countryCode: string): boolean {
  return !countryLock.includes(countryCode)
}
