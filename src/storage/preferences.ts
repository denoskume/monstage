export type SortMode = 'best' | 'recent' | 'score' | 'priority' | 'city';

export interface MonStagePreferences {
  query: string;
  sort: SortMode;
  onlyForMe: boolean;
  minScore: number;
}

export const defaultPreferences: MonStagePreferences = {
  query: '',
  sort: 'best',
  onlyForMe: true,
  minScore: 0,
};

const KEY = 'monstage:preferences:v1';
const validSortModes: SortMode[] = ['best', 'recent', 'score', 'priority', 'city'];

export function loadPreferences(): MonStagePreferences {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return defaultPreferences;
  }
  if (!raw) return defaultPreferences;
  try {
    const parsed = JSON.parse(raw) as Partial<MonStagePreferences>;
    return {
      query: typeof parsed.query === 'string' ? parsed.query : defaultPreferences.query,
      sort: validSortModes.includes(parsed.sort as SortMode) ? parsed.sort as SortMode : defaultPreferences.sort,
      onlyForMe: typeof parsed.onlyForMe === 'boolean' ? parsed.onlyForMe : defaultPreferences.onlyForMe,
      minScore: typeof parsed.minScore === 'number' && Number.isFinite(parsed.minScore) ? parsed.minScore : defaultPreferences.minScore,
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: MonStagePreferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Non-critical preference persistence failure.
  }
}
