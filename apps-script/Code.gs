function normalizeText_(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim();
}

function normalizeNumber_(value) {
  if (value === null || value === undefined || value === '') return null;
  var n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function verifiedPublicationDate_(value) {
  if (!value) return null;
  // Lever createdAt is an authoritative Unix millisecond timestamp.
  if (typeof value === 'number' || /^\d{10,13}$/.test(String(value).trim())) {
    var numberValue = Number(value);
    var milliseconds = numberValue < 100000000000 ? numberValue * 1000 : numberValue;
    var numericDate = new Date(milliseconds);
    return Number.isFinite(numericDate.getTime()) &&
      numericDate.getTime() <= Date.now() + 86400000 &&
      numericDate.getUTCFullYear() >= 2000 ? numericDate.toISOString() : null;
  }
  // Accept official calendar dates and ISO timestamps only, not relative ages.
  var text = String(value).trim();
  var match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:(T|\s)(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/);
  if (!match) return null;
  var year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  var calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return null;
  var normalized = text.replace(' ', 'T');
  if (match[4] && !match[8]) normalized += 'Z';
  var parsed = new Date(normalized);
  if (!Number.isFinite(parsed.getTime()) || parsed.getTime() > Date.now() + 86400000) return null;
  return text;
}

function formatPublicationDate_(date) {
  return date || '';
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


var EXTERNAL_SYNC_VERSION_ = '2026-10-13-publication-v4';

var EXTERNAL_SOURCE_HEADERS_ = [
  'ID', 'Entreprise', "Intitulé de l'offre", 'Domaine', 'Ville', 'Région',
  'M2 2027', 'Début', 'Durée', 'Rémunération', 'Compétences clés', 'Publication',
  "Statut de l'offre", 'Statut candidature', 'Prochaine action', 'Lien direct',
  '⭐ Shortlist', 'Date candidature', 'Relance prévue', 'Famille cible',
  'Fit technique /100', 'Score décision /100', 'Priorité', 'Fraîcheur',
  'Vérifié le', 'Qualité source', 'Niveau action', 'Fit calendrier', 'Confiance'
];

var LEVER_SOURCES_ = [
  { site: 'ekimetrics', company: 'Ekimetrics' },
  { site: 'malt', company: 'Malt' },
  { site: 'foresea-technologies', company: 'OVRSEA' },
  { site: 'equativ', company: 'Equativ' },
  { site: 'dilitrust', company: 'DiliTrust' },
  { site: 'scaleway', company: 'Scaleway' },
  { site: 'veepee', company: 'Veepee' },
  { site: 'scality', company: 'Scality' },
  { site: 'bigblue', company: 'Bigblue' },
  { site: 'Beamy', company: 'Beamy' },
  { site: 'margo-group', company: 'MARGO' }
];

function isFranceLocation_(value) {
  var text = normalizeComparable_(value);
  if (!text) return false;
  if (text === 'fr' || /(^| )fr( |$)/.test(text)) return true;

  var franceTerms = [
    'france', 'paris', 'nantes', 'lyon', 'toulouse', 'grenoble', 'bordeaux',
    'lille', 'rennes', 'marseille', 'nice', 'sophia antipolis', 'montpellier',
    'strasbourg', 'saclay', 'velizy', 'courbevoie', 'puteaux', 'la defense',
    'boulogne billancourt', 'issy les moulineaux', 'levallois perret',
    'neuilly sur seine', 'saint denis', 'saint ouen', 'nanterre', 'rueil malmaison',
    'meudon', 'versailles', 'guyancourt', 'massy', 'palaiseau', 'evry',
    'cergy', 'aix en provence', 'vitrolles', 'cannes', 'antibes',
    'clermont ferrand', 'limoges', 'poitiers', 'tours', 'orleans',
    'angers', 'le mans', 'caen', 'rouen', 'reims', 'metz', 'nancy',
    'dijon', 'besancon', 'mulhouse', 'annecy', 'chambery', 'valence',
    'avignon', 'pau', 'bayonne', 'la rochelle', 'niort', 'brest',
    'lorient', 'vannes', 'saint nazaire'
  ];
  return franceTerms.some(function (term) { return text.indexOf(term) !== -1; });
}

function isInternshipPosting_(posting) {
  var text = normalizeComparable_([
    posting.text,
    posting.categories && posting.categories.commitment,
    posting.categories && posting.categories.team,
    posting.descriptionPlain
  ].filter(Boolean).join(' '));
  return ['internship', 'intern', 'stage', 'stagiaire'].some(function (term) {
    return text.indexOf(term) !== -1;
  });
}

function targetSignalScore_(posting) {
  var title = normalizeComparable_(posting.text);
  var text = normalizeComparable_([
    posting.text,
    posting.categories && posting.categories.team,
    posting.categories && posting.categories.department,
    posting.descriptionPlain
  ].filter(Boolean).join(' '));

  var weighted = [
    ['computer vision', 12], ['vision par ordinateur', 12],
    ['image processing', 11], ['traitement d image', 11],
    ['signal processing', 11], ['traitement du signal', 11],
    ['machine learning', 10], ['apprentissage automatique', 10],
    ['deep learning', 10], ['apprentissage profond', 10], ['data science', 9],
    ['artificial intelligence', 8], ['intelligence artificielle', 8],
    ['generative ai', 8], ['ia generative', 8], ['ai engineer', 9], ['ingenieur ia', 9],
    ['robotics', 8], ['optimisation', 7], ['optimization', 7],
    ['industrial ai', 8], ['quality', 4], ['automation', 4],
    ['data engineer', 6], ['data engineering', 6], ['analytics engineer', 5],
    ['data analyst', 5], ['data analytics', 5], ['analytics', 4], ['data collection', 4],
    ['data processing', 5], ['data analysis', 5], ['business intelligence', 4],
    ['digitalization', 3], ['digitalisation', 3], ['digital transformation', 3],
    ['statistical', 3], ['statistics', 3], ['predictive', 4], ['forecasting', 4],
    ['python', 2], ['pytorch', 4], ['opencv', 6], ['scikit learn', 3],
    ['sql', 2], ['power bi', 2], ['tableau', 2], ['spark', 3],
    ['research', 3], ['r&d', 4]
  ];

  var score = weighted.reduce(function (total, entry) {
    return total + (text.indexOf(entry[0]) !== -1 ? entry[1] : 0);
  }, 0);

  var titleBoosts = [
    ['computer vision', 8], ['vision par ordinateur', 8], ['image', 5],
    ['machine learning', 7], ['apprentissage automatique', 7],
    ['data scientist', 6], ['analytics', 4], ['data', 2], ['ai engineer', 7], ['ingenieur ia', 7],
    ['intelligence artificielle', 6], ['signal', 7],
    ['robotics', 6], ['r&d', 4]
  ];
  score += titleBoosts.reduce(function (total, entry) {
    return total + (title.indexOf(entry[0]) !== -1 ? entry[1] : 0);
  }, 0);

  return score;
}

function extractStartFromPosting_(posting) {
  var text = normalizeComparable_([posting.text, posting.descriptionPlain].filter(Boolean).join(' '));
  if (text.indexOf('february 2027') !== -1 || text.indexOf('fevrier 2027') !== -1) return 'Février 2027';
  if (text.indexOf('january 2027') !== -1 || text.indexOf('janvier 2027') !== -1) return 'Janvier 2027';
  if (text.indexOf('march 2027') !== -1 || text.indexOf('mars 2027') !== -1) return 'Mars 2027';
  if (text.indexOf('2027') !== -1) return '2027';
  return null;
}

function extractDurationFromPosting_(posting) {
  var text = normalizeComparable_([posting.text, posting.descriptionPlain].filter(Boolean).join(' '));
  if (text.indexOf('6 months') !== -1 || text.indexOf('6 month') !== -1 || text.indexOf('6 mois') !== -1) return '6 mois';
  if (text.indexOf('5 months') !== -1 || text.indexOf('5 mois') !== -1) return '5 mois';
  if (text.indexOf('4 months') !== -1 || text.indexOf('4 mois') !== -1) return '4 mois';
  return null;
}

function externalFitScores_(posting) {
  var signal = targetSignalScore_(posting);
  var specialization = specializationForPosting_(posting);
  var start = extractStartFromPosting_(posting);
  var duration = extractDurationFromPosting_(posting);

  var specializationBonus = {
    'Computer Vision / Image Processing': 18,
    'Signal / Audio': 17,
    'Machine Learning / AI': 15,
    'Data Science': 13,
    'Industrial AI / Process': 11,
    'Data Engineering / Analytics': 6,
    'Data / AI': 2
  }[specialization] || 0;

  var calendarBonus = 0;
  if (start === 'Février 2027') calendarBonus += 8;
  else if (start && start.indexOf('2027') !== -1) calendarBonus += 4;
  if (duration === '6 mois') calendarBonus += 6;

  var technicalFit = Math.max(50, Math.min(96, 48 + Math.min(signal, 30) + specializationBonus));
  var decisionScore = Math.max(45, Math.min(94, 42 + Math.min(signal, 28) + specializationBonus + calendarBonus));

  return {
    signal: signal,
    specialization: specialization,
    start: start,
    duration: duration,
    technicalFit: technicalFit,
    decisionScore: decisionScore,
    priority: decisionScore >= 88 ? 'A' : decisionScore >= 80 ? 'B+' : decisionScore >= 70 ? 'B' : 'C'
  };
}

function specializationForPosting_(posting) {
  var text = normalizeComparable_([
    posting.text,
    posting.categories && posting.categories.team,
    posting.descriptionPlain
  ].filter(Boolean).join(' '));

  if (text.indexOf('computer vision') !== -1 || text.indexOf('image processing') !== -1 || text.indexOf('opencv') !== -1) return 'Computer Vision / Image Processing';
  if (text.indexOf('machine learning') !== -1 || text.indexOf('deep learning') !== -1 || text.indexOf('generative ai') !== -1 || text.indexOf('ai engineer') !== -1) return 'Machine Learning / AI';
  if (text.indexOf('data science') !== -1 || text.indexOf('data scientist') !== -1) return 'Data Science';
  if (text.indexOf('data engineer') !== -1 || text.indexOf('analytics engineer') !== -1) return 'Data Engineering / Analytics';
  if (text.indexOf('signal') !== -1 || text.indexOf('audio') !== -1 || text.indexOf('speech') !== -1) return 'Signal / Audio';
  if (text.indexOf('industrial') !== -1 || text.indexOf('quality') !== -1 || text.indexOf('automation') !== -1) return 'Industrial AI / Process';
  return 'Data / AI';
}

function skillsForPosting_(posting) {
  var text = normalizeComparable_([posting.text, posting.descriptionPlain].filter(Boolean).join(' '));
  var known = [
    ['Python', 'python'], ['PyTorch', 'pytorch'], ['TensorFlow', 'tensorflow'],
    ['scikit-learn', 'scikit learn'], ['OpenCV', 'opencv'], ['SQL', 'sql'],
    ['Computer Vision', 'computer vision'], ['Machine Learning', 'machine learning'],
    ['Deep Learning', 'deep learning'], ['Data Science', 'data science'],
    ['Git', 'git'], ['Docker', 'docker'], ['Azure', 'azure'], ['AWS', 'aws']
  ];
  return known.filter(function (entry) { return text.indexOf(entry[1]) !== -1; })
    .map(function (entry) { return entry[0]; })
    .slice(0, 8)
    .join(', ');
}

function leverPostingToRow_(source, posting) {
  var location = posting.categories && posting.categories.location ? posting.categories.location : '';
  var team = posting.categories && (posting.categories.team || posting.categories.department)
    ? (posting.categories.team || posting.categories.department)
    : 'Data / AI';
  var fit = externalFitScores_(posting);
  var signalScore = fit.signal;
  var technicalFit = fit.technicalFit;
  var decisionScore = fit.decisionScore;
  var priority = fit.priority;
  var published = verifiedPublicationDate_(posting.createdAt);
  var verified = new Date();

  return [
    'lever:' + source.site + ':' + posting.id,
    source.company,
    posting.text || '',
    team,
    location,
    null,
    'Oui probable',
    fit.start,
    fit.duration,
    null,
    skillsForPosting_(posting),
    formatPublicationDate_(published),
    'Active',
    'À candidater',
    'Vérifier les conditions puis candidater',
    posting.hostedUrl || posting.applyUrl || '',
    false,
    null,
    null,
    specializationForPosting_(posting),
    technicalFit,
    decisionScore,
    priority,
    'Vérifié <24h',
    verified.toISOString(),
    'Officiel / direct',
    priority === 'A' ? 'CANDIDATER 48H' : 'À ÉVALUER',
    'À confirmer',
    signalScore >= 14 ? 'Haute' : 'Moyenne'
  ];
}

function fetchLeverPostings_(source) {
  var urls = [
    'https://api.lever.co/v0/postings/' + encodeURIComponent(source.site) + '?mode=json',
    'https://api.eu.lever.co/v0/postings/' + encodeURIComponent(source.site) + '?mode=json'
  ];

  for (var i = 0; i < urls.length; i += 1) {
    try {
      var response = UrlFetchApp.fetch(urls[i], {
        method: 'get',
        muteHttpExceptions: true,
        headers: { Accept: 'application/json' }
      });
      if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) continue;
      var payload = JSON.parse(response.getContentText());
      if (Array.isArray(payload)) return payload;
    } catch (error) {
      console.warn('Lever source failed: ' + source.site + ' ' + error);
    }
  }
  return [];
}

function writeExternalOfferRows_(sheet, rows) {
  // Preserve the last good snapshot if a provider returns no postings.
  if (!rows.length && sheet.getLastRow() > 1) {
    console.warn('Provider returned zero jobs; preserving previous snapshot: ' + sheet.getName());
    return sheet.getLastRow() - 1;
  }
  // Dates reconciled from official pages must survive subsequent provider syncs.
  var known = {};
  if (sheet.getLastRow() > 1) {
    var prior = sheet.getDataRange().getDisplayValues();
    var headers = buildHeaderMap_(prior[0]);
    prior.slice(1).forEach(function (row) {
      var id = normalizeText_(valueByHeader_(row, headers, 'ID'));
      var date = normalizeText_(valueByHeader_(row, headers, 'Publication'));
      if (id && date && publicationDateScore_({publishedAt: date})) known[id] = date;
    });
  }
  rows.forEach(function (row) {
    var id = normalizeText_(row[0]);
    if (id && !publicationDateScore_({publishedAt: row[11]}) && known[id]) row[11] = known[id];
  });
  sheet.clearContents();
  sheet.getRange(1, 1, 1, EXTERNAL_SOURCE_HEADERS_.length).setValues([EXTERNAL_SOURCE_HEADERS_]);
  sheet.setFrozenRows(1);
  if (rows.length) sheet.getRange(2, 1, rows.length, EXTERNAL_SOURCE_HEADERS_.length).setValues(rows);
  return rows.length;
}

function syncLeverSources_() {
  var spreadsheet = getSpreadsheet_();
  var sheetName = 'Offres - Lever';
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  var rows = [];

  LEVER_SOURCES_.forEach(function (source) {
    fetchLeverPostings_(source).forEach(function (posting) {
      recordAtsMetric_('Lever', 'fetched');
      var location = posting.categories && posting.categories.location ? posting.categories.location : '';
      if (!isFranceLocation_(location)) { recordAtsMetric_('Lever', 'notFrance'); return; }
      if (!isInternshipPosting_(posting)) { recordAtsMetric_('Lever', 'notInternship'); return; }
      if (targetSignalScore_(posting) < 3) { recordAtsMetric_('Lever', 'lowSignal'); return; }
      recordAtsMetric_('Lever', 'accepted');
      rows.push(leverPostingToRow_(source, posting));
    });
  });

  writeExternalOfferRows_(sheet, rows);

  PropertiesService.getScriptProperties().setProperty('LEVER_LAST_SYNC', new Date().toISOString());
  PropertiesService.getScriptProperties().setProperty('LEVER_LAST_COUNT', String(rows.length));
  return rows.length;
}


var GREENHOUSE_SOURCES_ = [
  { board: 'shifttechnology', company: 'Shift Technology' },
  { board: 'artefactjobs', company: 'Artefact' },
  { board: 'mirakllabs', company: 'Mirakl Labs' },
  { board: 'mirakl', company: 'Mirakl' }
];

function stripHtml_(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchGreenhouseJobs_(source) {
  var url = 'https://boards-api.greenhouse.io/v1/boards/' + encodeURIComponent(source.board) + '/jobs?content=true';
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' }
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return [];
    var payload = JSON.parse(response.getContentText());
    return payload && Array.isArray(payload.jobs) ? payload.jobs : [];
  } catch (error) {
    console.warn('Greenhouse source failed: ' + source.board + ' ' + error);
    return [];
  }
}

function greenhouseAsTargetPosting_(job) {
  return {
    text: job.title || '',
    descriptionPlain: stripHtml_(job.content || ''),
    categories: {
      location: job.location && job.location.name ? job.location.name : '',
      team: ''
    }
  };
}

function greenhouseJobToRow_(source, job) {
  var posting = greenhouseAsTargetPosting_(job);
  var location = posting.categories.location || '';
  var fit = externalFitScores_(posting);
  var signalScore = fit.signal;
  var technicalFit = fit.technicalFit;
  var decisionScore = fit.decisionScore;
  var priority = fit.priority;
  var published = verifiedPublicationDate_(job.first_published_at || job.published_at); // updated_at is not a publication timestamp
  var verified = new Date();

  return [
    'greenhouse:' + source.board + ':' + job.id,
    source.company,
    job.title || '',
    specializationForPosting_(posting),
    location,
    null,
    'Oui probable',
    fit.start,
    fit.duration,
    null,
    skillsForPosting_(posting),
    formatPublicationDate_(published),
    'Active',
    'À candidater',
    'Vérifier les conditions puis candidater',
    job.absolute_url || '',
    false,
    null,
    null,
    specializationForPosting_(posting),
    technicalFit,
    decisionScore,
    priority,
    'Vérifié <24h',
    verified.toISOString(),
    'Officiel / direct',
    priority === 'A' ? 'CANDIDATER 48H' : 'À ÉVALUER',
    'À confirmer',
    signalScore >= 14 ? 'Haute' : 'Moyenne'
  ];
}

function syncGreenhouseSources_() {
  var spreadsheet = getSpreadsheet_();
  var sheetName = 'Offres - Greenhouse';
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  var rows = [];

  GREENHOUSE_SOURCES_.forEach(function (source) {
    fetchGreenhouseJobs_(source).forEach(function (job) {
      recordAtsMetric_('Greenhouse', 'fetched');
      var posting = greenhouseAsTargetPosting_(job);
      var location = posting.categories.location || '';
      if (!isFranceLocation_(location)) { recordAtsMetric_('Greenhouse', 'notFrance'); return; }
      if (!isInternshipPosting_(posting)) { recordAtsMetric_('Greenhouse', 'notInternship'); return; }
      if (targetSignalScore_(posting) < 3) { recordAtsMetric_('Greenhouse', 'lowSignal'); return; }
      recordAtsMetric_('Greenhouse', 'accepted');
      rows.push(greenhouseJobToRow_(source, job));
    });
  });

  writeExternalOfferRows_(sheet, rows);

  PropertiesService.getScriptProperties().setProperty('GREENHOUSE_LAST_SYNC', new Date().toISOString());
  PropertiesService.getScriptProperties().setProperty('GREENHOUSE_LAST_COUNT', String(rows.length));
  return rows.length;
}


var ASHBY_SOURCES_ = [
  { board: 'mistral.ai', company: 'Mistral AI' },
  { board: 'owkin', company: 'Owkin' },
  { board: 'hcompany', company: 'H Company' },
  { board: 'maki', company: 'MakiPeople' },
  { board: 'cohere', company: 'Cohere' },
  { board: 'voodoo', company: 'Voodoo' },
  { board: 'nabla', company: 'Nabla' },
  { board: 'alpic', company: 'Alpic' },
  { board: 'meetdavis', company: 'Davis AI' },
  { board: 'illuin', company: 'ILLUIN Technology' },
  { board: 'scoreplay', company: 'ScorePlay' }
];

function fetchAshbyJobs_(source) {
  var url = 'https://api.ashbyhq.com/posting-api/job-board/' + encodeURIComponent(source.board) + '?includeCompensation=true';
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' }
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return [];
    var payload = JSON.parse(response.getContentText());
    return payload && Array.isArray(payload.jobs) ? payload.jobs : [];
  } catch (error) {
    console.warn('Ashby source failed: ' + source.board + ' ' + error);
    return [];
  }
}

