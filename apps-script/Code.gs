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

function meaningfulTokens_(value) {
  var stopwords = {
    'stage': true, 'intern': true, 'internship': true, 'stagiaire': true,
    'engineer': true, 'ingenieur': true, 'ingenieure': true, 'data': true,
    'science': true, 'scientist': true, 'machine': true, 'learning': true,
    'intelligence': true, 'artificielle': true, 'artificial': true, 'h': true,
    'f': true, 'hf': true, 'fh': true, 'pour': true, 'avec': true, 'dans': true,
    'the': true, 'and': true, 'for': true, 'with': true, 'from': true
  };

  return normalizeComparable_(value)
    .split(' ')
    .filter(function (token) {
      return token.length >= 4 && !stopwords[token];
    });
}

function tokenOverlapScore_(tokens, haystack) {
  if (!tokens.length) return 0;
  var unique = {};
  tokens.forEach(function (token) { unique[token] = true; });
  var list = Object.keys(unique);
  var hits = list.filter(function (token) { return haystack.indexOf(token) !== -1; }).length;
  return hits / list.length;
}

function parseApplicationDate_(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) return value;

  var text = String(value).trim();
  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return parsed;

  var match = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
  if (!match) return null;
  parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return isNaN(parsed.getTime()) ? null : parsed;
}

function dateProximityScore_(offer, signalDate) {
  var applied = parseApplicationDate_(offer.appliedAt);
  if (!applied || !signalDate) return 0;

  var days = Math.abs(signalDate.getTime() - applied.getTime()) / (24 * 60 * 60 * 1000);
  if (days <= 2) return 1;
  if (days <= 7) return 0.9;
  if (days <= 14) return 0.7;
  if (days <= 30) return 0.45;
  if (days <= 60) return 0.2;
  return 0;
}

function applicationLifecycleScore_(offer, eventType) {
  var status = normalizeText_(offer.applicationStatus) || 'À candidater';

  if (eventType === 'submitted') {
    if (status === 'À candidater') return 0.65;
    if (status === 'Application commencée') return 1;
    return 0.9;
  }

  if (['Candidature envoyée', 'Réponse recruteur', 'Relance', 'Entretien', 'Test technique', 'Offre reçue'].indexOf(status) !== -1) {
    return 1;
  }

  if (offer.appliedAt) return 0.9;
  if (offer.shortlist) return 0.35;
  return 0;
}

function applicationUrlScore_(offer, haystack) {
  var url = normalizeText_(offer.applicationUrl);
  if (!url) return 0;

  var normalizedUrl = normalizeComparable_(url);
  var tokens = normalizedUrl.split(' ').filter(function (token) {
    return token.length >= 5 || /^\d{5,}$/.test(token);
  });
  if (!tokens.length) return 0;

  var hits = tokens.filter(function (token) { return haystack.indexOf(token) !== -1; }).length;
  return Math.min(1, hits / Math.min(tokens.length, 5));
}

function scoreOfferForSignal_(offer, signalText, signalDate, eventType) {
  var haystack = normalizeComparable_(signalText);
  var company = companyMatchScore_(offer, haystack);
  var title = tokenOverlapScore_(meaningfulTokens_(offer.title), haystack);
  var lifecycle = applicationLifecycleScore_(offer, eventType);
  var date = dateProximityScore_(offer, signalDate);
  var url = applicationUrlScore_(offer, haystack);

  var score =
    (company * 0.34) +
    (title * 0.30) +
    (lifecycle * 0.18) +
    (date * 0.10) +
    (url * 0.08);

  if (company < 0.5 && title < 0.55 && url < 0.6) score *= 0.45;

  return {
    score: score,
    company: company,
    title: title,
    lifecycle: lifecycle,
    date: date,
    url: url
  };
}

