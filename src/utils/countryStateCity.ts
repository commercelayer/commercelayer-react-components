import { Country, State } from 'country-state-city'

export function getCountries() {
  return Country.getAllCountries().map(({ name, isoCode }) => ({
    label: name,
    value: isoCode,
  }))
}

export function getStateOfCountry(countryCode: string) {
  return State.getStatesOfCountry(countryCode).map(
    ({ name, isoCode, countryCode }) => ({
      label: name,
      value: `${countryCode}-${isoCode}`,
    })
  )
}
