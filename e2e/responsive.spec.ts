import { expect, test, type Page } from '@playwright/test';

const makeOffer = (overrides: Record<string, unknown> = {}) => ({
  id: '1', company: 'Assystem', title: 'Computer Vision Intern', domain: 'Computer Vision', city: 'Nantes', region: 'Pays de la Loire',
  m2Fit: 'Oui probable', start: 'Janvier 2027', duration: '6 mois', compensation: '1 300 €/mois', skills: ['Python', 'PyTorch', 'OpenCV'],
  publishedAt: '2026-09-15', offerStatus: 'Active', applicationStatus: 'À candidater', nextAction: 'Candidater', applicationUrl: 'https://company.example/jobs/1',
  shortlist: true, appliedAt: null, followUpAt: null, specialization: 'Computer Vision / 3D', technicalFit: 98, decisionScore: 100, priority: 'A+',
  freshness: 'Vérifié <24h', verifiedAt: '2026-09-15T06:00:00Z', sourceQuality: 'Officiel / direct', actionLevel: 'CANDIDATER 24H',
  calendarFit: '✅ Probable', confidence: 'Haute', relevance: null, gaps: null, ...overrides,
});

const payload = {
  generatedAt: '2026-09-15T06:00:00.000Z',
  source: 'Stage Intelligence France',
  offers: [
    makeOffer(),
    makeOffer({ id: '2', company: 'Criteo', title: 'Machine Learning Intern', city: 'Paris', specialization: 'Machine Learning / Deep Learning', decisionScore: 96, priority: 'A', shortlist: false, applicationUrl: 'https://company.example/jobs/2' }),
    makeOffer({ id: '3', company: 'SII', title: 'Data AI Intern', city: 'Rennes', specialization: 'Data / AI', decisionScore: 82, priority: 'B+', m2Fit: 'Possible', shortlist: false, applicationUrl: 'https://company.example/jobs/3' }),
    makeOffer({ id: '4', company: 'Wavestone', title: 'ML Engineer Intern', city: 'Puteaux', specialization: 'Machine Learning / Deep Learning', decisionScore: 94, priority: 'A', applicationStatus: 'Candidature envoyée', appliedAt: '14/09/2026', shortlist: false, applicationUrl: 'https://company.example/jobs/4' }),
    makeOffer({ id: '5', company: 'ALTEN', title: 'Computer Vision Research Intern', city: 'Sèvres', decisionScore: 92, priority: 'A', applicationStatus: 'Entretien', shortlist: false, applicationUrl: 'https://company.example/jobs/5' }),
    makeOffer({ id: '6', company: 'Example', title: 'Deep Learning Intern', city: 'Lyon', specialization: 'Machine Learning / Deep Learning', decisionScore: 88, priority: 'A', shortlist: false, applicationUrl: 'https://company.example/jobs/6' }),
  ],
};

const authorizedUser = {
  email: 'owner@example.test',
  name: 'MonStage Owner',
  picture: null,
};

async function installGoogleIdentityStub(page: Page, credential: string) {
  await page.route('https://accounts.google.com/gsi/client', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.google = { accounts: { id: {
          initialize(options) { window.__monstageGsiOptions = options; },
          renderButton(target) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Sign in with Google';
            button.setAttribute('aria-label', 'Sign in with Google');
            button.addEventListener('click', () => window.__monstageGsiOptions.callback({ credential: ${JSON.stringify(credential)} }));
            target.appendChild(button);
          },
          disableAutoSelect() { window.__monstageAutoSelectDisabled = true; }
        } } };
      `,
    });
  });
}

async function installWorkerRoutes(page: Page, credential: string, authorized = true) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5173',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store',
  };

  await page.route('https://example.test/api/**', async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    const auth = request.headers()['authorization'];
    if (auth !== `Bearer ${credential}`) {
      await route.fulfill({ status: 401, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ error: 'UNAUTHORIZED' }) });
      return;
    }

    const path = new URL(request.url()).pathname;
    if (path === '/api/session') {
      if (!authorized) {
        await route.fulfill({ status: 403, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ error: 'ACCESS_DENIED' }) });
        return;
      }
      await route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ user: authorizedUser }) });
      return;
    }

    if (path === '/api/offers') {
      await route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify(payload) });
      return;
    }

    await route.fulfill({ status: 404, headers: corsHeaders, contentType: 'application/json', body: '{}' });
  });
}

async function openSignedOut(page: Page, credential = 'e2e-owner-token', authorized = true) {
  await installGoogleIdentityStub(page, credential);
  await installWorkerRoutes(page, credential, authorized);
  await page.goto('#/offers');
  await expect(page.getByRole('heading', { name: 'MonStage' })).toBeVisible();
  await expect(page.getByText('Private internship intelligence workspace')).toBeVisible();
}

async function signIn(page: Page) {
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  await expect(page.getByText('Find the internship worth applying for.')).toBeVisible();
}

test('signed-out visitors cannot see protected navigation or internship data', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop security acceptance');
  await openSignedOut(page);

  await expect(page.getByRole('link', { name: 'Jobs' })).toHaveCount(0);
  await expect(page.getByText('Computer Vision Intern')).toHaveCount(0);
});

test('wrong Google account is denied and protected data stays hidden', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop security acceptance');
  await openSignedOut(page, 'e2e-wrong-token', false);

  await page.getByRole('button', { name: 'Sign in with Google' }).click();

  await expect(page.getByText('Access denied — This MonStage workspace is private.')).toBeVisible();
  await expect(page.getByText('Computer Vision Intern')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Jobs' })).toHaveCount(0);
});

test('desktop authenticated flow works and sign out relocks the workspace', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop Chrome', 'desktop acceptance');
  await openSignedOut(page);
  await signIn(page);

  await expect(page.getByText('owner@example.test')).toBeVisible();
  await expect(page.getByText('Computer Vision Intern').first()).toBeVisible();
  await expect(page.locator('.offer-card').first().getByText('Likely yes')).toBeVisible();
  await page.getByRole('button', { name: /Machine Learning Intern/ }).click();
  await expect(page.locator('.offer-detail-pane').getByRole('heading', { name: 'Machine Learning Intern' })).toBeVisible();
  await expect(page.locator('.offer-detail-pane').getByRole('link', { name: /Apply/ })).toHaveAttribute('href', 'https://company.example/jobs/2');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);

  await page.getByLabel('Minimum score').selectOption('95');
  await expect(page.getByText('Data AI Intern')).toHaveCount(0);
  await page.locator('.top-nav').getByRole('link', { name: 'Shortlist' }).click();
  await expect(page.getByRole('heading', { name: 'Shortlist' })).toBeVisible();
  await page.locator('.top-nav').getByRole('link', { name: 'Applications' }).click();
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Application sent' })).toBeVisible();
  await page.locator('.top-nav').getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByText('Private internship intelligence workspace')).toBeVisible();
  await expect(page.getByText('Computer Vision Intern')).toHaveCount(0);
});

test('mobile authenticated flow preserves navigation, detail, filters and no overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'Desktop Chrome', 'mobile acceptance');
  await openSignedOut(page);
  await signIn(page);

  await expect(page.locator('.bottom-nav')).toBeVisible();
  await page.getByRole('button', { name: /Computer Vision Intern/ }).click();
  await expect(page.getByRole('button', { name: '← Back to jobs' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Apply/ })).toBeVisible();
  await page.getByRole('button', { name: '← Back to jobs' }).click();
  await page.getByRole('button', { name: /Filters/ }).click();
  await expect(page.getByRole('dialog', { name: 'Opportunity filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Close filters' }).click();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});
