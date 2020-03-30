import _ from 'lodash'

export interface GetAmountInterface {
  (base: string, type: string, format: string, obj: object): string
}

const getAmount: GetAmountInterface = (base, type, format, obj) => {
  let v = ''
  _.keys(obj).map(k => {
    const key = k.toLowerCase()
    const typeOne = `${format}${type}${base}`.toLowerCase()
    const typeTwo = `${type}${base}${format}`.toLowerCase()
    const typeThree = `${format}${base}${type}`.toLowerCase()
    if (key === typeOne) {
      v = obj[k]
    }
    if (key === typeTwo) {
      v = obj[k]
    }
    if (key === typeThree) {
      v = obj[k]
    }
  })
  return v
}

export default getAmount
