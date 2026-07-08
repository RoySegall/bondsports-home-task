// Join truthy class-name values into one space-separated string.
export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
