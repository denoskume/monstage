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

function normalizeComparable_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function mapOffer_(row, headerMap, autonomy) {
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
    gaps: null,
    autonomy: autonomy || null
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

function getSpreadsheet_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Missing SPREADSHEET_ID script property');
  return SpreadsheetApp.openById(spreadsheetId);
}

function getEventSheet_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName('Application Events');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Application Events');
    sheet.getRange(1, 1, 1, 8).setValues([[
      'Event ID', 'Offer ID', 'Entreprise', 'Type', 'Confiance', 'Source', 'Detected At', 'Evidence'
    ]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function latestAutonomyEvents_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName('Application Events');
  if (!sheet) return {};

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return {};

  var headers = buildHeaderMap_(values[0]);
  var latest = {};
  values.slice(1).forEach(function (row) {
    var offerId = normalizeText_(valueByHeader_(row, headers, 'Offer ID'));
    if (!offerId) return;
    var detectedAt = normalizeText_(valueByHeader_(row, headers, 'Detected At')) || '';
    var current = latest[offerId];
    if (!current || detectedAt >= current.detectedAt) {
      latest[offerId] = {
        type: normalizeText_(valueByHeader_(row, headers, 'Type')),
        confidence: normalizeNumber_(valueByHeader_(row, headers, 'Confiance')),
        source: normalizeText_(valueByHeader_(row, headers, 'Source')),
        detectedAt: detectedAt,
        evidence: normalizeText_(valueByHeader_(row, headers, 'Evidence'))
      };
    }
  });
  return latest;
}

function getOffers_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName('Offres');
  if (!sheet) throw new Error('Offres sheet not found');

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headerMap = buildHeaderMap_(values[0]);
  var autonomyMap = latestAutonomyEvents_(spreadsheet);
  return values.slice(1)
    .filter(function (row) {
      return normalizeText_(valueByHeader_(row, headerMap, 'Entreprise'));
    })
    .map(function (row) {
      var id = normalizeText_(valueByHeader_(row, headerMap, 'ID')) || '';
      return mapOffer_(row, headerMap, autonomyMap[id] || null);
    });
}

function applicationEventDefinition_(text) {
  var normalized = normalizeComparable_(text);
  var definitions = [
    { type: 'offer', confidence: 0.98, status: 'Offre reçue', action: 'Examiner l’offre et la date limite', terms: ['job offer', 'offer letter', 'proposition d embauche', 'nous avons le plaisir de vous proposer'] },
    { type: 'rejected', confidence: 0.98, status: 'Refus', action: 'Clôturer et capitaliser sur le retour', terms: ['unfortunately', 'regret to inform', 'not selected', 'not moving forward', 'candidature non retenue', 'malheureusement'] },
    { type: 'technical_test', confidence: 0.95, status: 'Test technique', action: 'Préparer et soumettre le test technique', terms: ['technical test', 'coding test', 'assessment', 'hackerrank', 'codility', 'test technique', 'evaluation technique'] },
    { type: 'interview', confidence: 0.96, status: 'Entretien', action: 'Préparer l’entretien et confirmer les modalités', terms: ['interview', 'entretien', 'meet with', 'meeting invitation', 'calendly'] },
    { type: 'submitted', confidence: 0.94, status: 'Candidature envoyée', action: 'Préparer la relance et l’entretien', terms: ['application received', 'application submitted', 'thank you for applying', 'we received your application', 'candidature recue', 'candidature reçue', 'merci pour votre candidature'] },
    { type: 'recruiter_response', confidence: 0.84, status: 'Réponse recruteur', action: 'Lire et répondre au recruteur', terms: ['recruiter', 'talent acquisition', 'your application', 'votre candidature', 'profil', 'candidate'] }
  ];

  for (var i = 0; i < definitions.length; i += 1) {
    if (definitions[i].terms.some(function (term) { return normalized.indexOf(normalizeComparable_(term)) !== -1; })) {
      return definitions[i];
    }
  }
  return null;
}

function companyMatchScore_(offer, haystack) {
  var company = normalizeComparable_(offer.company);
  if (!company) return 0;
  if (haystack.indexOf(company) !== -1) return 1;

  var tokens = company.split(' ').filter(function (token) { return token.length >= 4; });
  if (!tokens.length) return 0;
  var matched = tokens.filter(function (token) { return haystack.indexOf(token) !== -1; }).length;
  return matched / tokens.length;
}

function findOfferForSignal_(offers, signalText) {
  var haystack = normalizeComparable_(signalText);
  var best = null;
  var bestScore = 0;

  offers.forEach(function (offer) {
    var score = companyMatchScore_(offer, haystack);
    var titleTokens = normalizeComparable_(offer.title).split(' ').filter(function (token) { return token.length >= 5; });
    var titleHits = titleTokens.filter(function (token) { return haystack.indexOf(token) !== -1; }).length;
    if (titleTokens.length) score += Math.min(0.35, (titleHits / titleTokens.length) * 0.35);

    if (score > bestScore) {
      best = offer;
      bestScore = score;
    }
  });

  return bestScore >= 0.65 ? { offer: best, score: Math.min(1, bestScore) } : null;
}

function eventAlreadyRecorded_(sheet, eventId) {
  if (sheet.getLastRow() < 2) return false;
  var finder = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(eventId).matchEntireCell(true);
  return !!finder.findNext();
}