function ashbyLocation_(job) {
  var locations = [];
  if (job.location) locations.push(job.location);
  if (Array.isArray(job.secondaryLocations)) {
    job.secondaryLocations.forEach(function (entry) {
      if (entry && entry.location) locations.push(entry.location);
    });
  }
  return locations.join(' · ');
}

function ashbyAsTargetPosting_(job) {
  return {
    text: job.title || '',
    descriptionPlain: job.descriptionPlain || '',
    categories: {
      location: ashbyLocation_(job),
      team: job.team || job.department || '',
      department: job.department || ''
    }
  };
}

function isAshbyInternship_(job, posting) {
  return normalizeComparable_(job.employmentType) === 'intern' || isInternshipPosting_(posting);
}

function ashbyJobIdentity_(source, job) {
  var url = String(job.jobUrl || job.applyUrl || '');
  var parts = url.split('/').filter(Boolean);
  var id = parts.length ? parts[parts.length - 1].split('?')[0] : normalizeComparable_(job.title);
  return 'ashby:' + source.board + ':' + id;
}

function ashbyCompensation_(job) {
  if (!job.compensation) return null;
  return job.compensation.compensationTierSummary ||
    job.compensation.scrapeableCompensationSalarySummary ||
    null;
}

function ashbyJobToRow_(source, job) {
  var posting = ashbyAsTargetPosting_(job);
  var fit = externalFitScores_(posting);
  var signalScore = fit.signal;
  var published = verifiedPublicationDate_(job.publishedAt);
  var verified = new Date();

  return [
    ashbyJobIdentity_(source, job),
    source.company,
    job.title || '',
    job.department || job.team || specializationForPosting_(posting),
    ashbyLocation_(job),
    null,
    'Oui probable',
    fit.start,
    fit.duration,
    ashbyCompensation_(job),
    skillsForPosting_(posting),
    formatPublicationDate_(published),
    'Active',
    'À candidater',
    'Vérifier les conditions puis candidater',
    job.jobUrl || job.applyUrl || '',
    false,
    null,
    null,
    specializationForPosting_(posting),
    fit.technicalFit,
    fit.decisionScore,
    fit.priority,
    'Vérifié <24h',
    verified.toISOString(),
    'Officiel / direct',
    fit.priority === 'A' ? 'CANDIDATER 48H' : 'À ÉVALUER',
    'À confirmer',
    signalScore >= 14 ? 'Haute' : 'Moyenne'
  ];
}

