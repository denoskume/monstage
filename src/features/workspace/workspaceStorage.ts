export interface ApplicationWorkspaceState {
  cvReady: boolean;
  coverLetterReady: boolean;
  interviewPrepReady: boolean;
  submitted: boolean;
  followUpDate: string;
  notes: string;
  updatedAt: string | null;
}

export type WorkspaceStore = Record<string, ApplicationWorkspaceState>;

const KEY = 'monstage:application-workspace:v1';

export const emptyWorkspaceState: ApplicationWorkspaceState = {
  cvReady: false,
  coverLetterReady: false,
  interviewPrepReady: false,
  submitted: false,
  followUpDate: '',
  notes: '',
  updatedAt: null,
};

export function loadWorkspace(): WorkspaceStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as WorkspaceStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getWorkspaceState(offerId: string): ApplicationWorkspaceState {
  const current = loadWorkspace()[offerId];
  return { ...emptyWorkspaceState, ...(current ?? {}) };
}

export function saveWorkspace(store: WorkspaceStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Workspace persistence is helpful but must never block the application flow.
  }
}

export function updateWorkspaceState(
  store: WorkspaceStore,
  offerId: string,
  patch: Partial<ApplicationWorkspaceState>,
): WorkspaceStore {
  const next = {
    ...store,
    [offerId]: {
      ...emptyWorkspaceState,
      ...(store[offerId] ?? {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  };
  saveWorkspace(next);
  return next;
}

export function packageProgress(state: ApplicationWorkspaceState): number {
  const items = [state.cvReady, state.coverLetterReady, state.interviewPrepReady, state.submitted];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}
