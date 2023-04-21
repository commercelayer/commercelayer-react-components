export function isEmpty<V>(value: V): boolean {
  if (value == null) return true
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'string') {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  throw new Error('Invalid value for isEmpty function')
}