function syncAshbySources_() {
  var spreadsheet = getSpreadsheet_();
  var sheetName = 'Offres - Ashby';
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  var rows = [];

  ASHBY_SOURCES_.forEach(function (source) {
    fetchAshbyJobs_(source).forEach(function (job) {
      recordAtsMetric_('Ashby', 'fetched');
      if (job.isListed === false) return;
      var posting = ashbyAsTargetPosting_(job);
      if (!isFranceLocation_(posting.categories.location)) return;
      if (!isAshbyInternship_(job, posting)) return;
      if (targetSignalScore_(posting) < 3) { recordAtsMetric_('Ashby', 'lowSignal'); return; }
      recordAtsMetric_('Ashby', 'accepted');
      rows.push(ashbyJobToRow_(source, job));
    });
  });

  writeExternalOfferRows_(sheet, rows);

  PropertiesService.getScriptProperties().setProperty('ASHBY_LAST_SYNC', new Date().toISOString());
  PropertiesService.getScriptProperties().setProperty('ASHBY_LAST_COUNT', String(rows.length));
  return rows.length;
}

var SMARTRECRUITERS_SOURCES_ = [
  { companyId: 'SopraSteria1', company: 'Sopra Steria' },
  { companyId: 'BoschGroup', company: 'Bosch Group' },
  { companyId: 'Eurofins', company: 'Eurofins' },
  { companyId: 'veoliaenvironnementsa', company: 'Veolia' },
  { companyId: 'alten', company: 'ALTEN' },
  { companyId: 'GTT', company: 'GTT' },
  { companyId: 'Sia', company: 'Sia' },
  { companyId: 'ASSYSTEM', company: 'Assystem' },
  { companyId: 'octotechnology', company: 'OCTO Technology' },
  { companyId: 'Iliad-Free', company: 'Iliad-Free' }
];

