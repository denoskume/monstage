function normalizeText_(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim();
}

function normalizeNumber_(value) {
  if (value === null || value === undefined || value === '') return null;
  var n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeBool_(value) {
  return value === true || String(value).toLowerCase() === 'true';
}

function normalizeSkills_(value) {
  var text = normalizeText_(value);
  return text
    ? text.split(',').map(function (item) { return item.trim(); }).filter(Boolean)
    : [];
}

function buildHeaderMap_(headers) {
  return headers.reduce(function (map, header, index) {
    map[String(header).trim()] = index;
    return map;
  }, {});
}

function valueByHeader_(row, headerMap, header) {
  var index = headerMap[header];
  return index === undefined ? null : row[index];
}

function mapOffer_(row, headerMap) {
  return {
    id: normalizeText_(valueByHeader_(row, headerMap, 'ID')) || '',
    company: normalizeText_(valueByHeader_(row, headerMap, 'Entreprise')) || '',
    title: normalizeText_(valueByHeader_(row, headerMap, "Intitulé de l'offre")) || '',
    domain: normalizeText_(valueByHeader_(row, headerMap, 'Domaine')),
    city: normalizeText_(valueByHeader_(row, headerMap, 'Ville')),
    region: normalizeText_(valueByHeader_(row, headerMap, 'Région')),
    m2Fit: normalizeText_(valueByHeader_(row, headerMap, 'M2 2027')),
    start: normalizeText_(valueByHeader_(row, headerMap, 'Début')),
    duration: normalizeText_(valueByHeader_(row, headerMap, 'Durée')),
    compensation: normalizeText_(valueByHeader_(row, headerMap, 'Rémunération')),
    skills: normalizeSkills_(valueByHeader_(row, headerMap, 'Compétences clés')),
    publishedAt: normalizeText_(valueByHeader_(row, headerMap, 'Publication')),
    offerStatus: normalizeText_(valueByHeader_(row, headerMap, "Statut de l'offre")),
    applicationStatus: normalizeText_(valueByHeader_(row, headerMap, 'Statut candidature')),
    nextAction: normalizeText_(valueByHeader_(row, headerMap, 'Prochaine action')),
    applicationUrl: normalizeText_(valueByHeader_(row, headerMap, 'Lien direct')),
    shortlist: normalizeBool_(valueByHeader_(row, headerMap, '⭐ Shortlist')),
    appliedAt: normalizeText_(valueByHeader_(row, headerMap, 'Date candidature')),
    followUpAt: normalizeText_(valueByHeader_(row, headerMap, 'Relance prévue')),
    specialization: normalizeText_(valueByHeader_(row, headerMap, 'Famille cible')),
    technicalFit: normalizeNumber_(valueByHeader_(row, headerMap, 'Fit technique /100')),
    decisionScore: normalizeNumber_(valueByHeader_(row, headerMap, 'Score décision /100')),
    priority: normalizeText_(valueByHeader_(row, headerMap, 'Priorité')) || '',
    freshness: normalizeText_(valueByHeader_(row, headerMap, 'Fraîcheur')),
    verifiedAt: normalizeText_(valueByHeader_(row, headerMap, 'Vérifié le')),
    sourceQuality: normalizeText_(valueByHeader_(row, headerMap, 'Qualité source')),
    actionLevel: normalizeText_(valueByHeader_(row, headerMap, 'Niveau action')),
    calendarFit: normalizeText_(valueByHeader_(row, headerMap, 'Fit calendrier')),
    confidence: normalizeText_(valueByHeader_(row, headerMap, 'Confiance')),
    relevance: null,
    gaps: null
  };
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function secureEquals_(left, right) {
  left = String(left || '');
  right = String(right || '');
  if (left.length !== right.length) return false;

  var mismatch = 0;
  for (var i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

function readGatewaySecret_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  try {
    var body = JSON.parse(e.postData.contents);
    return normalizeText_(body.gatewaySecret);
  } catch (error) {
    return null;
  }
}

function getOffers_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Missing SPREADSHEET_ID script property');

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Offres');
  if (!sheet) throw new Error('Offres sheet not found');

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headerMap = buildHeaderMap_(values[0]);
  return values.slice(1)
    .filter(function (row) {
      return normalizeText_(valueByHeader_(row, headerMap, 'Entreprise'));
    })
    .map(function (row) {
      return mapOffer_(row, headerMap);
    });
}

function doGet() {
  return jsonOutput_({
    error: 'NOT_FOUND',
    message: 'Not found'
  });
}

function doPost(e) {
  try {
    var expectedSecret = PropertiesService
      .getScriptProperties()
      .getProperty('MONSTAGE_GATEWAY_SECRET');
    var providedSecret = readGatewaySecret_(e);

    if (!expectedSecret || !secureEquals_(providedSecret, expectedSecret)) {
      return jsonOutput_({
        error: 'UNAUTHORIZED',
        message: 'Unauthorized'
      });
    }

    return jsonOutput_({
      generatedAt: new Date().toISOString(),
      source: 'Stage Intelligence France',
      offers: getOffers_()
    });
  } catch (error) {
    console.error('MonStage backend error');
    return jsonOutput_({
      error: 'MONSTAGE_API_ERROR',
      message: 'Unable to load offers'
    });
  }
}
