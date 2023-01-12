export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${Lowercase<T>}${Capitalize<SnakeToCamelCase<U>>}`
    : S

export type SnakeToCamelCaseNested<T> = T extends object
  ? {
      [K in keyof T as SnakeToCamelCase<K & string>]: SnakeToCamelCaseNested<
        T[K]
      >
    }
  : T

export function snakeToCamelCase<S extends string>(
  value: S
): SnakeToCamelCase<S> {
  const words = value.toLowerCase().split('_')
  const first = words[0] ?? ''
  const firstLetter = words[1]?.[0]?.toUpperCase() ?? ''
  const second = words[1]?.substring(1) ?? ''
  return `${first}${firstLetter}${second}` as SnakeToCamelCase<S>
}
