import { Country, State } from 'country-state-city'
import isNumber from 'lodash/isNumber'

export function getCountries() {
  return Country.getAllCountries().map(({ name, isoCode }) => ({
    label: name,
    value: isoCode,
  }))
}

export function getStateOfCountry(countryCode: string) {
  return State.getStatesOfCountry(countryCode)
    .filter(
      ({ isoCode }) => isNaN(isoCode as any) && isoCode.search('-') === -1
    )
    .map(({ name, isoCode }) => ({
      label: name,
      value: isoCode,
    }))
}

export function isValidState(stateCode: string, countryCode: string): boolean {
  return State.getStateByCodeAndCountry(stateCode, countryCode) !== undefined
}
