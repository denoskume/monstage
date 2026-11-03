import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { it, expect } from 'vitest';
import { TARGET_COMPANIES, targetCompany, isVisionMission } from '../../../shared/searchScope';
it('keeps Apps Script collection aligned with the exclusive application scope', () => {
  const source = readFileSync(resolve(process.cwd(), 'apps-script/Code.gs'), 'utf8');
  const helper = source.slice(source.indexOf('var TARGET_COMPANY_GROUPS_'), source.indexOf('function targetSignalScore_'));
  const context = runInNewContext(helper + ';({groups:TARGET_COMPANY_GROUPS_, company:strictCompany_, vision:strictVision_})');
  expect(JSON.parse(JSON.stringify(context.groups))).toEqual(TARGET_COMPANIES);
  for (const company of ['Safran.AI','Boschman','SNCF Voyageurs','Siemens','Siemens Healthineers','Google']) expect(context.company(company)).toBe(targetCompany(company) !== null);
  for (const title of ['Computer Vision','Stage traitement d’images','Stage RAG','Data Analyst','Marketing imagerie','Imagerie médicale']) expect(context.vision(title,'')).toBe(isVisionMission({title}));
});
