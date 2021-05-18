import { keys } from 'lodash'

export interface GetAmountInterface<T = any> {
  (
    base: string,
    type: string,
    format: string,
    obj: Record<string, any>
  ): T extends number ? number : string
}

export default function getAmount<T = string>(args: {
  base: string
  type: string
  format: string
  obj: Record<string, any>
}): T extends number ? number : string {
  const { format, type, obj, base } = args
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
