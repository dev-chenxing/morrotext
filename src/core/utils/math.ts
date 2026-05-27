export function roundToTenth(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}
