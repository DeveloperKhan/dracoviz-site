export default function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const z = Math.floor(Math.random() * (i + 1));
    [a[i], a[z]] = [a[z], a[i]];
  }
  return a;
}
