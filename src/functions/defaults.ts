export function defaultBoolean(value: any, defaultValue: boolean): boolean {
  if (typeof value == "boolean") return !!value;
  return defaultValue;
}

export function rangeNumber(
  value: any,
  min: number,
  max: number,
  defaultValue: number,
): number {
  if (typeof value == "number" || !isNaN(value)) {
    value = Number(value);
    if (value >= min && value <= max) return value;
  }
  return defaultValue;
}

export function defaultString(value: any, defaultValue: string): string {
  if (typeof value == "string") return value;
  return defaultValue;
}
