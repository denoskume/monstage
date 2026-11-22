import { describe, expect, it } from 'vitest';
import { parsePublishedDate, relativePublishedDate } from './OfferCard';

describe('official offer publication metadata', () => {
  it('reads exact French dates even when a source note follows', () => {
    const parsed = parsePublishedDate('26/09/2026 — carrière officielle Sagemcom');
    expect(parsed?.exact).toBe(true);
    expect(parsed?.dateLabel).toContain('2026');
    expect(parsed?.date?.getDate()).toBe(26);
    expect(parsed?.date?.getMonth()).toBe(8);
  });

  it('reads AMETEK ISO posting dates without changing the calendar day', () => {
    const parsed = parsePublishedDate('2026-10-11');
    expect(parsed?.exact).toBe(true);
    expect(parsed?.date?.getDate()).toBe(11);
    expect(parsed?.hasTime).toBe(false);
  });

  it('does not invent dates for year-only or month-only metadata', () => {
    const year = parsePublishedDate('2026 — carrière officielle');
    const month = parsePublishedDate('09/2026');
    expect(year?.exact).toBe(false);
    expect(month?.exact).toBe(false);
    expect(relativePublishedDate(year)).toContain('2026');
    expect(relativePublishedDate(month)).toContain('septembre 2026');
  });

  it('distinguishes unknown publication from an authoritative timestamp', () => {
    expect(relativePublishedDate(parsePublishedDate(null))).toBe('Date non communiquée');
    const iso = parsePublishedDate('2026-10-11T09:30:00Z');
    expect(iso?.hasTime).toBe(true);
  });

  it('rejects impossible dates and invalid non-source metadata', () => {
    expect(parsePublishedDate('2026-02-30')).toBe(null);
    expect(parsePublishedDate('Verified <24h')).toBe(null);
    expect(parsePublishedDate('2026-10-11 — source verified 2026-10-13')?.date?.getDate()).toBe(11);
  });
});
