import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { it, expect } from 'vitest';
import { TARGET_COMPANIES, BACKUP_COMPANIES, targetCompany, isVisionMission, isTargetOffer } from '../../../shared/searchScope';
it('keeps Apps Script collection aligned with the exclusive application scope', () => {
  const source = readFileSync(resolve(process.cwd(), 'apps-script/Code.gs'), 'utf8');
  const helper = source.slice(source.indexOf('var TARGET_COMPANY_GROUPS_'), source.indexOf('function targetSignalScore_'));
  const context = runInNewContext(helper + ';({groups:TARGET_COMPANY_GROUPS_, backup:BACKUP_COMPANY_GROUPS_, company:strictCompany_, vision:strictVision_, relevant:strictRelevant_, eligible:strictEligible_})');
  expect(JSON.parse(JSON.stringify(context.groups))).toEqual(TARGET_COMPANIES);
  expect(JSON.parse(JSON.stringify(context.backup))).toEqual(BACKUP_COMPANIES);
  for (const company of ['Safran.AI','Boschman','SNCF Voyageurs','Siemens','Siemens Healthineers','Google','EDF Enedis','Veolia','AXA']) expect(context.company(company)).toBe(targetCompany(company) !== null);
  for (const title of ['Computer Vision','Stage traitement d’images','Stage RAG','Data Analyst','Marketing imagerie','Imagerie médicale']) expect(context.vision(title,'')).toBe(isVisionMission({title}));
  for(const title of ['Stage Data Analyst RH Power BI','Stage Data Analyst Finance','Stage Data Scientist Maintenance Prédictive','Stage RAG','Stage maintenance prédictive']) expect(context.relevant(title,'')).toBe(isTargetOffer({company:'Safran', title}));
  const cases = [
    ['Safran', 'Stage Computer Vision', true],
    ['Veolia', 'Stage Computer Vision', false],
    ['Veolia', 'Stage Data Analyst Power BI', true],
    ['Air Liquide', 'Stage maintenance prédictive', true],
    ['Michelin', 'Stage Data Analyst Finance', false],
    ['AXA', 'Stage Data Analyst', false],
    ['Safran', 'Stage Data Scientist Computer Vision', false],
    ['Alstom', 'Stage Data Science - maintenance prédictive', false],
    ['EDF', 'Stage Data Scientist - fiabilité', false],
    ['Veolia', 'Stage Data Analyst - maintenance prédictive', true],
  ] as const;
  for (const [company, title, expected] of cases) {
    expect(context.eligible(company,title,'')).toBe(expected);
    expect(isTargetOffer({company, title})).toBe(expected);
  }
});
