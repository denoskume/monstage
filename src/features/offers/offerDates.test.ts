import { describe, expect, it } from 'vitest';
import { formatOfferTrackingDate, trackedTimestamp } from './offerDates';

describe('MonStage tracking dates', () => {
  it('formats true insertion dates in French without reusing the employer publication date', () => {
    expect(formatOfferTrackingDate('2026-11-16')).toContain('16 nov.');
    expect(formatOfferTrackingDate('16/11/2026')).toContain('16 nov.');
  });
  it('formats original ISO modification timestamps in Europe/Paris', () => {
    expect(formatOfferTrackingDate('2026-11-16T11:30:00Z')).toContain('16 nov.');
  });
  it('does not invent dates for historical offers or malformed inputs', () => {
    expect(formatOfferTrackingDate(null)).toBeNull();
    expect(formatOfferTrackingDate('2026-02-30')).toBeNull();
    expect(formatOfferTrackingDate('Historique — ajout antérieur')).toBeNull();
    expect(trackedTimestamp(null)).toBe(0);
  });
});