function smartRecruitersList_(source) {
  var jobs = [];
  var seen = {};
  var limit = 100;
  var queries = ['stage', 'internship', 'stagiaire'];

  queries.forEach(function (query) {
    var offset = 0;
    for (var page = 0; page < 8; page += 1) {
      var url = 'https://api.smartrecruiters.com/v1/companies/' + encodeURIComponent(source.companyId) +
        '/postings?limit=' + limit + '&offset=' + offset + '&country=fr&q=' + encodeURIComponent(query);
      try {
        var response = UrlFetchApp.fetch(url, {
          method: 'get',
          muteHttpExceptions: true,
          headers: { Accept: 'application/json' }
        });
        if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) break;
        var payload = JSON.parse(response.getContentText());
        var batch = payload && Array.isArray(payload.content) ? payload.content : [];
        batch.forEach(function (job) {
          if (!job || !job.id || seen[job.id]) return;
          seen[job.id] = true;
          jobs.push(job);
        });
        if (batch.length < limit || offset + batch.length >= Number(payload.totalFound || 0)) break;
        offset += limit;
      } catch (error) {
        console.warn('SmartRecruiters source failed: ' + source.companyId + ' ' + query + ' ' + error);
        break;
      }
    }
  });

  return jobs;
}

function smartRecruitersDetails_(source, postingId) {
  var url = 'https://api.smartrecruiters.com/v1/companies/' + encodeURIComponent(source.companyId) +
    '/postings/' + encodeURIComponent(postingId);
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' }
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return null;
    return JSON.parse(response.getContentText());
  } catch (error) {
    console.warn('SmartRecruiters detail failed: ' + source.companyId + ':' + postingId + ' ' + error);
    return null;
  }
}

function smartRecruitersIsInternship_(job) {
  var label = normalizeComparable_(job.typeOfEmployment && job.typeOfEmployment.label);
  var title = normalizeComparable_(job.name);
  return label.indexOf('intern') !== -1 ||
    label.indexOf('stage') !== -1 ||
    title.indexOf('stage') !== -1 ||
    title.indexOf('intern') !== -1 ||
    title.indexOf('stagiaire') !== -1;
}

function smartRecruitersText_(details) {
  var sections = details && details.jobAd && details.jobAd.sections ? details.jobAd.sections : {};
  return Object.keys(sections).map(function (key) {
    return stripHtml_(sections[key] && sections[key].text);
  }).filter(Boolean).join(' ');
}

function smartRecruitersAsTargetPosting_(job, details) {
  var location = job.location || {};
  return {
    text: job.name || '',
    descriptionPlain: smartRecruitersText_(details),
    categories: {
      location: [location.city, location.region, location.country].filter(Boolean).join(', '),
      team: job.department && job.department.label ? job.department.label : '',
      department: job.function && job.function.label ? job.function.label : ''
    }
  };
}

function smartRecruitersJobToRow_(source, job, details) {
  var posting = smartRecruitersAsTargetPosting_(job, details);
  var fit = externalFitScores_(posting);
  var released = verifiedPublicationDate_((details && (details.releasedDate || details.postingDate || details.datePosted)) || job.releasedDate);
  var verified = new Date();

  return [
    'smartrecruiters:' + source.companyId + ':' + job.id,
    source.company,
    job.name || '',
    (job.department && job.department.label) || specializationForPosting_(posting),
    posting.categories.location,
    job.location && job.location.region ? job.location.region : null,
    'Oui probable',
    fit.start,
    fit.duration,
    null,
    skillsForPosting_(posting),
    formatPublicationDate_(released),
    'Active',
    'À candidater',
    'Vérifier les conditions puis candidater',
    (details && details.applyUrl) || job.ref || '',
    false,
    null,
    null,
    specializationForPosting_(posting),
    fit.technicalFit,
    fit.decisionScore,
    fit.priority,
    'Vérifié <24h',
    verified.toISOString(),
    'Officiel / direct',
    fit.priority === 'A' ? 'CANDIDATER 48H' : 'À ÉVALUER',
    'À confirmer',
    fit.signal >= 14 ? 'Haute' : 'Moyenne'
  ];
}

function syncSmartRecruitersSources_() {
  var spreadsheet = getSpreadsheet_();
  var sheetName = 'Offres - SmartRecruiters';
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  var rows = [];

  SMARTRECRUITERS_SOURCES_.forEach(function (source) {
    smartRecruitersList_(source).forEach(function (job) {
      recordAtsMetric_('SmartRecruiters', 'fetched');
      if (!smartRecruitersIsInternship_(job)) { recordAtsMetric_('SmartRecruiters', 'notInternship'); return; }
      var details = smartRecruitersDetails_(source, job.id);
      if (!details || details.active === false) { recordAtsMetric_('SmartRecruiters', 'missingDetail'); return; }
      var posting = smartRecruitersAsTargetPosting_(job, details);
      if (!isFranceLocation_(posting.categories.location)) return;
      if (targetSignalScore_(posting) < 3) { recordAtsMetric_('SmartRecruiters', 'lowSignal'); return; }
      recordAtsMetric_('SmartRecruiters', 'accepted');
      rows.push(smartRecruitersJobToRow_(source, job, details));
    });
  });

  writeExternalOfferRows_(sheet, rows);

  PropertiesService.getScriptProperties().setProperty('SMARTRECRUITERS_LAST_SYNC', new Date().toISOString());
  PropertiesService.getScriptProperties().setProperty('SMARTRECRUITERS_LAST_COUNT', String(rows.length));
  return rows.length;
}


var WORKDAY_SOURCES_ = [
  { tenant: 'ag', host: 'wd3', site: 'Airbus', company: 'Airbus' },
  { tenant: 'thales', host: 'wd3', site: 'Careers', company: 'Thales' },
  { tenant: 'evoyageurs', host: 'wd3', site: 'jobs', company: 'SNCF Connect & Tech' },
  { tenant: 'pernodricard', host: 'wd3', site: 'pernod-ricard', company: 'Pernod Ricard' },
  { tenant: 'pfizer', host: 'wd1', site: 'PfizerCareers', company: 'Pfizer' },
  { tenant: 'airliquidehr', host: 'wd3', site: 'AirLiquideExternalCareer', company: 'Air Liquide' },
  { tenant: 'alliancewd', host: 'wd3', site: 'renault-group-careers', company: 'Renault Group' },
  { tenant: 'integralads', host: 'wd1', site: 'IAScareers', company: 'Integral Ad Science' }
];

function workdayBaseUrl_(source) {
  return 'https://' + source.tenant + '.' + source.host + '.myworkdayjobs.com';
}

function fetchWorkdayPage_(source, searchText, offset) {
  var url = workdayBaseUrl_(source) + '/wday/cxs/' +
    encodeURIComponent(source.tenant) + '/' + encodeURIComponent(source.site) + '/jobs';
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        appliedFacets: {},
        limit: 20,
        offset: offset || 0,
        searchText: searchText || ''
      }),
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' }
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return null;
    return JSON.parse(response.getContentText());
  } catch (error) {
    console.warn('Workday list failed: ' + source.company + ' ' + error);
    return null;
  }
}

function fetchWorkdayJobs_(source) {
  var searches = [
    'stage', 'internship',
    'stage data', 'stage analytics', 'stage intelligence artificielle',
    'stage ai', 'stage machine learning', 'stage deep learning',
    'stage vision', 'stage image', 'stage signal', 'stage digital',
    'intern data', 'intern machine learning', 'intern ai'
  ];
  var seen = {};
  var jobs = [];

  searches.forEach(function (searchText) {
    var offset = 0;
    for (var page = 0; page < 8; page += 1) {
      var payload = fetchWorkdayPage_(source, searchText, offset);
      if (!payload) break;
      var batch = Array.isArray(payload.jobPostings) ? payload.jobPostings : [];
      batch.forEach(function (job) {
        var key = job.externalPath || job.title || JSON.stringify(job);
        if (seen[key]) return;
        seen[key] = true;
        jobs.push(job);
      });
      if (batch.length < 20 || offset + batch.length >= Number(payload.total || 0)) break;
      offset += 20;
    }
  });

  return jobs;
}

