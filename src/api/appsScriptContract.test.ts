import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'apps-script/Code.gs'), 'utf8');

test('Apps Script exposes offers only through secret-gated POST', () => {
  expect(source).toContain("getProperty('MONSTAGE_GATEWAY_SECRET')");
  expect(source).toMatch(/function doPost\(e\)/);
  expect(source).toMatch(/function doGet\(\)/);
  expect(source).not.toContain('isSafeJsonpCallback_');
  expect(source).not.toContain('MimeType.JAVASCRIPT');
});
