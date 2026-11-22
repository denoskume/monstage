// Shared ATS-safe text normalization across both PDF renderers.
export function normalizeCvPdfText(value: string): string {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '•')
    .replace(/\u00B7/g, '•')
    .replace(/\u00B2/g, '2')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF\u0152\u0153\u2022\u20AC\u2022]/g, '');
}

