// import { getStateOfCountry } from './countryStateCity'

const countryLock = ['IT', 'US', 'GB']

export default function isEmptyStates(countryCode: string): boolean {
  return !countryLock.includes(countryCode)
  // return getStateOfCountry(countryCode).length === 0
}