function appendApplicationEvent_(sheet, event) {
  if (eventAlreadyRecorded_(sheet, event.id)) return false;
  sheet.appendRow([
    event.id,
    event.offerId,
    event.company,
    event.type,
    event.confidence,
    event.source,
    event.detectedAt,
    event.evidence
  ]);
  return true;
}

function statusRank_(status) {
  var rank = {
    'À candidater': 0,
    'Application commencée': 1,
    'Candidature envoyée': 2,
    'Réponse recruteur': 3,
    'Entretien': 4,
    'Test technique': 5,
    'Offre reçue': 6,
    'Refus': 6,
    'Abandonné': 6
  };
  return rank[status] === undefined ? 0 : rank[status];
}

function applyDetectedStatus_(spreadsheet, offerId, definition, detectedAt) {
  var sheet = spreadsheet.getSheetByName('Offres');
  if (!sheet || sheet.getLastRow() < 2) return;

  var values = sheet.getDataRange().getValues();
  var headerMap = buildHeaderMap_(values[0]);
  var idIndex = headerMap['ID'];
  var statusIndex = headerMap['Statut candidature'];
  var actionIndex = headerMap['Prochaine action'];
  var appliedIndex = headerMap['Date candidature'];
  var followUpIndex = headerMap['Relance prévue'];

  if (idIndex === undefined || statusIndex === undefined) return;

  for (var i = 1; i < values.length; i += 1) {
    if (String(values[i][idIndex]).trim() !== offerId) continue;

    var current = normalizeText_(values[i][statusIndex]) || 'À candidater';
    if (statusRank_(definition.status) >= statusRank_(current) || definition.status === 'Refus') {
      sheet.getRange(i + 1, statusIndex + 1).setValue(definition.status);
      if (actionIndex !== undefined) sheet.getRange(i + 1, actionIndex + 1).setValue(definition.action);

      if (definition.type === 'submitted' && appliedIndex !== undefined && !normalizeText_(values[i][appliedIndex])) {
        sheet.getRange(i + 1, appliedIndex + 1).setValue(new Date(detectedAt));
      }

      if (definition.type === 'submitted' && followUpIndex !== undefined && !normalizeText_(values[i][followUpIndex])) {
        var followUp = new Date(detectedAt);
        followUp.setDate(followUp.getDate() + 7);
        sheet.getRange(i + 1, followUpIndex + 1).setValue(followUp);
      }
    }
    return;
  }
}

function scanGmailSignals_(spreadsheet, offers, eventSheet) {
  var query = 'newer_than:30d (application OR candidature OR interview OR entretien OR assessment OR recruiter OR "talent acquisition" OR "thank you for applying" OR "application received" OR "job offer")';
  var threads = GmailApp.search(query, 0, 100);

  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (message) {
      var definition = applicationEventDefinition_(message.getSubject() + ' ' + message.getFrom());
      if (!definition) return;

      var match = findOfferForSignal_(offers, message.getSubject() + ' ' + message.getFrom());
      if (!match || !match.offer) return;

      var confidence = Math.min(0.99, definition.confidence * (0.75 + (match.score * 0.25)));
      var event = {
        id: 'gmail:' + message.getId(),
        offerId: match.offer.id,
        company: match.offer.company,
        type: definition.type,
        confidence: Number(confidence.toFixed(2)),
        source: 'gmail',
        detectedAt: message.getDate().toISOString(),
        evidence: 'Matched company/role metadata and application-event language; email body is not stored.'
      };

      if (appendApplicationEvent_(eventSheet, event) && event.confidence >= 0.82) {
        applyDetectedStatus_(spreadsheet, event.offerId, definition, event.detectedAt);
      }
    });
  });
}

function scanCalendarSignals_(spreadsheet, offers, eventSheet) {
  var now = new Date();
  var start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var end = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  var events = CalendarApp.getDefaultCalendar().getEvents(start, end);

  events.forEach(function (calendarEvent) {
    var title = calendarEvent.getTitle() || '';
    var normalized = normalizeComparable_(title);
    if (normalized.indexOf('interview') === -1 && normalized.indexOf('entretien') === -1) return;

    var match = findOfferForSignal_(offers, title);
    if (!match || !match.offer) return;

    var definition = {
      type: 'interview',
      confidence: 0.97,
      status: 'Entretien',
      action: 'Préparer l’entretien et confirmer les modalités'
    };
    var event = {
      id: 'calendar:' + calendarEvent.getId(),
      offerId: match.offer.id,
      company: match.offer.company,
      type: 'interview',
      confidence: 0.97,
      source: 'calendar',
      detectedAt: calendarEvent.getStartTime().toISOString(),
      evidence: 'Interview calendar event matched to company/role metadata; event description is not stored.'
    };

    if (appendApplicationEvent_(eventSheet, event)) {
      applyDetectedStatus_(spreadsheet, event.offerId, definition, event.detectedAt);
    }
  });
}

function syncApplicationEvents() {
  var spreadsheet = getSpreadsheet_();
  var offers = getOffers_();
  var eventSheet = getEventSheet_(spreadsheet);

  scanGmailSignals_(spreadsheet, offers, eventSheet);
  scanCalendarSignals_(spreadsheet, offers, eventSheet);

  PropertiesService.getScriptProperties().setProperty('AUTONOMY_LAST_SYNC', new Date().toISOString());
}

function installAutonomyTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'syncApplicationEvents') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('syncApplicationEvents')
    .timeBased()
    .everyMinutes(15)
    .create();

  syncApplicationEvents();
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
      autonomyLastSync: PropertiesService.getScriptProperties().getProperty('AUTONOMY_LAST_SYNC'),
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
