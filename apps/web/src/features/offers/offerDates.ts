/** Distinct metadata: employer publication, first MonStage insertion and last
 * material change. A verification is NOT an insertion or a change.
 */
export function formatOfferTrackingDate(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const text = value.trim();
  const isoDay = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const frenchDay = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  let instant: Date;
  if (isoDay || frenchDay) {
    const year = Number(isoDay ? isoDay[1] : frenchDay![3]);
    const month = Number(isoDay ? isoDay[2] : frenchDay![2]);
    const day = Number(isoDay ? isoDay[3] : frenchDay![1]);
    instant = new Date(Date.UTC(year, month - 1, day, 12));
    if (instant.getUTCFullYear() !== year || instant.getUTCMonth() !== month - 1 || instant.getUTCDate() !== day) return null;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) {
    instant = new Date(text);
    if (!Number.isFinite(instant.getTime())) return null;
  } else return null;
  return instant.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });
}

export function trackedTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return Date.parse(value + 'T12:00:00Z') || 0;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) return Date.UTC(Number(match[3]), Number(match[2])-1, Number(match[1]), 12);
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
