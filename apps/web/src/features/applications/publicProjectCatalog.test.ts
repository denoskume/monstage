import { describe, expect, it } from 'vitest';
import { publicProjectCatalog } from './publicProjectCatalog';

describe('verified public-project CV evidence', () => {
  it('provides four meaningful bullets per project in both languages', () => {
    expect(publicProjectCatalog.length).toBeGreaterThanOrEqual(16);
    for (const entry of publicProjectCatalog) {
      expect(entry.url).toMatch(/^https:\/\/github\.com\/denoskume\//);
      for (const language of ['FR', 'EN'] as const) {
        const project = entry.cv[language];
        expect(project.name.trim().length).toBeGreaterThan(4);
        expect(project.bullets).toHaveLength(4);
        for (const bullet of project.bullets) {
          expect(bullet.trim().length).toBeGreaterThan(25);
        }
        expect(new Set(project.bullets).size).toBe(4);
      }
    }
  });
});
