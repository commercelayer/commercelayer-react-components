import { Countries, States } from 'countries-states-cities-service'

export function getCountries() {
  return Countries.getCountries({
    sort: {
      mode: 'alphabetical',
      key: 'name',
    },
  }).map(({ name, iso2 }) => ({
    label: name,
    value: iso2,
  }))
}

export function getStateOfCountry(country_code: string) {
  const filters: { country_code: string; is_region?: boolean } = {
    country_code,
  }
  if (country_code === 'IT') filters.is_region = false
  return States.getStates({
    filters,
    sort: { mode: 'alphabetical', key: 'name' },
  }).map(({ name, state_code }) => ({
    label: name.replace('Province of', ''),
    value: state_code,
  }))
}

export function isValidState(
  state_code: string,
  country_code: string
): boolean {
  return States.getStates({ filters: { state_code, country_code } }).length > 0
}
