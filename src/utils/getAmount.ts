import _ from 'lodash'

export interface GetAmountInterface {
  (base: string, type: string, format: string, obj: object): string | number
}

const getAmount: GetAmountInterface = (base, type, format, obj) => {
  let v = ''
  _.keys(obj).map(k => {
    if (k.toLowerCase() === `${format}${type}${base}`.toLowerCase()) {
      v = obj[k]
    }
    if (k.toLowerCase() === `${type}${base}${format}`.toLowerCase()) {
      v = obj[k]
    }
  })
  return v
}

export default getAmount
