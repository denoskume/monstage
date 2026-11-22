import type { ProjectAction } from './types';
export const actions21to40: ProjectAction[] = [
  {
    "id": "a21",
    "title": "Décomposer la variation du coût mensuel",
    "request": "Le responsable a confirmé les corrections après notre première revue. Applique sa réponse sans remplacer le fichier reçu par le témoin, puis explique : le coût varie-t-il à cause du volume ou du coût moyen ?",
    "expectedDeliverable": "Un tableau volume × coût moyen avec une décomposition chiffrée et ses limites.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC.",
      "Réponse simulée owner_response_after_review.csv examinée après la revue du dossier ; approuver les corrections de ce cas avant de les appliquer."
    ],
    "reasoning": [
      {
        "title": "Commencer par une identité",
        "explanation": "Pour les interventions clôturées dont le coût est connu, coût total = nombre × coût moyen. Décomposer le changement évite d’attribuer toute hausse à une dégradation technique."
      },
      {
        "title": "Fixer le périmètre",
        "explanation": "Les coûts des interventions ouvertes sont inconnus. Comparer des périodes complètes et les mêmes règles de statut avant d’expliquer une variation."
      }
    ],
    "guided": {
      "instruction": "Nous avons maintenant reçu la réponse simulée du propriétaire : trois corrections identifiées et la suppression des copies strictement identiques sont confirmées. Lis le fichier owner_response_after_review.csv avant approved=True. Le préparateur applique ces règles au fichier sale et garde le bilan ; il ne lit pas le témoin propre.",
      "language": "python",
      "code": "from starter_data_analysis import prepare_validated_data\nimport pandas as pd\nx=prepare_validated_data(approved=True)\nx=x.loc[x.status.eq('closed')].copy()\nx['month']=pd.to_datetime(x.opened_at,utc=True).dt.strftime('%Y-%m')\nr=x.groupby('month').agg(n=('intervention_id','size'),cost=('repair_cost_eur','sum'))\nr['mean']=r.cost/r.n\nprevious,current=r.iloc[-2],r.iloc[-1]\nvolume=(current.n-previous.n)*previous['mean']\nunit=current.n*(current['mean']-previous['mean'])\nassert abs(volume+unit-(current.cost-previous.cost))<1e-8\nprint(r);print({'effet_volume':volume,'effet_cout_moyen':unit})",
      "explanation": [
        "Le coût moyen est pondéré par le nombre d’interventions, pas une moyenne de moyennes de sites.",
        "La décomposition est descriptive ; elle ne prouve pas la cause du coût unitaire."
      ],
      "expected": "Les deux contributions se réconcilient exactement avec la variation totale."
    },
    "yourTurn": {
      "instruction": "Refais la décomposition sur outputs/interventions_validated.csv et ajoute le nombre de coûts inconnus par mois.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Le périmètre est identique entre les mois.",
        "La somme des contributions égale la variation.",
        "Les inconnus et l’effectif sont affichés."
      ]
    },
    "solution": {
      "steps": [
        "Filtrer les statuts et vérifier les coûts connus.",
        "Calculer volume, coût total et coût moyen par mois.",
        "Réconcilier la décomposition puis rédiger une conclusion limitée."
      ],
      "language": "python",
      "code": "import pandas as pd\nfrom pathlib import Path\np=Path('outputs/interventions_validated.csv')\nx=pd.read_csv(p)\nx['month']=pd.to_datetime(x.opened_at,utc=True).dt.strftime('%Y-%m')\nknown=x.loc[x.status.eq('closed') & x.repair_cost_eur.notna()]\nr=known.groupby('month').repair_cost_eur.agg(['count','sum','mean'])\na,b=r.iloc[-2],r.iloc[-1]\nparts={'volume':(b['count']-a['count'])*a['mean'],\n       'cout_moyen':b['count']*(b['mean']-a['mean'])}\nassert abs(sum(parts.values())-(b['sum']-a['sum']))<1e-8\nPath('outputs').mkdir(exist_ok=True)\nr.to_csv('outputs/cost_decomposition.csv')\nprint(parts);print('Inconnus par mois',x.groupby('month').repair_cost_eur.apply(lambda s:s.isna().sum()))",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Vérifier deux mois à la main.",
        "Tester le cas où le coût total change uniquement parce que le volume change."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les contributions ne retombent pas sur le total",
        "cause": "Périmètres ou pondérations différents",
        "fix": "Recalculer les deux mois avec les mêmes lignes et utiliser l’identité complète."
      },
      {
        "symptom": "Une hausse est attribuée aux techniciens",
        "cause": "Le calcul ne mesure qu’une association",
        "fix": "Chercher changement de type d’intervention, équipements et données manquantes."
      }
    ],
    "managerQuestions": [
      {
        "question": "Que permet de dire cette décomposition ?",
        "expected": "Quelle part arithmétique est liée au volume et au coût moyen dans le périmètre défini."
      },
      {
        "question": "Pourquoi ne pas sommer les coûts ouverts à zéro ?",
        "expected": "Un coût inconnu n’est pas un coût nul ; cela biaiserait le montant et la moyenne."
      }
    ],
    "changeRequest": "Le responsable demande la même décomposition par site : conserve aussi la réconciliation du total global.",
    "reference": [
      {
        "title": "pandas groupby",
        "url": "https://pandas.pydata.org/docs/user_guide/groupby.html",
        "when": "Au moment de calculer les agrégations du bilan."
      }
    ]
  },
  {
    "id": "a22",
    "title": "Vérifier si le mix d’interventions explique l’écart",
    "request": "Le site le plus cher fait-il plus de correctif ou facture-t-il davantage à activité comparable ?",
    "expectedDeliverable": "Une comparaison par type avec effectifs et moyenne standardisée sur un mix commun.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Comparer des situations comparables",
        "explanation": "Comparer les sites sans tenir compte des types d’interventions peut confondre composition du travail et niveau de coût."
      },
      {
        "title": "Pondération explicite",
        "explanation": "Une moyenne standardisée utilise les mêmes poids pour tous les sites. Les catégories absentes doivent être signalées, pas remplies arbitrairement."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nx=load_data();f=x['interventions'].merge(x['assets'],on='asset_id',validate='many_to_one')\nf=f.loc[f.status.eq('closed')]\nsummary=f.groupby(['site','intervention_type']).repair_cost_eur.agg(['count','mean'])\nweights=f.intervention_type.value_counts(normalize=True)\nmeans=summary['mean'].unstack('intervention_type')\nassert means.notna().all().all()\nstandardized=means.mul(weights,axis=1).sum(axis=1)\nprint(summary);print('Poids communs',weights);print('Moyennes standardisées',standardized)",
      "explanation": [
        "validate refuse une dimension dupliquée qui multiplierait les coûts.",
        "Les poids sont ceux du périmètre global, conservés pour chaque site."
      ],
      "expected": "Un tableau brut et un tableau à mix commun ; leurs différences sont à interpréter."
    },
    "yourTurn": {
      "instruction": "Compare les sites avec le mix commun sur ton dossier et explique ce que cette correction ne contrôle pas.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Effectifs par site/type présents.",
        "Poids communs identiques pour tous les sites.",
        "Catégories manquantes et facteurs non contrôlés signalés."
      ]
    },
    "solution": {
      "steps": [
        "Contrôler les clés de la dimension.",
        "Calculer moyennes et effectifs par type.",
        "Appliquer un mix commun puis comparer sans conclure à un effet causal."
      ],
      "language": "python",
      "code": "import pandas as pd\nf=pd.read_csv('outputs/interventions_validated.csv')\na=pd.read_csv('data/assets.csv')\nf=f.merge(a,on='asset_id',how='left',validate='many_to_one',indicator=True)\nassert f['_merge'].eq('both').all()\nf=f.loc[f.status.eq('closed') & f.repair_cost_eur.notna()]\nmeans=f.pivot_table(index='site',columns='intervention_type',values='repair_cost_eur',aggfunc='mean')\nweights=f.intervention_type.value_counts(normalize=True)\nif means.reindex(columns=weights.index).isna().any().any():\n    raise ValueError('Catégorie absente : standardisation complète impossible')\nresult=means.mul(weights,axis=1).sum(axis=1)\nresult.to_csv('outputs/site_standardized_cost.csv',header=['cost_eur'])\nprint(result)",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Vérifier que les poids somment à 1.",
        "Créer un site sans correctif et vérifier que le manque est signalé."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le site absent reçoit une moyenne faible",
        "cause": "Les catégories manquantes ont été prises pour zéro",
        "fix": "Refuser ou limiter explicitement la comparaison."
      },
      {
        "symptom": "Le coût monte après jointure",
        "cause": "Dimension non unique",
        "fix": "Contrôler une ligne par asset_id avant fusion."
      }
    ],
    "managerQuestions": [
      {
        "question": "La standardisation prouve-t-elle une meilleure efficacité ?",
        "expected": "Non ; elle contrôle le mix choisi, pas tous les facteurs possibles."
      },
      {
        "question": "Pourquoi garder les effectifs ?",
        "expected": "Une moyenne sur très peu d’interventions est fragile et doit être visible."
      }
    ],
    "changeRequest": "Ajoute le type d’équipement au diagnostic, sans rendre invisibles les petits sous-groupes.",
    "reference": [
      {
        "title": "Jointures contrôlées",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.merge.html",
        "when": "Pour vérifier la cardinalité du rattachement aux sites."
      }
    ]
  },
  {
    "id": "a23",
    "title": "Séparer les mois complets et les dossiers encore ouverts",
    "request": "Peut-on comparer le mois en cours aux précédents sans tromper le lecteur ?",
    "expectedDeliverable": "Une note de périmètre avec encours et coût/durée connus séparés.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Ouvert n’est pas terminé",
        "explanation": "Un temps de réparation calculé seulement sur les clôtures exclut les cas longs encore ouverts. Le préciser évite un faux sentiment d’amélioration."
      },
      {
        "title": "Date d’arrêté",
        "explanation": "Une photographie se lit à une date donnée. Les ouvertures, clôtures et encours répondent à des questions différentes."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nimport pandas as pd\nx=load_data()['interventions'];as_of=pd.Timestamp('2026-07-01',tz='UTC')\nx['opened']=pd.to_datetime(x.opened_at,utc=True)\nx['month']=x.opened.dt.strftime('%Y-%m')\nx['open_age_days']=(as_of-x.opened).dt.total_seconds()/86400\nprint(x.groupby(['month','status']).size().unstack(fill_value=0))\nprint(x.loc[x.status.eq('open'),['intervention_id','open_age_days','repair_cost_eur']])\nassert x.loc[x.status.eq('open'),'repair_cost_eur'].isna().all()",
      "explanation": [
        "L’âge d’un dossier ouvert n’est pas une durée de réparation observée.",
        "La date d’arrêté est explicite et UTC pour éviter les comparaisons mouvantes."
      ],
      "expected": "Les encours apparaissent à part et leurs coûts restent inconnus."
    },
    "yourTurn": {
      "instruction": "Ajoute un panneau encours au bilan et précise si chaque métrique porte sur les ouvertures ou les clôtures.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Date d’arrêté affichée.",
        "Aucune durée ouverte remplacée par zéro.",
        "Une population différente n’est pas comparée sous le même libellé."
      ]
    },
    "solution": {
      "steps": [
        "Fixer la date d’arrêté.",
        "Séparer ouverts, clôturés et annulés.",
        "Présenter les résultats avec le sens exact de chaque date."
      ],
      "language": "python",
      "code": "import pandas as pd\nx=pd.read_csv('outputs/interventions_validated.csv')\nx['opened']=pd.to_datetime(x.opened_at,utc=True,errors='raise')\ncutoff=pd.Timestamp('2026-07-01',tz='UTC')\nif (x.opened>=cutoff).any(): raise ValueError('Données après la date d’arrêté')\nopen_cases=x.loc[x.status.eq('open')].copy()\nopen_cases['age_days']=(cutoff-open_cases.opened).dt.total_seconds()/86400\nopen_cases[['intervention_id','asset_id','age_days']].to_csv('outputs/backlog.csv',index=False)\nprint('Encours',len(open_cases),'date d’arrêté',cutoff)",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Changer la date d’arrêté et expliquer l’effet.",
        "Vérifier manuellement l’âge d’un dossier."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les durées diminuent en fin de période",
        "cause": "Les cas longs ne sont pas encore clôturés",
        "fix": "Montrer l’encours et annoncer la sélection sur clôtures."
      },
      {
        "symptom": "Âges négatifs",
        "cause": "Date d’arrêté ou timezone incohérente",
        "fix": "Contrôler les dates avant calcul."
      }
    ],
    "managerQuestions": [
      {
        "question": "Un coût inconnu peut-il être agrégé en zéro ?",
        "expected": "Non ; on peut sommer les coûts connus en annonçant la couverture."
      },
      {
        "question": "Pourquoi distinguer date d’ouverture et de clôture ?",
        "expected": "Elles définissent des cohortes et des questions différentes."
      }
    ],
    "changeRequest": "Le responsable demande un suivi hebdomadaire : définis les périodes et la date de photographie.",
    "reference": [
      {
        "title": "Dates pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/timeseries.html",
        "when": "Pour rendre explicites dates, périodes et fuseaux."
      }
    ]
  },
  {
    "id": "a24",
    "title": "Décrire les délais sans se laisser tromper par la moyenne",
    "request": "Quelques interventions très longues dégradent-elles le délai moyen ?",
    "expectedDeliverable": "Une distribution des durées avec médiane, quantiles et cas à inspecter.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Moyenne et médiane répondent différemment",
        "explanation": "La moyenne décrit la charge moyenne ; la médiane décrit un cas central. Les deux restent utiles si leur sens est expliqué."
      },
      {
        "title": "Une valeur extrême n’est pas automatiquement fausse",
        "explanation": "Contrôler l’intervention et les unités avant de supprimer une longue durée."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nx=load_data()['interventions']\ns=x.loc[x.status.eq('closed') & x.intervention_type.eq('corrective'),'downtime_min']\nprint({'n':len(s),'mean_min':s.mean(),'median_min':s.median(),'p90_min':s.quantile(.9)})\nprint('Interventions les plus longues :')\nprint(x.loc[s.nlargest(5).index,['intervention_id','downtime_min']])",
      "explanation": [
        "Le filtre correctif reste le même pour toutes les statistiques.",
        "Un percentile est une description du jeu observé, pas un engagement garanti pour l’avenir."
      ],
      "expected": "Les statistiques sont calculées avec leur effectif et les cas extrêmes sont traçables."
    },
    "yourTurn": {
      "instruction": "Présente moyenne, médiane et P90 du correctif clôturé, puis documente deux cas longs sans les effacer.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Unités et filtre écrits.",
        "Identifiants des cas longs disponibles.",
        "Aucune suppression uniquement pour améliorer la moyenne."
      ]
    },
    "solution": {
      "steps": [
        "Contrôler les unités et données manquantes.",
        "Calculer plusieurs résumés et observer la distribution.",
        "Revenir aux cas longs pour vérifier leur signification."
      ],
      "language": "python",
      "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nx=pd.read_csv('outputs/interventions_validated.csv')\ns=x.loc[x.status.eq('closed') & x.intervention_type.eq('corrective'),'downtime_min'].dropna()\nassert s.ge(0).all()\nsummary=s.agg(['count','mean','median','max'])\nsummary.to_csv('outputs/duration_summary.csv',header=['minutes'])\nfig,ax=plt.subplots();ax.hist(s,bins=12)\nax.set(xlabel='Durée d’arrêt connue (minutes)',ylabel='Interventions correctives clôturées')\nfig.tight_layout();fig.savefig('outputs/duration_histogram.png',dpi=150);plt.close(fig)\nprint(summary,'P90',s.quantile(.9))",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Recalculer une petite liste à la main.",
        "Vérifier que l’histogramme totalise le nombre de durées connues."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les unités changent entre fichiers",
        "cause": "Mélange heures/minutes",
        "fix": "Convertir dans une unité de référence avant agrégation."
      },
      {
        "symptom": "Le graphique cache les cas longs",
        "cause": "Axe tronqué ou valeurs supprimées",
        "fix": "Montrer les limites de l’axe et conserver une vue complète."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi ne pas supprimer les valeurs au-dessus du P90 ?",
        "expected": "Ce sont potentiellement des interventions légitimes, importantes pour le besoin."
      },
      {
        "question": "Quand utiliser la moyenne plutôt que la médiane ?",
        "expected": "Pour une charge moyenne ou un coût total à volume donné, avec distribution et limites."
      }
    ],
    "changeRequest": "Le responsable veut un engagement de délai : explique pourquoi ce descriptif seul ne suffit pas.",
    "reference": [
      {
        "title": "Statistiques descriptives pandas",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.describe.html",
        "when": "Pour profiler les valeurs avant le commentaire métier."
      }
    ]
  },
  {
    "id": "a25",
    "title": "Identifier les équipements prioritaires",
    "request": "Quels équipements examiner en premier, et le classement est-il équitable ?",
    "expectedDeliverable": "Un classement des arrêts connus avec volume, exposition et couverture.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Total et taux",
        "explanation": "Un équipement plus utilisé peut cumuler davantage d’incidents sans être moins fiable. Présenter le volume et l’exposition avant un classement."
      },
      {
        "title": "Même population au numérateur et au dénominateur",
        "explanation": "Les heures prévues doivent couvrir les mêmes équipements et mois que les interventions retenues."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nx=load_data();f=x['interventions'];p=x['planned_hours']\nc=f.loc[f.status.eq('closed') & f.intervention_type.eq('corrective')]\na=c.groupby('asset_id').agg(events=('intervention_id','size'),minutes=('downtime_min','sum'))\ne=p.groupby('asset_id').planned_hours.sum()\nr=a.join(e,validate='one_to_one')\nr['events_per_1000h']=1000*r.events/r.planned_hours\nprint(r.sort_values('minutes',ascending=False).head())",
      "explanation": [
        "Le classement par minutes n’a pas la même signification que le taux d’incidents.",
        "La fenêtre du générateur est janvier à juin ; toute restriction doit être appliquée aux deux tables."
      ],
      "expected": "Un classement dont chaque chiffre peut être réconcilié avec les lignes source."
    },
    "yourTurn": {
      "instruction": "Propose trois équipements à examiner avec deux critères et une réserve sur les encours.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Période/exposition identiques.",
        "Volumes et taux distingués.",
        "Les encours et durées inconnues restent signalés."
      ]
    },
    "solution": {
      "steps": [
        "Définir la priorité métier : arrêt, coût ou incidents.",
        "Rattacher l’exposition sans multiplier les lignes.",
        "Comparer plusieurs critères et proposer une inspection ciblée."
      ],
      "language": "python",
      "code": "import pandas as pd\nf=pd.read_csv('outputs/interventions_validated.csv')\np=pd.read_csv('data/planned_hours.csv')\nf=f.loc[f.status.eq('closed') & f.intervention_type.eq('corrective')]\nr=f.groupby('asset_id').agg(events=('intervention_id','size'),cost_eur=('repair_cost_eur','sum'))\ne=p.groupby('asset_id').planned_hours.sum()\nr=r.join(e,validate='one_to_one');assert r.planned_hours.gt(0).all()\nr['events_per_1000h']=r.events*1000/r.planned_hours\nr.sort_values('cost_eur',ascending=False).to_csv('outputs/asset_priorities.csv')\nprint(r)",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Recalculer un équipement à la main.",
        "Tester un équipement sans exposition et refuser son taux."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les taux sont trop petits",
        "cause": "Heures et minutes mélangées",
        "fix": "Écrire les unités dans les noms et vérifier un exemple."
      },
      {
        "symptom": "Le total augmente après jointure",
        "cause": "Plusieurs lignes d’exposition rattachées à chaque événement",
        "fix": "Agréger l’exposition au grain voulu avant de joindre."
      }
    ],
    "managerQuestions": [
      {
        "question": "Le plus gros total signifie-t-il la plus mauvaise fiabilité ?",
        "expected": "Pas sans tenir compte de l’exposition, du mix et des données connues."
      },
      {
        "question": "Pourquoi ne pas sommer des taux ?",
        "expected": "Le total doit être recalculé comme somme des événements sur somme des expositions."
      }
    ],
    "changeRequest": "Le responsable ne peut examiner qu’un équipement : défends ton choix sans annoncer une cause de panne non démontrée.",
    "reference": [
      {
        "title": "Agrégations pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/groupby.html",
        "when": "Pour aligner le grain des deux tables avant jointure."
      }
    ]
  },
  {
    "id": "a26",
    "title": "Distinguer un constat d’une cause",
    "request": "Le responsable pense que le site explique les coûts : que peut-on réellement conclure ?",
    "expectedDeliverable": "Une note séparant observations, hypothèses et vérifications nécessaires.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Association descriptive",
        "explanation": "Une différence entre sites peut venir des équipements, du type d’intervention ou de la couverture. Ce dossier observationnel ne permet pas à lui seul d’attribuer une cause."
      },
      {
        "title": "Hypothèses testables",
        "explanation": "Une bonne recommandation propose une collecte ou comparaison qui pourrait contredire l’hypothèse, plutôt que la confirmer à tout prix."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nx=load_data();f=x['interventions'].merge(x['assets'],on='asset_id',validate='many_to_one')\nf=f.loc[f.status.eq('closed')]\nprint(f.groupby(['site','asset_type','intervention_type']).repair_cost_eur.agg(['count','mean']))\nclaim={'observation':'Comparer les coûts mesurés par groupe',\n       'hypothese':'Le mix ou les conditions locales peuvent contribuer',\n       'limite':'Données observationnelles synthétiques ; pas d’effet causal identifié'}\nprint(claim)",
      "explanation": [
        "Le tableau ouvre des pistes ; il ne désigne pas un responsable humain.",
        "Les sous-groupes révèlent aussi les comparaisons impossibles faute d’effectif."
      ],
      "expected": "Une comparaison conditionnelle et une formulation prudente, sans coefficient inventé."
    },
    "yourTurn": {
      "instruction": "Réécris trois phrases trop causales du brouillon et propose une vérification pour chacune.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Observation et hypothèse séparées.",
        "Facteurs non observés cités.",
        "Une prochaine vérification peut réfuter l’hypothèse."
      ]
    },
    "solution": {
      "steps": [
        "Relire la phrase et retrouver sa preuve.",
        "Lister les explications concurrentes.",
        "Proposer une donnée ou expérience discriminante."
      ],
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nnote={\n 'observation':'À remplir à partir du tableau mesuré, avec période et effectif',\n 'hypotheses':['Mix d’équipements','Types d’intervention','Couverture des coûts'],\n 'next_checks':['Comparer à type identique','Vérifier les encours','Interroger le responsable sur les pratiques'],\n 'conclusion':'Aucun effet causal attribué avec ce seul dossier'}\nPath('outputs').mkdir(exist_ok=True)\nPath('outputs/causal_limits.json').write_text(json.dumps(note,ensure_ascii=False,indent=2),encoding='utf-8')\nprint(note)",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Vérifier que chaque chiffre cité est calculé.",
        "Faire lire la conclusion par une personne qui découvre le dossier."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le rapport accuse une équipe",
        "cause": "Association prise pour une cause",
        "fix": "Revenir aux différences observées et aux explications concurrentes."
      },
      {
        "symptom": "Les groupes comparés n’ont pas le même mix",
        "cause": "Confusion de composition",
        "fix": "Présenter sous-groupes et limites de comparabilité."
      }
    ],
    "managerQuestions": [
      {
        "question": "Une corrélation suffit-elle pour décider de la cause ?",
        "expected": "Non ; elle motive une investigation."
      },
      {
        "question": "Comment rendre la suite utile malgré cette limite ?",
        "expected": "Proposer une vérification concrète et une action réversible proportionnée aux preuves."
      }
    ],
    "changeRequest": "Le responsable veut une phrase courte pour la direction : garde la limite qui change la décision.",
    "reference": [
      {
        "title": "Mesures par groupes",
        "url": "https://pandas.pydata.org/docs/user_guide/groupby.html",
        "when": "Pour vérifier ce qui est effectivement comparé."
      }
    ]
  },
  {
    "id": "a27",
    "title": "Évaluer la stabilité d’une moyenne",
    "request": "Le classement pourrait-il changer avec quelques équipements différents ?",
    "expectedDeliverable": "Une analyse de sensibilité du coût moyen, avec unité de rééchantillonnage expliquée.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Événements dépendants",
        "explanation": "Plusieurs interventions du même équipement peuvent se ressembler. Rééchantillonner les équipements préserve cette structure mieux que tirer les lignes indépendamment."
      },
      {
        "title": "Incertitude conditionnelle",
        "explanation": "Le bootstrap décrit une variabilité sous des hypothèses ; il ne répare ni biais de collecte ni données manquantes et ne garantit pas le futur."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nimport numpy as np\nf=load_data()['interventions'];f=f.loc[f.status.eq('closed')]\nassets=f.asset_id.unique();rng=np.random.default_rng(42);estimates=[]\nfor _ in range(300):\n    sampled=rng.choice(assets,size=len(assets),replace=True)\n    values=np.concatenate([f.loc[f.asset_id.eq(a),'repair_cost_eur'].to_numpy() for a in sampled])\n    estimates.append(values.mean())\nprint('Moyenne observée',f.repair_cost_eur.mean())\nprint('Intervalle bootstrap indicatif',np.quantile(estimates,[.025,.975]))",
      "explanation": [
        "Chaque équipement tiré apporte toutes ses interventions, y compris s’il est tiré plusieurs fois.",
        "La graine permet de reproduire ce contrôle pédagogique."
      ],
      "expected": "Un intervalle calculé, à présenter avec seulement douze équipements synthétiques et ses hypothèses."
    },
    "yourTurn": {
      "instruction": "Explique si la comparaison initiale reste utile après examen de sa stabilité et des limites du dossier.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Unité de tirage annoncée.",
        "Graine et répétitions conservées.",
        "Aucune généralisation au-delà des données sans argument."
      ]
    },
    "solution": {
      "steps": [
        "Identifier les dépendances entre lignes.",
        "Rééchantillonner à l’unité appropriée.",
        "Présenter estimation et limites de couverture ensemble."
      ],
      "language": "python",
      "code": "import pandas as pd,numpy as np\nf=pd.read_csv('outputs/interventions_validated.csv')\nf=f.loc[f.status.eq('closed') & f.repair_cost_eur.notna()]\ngroups=[g.repair_cost_eur.to_numpy() for _,g in f.groupby('asset_id')]\nif len(groups)<2: raise ValueError('Trop peu d’équipements pour ce contrôle')\nrng=np.random.default_rng(42)\nmeans=[np.concatenate([groups[i] for i in rng.integers(0,len(groups),len(groups))]).mean() for _ in range(300)]\nprint({'equipment_count':len(groups),'mean':f.repair_cost_eur.mean(),'bootstrap_range':np.quantile(means,[.025,.975]).tolist()})",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Relancer avec la même graine.",
        "Comparer au tirage ligne par ligne et expliquer la différence sans choisir le plus flatteur."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "L’intervalle paraît trop précis",
        "cause": "Dépendance des interventions ignorée",
        "fix": "Examiner le niveau de regroupement pertinent."
      },
      {
        "symptom": "Le bootstrap est présenté comme preuve de qualité de données",
        "cause": "Confusion incertitude/biais",
        "fix": "Conserver séparément les réserves sur les sources."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi tirer les équipements ?",
        "expected": "Pour conserver ensemble les événements dépendants d’un même équipement."
      },
      {
        "question": "Cette méthode corrige-t-elle les coûts manquants ?",
        "expected": "Non ; leur mécanisme et leur couverture restent à examiner."
      }
    ],
    "changeRequest": "Le responsable retire deux équipements du périmètre : recalcule et explique la sensibilité.",
    "reference": [
      {
        "title": "Générateur aléatoire NumPy",
        "url": "https://numpy.org/doc/stable/reference/random/generator.html",
        "when": "Pour un tirage reproductible, au moment du contrôle de stabilité."
      }
    ]
  },
  {
    "id": "a28",
    "title": "Comparer les sites sur les mêmes définitions",
    "request": "Les trois responsables de site contestent le même graphique. Comment réconcilier leurs chiffres ?",
    "expectedDeliverable": "Un tableau de réconciliation des définitions et écarts de périmètre.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Une métrique a un contrat",
        "explanation": "Nom, date utilisée, statuts, population et unité définissent le chiffre. Deux sommes peuvent être exactes tout en répondant à des questions différentes."
      },
      {
        "title": "Rapprocher les ensembles",
        "explanation": "Avant de débattre des graphiques, retrouver les identifiants inclus et exclus dans chaque version."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nimport pandas as pd\nx=load_data()['interventions']\nx['opened']=pd.to_datetime(x.opened_at,utc=True)\na=set(x.loc[x.opened.dt.month.eq(6),'intervention_id'])\nb=set(x.loc[x.opened.dt.month.eq(6) & x.status.eq('closed'),'intervention_id'])\nprint('Toutes ouvertures juin',len(a),'clôturées issues de juin',len(b))\nprint('Différence à expliquer',sorted(a-b))",
      "explanation": [
        "Les deux populations portent des noms distincts.",
        "Les identifiants transforment un désaccord abstrait en cas vérifiables."
      ],
      "expected": "La différence de comptage est entièrement expliquée par les lignes présentes dans un seul ensemble."
    },
    "yourTurn": {
      "instruction": "Confronte le bilan Excel, SQL et Python et documente toute différence de filtre ou de date.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Les définitions sont écrites.",
        "Les écarts se retrouvent dans des identifiants.",
        "Le total final se réconcilie sans ajustement arbitraire."
      ]
    },
    "solution": {
      "steps": [
        "Écrire la définition de chaque chiffre contesté.",
        "Comparer les lignes incluses.",
        "Faire approuver le contrat commun puis recalculer."
      ],
      "language": "python",
      "code": "import pandas as pd\nx=pd.read_csv('outputs/interventions_validated.csv')\nopened=pd.to_datetime(x.opened_at,utc=True)\nperiod=(opened>=pd.Timestamp('2026-06-01',tz='UTC'))&(opened<pd.Timestamp('2026-07-01',tz='UTC'))\nrows=x.loc[period,['intervention_id','status','repair_cost_eur']].copy()\nrows['in_closed_cost']=rows.status.eq('closed')&rows.repair_cost_eur.notna()\nrows.to_csv('outputs/june_scope_reconciliation.csv',index=False)\nprint(rows.groupby(['status','in_closed_cost']).size())",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Retrouver une intervention litigieuse.",
        "Comparer les mêmes filtres dans les trois outils."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le CSV et Power BI ne donnent pas le même total",
        "cause": "Filtres de page ou date différents",
        "fix": "Revenir à la population et aux identifiants."
      },
      {
        "symptom": "Un montant est corrigé à la main",
        "cause": "On masque le problème de définition",
        "fix": "Corriger le filtre ou la source et laisser une trace."
      }
    ],
    "managerQuestions": [
      {
        "question": "Que demander avant de comparer deux KPI ?",
        "expected": "Leurs définitions exactes et les ensembles de lignes."
      },
      {
        "question": "Quand un total différent est-il légitime ?",
        "expected": "Quand le périmètre diffère explicitement et correspond à une autre question."
      }
    ],
    "changeRequest": "Le responsable veut compter les clôtures intervenues en juin, quelle que soit leur date d’ouverture : adapte la définition.",
    "reference": [
      {
        "title": "Dates et périodes",
        "url": "https://pandas.pydata.org/docs/user_guide/timeseries.html",
        "when": "Pour coder une fenêtre explicite semi-ouverte."
      }
    ]
  },
  {
    "id": "a29",
    "title": "Proposer une décision proportionnée aux preuves",
    "request": "Quelle action concrète recommandes-tu pour le prochain mois ?",
    "expectedDeliverable": "Une recommandation courte avec preuve, réserve, propriétaire et mesure de suivi.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Constat et recommandation",
        "explanation": "Une action découle du constat mais doit aussi être réalisable. Une inspection ciblée est plus défendable qu’une promesse d’économie non mesurée."
      },
      {
        "title": "Vérifier l’effet ensuite",
        "explanation": "Fixer dès maintenant ce qui serait observé après l’action et ce qui pourrait expliquer un changement sans elle."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nrecommendation={\n 'finding':'À compléter avec le constat mesuré et ses sources',\n 'proposal':'Examiner les interventions récurrentes des équipements prioritaires',\n 'owner':'Responsable maintenance à confirmer',\n 'evidence':['outputs/asset_priorities.csv','outputs/cost_decomposition.csv'],\n 'limits':['Données synthétiques','Aucun effet causal démontré'],\n 'follow_up':'Suivre volume, exposition et coût connu à périmètre constant'}\nPath('outputs').mkdir(exist_ok=True)\nPath('outputs/recommendation.json').write_text(json.dumps(recommendation,ensure_ascii=False,indent=2),encoding='utf-8')\nprint(recommendation)",
      "explanation": [
        "Les liens doivent pointer vers des artefacts réellement produits.",
        "Une économie attendue ne devient pas une économie réalisée dans le rapport."
      ],
      "expected": "Une proposition traçable, encore à compléter par le constat effectivement calculé."
    },
    "yourTurn": {
      "instruction": "Rédige une recommandation de six lignes et défends une alternative que tu écartes.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Preuve et périmètre cités.",
        "Action et responsable identifiés.",
        "Effet espéré et résultat mesuré distingués."
      ]
    },
    "solution": {
      "steps": [
        "Choisir le constat qui change une décision.",
        "Proposer une action réversible et ses limites.",
        "Définir le suivi avec le responsable avant exécution."
      ],
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nr=json.loads(Path('outputs/recommendation.json').read_text(encoding='utf-8'))\nfor filename in r['evidence']:\n    if not Path(filename).is_file(): raise FileNotFoundError(filename)\nif 'À compléter' in r['finding']: raise ValueError('Le constat mesuré manque')\nassert r['proposal'] and r['follow_up'] and r['limits']\nprint('Structure et preuves présentes ; revue métier encore nécessaire.')",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Faire retrouver la preuve par une autre personne.",
        "Vérifier que la conclusion reste valable si une hypothèse est contestée."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Recommandation sans responsable",
        "cause": "Action peu opérable",
        "fix": "Définir propriétaire et date de revue."
      },
      {
        "symptom": "Gain présenté comme garanti",
        "cause": "Prédiction non testée",
        "fix": "Décrire l’effet attendu et le protocole de suivi."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi une action réversible peut-elle être préférable ?",
        "expected": "Elle permet d’apprendre avec un risque proportionné aux preuves."
      },
      {
        "question": "Que mesure le suivi ?",
        "expected": "Des indicateurs définis ; leur changement seul ne prouve pas la causalité."
      }
    ],
    "changeRequest": "La direction ne dispose d’aucun budget supplémentaire : propose une action compatible avec cette contrainte.",
    "reference": [
      {
        "title": "Documentation du rapport Power BI",
        "url": "https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips",
        "when": "Pour choisir les informations utiles à une décision, pas multiplier les visuels."
      }
    ]
  },
  {
    "id": "a30",
    "title": "Faire la revue du diagnostic avec le responsable",
    "request": "Présente ce que tu sais, ce qui reste incertain et ce que tu proposes de livrer.",
    "expectedDeliverable": "Un compte rendu de revue et une liste de modifications acceptées.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Rendre la discussion vérifiable",
        "explanation": "Partir de la question et du résultat, puis retrouver la ligne ou le calcul si nécessaire. Garder une limite qui change la décision."
      },
      {
        "title": "Traiter une demande de changement",
        "explanation": "Un nouveau filtre ou KPI peut modifier les dénominateurs et tout le rapport. Consigner le changement avant de toucher le calcul."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from pathlib import Path\nsections=['Question du responsable','Résultat mesuré','Preuve','Limite importante','Action proposée','Changement demandé','Décision de revue']\ntext='# Revue du diagnostic\\n\\n'+'\\n\\n'.join('## '+s+'\\nÀ renseigner.' for s in sections)\nPath('outputs').mkdir(exist_ok=True)\nPath('outputs/review.md').write_text(text,encoding='utf-8')\nprint('Prépare la revue avec tes résultats, pas des phrases préremplies comme acquises.')",
      "explanation": [
        "Le compte rendu conserve les désaccords et demandes.",
        "Une demande de filtre doit être reliée aux indicateurs qu’elle affecte."
      ],
      "expected": "Un support de revue à remplir avec les preuves du dossier."
    },
    "yourTurn": {
      "instruction": "Présente le diagnostic en cinq minutes puis traite une modification du besoin avec mon accompagnement.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Chiffres retrouvables.",
        "Limites qui changent la décision mentionnées.",
        "Changements et propriétaires consignés."
      ]
    },
    "solution": {
      "steps": [
        "Préparer trois constats maximum.",
        "Faire la démonstration sur les artefacts.",
        "Reformuler la demande et vérifier ses impacts avant modification."
      ],
      "language": "python",
      "code": "from pathlib import Path\np=Path('outputs/review.md')\ntext=p.read_text(encoding='utf-8')\nif 'À renseigner.' in text: raise ValueError('Compte rendu encore incomplet')\nrequired=['Preuve','Limite importante','Décision de revue']\nassert all(section in text for section in required)\nprint('Le compte rendu est renseigné ; vérifier la fidélité à la revue.')",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Faire relire le compte rendu par le responsable.",
        "Tester une nouvelle question sur le même dossier."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La présentation se limite au code",
        "cause": "Le besoin décisionnel a disparu",
        "fix": "Commencer par la réponse et sa portée."
      },
      {
        "symptom": "Une nouvelle mesure casse le bilan",
        "cause": "Dénominateur ou grain modifié",
        "fix": "Reprendre le contrat et les réconciliations."
      }
    ],
    "managerQuestions": [
      {
        "question": "Que présenter en premier ?",
        "expected": "La question, le constat mesuré et ce qu’il permet de décider."
      },
      {
        "question": "Que faire si tu ne sais pas répondre ?",
        "expected": "Décrire ce qui manque et proposer une vérification précise, sans inventer."
      }
    ],
    "changeRequest": "Le responsable souhaite désormais actualiser le suivi chaque mois sans ton aide : prépare la livraison.",
    "reference": [
      {
        "title": "Rapports orientés utilisateur",
        "url": "https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips",
        "when": "Pour vérifier que les informations correspondent aux décisions du lecteur."
      }
    ]
  },
  {
    "id": "a31",
    "title": "Rendre les imports Power BI actualisables",
    "request": "Le responsable veut changer le dossier source sans refaire le rapport.",
    "expectedDeliverable": "Une requête Power Query paramétrée, typée et contrôlée.",
    "prerequisites": [
      "Power BI Desktop sur Windows ; outputs/interventions_validated.csv produit et contrôlé.",
      "Paramètre texte pDataFolder créé dans Gérer les paramètres ; pas de séparateur final dans sa valeur."
    ],
    "reasoning": [
      {
        "title": "Le chemin est une configuration",
        "explanation": "Un chemin personnel codé partout empêche la reprise. Un paramètre de dossier et des noms de fichiers stables rendent la source compréhensible."
      },
      {
        "title": "Types et erreurs explicites",
        "explanation": "Un montant texte ou une date mal interprétée peut modifier les agrégations. Les erreurs de conversion doivent être examinées plutôt que remplacées aveuglément."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "powerquery",
      "code": "let\n    Source = Csv.Document(File.Contents(pDataFolder & \"\\interventions_validated.csv\"),\n        [Delimiter=\",\", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),\n    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),\n    Blanks = Table.ReplaceValue(Headers, \"\", null, Replacer.ReplaceValue, {\"closed_at\", \"downtime_min\", \"repair_cost_eur\"}),\n    Typed = Table.TransformColumnTypes(Blanks, {\n        {\"intervention_id\", type text}, {\"asset_id\", type text},\n        {\"opened_at\", type datetimezone}, {\"closed_at\", type datetimezone},\n        {\"status\", type text}, {\"intervention_type\", type text},\n        {\"downtime_min\", type number}, {\"repair_cost_eur\", type number}}, \"en-US\"),\n    WithMonth = Table.AddColumn(Typed, \"month\", each Date.ToText(Date.From(DateTimeZone.RemoveZone(DateTimeZone.ToUtc([opened_at]))), \"yyyy-MM\"), type text)\nin\n    WithMonth",
      "explanation": [
        "Dans Power BI Desktop, créer le paramètre texte pDataFolder pointant vers outputs, puis une requête vide et coller le code dans l’éditeur avancé.",
        "La requête se nommera Interventions. Les timestamps sont ISO UTC et les nombres utilisent le point décimal dans le CSV validé.",
        "WithMonth crée une clé texte YYYY-MM pour la dimension Month, sans joindre directement les deux tables de faits."
      ],
      "expected": "La requête lit le fichier validé ; tout problème de type doit être traité avant chargement."
    },
    "yourTurn": {
      "instruction": "Construis l’import dans Power BI et prouve qu’un changement de dossier source n’exige pas de réécrire les étapes.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Chemin paramétré.",
        "Types contrôlés et erreurs examinées.",
        "Nombre de lignes réconcilié avec le CSV."
      ]
    },
    "solution": {
      "steps": [
        "Créer pDataFolder puis importer le CSV UTF-8.",
        "Promouvoir les en-têtes et typer avec une culture explicite.",
        "Contrôler lignes, erreurs et aperçu avant Fermer et appliquer."
      ],
      "language": "powerquery",
      "code": "let\n    Source = Interventions,\n    ConversionErrors = Table.SelectRowsWithErrors(Source, {\"opened_at\", \"closed_at\", \"downtime_min\", \"repair_cost_eur\"}),\n    ErrorCount = Table.RowCount(ConversionErrors),\n    Checked = if ErrorCount > 0 then error \"Erreurs de conversion à traiter dans le dossier source\" else Source\nin\n    Checked",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable. Créer ce contrôle dans une seconde requête nommée QualityGate qui référence Interventions ; ne pas remplacer la requête Interventions par une référence à elle-même.",
      "verification": [
        "Actualiser après déplacement d’une copie du dossier.",
        "Comparer le nombre d’interventions au CSV et ouvrir une ligne connue."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Montants en erreur",
        "cause": "Culture ou séparateur incohérent",
        "fix": "Contrôler le CSV et typer avec la culture correspondante."
      },
      {
        "symptom": "Refresh réussi mais mauvais fichier",
        "cause": "Chemin resté personnel ou ancien",
        "fix": "Afficher et vérifier le paramètre de dossier."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi ne pas supprimer toutes les lignes en erreur ?",
        "expected": "Elles peuvent changer la couverture ; il faut les examiner et les tracer."
      },
      {
        "question": "Quel fichier entre dans le rapport ?",
        "expected": "Le dossier validé, pas le fichier brut imparfait ni le témoin propre utilisé pour les démonstrations."
      }
    ],
    "changeRequest": "Le fichier change de nom : prévois le message de diagnostic plutôt qu’un rapport vide.",
    "reference": [
      {
        "title": "Power Query types",
        "url": "https://learn.microsoft.com/en-us/power-query/data-types",
        "when": "Lors du typage et de l’interprétation des erreurs."
      }
    ]
  },
  {
    "id": "a32",
    "title": "Relier les tables sans multiplier les faits",
    "request": "Le même rapport doit filtrer par site et par mois tout en conservant les totaux.",
    "expectedDeliverable": "Un modèle en étoile et une preuve de cardinalité.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Une ligne de fait garde son grain",
        "explanation": "Interventions a une ligne par intervention. Assets a une ligne par équipement. Leur relation attendue est plusieurs-vers-un, pas une liaison ambiguë entre doublons."
      },
      {
        "title": "Deux tables de faits ne se joignent pas directement",
        "explanation": "Les heures prévues sont au grain équipement-mois. Les relier ligne à ligne aux interventions multiplierait les heures. Utiliser des dimensions partagées et des mesures adaptées."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nx=load_data();f=x['interventions'];a=x['assets'];p=x['planned_hours']\nassert a.asset_id.is_unique\nassert f.intervention_id.is_unique\nassert not p.duplicated(['asset_id','month']).any()\njoined=f.merge(a,on='asset_id',how='left',validate='many_to_one')\nassert len(joined)==len(f)\nprint('Relations à construire : Assets 1→* Interventions ; Assets 1→* PlannedHours.')\nprint('Conserver une dimension mois unique pour les deux faits mensuels.')",
      "explanation": [
        "Le contrôle Python sert de témoin des clés avant de créer les relations graphiques.",
        "Créer une dimension Month avec une seule ligne par mois, reliée aux deux faits via une clé YYYY-MM. Ne pas utiliser une colonne de mois non unique de Dates comme côté 1."
      ],
      "expected": "Les contrôles de clés passent et la jointure conserve exactement le nombre de faits."
    },
    "yourTurn": {
      "instruction": "Construis Assets, Interventions, PlannedHours et Month ; teste un filtre site/mois sans doublage des totaux.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Clés du côté 1 uniques.",
        "Relations et sens de filtre documentés.",
        "Les heures et coûts sont agrégés à leur propre grain."
      ]
    },
    "solution": {
      "steps": [
        "Vérifier clés et grains dans les sources.",
        "Créer les dimensions partagées avec clés uniques.",
        "Tester filtre et total sur un cas manuel."
      ],
      "language": "python",
      "code": "import pandas as pd\nf=pd.read_csv('outputs/interventions_validated.csv')\na=pd.read_csv('data/assets.csv');p=pd.read_csv('data/planned_hours.csv')\nassert a.asset_id.is_unique and not p.duplicated(['asset_id','month']).any()\nf['month']=pd.to_datetime(f.opened_at,utc=True).dt.strftime('%Y-%m')\nmonth=pd.DataFrame({'month':sorted(set(f.month)|set(p.month))})\nassert month.month.is_unique\nmonth.to_csv('outputs/dim_month.csv',index=False)\nprint('Faits',len(f),'assets',len(a),'mois',len(month))",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Sélectionner un site et réconcilier avec Python.",
        "Vérifier le total des heures sans passer par les lignes d’intervention."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Heures prévues multipliées",
        "cause": "Jointure directe entre faits de grains différents",
        "fix": "Agréger séparément et utiliser des dimensions partagées."
      },
      {
        "symptom": "Relations plusieurs-à-plusieurs inattendues",
        "cause": "Clé supposée unique dupliquée",
        "fix": "Corriger ou expliquer le grain avant relation."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi une dimension Month séparée ?",
        "expected": "Sa clé mois est unique et peut filtrer les deux faits mensuels."
      },
      {
        "question": "Un total correct suffit-il à valider le modèle ?",
        "expected": "Non ; tester également les sous-filtres et les lignes sans correspondance."
      }
    ],
    "changeRequest": "Ajoute un équipement sans intervention et vérifie qu’il conserve ses heures prévues.",
    "reference": [
      {
        "title": "Schéma en étoile",
        "url": "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema",
        "when": "Au moment de créer relations et dimensions."
      }
    ]
  },
  {
    "id": "a33",
    "title": "Créer les mesures du bilan dans Power BI",
    "request": "Le responsable veut les mêmes chiffres que dans le bilan validé, sous chaque filtre.",
    "expectedDeliverable": "Des mesures DAX pour effectif, coût et durée moyenne, réconciliées.",
    "prerequisites": [
      "Modèle Power BI des actions31–32 ; tables nommées Interventions et Assets.",
      "Vue Requête DAX disponible ; pour le rapport créer les mesures séparément après contrôle."
    ],
    "reasoning": [
      {
        "title": "Mesure et colonne",
        "explanation": "Une mesure est recalculée dans le contexte des filtres. Le coût moyen doit être somme des coûts connus divisée par le nombre de coûts connus du même périmètre."
      },
      {
        "title": "Un dénominateur cohérent",
        "explanation": "COUNTROWS compte des interventions ; COUNT sur la colonne de coût compte des valeurs connues. Leur différence doit être comprise pour les montants incomplets."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "dax",
      "code": "DEFINE\n    MEASURE Interventions[CoutClotureEUR] =\n        CALCULATE(SUM(Interventions[repair_cost_eur]), Interventions[status] = \"closed\")\n    MEASURE Interventions[NbCoutsConnus] =\n        CALCULATE(COUNT(Interventions[repair_cost_eur]), Interventions[status] = \"closed\")\n    MEASURE Interventions[CoutMoyenEUR] = DIVIDE([CoutClotureEUR], [NbCoutsConnus])\nEVALUATE\n    SUMMARIZECOLUMNS(Assets[site], \"CoutEUR\", [CoutClotureEUR], \"MoyenneEUR\", [CoutMoyenEUR])",
      "explanation": [
        "Dans la vue Requête DAX, exécuter le bloc entier. Pour les conserver dans le rapport, créer ensuite chaque mesure séparément dans le modèle.",
        "Assets et Interventions sont les noms de tables du modèle, reliées par asset_id."
      ],
      "expected": "Un tableau de coûts par site dont les valeurs doivent correspondre au témoin Python au même filtre."
    },
    "yourTurn": {
      "instruction": "Crée les mesures du bilan et vérifie site, mois et total global.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "DAX utilise les colonnes du modèle attendu.",
        "Les dénominateurs correspondent aux valeurs connues.",
        "Le total moyen est recalculé et non moyenné entre sites."
      ]
    },
    "solution": {
      "steps": [
        "Nommer et décrire chaque mesure.",
        "Tester les mesures dans une requête simple.",
        "Réconcilier chaque sous-filtre avec le bilan de référence."
      ],
      "language": "dax",
      "code": "DEFINE\n    MEASURE Interventions[DureeCorrectifMin] =\n        CALCULATE(SUM(Interventions[downtime_min]), Interventions[status] = \"closed\", Interventions[intervention_type] = \"corrective\")\n    MEASURE Interventions[NbDureesCorrectif] =\n        CALCULATE(COUNT(Interventions[downtime_min]), Interventions[status] = \"closed\", Interventions[intervention_type] = \"corrective\")\n    MEASURE Interventions[DureeMoyenneCorrectifMin] =\n        DIVIDE([DureeCorrectifMin], [NbDureesCorrectif])\nEVALUATE\n    ROW(\"MoyenneCorrectifMin\", [DureeMoyenneCorrectifMin])",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Recalculer numérateur et dénominateur séparément sur un site.",
        "Filtrer un cas sans ligne : DIVIDE doit éviter une division par zéro."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La moyenne totale est fausse",
        "cause": "Moyenne des moyennes de sites",
        "fix": "Recalculer à partir des sommes et effectifs connus."
      },
      {
        "symptom": "Le filtre site ne change rien",
        "cause": "Relation absente ou mauvais sens de filtre",
        "fix": "Vérifier le modèle avant de modifier la mesure."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi DIVIDE ?",
        "expected": "Il traite le dénominateur nul selon un comportement explicite."
      },
      {
        "question": "Pourquoi COUNT du coût plutôt que toutes les lignes ?",
        "expected": "La moyenne de coûts connus doit compter seulement les montants connus du périmètre."
      }
    ],
    "changeRequest": "Le responsable veut un nombre de clôtures distinct du nombre de coûts connus : ajoute les deux sans les confondre.",
    "reference": [
      {
        "title": "DAX CALCULATE",
        "url": "https://learn.microsoft.com/en-us/dax/calculate-function-dax",
        "when": "Pour comprendre les filtres qui définissent le périmètre de la mesure."
      },
      {
        "title": "DAX DIVIDE",
        "url": "https://learn.microsoft.com/en-us/dax/divide-function-dax",
        "when": "Au moment de gérer les dénominateurs nuls."
      }
    ]
  },
  {
    "id": "a34",
    "title": "Vérifier le comportement des filtres",
    "request": "Quand un site est sélectionné, que signifie la part du total affichée ?",
    "expectedDeliverable": "Un contrat de filtre et trois tests d’interaction.",
    "prerequisites": [
      "Modèle et mesures de l’action33 ; dimension Month reliée et filtres actifs."
    ],
    "reasoning": [
      {
        "title": "Le dénominateur peut garder ou retirer un filtre",
        "explanation": "Retirer le filtre site donne une part de tous les sites du contexte restant ; retirer tous les filtres donnerait une autre mesure."
      },
      {
        "title": "Tester les interactions",
        "explanation": "Une carte, un tableau et un graphique peuvent réagir différemment si leurs interactions sont configurées différemment."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "dax",
      "code": "DEFINE\n    MEASURE Interventions[CoutClotureEUR] =\n        CALCULATE(SUM(Interventions[repair_cost_eur]), Interventions[status] = \"closed\")\n    MEASURE Interventions[PartCoutTousSites] =\n        DIVIDE([CoutClotureEUR], CALCULATE([CoutClotureEUR], REMOVEFILTERS(Assets[site])))\nEVALUATE\n    SUMMARIZECOLUMNS(Assets[site], \"CoutEUR\", [CoutClotureEUR], \"PartTousSites\", [PartCoutTousSites])",
      "explanation": [
        "La mesure conserve les autres filtres, par exemple Month ; elle retire seulement Assets[site].",
        "Le libellé précise tous les sites, pas les sites actuellement sélectionnés uniquement."
      ],
      "expected": "Un tableau permettant de contrôler le numérateur et le total de référence."
    },
    "yourTurn": {
      "instruction": "Teste aucun filtre, un site, puis un mois ; écris ce qui doit changer pour chaque visuel.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Périmètre du dénominateur annoncé.",
        "Interactions testées explicitement.",
        "Aucune carte ne garde un ancien filtre invisible."
      ]
    },
    "solution": {
      "steps": [
        "Définir le sens de la part affichée.",
        "Construire la mesure en retirant uniquement le filtre nécessaire.",
        "Réconcilier les trois scénarios de filtre."
      ],
      "language": "dax",
      "code": "DEFINE\n    MEASURE Interventions[CoutClotureEUR] =\n        CALCULATE(SUM(Interventions[repair_cost_eur]), Interventions[status] = \"closed\")\n    MEASURE Interventions[DenominateurSites] =\n        CALCULATE([CoutClotureEUR], REMOVEFILTERS(Assets[site]))\nEVALUATE\n    SUMMARIZECOLUMNS(Assets[site], \"Numerateur\", [CoutClotureEUR], \"Denominateur\", [DenominateurSites])",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Comparer avec une somme manuelle par mois.",
        "Vérifier que retirer le filtre site ne retire pas le filtre mois."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La part vaut toujours 100 %",
        "cause": "Même filtre au numérateur et au dénominateur",
        "fix": "Contrôler la suppression du seul filtre voulu."
      },
      {
        "symptom": "La part change au clic sur un graphique sans explication",
        "cause": "Interaction croisée implicite",
        "fix": "Définir et tester les interactions visuelles."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi ne pas utiliser ALL sur toute la table ?",
        "expected": "Cela peut retirer des filtres que la définition doit conserver."
      },
      {
        "question": "Pourquoi afficher le dénominateur pendant le contrôle ?",
        "expected": "Pour vérifier directement ce qui sert de total de référence."
      }
    ],
    "changeRequest": "On demande maintenant une part parmi les sites sélectionnés : distingue cette nouvelle définition avant de coder.",
    "reference": [
      {
        "title": "DAX REMOVEFILTERS",
        "url": "https://learn.microsoft.com/en-us/dax/removefilters-function-dax",
        "when": "Pour contrôler le filtre retiré du dénominateur."
      }
    ]
  },
  {
    "id": "a35",
    "title": "Construire une page qui aide à décider",
    "request": "Le responsable ne veut pas vingt graphiques : il veut savoir où agir.",
    "expectedDeliverable": "Une page Power BI lisible avec trois questions et un détail inspectable.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "La hiérarchie suit la décision",
        "explanation": "Une vue principale répond aux questions prioritaires ; le détail permet de vérifier un cas. Les titres décrivent les mesures et leur portée."
      },
      {
        "title": "Ne pas cacher la couverture",
        "explanation": "Date d’arrêté, coûts inconnus, exclusions et encours peuvent changer l’interprétation. Ils doivent rester accessibles près du résultat concerné."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nimport pandas as pd\nx=load_data();f=x['interventions'].merge(x['assets'],on='asset_id',validate='many_to_one')\nc=f.loc[f.status.eq('closed')]\nsite=c.groupby('site').repair_cost_eur.agg(['sum','count','mean'])\nbacklog=f.loc[f.status.eq('open')].groupby('site').size()\nprint('Question1 : coûts par site\\n',site)\nprint('Question2 : encours par site\\n',backlog)\nprint('Question3 : interventions à examiner\\n',c.nlargest(5,'downtime_min')[['intervention_id','site','downtime_min']])",
      "explanation": [
        "Ces tables sont les témoins de contrôle des visuels, pas une maquette à décorer.",
        "Dans Power BI : une tendance mensuelle, une comparaison site et une table d’interventions avec filtres site/mois."
      ],
      "expected": "Trois sorties correspondant aux trois décisions de la page."
    },
    "yourTurn": {
      "instruction": "Construis la page, fais-la lire en deux minutes à un collègue puis corrige les ambiguïtés.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Chaque visuel répond à une question.",
        "Unités, dates et couverture sont accessibles.",
        "Le lecteur peut retrouver une intervention."
      ]
    },
    "solution": {
      "steps": [
        "Choisir trois questions prioritaires avec le responsable.",
        "Associer un visuel adapté et une table de détail.",
        "Tester lecture et filtres puis retirer les éléments inutiles."
      ],
      "language": "python",
      "code": "from pathlib import Path\nchecklist=[\n 'Quel est le coût connu sur le périmètre filtré ?',\n 'Quels équipements ou sites examiner ?',\n 'Quels dossiers restent ouverts ?',\n 'Peut-on retrouver la ligne source ?',\n 'La date d’arrêté et les exclusions sont-elles visibles ?']\nPath('outputs/dashboard_review.txt').write_text('\\n'.join(checklist),encoding='utf-8')\nprint('Faire tester ces questions sans expliquer d’abord la navigation.')",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Faire retrouver un KPI puis une ligne source.",
        "Tester sur écran réduit et vérifier unités/contraste."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le lecteur demande ce que signifie une carte",
        "cause": "Libellé ou périmètre vague",
        "fix": "Nommer population, unité et date utiles."
      },
      {
        "symptom": "Le dashboard est joli mais aucune action ne suit",
        "cause": "Questions métier absentes",
        "fix": "Revenir aux décisions prioritaires et retirer les visuels sans usage."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi limiter le nombre de visuels ?",
        "expected": "Pour concentrer l’attention sur les décisions, avec un détail accessible."
      },
      {
        "question": "Quand garder une réserve près du graphique ?",
        "expected": "Quand elle change la lecture du résultat, comme une couverture partielle."
      }
    ],
    "changeRequest": "Le responsable veut une vue exportable pour une réunion : prépare un état daté avec les filtres utilisés.",
    "reference": [
      {
        "title": "Conception des tableaux de bord",
        "url": "https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips",
        "when": "Pour la revue de lisibilité, après définition des questions."
      }
    ]
  },
  {
    "id": "a36",
    "title": "Automatiser le bilan sans masquer les rejets",
    "request": "Le mois prochain, on doit pouvoir relancer la préparation avec une commande.",
    "expectedDeliverable": "Un script de préparation avec sortie valide, rejets et bilan de couverture.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Automatiser une règle approuvée",
        "explanation": "Un script ne doit pas inventer une correction métier. Il applique des règles documentées et conserve les cas non résolus."
      },
      {
        "title": "Échec visible",
        "explanation": "Un fichier incomplet ou un schéma modifié doit produire un diagnostic, pas un beau tableau vide."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nimport pandas as pd\nx=load_data();f=x['interventions_dirty'].copy();a=x['assets']\nrequired={'intervention_id','asset_id','status','downtime_min','repair_cost_eur'}\nassert required<=set(f.columns)\nf['repair_cost_eur']=pd.to_numeric(f.repair_cost_eur.astype(str).str.replace(' ','',regex=False).str.replace(',','.',regex=False),errors='coerce')\nbad=f.intervention_id.duplicated(keep=False)|~f.asset_id.isin(a.asset_id)|pd.to_numeric(f.downtime_min,errors='coerce').lt(0)\nprint('Lignes à isoler',f.loc[bad,['intervention_id','asset_id']])\nprint('Ce contrôle ne corrige pas les causes et doit être complété pour les clôtures sans durée/coût.')",
      "explanation": [
        "Les doublons sont tous isolés en attendant une règle approuvée : ne pas choisir arbitrairement une version.",
        "La conversion d’un montant à virgule est une règle technique explicite ; l’inconnu reste manquant."
      ],
      "expected": "Un diagnostic reproductible des cas suspects du fichier sale."
    },
    "yourTurn": {
      "instruction": "Fais une commande qui produit outputs/interventions_validated.csv, rejects.csv et quality_summary.json selon les décisions de l’action10.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Règles approuvées versionnées.",
        "Rejets et couverture conservés.",
        "Aucune substitution silencieuse par le témoin propre.",
        "Le bilan témoin et ses preuves ne sont jamais présentés comme réconciliation du dossier corrigé."
      ]
    },
    "solution": {
      "steps": [
        "Valider le schéma avant transformation.",
        "Appliquer conversions, corrections approuvées et contrôles.",
        "Exporter acceptés/rejets et réconcilier les effectifs."
      ],
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nimport pandas as pd\nimport sqlite3\nfrom starter_data_analysis import prepare_validated_data\n# Dans ce cas simulé, la réponse du propriétaire a été examinée à l’action21.\nf=prepare_validated_data(approved=True)\nassets=pd.read_csv('data/assets.csv')\nx=f.merge(assets,on='asset_id',validate='many_to_one')\nx['month']=pd.to_datetime(x.opened_at,utc=True).dt.strftime('%Y-%m')\ncounts=x.groupby(['month','site','status']).size().unstack(fill_value=0).reindex(columns=['closed','open','cancelled'],fill_value=0)\nknown=x.loc[x.status.eq('closed')].groupby(['month','site'])[['downtime_min','repair_cost_eur']].sum(min_count=1)\nreport=counts.join(known).reset_index()\nreport.to_csv('outputs/monthly_report_validated.csv',index=False)\nPath('outputs/report_scope_validated.json').write_text(json.dumps({'source':'outputs/interventions_validated.csv','month_basis':'opened_at UTC','actual_status':'closed','synthetic':True},indent=2),encoding='utf-8')\nprint(json.loads(Path('outputs/quality_summary.json').read_text()))\nprint(report)\n\nwith sqlite3.connect('outputs/validated_analysis.db') as connection:\n    f.to_sql('interventions',connection,index=False,if_exists='replace')\n    assets.to_sql('assets',connection,index=False,if_exists='replace')\n# Une preuve précédente sur le témoin n’est pas une preuve sur le dossier validé.\nPath('outputs/reconciliation_validated.csv').unlink(missing_ok=True)\nprint('Réconciliation finale à refaire sur ce dossier ; le bilan témoin est conservé séparément.')\n",
      "explanation": "Le bilan témoin monthly_report.csv et sa réconciliation restent séparés. Le nouveau bilan monthly_report_validated.csv et la base validated_analysis.db utilisent le fichier reçu corrigé. Toute ancienne preuve de réconciliation finale est invalidée ; il faut refaire Excel/SQL/Python sur le même dossier approuvé.",
      "verification": [
        "Comparer les effectifs entrée/acceptés/rejets.",
        "Vérifier les cas injectés : doublon, équipement inconnu, durée négative et durée manquante.",
        "Vérifier entrée = acceptés + rejets + copies identiques supprimées, et la source du nouveau report_scope.json."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le script produit moins de lignes sans explication",
        "cause": "Filtre silencieux",
        "fix": "Conserver rejets, raisons et rapprochement des effectifs."
      },
      {
        "symptom": "Le témoin remplace les données de travail",
        "cause": "Confusion démonstration/livrable",
        "fix": "Lire la source brute et appliquer uniquement les règles approuvées."
      }
    ],
    "managerQuestions": [
      {
        "question": "Pourquoi ne pas garder simplement la première ligne du doublon ?",
        "expected": "La règle de résolution doit dépendre du dossier ; isoler si les versions sont ambiguës."
      },
      {
        "question": "Que prouve le rapprochement des effectifs ?",
        "expected": "Qu’aucune ligne ne disparaît sans être acceptée ou rejetée, pas que toutes les décisions métier sont justes."
      }
    ],
    "changeRequest": "Un nouveau statut apparaît : le traitement doit le signaler avant de mettre à jour les KPI.",
    "reference": [
      {
        "title": "Conversion pandas",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html",
        "when": "Pour contrôler les conversions et leurs valeurs manquantes."
      }
    ]
  },
  {
    "id": "a37",
    "title": "Détecter une rupture avant l’actualisation",
    "request": "Comment savoir qu’un nouveau fichier a changé de structure ou dégradé la couverture ?",
    "expectedDeliverable": "Un contrôle de réception avec erreurs bloquantes et alertes explicites.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Contrat de données",
        "explanation": "Colonnes, clé, statuts et types définissent ce que le pipeline attend. Un changement de schéma est un problème à traiter, pas un détail à ignorer."
      },
      {
        "title": "Alerte et règle métier",
        "explanation": "Une baisse de volume n’est pas automatiquement une erreur. Les contrôles doivent distinguer invalidité certaine et variation à examiner."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nf=load_data()['interventions']\nrequired={'intervention_id','asset_id','opened_at','status','downtime_min','repair_cost_eur'}\nassert required<=set(f.columns)\nassert f.intervention_id.is_unique\nassert f.status.isin(['closed','open','cancelled']).all()\nprint('Contrat minimal vérifié ; examiner aussi couverture et fraîcheur avant utilisation.')",
      "explanation": [
        "Une colonne absente ou une clé dupliquée bloque l’usage de ce contrat.",
        "Une alerte de volume demande une investigation, sans imposer une correction arbitraire."
      ],
      "expected": "Un contrôle qui réussit sur le témoin et doit échouer sur des violations injectées."
    },
    "yourTurn": {
      "instruction": "Ajoute des tests au pipeline et démontre qu’un nouveau statut, une colonne absente et une clé dupliquée sont détectés.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Violations injectées réellement détectées.",
        "Messages indiquant le problème et sa localisation.",
        "Alertes de variation séparées des erreurs de structure."
      ]
    },
    "solution": {
      "steps": [
        "Lister les invariants approuvés.",
        "Créer de petits cas qui violent chaque invariant.",
        "Exécuter les contrôles avant export/actualisation et conserver le bilan."
      ],
      "language": "python",
      "code": "import pandas as pd\ndef check(f):\n    required={'intervention_id','asset_id','status'}\n    if not required<=set(f): raise ValueError('Colonnes obligatoires absentes')\n    if not f.intervention_id.is_unique: raise ValueError('Identifiant dupliqué')\n    if not f.status.isin(['closed','open','cancelled']).all(): raise ValueError('Statut inconnu')\nvalid=pd.DataFrame([{'intervention_id':'T1','asset_id':'A01','status':'closed'}])\ncheck(valid)\nfor broken in [valid.drop(columns='asset_id'),pd.concat([valid,valid]),valid.assign(status='new')]:\n    try: check(broken)\n    except ValueError as error: print('Détecté :',error)\n    else: raise AssertionError('Une violation a été ignorée')",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Exécuter les trois injections.",
        "Vérifier qu’une variation légitime de coût ne déclenche pas une correction automatique."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Un test réussit toujours",
        "cause": "Il ne provoque aucune violation",
        "fix": "Construire un cas qui doit échouer avant de conclure."
      },
      {
        "symptom": "Le pipeline corrige un volume inhabituel",
        "cause": "Variation confondue avec invalidité",
        "fix": "Émettre une alerte et rechercher la cause."
      }
    ],
    "managerQuestions": [
      {
        "question": "Une ligne de plus est-elle une erreur ?",
        "expected": "Pas nécessairement ; vérifier la clé, la période et la provenance."
      },
      {
        "question": "Pourquoi un message précis ?",
        "expected": "Pour permettre au collègue d’isoler le problème sans lire tout le code."
      }
    ],
    "changeRequest": "Le fichier n’arrive pas ce mois-ci : quelle fraîcheur doit afficher le tableau de bord ?",
    "reference": [
      {
        "title": "Tester les DataFrames",
        "url": "https://pandas.pydata.org/docs/reference/api/pandas.testing.assert_frame_equal.html",
        "when": "Lors de la comparaison des sorties de référence et des sorties recalculées."
      }
    ]
  },
  {
    "id": "a38",
    "title": "Préparer une livraison sans données superflues",
    "request": "Que peut-on transmettre au responsable et que faut-il garder dans le dossier de travail ?",
    "expectedDeliverable": "Un paquet de livraison avec provenance, accès et données minimales.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "Minimiser la donnée",
        "explanation": "Une restitution agrégée n’a pas toujours besoin des identifiants individuels. Le besoin du destinataire détermine ce qui est transmis."
      },
      {
        "title": "Un rapport public n’est pas un partage privé",
        "explanation": "Pour le stage, la livraison locale PBIX et les exports suffisent. Ne pas utiliser Publier sur le web pour des données d’entreprise confidentielles."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from starter_data_analysis import load_data\nfrom pathlib import Path\nf=load_data()['interventions'];f=f.loc[f.status.eq('closed')]\nr=f.groupby('intervention_type').agg(n=('intervention_id','size'),cost_eur=('repair_cost_eur','sum'))\nPath('outputs').mkdir(exist_ok=True)\nr.to_csv('outputs/management_summary.csv')\nprint('Restitution agrégée ; données synthétiques. Vérifier le besoin avant partage réel.')",
      "explanation": [
        "L’export répond à une question sans exposer toutes les lignes de travail.",
        "Un partage réel dépend des droits et procédures de l’entreprise ; aucune publication externe n’est réalisée par ce code."
      ],
      "expected": "Un export agrégé dont les totaux restent réconciliables."
    },
    "yourTurn": {
      "instruction": "Définis le paquet nécessaire au responsable, les pièces de contrôle internes et les limites de diffusion.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Seules les données utiles sont incluses.",
        "Provenance et date d’arrêté présentes.",
        "Aucune publication externe non demandée."
      ]
    },
    "solution": {
      "steps": [
        "Identifier le destinataire et son besoin.",
        "Séparer restitution et dossier de contrôle.",
        "Vérifier les champs et documenter les accès avant transfert."
      ],
      "language": "python",
      "code": "import pandas as pd\nfrom pathlib import Path\nf=pd.read_csv('outputs/interventions_validated.csv')\nc=f.loc[f.status.eq('closed')]\nr=c.groupby('intervention_type').agg(n=('intervention_id','size'),cost_eur=('repair_cost_eur','sum'))\nassert abs(r.cost_eur.sum()-c.repair_cost_eur.sum())<1e-8\nr.to_csv('outputs/management_summary.csv')\nPath('outputs/delivery_notes.txt').write_text('Données synthétiques. Remplacer cette note par provenance, date, périmètre et destinataire autorisé lors d’un usage réel.',encoding='utf-8')\nprint(r)",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Inspecter chaque colonne exportée.",
        "Vérifier que les totaux correspondent au bilan validé."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Export trop détaillé pour une simple synthèse",
        "cause": "Besoins et données mélangés",
        "fix": "Réduire aux champs nécessaires tout en gardant une piste de contrôle interne."
      },
      {
        "symptom": "Rapport partagé publiquement par facilité",
        "cause": "Mauvais mécanisme de diffusion",
        "fix": "Utiliser le mode de remise et les droits approuvés."
      }
    ],
    "managerQuestions": [
      {
        "question": "L’agrégation rend-elle toujours anonyme ?",
        "expected": "Non ; les petits groupes peuvent rester identifiables dans un contexte réel."
      },
      {
        "question": "Faut-il publier le dashboard sur Internet pour valider le projet ?",
        "expected": "Non ; une remise locale et une démonstration suffisent."
      }
    ],
    "changeRequest": "Le responsable veut les détails d’un équipement : préparer un export ciblé avec le périmètre explicite.",
    "reference": [
      {
        "title": "Power BI Publish to web",
        "url": "https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-publish-to-web",
        "when": "Pour comprendre pourquoi ce mécanisme ne convient pas à une donnée confidentielle."
      }
    ]
  },
  {
    "id": "a39",
    "title": "Faire reprendre le dossier par un collègue",
    "request": "Quelqu’un d’autre doit pouvoir refaire le bilan sans te demander où cliquer.",
    "expectedDeliverable": "Un README de passation, les requêtes, le rapport et les preuves de réconciliation.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC.",
      "Exporter le tableau croisé du dossier validé sous excel_validated_monthly.csv avec month,site,downtime_min,repair_cost_eur. Ne pas réutiliser l’export du témoin propre."
    ],
    "reasoning": [
      {
        "title": "La recette suit le besoin réel",
        "explanation": "Une livraison fonctionne quand le collègue exécute les instructions et retrouve les chiffres, pas seulement quand les fichiers existent."
      },
      {
        "title": "Versions et paramètres",
        "explanation": "Figer source, période, règles et versions évite que deux personnes produisent deux bilans sans comprendre la différence."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "from pathlib import Path\nfiles=['outputs/interventions_validated.csv','outputs/monthly_report_validated.csv','outputs/quality_summary.json']\nfor name in files:\n    if not Path(name).is_file(): print('À produire :',name)\nreadme=\"\"\"# Passation du bilan maintenance\n1. Identifier le lot reçu et sa date d’arrêté.\n2. Exécuter le script de validation approuvé ; examiner les rejets.\n3. Générer le bilan mensuel et rapprocher les totaux.\n4. Actualiser le fichier PBIX avec le bon paramètre de dossier.\n5. Vérifier filtres, couverture et trois chiffres témoins avant diffusion.\n\"\"\"\nPath('outputs').mkdir(exist_ok=True)\nPath('outputs/HANDOVER.md').write_text(readme,encoding='utf-8')\nprint('Compléter les commandes et chemins réellement livrés.')",
      "explanation": [
        "Le fichier PBIX doit être créé et testé dans Power BI ; ce script n’en fabrique pas un faux.",
        "La procédure doit indiquer comment traiter une erreur, pas uniquement le chemin heureux.",
        "Le rapport final est monthly_report_validated.csv. Les fichiers du témoin propre restent un exercice de contrôle distinct."
      ],
      "expected": "Une liste des pièces manquantes et un brouillon de passation à compléter."
    },
    "yourTurn": {
      "instruction": "Fais exécuter le dossier par un collègue et consigne tous les endroits où il a besoin de ton aide.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Les commandes et chemins sont réels.",
        "Le collègue retrouve les mêmes totaux.",
        "Les limites et cas d’erreur sont documentés."
      ]
    },
    "solution": {
      "steps": [
        "Préparer les fichiers et commandes exacts.",
        "Faire la recette depuis une copie de travail neuve.",
        "Corriger le guide puis rejouer sans aide implicite."
      ],
      "language": "python",
      "code": "from pathlib import Path\nimport hashlib,json,sqlite3\nimport pandas as pd\nreport_path=Path('outputs/monthly_report_validated.csv')\nexcel_path=Path('excel_validated_monthly.csv')\nif not excel_path.is_file(): raise FileNotFoundError('Exporter réellement le TCD du dossier validé vers excel_validated_monthly.csv avant réception')\nreference=pd.read_csv(report_path)\nexcel=pd.read_csv(excel_path)\nwith sqlite3.connect('outputs/validated_analysis.db') as connection:\n    sql=pd.read_sql_query(\"SELECT substr(opened_at,1,7) month,a.site,SUM(downtime_min) downtime_min,SUM(repair_cost_eur) repair_cost_eur FROM interventions i JOIN assets a USING(asset_id) WHERE status='closed' GROUP BY 1,2\",connection)\nkeys=['month','site'];measures=['downtime_min','repair_cost_eur']\nchecks=reference[keys+measures]\nfor name,other in [('sql',sql),('excel',excel)]:\n    if other.duplicated(keys).any(): raise ValueError('Clés de contrôle dupliquées')\n    checks=checks.merge(other[keys+measures],on=keys,how='outer',validate='one_to_one',suffixes=('', '_'+name),indicator=True)\n    if not checks.pop('_merge').eq('both').all(): raise ValueError('Périmètres de contrôle différents')\n    for col in measures:\n        delta=checks[col]-checks[col+'_'+name]\n        if delta.isna().any() or not delta.abs().le(0.005 if col=='repair_cost_eur' else 1e-9).all(): raise ValueError('Écart à expliquer : '+col+' / '+name)\nchecks.to_csv('outputs/reconciliation_validated.csv',index=False)\nrequired=['outputs/interventions_validated.csv',str(report_path),'outputs/quality_summary.json','outputs/HANDOVER.md',str(excel_path),'outputs/reconciliation_validated.csv']\nmanifest={name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in required}\nPath('outputs/delivery_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')\nprint('Dossier final réconcilié et identifié. Vérifier ensuite le PBIX et la passation humaine.')\n",
      "explanation": "Les trois outils doivent lire le même dossier approuvé. Les empreintes associent la preuve aux fichiers remis ; régénérer le bilan invalide cette preuve. Ce contrôle ne remplace pas la recette Power BI et la passation humaine.",
      "verification": [
        "Faire reproduire trois chiffres témoins.",
        "Faire traiter une entrée incorrecte à partir du guide."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le collègue trouve une dépendance non décrite",
        "cause": "Ton environnement masquait la dépendance",
        "fix": "Tester depuis une copie neuve et compléter les prérequis."
      },
      {
        "symptom": "Le PBIX n’est pas livré alors que la checklist dit oui",
        "cause": "Validation déclarative non vérifiée",
        "fix": "Demander le fichier réel et une actualisation observée."
      }
    ],
    "managerQuestions": [
      {
        "question": "Le hash prouve-t-il que le calcul est juste ?",
        "expected": "Non ; il identifie la version du fichier à contrôler."
      },
      {
        "question": "Comment reconnaître une bonne passation ?",
        "expected": "Le collègue peut exécuter, interpréter et diagnostiquer les erreurs à partir des pièces livrées."
      }
    ],
    "changeRequest": "Le collègue utilise un autre emplacement de dossier : prouve que la reprise reste possible.",
    "reference": [
      {
        "title": "Documentation README",
        "url": "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
        "when": "Pour rendre l’entrée du dossier compréhensible à quelqu’un qui le découvre."
      }
    ]
  },
  {
    "id": "a40",
    "title": "Prendre en charge le lot suivant en autonomie",
    "request": "Voici une nouvelle demande : actualiser le suivi, répondre à une question et expliquer un écart inattendu.",
    "expectedDeliverable": "Une démonstration de bout en bout avec bilan d’autonomie et points à renforcer.",
    "prerequisites": [
      "Dossier de travail du projet ; starter_data_analysis.py présent et commande python starter_data_analysis.py --output data exécutée.",
      "Python avec pandas pour les analyses ; les données sont synthétiques et les dates en UTC."
    ],
    "reasoning": [
      {
        "title": "L’autonomie se voit dans une variante",
        "explanation": "Rejouer un exemple connu ne suffit pas. Il faut prendre un nouveau lot, retrouver le contrat, vérifier les données et adapter le résultat."
      },
      {
        "title": "Demander de l’aide précisément",
        "explanation": "Un blocage bien décrit donne attendu, observé, entrée minimale et essais. C’est un comportement professionnel, pas un échec scolaire."
      }
    ],
    "guided": {
      "instruction": "On traite la demande ensemble. Exécute cet exemple dans le dossier du projet, puis inspecte les sorties avant de conclure. Le fichier interventions.csv est le témoin propre fourni pour les démonstrations ; ton livrable utilise le dossier validé et son registre d’anomalies.",
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nreview={'request':'Actualiser le suivi et répondre au responsable',\n 'evidence':[],\n 'observed':{'receive_and_check':None,'compute_and_reconcile':None,'explain':None,'handover':None},\n 'help_received':'À consigner',\n 'decision':'À revoir avec l’encadrant',\n 'next_action':'Une variante réelle du dossier, pas une répétition du tutoriel'}\nPath('outputs').mkdir(exist_ok=True)\nPath('outputs/autonomy_review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf-8')\nprint('Aucune compétence n’est prévalidée : renseigner après démonstration.')",
      "explanation": [
        "Les critères sont observés sur le travail, pas déduits du nombre de pages parcourues.",
        "Les preuves peuvent être un commit, une requête, un export, un fichier PBIX et une explication vérifiée."
      ],
      "expected": "Une grille vide prête à consigner une vraie revue de travail."
    },
    "yourTurn": {
      "instruction": "Réalise la demande de bout en bout ; présente le résultat et traite une question nouvelle sans correction ouverte.",
      "constraints": [
        "Conserver les données brutes et les identifiants ; aucune correction silencieuse.",
        "Préciser période, population, unités et exclusions dans le résultat."
      ],
      "checks": [
        "Données reçues et limites vérifiées.",
        "Calculs réconciliés et résultat expliqué.",
        "Niveau d’aide, preuves et points fragiles consignés."
      ]
    },
    "solution": {
      "steps": [
        "Reformuler la demande et le contrat de données.",
        "Exécuter la préparation et contrôler les résultats.",
        "Présenter, traiter la variante et consigner la revue avec l’encadrant."
      ],
      "language": "python",
      "code": "import json\nfrom pathlib import Path\nr=json.loads(Path('outputs/autonomy_review.json').read_text(encoding='utf-8'))\nobserved=r['observed']\ncomplete=all(type(v) is bool for v in observed.values())\nif r['decision']=='autonome' and not (complete and all(observed.values()) and r['evidence']):\n    raise ValueError('Déclaration sans preuves ou critères observés')\nprint('Grille renseignée :',complete,'preuves :',len(r['evidence']))\nprint('La justesse du travail doit être revue avec l’encadrant, pas par ce simple script.')",
      "explanation": "Cette solution montre une démarche contrôlable. Les valeurs doivent être recalculées sur ton dossier ; les données témoins ne remplacent pas les décisions de qualité prises avec le responsable.",
      "verification": [
        "Faire retrouver les sources d’un chiffre.",
        "Faire diagnostiquer une erreur nouvelle et noter l’aide reçue."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le lot nouveau casse le traitement",
        "cause": "Hypothèses cachées",
        "fix": "Isoler le cas et revoir le contrat avant de modifier le code."
      },
      {
        "symptom": "Tout est déclaré acquis sans artefact",
        "cause": "Revue non réalisée",
        "fix": "Observer une démonstration et conserver ses preuves."
      }
    ],
    "managerQuestions": [
      {
        "question": "Que fais-tu face à un chiffre impossible ?",
        "expected": "Vérifier source, périmètre, types et jointures avant de raconter une explication."
      },
      {
        "question": "Quand peux-tu dire qu’un bilan est prêt ?",
        "expected": "Quand les contrôles passent, les limites sont explicites et le destinataire peut l’utiliser et le reprendre."
      }
    ],
    "changeRequest": "Le responsable change la définition d’un KPI : estime l’impact, adapte le calcul et refais les contrôles.",
    "reference": [
      {
        "title": "Référence pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/index.html",
        "when": "Consulter seulement la fonction nécessaire au blocage rencontré, puis la tester sur un exemple minimal."
      }
    ]
  }
];
