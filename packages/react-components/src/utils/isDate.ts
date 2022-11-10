export default function isDate(value: string): boolean {
  return !isNaN(Date.parse(value))
}
