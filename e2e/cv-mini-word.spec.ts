import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('mini-Word CV: ribbon compact, édition des titres, mise en forme et exports directs', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop Chrome', 'Vérification sur desktop');
  await page.goto('cv/thierry-editor.html');
  await expect(page.locator('.word-ribbon')).toBeVisible();
  await expect(page.getByRole('button',{name:'Accueil'})).toBeVisible();
  await expect(page.locator('.word-group.word-font')).toBeVisible();
  await expect(page.getByRole('button',{name:'Justifier'})).toBeVisible();
  await expect(page.locator('.word-tabs button')).toHaveCount(5);
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


test('cellules Thierry : ajout, suppression, puces, redimensionnement manuel et tableaux Word', async ({page},testInfo)=>{
  test.skip(testInfo.project.name!=='Desktop Chrome','Test des cellules sur desktop');
  await page.goto('cv/thierry-editor.html');
  await page.getByRole('button',{name:'Disposition du tableau'}).click();
  const sheet=page.locator('.sheet[data-sheet="A"]');
  const sidebar=sheet.locator('aside');
  const cells=sidebar.locator(':scope > .ls');
  const initial=await cells.count();
  expect(initial).toBeGreaterThan(6);
  await expect(sidebar.locator('.row-boundary')).toHaveCount(initial-1);

  // Le + sur la séparation bleue insère une véritable cellule éditable.
  await sidebar.locator('.row-boundary .insert-cell').first().click();
  await expect(cells).toHaveCount(initial+1);
  const added=cells.nth(1);
  await expect(added).toContainText('Nouvelle rubrique');
  await added.locator('.side-heading').click();
  await page.locator('#row-insert').click();
  await expect(added.locator('[contenteditable]')).toHaveCount(3);
  await page.locator('#row-delete').click();
  await expect(added.locator('[contenteditable]')).toHaveCount(2);
  await page.locator('#bullet-insert').click();
  await expect(added).toContainText('Nouvelle puce');
  await page.locator('#bullet-delete').click();
  await expect(added).not.toContainText('Nouvelle puce');

  // La poignée horizontale ajuste la hauteur de la cellule précédente.
  const first=cells.first();
  const beforeHeight=(await first.boundingBox())!.height;
  const boundary=sidebar.locator('.row-boundary').first();
  const box=(await boundary.boundingBox())!;
  await page.mouse.move(box.x+box.width*0.7,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*0.7,box.y+box.height/2+38,{steps:7});
  await page.mouse.up();
  expect((await first.boundingBox())!.height).toBeGreaterThan(beforeHeight+20);

  // La bordure verticale change la largeur de la colonne et des exports.
  const widthBefore=(await sidebar.boundingBox())!.width;
  const separator=(await sheet.locator(':scope > .column-resize').boundingBox())!;
  await page.mouse.move(separator.x+separator.width/2,separator.y+100);
  await page.mouse.down();
  await page.mouse.move(separator.x+separator.width/2+32,separator.y+100,{steps:5});
  await page.mouse.up();
  expect((await sidebar.boundingBox())!.width).toBeGreaterThan(widthBefore+18);

  // Le DOCX téléchargé contient une vraie table interne, une ligne par cellule.
  const wordPromise=page.waitForEvent('download');
  await page.locator('#download').click();
  await page.locator('#export-docx').click();
  const word=await wordPromise;
  const wordContent=(await readFile(await word.path())).toString('utf8');
  expect((wordContent.match(/<w:tbl>/g)||[]).length).toBeGreaterThanOrEqual(2);
  expect(wordContent).toContain('w:insideH');
  expect(wordContent).toContain('Nouvelle rubrique');

  const pdfPromise=page.waitForEvent('download');
  await page.locator('#download').click();
  await page.locator('#export-pdf').click();
  const pdf=await pdfPromise;
  const pdfContent=await readFile(await pdf.path());
  expect(pdfContent.subarray(0,5).toString('latin1')).toBe('%PDF-');

  await page.reload();
  await page.getByRole('button',{name:'Disposition du tableau'}).click();
  await expect(page.locator('.sheet[data-sheet="A"] aside > .ls')).toHaveCount(initial+1);
  expect((await page.locator('.sheet[data-sheet="A"] aside').boundingBox())!.width).toBeGreaterThan(widthBefore+18);
  page.on('dialog',dialog=>dialog.accept());
  await page.locator('.sheet[data-sheet="A"] aside > .ls').nth(1).locator('.side-heading').click();
  await page.locator('#cell-delete').click();
  await expect(page.locator('.sheet[data-sheet="A"] aside > .ls')).toHaveCount(initial);
});
