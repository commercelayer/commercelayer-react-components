import { getStateOfCountry } from './countryStateCity'

export default function isEmptyStates(countryCode: string): boolean {
  return getStateOfCountry(countryCode).length === 0
}
