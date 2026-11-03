import type { ProjectAction } from './types';

export const actions1to20: ProjectAction[] = [
  {
    "id": "a01",
    "title": "Transformer la demande orale en engagement vérifiable",
    "request": "« Je veux savoir ce que nous coûte la maintenance et pourquoi les machines s’arrêtent. Peux-tu fiabiliser le dossier avant vendredi ? » Reformule ce que tu peux effectivement livrer avec les fichiers disponibles.",
    "expectedDeliverable": "cadrage.md : décision attendue, période, trois indicateurs provisoires, questions ouvertes et limite des données synthétiques.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026."
    ],
    "reasoning": [
      {
        "title": "Partir de la décision",
        "explanation": "Le responsable veut choisir où investiguer. Un coût total sans période, statut ni unité ne permet aucune décision."
      },
      {
        "title": "Rendre l’incertitude visible",
        "explanation": "Ne promets ni perte de production ni causalité : aucun fichier de production n’a été fourni."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from pathlib import Path\ntext = '''# Dossier maintenance — données synthétiques\nDécision : sélectionner les équipements à examiner après fiabilisation.\nPériode proposée : janvier à juin 2026, UTC.\nPremier bilan : coûts connus EUR et arrêts connus minutes des interventions closed, encours séparé.\nÀ confirmer : mois d’imputation (ouverture ou clôture), périmètre sites, destinataire.\nLimite : pas de preuve de perte de production ni de causalité.\n'''\nPath('cadrage.md').write_text(text, encoding='utf-8')",
      "explanation": [
        "Écris une proposition que le responsable peut corriger, pas un objectif vague.",
        "Le choix du mois d’ouverture est provisoire ; conserve la question dans le cadrage."
      ],
      "expected": "Un cadrage lisible qui distingue engagement et hypothèses."
    },
    "yourTurn": {
      "instruction": "Ajoute le format de remise et une question qui pourrait modifier le total mensuel.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "La décision est formulée en une phrase.",
        "Les trois statuts closed/open/cancelled sont nommés.",
        "Le mois d’imputation est explicitement à valider."
      ]
    },
    "solution": {
      "steps": [
        "Reprends la demande en une décision.",
        "Liste les informations disponibles et absentes.",
        "Soumets trois questions ciblées et conserve leurs réponses."
      ],
      "language": "python",
      "code": "from pathlib import Path\np = Path('cadrage.md')\nassert p.exists()\nwith p.open('a', encoding='utf-8') as f:\n    f.write('\\nRemise : fichier mensuel et note de contrôle.\\nQuestion : faut-il imputer au mois d’ouverture ou de clôture ?\\nValidation du responsable : en attente.\\n')",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "La décision est formulée en une phrase.",
        "Les trois statuts closed/open/cancelled sont nommés.",
        "Le mois d’imputation est explicitement à valider."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le responsable demande un taux de panne.",
        "cause": "Le dénominateur n’est pas défini.",
        "fix": "Demande population, exposition et événement retenu avant de calculer."
      },
      {
        "symptom": "Deux personnes donnent des périmètres différents.",
        "cause": "La demande n’a pas de propriétaire décisionnaire.",
        "fix": "Consigne les deux versions et fais arbitrer le responsable."
      }
    ],
    "managerQuestions": [
      {
        "question": "Que peux-tu promettre vendredi ?",
        "expected": "Un dossier contrôlé et un bilan descriptif sur un périmètre signé."
      },
      {
        "question": "Pourquoi ne pas annoncer une économie ?",
        "expected": "Les fichiers ne mesurent ni effet d’une action ni scénario contrefactuel."
      }
    ],
    "changeRequest": "Le responsable veut finalement un premier bilan de juin uniquement : précise ce qui change et conserve janvier à mai pour comparaison.",
    "reference": [
      {
        "title": "Python — pathlib",
        "url": "https://docs.python.org/3/library/pathlib.html",
        "when": "Pour conserver un cadrage versionnable à côté des fichiers."
      }
    ]
  },
  {
    "id": "a02",
    "title": "Fixer le grain, les unités et le calendrier",
    "request": "« Avant de sommer quoi que ce soit, montre-moi ce que représente une ligne et ce qu’un blanc signifie. »",
    "expectedDeliverable": "contrat_donnees.json, avec clés, grains, unités et règles de statut.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Protéger le dénominateur",
        "explanation": "planned_hours contient une ligne équipement-mois ; la joindre directement aux interventions multiplierait l’exposition."
      },
      {
        "title": "Préserver les inconnus",
        "explanation": "Une durée manquante sur open n’est pas une durée nulle ; cancelled porte zéro dans le générateur."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nmeta = json.loads(Path('data/dictionary.json').read_text(encoding='utf-8'))\nprint(json.dumps(meta, ensure_ascii=False, indent=2))",
      "explanation": [
        "Les dates ont un décalage UTC explicite.",
        "downtime_min se convertit en heures en divisant par 60 ; repair_cost_eur reste en EUR."
      ],
      "expected": "Quatre grains documentés, dont la table sale au même grain attendu que les interventions."
    },
    "yourTurn": {
      "instruction": "Écris le contrat et choisis provisoirement le mois d’ouverture pour le bilan.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Clé intervention_id explicitée.",
        "Clé composée asset_id/month explicitée.",
        "Blanc des open conservé comme inconnu."
      ]
    },
    "solution": {
      "steps": [
        "Lis le dictionnaire généré.",
        "Ajoute la convention d’imputation.",
        "Décris les exclusions et fais valider le contrat."
      ],
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nm = json.loads(Path('data/dictionary.json').read_text(encoding='utf-8'))\nm['reporting'] = {'month_basis':'opened_at UTC', 'actual_status':'closed', 'open':'separate count; unknown cost/downtime', 'cancelled':'separate count'}\nPath('contrat_donnees.json').write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding='utf-8')",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Clé intervention_id explicitée.",
        "Clé composée asset_id/month explicitée.",
        "Blanc des open conservé comme inconnu."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Un arrêt paraît 60 fois trop grand.",
        "cause": "Minutes présentées comme heures.",
        "fix": "Affiche l’unité dans le nom de chaque mesure."
      },
      {
        "symptom": "Le coût moyen baisse avec les encours.",
        "cause": "Les blancs ont été remplacés par zéro.",
        "fix": "Calcule sur les valeurs connues et publie le nombre exclu."
      }
    ],
    "managerQuestions": [
      {
        "question": "Peut-on sommer planned_hours après toute jointure ?",
        "expected": "Seulement après contrôle du grain équipement-mois."
      },
      {
        "question": "Que signifie le mois ?",
        "expected": "Le mois UTC d’ouverture selon la convention proposée."
      }
    ],
    "changeRequest": "Le responsable préfère les heures dans la note : ajoute une mesure dérivée et garde les minutes sources.",
    "reference": [
      {
        "title": "pandas — lecture CSV",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html",
        "when": "Pour comprendre les types et les valeurs manquantes des fichiers reçus."
      }
    ]
  },
  {
    "id": "a03",
    "title": "Recevoir un lot reproductible et tracer ses fichiers",
    "request": "« Je t’envoie le premier lot. Prouve que tu sais identifier exactement ce que tu as analysé. »",
    "expectedDeliverable": "inventaire_reception.csv : nom, taille, SHA-256 et date UTC de réception.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026."
    ],
    "reasoning": [
      {
        "title": "Séparer reçu et corrigé",
        "explanation": "Le générateur fournit une référence propre et une copie volontairement sale. Ne remplace jamais silencieusement un fichier reçu."
      },
      {
        "title": "Identifier le lot",
        "explanation": "Une empreinte permet de distinguer une modification du fichier d’un changement de calcul."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from pathlib import Path\nimport hashlib\nfor p in sorted(Path('data').glob('*')):\n    print(p.name, p.stat().st_size, hashlib.sha256(p.read_bytes()).hexdigest())",
      "explanation": [
        "Lance d’abord python starter_data_analysis.py --output data.",
        "Ne relance pas le générateur après une correction manuelle : il écrase les fichiers du dossier cible."
      ],
      "expected": "Six fichiers reçus : quatre CSV, atelier.db et dictionary.json."
    },
    "yourTurn": {
      "instruction": "Produis un inventaire horodaté ; précise que la base contient les tables propres seulement.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Chaque fichier a une empreinte de 64 caractères.",
        "Le CSV sale et le CSV propre ont des empreintes distinctes.",
        "Aucun fichier reçu n’est modifié."
      ]
    },
    "solution": {
      "steps": [
        "Génère le lot une seule fois.",
        "Calcule taille et empreinte sur les octets.",
        "Conserve le manifeste avec le cadrage."
      ],
      "language": "python",
      "code": "from pathlib import Path\nimport csv, hashlib\nfrom datetime import datetime, timezone\nwith open('inventaire_reception.csv','w',newline='',encoding='utf-8') as f:\n    w=csv.writer(f); w.writerow(['file','bytes','sha256','received_utc'])\n    stamp=datetime.now(timezone.utc).isoformat()\n    for p in sorted(Path('data').glob('*')):\n        w.writerow([p.name,p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest(),stamp])",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Chaque fichier a une empreinte de 64 caractères.",
        "Le CSV sale et le CSV propre ont des empreintes distinctes.",
        "Aucun fichier reçu n’est modifié."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le dossier data est vide.",
        "cause": "La génération n’a pas été exécutée dans ce dossier de travail.",
        "fix": "Vérifie le répertoire courant et exécute la commande initiale."
      },
      {
        "symptom": "L’empreinte change après ouverture Excel.",
        "cause": "Le CSV a été réenregistré.",
        "fix": "Conserve une copie de travail et reprends le fichier reçu original."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi deux fichiers interventions ?",
        "expected": "Un reçu sale à auditer et une référence propre synthétique distincte."
      },
      {
        "question": "Que garantit une empreinte ?",
        "expected": "L’identité des octets, pas la qualité métier."
      }
    ],
    "changeRequest": "Un deuxième lot arrive : inventorie-le dans un autre dossier sans écraser le premier.",
    "reference": [
      {
        "title": "Python — hashlib",
        "url": "https://docs.python.org/3/library/hashlib.html",
        "when": "Pour identifier les fichiers reçus sans les altérer."
      }
    ]
  },
  {
    "id": "a04",
    "title": "Inspecter le reçu sale avant toute conversion",
    "request": "« Ouvre le fichier reçu et dis-moi quelles colonnes peuvent tromper le bilan. »",
    "expectedDeliverable": "profil_recu.csv avec type brut, blancs et exemples par colonne.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Voir le brut",
        "explanation": "Le coût localisé 1 200,50 rend une colonne numérique hétérogène."
      },
      {
        "title": "Distinguer structure et métier",
        "explanation": "Un type texte n’est pas à lui seul une erreur ; son interprétation doit être contrôlée."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "import pandas as pd\ndf = pd.read_csv('data/interventions_dirty.csv', dtype=str, keep_default_na=False)\nprint(df.shape)\nprint(df.head(6).to_string(index=False))\nprint(df.eq('').sum())",
      "explanation": [
        "dtype=str préserve la représentation reçue ; keep_default_na=False garde les blancs comme chaînes vides.",
        "Le profil ne remplace pas les contrôles de clés et de domaines."
      ],
      "expected": "217 lignes brutes et huit colonnes ; le coût localisé et la durée négative sont visibles."
    },
    "yourTurn": {
      "instruction": "Livre un profil sans nettoyer les données et propose l’ordre des contrôles.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "217 lignes reçues.",
        "Les huit colonnes sont présentes.",
        "Le texte 1 200,50 reste visible."
      ]
    },
    "solution": {
      "steps": [
        "Lis toutes les valeurs comme texte.",
        "Compte les blancs par colonne.",
        "Export un profil et liste les conversions à tester."
      ],
      "language": "python",
      "code": "import pandas as pd\ndf=pd.read_csv('data/interventions_dirty.csv',dtype=str,keep_default_na=False)\nprofile=pd.DataFrame({'column':df.columns,'dtype':[str(df[c].dtype) for c in df], 'blank':[int(df[c].eq('').sum()) for c in df], 'example':[' | '.join(df[c].drop_duplicates().head(4)) for c in df]})\nprofile.to_csv('profil_recu.csv',index=False)\nprint(profile.to_string(index=False))",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "217 lignes reçues.",
        "Les huit colonnes sont présentes.",
        "Le texte 1 200,50 reste visible."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Tout apparaît dans une seule colonne.",
        "cause": "Le séparateur d’import est incorrect.",
        "fix": "Choisis la virgule comme séparateur ; conserve le point décimal source."
      },
      {
        "symptom": "Des blancs semblent avoir disparu.",
        "cause": "Une conversion automatique les a interprétés.",
        "fix": "Relis en texte avec keep_default_na=False pour auditer le brut."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi lire deux fois les données ?",
        "expected": "Une lecture brute révèle le reçu ; une lecture typée sert ensuite au calcul."
      },
      {
        "question": "Peut-on sommer cette colonne de coût ?",
        "expected": "Après conversion explicite et contrôle des échecs seulement."
      }
    ],
    "changeRequest": "Le responsable demande une capture des six premières lignes : annote les anomalies sans exposer de résultat comme réel.",
    "reference": [
      {
        "title": "pandas — lecture CSV",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html",
        "when": "Pour comprendre les types et les valeurs manquantes des fichiers reçus."
      }
    ]
  },
  {
    "id": "a05",
    "title": "Quantifier les doublons sans effacer une intervention",
    "request": "« Mon nombre d’interventions est-il gonflé ? Montre les lignes concernées avant suppression. »",
    "expectedDeliverable": "doublons.csv et note expliquant doublon exact versus conflit de clé.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Clé avant total",
        "explanation": "Deux lignes partageant une clé peuvent être identiques ou contradictoires ; le traitement diffère."
      },
      {
        "title": "Conserver la preuve",
        "explanation": "La suppression doit être justifiée par une comparaison de toutes les colonnes."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\ndf=data['interventions_dirty']\ndup=df[df.duplicated('intervention_id',keep=False)]\nprint(dup.to_string(index=False))\nprint('lignes',len(df),'clés',df.intervention_id.nunique(),'copies exactes',df.duplicated().sum())",
      "explanation": [
        "keep=False affiche les deux occurrences, pas seulement celle qu’on supprimerait.",
        "Le lot contient une copie exacte de I0001."
      ],
      "expected": "217 lignes, 216 clés uniques, une copie exacte excédentaire."
    },
    "yourTurn": {
      "instruction": "Exporte les doublons et rédige une règle qui bloque les conflits de clé.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Deux lignes figurent dans le fichier de preuve.",
        "Une seule copie exacte est excédentaire.",
        "Une divergence entre deux lignes de même clé serait bloquante."
      ]
    },
    "solution": {
      "steps": [
        "Isole toutes les clés répétées.",
        "Compare les lignes complètes.",
        "Déduplique une copie et vérifie le nombre de clés."
      ],
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\ndf=data['interventions_dirty']\ndup=df[df.duplicated('intervention_id',keep=False)]\ndup.to_csv('doublons.csv',index=False)\nunique=df.drop_duplicates()\nassert not unique.intervention_id.duplicated().any(), 'Conflit de clé à arbitrer'\nassert len(unique)==216\nprint(len(df)-len(unique))",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Deux lignes figurent dans le fichier de preuve.",
        "Une seule copie exacte est excédentaire.",
        "Une divergence entre deux lignes de même clé serait bloquante."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le nombre de copies semble égal à deux.",
        "cause": "Toutes les occurrences ont été comptées.",
        "fix": "Distingue lignes impliquées et copies excédentaires."
      },
      {
        "symptom": "drop_duplicates sur la clé masque une divergence.",
        "cause": "Une ligne arbitraire a été gardée.",
        "fix": "Compare toutes les colonnes et demande au propriétaire la version correcte."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi ne pas garder simplement la dernière ?",
        "expected": "Aucun horodatage de version ne prouve qu’elle fait autorité."
      },
      {
        "question": "Le coût baisse après dédoublonnage : est-ce une économie ?",
        "expected": "Non, correction d’un double comptage."
      }
    ],
    "changeRequest": "Une prochaine livraison contient deux coûts différents pour la même clé : adapte ta règle pour bloquer le lot.",
    "reference": [
      {
        "title": "pandas — duplicated",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.duplicated.html",
        "when": "Pour distinguer toutes les occurrences et les copies excédentaires."
      }
    ]
  },
  {
    "id": "a06",
    "title": "Mesurer les blancs selon le statut",
    "request": "« Ces cases vides sont-elles des oublis ou des travaux en cours ? Donne les comptes par statut. »",
    "expectedDeliverable": "manquants_par_statut.csv et liste des closed incomplets.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Interpréter le blanc",
        "explanation": "Un open incomplet est attendu ; un closed sans durée compromet le bilan réalisé."
      },
      {
        "title": "Compter avant exclure",
        "explanation": "Un total calculé sur un sous-ensemble doit annoncer combien de lignes sont incomplètes."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\ndf=data['interventions_dirty'].drop_duplicates()\nfor c in ['downtime_min','repair_cost_eur','closed_at']:\n    print(c,df[c].isna().groupby(df.status).sum().to_dict())\nprint(df.loc[df.status.eq('closed') & df.downtime_min.isna(),'intervention_id'].tolist())",
      "explanation": [
        "La lecture pandas traduit les champs vides en NaN.",
        "Ne remplis pas globalement les NaN avec zéro."
      ],
      "expected": "Une intervention closed sans durée est signalée ; les open restent séparées."
    },
    "yourTurn": {
      "instruction": "Construis le tableau de complétude par statut et indique ce qui bloque la publication.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "I0005 est identifiée comme closed sans durée.",
        "Les open ne sont pas requalifiées en zéro.",
        "Les comptes sont calculés après retrait de la copie exacte."
      ]
    },
    "solution": {
      "steps": [
        "Déduplique les copies exactes.",
        "Compte les manquants par statut et champ.",
        "Export les closed incomplets pour correction propriétaire."
      ],
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\ndf=data['interventions_dirty'].drop_duplicates()\ncols=['downtime_min','repair_cost_eur','closed_at']\nreport=df[cols].isna().groupby(df.status).sum()\nreport.to_csv('manquants_par_statut.csv')\nbad=df[df.status.eq('closed') & df[cols].isna().any(axis=1)]\nbad.to_csv('closed_incomplets.csv',index=False)\nassert 'I0005' in set(bad.intervention_id)",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "I0005 est identifiée comme closed sans durée.",
        "Les open ne sont pas requalifiées en zéro.",
        "Les comptes sont calculés après retrait de la copie exacte."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Tous les manquants sont déclarés erreurs.",
        "cause": "Le statut a été ignoré.",
        "fix": "Applique la règle closed complet, open inconnu."
      },
      {
        "symptom": "Le tableau de compte est vide.",
        "cause": "Les blancs sont des chaînes et non NaN.",
        "fix": "Utilise le lecteur standard du starter ou teste explicitement les chaînes vides."
      }
    ],
    "managerQuestions": [
      {
        "question": "Peut-on publier un total connu ?",
        "expected": "Oui avec couverture et avertissement ; pas comme total complet du réalisé."
      },
      {
        "question": "Quelle correction demander ?",
        "expected": "La durée de I0005 et sa preuve source, pas une moyenne imputée sans accord."
      }
    ],
    "changeRequest": "Le responsable veut un indicateur de couverture : donne nombre de closed complets / nombre de closed.",
    "reference": [
      {
        "title": "pandas — lecture CSV",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html",
        "when": "Pour comprendre les types et les valeurs manquantes des fichiers reçus."
      }
    ]
  },
  {
    "id": "a07",
    "title": "Contrôler les équipements et les valeurs impossibles",
    "request": "« Je veux la liste des références inconnues et des montants ou durées à faire corriger. »",
    "expectedDeliverable": "anomalies_domaines.csv, une ligne par intervention et motif.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Contrôler le rattachement",
        "explanation": "UNKNOWN n’a pas de site fiable ; une jointure interne ferait disparaître cette intervention."
      },
      {
        "title": "Qualifier les conversions",
        "explanation": "1 200,50 peut être normalisé techniquement mais son montant métier doit être confirmé."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\nimport pandas as pd\ndf=data['interventions_dirty'].drop_duplicates().copy()\ncost=pd.to_numeric(df.repair_cost_eur.astype('string').str.replace(' ','',regex=False).str.replace(',','.',regex=False),errors='coerce')\nprint('équipements inconnus',df.loc[~df.asset_id.isin(data['assets'].asset_id),'intervention_id'].tolist())\nprint('durées négatives',df.loc[pd.to_numeric(df.downtime_min,errors='coerce').lt(0),'intervention_id'].tolist())\nprint('coût normalisé I0004',cost[df.intervention_id.eq('I0004')].tolist())",
      "explanation": [
        "Le contrôle des clés se fait avant toute jointure qui pourrait écarter les lignes.",
        "La normalisation des séparateurs ne valide pas le coût au regard d’une facture."
      ],
      "expected": "I0002 sans équipement reconnu, I0003 avec -5 minutes et I0004 avec coût localisé."
    },
    "yourTurn": {
      "instruction": "Écris les trois alertes et ajoute une règle sur les statuts autorisés.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "UNKNOWN est remonté.",
        "La valeur négative est remontée.",
        "Le coût localisé reste tracé comme conversion à confirmer."
      ]
    },
    "solution": {
      "steps": [
        "Compare les clés au référentiel.",
        "Teste les domaines numériques et les statuts.",
        "Exporte les motifs sans inventer de remplacement."
      ],
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\nimport pandas as pd\ndf=data['interventions_dirty'].drop_duplicates()\nflags={'asset_inconnu':~df.asset_id.isin(data['assets'].asset_id),'duree_negative':pd.to_numeric(df.downtime_min,errors='coerce').lt(0),'cout_localise':df.repair_cost_eur.astype('string').str.contains(',',na=False),'statut_inconnu':~df.status.isin(['closed','open','cancelled'])}\nout=[{'intervention_id':r.intervention_id,'motif':name} for name,mask in flags.items() for r in df[mask].itertuples()]\npd.DataFrame(out,columns=['intervention_id','motif']).to_csv('anomalies_domaines.csv',index=False)\nprint(out)",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "UNKNOWN est remonté.",
        "La valeur négative est remontée.",
        "Le coût localisé reste tracé comme conversion à confirmer."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "UNKNOWN disparaît après jointure.",
        "cause": "Une jointure interne a filtré les orphelins.",
        "fix": "Fais une jointure gauche avec indicateur."
      },
      {
        "symptom": "La virgule est supprimée et le coût devient 120050.",
        "cause": "Séparateur décimal traité comme séparateur de milliers.",
        "fix": "Supprime les espaces puis remplace la virgule par un point."
      }
    ],
    "managerQuestions": [
      {
        "question": "Peut-on deviner l’équipement de I0002 ?",
        "expected": "Non ; le propriétaire doit confirmer la clé."
      },
      {
        "question": "Un coût parsable est-il fiable ?",
        "expected": "Non ; vérifie aussi domaine, unité et justification source."
      }
    ],
    "changeRequest": "Ajoute une alerte pour toute clôture antérieure à l’ouverture, sans modifier le reçu.",
    "reference": [
      {
        "title": "pandas — to_numeric",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html",
        "when": "Pour détecter les échecs de conversion plutôt que les ignorer."
      }
    ]
  },
  {
    "id": "a08",
    "title": "Faire vérifier le reçu dans Excel",
    "request": "« Le chef d’équipe utilise Excel : prépare-lui une vue filtrable des interventions à vérifier et explique-lui les totaux. »",
    "expectedDeliverable": "Copie Excel du reçu avec filtre statut, contrôle des clés et somme visible documentée.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé.",
      "Excel disponible ; travaille sur une copie interventions_controle.xlsx, jamais sur le CSV reçu."
    ],
    "reasoning": [
      {
        "title": "Partager une preuve lisible",
        "explanation": "Un filtre permet au propriétaire de retrouver les anomalies dans le dossier."
      },
      {
        "title": "Choisir la bonne somme",
        "explanation": "SOMME ignore le filtre ; SOUS.TOTAL peut totaliser seulement les lignes visibles."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "text",
      "code": "Dans Excel français : Données > À partir d’un fichier texte/CSV ; choisir UTF-8 et virgule. Importer interventions_dirty.csv en conservant les identifiants et repair_cost_eur en texte pour l’audit.\nA1:H218 : intervention_id, asset_id, opened_at, closed_at, status, intervention_type, downtime_min, repair_cost_eur.\nSélectionner A1:H218 > Insertion > Tableau > cocher « Mon tableau comporte des en-têtes ». Nommer le tableau Recu.\nFiltrer E (status) = closed, puis G (downtime_min) < 0 ; retrouver I0003. Relever les clés avant de changer le filtre.\nPour un total numérique vérifiable, importer séparément le fichier PROPRE interventions.csv dans une feuille Reference, A1:H217 ; convertir G et H en nombres avec paramètres régionaux anglais (point décimal).\nReference!J1 : total minutes closed ; J2 =SOMME.SI(E2:E217;\"closed\";G2:G217)\nReference!K1 : minutes visibles ; K2 =SOUS.TOTAL(109;G2:G217)\nFiltrer Reference!E sur closed ; comparer J2 et K2. Enlever le filtre, expliquer pourquoi K2 peut changer.\nLes formules affichées ici sont en français ; une formule enregistrée par openpyxl doit être en anglais, par exemple =SUMIF(E2:E217,\"closed\",G2:G217) et =SUBTOTAL(109,G2:G217).",
      "explanation": [
        "La feuille Recu conserve les défauts ; Reference est une autre source, propre et synthétique, explicitement étiquetée.",
        "Le code 109 additionne les valeurs visibles ; les valeurs textuelles nécessitent une conversion contrôlée."
      ],
      "expected": "I0003 visible après filtre ; un total closed calculé sur la référence et des formules clairement étiquetées."
    },
    "yourTurn": {
      "instruction": "Livre le classeur et une capture des filtres avec une note sur SOMME versus SOUS.TOTAL.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Recu contient 217 lignes de données.",
        "La référence contient 216 lignes.",
        "Les coûts localisés ne sont pas silencieusement perdus dans une somme."
      ]
    },
    "solution": {
      "steps": [
        "Importe les deux sources dans des feuilles nommées et étiquetées.",
        "Applique les filtres et conserve les clés anormales.",
        "Réalise les sommes dans Reference et contrôle leur périmètre."
      ],
      "language": "text",
      "code": "1. Dans Recu, filtre status sur closed et downtime_min sur « inférieur à 0 » : I0003 doit rester visible.\n2. Enlève le filtre numérique puis filtre asset_id = UNKNOWN : I0002 doit rester visible.\n3. Dans Reference, vérifie =NBVAL(A2:A217) qui doit donner 216, puis utilise =SOMME.SI(E2:E217;\"closed\";G2:G217).\n4. Pose =SOUS.TOTAL(109;G2:G217), filtre closed, puis compare les minutes au total closed précédent.\n5. Enregistre en .xlsx, conserve les CSV sources et ajoute une feuille Notes avec source, période UTC et unités.\nSi un script openpyxl crée le classeur : écrire les fonctions en anglais avec virgules ; openpyxl ne recalcule pas, les valeurs apparaissent après ouverture/recalcul dans Excel.",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Recu contient 217 lignes de données.",
        "La référence contient 216 lignes.",
        "Les coûts localisés ne sont pas silencieusement perdus dans une somme."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La somme affiche zéro.",
        "cause": "Les durées ont été importées en texte.",
        "fix": "Convertis la colonne numérique dans la référence et contrôle le nombre de valeurs."
      },
      {
        "symptom": "Le total ne change pas avec le filtre.",
        "cause": "SOMME ou SOMME.SI ne dépend pas de la visibilité.",
        "fix": "Utilise SOUS.TOTAL(109;plage) pour la vue filtrée."
      }
    ],
    "managerQuestions": [
      {
        "question": "Quelle feuille justifie une correction ?",
        "expected": "Recu, car elle conserve les valeurs réellement reçues."
      },
      {
        "question": "Quelle somme remets-tu ?",
        "expected": "Une somme avec périmètre explicitement nommé et contrôlé contre la référence."
      }
    ],
    "changeRequest": "Le chef souhaite afficher uniquement les arrêts correctifs closed : adapte les filtres et nomme ce nouveau périmètre.",
    "reference": [
      {
        "title": "Microsoft — SOUS.TOTAL",
        "url": "https://support.microsoft.com/fr-fr/office/sous-total-fonction-7b027003-f060-4ade-9040-e478765b9939",
        "when": "Pour expliquer pourquoi un total visible change avec les filtres."
      }
    ]
  },
  {
    "id": "a09",
    "title": "Rattacher les sites et résumer le dossier dans Excel",
    "request": "« Ajoute le site aux interventions et fais un tableau par site et statut ; je veux voir les équipements non trouvés. »",
    "expectedDeliverable": "Classeur avec recherche du site, preuve UNKNOWN et tableau croisé sur la référence propre.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé.",
      "Classeur de a08 ; Excel avec RECHERCHEX, ou alternative INDEX/EQUIV."
    ],
    "reasoning": [
      {
        "title": "Ne pas masquer les non-trouvés",
        "explanation": "Un message NON TROUVÉ transforme une absence de référence en anomalie visible."
      },
      {
        "title": "Ne pas mélanger les sources",
        "explanation": "La vue sale sert à corriger ; le tableau de bilan utilise la référence propre en attendant les corrections validées."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "text",
      "code": "Importer assets.csv dans Equipements!A1:C13 : asset_id, site, asset_type.\nDans Recu!I1 écrire site ; I2 =RECHERCHEX(B2;Equipements!$A$2:$A$13;Equipements!$B$2:$B$13;\"NON TROUVÉ\") ; recopier jusqu’à I218.\nAlternative : =SIERREUR(INDEX(Equipements!$B$2:$B$13;EQUIV(B2;Equipements!$A$2:$A$13;0));\"NON TROUVÉ\").\nFiltrer I = NON TROUVÉ : I0002 est à transmettre au propriétaire.\nDans Reference!I1 écrire site ; recopier la même recherche sur I2:I217.\nSélectionner Reference!A1:I217 > Insertion > Tableau croisé dynamique > nouvelle feuille Bilan.\nLignes : site ; Colonnes : status ; Valeurs : nombre de intervention_id, somme de downtime_min, somme de repair_cost_eur.\nNe pas présenter les sommes open comme des zéros connus : inscrire « encours, coûts/durées inconnus » dans la note. Pour les montants réalisés, filtrer status = closed.\nFormules françaises à saisir dans Excel ; en fichier généré, utiliser INDEX/MATCH/IFERROR avec virgules. openpyxl ne calcule aucune formule avant ouverture dans Excel.",
      "explanation": [
        "Les références absolues $ empêchent la plage de recherche de glisser lors de la recopie.",
        "Un tableau croisé doit être actualisé après toute modification de sa source."
      ],
      "expected": "Un seul équipement non trouvé dans le reçu, aucun dans la référence ; un bilan par site contrôlable."
    },
    "yourTurn": {
      "instruction": "Remets le classeur, la liste des non-trouvés et une explication de la source du tableau croisé.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "I0002 porte NON TROUVÉ dans Recu.",
        "Aucune recherche ne renvoie NON TROUVÉ dans Reference.",
        "La somme des nombres par statut retrouve 216 interventions sur Reference."
      ]
    },
    "solution": {
      "steps": [
        "Ajoute le référentiel et les recherches avec plages absolues.",
        "Filtre les non-trouvés avant toute agrégation.",
        "Construis le tableau croisé, actualise et contrôle ses totaux."
      ],
      "language": "text",
      "code": "1. Vérifie que Equipements contient 12 clés distinctes, sans blanc.\n2. Applique INDEX/EQUIV avec correspondance exacte (0) et message NON TROUVÉ. Ne remplace pas ce message par un site deviné.\n3. Sépare la preuve de I0002 dans Recu du bilan de la feuille Reference.\n4. Dans le tableau croisé de Reference, contrôle le total du nombre de intervention_id : 216. Filtre closed avant d’annoncer les coûts réalisés.\n5. Compare somme de downtime_min avec Reference!J2 de a08 ; enregistre la source, les filtres et l’heure d’actualisation dans Notes.",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "I0002 porte NON TROUVÉ dans Recu.",
        "Aucune recherche ne renvoie NON TROUVÉ dans Reference.",
        "La somme des nombres par statut retrouve 216 interventions sur Reference."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Des sites incorrects apparaissent.",
        "cause": "EQUIV a utilisé une correspondance approximative.",
        "fix": "Ajoute 0 pour une correspondance exacte."
      },
      {
        "symptom": "Le tableau croisé ne montre pas la correction.",
        "cause": "Son cache n’a pas été actualisé.",
        "fix": "Données > Actualiser tout, puis contrôler la plage source."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi ne pas faire une recherche approximative ?",
        "expected": "Les identifiants sont des clés exactes, pas une échelle ordonnée."
      },
      {
        "question": "Un tableau croisé vide sur open vaut-il zéro coût ?",
        "expected": "Non : les valeurs sources sont inconnues et doivent rester signalées."
      }
    ],
    "changeRequest": "Le responsable veut le détail par type d’intervention sous chaque site : ajoute intervention_type dans les lignes et revérifie les totaux.",
    "reference": [
      {
        "title": "Microsoft — tableaux croisés dynamiques",
        "url": "https://support.microsoft.com/fr-fr/office/créer-un-tableau-croisé-dynamique-pour-analyser-des-données-de-feuille-de-calcul-a9a84538-bfe9-40a9-a8e9-f99134456576",
        "when": "Au moment de résumer les interventions dans Excel."
      },
      {
        "title": "Microsoft — RECHERCHEX",
        "url": "https://support.microsoft.com/fr-fr/office/fonction-recherchex-b7fd680e-6d10-43e6-84f9-88eae8bf5929",
        "when": "Pour rattacher un site tout en affichant les clés absentes."
      }
    ]
  },
  {
    "id": "a10",
    "title": "Demander les corrections et tenir le registre des rejets",
    "request": "« Prépare les questions pour le propriétaire des fichiers et dis-moi quand le dossier peut être accepté. »",
    "expectedDeliverable": "registre_rejets.csv et demande de correction prête à relire, sans envoi automatique.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé.",
      "Sorties a05 à a07 disponibles ; conserver les sources reçues."
    ],
    "reasoning": [
      {
        "title": "Attribuer la décision",
        "explanation": "Un analyste peut détecter un défaut, pas inventer la valeur métier correcte."
      },
      {
        "title": "Fermer avec une preuve",
        "explanation": "Chaque anomalie a un propriétaire, une décision et une référence de nouvelle livraison."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "import csv\nrows=[['I0001','copie exacte','confirmer suppression de la copie'],['I0002','asset UNKNOWN','fournir asset_id exact'],['I0003','durée -5','fournir durée en minutes'],['I0004','coût localisé','confirmer montant EUR et format'],['I0005','durée absente sur closed','fournir durée et preuve']]\nwith open('registre_rejets.csv','w',newline='',encoding='utf-8') as f:\n    w=csv.writer(f); w.writerow(['intervention_id','motif','correction_demandee','proprietaire','decision','preuve'])\n    for r in rows: w.writerow(r+['responsable source','en attente',''])",
      "explanation": [
        "Le registre est une liste d’anomalies, pas cinq interventions à supprimer.",
        "La référence propre du générateur sert à tester le traitement ; elle ne constitue pas une réponse réelle du propriétaire."
      ],
      "expected": "Cinq motifs tracés, aucun remplacement métier non autorisé."
    },
    "yourTurn": {
      "instruction": "Prépare une demande claire avec clés, défauts, format attendu et critères de nouvelle livraison.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Les cinq clés I0001 à I0005 sont présentes.",
        "Chaque ligne porte une décision en attente.",
        "Aucune correction source n’est fabriquée."
      ]
    },
    "solution": {
      "steps": [
        "Consolide les preuves des contrôles.",
        "Attribue un propriétaire et un statut à chaque motif.",
        "Définis le contrôle de fermeture sur le lot corrigé."
      ],
      "language": "python",
      "code": "import csv\nfrom pathlib import Path\nrows=list(csv.DictReader(open('registre_rejets.csv',encoding='utf-8')))\nlines=['Demande de correction — lot synthétique','Merci de confirmer les corrections suivantes et de fournir un nouveau lot identifié.']\nlines += [r['intervention_id']+' : '+r['correction_demandee'] for r in rows]\nlines += ['Acceptation : clés uniques, références valides, valeurs non négatives et closed complets.','Aucune valeur métier ne sera imputée sans validation. Réponse attendue : fichier corrigé + justification par clé.']\nPath('demande_correction.txt').write_text('\\n'.join(lines),encoding='utf-8')\nassert len(rows)==5",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Les cinq clés I0001 à I0005 sont présentes.",
        "Chaque ligne porte une décision en attente.",
        "Aucune correction source n’est fabriquée."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le responsable veut supprimer toutes les lignes signalées.",
        "cause": "Anomalie confondue avec rejet définitif.",
        "fix": "Explique le biais sur les totaux et demande correction ou exclusion documentée."
      },
      {
        "symptom": "Une ligne est marquée résolue sans preuve.",
        "cause": "Le registre suit une conversation sans livrable vérifiable.",
        "fix": "Réouvre la ligne et demande fichier/version ou justification."
      }
    ],
    "managerQuestions": [
      {
        "question": "Peut-on déjà livrer un bilan de référence ?",
        "expected": "Oui, explicitement synthétique et calculé sur le lot propre distinct ; pas comme reçu corrigé."
      },
      {
        "question": "Quand ferme-t-on un rejet ?",
        "expected": "Après décision documentée et contrôle du fichier corrigé."
      }
    ],
    "changeRequest": "Le propriétaire refuse de corriger I0005 avant vendredi : propose une publication avec réserve et couverture, ou un report à arbitrer.",
    "reference": [
      {
        "title": "Python — csv",
        "url": "https://docs.python.org/3/library/csv.html",
        "when": "Pour conserver un registre lisible par Excel et par les scripts."
      }
    ]
  },
  {
    "id": "a11",
    "title": "Extraire le périmètre mensuel avec SQL",
    "request": "« Fais-moi un premier bilan de juin. Commence par me montrer les lignes retenues et les exclusions. »",
    "expectedDeliverable": "Extraction SQL de juin et note de périmètre : ouverture UTC, réalisés closed, encours séparé.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "data/atelier.db générée : tables de référence propres assets, interventions et planned_hours ; le CSV interventions_dirty.csv n’est pas dans SQLite.",
      "Exécute les requêtes SQL avec sqlite3 ou un éditeur SQLite connecté à cette base."
    ],
    "reasoning": [
      {
        "title": "Filtrer avec une borne ouverte",
        "explanation": "Du 1er juin inclus au 1er juillet exclu évite les erreurs de dernier jour et reste réutilisable."
      },
      {
        "title": "Nommer la source",
        "explanation": "atelier.db est la référence propre synthétique ; elle ne résout pas les rejets du reçu sale."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "sql",
      "code": "SELECT intervention_id, asset_id, opened_at, status, downtime_min, repair_cost_eur\nFROM interventions\nWHERE opened_at >= '2026-06-01' AND opened_at < '2026-07-01'\nORDER BY opened_at, intervention_id;",
      "explanation": [
        "La requête expose tous les statuts avant l’agrégation.",
        "Les dates ISO homogènes UTC du starter permettent ce filtrage textuel ; conserver cette hypothèse dans la note."
      ],
      "expected": "36 interventions en juin, dont les open visibles avec valeurs NULL."
    },
    "yourTurn": {
      "instruction": "Écris une extraction de juin et un second résultat comptant chaque statut ; explique la convention temporelle.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "36 lignes de juin.",
        "Aucune ouverture de juillet.",
        "Les open sont présentes avec des NULL."
      ]
    },
    "solution": {
      "steps": [
        "Vérifie la base et les dates extrêmes.",
        "Filtre par bornes semi-ouvertes.",
        "Compte les statuts sans transformer les NULL."
      ],
      "language": "sql",
      "code": "SELECT status, COUNT(*) AS interventions, COUNT(downtime_min) AS durations_known\nFROM interventions\nWHERE opened_at >= '2026-06-01' AND opened_at < '2026-07-01'\nGROUP BY status\nORDER BY status;",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "36 lignes de juin.",
        "Aucune ouverture de juillet.",
        "Les open sont présentes avec des NULL."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La requête ne renvoie rien.",
        "cause": "La base ouverte n’est pas data/atelier.db ou la période est erronée.",
        "fix": "Vérifie SELECT MIN(opened_at), MAX(opened_at) FROM interventions."
      },
      {
        "symptom": "Le 30 juin au soir est exclu.",
        "cause": "Une borne supérieure à minuit le 30 a été utilisée.",
        "fix": "Utilise le 1er juillet exclu."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi compter tous les statuts ?",
        "expected": "Pour montrer les exclus du réalisé et l’encours, pas seulement les lignes retenues."
      },
      {
        "question": "La base représente-t-elle le reçu sale corrigé ?",
        "expected": "Non, elle est le témoin propre synthétique distinct."
      }
    ],
    "changeRequest": "Le responsable demande mai puis juin : paramètre les bornes et conserve les mêmes règles de statut.",
    "reference": [
      {
        "title": "SQLite — SELECT",
        "url": "https://www.sqlite.org/lang_select.html",
        "when": "Pour contrôler le filtrage, les jointures et les agrégations du bilan."
      }
    ]
  },
  {
    "id": "a12",
    "title": "Joindre les sites sans perdre ni multiplier les interventions",
    "request": "« Je veux juin par site, mais vérifie d’abord que ton rattachement ne change pas le nombre de lignes. »",
    "expectedDeliverable": "Requête de jointure, contrôle de cardinalité et liste des références absentes.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "data/atelier.db générée : tables de référence propres assets, interventions et planned_hours ; le CSV interventions_dirty.csv n’est pas dans SQLite.",
      "Exécute les requêtes SQL avec sqlite3 ou un éditeur SQLite connecté à cette base."
    ],
    "reasoning": [
      {
        "title": "Une clé unique côté référentiel",
        "explanation": "assets.asset_id est unique dans la base ; chaque intervention doit recevoir au plus un site."
      },
      {
        "title": "Rendre les absences visibles",
        "explanation": "Une jointure gauche garde les interventions sans référence au lieu de les éliminer."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "sql",
      "code": "SELECT i.intervention_id, i.asset_id, a.site, i.status, i.repair_cost_eur\nFROM interventions AS i\nLEFT JOIN assets AS a ON a.asset_id = i.asset_id\nWHERE i.opened_at >= '2026-06-01' AND i.opened_at < '2026-07-01'\nORDER BY i.intervention_id;",
      "explanation": [
        "Compare COUNT(*) à COUNT(DISTINCT intervention_id) après la jointure.",
        "Sur la référence, aucun site n’est absent ; le même contrôle sur le reçu sale doit révéler UNKNOWN."
      ],
      "expected": "36 lignes jointes, 36 clés distinctes, zéro site absent sur le témoin."
    },
    "yourTurn": {
      "instruction": "Livre le contrôle de cardinalité et explique ce qu’une jointure interne aurait caché sur le reçu sale.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Nombre avant et après égal à 36.",
        "36 clés distinctes après jointure.",
        "Zéro clé absente sur la référence, absence du reçu sale mentionnée."
      ]
    },
    "solution": {
      "steps": [
        "Vérifie l’unicité de assets.asset_id.",
        "Réalise une jointure gauche sur la clé exacte.",
        "Compare lignes, clés et absences avant de sommer."
      ],
      "language": "sql",
      "code": "WITH joined AS (\n SELECT i.intervention_id, a.asset_id AS matched_asset\n FROM interventions i LEFT JOIN assets a ON a.asset_id=i.asset_id\n WHERE i.opened_at >= '2026-06-01' AND i.opened_at < '2026-07-01'\n)\nSELECT COUNT(*) AS rows_after, COUNT(DISTINCT intervention_id) AS unique_interventions,\n SUM(CASE WHEN matched_asset IS NULL THEN 1 ELSE 0 END) AS missing_assets\nFROM joined;",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Nombre avant et après égal à 36.",
        "36 clés distinctes après jointure.",
        "Zéro clé absente sur la référence, absence du reçu sale mentionnée."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le total augmente après jointure.",
        "cause": "La clé côté référence n’est pas unique dans une autre livraison.",
        "fix": "Bloque le calcul et contrôle GROUP BY asset_id HAVING COUNT(*)>1."
      },
      {
        "symptom": "Les lignes manquantes ne sont pas visibles.",
        "cause": "Jointure interne utilisée.",
        "fix": "Repars d’une jointure gauche et compte les clés de droite NULL."
      }
    ],
    "managerQuestions": [
      {
        "question": "Une jointure correcte garantit-elle un coût fiable ?",
        "expected": "Elle garantit le rattachement, pas la validité métier des montants."
      },
      {
        "question": "Pourquoi compter les clés distinctes ?",
        "expected": "Un même identifiant peut être répété par un fanout même si le résultat semble plausible."
      }
    ],
    "changeRequest": "Le responsable ajoute asset_type au bilan : ajoute cette dimension sans changer le grain intervention.",
    "reference": [
      {
        "title": "SQLite — SELECT",
        "url": "https://www.sqlite.org/lang_select.html",
        "when": "Pour contrôler le filtrage, les jointures et les agrégations du bilan."
      }
    ]
  },
  {
    "id": "a13",
    "title": "Produire les premiers totaux par mois et site",
    "request": "« Mets les arrêts et les coûts réalisés dans une table mensuelle lisible ; garde les encours à part. »",
    "expectedDeliverable": "Requête mois/site avec nombre total, closed/open/cancelled et totaux connus closed.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "data/atelier.db générée : tables de référence propres assets, interventions et planned_hours ; le CSV interventions_dirty.csv n’est pas dans SQLite.",
      "Exécute les requêtes SQL avec sqlite3 ou un éditeur SQLite connecté à cette base."
    ],
    "reasoning": [
      {
        "title": "Agrégation conditionnelle",
        "explanation": "Chaque statut a une colonne de compte, mais seuls les closed contribuent au réalisé."
      },
      {
        "title": "Ne pas confondre absence et zéro",
        "explanation": "SUM ignore les NULL ; ne présente pas une somme open vide comme un coût nul."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "sql",
      "code": "SELECT substr(i.opened_at,1,7) AS month, a.site,\n COUNT(*) AS interventions,\n SUM(CASE WHEN i.status='closed' THEN 1 ELSE 0 END) AS closed_count,\n SUM(CASE WHEN i.status='open' THEN 1 ELSE 0 END) AS open_count,\n SUM(CASE WHEN i.status='cancelled' THEN 1 ELSE 0 END) AS cancelled_count,\n SUM(CASE WHEN i.status='closed' THEN i.downtime_min END) AS downtime_min,\n SUM(CASE WHEN i.status='closed' THEN i.repair_cost_eur END) AS repair_cost_eur\nFROM interventions i LEFT JOIN assets a ON a.asset_id=i.asset_id\nGROUP BY substr(i.opened_at,1,7), a.site\nORDER BY month, a.site;",
      "explanation": [
        "Le résultat contient 18 couples mois/site sur la référence.",
        "Nomme les unités dans les colonnes et annonce que le mois est celui de l’ouverture."
      ],
      "expected": "18 lignes ; les comptes par statut retrouvent 216 interventions sur six mois."
    },
    "yourTurn": {
      "instruction": "Exécute la requête et vérifie que la somme des trois comptes de statut égale le nombre total de chaque ligne.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "18 couples mois/site uniques.",
        "Somme interventions = 216.",
        "Aucun coût open n’est présenté comme réalisé."
      ]
    },
    "solution": {
      "steps": [
        "Ajoute le site par jointure contrôlée.",
        "Compte les statuts et somme les réalisés.",
        "Réconcilie le résultat avec le total des lignes source."
      ],
      "language": "sql",
      "code": "WITH report AS (\n SELECT substr(opened_at,1,7) month, a.site, COUNT(*) n,\n SUM(CASE WHEN status='closed' THEN 1 ELSE 0 END) c,\n SUM(CASE WHEN status='open' THEN 1 ELSE 0 END) o,\n SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) x\n FROM interventions i LEFT JOIN assets a ON a.asset_id=i.asset_id\n GROUP BY substr(opened_at,1,7),a.site\n)\nSELECT COUNT(*) AS groups_count,SUM(n) AS source_count,\n SUM(CASE WHEN n<>c+o+x THEN 1 ELSE 0 END) AS inconsistent_groups FROM report;",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "18 couples mois/site uniques.",
        "Somme interventions = 216.",
        "Aucun coût open n’est présenté comme réalisé."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le coût est répété sur chaque mois.",
        "cause": "La date n’a pas été incluse dans GROUP BY.",
        "fix": "Groupe sur le même mois que celui affiché."
      },
      {
        "symptom": "Les encours semblent gratuits.",
        "cause": "NULL a été remplacé par 0 dans la communication.",
        "fix": "Affiche leur nombre et la mention coût inconnu."
      }
    ],
    "managerQuestions": [
      {
        "question": "Un total mensuel est-il un stock d’encours fin de mois ?",
        "expected": "Non ; ce sont ici les interventions ouvertes ce mois, dont le statut actuel est open."
      },
      {
        "question": "Pourquoi 18 lignes ?",
        "expected": "Six mois multipliés par trois sites présents dans le témoin."
      }
    ],
    "changeRequest": "Le responsable veut aussi le nombre de coûts connus parmi closed : ajoute COUNT conditionnel sans changer les règles.",
    "reference": [
      {
        "title": "SQLite — SELECT",
        "url": "https://www.sqlite.org/lang_select.html",
        "when": "Pour contrôler le filtrage, les jointures et les agrégations du bilan."
      }
    ]
  },
  {
    "id": "a14",
    "title": "Rapporter les arrêts à une exposition correctement jointe",
    "request": "« Les sites sont-ils comparables ? Ajoute les heures planifiées sans gonfler le dénominateur. »",
    "expectedDeliverable": "Table équipement-mois avec arrêt réalisé en heures, exposition et ratio descriptif.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "data/atelier.db générée : tables de référence propres assets, interventions et planned_hours ; le CSV interventions_dirty.csv n’est pas dans SQLite.",
      "Exécute les requêtes SQL avec sqlite3 ou un éditeur SQLite connecté à cette base."
    ],
    "reasoning": [
      {
        "title": "Agréger avant joindre",
        "explanation": "Chaque équipement a plusieurs interventions mensuelles mais une seule exposition mensuelle."
      },
      {
        "title": "Limiter le sens du ratio",
        "explanation": "Le fichier ne prouve pas l’absence de chevauchement des arrêts : somme d’arrêts / exposition est un ratio descriptif, pas une disponibilité certifiée."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "sql",
      "code": "WITH actual AS (\n SELECT asset_id, substr(opened_at,1,7) month, SUM(downtime_min)/60.0 AS downtime_hours\n FROM interventions WHERE status='closed' GROUP BY asset_id,substr(opened_at,1,7)\n)\nSELECT p.asset_id,p.month,p.planned_hours,a.downtime_hours,\n a.downtime_hours/NULLIF(p.planned_hours,0) AS downtime_to_planned_ratio\nFROM planned_hours p LEFT JOIN actual a ON a.asset_id=p.asset_id AND a.month=p.month\nORDER BY p.month,p.asset_id;",
      "explanation": [
        "La double condition asset_id et month évite le produit entre les mois.",
        "Les heures planifiées couvrent tous les jours calendaires du mois dans le témoin synthétique."
      ],
      "expected": "72 lignes équipement-mois, sans multiplication des heures planifiées."
    },
    "yourTurn": {
      "instruction": "Contrôle le total d’exposition avant/après et explique pourquoi on ne peut pas annoncer une disponibilité industrielle.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "72 couples uniques.",
        "Somme planned_hours identique à la table source.",
        "Minutes divisées par 60 avant ratio."
      ]
    },
    "solution": {
      "steps": [
        "Agrège les arrêts au grain équipement-mois.",
        "Joins sur les deux composantes de la clé.",
        "Compare exposition jointe et source et nomme la limite du ratio."
      ],
      "language": "sql",
      "code": "WITH actual AS (SELECT asset_id,substr(opened_at,1,7) month,SUM(downtime_min)/60.0 h\n FROM interventions WHERE status='closed' GROUP BY asset_id,substr(opened_at,1,7)),\njoined AS (SELECT p.*,a.h FROM planned_hours p LEFT JOIN actual a ON p.asset_id=a.asset_id AND p.month=a.month)\nSELECT COUNT(*) rows_after, SUM(planned_hours) joined_hours,\n (SELECT SUM(planned_hours) FROM planned_hours) source_hours FROM joined;",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "72 couples uniques.",
        "Somme planned_hours identique à la table source.",
        "Minutes divisées par 60 avant ratio."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le dénominateur triple.",
        "cause": "planned_hours a été joint à chaque intervention.",
        "fix": "Agrège les interventions avant de joindre."
      },
      {
        "symptom": "Un ratio est infini.",
        "cause": "Exposition nulle ou absente.",
        "fix": "Utilise NULLIF et remonte les mois sans exposition pour arbitrage."
      }
    ],
    "managerQuestions": [
      {
        "question": "Peut-on sommer les pourcentages équipement ?",
        "expected": "Non ; somme des heures d’arrêt divisée par somme des expositions."
      },
      {
        "question": "Est-ce une disponibilité ?",
        "expected": "Pas sans règle de chevauchement, périmètre d’arrêt et définition validée."
      }
    ],
    "changeRequest": "Le responsable veut le ratio par site : somme numérateurs et dénominateurs après rattachement du site, puis divise.",
    "reference": [
      {
        "title": "SQLite — SELECT",
        "url": "https://www.sqlite.org/lang_select.html",
        "when": "Pour contrôler le filtrage, les jointures et les agrégations du bilan."
      }
    ]
  },
  {
    "id": "a15",
    "title": "Comparer juin à mai avec une fenêtre SQL",
    "request": "« Le coût de juin a-t-il changé par site ? Montre montant, variation EUR et variation relative. »",
    "expectedDeliverable": "Table mensuelle avec coût précédent et deltas, sans explication causale prématurée.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "data/atelier.db générée : tables de référence propres assets, interventions et planned_hours ; le CSV interventions_dirty.csv n’est pas dans SQLite.",
      "Exécute les requêtes SQL avec sqlite3 ou un éditeur SQLite connecté à cette base."
    ],
    "reasoning": [
      {
        "title": "Comparer des périmètres identiques",
        "explanation": "Même convention d’ouverture et mêmes statuts pour mai et juin."
      },
      {
        "title": "Fenêtre avant filtre final",
        "explanation": "Filtrer juin avant LAG supprime mai et rend la comparaison impossible."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "sql",
      "code": "WITH monthly AS (\n SELECT substr(i.opened_at,1,7) month,a.site,SUM(i.repair_cost_eur) cost\n FROM interventions i JOIN assets a ON i.asset_id=a.asset_id WHERE i.status='closed'\n GROUP BY substr(i.opened_at,1,7),a.site\n), prior AS (\n SELECT *,LAG(cost) OVER(PARTITION BY site ORDER BY month) previous_cost FROM monthly\n)\nSELECT month,site,cost,previous_cost,cost-previous_cost AS delta_eur,\n (cost-previous_cost)/NULLIF(previous_cost,0) AS delta_ratio\nFROM prior WHERE month='2026-06' ORDER BY site;",
      "explanation": [
        "LAG compare la ligne mensuelle précédente ; dans un dossier avec mois absents, il faut une grille calendaire avant la fenêtre.",
        "delta_ratio vaut 0,10 pour +10 % ; conserve cette convention dans les exports."
      ],
      "expected": "Trois lignes de juin avec coût de mai et écarts ; pas de causalité annoncée."
    },
    "yourTurn": {
      "instruction": "Contrôle manuellement le delta d’un site à partir des deux totaux mensuels et annote les limites des encours de juin.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Trois sites pour juin.",
        "Coût précédent égal au coût de mai.",
        "Division par zéro protégée et premier mois non inventé."
      ]
    },
    "solution": {
      "steps": [
        "Calcule les coûts mensuels closed.",
        "Ajoute LAG par site avant le filtre de juin.",
        "Vérifie un delta en EUR et son ratio."
      ],
      "language": "sql",
      "code": "WITH m AS (SELECT substr(i.opened_at,1,7) month,a.site,SUM(repair_cost_eur) cost\n FROM interventions i JOIN assets a USING(asset_id) WHERE status='closed' GROUP BY 1,2),\np AS (SELECT *,LAG(month) OVER(PARTITION BY site ORDER BY month) previous_month,\n LAG(cost) OVER(PARTITION BY site ORDER BY month) previous_cost FROM m)\nSELECT month,site,previous_month,cost,previous_cost,cost-previous_cost delta_eur,\n 100.0*(cost-previous_cost)/NULLIF(previous_cost,0) delta_pct FROM p WHERE month='2026-06';",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Trois sites pour juin.",
        "Coût précédent égal au coût de mai.",
        "Division par zéro protégée et premier mois non inventé."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le coût précédent est NULL en juin.",
        "cause": "La source a été filtrée sur juin avant la fenêtre.",
        "fix": "Déplace le filtre final après LAG."
      },
      {
        "symptom": "L’écart paraît être 100 fois trop grand.",
        "cause": "Ratio et pourcentage confondus.",
        "fix": "Choisis soit ratio pour formatage %, soit valeur multipliée par 100 avec suffixe pct."
      }
    ],
    "managerQuestions": [
      {
        "question": "Une baisse prouve-t-elle une amélioration ?",
        "expected": "Non : encours, composition et exposition peuvent changer."
      },
      {
        "question": "Quel mois précédent si mai manque ?",
        "expected": "LAG seul rend avril ; il faut contrôler la continuité ou construire un calendrier."
      }
    ],
    "changeRequest": "Ajoute la comparaison des heures d’arrêt avec exactement le même périmètre que les coûts.",
    "reference": [
      {
        "title": "SQLite — fonctions de fenêtre",
        "url": "https://www.sqlite.org/windowfunctions.html",
        "when": "Pour calculer une comparaison temporelle sans perdre le mois précédent."
      }
    ]
  },
  {
    "id": "a16",
    "title": "Transformer les valeurs reçues avec pandas sans masquer les rejets",
    "request": "« Prépare une copie typée du reçu. Je veux les conversions séparées des corrections métier. »",
    "expectedDeliverable": "outputs/interventions_typed.csv et outputs/rejets_typage.csv ; aucune validation métier implicite.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Conversion réversible",
        "explanation": "Conserve la valeur brute pour vérifier qu’une conversion n’a pas changé son sens."
      },
      {
        "title": "Interdire les zéros par défaut",
        "explanation": "Une erreur de lecture ne doit pas devenir un arrêt nul."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from pathlib import Path\nimport pandas as pd\nraw=pd.read_csv('data/interventions_dirty.csv',dtype=str,keep_default_na=False)\ndf=raw.drop_duplicates().copy()\nfor c in ['downtime_min','repair_cost_eur']:\n    df[c+'_raw']=df[c]\n    cleaned=df[c].str.replace(' ','',regex=False).str.replace(',','.',regex=False)\n    df[c]=pd.to_numeric(cleaned,errors='coerce')\nprint(df.loc[df.intervention_id.eq('I0004'),['repair_cost_eur_raw','repair_cost_eur']])",
      "explanation": [
        "Le coût 1 200,50 devient 1200.5, avec sa trace brute.",
        "Cette conversion technique ne corrige ni UNKNOWN, ni -5, ni la durée closed manquante."
      ],
      "expected": "216 lignes typées après retrait de la copie exacte ; défauts métier toujours visibles."
    },
    "yourTurn": {
      "instruction": "Exporte la copie typée et les erreurs de conversion ; distingue-les du registre métier.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "I0004 vaut 1200.5 avec brut conservé.",
        "I0003 reste -5 et doit rester rejetable.",
        "I0005 reste manquante et aucune open n’est remplie avec zéro."
      ]
    },
    "solution": {
      "steps": [
        "Lis en texte et retire seulement les copies exactes.",
        "Normalise séparateurs et convertis en conservant les bruts.",
        "Exporte les échecs non vides dans un fichier dédié."
      ],
      "language": "python",
      "code": "from pathlib import Path\nimport pandas as pd\nPath('outputs').mkdir(exist_ok=True)\ndf=pd.read_csv('data/interventions_dirty.csv',dtype=str,keep_default_na=False).drop_duplicates().copy()\nerrors=[]\nfor c in ['downtime_min','repair_cost_eur']:\n    df[c+'_raw']=df[c]\n    df[c]=pd.to_numeric(df[c].str.replace(' ','',regex=False).str.replace(',','.',regex=False),errors='coerce')\n    bad=df[c].isna() & df[c+'_raw'].ne('')\n    errors += [{'intervention_id':r.intervention_id,'field':c,'raw':getattr(r,c+'_raw')} for r in df[bad].itertuples()]\ndf.to_csv('outputs/interventions_typed.csv',index=False)\npd.DataFrame(errors,columns=['intervention_id','field','raw']).to_csv('outputs/rejets_typage.csv',index=False)\nassert df.intervention_id.nunique()==216",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "I0004 vaut 1200.5 avec brut conservé.",
        "I0003 reste -5 et doit rester rejetable.",
        "I0005 reste manquante et aucune open n’est remplie avec zéro."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Des erreurs de conversion disparaissent.",
        "cause": "errors=coerce utilisé sans conserver le brut.",
        "fix": "Compare NaN obtenus et champs bruts non vides."
      },
      {
        "symptom": "Le reçu semble entièrement corrigé.",
        "cause": "Typage confondu avec validation métier.",
        "fix": "Rappelle les défauts restants et conserve le registre a10 ouvert."
      }
    ],
    "managerQuestions": [
      {
        "question": "Le fichier typé est-il publiable comme validé ?",
        "expected": "Non, les rejets métier doivent encore être arbitrés."
      },
      {
        "question": "Pourquoi zéro échec de typage possible malgré des défauts ?",
        "expected": "Un nombre négatif est parsable ; un blanc open est attendu."
      }
    ],
    "changeRequest": "Une chaîne « inconnu » apparaît dans un coût : vérifie qu’elle entre dans rejets_typage sans devenir zéro.",
    "reference": [
      {
        "title": "pandas — to_numeric",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html",
        "when": "Pour séparer conversion technique et correction métier."
      }
    ]
  },
  {
    "id": "a17",
    "title": "Assembler les tables pandas avec des contrats de jointure",
    "request": "« Prépare le même rattachement que SQL dans Python ; arrête le traitement si le référentiel multiplie les lignes. »",
    "expectedDeliverable": "outputs/reference_enriched.csv et contrôle de jointure ; test équivalent sur le reçu typé.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé.",
      "Pour ton travail autonome : outputs/interventions_typed.csv de a16."
    ],
    "reasoning": [
      {
        "title": "Déclarer la cardinalité",
        "explanation": "validate=many_to_one transforme un risque de multiplication en erreur visible."
      },
      {
        "title": "Examiner les non-rattachés",
        "explanation": "indicator=True garde la preuve des lignes left_only."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\ndf=data['interventions']\nassets=data['assets']\njoined=df.merge(assets,on='asset_id',how='left',validate='many_to_one',indicator=True)\nassert len(joined)==len(df)\nassert joined['_merge'].eq('both').all()\nprint(joined.groupby('site').size())",
      "explanation": [
        "La démonstration utilise le témoin propre, pas une copie supposée corrigée du reçu.",
        "Le test sur le typé sale doit faire remonter I0002 en left_only."
      ],
      "expected": "216 lignes sur le témoin et un non-rattaché sur le reçu typé."
    },
    "yourTurn": {
      "instruction": "Fais les deux jointures et produis la liste des non-rattachés sans les supprimer.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "La jointure du témoin conserve 216 lignes.",
        "La jointure du reçu typé signale I0002.",
        "Un référentiel dupliqué déclenche une erreur de cardinalité."
      ]
    },
    "solution": {
      "steps": [
        "Vérifie la clé du référentiel.",
        "Joins avec validation et indicateur.",
        "Exporte témoin enrichi et anomalies du reçu séparément."
      ],
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\nfrom pathlib import Path\nimport pandas as pd\nPath('outputs').mkdir(exist_ok=True)\nassets=data['assets']\nref=data['interventions'].merge(assets,on='asset_id',how='left',validate='many_to_one',indicator=True)\nassert ref['_merge'].eq('both').all()\nref.drop(columns='_merge').to_csv('outputs/reference_enriched.csv',index=False)\nreceived=pd.read_csv('outputs/interventions_typed.csv')\ncheck=received.merge(assets,on='asset_id',how='left',validate='many_to_one',indicator=True)\nassert len(check)==len(received)\ncheck[check['_merge'].ne('both')].to_csv('outputs/rejets_jointure.csv',index=False)\nassert set(check.loc[check['_merge'].ne('both'),'intervention_id'])=={'I0002'}",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "La jointure du témoin conserve 216 lignes.",
        "La jointure du reçu typé signale I0002.",
        "Un référentiel dupliqué déclenche une erreur de cardinalité."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "MergeError survient.",
        "cause": "La table assets contient plusieurs lignes par clé.",
        "fix": "Bloque la sortie et transmets les clés dupliquées au propriétaire."
      },
      {
        "symptom": "UNKNOWN est rattaché à un site vide puis oublié.",
        "cause": "L’indicateur de jointure n’a pas été contrôlé.",
        "fix": "Exporte left_only et maintiens le rejet ouvert."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi garder how=left ?",
        "expected": "Pour conserver toutes les interventions, y compris celles à corriger."
      },
      {
        "question": "validate prouve-t-il la qualité du site ?",
        "expected": "Non, il vérifie la cardinalité, pas le contenu métier."
      }
    ],
    "changeRequest": "Le responsable fournit une table de sites mise à jour : compare les rattachements avant de remplacer le référentiel.",
    "reference": [
      {
        "title": "pandas — merge",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html",
        "when": "Pour imposer la cardinalité et inspecter les non-rattachés."
      }
    ]
  },
  {
    "id": "a18",
    "title": "Écrire le premier fichier mensuel reproductible",
    "request": "« Je veux pouvoir relancer le bilan sans refaire les manipulations. Produis un CSV de contrôle, avec tous les statuts. »",
    "expectedDeliverable": "outputs/monthly_report.csv, témoin propre synthétique avec provenance explicite dans outputs/report_scope.json.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé."
    ],
    "reasoning": [
      {
        "title": "Séparer compte et réalisé",
        "explanation": "Le nombre d’interventions inclut tous les statuts ; les mesures réalisées ne portent que sur closed."
      },
      {
        "title": "Nommer la provenance",
        "explanation": "Ce premier fichier est une référence de réconciliation ; le futur fichier validé issu du reçu restera outputs/interventions_validated.csv après arbitrage explicite."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\nimport pandas as pd\ndf=data['interventions'].merge(data['assets'],on='asset_id',validate='many_to_one')\ndf['month']=pd.to_datetime(df.opened_at,utc=True).dt.strftime('%Y-%m')\ncounts=df.groupby(['month','site','status']).size().unstack('status',fill_value=0).reindex(columns=['closed','open','cancelled'],fill_value=0)\nactual=df[df.status.eq('closed')].groupby(['month','site'])[['downtime_min','repair_cost_eur']].sum(min_count=1)\nreport=counts.join(actual).reset_index()\nprint(report.head().to_string(index=False))",
      "explanation": [
        "sum(min_count=1) ne transforme pas un groupe entièrement manquant en zéro.",
        "Le mois est calculé après lecture UTC explicite."
      ],
      "expected": "18 lignes au grain mois/site, comptes des statuts et coûts/arrêts closed."
    },
    "yourTurn": {
      "instruction": "Écris le fichier avec un total de lignes source, un contrôle des clés et une note de provenance.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "18 clés month/site uniques.",
        "Somme des trois comptes = 216.",
        "Coûts et arrêts égaux aux totaux closed de la référence."
      ]
    },
    "solution": {
      "steps": [
        "Rattache le site et calcule le mois UTC.",
        "Agrège séparément statuts et mesures réalisées.",
        "Exporte et inscris provenance, limites et unités."
      ],
      "language": "python",
      "code": "from starter_data_analysis import load_data\ndata = load_data()\nfrom pathlib import Path\nimport pandas as pd, json\nPath('outputs').mkdir(exist_ok=True)\ndf=data['interventions'].merge(data['assets'],on='asset_id',validate='many_to_one')\ndf['month']=pd.to_datetime(df.opened_at,utc=True).dt.strftime('%Y-%m')\ncounts=df.groupby(['month','site','status']).size().unstack('status',fill_value=0).reindex(columns=['closed','open','cancelled'],fill_value=0)\nactual=df[df.status.eq('closed')].groupby(['month','site'])[['downtime_min','repair_cost_eur']].sum(min_count=1)\nreport=counts.join(actual).reset_index()\nassert not report.duplicated(['month','site']).any()\nassert report[['closed','open','cancelled']].to_numpy().sum()==216\nreport.to_csv('outputs/monthly_report.csv',index=False)\nscope={'synthetic':True,'source':'data/interventions.csv : témoin propre, distinct du reçu sale','month_basis':'opened_at UTC','actual_status':'closed','units':{'downtime_min':'minutes','repair_cost_eur':'EUR'},'warning':'open unknown; owner corrections pending; not interventions_validated.csv'}\nPath('outputs/report_scope.json').write_text(json.dumps(scope,ensure_ascii=False,indent=2),encoding='utf-8')",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "18 clés month/site uniques.",
        "Somme des trois comptes = 216.",
        "Coûts et arrêts égaux aux totaux closed de la référence."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les colonnes open ou cancelled manquent.",
        "cause": "Le mois filtré ne contient pas tous les statuts.",
        "fix": "Réindexe explicitement les trois colonnes de compte."
      },
      {
        "symptom": "Le fichier est présenté comme reçu corrigé.",
        "cause": "La provenance de référence a été perdue.",
        "fix": "Joins report_scope.json et rappelle les rejets en attente."
      }
    ],
    "managerQuestions": [
      {
        "question": "À quoi sert ce premier CSV ?",
        "expected": "Valider les calculs entre outils sur un témoin connu."
      },
      {
        "question": "Quand utilisera-t-on le reçu pour produire ?",
        "expected": "Après corrections ou quarantaine explicites, avec impact et registre de décisions."
      }
    ],
    "changeRequest": "Le responsable veut uniquement juin dans une copie de présentation : filtre la sortie, garde le fichier complet pour les contrôles.",
    "reference": [
      {
        "title": "pandas — groupby",
        "url": "https://pandas.pydata.org/docs/user_guide/groupby.html",
        "when": "Pour construire le bilan au grain attendu sans perdre les statuts."
      }
    ]
  },
  {
    "id": "a19",
    "title": "Réconcilier Excel, SQL et Python avant de remettre le bilan",
    "request": "« Les trois outils affichent-ils les mêmes chiffres ? Donne-moi la preuve et explique toute différence. »",
    "expectedDeliverable": "outputs/reconciliation.csv avec comparaison mois/site/coûts/arrêts, et contrôle des nombres de lignes Excel.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé.",
      "data/atelier.db générée : tables de référence propres assets, interventions et planned_hours ; le CSV interventions_dirty.csv n’est pas dans SQLite.",
      "Exécute les requêtes SQL avec sqlite3 ou un éditeur SQLite connecté à cette base.",
      "outputs/monthly_report.csv de a18 ; Excel avec la référence propre de a09.",
      "Exporter depuis Excel excel_monthly.csv : colonnes month,site,downtime_min,repair_cost_eur ; 18 lignes mois/site, filtre closed ; aucun total général."
    ],
    "reasoning": [
      {
        "title": "Même périmètre avant comparaison",
        "explanation": "Comparer une source sale à une source propre ne teste pas la cohérence des outils."
      },
      {
        "title": "Contrôle détaillé",
        "explanation": "Un total général égal peut masquer deux sites inversés ; rapproche les clés mois/site."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "import sqlite3\nimport pandas as pd\nwith sqlite3.connect('data/atelier.db') as con:\n    sql=pd.read_sql_query(\"SELECT substr(opened_at,1,7) month,a.site,SUM(downtime_min) downtime_min,SUM(repair_cost_eur) repair_cost_eur FROM interventions i JOIN assets a USING(asset_id) WHERE status='closed' GROUP BY 1,2\",con)\npy=pd.read_csv('outputs/monthly_report.csv')\ncheck=py.merge(sql,on=['month','site'],validate='one_to_one',suffixes=('_python','_sql'),how='outer',indicator=True)\nassert check['_merge'].eq('both').all()\nfor c in ['downtime_min','repair_cost_eur']:\n    check[c+'_delta']=check[c+'_python']-check[c+'_sql']\nprint(check[['month','site','downtime_min_delta','repair_cost_eur_delta']])",
      "explanation": [
        "Commence par SQL/Python ; ensuite ajoute Excel, avec exactement les mêmes clés et filtres.",
        "Dans Excel, ajoute month en J2 =GAUCHE(C2;7) sur Reference et construis un tableau croisé lignes month puis site, valeurs somme G et H, filtre status=closed. Présentation tabulaire, répéter les étiquettes, sans sous-totaux ni total général. Exporte les quatre colonnes avec les en-têtes demandés et décimales point/virgule de séparation CSV, ou réimporte avec paramètres régionaux explicites."
      ],
      "expected": "Tous les deltas SQL/Python nuls ; la comparaison Excel doit être effectuée réellement, pas simulée."
    },
    "yourTurn": {
      "instruction": "Exporte le tableau Excel, ajoute ses valeurs et traite tout écart avant publication.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "18 clés présentes dans chacun des trois outils.",
        "Écart minutes inférieur à 1e-9 et coût inférieur à 0.005 EUR par clé.",
        "Aucune ligne de total général ni doublon de clé dans l’export Excel."
      ]
    },
    "solution": {
      "steps": [
        "Prépare le tableau Excel au même périmètre.",
        "Rapproche SQL/Python puis Excel sur mois/site.",
        "Exporte les écarts et bloque la remise s’ils dépassent les tolérances."
      ],
      "language": "python",
      "code": "from pathlib import Path\nimport sqlite3\nimport pandas as pd\npy=pd.read_csv('outputs/monthly_report.csv')\nexcel_path=Path('excel_monthly.csv')\nassert excel_path.exists(), 'Exporter réellement le TCD Excel avant validation'\nexcel=pd.read_csv(excel_path)\nwith sqlite3.connect('data/atelier.db') as con:\n    sql=pd.read_sql_query(\"SELECT substr(opened_at,1,7) month,a.site,SUM(downtime_min) downtime_min,SUM(repair_cost_eur) repair_cost_eur FROM interventions i JOIN assets a USING(asset_id) WHERE status='closed' GROUP BY 1,2\",con)\nkeys=['month','site']; measures=['downtime_min','repair_cost_eur']\nout=py[keys+measures].copy()\nfor name,other in [('sql',sql),('excel',excel)]:\n    assert len(other)==18 and not other.duplicated(keys).any()\n    out=out.merge(other[keys+measures],on=keys,how='outer',validate='one_to_one',suffixes=('', '_'+name),indicator=True)\n    assert out.pop('_merge').eq('both').all()\n    for c in measures:\n        out[c+'_delta_'+name]=out[c]-out[c+'_'+name]\nout.to_csv('outputs/reconciliation.csv',index=False)\nfor name in ['sql','excel']:\n    assert out['downtime_min_delta_'+name].abs().le(1e-9).all()\n    assert out['repair_cost_eur_delta_'+name].abs().lt(0.005).all()\nprint('Trois sources réconciliées sur 18 clés')",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "18 clés présentes dans chacun des trois outils.",
        "Écart minutes inférieur à 1e-9 et coût inférieur à 0.005 EUR par clé.",
        "Aucune ligne de total général ni doublon de clé dans l’export Excel."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le total Excel est plus faible.",
        "cause": "Coûts importés en texte ou filtre resté actif.",
        "fix": "Vérifie types, filtres et nombre de lignes avant de modifier la formule."
      },
      {
        "symptom": "Les totaux sont égaux mais des sites diffèrent.",
        "cause": "Rattachement ou tri manuel incohérent.",
        "fix": "Rapproche par clés, jamais par numéro de ligne."
      }
    ],
    "managerQuestions": [
      {
        "question": "Peut-on déclarer Excel validé sans export ?",
        "expected": "Non ; conserver un statut à faire tant que la preuve manque."
      },
      {
        "question": "Pourquoi une tolérance monétaire ?",
        "expected": "Pour les arrondis de représentation ; elle reste inférieure au centime, pas un écart métier acceptable."
      }
    ],
    "changeRequest": "Un écart de 25 EUR apparaît sur un site : remonte jusqu’aux identifiants et documente la cause, sans forcer les chiffres à correspondre.",
    "reference": [
      {
        "title": "pandas — merge",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html",
        "when": "Pour comparer les chiffres par clés avec contrôle de présence."
      },
      {
        "title": "Microsoft — tableaux croisés dynamiques",
        "url": "https://support.microsoft.com/fr-fr/office/créer-un-tableau-croisé-dynamique-pour-analyser-des-données-de-feuille-de-calcul-a9a84538-bfe9-40a9-a8e9-f99134456576",
        "when": "Au moment de résumer les interventions dans Excel."
      }
    ]
  },
  {
    "id": "a20",
    "title": "Remettre le premier bilan et préparer la question suivante",
    "request": "« Montre-moi juin face à mai et dis-moi ce que nous devons examiner ensuite. Je veux une page, pas une liste de chiffres. »",
    "expectedDeliverable": "outputs/couts_mensuels.png et outputs/note_premier_bilan.md, avec graphique, contrôles, réserves et question d’investigation.",
    "prerequisites": [
      "Copie starter_data_analysis.py dans ton dossier de travail.",
      "Python 3 ; commande initiale : python starter_data_analysis.py --output data. Cette génération utilise uniquement la bibliothèque standard.",
      "Toutes les données sont synthétiques ; dates UTC de janvier à juin 2026.",
      "Fichiers data/*.csv et data/dictionary.json générés ; pour load_data(), pandas installé.",
      "outputs/monthly_report.csv et outputs/report_scope.json de a18.",
      "Pour une remise déclarée réconciliée : outputs/reconciliation.csv de a19 sans écarts hors tolérance.",
      "pandas et matplotlib installés ; le graphique décrit un témoin synthétique."
    ],
    "reasoning": [
      {
        "title": "Montrer une comparaison interprétable",
        "explanation": "Un axe temporel et une série par site permettent de repérer une variation sans mélanger EUR et minutes."
      },
      {
        "title": "Séparer constat et hypothèse",
        "explanation": "Une variation de coût est observée ; sa cause reste à investiguer dans le même dossier."
      }
    ],
    "guided": {
      "instruction": "Exécute ce passage sur le dossier de maintenance, puis conserve la sortie avec ton interprétation.",
      "language": "python",
      "code": "import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('outputs/monthly_report.csv')\npivot=df.pivot(index='month',columns='site',values='repair_cost_eur')\nax=pivot.plot(marker='o',figsize=(9,4))\nax.set(title='Maintenance synthétique — coûts connus des closed par mois d’ouverture UTC',xlabel='Mois',ylabel='EUR')\nax.grid(axis='y',alpha=.25)\nplt.tight_layout()\nplt.savefig('outputs/couts_mensuels.png',dpi=150)\nplt.close()",
      "explanation": [
        "Le graphique représente des coûts connus closed, pas une économie ni une performance causale.",
        "Un titre trop long peut être réparti sur deux lignes ; vérifie visuellement les labels dans le PNG."
      ],
      "expected": "Un graphique lisible et une note qui annonce source, convention, variation observée et prochaine vérification."
    },
    "yourTurn": {
      "instruction": "Écris trois constats chiffrés calculés, une réserve liée aux encours et une question pour expliquer les écarts ensuite.",
      "constraints": [
        "Travaille sur les données synthétiques et conserve les fichiers reçus intacts.",
        "Documente le périmètre, la date de production et les décisions dans ton livrable."
      ],
      "checks": [
        "Axes, EUR, période et statut explicites.",
        "Les chiffres du texte proviennent du CSV.",
        "La note indique données synthétiques et état réel de la réconciliation."
      ]
    },
    "solution": {
      "steps": [
        "Trace les coûts mensuels sans deuxième axe.",
        "Calcule juin, mai et leur différence plutôt que les saisir à la main.",
        "Rédige une page avec décision proposée, limites et preuve de contrôle."
      ],
      "language": "python",
      "code": "from pathlib import Path\nimport pandas as pd\nimport matplotlib.pyplot as plt\nr=pd.read_csv('outputs/monthly_report.csv')\np=r.pivot(index='month',columns='site',values='repair_cost_eur')\nax=p.plot(marker='o',figsize=(9,4)); ax.set(title='Maintenance synthétique : coûts connus closed\\nMois d’ouverture UTC',xlabel='Mois',ylabel='EUR'); ax.grid(axis='y',alpha=.25)\nplt.tight_layout(); plt.savefig('outputs/couts_mensuels.png',dpi=150); plt.close()\nmay=r[r.month.eq('2026-05')]; june=r[r.month.eq('2026-06')]\na=may.repair_cost_eur.sum(); b=june.repair_cost_eur.sum()\nproof=Path('outputs/reconciliation.csv')\nstate='À TERMINER : preuve Excel absente'\nif proof.exists():\n    checks=pd.read_csv(proof)\n    cols=[c for c in checks if '_delta_' in c]\n    ok=len(checks)==18 and len(cols)==4 and checks[cols].notna().all().all()\n    for c in cols:\n        tol=0.005 if c.startswith('repair_cost') else 1e-9\n        ok=ok and checks[c].abs().le(tol).all()\n    state='Réconciliation vérifiée : 18 clés, trois outils' if ok else 'BLOQUÉ : écarts à examiner'\ntext=f'''# Premier bilan — données synthétiques\nSource : témoin propre data/interventions.csv ; reçu sale et rejets distincts.\nPérimètre : mois d’ouverture UTC, coûts et arrêts connus des closed.\nMai : {a:.2f} EUR ; juin : {b:.2f} EUR ; variation : {b-a:+.2f} EUR.\nJuin : {int(june['closed'].sum())} closed et {int(june['open'].sum())} open. Les coûts/arrêts open restent inconnus.\nContrôle : {state}.\nRéserve : ce bilan de référence ne constitue pas une validation des corrections du reçu.\nProchaine demande : examiner la composition corrective/préventive et les équipements contribuant à l’écart, sans conclure à une cause.\nDécision proposée : valider le périmètre avant d’investiguer les écarts.\n'''\nPath('outputs/note_premier_bilan.md').write_text(text,encoding='utf-8')\nprint(text)",
      "explanation": "Cette proposition rend le contrôle reproductible. Compare les sorties à ton propre livrable et explique chaque écart avant de le remettre au responsable.",
      "verification": [
        "Axes, EUR, période et statut explicites.",
        "Les chiffres du texte proviennent du CSV.",
        "La note indique données synthétiques et état réel de la réconciliation."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le graphique a des mois dans le désordre.",
        "cause": "Les mois sont des libellés non normalisés.",
        "fix": "Utilise YYYY-MM, trie l’index et vérifie les six mois."
      },
      {
        "symptom": "La note affirme une amélioration.",
        "cause": "Un écart descriptif a été transformé en explication.",
        "fix": "Remplace par le constat calculé et une hypothèse à tester."
      }
    ],
    "managerQuestions": [
      {
        "question": "Quelle décision demandes-tu maintenant ?",
        "expected": "Validation du périmètre et priorité d’investigation, pas adoption d’une cause non testée."
      },
      {
        "question": "Pourquoi mentionner les open dans une note de coûts closed ?",
        "expected": "Ils limitent l’interprétation du bilan récent et peuvent faire évoluer le réalisé."
      }
    ],
    "changeRequest": "Le responsable demande pourquoi juin diffère : prépare le passage à l’analyse des contributions par équipement et type, en gardant ce bilan comme point de contrôle.",
    "reference": [
      {
        "title": "Matplotlib — pyplot",
        "url": "https://matplotlib.org/stable/api/pyplot_summary.html",
        "when": "Pour produire puis vérifier un graphique exportable avec unités et titre."
      }
    ]
  }
];
