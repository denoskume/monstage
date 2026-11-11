import type { CvLanguage } from '../cv/cvStorage';
import type { InternshipOffer } from '../../api/contract';

const normalize = (value: string) => value.toLocaleLowerCase('fr-FR')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function relevantCoursesForOffer(offer: InternshipOffer, language: CvLanguage) {
  const fr = language === 'FR';
  const content = normalize([offer.title, offer.specialization, offer.domain, ...offer.skills]
    .filter(Boolean).join(' '));

  // Select concise labels from the candidate's actual courses, not the
  // verbatim multi-language programming catalogue or unrelated modules.
  if (/computer vision|vision|image|imagerie|optique|camera|segmentation/.test(content)) {
    return fr
      ? { ecn: 'Vision par ordinateur · Traitement d’images · Machine Learning',
        kju: 'Programmation Python · Traitement numérique du signal' }
      : { ecn: 'Computer Vision · Image Processing · Machine Learning',
        kju: 'Python Programming · Digital Signal Processing' };
  }
  if (/data|donnees|base de donnees|sql|analytics|business intelligence|forecast|prevision|qualite|quality|reporting|statist/.test(content)) {
    return fr
      ? { ecn: 'Analyse de données · Machine Learning · Méthodes stochastiques',
        kju: 'Bases de données · Programmation Python' }
      : { ecn: 'Data Analysis · Machine Learning · Stochastic Methods',
        kju: 'Databases · Python Programming' };
  }
  if (/robot|control|automatisation|automation|optimis|signal|predictive maintenance|maintenance/.test(content)) {
    return fr
      ? { ecn: 'Machine Learning · Optimisation · Filtrage du signal',
        kju: 'Programmation Python · Traitement numérique du signal' }
      : { ecn: 'Machine Learning · Optimization · Signal Filtering',
        kju: 'Python Programming · Digital Signal Processing' };
  }
  return fr
    ? { ecn: 'Machine Learning · Analyse de données', kju: 'Programmation Python' }
    : { ecn: 'Machine Learning · Data Analysis', kju: 'Python Programming' };
}

/** Never pad the CV with a second weakly related project. */
export function selectConvincingProjects<T extends { score: number }>(
  ranked: readonly T[],
): T[] {
  if (!ranked.length || ranked[0].score <= 0) return [];
  const first = ranked[0];
  const second = ranked[1];
  const secondIsEquallyRelevant = second
    && second.score >= 9
    && second.score >= first.score * 0.78;
  return secondIsEquallyRelevant ? [first, second] : [first];
}
