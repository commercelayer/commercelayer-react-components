export default function isDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value))
}
