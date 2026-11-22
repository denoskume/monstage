export type ApplicationProvider = 'email' | 'lever' | 'smartrecruiters' | 'greenhouse' | 'workday' | 'hellowork' | 'generic';

export interface ApplicationCapability {
  provider: ApplicationProvider;
  label: string;
  native: boolean;
  embeddable: boolean;
  reason: string;
}

export function detectApplicationCapability(url: string | null): ApplicationCapability {
  if (!url) return { provider: 'generic', label: 'Unavailable', native: false, embeddable: false, reason: 'No application URL.' };

  const lower = url.toLowerCase();
  if (lower.startsWith('mailto:')) {
    return { provider: 'email', label: 'Direct email', native: true, embeddable: true, reason: 'MonStage can submit this application through the authenticated backend.' };
  }
  if (lower.includes('jobs.lever.co') || lower.includes('api.lever.co')) {
    return { provider: 'lever', label: 'Lever', native: true, embeddable: true, reason: 'Lever supports programmatic applications when the employer exposes API access.' };
  }
  if (lower.includes('smartrecruiters.com')) {
    return { provider: 'smartrecruiters', label: 'SmartRecruiters', native: true, embeddable: true, reason: 'SmartRecruiters provides an Application API when partner credentials are available.' };
  }
  if (lower.includes('greenhouse.io') || lower.includes('boards.greenhouse.io')) {
    return { provider: 'greenhouse', label: 'Greenhouse', native: true, embeddable: true, reason: 'Greenhouse supports recruiting integrations when employer-side API access is available.' };
  }
  if (lower.includes('hellowork.com')) {
    return { provider: 'hellowork', label: 'HelloWork', native: false, embeddable: false, reason: 'HelloWork blocks third-party embedding, so the application must continue on HelloWork.' };
  }
  if (lower.includes('myworkdayjobs.com') || lower.includes('workday.com')) {
    return { provider: 'workday', label: 'Workday', native: false, embeddable: true, reason: 'Workday applications commonly require employer-hosted session flows.' };
  }
  return { provider: 'generic', label: 'Employer site', native: false, embeddable: true, reason: 'MonStage will use the integrated application browser when direct submission is unavailable.' };
}
