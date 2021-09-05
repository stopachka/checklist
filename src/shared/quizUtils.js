export function calcScore(allQs) {
  return allQs
    .map((q) => q.a)
    .filter((x) => x)
    .map((a) => a[0])
    .reduce((a, b) => a + b, 0);
}
