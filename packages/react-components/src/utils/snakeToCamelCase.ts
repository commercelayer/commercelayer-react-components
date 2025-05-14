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

/**
 *
 * @param value - The string to convert from snake_case to camelCase
 * @example
 * snakeToCamelCase("hello_world") // "helloWorld"
 * snakeToCamelCase("hello_world_test") // "helloWorldTest"
 * @returns string
 * @description Converts a string from snake_case to camelCase
 */
export function snakeToCamelCase<S extends string>(
  value: S,
): SnakeToCamelCase<S> {
  const words = value.toLowerCase().split("_")
  const first = words[0] ?? ""
  const secondLetter = words[1]?.[0]?.toUpperCase() ?? ""
  const second = words[1]?.substring(1) ?? ""
  const thirdLetter = words[2]?.[0]?.toUpperCase() ?? ""
  const third = words[2]?.substring(1) ?? ""
  return `${first}${secondLetter}${second}${thirdLetter}${third}` as SnakeToCamelCase<S>
}
