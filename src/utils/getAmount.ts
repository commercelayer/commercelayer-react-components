import { keys } from 'lodash'

export interface GetAmountInterface {
  (base: string, type: string, format: string, obj: Record<string, any>):
    | string
    | number
}

const getAmount: GetAmountInterface = (base, type, format, obj) => {
  let v: any
  keys(obj).map((k) => {
    const key = k.toLowerCase()
    const typeOne = `${format}${type}${base}`.toLowerCase()
    const typeTwo = `${type}${base}${format}`.toLowerCase()
    const typeThree = `${format}${base}${type}`.toLowerCase()
    const typeFourth = `${base}${type}${format}`.toLowerCase()
    if (key === typeOne) {
      v = obj[k]
    }
    if (key === typeTwo) {
      v = obj[k]
    }
    if (key === typeThree) {
      v = obj[k]
    }
    if (key === typeFourth) {
      v = obj[k]
    }
  })
  return v
}

export default getAmount