function findOfferForSignal_(offers, signalText, signalDate, eventType) {
  var ranked = offers.map(function (offer) {
    return {
      offer: offer,
      details: scoreOfferForSignal_(offer, signalText, signalDate, eventType)
    };
  }).sort(function (left, right) {
    return right.details.score - left.details.score;
  });

  if (!ranked.length) return null;

  var best = ranked[0];
  var second = ranked.length > 1 ? ranked[1] : null;
  var margin = second ? best.details.score - second.details.score : best.details.score;

  var strongIdentity =
    best.details.title >= 0.45 ||
    best.details.url >= 0.6 ||
    (best.details.company >= 0.95 && best.details.lifecycle >= 0.9 && best.details.date >= 0.45);

  if (best.details.score < 0.58 || !strongIdentity) return null;
  if (second && margin < 0.10) return null;

  return {
    offer: best.offer,
    score: Math.min(1, best.details.score),
    margin: margin,
    details: best.details
  };
}

function matchingEvidenceSummary_(match) {
  var details = match.details;
  return [
    'company=' + details.company.toFixed(2),
    'title=' + details.title.toFixed(2),
    'lifecycle=' + details.lifecycle.toFixed(2),
    'date=' + details.date.toFixed(2),
    'reference=' + details.url.toFixed(2),
    'margin=' + match.margin.toFixed(2)
  ].join('; ');
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
      var subject = message.getSubject() || '';
      var sender = message.getFrom() || '';
      var body = message.getPlainBody() || '';
      var classificationText = subject + ' ' + sender + ' ' + body.slice(0, 5000);
      var definition = applicationEventDefinition_(classificationText);
      if (!definition) return;

      var signalDate = message.getDate();
      var match = findOfferForSignal_(offers, classificationText, signalDate, definition.type);
      if (!match || !match.offer) return;

      var confidence = Math.min(0.99, definition.confidence * (0.72 + (match.score * 0.28)));
      var event = {
        id: 'gmail:' + message.getId(),
        offerId: match.offer.id,
        company: match.offer.company,
        type: definition.type,
        confidence: Number(confidence.toFixed(2)),
        source: 'gmail',
        detectedAt: signalDate.toISOString(),
        evidence: 'Multi-signal match: ' + matchingEvidenceSummary_(match) + '. Email content is analyzed transiently and not stored.'
      };

      if (appendApplicationEvent_(eventSheet, event) && event.confidence >= 0.86) {
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
    var description = calendarEvent.getDescription() || '';
    var signalText = title + ' ' + description.slice(0, 3000);
    var normalized = normalizeComparable_(signalText);
    if (normalized.indexOf('interview') === -1 && normalized.indexOf('entretien') === -1) return;

    var match = findOfferForSignal_(offers, signalText, calendarEvent.getStartTime(), 'interview');
    if (!match || !match.offer) return;

    var definition = {
      type: 'interview',
      confidence: 0.97,
      status: 'Entretien',
      action: 'Préparer l’entretien et confirmer les modalités'
    };
    var confidence = Math.min(0.99, definition.confidence * (0.74 + (match.score * 0.26)));
    var event = {
      id: 'calendar:' + calendarEvent.getId(),
      offerId: match.offer.id,
      company: match.offer.company,
      type: 'interview',
      confidence: Number(confidence.toFixed(2)),
      source: 'calendar',
      detectedAt: calendarEvent.getStartTime().toISOString(),
      evidence: 'Multi-signal calendar match: ' + matchingEvidenceSummary_(match) + '. Calendar description is analyzed transiently and not stored.'
    };

    if (appendApplicationEvent_(eventSheet, event) && event.confidence >= 0.88) {
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

function rebuildAutonomyEvidence() {
  var spreadsheet = getSpreadsheet_();
  var eventSheet = getEventSheet_(spreadsheet);

  if (eventSheet.getLastRow() > 1) {
    eventSheet.getRange(2, 1, eventSheet.getLastRow() - 1, eventSheet.getLastColumn()).clearContent();
  }

  syncApplicationEvents();
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