function fetchWorkdayDetails_(source, job) {
  var path = normalizeText_(job && job.externalPath);
  if (!path) return null;
  var url = workdayBaseUrl_(source) + '/wday/cxs/' +
    encodeURIComponent(source.tenant) + '/' + encodeURIComponent(source.site) + path;
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { Accept: 'application/json' }
    });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return null;
    var payload = JSON.parse(response.getContentText());
    return payload && payload.jobPostingInfo ? payload.jobPostingInfo : null;
  } catch (error) {
    console.warn('Workday detail failed: ' + source.company + ' ' + path + ' ' + error);
    return null;
  }
}

function workdayAsTargetPosting_(job, details) {
  details = details || {};
  return {
    text: details.title || job.title || '',
    descriptionPlain: stripHtml_(details.jobDescription || ''),
    categories: {
      location: details.location || details.locationText || job.locationsText || '',
      team: details.jobFamily || '',
      department: details.jobFamilyGroup || ''
    }
  };
}

function isWorkdayInternship_(job) {
  var text = normalizeComparable_([job.title, job.jobSchedule, job.timeType].filter(Boolean).join(' '));
  return ['stage', 'stagiaire', 'internship', 'intern'].some(function (term) {
    return text.indexOf(term) !== -1;
  });
}

function workdayPublishedDate_(job, details) {
  // The list API's "postedOn" is often relative (e.g. "Posted 3 Days Ago").
  // Relative strings are not exact publication dates and must not be fabricated.
  var candidates = [
    details && details.postedDate,
    details && details.publicationDate,
    details && details.datePosted,
    job.postedDate,
    job.publicationDate,
    job.datePosted,
    job.postedOn
  ];
  for (var i = 0; i < candidates.length; i += 1) {
    var exactDate = verifiedPublicationDate_(candidates[i]);
    if (exactDate) return exactDate;
  }
  return null;
}

function workdayJobToRow_(source, job, details) {
  var posting = workdayAsTargetPosting_(job, details);
  var fit = externalFitScores_(posting);
  var verified = new Date();
  var path = job.externalPath || '';
  var url = path ? workdayBaseUrl_(source) + '/en-US/' + source.site + path : workdayBaseUrl_(source) + '/' + source.site;
  var published = workdayPublishedDate_(job, details);

  return [
    'workday:' + source.tenant + ':' + normalizeComparable_(path || job.title),
    source.company,
    posting.text || job.title || '',
    specializationForPosting_(posting),
    posting.categories.location || job.locationsText || '',
    null,
    'Oui probable',
    fit.start,
    fit.duration,
    null,
    skillsForPosting_(posting),
    formatPublicationDate_(published),
    'Active',
    'À candidater',
    'Vérifier les conditions puis candidater',
    url,
    false,
    null,
    null,
    specializationForPosting_(posting),
    fit.technicalFit,
    fit.decisionScore,
    fit.priority,
    'Vérifié <24h',
    verified.toISOString(),
    'Officiel / direct',
    fit.priority === 'A' ? 'CANDIDATER 48H' : 'À ÉVALUER',
    'À confirmer',
    fit.signal >= 14 ? 'Haute' : 'Moyenne'
  ];
}

function syncWorkdaySources_() {
  var spreadsheet = getSpreadsheet_();
  var sheetName = 'Offres - Workday';
  var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  var rows = [];

  WORKDAY_SOURCES_.forEach(function (source) {
    fetchWorkdayJobs_(source).forEach(function (job) {
      recordAtsMetric_('Workday', 'fetched');
      var listPosting = workdayAsTargetPosting_(job, null);
      if (!isFranceLocation_(listPosting.categories.location)) return;
      if (!isWorkdayInternship_(job)) { recordAtsMetric_('Workday', 'notInternship'); return; }

      var details = fetchWorkdayDetails_(source, job);
      var posting = workdayAsTargetPosting_(job, details);
      if (!isFranceLocation_(posting.categories.location)) return;
      if (targetSignalScore_(posting) < 3) { recordAtsMetric_('Workday', 'lowSignal'); return; }
      recordAtsMetric_('Workday', 'accepted');
      rows.push(workdayJobToRow_(source, job, details));
    });
  });

  writeExternalOfferRows_(sheet, rows);

  PropertiesService.getScriptProperties().setProperty('WORKDAY_LAST_SYNC', new Date().toISOString());
  PropertiesService.getScriptProperties().setProperty('WORKDAY_LAST_COUNT', String(rows.length));
  return rows.length;
}


function externalSourceConfigSignature_() {
  return [
    EXTERNAL_SYNC_VERSION_,
    LEVER_SOURCES_.map(function (source) { return source.site; }).join(','),
    GREENHOUSE_SOURCES_.map(function (source) { return source.board; }).join(','),
    ASHBY_SOURCES_.map(function (source) { return source.board; }).join(','),
    SMARTRECRUITERS_SOURCES_.map(function (source) { return source.companyId; }).join(','),
    WORKDAY_SOURCES_.map(function (source) {
      return source.tenant + ':' + source.host + ':' + source.site;
    }).join(',')
  ].join('|');
}

function refreshExternalSourcesIfDue_() {
  var properties = PropertiesService.getScriptProperties();
  var sixHours = 6 * 60 * 60 * 1000;
  var sourceConfigSignature = externalSourceConfigSignature_();
  var sourceConfigChanged = properties.getProperty('EXTERNAL_SOURCE_CONFIG_SIGNATURE') !== sourceConfigSignature;
  var leverLast = properties.getProperty('LEVER_LAST_SYNC');
  var leverMs = leverLast ? Date.parse(leverLast) : 0;
  var greenhouseLast = properties.getProperty('GREENHOUSE_LAST_SYNC');
  var greenhouseMs = greenhouseLast ? Date.parse(greenhouseLast) : 0;
  var ashbyLast = properties.getProperty('ASHBY_LAST_SYNC');
  var ashbyMs = ashbyLast ? Date.parse(ashbyLast) : 0;
  var smartRecruitersLast = properties.getProperty('SMARTRECRUITERS_LAST_SYNC');
  var smartRecruitersMs = smartRecruitersLast ? Date.parse(smartRecruitersLast) : 0;
  var workdayLast = properties.getProperty('WORKDAY_LAST_SYNC');
  var workdayMs = workdayLast ? Date.parse(workdayLast) : 0;

  if (sourceConfigChanged || !leverMs || (Date.now() - leverMs) >= sixHours) {
    try {
      syncLeverSources_();
    } catch (error) {
      console.warn('Lever refresh failed: ' + error);
    }
  }
  if (sourceConfigChanged || !greenhouseMs || (Date.now() - greenhouseMs) >= sixHours) {
    try {
      syncGreenhouseSources_();
    } catch (error) {
      console.warn('Greenhouse refresh failed: ' + error);
    }
  }
  if (sourceConfigChanged || !ashbyMs || (Date.now() - ashbyMs) >= sixHours) {
    try {
      syncAshbySources_();
    } catch (error) {
      console.warn('Ashby refresh failed: ' + error);
    }
  }
  if (sourceConfigChanged || !smartRecruitersMs || (Date.now() - smartRecruitersMs) >= sixHours) {
    try {
      syncSmartRecruitersSources_();
    } catch (error) {
      console.warn('SmartRecruiters refresh failed: ' + error);
    }
  }
  if (sourceConfigChanged || !workdayMs || (Date.now() - workdayMs) >= sixHours) {
    try {
      syncWorkdaySources_();
    } catch (error) {
      console.warn('Workday refresh failed: ' + error);
    }
  }

  if (sourceConfigChanged) {
    properties.setProperty('EXTERNAL_SOURCE_CONFIG_SIGNATURE', sourceConfigSignature);
  }
}

function runExternalSyncSafely_(name, syncFn) {
  try {
    var count = syncFn();
    var metrics = (typeof ATS_SYNC_METRICS_ !== 'undefined' && ATS_SYNC_METRICS_[name]) || {};
    return { count: count, metrics: metrics, error: null };
  } catch (error) {
    var message = String(error && error.stack ? error.stack : error);
    console.error(name + ' sync failed: ' + message);
    return { count: 0, error: message.slice(0, 1000) };
  }
}

