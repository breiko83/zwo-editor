export function floor(x: number, roundTo: number): number {
  return Math.floor(x / roundTo) * roundTo;
}
