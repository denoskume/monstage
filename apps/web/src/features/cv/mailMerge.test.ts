import { zipSync, strToU8, strFromU8, unzipSync } from 'fflate';
import { mergeDocument, parseRecipients } from './mailMerge';

test('lit un CSV Excel avec BOM, point-virgule et champs multilignes entre guillemets', () => {
  expect(
    parseRecipients(
      '\uFEFFNom;Ville\r\n"Du""pont";"Paris; France\nNantes"\r\n',
    ),
  ).toEqual({
    headers: ['Nom', 'Ville'],
    records: [['Du"pont', 'Paris; France\nNantes']],
  });
  expect(() => parseRecipients('Nom,Nom\nA,B')).toThrow();
});
test('fusionne les champs répartis entre runs en conservant accents, formatage et modèle initial', () => {
  const xml =
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>Bonjour «N</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>om» : «Nom»</w:t></w:r></w:p></w:document>';
  const source = zipSync({ 'word/document.xml': strToU8(xml) });
  const output = strFromU8(
    unzipSync(mergeDocument(source, ['Nom'], ['Léa & fils']))[
      'word/document.xml'
    ],
  );
  expect(output).toContain('Bonjour Léa &amp; fils');
  expect(output).toContain(' : Léa &amp; fils');
  expect(output).toContain('<w:b');
  expect(strFromU8(unzipSync(source)['word/document.xml'])).toBe(xml);
  expect(() => mergeDocument(source, ['Société'], ['ABC'])).toThrow(
    'Colonne CSV manquante',
  );
});