var ATS_SYNC_METRICS_ = {};
function recordAtsMetric_(provider, stage) {
  if (!ATS_SYNC_METRICS_[provider]) ATS_SYNC_METRICS_[provider] = {};
  ATS_SYNC_METRICS_[provider][stage] = (ATS_SYNC_METRICS_[provider][stage] || 0) + 1;
}

function syncExternalOfferSources() {
  var lever = runExternalSyncSafely_('Lever', syncLeverSources_);
  var greenhouse = runExternalSyncSafely_('Greenhouse', syncGreenhouseSources_);
  var ashby = runExternalSyncSafely_('Ashby', syncAshbySources_);
  var smartRecruiters = runExternalSyncSafely_('SmartRecruiters', syncSmartRecruitersSources_);
  var workday = runExternalSyncSafely_('Workday', syncWorkdaySources_);

  PropertiesService.getScriptProperties().setProperty(
    'EXTERNAL_SOURCE_CONFIG_SIGNATURE',
    externalSourceConfigSignature_()
  );

  var publicationAudit = null;
  try { publicationAudit = syncHistoricalPublicationDates(); }
  catch (error) { publicationAudit = { error: String(error).slice(0, 250) }; }

  return {
    lever: lever,
    greenhouse: greenhouse,
    ashby: ashby,
    smartRecruiters: smartRecruiters,
    workday: workday,
    publicationAudit: publicationAudit,
    syncedAt: new Date().toISOString()
  };
}

function offerSourceSheets_(spreadsheet) {
  return spreadsheet.getSheets().filter(function (sheet) {
    var name = sheet.getName();
    return name === 'Offres' || name.indexOf('Offres - ') === 0;
  });
}

function backendOfferIdentity_(offer) {
  return [
    normalizeComparable_(offer.company),
    normalizeComparable_(offer.title),
    normalizeComparable_(offer.city),
    normalizeComparable_(offer.applicationUrl)
  ].join('::');
}

function publicationDateScore_(offer) {
  var value = normalizeText_(offer.publishedAt);
  if (!value) return 0;
  var iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/);
  var fr = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?=$|[\s—–;,])/);
  var candidate = iso ? iso[1] + '-' + iso[2] + '-' + iso[3] :
    fr ? fr[3] + '-' + fr[2].padStart(2, '0') + '-' + fr[1].padStart(2, '0') : null;
  if (!candidate) return 0;
  var timestamp = Date.parse(candidate);
  return Number.isFinite(timestamp) && timestamp <= Date.now() + 86400000 ? timestamp : 0;
}

function publicationPrecision_(offer) {
  var value = normalizeText_(offer.publishedAt) || '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return 3;
  if (publicationDateScore_(offer)) return 2;
  if (/^(?:\d{4}|(?:\d{1,2}\/)?\d{4})/.test(value) || value) return 1;
  return 0;
}

function dedupeOffersServerSide_(offers) {
  var selected = {};
  var order = [];
  offers.forEach(function (offer) {
    var key = backendOfferIdentity_(offer);
    if (!Object.prototype.hasOwnProperty.call(selected, key)) {
      selected[key] = offer;
      order.push(key);
      return;
    }
    var current = selected[key];
    var currentScore = publicationDateScore_(current);
    var candidateScore = publicationDateScore_(offer);
    // Prefer verified publication data, and newer official postings over stale duplicates.
    // Do not use import/verification timestamps as a substitute for publication.
    if (publicationPrecision_(offer) > publicationPrecision_(current) ||
        (publicationPrecision_(offer) === publicationPrecision_(current) && candidateScore > currentScore)) selected[key] = offer;
  });
  return order.map(function (key) { return selected[key]; });
}


/**
 * Reconcile legacy offers against employer pages in bounded batches.
 * Trust only a matching JobPosting JSON-LD datePosted or explicit publication metadata.
 * Never use dateModified, page HTTP dates, crawl dates, verification dates or inferred ages.
 */
function extractOfficialJobPostingDate_(html, title) {
  var wanted = normalizeComparable_(title);
  if (!wanted) return null;
  var blocks = String(html || '').match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  for (var i = 0; i < blocks.length; i += 1) {
    var json = blocks[i].replace(/^<script[^>]*>/i, '').replace(/<\/script>\s*$/i, '');
    try {
      var document = JSON.parse(json);
      var pending = Array.isArray(document) ? document.slice() : [document];
      while (pending.length) {
        var entry = pending.shift();
        if (!entry || typeof entry !== 'object') continue;
        if (Array.isArray(entry['@graph'])) pending = pending.concat(entry['@graph']);
        var kind = entry['@type'];
        var isJob = kind === 'JobPosting' || (Array.isArray(kind) && kind.indexOf('JobPosting') >= 0);
        if (!isJob || !entry.title) continue;
        var sourceTitle = normalizeComparable_(entry.title);
        var left = wanted.split(' ').filter(Boolean);
        var right = sourceTitle.split(' ').filter(Boolean);
        var overlap = left.filter(function (word) { return word.length > 2 && right.indexOf(word) >= 0; }).length;
        if (overlap < 2 || overlap < Math.ceil(Math.min(left.length, right.length) * 0.6)) continue;
        var date = verifiedPublicationDate_(entry.datePosted || entry.datePublished);
        if (date) return date;
      }
    } catch (error) { /* Ignore invalid publisher metadata. */ }
  }
  return null;
}

function isOfficialPublicationUrl_(url) {
  try {
    var match = String(url || '').match(/^https:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    if (!match) return false;
    var host = match[1].split(':')[0].toLowerCase();
    if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false;
    if (host === '127.0.0.1' || host === '0.0.0.0') return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
    return true;
  } catch (error) { return false; }
}

function syncHistoricalPublicationDates() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return { skipped: 'busy' };
  try {
    var spreadsheet = getSpreadsheet_();
    var tabs = offerSourceSheets_(spreadsheet);
    var sources = tabs.map(function (sheet) {
      var count = sheet.getLastRow();
      return count < 2 ? null : {
        sheet: sheet,
        values: sheet.getDataRange().getDisplayValues()
      };
    }).filter(Boolean);
    var rowCount = sources.reduce(function (sum, source) { return sum + source.values.length - 1; }, 0);
    if (!rowCount) return { checked: 0, corrected: 0 };

    var props = PropertiesService.getScriptProperties();
    var cursor = Number(props.getProperty('PUBLICATION_SCAN_CURSOR') || '0') % rowCount;
    var inspected = 0, checked = 0, corrected = 0, skipped = 0;
    var limit = Math.min(16, rowCount);
    while (inspected < limit) {
      var index = (cursor + inspected) % rowCount;
      inspected++;
      var offset = index, source = null, rowNumber = 0;
      for (var j = 0; j < sources.length; j += 1) {
        var available = sources[j].values.length - 1;
        if (offset < available) {
          source = sources[j];
          rowNumber = offset + 2;
          break;
        }
        offset -= available;
      }
      if (!source) continue;
      var headers = buildHeaderMap_(source.values[0]);
      var dateIndex = headers['Publication'];
      var linkIndex = headers['Lien direct'];
      var titleIndex = headers["Intitulé de l'offre"];
      if ([dateIndex, linkIndex, titleIndex].some(function (value) { return value === undefined; })) { skipped++; continue; }
      var row = source.values[rowNumber - 1];
      var url = normalizeText_(row[linkIndex]);
      var title = normalizeText_(row[titleIndex]);
      if (!url || !title || !isOfficialPublicationUrl_(url)) { skipped++; continue; }

      try {
        var response = UrlFetchApp.fetch(url, {
          muteHttpExceptions: true,
          followRedirects: true,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MonStagePublicationAudit/1.0)' }
        });
        checked++;
        if (response.getResponseCode() !== 200) continue;
        var date = extractOfficialJobPostingDate_(response.getContentText().slice(0, 800000), title);
        if (!date) continue;
        var current = normalizeText_(row[dateIndex]) || '';
        var oldScore = publicationDateScore_({ publishedAt: current });
        var newScore = publicationDateScore_({ publishedAt: date });
        if (!newScore) continue;
        if (oldScore !== newScore ||
            publicationPrecision_({ publishedAt: current }) < publicationPrecision_({ publishedAt: date })) {
          source.sheet.getRange(rowNumber, dateIndex + 1).setValue(date);
          corrected++;
        }
      } catch (error) {
        console.warn('Publication audit unavailable: ' + source.sheet.getName() + ' row ' + rowNumber);
      }
    }
    props.setProperty('PUBLICATION_SCAN_CURSOR', String((cursor + inspected) % rowCount));
    props.setProperty('PUBLICATION_SCAN_LAST', new Date().toISOString());
    return { checked: checked, corrected: corrected, skipped: skipped, inspected: inspected, total: rowCount };
  } finally { lock.releaseLock(); }
}

function installPublicationAuditTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'syncHistoricalPublicationDates') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('syncHistoricalPublicationDates').timeBased().everyHours(1).create();
}

function getOffers_() {
  refreshExternalSourcesIfDue_();
  var spreadsheet = getSpreadsheet_();
  var sheets = offerSourceSheets_(spreadsheet);
  if (!sheets.length) throw new Error('No offer source sheet found');

  var autonomyMap = latestAutonomyEvents_(spreadsheet);
  var offers = [];

  sheets.forEach(function (sheet) {
    var values = sheet.getDataRange().getDisplayValues();
    if (values.length < 2) return;

    var headerMap = buildHeaderMap_(values[0]);
    values.slice(1)
      .filter(function (row) {
        return normalizeText_(valueByHeader_(row, headerMap, 'Entreprise'));
      })
      .forEach(function (row) {
        var id = normalizeText_(valueByHeader_(row, headerMap, 'ID')) || '';
        offers.push(mapOffer_(row, headerMap, autonomyMap[id] || null));
      });
  });

  return dedupeOffersServerSide_(offers);
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

  // Reconcile legacy publication metadata at most once per hour, in a bounded batch.
  // This never infers dates from the crawl date and never blocks application monitoring.
  var auditProperties = PropertiesService.getScriptProperties();
  var lastAudit = Date.parse(auditProperties.getProperty('PUBLICATION_SCAN_LAST') || '') || 0;
  if (Date.now() - lastAudit >= 60 * 60 * 1000) {
    try { syncHistoricalPublicationDates(); }
    catch (error) { console.warn('Historical publication audit failed: ' + error); }
  }

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


function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents) || {}; } catch (error) { return {}; }
}

function parseMailtoRecipient_(url) {
  var text = String(url || '');
  if (text.toLowerCase().indexOf('mailto:') !== 0) return null;
  return decodeURIComponent(text.slice(7).split('?')[0]).trim() || null;
}

function buildAttachmentBlobs_(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments.slice(0, 2).map(function (attachment) {
    var name = normalizeText_(attachment && attachment.name);
    var mimeType = normalizeText_(attachment && attachment.mimeType) || 'application/octet-stream';
    var dataBase64 = normalizeText_(attachment && attachment.dataBase64);
    if (!name || !dataBase64) return null;
    if (dataBase64.length > 9 * 1024 * 1024) throw new Error('Attachment too large');
    return Utilities.newBlob(Utilities.base64Decode(dataBase64), mimeType, name);
  }).filter(Boolean);
}

function recordMonStageSubmission_(spreadsheet, offerId, company, provider, reference) {
  var eventSheet = getEventSheet_(spreadsheet);
  var now = new Date();
  var definition = {
    type: 'submitted',
    confidence: 1,
    status: 'Candidature envoyée',
    action: 'Préparer la relance et l’entretien'
  };
  var event = {
    id: 'monstage:' + offerId + ':' + now.getTime(),
    offerId: offerId,
    company: company,
    type: 'submitted',
    confidence: 1,
    source: 'monstage',
    detectedAt: now.toISOString(),
    evidence: 'Submitted directly by MonStage via ' + provider + (reference ? ' · reference=' + reference : '') + '.'
  };
  appendApplicationEvent_(eventSheet, event);
  applyDetectedStatus_(spreadsheet, offerId, definition, event.detectedAt);
}


