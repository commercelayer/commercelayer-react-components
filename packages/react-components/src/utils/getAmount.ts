import keys from 'lodash/keys'

export type GetAmountInterface<T = any> = (
  base: string,
  type: string,
  format: string,
  obj: Record<string, any>
) => T extends number ? number : string

export default function getAmount<T = string>(args: {
  base: string
  type: string
  format: string
  obj: Record<string, any>
}): T extends number ? number : string {
  const { format, type, obj, base } = args
  let v: any
  keys(obj).forEach((k: string) => {
    const key = k.toLowerCase()
    const typeOne = `${format}_${type}_${base}`.toLowerCase()
    const typeTwo = `${type}_${base}_${format}`.toLowerCase()
    const typeThree = `${format}_${base}_${type}`.toLowerCase()
    const typeFourth = `${base}_${type}_${format}`.toLowerCase()
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
