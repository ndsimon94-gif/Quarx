const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function excerpt(paragraphs: string[], words = 42) {
  const all = paragraphs.join(' ').split(/\s+/);
  return all.slice(0, words).join(' ') + (all.length > words ? '…' : '');
}

export function readingMinutes(paragraphs: string[]) {
  const n = paragraphs.join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(n / 220));
}

export function countdown(ms: number) {
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m left`;
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