function parseLeverPosting_(url) {
  var match = String(url || '').match(/^https:\/\/jobs(\.eu)?\.lever\.co\/([^/?#]+)\/([^/?#]+)/i);
  if (!match) return null;
  return {
    eu: !!match[1],
    site: decodeURIComponent(match[2]),
    postingId: decodeURIComponent(match[3])
  };
}

function submitLeverApplication_(application) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('LEVER_API_KEY');
  if (!apiKey) return { status: 409, payload: { submitted: false, provider: 'lever', reference: null, error: 'EMPLOYER_INTEGRATION_REQUIRED', message: 'Lever API access is not configured for this employer.' } };

  var posting = parseLeverPosting_(application.applicationUrl);
  if (!posting) return { status: 400, payload: { submitted: false, provider: 'lever', reference: null, error: 'INVALID_LEVER_URL', message: 'Unable to identify this Lever posting.' } };

  var fullName = ((application.firstName || '') + ' ' + (application.lastName || '')).trim();
  var payload = {
    name: fullName,
    email: application.authenticatedEmail || application.email,
    phone: application.phone || '',
    comments: application.message || '',
    source: 'MonStage',
    silent: false
  };

  var attachments = buildAttachmentBlobs_(application.attachments);
  if (attachments.length) payload.resume = attachments[0];

  var base = posting.eu ? 'https://api.eu.lever.co' : 'https://api.lever.co';
  var endpoint = base + '/v0/postings/' + encodeURIComponent(posting.site) + '/' + encodeURIComponent(posting.postingId) + '?key=' + encodeURIComponent(apiKey);
  var response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  if (status >= 200 && status < 300) {
    return { status: 200, payload: { submitted: true, provider: 'lever', reference: posting.postingId, message: 'Application submitted to Lever from MonStage.' } };
  }

  if (status === 429) return { status: 429, payload: { submitted: false, provider: 'lever', reference: null, error: 'RATE_LIMITED', message: 'Lever rate limit reached. Retry later from MonStage.' } };
  return { status: 409, payload: { submitted: false, provider: 'lever', reference: null, error: 'LEVER_REJECTED', message: 'Lever requires additional employer-specific fields or authorization for this role.' } };
}

function parseSmartRecruitersPosting_(url) {
  var text = String(url || '');
  var uuid = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  return uuid ? uuid[0] : null;
}

function submitSmartRecruitersApplication_(application) {
  var token = PropertiesService.getScriptProperties().getProperty('SMARTRECRUITERS_TOKEN');
  if (!token) return { status: 409, payload: { submitted: false, provider: 'smartrecruiters', reference: null, error: 'EMPLOYER_INTEGRATION_REQUIRED', message: 'SmartRecruiters OAuth access is not configured for this employer.' } };

  var postingId = parseSmartRecruitersPosting_(application.applicationUrl);
  if (!postingId) return { status: 400, payload: { submitted: false, provider: 'smartrecruiters', reference: null, error: 'INVALID_SMARTRECRUITERS_URL', message: 'Unable to identify this SmartRecruiters posting.' } };

  var endpoint = 'https://api.smartrecruiters.com/postings/' + postingId + '/candidates';
  var body = {
    firstName: application.firstName || '',
    lastName: application.lastName || '',
    email: application.authenticatedEmail || application.email,
    phoneNumber: application.phone || '',
    messageToHiringManager: application.message || '',
    conditionalsIncluded: true
  };

  var response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  if (status >= 200 && status < 300) {
    var parsed = {};
    try { parsed = JSON.parse(response.getContentText() || '{}'); } catch (error) {}
    return { status: 200, payload: { submitted: true, provider: 'smartrecruiters', reference: parsed.id || postingId, message: 'Application submitted to SmartRecruiters from MonStage.' } };
  }

  if (status === 429) return { status: 429, payload: { submitted: false, provider: 'smartrecruiters', reference: null, error: 'RATE_LIMITED', message: 'SmartRecruiters rate limit reached. Retry later from MonStage.' } };
  if (status === 400) return { status: 409, payload: { submitted: false, provider: 'smartrecruiters', reference: null, error: 'SCREENING_REQUIRED', message: 'This role requires employer-specific screening or consent answers. Complete them in the integrated application browser.' } };
  return { status: 409, payload: { submitted: false, provider: 'smartrecruiters', reference: null, error: 'SMARTRECRUITERS_REJECTED', message: 'SmartRecruiters did not accept the direct submission for this role.' } };
}

function submitApplication_(application) {
  application = application || {};
  var provider = normalizeText_(application.provider) || 'generic';
  var applicationUrl = normalizeText_(application.applicationUrl);
  var offerId = normalizeText_(application.offerId);
  var company = normalizeText_(application.company) || '';
  var title = normalizeText_(application.title) || 'Internship application';
  var firstName = normalizeText_(application.firstName) || '';
  var lastName = normalizeText_(application.lastName) || '';
  var email = normalizeText_(application.authenticatedEmail) || normalizeText_(application.email);
  var phone = normalizeText_(application.phone) || '';
  var location = normalizeText_(application.location) || '';
  var message = normalizeText_(application.message) || '';
  var consent = application.consent === true;

  if (!offerId || !applicationUrl || !email || !consent) {
    return { status: 400, payload: { error: 'INVALID_APPLICATION', message: 'Missing required application data.' } };
  }

  if (provider === 'email' || String(applicationUrl).toLowerCase().indexOf('mailto:') === 0) {
    var recipient = parseMailtoRecipient_(applicationUrl);
    if (!recipient) {
      return { status: 400, payload: { error: 'INVALID_APPLICATION_EMAIL', message: 'Application email is invalid.' } };
    }

    var fullName = (firstName + ' ' + lastName).trim();
    var subject = 'Application — ' + title + (fullName ? ' — ' + fullName : '');
    var body = [
      'Hello,',
      '',
      message || ('Please find my application for the position "' + title + '".'),
      '',
      fullName ? 'Candidate: ' + fullName : null,
      'Email: ' + email,
      phone ? 'Phone: ' + phone : null,
      location ? 'Location: ' + location : null
    ].filter(function (line) { return line !== null; }).join('\n');

    var options = {
      name: fullName || 'MonStage candidate',
      replyTo: email
    };
    var blobs = buildAttachmentBlobs_(application.attachments);
    if (blobs.length) options.attachments = blobs;

    GmailApp.sendEmail(recipient, subject, body, options);

    var spreadsheet = getSpreadsheet_();
    recordMonStageSubmission_(spreadsheet, offerId, company, 'email', recipient);
    return {
      status: 200,
      payload: {
        submitted: true,
        provider: 'email',
        reference: recipient,
        message: 'Application sent from MonStage.'
      }
    };
  }

  if (provider === 'lever') {
    var leverResult = submitLeverApplication_(application);
    if (leverResult.payload && leverResult.payload.submitted) {
      recordMonStageSubmission_(getSpreadsheet_(), offerId, company, 'lever', leverResult.payload.reference);
    }
    return leverResult;
  }

  if (provider === 'smartrecruiters') {
    var smartResult = submitSmartRecruitersApplication_(application);
    if (smartResult.payload && smartResult.payload.submitted) {
      recordMonStageSubmission_(getSpreadsheet_(), offerId, company, 'smartrecruiters', smartResult.payload.reference);
    }
    return smartResult;
  }

  if (provider === 'greenhouse') {
    return {
      status: 409,
      payload: {
        submitted: false,
        provider: 'greenhouse',
        reference: null,
        error: 'EMPLOYER_INTEGRATION_REQUIRED',
        message: 'Greenhouse requires employer-side recruiting integration access for direct candidate submission.'
      }
    };
  }

  return {
    status: 409,
    payload: {
      submitted: false,
      provider: provider,
      reference: null,
      error: 'IN_APP_BROWSER_REQUIRED',
      message: 'Direct API submission is unavailable for this employer. Continue in the integrated MonStage application browser.'
    }
  };
}

function addExternalApplication_(application) {
  application = application || {};
  var company = normalizeText_(application.company);
  var title = normalizeText_(application.title);
  var city = normalizeText_(application.city);
  var applicationUrl = normalizeText_(application.applicationUrl);
  var appliedAt = normalizeText_(application.appliedAt);
  var applicationStatus = normalizeText_(application.applicationStatus) || 'Candidature envoyée';
  var nextAction = normalizeText_(application.nextAction) || 'Préparer la relance et l’entretien';
  var domain = normalizeText_(application.domain);
  var specialization = normalizeText_(application.specialization);

  if (!company || !title || !appliedAt) {
    return { status: 400, payload: { error: 'INVALID_EXTERNAL_APPLICATION', message: 'Company, job title and application date are required.' } };
  }

  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName('Offres');
  if (!sheet) {
    return { status: 500, payload: { error: 'OFFERS_SHEET_NOT_FOUND', message: 'Offres sheet not found.' } };
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var headerMap = buildHeaderMap_(headers);
  var row = new Array(headers.length).fill('');
  var offerId = 'EXT-' + new Date().getTime() + '-' + Utilities.getUuid().slice(0, 8);

  function setValue_(header, value) {
    var index = headerMap[header];
    if (index !== undefined && value !== null && value !== undefined) row[index] = value;
  }

  setValue_('ID', offerId);
  setValue_('Entreprise', company);
  setValue_("Intitulé de l'offre", title);
  setValue_('Ville', city || '');
  setValue_('Domaine', domain || '');
  setValue_('Famille cible', specialization || '');
  setValue_("Statut de l'offre", 'Ouverte');
  setValue_('Statut candidature', applicationStatus);
  setValue_('Date candidature', appliedAt);
  setValue_('Prochaine action', nextAction);
  setValue_('Lien direct', applicationUrl || '');
  setValue_('Qualité source', 'External');
  setValue_('Vérifié le', new Date());

  var followUp = parseApplicationDate_(appliedAt);
  if (followUp) {
    followUp.setDate(followUp.getDate() + 7);
    setValue_('Relance prévue', followUp);
  }

  sheet.appendRow(row);

  var eventSheet = getEventSheet_(spreadsheet);
  appendApplicationEvent_(eventSheet, {
    id: 'external:' + offerId,
    offerId: offerId,
    company: company,
    type: 'submitted',
    confidence: 1,
    source: 'external',
    detectedAt: new Date().toISOString(),
    evidence: 'Application manually added to MonStage after being submitted outside MonStage.'
  });

  return {
    status: 201,
    payload: {
      created: true,
      offerId: offerId,
      message: 'External application added to MonStage.'
    }
  };
}



function externalSourceDiagnostics_() {
  var properties = PropertiesService.getScriptProperties();
  return {
    lever: Number(properties.getProperty('LEVER_LAST_COUNT') || 0),
    greenhouse: Number(properties.getProperty('GREENHOUSE_LAST_COUNT') || 0),
    ashby: Number(properties.getProperty('ASHBY_LAST_COUNT') || 0),
    smartRecruiters: Number(properties.getProperty('SMARTRECRUITERS_LAST_COUNT') || 0),
    workday: Number(properties.getProperty('WORKDAY_LAST_COUNT') || 0),
    leverLastSync: properties.getProperty('LEVER_LAST_SYNC'),
    greenhouseLastSync: properties.getProperty('GREENHOUSE_LAST_SYNC'),
    ashbyLastSync: properties.getProperty('ASHBY_LAST_SYNC'),
    smartRecruitersLastSync: properties.getProperty('SMARTRECRUITERS_LAST_SYNC'),
    workdayLastSync: properties.getProperty('WORKDAY_LAST_SYNC')
  };
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
      return jsonOutput_({ error: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    var body = parseRequestBody_(e);
    var action = normalizeText_(body.action) || 'offers';

    if (action === 'submitApplication') {
      var result = submitApplication_(body.application || {});
      var responsePayload = result.payload || {};
      responsePayload.status = result.status;
      return jsonOutput_(responsePayload);
    }

    if (action === 'addExternalApplication') {
      var externalResult = addExternalApplication_(body.application || {});
      var externalPayload = externalResult.payload || {};
      externalPayload.status = externalResult.status;
      return jsonOutput_(externalPayload);
    }

    if (action === 'syncExternalSources') {
      return jsonOutput_({
        source: 'Stage Intelligence France',
        sync: syncExternalOfferSources()
      });
    }

    var offers = getOffers_();
    return jsonOutput_({
      generatedAt: new Date().toISOString(),
      source: 'Stage Intelligence France',
      autonomyLastSync: PropertiesService.getScriptProperties().getProperty('AUTONOMY_LAST_SYNC'),
      sourceDiagnostics: externalSourceDiagnostics_(),
      offers: offers
    });
  } catch (error) {
    console.error('MonStage backend error');
    return jsonOutput_({
      error: 'MONSTAGE_API_ERROR',
      message: 'Unable to process request'
    });
  }
}
