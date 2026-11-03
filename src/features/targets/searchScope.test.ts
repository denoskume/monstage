import { describe, it, expect } from 'vitest';
import { TARGET_COMPANIES, targetCompany, isTargetOffer, restrictOffersPayload } from '../../../shared/searchScope';
describe('restricted discovery scope', () => {
  it('accepts the twenty target groups, including their named subsidiaries', () => {
    expect(TARGET_COMPANIES).toHaveLength(20);
    for (const [company] of TARGET_COMPANIES) expect(isTargetOffer({company,title:'Stage Computer Vision'})).toBe(true);
    for (const company of ['Safran.AI', 'Airbus Atlantic', 'Olea Medical', 'Faurecia', 'Ampere SAS']) expect(targetCompany(company)).not.toBeNull();
  });
  it('requires BOTH a target company and an actual image/vision mission', () => {
    for (const title of ['Stage Data Analyst', 'Stage RAG / LLM', 'Stage maintenance prédictive vibratoire', 'Stage Python', 'Stage NLP', 'Stage Marketing Scanner']) expect(isTargetOffer({company:'Safran',title})).toBe(false);
    expect(isTargetOffer({company:'Google',title:'Stage Computer Vision'})).toBe(false);
    expect(isTargetOffer({company:'Safran',title:'Stage IA',domain:'Computer Vision / traitement d’images'})).toBe(true);
    expect(isTargetOffer({company:'GE HealthCare',title:'Stage imagerie médicale'})).toBe(true);
  });
  it('does not confuse Siemens divisions or match companies by partial words', () => {
    expect(targetCompany('Siemens')).toBeNull();
    expect(targetCompany('Boschman')).toBeNull();
    expect(targetCompany('Siemens Mobility')).toBe('Siemens Mobility');
    expect(targetCompany('Siemens Healthineers')).toBe('Siemens Healthineers');
  });
  it('hides unrelated rows even when an old application was sent', () => {
    const offers = [{company:'Google',title:'Data Analyst'}, {company:'Stimio',title:'Stage Python',applicationStatus:'Candidature envoyée'}, {company:'Alstom',title:'Stage Computer Vision'}];
    expect((restrictOffersPayload({offers}) as {offers:unknown[]}).offers).toEqual(offers.slice(2));
  });
});
