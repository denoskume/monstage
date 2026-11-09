import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { it, expect } from 'vitest';
import { TARGET_COMPANIES, targetCompany, isVisionMission, isTargetOffer } from '../../../shared/searchScope';

it('keeps Apps Script ingestion aligned with the same 30-company A/B scope', () => {
  const source = readFileSync(resolve(process.cwd(),'apps-script/Code.gs'),'utf8');
  const helper = source.slice(source.indexOf('var TARGET_COMPANY_GROUPS_'),source.indexOf('function targetSignalScore_'));
  const ctx = runInNewContext(helper + ';({groups:TARGET_COMPANY_GROUPS_,company:strictCompany_,vision:strictVision_,relevant:strictRelevant_,eligible:strictEligible_})');
  expect(JSON.parse(JSON.stringify(ctx.groups))).toEqual(TARGET_COMPANIES);
  for(const company of ['Air France-KLM','Alstom','SNCF Voyageurs','Siemens Mobility','Hitachi Rail','Michelin','RATP','Bosch','Siemens Healthineers','EDF','AXA']) {
    expect(ctx.company(company)).toBe(targetCompany(company)!==null);
  }
  for(const title of ['Computer Vision','Stage traitement d’images','Data Analyst','Stage RAG','Marketing imagerie','Stage imagerie médicale']) {
    expect(ctx.vision(title,'')).toBe(isVisionMission({title}));
  }
  const cases = [
    ['Alstom','Stage Computer Vision',true],
    ['Alstom','Stage Data Analyst - fiabilité',true],
    ['Alstom','Stage Data Analyst Power BI',true],
    ['SNCF','Stage Data Analyst exploitation',true],
    ['Air France','Stage Data Analyst reporting',true],
    ['RATP','Stage Data Analyst fiabilité',true],
    ['Airbus','Stage Data Scientist maintenance prédictive',false],
    ['Michelin','Stage Data Analyst Finance',false],
    ['Safran','Stage Machine Learning Engineer Computer Vision',true],
    ['Bosch','Stage Computer Vision',false],
    ['EDF','Stage Data Analyst',true],
    ['Siemens Healthineers','Stage traitement images',true],
    ['Danone','Stage Ingénieur Maintenance Industrielle',false],
  ] as const;
  for(const [company,title,expected] of cases){
    expect(ctx.eligible(company,title,'')).toBe(expected);
    expect(isTargetOffer({company,title})).toBe(expected);
  }
});