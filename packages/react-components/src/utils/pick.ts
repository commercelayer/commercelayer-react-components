export function pick<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const result: T = {} as T
  for (const key of keys) {
    result[key] = object[key]
  }
  return result
}
