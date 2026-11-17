import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('mini-Word CV: ribbon compact, édition des titres, mise en forme et exports directs', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop Chrome', 'Vérification sur desktop');
  await page.goto('cv/thierry-editor.html');
  await expect(page.locator('.word-ribbon')).toBeVisible();
  await expect(page.getByRole('button',{name:'Accueil'})).toBeVisible();
  await expect(page.locator('.word-group.word-font')).toBeVisible();
  await expect(page.getByRole('button',{name:'Justifier'})).toBeVisible();
  await expect(page.locator('.word-tabs button')).toHaveCount(4);
  await expect(page.locator('.ribbon-panel[data-ribbon-panel="home"]')).toBeVisible();
  await expect(page.locator('.ribbon-panel[data-ribbon-panel="insert"]')).toBeHidden();

  const firstHeading = page.locator('.sheet[data-sheet="A"] .right-heading[contenteditable]').first();
  await firstHeading.fill('EXPÉRIENCES ET RÉALISATIONS');
  await expect(firstHeading).toHaveText('EXPÉRIENCES ET RÉALISATIONS');

  const mission = page.locator('.sheet[data-sheet="A"] .experience').first().locator('.desc [contenteditable]').first();
  await mission.fill('Développer un outil utile pour un recruteur.');
  await mission.evaluate(el => {
    el.focus();
    const text = el.firstChild!;
    const range = document.createRange();
    range.setStart(text, 0); range.setEnd(text, 10);
    const selection = window.getSelection()!;
    selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await page.locator('#font-family').selectOption('Cambria');
  await page.locator('#font-color').fill('#dd2222');
  await expect(mission.locator('span[style*="font-family"]')).toHaveCount(1);
  await expect(mission.locator('span[style*="color"]')).toHaveCount(1);
  await expect(page.locator('#format-status')).not.toContainText('pas prise en charge');
  await page.getByRole('button',{name:'Centrer'}).click();
  await expect(mission.locator('..')).toHaveCSS('text-align','center');

  await page.getByRole('button',{name:'Mise en page'}).click();
  await expect(page.locator('.ribbon-panel[data-ribbon-panel="layout"]')).toBeVisible();
  await page.locator('#block-bg').fill('#e6eeff');
  await expect(mission.locator('..')).toHaveCSS('background-color','rgb(230, 238, 255)');
  await page.locator('#sidebar-bg').fill('#cccccc');
  await expect(page.locator('.sheet[data-sheet="A"] aside')).toHaveCSS('background-color','rgb(204, 204, 204)');
  await page.getByRole('button',{name:'Insertion'}).click();
  await page.getByRole('button',{name:'Compétence'}).click();
  await expect(page.locator('.sheet[data-sheet="A"] .skills .skill-title').last()).toContainText('Nouvelle compétence');

  const pdfPromise = page.waitForEvent('download');
  await page.locator('#download').click();
  await page.locator('#export-pdf').click();
  const pdf = await pdfPromise;
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);
  const pdfBytes = await readFile(await pdf.path());
  expect(pdfBytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');

  const wordPromise = page.waitForEvent('download');
  await page.locator('#download').click();
  await page.locator('#export-docx').click();
  const word = await wordPromise;
  expect(word.suggestedFilename()).toMatch(/\.docx$/);
  const wordBytes = await readFile(await word.path());
  expect(wordBytes.subarray(0, 2).toString()).toBe('PK');
  expect(wordBytes.toString('utf8')).toContain('EXPÉRIENCES ET RÉALISATIONS');

  await page.reload();
  await expect(page.locator('.sheet[data-sheet="A"] .right-heading').first()).toHaveText('EXPÉRIENCES ET RÉALISATIONS');
  await testInfo.attach('nouveau-ruban-mini-word',{body:await page.screenshot({fullPage:false}),contentType:'image/png'});
});

test('mini-Word CV: onglets horizontaux sur écran réduit', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Small Mobile', 'Vérification sur petit écran');
  await page.goto('cv/thierry-editor.html');
  await expect(page.locator('.word-tabs')).toBeVisible();
  await expect(page.locator('.ribbon-panel[data-ribbon-panel="home"]')).toBeVisible();
  await page.getByRole('button',{name:'CV B Data Scientist'}).click();
  await expect(page.locator('.sheet[data-sheet="B"]')).toBeVisible();
});
