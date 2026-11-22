import type { DailyLesson } from './types';
export const weeks5to8: DailyLesson[] = [
  {
    "id": "w5d1",
    "objective": "Transformer des prédictions ratées en une liste de causes vérifiables.",
    "prerequisites": [
      "Prédictions de validation conservées avec identifiant, classe réelle, classe prédite et provenance."
    ],
    "concepts": [
      {
        "title": "Distinguer résultat et cause",
        "explanation": "Faux positif et faux négatif décrivent le résultat. Annotation incorrecte, lumière, petit défaut ou mauvais cadrage sont des hypothèses de cause à contrôler sur l’image."
      },
      {
        "title": "Prioriser sans effacer les cas rares",
        "explanation": "Une cause fréquente mérite une action, mais un défaut dangereux rarement manqué peut être prioritaire. Conserver à la fois fréquence et coût dans le bilan."
      }
    ],
    "demonstration": {
      "title": "Construire une table d’erreurs",
      "instruction": "Exécute cet exemple autonome ; remplace ensuite les lignes par les prédictions de ton projet.",
      "code": "import csv\nfrom collections import Counter\nrows = [\n    {'id':'a','true':1,'pred':0,'cause':'faible contraste'},\n    {'id':'b','true':0,'pred':1,'cause':'reflet'},\n    {'id':'c','true':1,'pred':1,'cause':''},\n    {'id':'d','true':1,'pred':0,'cause':'annotation à contrôler'},\n]\nerrors = []\nfor row in rows:\n    if row['true'] == row['pred']:\n        continue\n    kind = 'FN' if row['true'] == 1 else 'FP'\n    errors.append({**row, 'kind':kind})\nwith open('errors.csv','w',newline='',encoding='utf-8') as f:\n    writer = csv.DictWriter(f,fieldnames=['id','true','pred','cause','kind'])\n    writer.writeheader(); writer.writerows(errors)\nprint(Counter(r['kind'] for r in errors))",
      "explanation": [
        "La cible 1 signifie défaut : un défaut prédit conforme est un FN.",
        "L’identifiant permet de retrouver l’image et de vérifier la cause ; le modèle seul ne fournit pas cette explication."
      ],
      "expected": "errors.csv contient trois erreurs : deux FN et un FP, sur ces données fabriquées."
    },
    "exercise": {
      "brief": "Construis une galerie de 20 erreurs réelles maximum, classées par type et hypothèse de cause. Choisis trois cas à vérifier avec l’encadrant.",
      "constraints": [
        "Travailler uniquement sur validation.",
        "Ne pas corriger un label sans justification visuelle."
      ],
      "deliverables": [
        "errors.csv",
        "Galerie image/vérité/prédiction",
        "Priorité et action proposées"
      ],
      "acceptance": [
        "Chaque cas pointe vers une image identifiable.",
        "Cause observée et hypothèse sont distinguées.",
        "Les erreurs rares importantes restent visibles."
      ]
    },
    "correction": {
      "steps": [
        "Fixer la signification de chaque classe.",
        "Calculer FP/FN à partir des cibles et prédictions.",
        "Vérifier les images, regrouper les causes et prioriser les actions."
      ],
      "code": "import csv\nfrom collections import defaultdict\n# Fichier produit dans la démonstration, puis enrichi manuellement.\nwith open('errors.csv',encoding='utf-8') as f:\n    rows = list(csv.DictReader(f))\ngroups = defaultdict(list)\nfor row in rows:\n    if not row['id'] or row['kind'] not in {'FP','FN'}:\n        raise ValueError('Erreur non traçable')\n    groups[(row['kind'],row['cause'])].append(row['id'])\nfor (kind,cause),ids in sorted(groups.items()):\n    print(kind, cause or 'cause inconnue', len(ids), ids)\nprint('À examiner :', [r['id'] for r in rows if 'contrôler' in r['cause']])",
      "explanation": "La correction produit une liste de cas à examiner, pas une preuve automatique de causalité. Une cause inconnue reste une information utile.",
      "verification": [
        "Contrôler manuellement un FP et un FN.",
        "Vérifier que le nombre de lignes égale le nombre de prédictions fausses."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Tout est appelé faux positif",
        "cause": "Convention de classe ambiguë",
        "fix": "Écrire explicitement défaut=1 puis vérifier un cas simple."
      },
      {
        "symptom": "La galerie ne retrouve pas les images",
        "cause": "Identifiants perdus après mélange du DataLoader",
        "fix": "Conserver les chemins avec chaque prédiction."
      }
    ],
    "challenge": "Un même FN peut venir d’une annotation fausse ou d’un faible contraste : quelles preuves permettent de trancher ?",
    "review": [
      {
        "question": "Pourquoi ne pas conclure immédiatement que le modèle est mauvais ?",
        "expected": "La vérité terrain ou le preprocessing peut être en cause ; inspecter le cas avant de modifier le réseau."
      },
      {
        "question": "Pourquoi garder les identifiants ?",
        "expected": "Pour retrouver et vérifier chaque image, puis comparer les versions."
      }
    ],
    "reading": [
      {
        "title": "Rapport par classe",
        "url": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html",
        "focus": "Comparer rappel et support de la classe défaut."
      }
    ]
  },
  {
    "id": "w5d2",
    "objective": "Tester les conditions d’acquisition en séparant les sous-groupes.",
    "prerequisites": [
      "OpenCV et NumPy ; images de validation et identifiants conservés."
    ],
    "concepts": [
      {
        "title": "Stress synthétique et réalité",
        "explanation": "Assombrir artificiellement une image vérifie une sensibilité ; cela ne remplace pas des acquisitions réelles en lumière différente."
      },
      {
        "title": "Mesures par condition",
        "explanation": "Un score global peut masquer l’échec systématique dans une condition. Documenter effectif, paramètres et provenance de chaque sous-groupe."
      }
    ],
    "demonstration": {
      "title": "Fabriquer des perturbations contrôlées",
      "instruction": "L’exemple crée une pièce synthétique et trois variantes ; il ne calcule aucune performance du modèle.",
      "code": "from pathlib import Path\nimport cv2\nimport numpy as np\nout = Path('stress'); out.mkdir(exist_ok=True)\nimage = np.full((160,240,3),210,dtype=np.uint8)\ncv2.rectangle(image,(60,40),(180,120),(65,65,65),-1)\nvariants = {\n    'original':image,\n    'sombre':np.clip(image.astype(np.float32)*0.45,0,255).astype(np.uint8),\n    'flou':cv2.GaussianBlur(image,(11,11),3),\n    'cache':image.copy(),\n}\nvariants['cache'][:,100:130] = 210\nfor name,variant in variants.items():\n    assert cv2.imwrite(str(out/f'{name}.png'),variant)\nprint('4 variantes sauvegardées ; inspecter avant inférence.')",
      "explanation": [
        "Convertir en float avant multiplication évite les surprises de dtype.",
        "Un dictionnaire de noms fixe la provenance des transformations."
      ],
      "expected": "Quatre images de même taille, avec des perturbations visibles et nommées."
    },
    "exercise": {
      "brief": "Constitue trois sous-groupes de conditions réelles ou contrôlées. Exécute le modèle gelé et compare les erreurs par condition.",
      "constraints": [
        "Garder les labels cohérents après transformation.",
        "Ne pas réentraîner pendant la mesure de robustesse."
      ],
      "deliverables": [
        "Paramètres des perturbations",
        "Tableau effectif/FP/FN par condition",
        "Limites d’acquisition proposées"
      ],
      "acceptance": [
        "Les paramètres sont reproductibles.",
        "Les effectifs et les cas réels/synthétiques sont distingués.",
        "Les défauts restent interprétables sur les images transformées."
      ]
    },
    "correction": {
      "steps": [
        "Vérifier visuellement chaque transformation.",
        "Exécuter les mêmes poids et seuils sur toutes les conditions.",
        "Comparer les erreurs et documenter les limites sans généraliser au-delà des données."
      ],
      "code": "import csv\nfrom collections import defaultdict\n# Exemple autonome : remplacer ces observations par les prédictions réelles.\nobservations = [('clair',1,1),('clair',0,0),('sombre',1,0),('sombre',0,1)]\nstats = defaultdict(lambda: {'n':0,'fp':0,'fn':0})\nfor condition,true,pred in observations:\n    s = stats[condition]; s['n'] += 1\n    s['fp'] += int(true==0 and pred==1)\n    s['fn'] += int(true==1 and pred==0)\nwith open('robustness.csv','w',newline='',encoding='utf-8') as f:\n    writer = csv.DictWriter(f,fieldnames=['condition','n','fp','fn'])\n    writer.writeheader()\n    writer.writerows({'condition':k,**v} for k,v in stats.items())\nprint(dict(stats))",
      "explanation": "Les effectifs minuscules servent à vérifier le calcul. Pour conclure sur ton modèle, utiliser un nombre de cas pertinent et annoncer les limites.",
      "verification": [
        "Ouvrir chaque perturbation.",
        "Vérifier que les poids et seuils sont identiques entre conditions."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "L’image devient noire brutalement",
        "cause": "Calcul numérique en uint8 ou facteur excessif",
        "fix": "Calculer en float, clipper puis inspecter."
      },
      {
        "symptom": "La comparaison semble meilleure après changement de seuil",
        "cause": "Plusieurs facteurs ont changé",
        "fix": "Geler le protocole et refaire une comparaison contrôlée."
      }
    ],
    "challenge": "Une lumière plus forte crée un reflet qui ressemble à un défaut : définir le complément de données à collecter.",
    "review": [
      {
        "question": "Un stress artificiel prouve-t-il la robustesse générale ?",
        "expected": "Non ; il teste une perturbation définie, à compléter par de nouvelles acquisitions réelles."
      },
      {
        "question": "Pourquoi annoncer le nombre d’images par condition ?",
        "expected": "Pour rendre visible la quantité de preuves et éviter une conclusion basée sur quelques cas."
      }
    ],
    "reading": [
      {
        "title": "OpenCV — filtrage",
        "url": "https://docs.opencv.org/4.x/d4/d13/tutorial_py_filtering.html",
        "focus": "Comparer paramètres du flou et apparence des petits défauts."
      }
    ]
  },
  {
    "id": "w5d3",
    "objective": "Corriger les données en conservant un historique et l’intégrité des splits.",
    "prerequisites": [
      "Manifeste CSV contenant path,label,group,split ; copies originales préservées."
    ],
    "concepts": [
      {
        "title": "Un label se corrige avec une preuve",
        "explanation": "Conserver ancienne valeur, nouvelle valeur, raison et identifiant. Ne pas effacer discrètement les cas difficiles."
      },
      {
        "title": "Un groupe ne traverse pas les splits",
        "explanation": "Une même pièce ou séquence peut produire plusieurs images. Le contrôle porte sur le groupe et sur les doublons de contenu."
      }
    ],
    "demonstration": {
      "title": "Détecter un groupe partagé",
      "instruction": "Ce contrôle autonome expose volontairement une fuite de données.",
      "code": "from collections import defaultdict\nrows = [\n {'path':'a.png','label':0,'group':'piece-1','split':'train'},\n {'path':'b.png','label':0,'group':'piece-1','split':'val'},\n {'path':'c.png','label':1,'group':'piece-2','split':'train'},\n]\nseen = defaultdict(set)\nfor r in rows:\n    seen[r['group']].add(r['split'])\nleaks = {g: sorted(s) for g,s in seen.items() if len(s)>1}\nprint('Groupes en fuite :', leaks)\nassert leaks == {'piece-1':['train','val']}",
      "explanation": [
        "Le contrôle utilise un identifiant métier stable, pas seulement le nom de fichier.",
        "Une fuite signalée doit être corrigée dans le manifeste avant la prochaine expérience."
      ],
      "expected": "piece-1 est détecté dans train et val ; le script montre le problème, sans modifier les données."
    },
    "exercise": {
      "brief": "Corrige les annotations confirmées, journalise chaque modification et reconstruis les splits sans consulter le test réservé.",
      "constraints": [
        "Préserver les originaux.",
        "Conserver l’identité de la pièce/du lot quand elle existe."
      ],
      "deliverables": [
        "change_log.csv",
        "Manifeste révisé",
        "Contrôle de groupes et doublons"
      ],
      "acceptance": [
        "Chaque correction a une raison.",
        "Aucun groupe partagé entre train et validation.",
        "Le test réservé reste inchangé."
      ]
    },
    "correction": {
      "steps": [
        "Geler une copie du manifeste original.",
        "Appliquer uniquement les corrections vérifiées et produire le journal.",
        "Relancer les audits de splits et de doublons avant entraînement."
      ],
      "code": "import csv\nfrom collections import defaultdict\nfrom pathlib import Path\n# Préparer manifest.csv : path,label,group,split.\nwith open('manifest.csv',encoding='utf-8') as f:\n    rows = list(csv.DictReader(f))\nby_group = defaultdict(set)\nfor row in rows:\n    if row['split'] not in {'train','val','test'}:\n        raise ValueError('Split inconnu')\n    by_group[row['group']].add(row['split'])\n    if not Path(row['path']).is_file():\n        raise FileNotFoundError(row['path'])\nleaks = [g for g,s in by_group.items() if len(s)>1]\nif leaks:\n    raise ValueError(f'Groupes partagés : {leaks}')\nprint('Contrôle groupes et chemins réussi ; auditer aussi le contenu des fichiers.')",
      "explanation": "Un audit réussi sur les groupes n’exclut pas les doublons sous des noms différents. Ajouter ensuite un hash de fichier pour rechercher les copies exactes.",
      "verification": [
        "Comparer le manifeste avant/après.",
        "Vérifier un groupe à la main.",
        "Conserver une version Git du manifeste, sans publier des images non redistribuables."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Aucun groupe disponible",
        "cause": "Métadonnée non fournie",
        "fix": "Rechercher provenance/lot ; noter explicitement la limite au lieu d’inventer un groupe."
      },
      {
        "symptom": "Le split est propre mais les scores restent suspects",
        "cause": "Doublons sous noms différents",
        "fix": "Comparer les hashes et les images presque identiques."
      }
    ],
    "challenge": "Ajoute un contrôle SHA-256 qui signale les copies exactes réparties entre splits.",
    "review": [
      {
        "question": "Pourquoi garder l’ancien label ?",
        "expected": "Pour expliquer les différences entre versions et pouvoir revenir sur une correction."
      },
      {
        "question": "Une absence de groupes suffit-elle à autoriser un split aléatoire ?",
        "expected": "Il faut examiner la dépendance des données et documenter ce que l’on ne peut pas vérifier."
      }
    ],
    "reading": [
      {
        "title": "Fuites de données",
        "url": "https://scikit-learn.org/stable/common_pitfalls.html",
        "focus": "Identifier ce qui, dans ton preprocessing et tes splits, pourrait utiliser le test."
      }
    ]
  },
  {
    "id": "w5d4",
    "objective": "Comparer avant/après sur les mêmes exemples et détecter les régressions.",
    "prerequisites": [
      "Prédictions baseline et nouvelle version sur les mêmes identifiants de validation."
    ],
    "concepts": [
      {
        "title": "Comparaison appariée",
        "explanation": "Comparer image par image permet de compter les erreurs corrigées et celles introduites. Des ensembles différents rendent l’attribution du gain ambiguë."
      },
      {
        "title": "Ne pas confondre bruit et progrès",
        "explanation": "Un petit changement de score sur peu de cas peut être instable. Décrire l’effectif et répéter selon le protocole avant une conclusion forte."
      }
    ],
    "demonstration": {
      "title": "Compter les transitions",
      "instruction": "Les valeurs ci-dessous sont fabriquées pour contrôler le raisonnement.",
      "code": "import numpy as np\ny = np.array([0,1,1,0,1,0])\nbefore = np.array([0,0,1,1,1,0])\nafter = np.array([1,1,1,0,1,0])\nbad_before = before != y\nbad_after = after != y\nfixed = np.flatnonzero(bad_before & ~bad_after)\nregressed = np.flatnonzero(~bad_before & bad_after)\nprint('Corrigés :',fixed.tolist())\nprint('Régressions :',regressed.tolist())\nprint('Erreurs avant/après :',bad_before.sum(),bad_after.sum())",
      "explanation": [
        "Les gains et régressions sont calculés sur les mêmes cibles.",
        "Un score meilleur n’autorise pas à cacher les nouveaux cas dégradés."
      ],
      "expected": "Deux erreurs sont corrigées et une nouvelle erreur apparaît dans l’exemple."
    },
    "exercise": {
      "brief": "Compare une modification ciblée à ta baseline. Présente cinq améliorations et tous les types de régression observés.",
      "constraints": [
        "Aligner par identifiant, pas par ordre implicite.",
        "Conserver les poids et configurations des deux versions."
      ],
      "deliverables": [
        "comparison.csv",
        "Galerie des transitions",
        "Décision conserver/rejeter"
      ],
      "acceptance": [
        "Les identifiants sont identiques.",
        "Les métriques métier et les régressions sont visibles.",
        "Une seule modification principale est attribuée au gain."
      ]
    },
    "correction": {
      "steps": [
        "Refuser les doublons ou identifiants manquants.",
        "Joindre les versions par identifiant puis comparer les décisions.",
        "Inspecter les transitions et décider selon les coûts métier."
      ],
      "code": "# Exemple autonome ; remplacer par les dictionnaires issus des deux exports.\ntruth = {'a':0,'b':1,'c':1,'d':0}\nbaseline = {'a':0,'b':0,'c':1,'d':1}\ncandidate = {'a':1,'b':1,'c':1,'d':0}\nif not truth.keys() == baseline.keys() == candidate.keys():\n    raise ValueError('Ensembles d’identifiants différents')\nfor id in sorted(truth):\n    old_ok = baseline[id] == truth[id]\n    new_ok = candidate[id] == truth[id]\n    transition = ('stable' if old_ok == new_ok else\n                  'corrigé' if new_ok else 'régression')\n    print(id, transition)",
      "explanation": "La jonction explicite empêche une permutation des prédictions de produire une fausse comparaison. Le verdict final dépend aussi des classes et conditions touchées.",
      "verification": [
        "Permuter volontairement l’ordre des exports : le résultat doit rester identique.",
        "Supprimer un identifiant : le contrôle doit échouer."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le score change après permutation des lignes",
        "cause": "Alignement par position",
        "fix": "Joindre les résultats par identifiant unique."
      },
      {
        "symptom": "Gain global mais défaut critique manqué",
        "cause": "Métrique non alignée au besoin",
        "fix": "Examiner rappel défaut et coût des erreurs avant décision."
      }
    ],
    "challenge": "Ajoute une comparaison par condition d’éclairage, puis explique un gain global accompagné d’une régression locale.",
    "review": [
      {
        "question": "Pourquoi une nouvelle erreur compte même si le score augmente ?",
        "expected": "Elle peut toucher une condition ou une classe dont le coût métier est élevé."
      },
      {
        "question": "Que faire si plusieurs facteurs ont changé ?",
        "expected": "Isoler les changements dans des expériences supplémentaires avant d’attribuer la cause."
      }
    ],
    "reading": [
      {
        "title": "Métriques de classification",
        "url": "https://scikit-learn.org/stable/modules/model_evaluation.html",
        "focus": "Choisir les métriques correspondant au coût des erreurs."
      }
    ]
  },
  {
    "id": "w5d5",
    "objective": "Présenter une amélioration défendable à un responsable technique.",
    "prerequisites": [
      "Tableau d’expériences et galerie avant/après des jours précédents."
    ],
    "concepts": [
      {
        "title": "Une conclusion suit une chaîne de preuves",
        "explanation": "Problème → hypothèse → expérience → mesure → décision. Une hypothèse plausible n’est pas un résultat."
      },
      {
        "title": "Signaler un blocage utile",
        "explanation": "Donner attendu, observé, exemple reproductible et essais réalisés. Le collègue doit pouvoir comprendre où intervenir."
      }
    ],
    "demonstration": {
      "title": "Rendre une note technique contrôlable",
      "instruction": "Structure autonome de note ; les résultats restent vides tant qu’ils ne sont pas mesurés.",
      "code": "import json\nfrom pathlib import Path\nnote = {\n 'problem':'Défauts peu contrastés manqués sur validation',\n 'hypothesis':'Manque d’exemples dans cette condition',\n 'change':'Compléter les exemples sans modifier le test',\n 'protocol':'Même validation, poids/configs archivés',\n 'measurements':None,\n 'decision':'À décider après mesure',\n 'limitations':['Acquisitions réelles supplémentaires nécessaires'],\n}\nPath('review_note.json').write_text(\n json.dumps(note,ensure_ascii=False,indent=2),encoding='utf-8')\nprint('Note créée sans résultat inventé.')",
      "explanation": [
        "None rend explicite l’absence de mesure.",
        "Le protocole et les limites permettent au lecteur de juger la conclusion."
      ],
      "expected": "Un fichier JSON lisible contenant hypothèse et protocole, mais aucune métrique fictive."
    },
    "exercise": {
      "brief": "Prépare une revue de cinq minutes et réponds à un cas difficile nouveau confié par l’encadrant.",
      "constraints": [
        "Montrer au moins un échec restant.",
        "Distinguer observations, hypothèses et prochaines actions."
      ],
      "deliverables": [
        "Note courte",
        "Exemples avant/après",
        "Cas autonome et explication"
      ],
      "acceptance": [
        "Une autre personne peut retrouver l’expérience.",
        "La conclusion repose sur les mesures.",
        "Le blocage restant comporte une prochaine action précise."
      ]
    },
    "correction": {
      "steps": [
        "Choisir une seule question principale pour la revue.",
        "Rassembler métriques, identifiants et configuration.",
        "Présenter le résultat, ses limites puis la décision proposée."
      ],
      "code": "import json\nfrom pathlib import Path\nnote = json.loads(Path('review_note.json').read_text(encoding='utf-8'))\nrequired = ['problem','hypothesis','change','protocol','decision','limitations']\nassert all(key in note for key in required)\nif note.get('measurements') is None:\n    print('REVUE INCOMPLÈTE : joindre les mesures avant de conclure.')\nelse:\n    print('Mesures présentes : vérifier leur source et leur protocole.')\nprint('Décision proposée :',note['decision'])\nprint('Limites :',note['limitations'])",
      "explanation": "Le contrôle détecte une note incomplète ; il n’évalue pas la vérité scientifique des mesures. L’encadrant doit pouvoir inspecter les artefacts.",
      "verification": [
        "Faire expliquer la conclusion sans ouvrir le code.",
        "Faire reproduire une erreur à partir de son identifiant."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La présentation liste uniquement les outils",
        "cause": "Le problème et la décision sont absents",
        "fix": "Commencer par le besoin, puis les preuves."
      },
      {
        "symptom": "Un collègue ne reproduit pas le blocage",
        "cause": "Informations manquantes",
        "fix": "Fournir commande, versions, entrée minimale et erreur exacte."
      }
    ],
    "challenge": "Le responsable demande de réduire les fausses alertes sans manquer davantage de défauts : explique ce qu’il faut mesurer avant de promettre.",
    "review": [
      {
        "question": "Peut-on valider la robustesse avec une belle démonstration ?",
        "expected": "Non ; la démonstration illustre le fonctionnement, l’évaluation et les sous-groupes apportent les preuves."
      },
      {
        "question": "Quelle prochaine action proposer si la cause reste inconnue ?",
        "expected": "Une expérience ou collecte ciblée qui distingue les hypothèses concurrentes."
      }
    ],
    "reading": [
      {
        "title": "Sauvegarder les expériences PyTorch",
        "url": "https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html",
        "focus": "Vérifier que la configuration nécessaire à la reproduction accompagne les poids."
      }
    ]
  },
  {
    "id": "w6d1",
    "objective": "Contrôler les masques avant tout apprentissage de segmentation.",
    "prerequisites": [
      "OpenCV, NumPy ; paires image/masque et définition de fond=0, défaut=1."
    ],
    "concepts": [
      {
        "title": "Même géométrie",
        "explanation": "Un masque associe un label à chaque pixel. Image et masque doivent subir les mêmes transformations géométriques, sinon le réseau reçoit des cibles fausses."
      },
      {
        "title": "Préserver les classes",
        "explanation": "Un masque de classes discrètes ne se redimensionne pas comme une photo. Le plus proche voisin conserve les valeurs ; un lissage peut créer des classes inexistantes."
      }
    ],
    "demonstration": {
      "title": "Visualiser une paire synthétique",
      "instruction": "Créer une image et son masque puis les redimensionner en préservant l’annotation.",
      "code": "from pathlib import Path\nimport cv2\nimport numpy as np\nimage = np.full((96,160,3),180,np.uint8)\nmask = np.zeros((96,160),np.uint8)\nimage[30:65,70:75] = (30,30,30)\nmask[30:65,70:75] = 1\nnew_image = cv2.resize(image,(320,192),interpolation=cv2.INTER_LINEAR)\nnew_mask = cv2.resize(mask,(320,192),interpolation=cv2.INTER_NEAREST)\nassert set(np.unique(new_mask)) <= {0,1}\noverlay = new_image.copy()\noverlay[new_mask==1] = (0,0,255)\nPath('masks').mkdir(exist_ok=True)\ncv2.imwrite('masks/overlay.png',overlay)\ncv2.imwrite('masks/mask.png',new_mask*255)\nprint(new_image.shape,new_mask.shape,np.unique(new_mask))",
      "explanation": [
        "Le masque interne contient 0/1 ; la multiplication par 255 sert seulement à sa visualisation.",
        "Les tailles OpenCV sont données en largeur,hauteur, alors que shape commence par hauteur,largeur."
      ],
      "expected": "Un défaut rouge superposé à la bonne position et uniquement deux valeurs de masque."
    },
    "exercise": {
      "brief": "Audite toutes les paires du train et de validation. Génère une galerie de superpositions et signale les fichiers sans partenaire.",
      "constraints": [
        "Ne pas normaliser le masque avec les statistiques RGB.",
        "Conserver les fichiers originaux."
      ],
      "deliverables": [
        "audit_masks.csv",
        "Galerie de superpositions",
        "Convention de masque documentée"
      ],
      "acceptance": [
        "Toutes les paires ont la même taille.",
        "Les valeurs de classes sont contrôlées.",
        "Les annotations vides sont identifiées, pas supprimées arbitrairement."
      ]
    },
    "correction": {
      "steps": [
        "Associer les fichiers par identifiant stable.",
        "Lire image et masque, vérifier taille et valeurs.",
        "Superposer un échantillon et examiner séparément les cas vides."
      ],
      "code": "from pathlib import Path\nimport cv2\nimport numpy as np\n# Préparer data/images/<id>.png et data/masks/<id>.png.\nfor path in sorted(Path('data/images').glob('*.png')):\n    image = cv2.imread(str(path))\n    target = Path('data/masks')/path.name\n    mask = cv2.imread(str(target),cv2.IMREAD_GRAYSCALE)\n    if image is None or mask is None:\n        raise ValueError(f'Paire illisible : {path.name}')\n    if image.shape[:2] != mask.shape:\n        raise ValueError(f'Taille différente : {path.name}')\n    if not set(np.unique(mask)) <= {0,255}:\n        raise ValueError(f'Valeurs inattendues : {path.name}')\n    print(path.name,'défaut présent=',bool((mask>0).any()))",
      "explanation": "Le code suppose des masques disque 0/255. Si le dataset utilise une autre convention, l’identifier puis adapter explicitement le contrôle.",
      "verification": [
        "Tester un masque vide, correct et volontairement mal dimensionné.",
        "Vérifier une paire issue de chaque source."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le masque contient 17,83,201",
        "cause": "Interpolation ou compression inadaptée",
        "fix": "Conserver un format sans perte et utiliser le plus proche voisin."
      },
      {
        "symptom": "Les défauts sont décalés après augmentation",
        "cause": "Tirages géométriques indépendants",
        "fix": "Partager les paramètres entre image et masque."
      }
    ],
    "challenge": "Ajoute une rotation et un recadrage synchronisés puis vérifie la superposition.",
    "review": [
      {
        "question": "Pourquoi ne pas appliquer la normalisation RGB au masque ?",
        "expected": "Le masque contient des classes ou cibles, pas des intensités à normaliser."
      },
      {
        "question": "Un masque vide est-il invalide ?",
        "expected": "Non, il peut représenter une image conforme ; vérifier la convention et l’annotation."
      }
    ],
    "reading": [
      {
        "title": "U-Net : architecture originale",
        "url": "https://arxiv.org/abs/1505.04597",
        "focus": "Observer le rôle des détails spatiaux et des connexions entre encodeur et décodeur."
      }
    ]
  },
  {
    "id": "w6d2",
    "objective": "Construire un U-Net minimal et vérifier les dimensions de sortie.",
    "prerequisites": [
      "PyTorch ; conventions N,C,H,W et cible binaire ; exercices de la veille."
    ],
    "concepts": [
      {
        "title": "Encoder et reconstruire",
        "explanation": "La réduction spatiale augmente le contexte ; le décodeur retrouve une résolution utile. La connexion de saut apporte les détails du niveau encodeur."
      },
      {
        "title": "Logits binaires",
        "explanation": "Pour une sortie N,1,H,W, BCEWithLogitsLoss attend une cible float de même forme. Ne pas ajouter sigmoid avant cette loss."
      }
    ],
    "demonstration": {
      "title": "Vérifier la loss et la synchronisation",
      "instruction": "Ce petit contrôle n’est pas encore un U-Net : il vérifie le contrat image/cible.",
      "code": "import torch\nimport torch.nn.functional as F\nimage = torch.rand(2,3,32,32)\nmask = torch.zeros(2,1,32,32)\nmask[:,:,8:24,14:17] = 1\n# Retournement identique des deux tenseurs.\nimage_flip = torch.flip(image,dims=[3])\nmask_flip = torch.flip(mask,dims=[3])\nlogits = torch.randn_like(mask_flip,requires_grad=True)\nloss = F.binary_cross_entropy_with_logits(logits,mask_flip)\nloss.backward()\nassert image_flip.shape == image.shape\nassert logits.grad is not None\nprint(logits.shape,mask_flip.dtype,float(loss.detach()))",
      "explanation": [
        "Le retournement spatial utilise le même axe pour image et masque.",
        "La loss reçoit les logits ; sigmoid sera utilisé pour interpréter les prédictions."
      ],
      "expected": "Une loss finie et un gradient présent avec une cible de même forme."
    },
    "exercise": {
      "brief": "Implémente un petit U-Net, puis vérifie un forward et un backward avant tout entraînement long.",
      "constraints": [
        "Une sortie par pixel et une seule classe défaut.",
        "Dimensions d’entrée compatibles ou interpolation explicite."
      ],
      "deliverables": [
        "unet.py",
        "Contrôle shapes et gradients",
        "Schéma verbal encodeur/décodeur"
      ],
      "acceptance": [
        "La sortie garde H,W.",
        "La connexion de saut est réellement utilisée.",
        "Les paramètres reçoivent des gradients."
      ]
    },
    "correction": {
      "steps": [
        "Construire un bloc de convolutions.",
        "Assembler encodeur, pooling, décodeur et concaténation.",
        "Vérifier forme, loss et backward sur un batch synthétique."
      ],
      "code": "# Enregistrer ce fichier sous unet.py pour les séances suivantes.\nimport torch\nfrom torch import nn\nimport torch.nn.functional as F\nclass TinyUNet(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.enc = nn.Sequential(nn.Conv2d(3,8,3,padding=1),nn.ReLU())\n        self.low = nn.Sequential(nn.Conv2d(8,16,3,padding=1),nn.ReLU())\n        self.dec = nn.Sequential(nn.Conv2d(24,8,3,padding=1),nn.ReLU(),nn.Conv2d(8,1,1))\n    def forward(self,x):\n        skip = self.enc(x)\n        low = self.low(F.max_pool2d(skip,2))\n        up = F.interpolate(low,size=skip.shape[-2:],mode='bilinear',align_corners=False)\n        return self.dec(torch.cat([skip,up],dim=1))\nif __name__ == '__main__':\n    model = TinyUNet()\n    logits = model(torch.rand(2,3,32,32))\n    target = torch.zeros_like(logits)\n    loss = F.binary_cross_entropy_with_logits(logits,target)\n    loss.backward()\n    assert logits.shape == (2,1,32,32)\n    assert model.enc[0].weight.grad is not None\n    print('Contrat U-Net minimal vérifié.')",
      "explanation": "C’est un U-Net pédagogique réduit à un niveau. Il permet de comprendre la connexion de saut ; il ne constitue pas à lui seul une solution industrielle performante.",
      "verification": [
        "Exécuter python unet.py.",
        "Tester une taille impaire et vérifier que la sortie garde ses dimensions."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Erreur de canaux à la concaténation",
        "cause": "8 canaux de skip plus 16 de décodeur",
        "fix": "La convolution suivante doit accepter 24 canaux."
      },
      {
        "symptom": "La loss attend une autre forme",
        "cause": "Cible N,H,W au lieu de N,1,H,W",
        "fix": "Ajouter explicitement le canal cible, sans changer les labels."
      }
    ],
    "challenge": "Ajoute un second niveau d’encodeur/décodeur et conserve les mêmes contrôles.",
    "review": [
      {
        "question": "Que fournit une connexion de saut ?",
        "expected": "Des détails spatiaux du niveau encodeur, combinés au contexte du décodeur."
      },
      {
        "question": "Pourquoi ne pas ajouter sigmoid avant BCEWithLogitsLoss ?",
        "expected": "Cette loss traite déjà les logits de manière numériquement adaptée."
      }
    ],
    "reading": [
      {
        "title": "BCEWithLogitsLoss",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html",
        "focus": "Vérifier formes, types et interprétation de la sortie."
      }
    ]
  },
  {
    "id": "w6d3",
    "objective": "Entraîner un segmentateur avec validation et sauvegarde du meilleur modèle.",
    "prerequisites": [
      "unet.py défini au jour précédent ; PyTorch ; paires image/masque auditées."
    ],
    "concepts": [
      {
        "title": "Contrôle rapide avant données réelles",
        "explanation": "Surapprendre quelques paires synthétiques permet de détecter un défaut du pipeline. Cela ne mesure pas la généralisation."
      },
      {
        "title": "Sélection du checkpoint",
        "explanation": "Entraîner sur train, mesurer sur validation sans gradients, sauvegarder selon une métrique fixée. Le test ne choisit ni époque ni seuil."
      }
    ],
    "demonstration": {
      "title": "Vérifier l’apprentissage sur un petit batch",
      "instruction": "Utilise TinyUNet enregistré dans unet.py. Ce batch artificiel sert uniquement au diagnostic.",
      "code": "import torch\nimport torch.nn.functional as F\nfrom unet import TinyUNet\ntorch.manual_seed(42)\nmodel = TinyUNet()\nx = torch.zeros(4,3,32,32)\ny = torch.zeros(4,1,32,32)\nx[:,:,8:24,14:18] = 1; y[:,:,8:24,14:18] = 1\noptimizer = torch.optim.Adam(model.parameters(),lr=0.01)\nlosses = []\nfor step in range(20):\n    model.train(); optimizer.zero_grad(set_to_none=True)\n    loss = F.binary_cross_entropy_with_logits(model(x),y)\n    loss.backward(); optimizer.step()\n    losses.append(float(loss.detach()))\nprint('Loss initiale/finale :',losses[0],losses[-1])",
      "explanation": [
        "Les entrées contiennent ici une signature artificielle facile ; cette facilité est volontaire.",
        "Examiner les masques, pas seulement la loss moyenne dominée par le fond."
      ],
      "expected": "Le programme produit une courbe courte à inspecter ; aucune performance réelle n’est prédéfinie."
    },
    "exercise": {
      "brief": "Entraîne U-Net sur tes paires réelles, suis la validation et conserve les masques d’exemples fixes à chaque époque.",
      "constraints": [
        "Séparer les jeux avant augmentation.",
        "Ne choisir ni poids ni seuil avec le test."
      ],
      "deliverables": [
        "Checkpoint",
        "Historique loss/Dice",
        "Galerie par époque"
      ],
      "acceptance": [
        "Validation sans mise à jour des poids.",
        "Checkpoint correspondant au meilleur critère défini.",
        "Masques et métriques portent sur les mêmes images."
      ]
    },
    "correction": {
      "steps": [
        "Créer DataLoader train et validation avec masques float N,1,H,W.",
        "Exécuter train puis eval à chaque époque.",
        "Sauvegarder les poids et le protocole dès amélioration de validation."
      ],
      "code": "# Nécessite unet.py ; démonstration complète sur données synthétiques.\nimport torch\nimport torch.nn.functional as F\nfrom unet import TinyUNet\ntorch.manual_seed(7)\nmodel = TinyUNet(); opt = torch.optim.Adam(model.parameters(),lr=0.01)\nx = torch.zeros(6,3,32,32); y = torch.zeros(6,1,32,32)\nfor i in range(6):\n    x[i,:,6+i:20+i,10:14] = 1; y[i,:,6+i:20+i,10:14] = 1\nbest = float('inf')\nfor epoch in range(12):\n    model.train(); opt.zero_grad(set_to_none=True)\n    loss = F.binary_cross_entropy_with_logits(model(x[:4]),y[:4])\n    loss.backward(); opt.step()\n    model.eval()\n    with torch.inference_mode():\n        val = float(F.binary_cross_entropy_with_logits(model(x[4:]),y[4:]))\n    if val < best:\n        best = val\n        torch.save({'state_dict':model.state_dict(),'epoch':epoch,'val_loss':val},'unet_best.pt')\n    print(epoch,float(loss.detach()),val)",
      "explanation": "La logique train/validation et la sauvegarde sont réutilisables. Le jeu synthétique minuscule ne démontre aucune fiabilité industrielle.",
      "verification": [
        "Relancer en vérifiant le contenu du checkpoint.",
        "Recharger les poids en mode eval et comparer une prédiction avant/après sauvegarde."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Loss faible mais aucun défaut prédit",
        "cause": "Fond très majoritaire",
        "fix": "Mesurer Dice/rappel défaut et inspecter les cibles ; traiter le déséquilibre de façon contrôlée."
      },
      {
        "symptom": "Validation instable ou trop bonne",
        "cause": "Mode ou fuite incorrects",
        "fix": "Vérifier model.eval, inference_mode et les identifiants des splits."
      }
    ],
    "challenge": "Ajoute un suivi Dice par image sans changer la règle de sélection en cours d’expérience.",
    "review": [
      {
        "question": "Pourquoi utiliser des exemples visuels fixes ?",
        "expected": "Pour comparer l’évolution qualitative sur les mêmes cas."
      },
      {
        "question": "Une loss train basse prouve-t-elle la généralisation ?",
        "expected": "Non ; elle mesure l’ajustement sur train, à compléter par une validation séparée."
      }
    ],
    "reading": [
      {
        "title": "PyTorch — optimisation",
        "url": "https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html",
        "focus": "Repérer les rôles distincts de train_loop et test_loop."
      }
    ]
  },
  {
    "id": "w6d4",
    "objective": "Choisir le seuil et le post-traitement sans cacher les petits défauts.",
    "prerequisites": [
      "Probabilités de validation et masques ; convention des cas vides fixée."
    ],
    "concepts": [
      {
        "title": "Le seuil fait partie du pipeline",
        "explanation": "La sortie probabiliste devient un masque par comparaison à un seuil. Ce seuil doit être choisi sur validation avec le coût des erreurs."
      },
      {
        "title": "Un nettoyage peut supprimer un défaut",
        "explanation": "Enlever toutes les petites régions réduit parfois les fausses alertes, mais peut effacer les défauts recherchés. Mesurer avant/après sur les petites zones."
      }
    ],
    "demonstration": {
      "title": "Explorer Dice et IoU selon le seuil",
      "instruction": "Utilise une carte jouet pour rendre chaque erreur visible.",
      "code": "import numpy as np\nprob = np.array([[.1,.4,.8],[.2,.7,.3]])\ntruth = np.array([[0,1,1],[0,1,0]],dtype=bool)\nfor threshold in [.3,.5,.75]:\n    pred = prob >= threshold\n    intersection = np.logical_and(pred,truth).sum()\n    union = np.logical_or(pred,truth).sum()\n    size = pred.sum()+truth.sum()\n    iou = intersection/union if union else 1.0\n    dice = 2*intersection/size if size else 1.0\n    print(threshold,'IoU',iou,'Dice',dice,'pixels prédits',pred.sum())",
      "explanation": [
        "Le seuil change les faux pixels positifs et négatifs.",
        "Deux masques vides donnent ici 1 par convention : annoncer cette convention."
      ],
      "expected": "Trois lignes permettent de relier le score aux pixels retenus."
    },
    "exercise": {
      "brief": "Compare deux seuils et un nettoyage morphologique sur validation, en isolant les petits défauts.",
      "constraints": [
        "Aucune sélection sur test.",
        "Conserver les masques bruts avant post-traitement."
      ],
      "deliverables": [
        "Tableau seuil/qualité",
        "Galerie avant/après",
        "Décision justifiée"
      ],
      "acceptance": [
        "Le calcul est vérifié sur des masques connus.",
        "Les cas vides sont traités explicitement.",
        "Les petits défauts supprimés sont comptés."
      ]
    },
    "correction": {
      "steps": [
        "Vérifier les métriques sur parfait/vide/décalé.",
        "Balayer les seuils sur validation et analyser par taille.",
        "Comparer le nettoyage au masque brut puis geler le pipeline retenu."
      ],
      "code": "import numpy as np\nimport cv2\nmask = np.zeros((32,32),np.uint8)\nmask[4:6,4:6] = 1  # Petit défaut réellement ciblé\nmask[14:24,14:24] = 1\nclean = cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))\ndef dice(a,b):\n    a,b = a.astype(bool),b.astype(bool)\n    size = a.sum()+b.sum()\n    return float(2*(a&b).sum()/size) if size else 1.0\nprint('Pixels avant/après :',int(mask.sum()),int(clean.sum()))\nprint('Dice contre la cible :',dice(clean,mask))\nassert clean[4:6,4:6].sum() == 0\nprint('Attention : ce nettoyage a effacé un petit défaut.')",
      "explanation": "Le script montre un échec mesurable d’un post-traitement pourtant courant. Il faut adapter la taille du noyau au besoin et comparer les erreurs.",
      "verification": [
        "Vérifier Dice=1 pour deux masques identiques.",
        "Examiner séparément toutes les zones sous la taille métier critique."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Score élevé sur beaucoup d’images sans défaut",
        "cause": "Cas vides dominants",
        "fix": "Rapporter les images avec défaut séparément."
      },
      {
        "symptom": "Les contours sont propres mais le rappel baisse",
        "cause": "Nettoyage trop agressif",
        "fix": "Comparer au masque brut et conserver les petits défauts pertinents."
      }
    ],
    "challenge": "Définis un seuil différent seulement si un protocole justifie ce choix ; explique le risque d’adapter au test.",
    "review": [
      {
        "question": "Pourquoi ne pas juger seulement la netteté visuelle ?",
        "expected": "Un masque joli peut supprimer des zones réellement défectueuses."
      },
      {
        "question": "Que rapporter pour les images sans défaut ?",
        "expected": "La convention vide et les fausses régions détectées, séparément des images positives."
      }
    ],
    "reading": [
      {
        "title": "OpenCV — morphologie",
        "url": "https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html",
        "focus": "Observer comment l’ouverture affecte les petites régions."
      }
    ]
  },
  {
    "id": "w6d5",
    "objective": "Livrer une inférence de segmentation interprétable et choisir la bonne tâche.",
    "prerequisites": [
      "unet.py et unet_best.pt des séances précédentes ; OpenCV ; preprocessing identique à l’entraînement."
    ],
    "concepts": [
      {
        "title": "Le masque est une sortie exploitable",
        "explanation": "Sauvegarder un masque binaire et un résumé structuré permet la mesure et l’intégration. La superposition aide à inspecter, mais ne remplace pas les valeurs."
      },
      {
        "title": "Classe, boîte ou masque",
        "explanation": "Une décision globale convient au tri ; une boîte localise un objet ; un masque décrit une région précise. Choisir selon le résultat attendu plutôt que selon le modèle le plus complexe."
      }
    ],
    "demonstration": {
      "title": "Superposer un masque sans modifier l’original",
      "instruction": "Exemple autonome de rendu et de contrôle du fichier.",
      "code": "from pathlib import Path\nimport cv2\nimport numpy as np\nimage = np.full((80,120,3),170,np.uint8)\nmask = np.zeros((80,120),np.uint8); mask[20:60,55:60] = 1\ncolor = image.copy(); color[mask.astype(bool)] = (0,0,255)\noverlay = cv2.addWeighted(image,.6,color,.4,0)\nout = Path('seg_outputs'); out.mkdir(exist_ok=True)\nassert cv2.imwrite(str(out/'mask.png'),mask*255)\nassert cv2.imwrite(str(out/'overlay.png'),overlay)\nreloaded = cv2.imread(str(out/'mask.png'),0)\nassert np.array_equal(reloaded,mask*255)\nprint('Aire en pixels² :',int(mask.sum()))",
      "explanation": [
        "L’original reste intact pour une nouvelle comparaison.",
        "La surface reste en pixels² tant qu’aucune calibration physique adaptée n’est disponible."
      ],
      "expected": "Un masque 0/255 fidèle après rechargement et une image de superposition."
    },
    "exercise": {
      "brief": "Crée un script d’inférence pour des images nouvelles et justifie la tâche à utiliser pour trois demandes métier.",
      "constraints": [
        "Reprendre exactement les transformations d’entraînement.",
        "Ne pas présenter une surface physique sans calibration."
      ],
      "deliverables": [
        "predict_seg.py",
        "Masques et superpositions",
        "Décision classe/boîte/masque sur trois besoins"
      ],
      "acceptance": [
        "Le modèle est rechargé indépendamment.",
        "Les sorties gardent la géométrie attendue.",
        "Un défaut manqué et une fausse zone sont expliqués."
      ]
    },
    "correction": {
      "steps": [
        "Charger architecture, poids et configuration.",
        "Préparer l’image et produire le masque en mode eval.",
        "Sauvegarder masque et superposition puis vérifier leur géométrie."
      ],
      "code": "# Nécessite unet.py et unet_best.pt ; même preprocessing RGB /255 que le modèle jouet.\nfrom pathlib import Path\nimport cv2\nimport torch\nimport numpy as np\nfrom unet import TinyUNet\npath = Path('data/nouvelle_piece.png')\nbgr = cv2.imread(str(path))\nif bgr is None: raise ValueError(f'Image illisible : {path}')\nrgb = cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)\nx = torch.from_numpy(rgb.transpose(2,0,1).copy()).float()[None]/255\nmodel = TinyUNet()\ncheckpoint = torch.load('unet_best.pt',map_location='cpu',weights_only=True)\nmodel.load_state_dict(checkpoint['state_dict']); model.eval()\nwith torch.inference_mode():\n    mask = (model(x).sigmoid()[0,0].numpy()>=.5).astype(np.uint8)\ncolor = bgr.copy(); color[mask==1] = (0,0,255)\ncv2.imwrite('segmentation.png',mask*255)\ncv2.imwrite('superposition.png',cv2.addWeighted(bgr,.6,color,.4,0))\nprint('Pixels défaut :',int(mask.sum()))",
      "explanation": "Un modèle entraîné seulement sur formes synthétiques ne sera pas fiable sur une vraie pièce. Ce script valide le chemin d’inférence ; remplacer les poids par ceux de ton entraînement réel avant une évaluation métier.",
      "verification": [
        "Comparer dimensions masque/image.",
        "Vérifier la même image avant et après sauvegarde des poids."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les couleurs sont incohérentes",
        "cause": "RGB/BGR mélangés",
        "fix": "Convertir explicitement à l’entrée et conserver BGR pour imwrite."
      },
      {
        "symptom": "Bonne démo synthétique, mauvais réel",
        "cause": "Domaine d’entraînement différent",
        "fix": "Entraîner et évaluer sur des données représentatives avant de conclure."
      }
    ],
    "challenge": "Le besoin passe du tri conforme/défaut à la mesure de l’étendue : explique les annotations supplémentaires nécessaires.",
    "review": [
      {
        "question": "Quand une classification suffit-elle ?",
        "expected": "Quand seule une décision globale est requise et que ses erreurs sont acceptables."
      },
      {
        "question": "Pourquoi sauvegarder aussi le masque brut ?",
        "expected": "Pour contrôler le post-traitement et reproduire les mesures."
      }
    ],
    "reading": [
      {
        "title": "U-Net de référence",
        "url": "https://github.com/milesial/Pytorch-UNet",
        "focus": "Repérer la séparation entre preprocessing, modèle et prédiction."
      }
    ]
  },
  {
    "id": "w7d1",
    "objective": "Construire une interface de programme stable hors du notebook.",
    "prerequisites": [
      "Python ; fonction de preprocessing et modèle retenu ; architecture et classes documentées."
    ],
    "concepts": [
      {
        "title": "Contrat d’entrée/sortie",
        "explanation": "Le script doit annoncer ce qu’il accepte et ce qu’il produit. Une configuration explicite évite les paramètres cachés dans des cellules."
      },
      {
        "title": "Séparer les responsabilités",
        "explanation": "Chargement, preprocessing, prédiction et rendu se testent séparément. Cela permet de remplacer le modèle sans réécrire la lecture des fichiers."
      }
    ],
    "demonstration": {
      "title": "Créer une commande vérifiable",
      "instruction": "Enregistre comme inspect_cli.py puis exécute python inspect_cli.py --help.",
      "code": "import argparse\nimport json\nfrom pathlib import Path\nparser = argparse.ArgumentParser(description='Inspection d’image')\nparser.add_argument('--input',type=Path,required=True)\nparser.add_argument('--output',type=Path,default=Path('result.json'))\nargs = parser.parse_args()\nif not args.input.is_file():\n    parser.error(f'Entrée absente : {args.input}')\nresult = {'input':str(args.input),'status':'entrée vérifiée'}\nargs.output.parent.mkdir(parents=True,exist_ok=True)\nargs.output.write_text(json.dumps(result,indent=2),encoding='utf-8')\nprint(args.output)",
      "explanation": [
        "argparse documente et valide le contrat de la commande.",
        "Une erreur de chemin doit être explicite avant le chargement du modèle."
      ],
      "expected": "Une aide lisible et un JSON pour une entrée existante ; ce squelette ne fait pas encore d’inférence."
    },
    "exercise": {
      "brief": "Restructure ton projet avec une commande predict, une configuration et des fonctions séparées. Conserve les résultats identiques à la version notebook.",
      "constraints": [
        "Aucun chemin personnel absolu.",
        "Même preprocessing et mêmes poids que la référence."
      ],
      "deliverables": [
        "predict.py --help",
        "Configuration versionnée",
        "Comparaison notebook/script"
      ],
      "acceptance": [
        "Les paramètres sont explicites.",
        "Les résultats sont cohérents avec la référence.",
        "Une entrée invalide produit une erreur compréhensible."
      ]
    },
    "correction": {
      "steps": [
        "Définir les arguments et le format de sortie.",
        "Isoler preprocessing et prédiction dans des fonctions.",
        "Comparer une entrée fixe avec la référence avant refactoring supplémentaire."
      ],
      "code": "# Exemple autonome de structure ; baseline seuil, pas un réseau entraîné.\nimport argparse,json\nfrom pathlib import Path\nimport cv2\nimport numpy as np\ndef preprocess(path):\n    image = cv2.imread(str(path),0)\n    if image is None: raise ValueError(f'Image illisible : {path}')\n    return image\ndef predict(image,threshold):\n    mask = image < threshold\n    return {'pixels_sombres':int(mask.sum()),'ratio':float(mask.mean())}\ndef main():\n    p = argparse.ArgumentParser()\n    p.add_argument('--input',type=Path,required=True)\n    p.add_argument('--threshold',type=int,default=100)\n    p.add_argument('--output',type=Path,default=Path('prediction.json'))\n    a = p.parse_args()\n    if not 0<=a.threshold<=255: p.error('Seuil entre 0 et 255 requis')\n    result = predict(preprocess(a.input),a.threshold)\n    a.output.parent.mkdir(parents=True,exist_ok=True)\n    a.output.write_text(json.dumps(result,indent=2),encoding='utf-8')\nif __name__ == '__main__': main()",
      "explanation": "Le contrat est autonome avec une baseline simple. Brancher ensuite le modèle retenu dans predict et son preprocessing dans preprocess sans changer les interfaces.",
      "verification": [
        "Lancer --help, puis une image valide et une image absente.",
        "Comparer les résultats à paramètres identiques."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le script dépend d’une cellule exécutée avant",
        "cause": "État global implicite",
        "fix": "Passer configuration et modèle explicitement."
      },
      {
        "symptom": "Les prédictions changent après refactoring",
        "cause": "Preprocessing ou mode du modèle modifié",
        "fix": "Comparer les tenseurs intermédiaires avec la référence."
      }
    ],
    "challenge": "Ajoute un fichier de configuration en conservant la priorité des arguments explicite.",
    "review": [
      {
        "question": "Pourquoi garder une baseline simple dans le pipeline ?",
        "expected": "Pour contrôler rapidement le contrat et disposer d’une comparaison."
      },
      {
        "question": "Que faut-il tester après extraction du notebook ?",
        "expected": "La même entrée, les mêmes paramètres et les mêmes sorties intermédiaires/finales."
      }
    ],
    "reading": [
      {
        "title": "Python argparse",
        "url": "https://docs.python.org/3/library/argparse.html",
        "focus": "Lire add_argument, types et messages d’erreur."
      }
    ]
  },
  {
    "id": "w7d2",
    "objective": "Traiter un dossier sans perdre les erreurs ni les identifiants.",
    "prerequisites": [
      "OpenCV ; dossier avec images variées et quelques fichiers invalides."
    ],
    "concepts": [
      {
        "title": "Un lot contient des cas invalides",
        "explanation": "Un fichier illisible ne doit pas interrompre silencieusement le dossier entier. Enregistrer un statut par entrée et fournir un bilan final."
      },
      {
        "title": "Sorties structurées",
        "explanation": "Un CSV ou JSON avec identifiant, résultat et paramètres peut être utilisé par une autre application. Une image annotée seule est difficile à exploiter."
      }
    ],
    "demonstration": {
      "title": "Inspecter un dossier de manière robuste",
      "instruction": "Prépare data/batch, puis ajoute un faux fichier .png pour tester le diagnostic.",
      "code": "from pathlib import Path\nimport cv2\nroot = Path('data/batch')\nif not root.is_dir(): raise FileNotFoundError(root)\nvalid = invalid = 0\nfor path in sorted(root.iterdir()):\n    if path.suffix.lower() not in {'.png','.jpg','.jpeg'}: continue\n    image = cv2.imread(str(path))\n    if image is None:\n        invalid += 1; print('ERREUR',path.name)\n        continue\n    valid += 1\n    print('OK',path.name,image.shape)\nprint('Valides',valid,'illisibles',invalid)",
      "explanation": [
        "Le tri stabilise l’ordre du rapport.",
        "Les fichiers ignorés par extension ne sont pas comptés comme prédictions réussies."
      ],
      "expected": "Chaque image candidate produit un statut, et un fichier illisible n’empêche pas les suivants d’être traités."
    },
    "exercise": {
      "brief": "Ajoute le traitement par lots à ton pipeline avec sorties structurées, logs et code de sortie documenté.",
      "constraints": [
        "Aucune exception masquée comme succès.",
        "Éviter les collisions de noms dans les sous-dossiers."
      ],
      "deliverables": [
        "results.csv",
        "errors.log",
        "Exemples de sorties annotées"
      ],
      "acceptance": [
        "Une ligne par entrée candidate.",
        "Les échecs restent traçables.",
        "La sortie indique le modèle et sa configuration."
      ]
    },
    "correction": {
      "steps": [
        "Énumérer les entrées selon un contrat documenté.",
        "Traiter chaque entrée avec un statut explicite.",
        "Écrire un rapport même si une partie du lot échoue."
      ],
      "code": "from pathlib import Path\nimport csv,cv2\nroot = Path('data/batch')\nif not root.is_dir(): raise FileNotFoundError(root)\nrows = []\nfor path in sorted(root.rglob('*')):\n    if path.suffix.lower() not in {'.png','.jpg','.jpeg'}: continue\n    image = cv2.imread(str(path),0)\n    row = {'id':path.relative_to(root).as_posix(),'status':'error','score':''}\n    if image is not None:\n        row.update(status='ok',score=float((image<100).mean()))\n    rows.append(row)\nwith open('results.csv','w',newline='',encoding='utf-8') as f:\n    writer=csv.DictWriter(f,fieldnames=['id','status','score'])\n    writer.writeheader(); writer.writerows(rows)\nprint('Entrées',len(rows),'erreurs',sum(r['status']=='error' for r in rows))",
      "explanation": "Le score ici est une baseline de pixels sombres, pas une probabilité de défaut. Remplacer par l’inférence du modèle et exporter les métadonnées de sa version.",
      "verification": [
        "Tester deux sous-dossiers contenant le même nom de fichier.",
        "Vérifier une ligne d’erreur après relecture du CSV."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Des résultats sont écrasés",
        "cause": "Noms de fichiers identiques",
        "fix": "Utiliser un identifiant relatif ou un hash stable."
      },
      {
        "symptom": "Le bilan annonce tout réussi",
        "cause": "Exceptions capturées sans statut",
        "fix": "Conserver une ligne error et compter les échecs."
      }
    ],
    "challenge": "Ajoute une reprise qui saute seulement les entrées déjà traitées avec la même version de modèle.",
    "review": [
      {
        "question": "Pourquoi garder une ligne pour les échecs ?",
        "expected": "Pour mesurer la couverture réelle du lot et retrouver les entrées à corriger."
      },
      {
        "question": "Peut-on nommer ce ratio une confiance du modèle ?",
        "expected": "Non, c’est une mesure de baseline ; sa sémantique doit rester explicite."
      }
    ],
    "reading": [
      {
        "title": "Python CSV",
        "url": "https://docs.python.org/3/library/csv.html",
        "focus": "Lire DictWriter et l’ouverture newline pour un export portable."
      }
    ]
  },
  {
    "id": "w7d3",
    "objective": "Exporter un modèle et contrôler l’équivalence des sorties.",
    "prerequisites": [
      "PyTorch, onnx, onnxscript et onnxruntime compatibles ; modèle de référence rechargé en eval."
    ],
    "concepts": [
      {
        "title": "Export et qualité sont distincts",
        "explanation": "Un fichier exporté sans erreur ne prouve pas que le pipeline produit les mêmes décisions. Comparer les mêmes entrées, classes et post-traitements."
      },
      {
        "title": "Formes et dtype",
        "explanation": "L’interface ONNX impose noms, formes et types. Un export à batch fixe doit être testé avec ce contrat avant d’envisager des dimensions dynamiques."
      }
    ],
    "demonstration": {
      "title": "Exporter un modèle pédagogique",
      "instruction": "Cet exemple autonome ne requiert ni poids téléchargés ni dataset. Installer les dépendances indiquées avant exécution.",
      "code": "import torch\nfrom torch import nn\nmodel = nn.Sequential(nn.Flatten(),nn.Linear(3*8*8,2)).eval()\nx = torch.zeros(1,3,8,8)\ntorch.onnx.export(model,(x,),'demo.onnx',\n    input_names=['images'],output_names=['logits'],dynamo=True)\nprint('Export créé : batch fixe 1, RGB 8x8 float32.')",
      "explanation": [
        "Le nom images est le contrat de l’entrée exportée.",
        "Une entrée jouet contrôle l’export ; elle ne démontre pas la qualité métier."
      ],
      "expected": "Un fichier demo.onnx et une interface aux dimensions déclarées."
    },
    "exercise": {
      "brief": "Exporte le modèle retenu et compare PyTorch/ONNX sur plusieurs images, y compris des cas difficiles.",
      "constraints": [
        "Même preprocessing.",
        "Tolérances numériques et décisions finales comparées."
      ],
      "deliverables": [
        "Modèle ONNX",
        "Comparaison numérique",
        "Contrat d’entrée/sortie"
      ],
      "acceptance": [
        "Les shapes et dtype sont inspectés.",
        "Les sorties sont proches dans une tolérance annoncée.",
        "Les décisions finales restent cohérentes aux seuils choisis."
      ]
    },
    "correction": {
      "steps": [
        "Recharger le modèle de référence en eval.",
        "Exporter avec une entrée de référence et inspecter la session.",
        "Comparer plusieurs sorties et post-traitements avant tout benchmark."
      ],
      "code": "import numpy as np\nimport torch\nfrom torch import nn\nimport onnxruntime as ort\ntorch.manual_seed(5)\nmodel = nn.Sequential(nn.Flatten(),nn.Linear(3*8*8,2)).eval()\nx = torch.rand(1,3,8,8)\ntorch.onnx.export(model,(x,),'checked.onnx',input_names=['images'],\n                  output_names=['logits'],dynamo=True)\nsession = ort.InferenceSession('checked.onnx',providers=['CPUExecutionProvider'])\nfor _ in range(3):\n    sample = torch.rand_like(x)\n    with torch.inference_mode(): reference = model(sample).numpy()\n    actual = session.run(None,{'images':sample.numpy()})[0]\n    np.testing.assert_allclose(actual,reference,rtol=1e-3,atol=1e-5)\n    assert np.array_equal(actual.argmax(1),reference.argmax(1))\nprint('Équivalence vérifiée sur trois entrées synthétiques.')",
      "explanation": "La tolérance doit être adaptée au modèle réel et aux décisions proches d’un seuil. Ce contrôle ne remplace pas l’évaluation sur les images représentatives.",
      "verification": [
        "Tester une entrée dont la décision est proche du seuil.",
        "Vérifier qu’un batch incompatible produit une erreur explicite."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Export impossible",
        "cause": "Opération ou dépendance incompatible",
        "fix": "Lire l’erreur, vérifier les versions et commencer par une entrée minimale."
      },
      {
        "symptom": "Shapes valides mais décisions différentes",
        "cause": "Preprocessing ou ordre des classes différent",
        "fix": "Comparer entrée numérique, logits puis post-traitement séparément."
      }
    ],
    "challenge": "Étudie les dimensions dynamiques seulement après une comparaison correcte au batch fixe.",
    "review": [
      {
        "question": "Pourquoi ne pas comparer seulement argmax ?",
        "expected": "De grands écarts de logits peuvent rester cachés tant que la classe ne change pas."
      },
      {
        "question": "Un export réussi garantit-il la généralisation ?",
        "expected": "Non ; c’est une vérification d’exécution et d’équivalence, pas de qualité du modèle."
      }
    ],
    "reading": [
      {
        "title": "Export ONNX PyTorch",
        "url": "https://docs.pytorch.org/tutorials/beginner/onnx/export_simple_model_to_onnx_tutorial.html",
        "focus": "Repérer les dépendances et le contrat de l’exporteur actuel."
      },
      {
        "title": "ONNX Runtime Python",
        "url": "https://onnxruntime.ai/docs/get-started/with-python.html",
        "focus": "Inspecter la session et exécuter une entrée."
      }
    ]
  },
  {
    "id": "w7d4",
    "objective": "Mesurer la latence de manière reproductible et choisir un compromis.",
    "prerequisites": [
      "PyTorch ; modèle et images fixes ; référence et export déjà comparés."
    ],
    "concepts": [
      {
        "title": "Warm-up et synchronisation",
        "explanation": "La première exécution peut charger des ressources. Sur GPU, les appels sont asynchrones : synchroniser avant et après la région mesurée."
      },
      {
        "title": "Modèle et pipeline complet",
        "explanation": "Le temps réseau seul exclut lecture, conversion et post-traitement. Documenter ces deux mesures, le matériel, la résolution et le batch."
      }
    ],
    "demonstration": {
      "title": "Mesurer une distribution de latences CPU",
      "instruction": "Cet exemple autonome mesure un petit réseau sans lecture d’image.",
      "code": "import time,statistics\nimport torch\nfrom torch import nn\nmodel = nn.Sequential(nn.Conv2d(3,8,3,padding=1),nn.ReLU()).eval()\nx = torch.rand(1,3,64,64)\nwith torch.inference_mode():\n    for _ in range(5): model(x)\n    times=[]\n    for _ in range(20):\n        start=time.perf_counter(); model(x)\n        times.append((time.perf_counter()-start)*1000)\nprint('CPU, batch1, 64x64 : médiane ms',statistics.median(times))\nprint('Min/max ms',min(times),max(times))",
      "explanation": [
        "Le warm-up est exclu des mesures.",
        "Rapporter plusieurs observations évite de prendre une exécution atypique pour une référence."
      ],
      "expected": "Une médiane et une étendue qui dépendent du matériel réel, sans valeur attendue inventée."
    },
    "exercise": {
      "brief": "Compare deux résolutions ou backends en conservant la qualité mesurée et le protocole de temps explicite.",
      "constraints": [
        "Pas de comparaison entre matériels non annoncés.",
        "Mesurer aussi le pipeline complet."
      ],
      "deliverables": [
        "benchmark.json",
        "Protocole matériel/backend/batch",
        "Choix qualité/latence"
      ],
      "acceptance": [
        "Warm-up et répétitions documentés.",
        "GPU synchronisé si utilisé.",
        "La qualité n’est pas supposée inchangée après réduction de résolution."
      ]
    },
    "correction": {
      "steps": [
        "Geler les entrées et les paramètres.",
        "Mesurer après warm-up avec synchronisation appropriée.",
        "Comparer distributions de temps et qualité puis décider selon le besoin."
      ],
      "code": "import time,json,statistics\nimport torch\nfrom torch import nn\ndevice=torch.device('cuda' if torch.cuda.is_available() else 'cpu')\nmodel=nn.Conv2d(3,8,3,padding=1).to(device).eval()\nx=torch.rand(1,3,64,64,device=device)\ndef sync():\n    if device.type=='cuda': torch.cuda.synchronize()\nwith torch.inference_mode():\n    for _ in range(5): model(x)\n    sync(); times=[]\n    for _ in range(30):\n        sync(); start=time.perf_counter(); model(x); sync()\n        times.append((time.perf_counter()-start)*1000)\nreport={'device':str(device),'shape':list(x.shape),'warmup':5,\n        'repetitions':30,'median_ms':statistics.median(times),\n        'scope':'modèle seul, tenseur déjà sur device'}\nwith open('benchmark.json','w') as f: json.dump(report,f,indent=2)\nprint(report)",
      "explanation": "La portée précise du benchmark empêche de présenter le temps modèle comme un temps de traitement complet. Ajouter ensuite les étapes d’entrée/sortie.",
      "verification": [
        "Relancer plusieurs fois et expliquer la variabilité.",
        "Comparer au temps complet de la commande predict."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le GPU paraît quasi instantané",
        "cause": "Travail asynchrone non synchronisé",
        "fix": "Synchroniser autour de la mesure."
      },
      {
        "symptom": "La première image est très lente",
        "cause": "Initialisation incluse",
        "fix": "Séparer démarrage à froid et régime après warm-up."
      }
    ],
    "challenge": "Ajoute un percentile 95 et explique quand il est plus utile que la moyenne.",
    "review": [
      {
        "question": "Pourquoi annoncer le batch ?",
        "expected": "Le temps et le débit dépendent du nombre d’images traitées ensemble."
      },
      {
        "question": "Que refaire après changement de résolution ?",
        "expected": "Mesurer à nouveau la qualité et la latence ; le compromis a changé."
      }
    ],
    "reading": [
      {
        "title": "PyTorch benchmark",
        "url": "https://docs.pytorch.org/tutorials/recipes/recipes/benchmark.html",
        "focus": "Lire warm-up, répétitions et synchronisation."
      }
    ]
  },
  {
    "id": "w7d5",
    "objective": "Faire exécuter le projet depuis un environnement neuf.",
    "prerequisites": [
      "Dépôt nettoyé ; fichier de dépendances ; poids et configuration identifiés."
    ],
    "concepts": [
      {
        "title": "Reproductible pour une autre personne",
        "explanation": "Un README doit suffire pour installer, préparer les données autorisées et lancer la commande. Il doit préciser les étapes manuelles et les ressources nécessaires."
      },
      {
        "title": "Tester le contrat réel",
        "explanation": "Le test de réception suit les instructions sans utiliser ton environnement habituel. Cela révèle chemins personnels, imports implicites et fichiers oubliés."
      }
    ],
    "demonstration": {
      "title": "Contrôler les artefacts de livraison",
      "instruction": "Adapte les noms au projet réel ; le script refuse un fichier manquant.",
      "code": "from pathlib import Path\nrequired=['README.md','requirements.txt','predict.py','config.json']\nmissing=[p for p in required if not Path(p).is_file()]\nif missing: raise FileNotFoundError(f'Fichiers absents : {missing}')\nprint('Fichiers présents. Vérifier maintenant leur contenu et les commandes.')\nprint('Windows : py -m venv .venv')\nprint(r'Puis : .venv\\Scripts\\python -m pip install -r requirements.txt')\nprint(r'Puis : .venv\\Scripts\\python predict.py --help')",
      "explanation": [
        "Les commandes Windows utilisent directement le Python du venv ; aucune activation PowerShell n’est obligatoire.",
        "La présence de fichiers est nécessaire, mais ne prouve pas que les commandes fonctionnent."
      ],
      "expected": "Un bilan des fichiers et une procédure à exécuter dans un environnement neuf."
    },
    "exercise": {
      "brief": "Fais suivre le README par une autre personne, relève chaque blocage puis corrige uniquement ce qui empêche la reproduction.",
      "constraints": [
        "Ne pas fournir de secrets ou données non redistribuables.",
        "Documenter où obtenir les poids et données."
      ],
      "deliverables": [
        "README exécuté",
        "Versions fixées",
        "Journal de réception"
      ],
      "acceptance": [
        "Installation depuis zéro réussie.",
        "Exemple fourni exécuté avec sortie vérifiée.",
        "Fichiers privés et dépendances implicites absents."
      ]
    },
    "correction": {
      "steps": [
        "Créer un venv neuf et installer les dépendances.",
        "Lancer --help puis une commande sur une entrée autorisée.",
        "Comparer la sortie à la référence et consigner les problèmes rencontrés."
      ],
      "code": "# À lancer depuis la racine du projet livré ; ne crée pas de faux résultat.\nimport subprocess,sys,hashlib\nfrom pathlib import Path\nchecks=[['predict.py','--help']]\nfor args in checks:\n    result=subprocess.run([sys.executable,*args],text=True,capture_output=True)\n    print('Commande :',args,'code retour :',result.returncode)\n    print(result.stdout)\n    if result.returncode: raise RuntimeError(result.stderr)\nconfig=Path('config.json')\nif config.is_file():\n    print('SHA256 config :',hashlib.sha256(config.read_bytes()).hexdigest())\nprint('Ajouter ensuite une commande d’inférence et comparer sa sortie attendue.')",
      "explanation": "Le contrôle d’aide est un premier smoke test. La réception n’est terminée qu’après une vraie inférence reproductible avec poids et preprocessing identifiés.",
      "verification": [
        "Exécuter depuis un chemin avec espaces.",
        "Faire la procédure sans ouvrir le notebook historique."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Cela marche seulement sur ton PC",
        "cause": "Fichier ou dépendance non décrit",
        "fix": "Repartir d’un environnement neuf et compléter le README."
      },
      {
        "symptom": "Les poids ne sont pas retrouvés",
        "cause": "Chemin implicite",
        "fix": "Accepter un argument/config et documenter l’emplacement attendu."
      }
    ],
    "challenge": "Fais exécuter le programme par une personne qui n’a pas participé au projet.",
    "review": [
      {
        "question": "Pourquoi tester hors de ton environnement ?",
        "expected": "Pour découvrir les dépendances et fichiers qui étaient disponibles par hasard."
      },
      {
        "question": "Le dépôt doit-il contenir toutes les images ?",
        "expected": "Seulement si la redistribution est autorisée ; sinon documenter leur préparation."
      }
    ],
    "reading": [
      {
        "title": "Python venv",
        "url": "https://docs.python.org/3/library/venv.html",
        "focus": "Créer un environnement et utiliser son interpréteur directement."
      }
    ]
  },
  {
    "id": "w8d1",
    "objective": "Transformer un besoin d’inspection en critères d’acceptation vérifiables.",
    "prerequisites": [
      "Cas d’usage industriel choisi ; limites de données et de matériel connues."
    ],
    "concepts": [
      {
        "title": "Définir la décision attendue",
        "explanation": "Préciser ce qui constitue un défaut, les conditions d’acquisition et la sortie utile. Un modèle ne peut pas résoudre une ambiguïté métier non discutée."
      },
      {
        "title": "Fixer les critères avant le test",
        "explanation": "Définir les métriques, unités et protocole avant d’observer le test final. Les seuils ci-dessous sont des exemples à négocier, jamais des performances promises."
      }
    ],
    "demonstration": {
      "title": "Écrire un contrat mesurable",
      "instruction": "Ce contrat exemple doit être adapté avec l’encadrant avant l’évaluation.",
      "code": "import json\nfrom pathlib import Path\ncontract={\n 'task':'classification conforme/défaut',\n 'positive_class':'défaut',\n 'scope':'images cadrées de la station de contrôle définie',\n 'criteria':[\n   {'metric':'recall_defect','operator':'>=','target':0.90},\n   {'metric':'pipeline_median_ms','operator':'<=','target':100.0}],\n 'test_manifest':'data/test_manifest.csv',\n 'unknowns':['Seuils à confirmer avec le besoin réel'],\n}\nPath('acceptance.json').write_text(json.dumps(contract,ensure_ascii=False,indent=2),encoding='utf-8')\nprint('Critères d’exemple, à valider avant test.')",
      "explanation": [
        "La portée décrit les images sur lesquelles l’engagement est défini.",
        "Le rappel de défaut et le temps pipeline ont des unités et des protocoles différents."
      ],
      "expected": "Un contrat lisible sans métrique mesurée fictive."
    },
    "exercise": {
      "brief": "Rédige le cahier des charges d’une inspection réalisable avec tes données et ton matériel.",
      "constraints": [
        "Ne pas déplacer les critères après lecture du test.",
        "Choisir seulement les briques utiles."
      ],
      "deliverables": [
        "Cahier des charges",
        "Critères et protocole",
        "Risques et hypothèses"
      ],
      "acceptance": [
        "La sortie métier est explicite.",
        "Chaque critère peut être mesuré.",
        "Les inconnues sont visibles et les seuils approuvés avant test."
      ]
    },
    "correction": {
      "steps": [
        "Clarifier défauts, erreurs coûteuses et conditions de prise de vue.",
        "Choisir tâche, métriques et protocole.",
        "Geler le contrat et noter les points encore non confirmés."
      ],
      "code": "import json\nfrom pathlib import Path\ncontract=json.loads(Path('acceptance.json').read_text(encoding='utf-8'))\nfor item in contract['criteria']:\n    if item['operator'] not in {'>=','<='}: raise ValueError('Opérateur inconnu')\n    if not isinstance(item['target'],(int,float)): raise ValueError('Cible non numérique')\n    print(item['metric'],item['operator'],item['target'])\nif contract.get('unknowns'):\n    print('À clarifier avant acceptation :',contract['unknowns'])\nprint('Le contrôle de structure ne remplace pas l’accord sur le besoin.')",
      "explanation": "Un schéma valide n’est pas un besoin validé. La revue doit confirmer que la mesure répond réellement à la décision de l’utilisateur.",
      "verification": [
        "Faire expliquer chaque critère par une autre personne.",
        "Vérifier les conditions d’acquisition incluses et exclues."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le cahier des charges demande seulement une bonne accuracy",
        "cause": "Coût des erreurs absent",
        "fix": "Définir défaut positif, rappel et fausses alertes pertinents."
      },
      {
        "symptom": "Les unités changent entre rapports",
        "cause": "Mesure non définie",
        "fix": "Fixer pixels/mm, ms/image et protocole explicitement."
      }
    ],
    "challenge": "Le client préfère moins de fausses alertes : reformule les critères sans promettre de satisfaire simultanément tous les compromis.",
    "review": [
      {
        "question": "Pourquoi fixer une portée ?",
        "expected": "Pour que l’on sache dans quelles conditions les résultats sont évalués."
      },
      {
        "question": "Peut-on modifier un objectif après le test ?",
        "expected": "Oui si le besoin change, mais il faut une nouvelle évaluation honnête, pas requalifier rétroactivement le même test."
      }
    ],
    "reading": [
      {
        "title": "Métriques et évaluation",
        "url": "https://scikit-learn.org/stable/modules/model_evaluation.html",
        "focus": "Relier les métriques aux erreurs qui coûtent au métier."
      }
    ]
  },
  {
    "id": "w8d2",
    "objective": "Intégrer les briques retenues et geler une version candidate.",
    "prerequisites": [
      "Pipeline du stage ; poids retenus sur validation ; contrat d’acceptation."
    ],
    "concepts": [
      {
        "title": "Une version représente un ensemble",
        "explanation": "Poids, code, preprocessing, classes et seuil forment une version. Changer un seul élément peut changer les décisions."
      },
      {
        "title": "Éviter les briques inutiles",
        "explanation": "Le pipeline final peut n’utiliser qu’un classifieur ou un segmentateur. Ne pas empiler les modèles sans gain vérifié et coût mesuré."
      }
    ],
    "demonstration": {
      "title": "Identifier les artefacts",
      "instruction": "Crée config.json et un fichier de poids avant d’utiliser ce contrôle.",
      "code": "from pathlib import Path\nimport hashlib,json\npaths=['config.json','artifacts/best.pt']\nmanifest={}\nfor name in paths:\n    path=Path(name)\n    if not path.is_file(): raise FileNotFoundError(path)\n    manifest[name]=hashlib.sha256(path.read_bytes()).hexdigest()\nPath('release_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')\nprint('Artefacts identifiés :',list(manifest))",
      "explanation": [
        "Un hash identifie exactement le contenu, pas seulement un nom de fichier réutilisé.",
        "Ce manifeste doit accompagner le commit de code et le protocole de validation."
      ],
      "expected": "Un manifeste d’empreintes correspondant aux fichiers réels."
    },
    "exercise": {
      "brief": "Assemble une commande finale qui prend une image nouvelle et produit la sortie métier définie.",
      "constraints": [
        "Aucun réglage à partir du test.",
        "Versionner configuration et référence des poids."
      ],
      "deliverables": [
        "Pipeline final",
        "Manifeste de version",
        "Exemple entrée/sortie"
      ],
      "acceptance": [
        "Les artefacts sont identifiés.",
        "Le pipeline respecte le contrat.",
        "Une exécution complète fonctionne sans cellule préalable."
      ]
    },
    "correction": {
      "steps": [
        "Choisir les briques utiles selon la validation.",
        "Assembler et vérifier une entrée connue de bout en bout.",
        "Geler les artefacts avant l’évaluation finale."
      ],
      "code": "from pathlib import Path\nimport hashlib,json\nmanifest=json.loads(Path('release_manifest.json').read_text(encoding='utf-8'))\nfor filename,expected in manifest.items():\n    path=Path(filename)\n    if not path.is_file(): raise FileNotFoundError(filename)\n    actual=hashlib.sha256(path.read_bytes()).hexdigest()\n    if actual!=expected: raise ValueError(f'Artefact changé : {filename}')\nprint('Version candidate inchangée.')\n# Exécuter ensuite la commande d’inférence documentée avec ces artefacts.",
      "explanation": "Le contrôle protège l’identité de la version évaluée. Il ne valide ni la qualité des poids ni la justesse du preprocessing.",
      "verification": [
        "Modifier une copie de config : le contrôle doit échouer.",
        "Rejouer la commande d’exemple depuis le README."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Deux résultats différents portent le même nom de version",
        "cause": "Poids ou configuration remplacés",
        "fix": "Identifier les contenus et conserver les versions."
      },
      {
        "symptom": "Le pipeline réclame une variable du notebook",
        "cause": "Intégration incomplète",
        "fix": "Passer explicitement l’information dans la configuration."
      }
    ],
    "challenge": "Explique quelle partie doit être réévaluée si le seuil change mais pas les poids.",
    "review": [
      {
        "question": "Pourquoi le nom best.pt ne suffit-il pas ?",
        "expected": "Le même nom peut désigner des contenus différents."
      },
      {
        "question": "Faut-il intégrer tous les modèles du stage ?",
        "expected": "Non ; seulement ceux nécessaires à la sortie et justifiés par l’évaluation."
      }
    ],
    "reading": [
      {
        "title": "Sauvegarde des modèles",
        "url": "https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html",
        "focus": "Distinguer poids, checkpoint et éléments nécessaires à la reprise."
      }
    ]
  },
  {
    "id": "w8d3",
    "objective": "Évaluer la version gelée sur le test réservé et annoncer ses limites.",
    "prerequisites": [
      "Contrat figé ; release_manifest vérifié ; test réservé ; prédictions identifiées."
    ],
    "concepts": [
      {
        "title": "Le test est une mesure finale",
        "explanation": "Une fois utilisé pour choisir les seuils ou l’architecture, il ne remplit plus son rôle de test indépendant. Une correction après lecture nécessite un nouveau protocole annoncé."
      },
      {
        "title": "Rapporter les effectifs",
        "explanation": "Un rappel sur quelques défauts a une portée limitée. Montrer nombre de cas, erreurs et sous-groupes ; ne pas promettre une fiabilité générale."
      }
    ],
    "demonstration": {
      "title": "Calculer une mesure finale traçable",
      "instruction": "Données fabriquées uniquement pour vérifier le calcul. Utiliser tes vraies prédictions pour le rapport.",
      "code": "import numpy as np\nfrom sklearn.metrics import confusion_matrix,precision_score,recall_score\ny=np.array([0,0,1,1,1,0])\npred=np.array([0,1,1,0,1,0])\nprint('Matrice [conforme,défaut] :')\nprint(confusion_matrix(y,pred,labels=[0,1]))\nprint('n',len(y),'défauts',int(y.sum()))\nprint('precision_defect',precision_score(y,pred,zero_division=0))\nprint('recall_defect',recall_score(y,pred,zero_division=0))",
      "explanation": [
        "La classe positive 1 correspond au défaut.",
        "Les métriques d’exemple ne sont pas des résultats de ton projet."
      ],
      "expected": "Une matrice et des métriques cohérentes avec six cibles connues."
    },
    "exercise": {
      "brief": "Exécute la version gelée sur le test réservé et compare chaque critère au contrat.",
      "constraints": [
        "Ne pas ajuster les seuils sur ce test.",
        "Rapporter les critères non atteints."
      ],
      "deliverables": [
        "Évaluation finale",
        "Verdicts critère par critère",
        "Galerie d’erreurs et limites"
      ],
      "acceptance": [
        "Identifiants et version évaluée conservés.",
        "Effectifs et métriques vérifiés.",
        "Aucun résultat manquant remplacé par une valeur inventée."
      ]
    },
    "correction": {
      "steps": [
        "Vérifier l’intégrité de la version et du split.",
        "Produire les prédictions puis calculer les métriques.",
        "Comparer au contrat en laissant les mesures absentes explicitement non évaluées."
      ],
      "code": "import json\nfrom pathlib import Path\ncontract=json.loads(Path('acceptance.json').read_text(encoding='utf-8'))\n# Remplir uniquement avec les mesures réellement calculées.\nmeasured=json.loads(Path('measured_metrics.json').read_text(encoding='utf-8'))\nverdicts=[]\nfor item in contract['criteria']:\n    value=measured.get(item['metric'])\n    if value is None:\n        verdict='non évalué'\n    else:\n        passed=value>=item['target'] if item['operator']=='>=' else value<=item['target']\n        verdict='atteint' if passed else 'non atteint'\n    verdicts.append({**item,'measured':value,'verdict':verdict})\nPath('final_verdicts.json').write_text(json.dumps(verdicts,ensure_ascii=False,indent=2),encoding='utf-8')\nfor row in verdicts: print(row)",
      "explanation": "Le temps d’inférence provient du benchmark réel, pas des métriques de classification. Toutes les mesures doivent pointer vers leur protocole.",
      "verification": [
        "Vérifier à la main les comptes de la matrice.",
        "Laisser une métrique absente et contrôler le verdict non évalué."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La meilleure configuration a été choisie sur le test",
        "cause": "Test utilisé comme validation",
        "fix": "Déclarer la limite et prévoir une nouvelle évaluation indépendante."
      },
      {
        "symptom": "Le rapport masque les images illisibles",
        "cause": "Couverture non mesurée",
        "fix": "Rapporter le nombre d’entrées rejetées et leur traitement."
      }
    ],
    "challenge": "Le critère de rappel n’est pas atteint : propose une prochaine expérience sans retoucher le test final.",
    "review": [
      {
        "question": "Pourquoi ne pas refaire des essais jusqu’au bon score test ?",
        "expected": "Cela adapte les choix au test et rend la mesure optimiste."
      },
      {
        "question": "Comment traiter une métrique absente ?",
        "expected": "La déclarer non évaluée, pas la remplacer par zéro ou une estimation présentée comme mesure."
      }
    ],
    "reading": [
      {
        "title": "Pièges d’évaluation",
        "url": "https://scikit-learn.org/stable/common_pitfalls.html",
        "focus": "Vérifier que le test n’a guidé aucun choix de modèle ou preprocessing."
      }
    ]
  },
  {
    "id": "w8d4",
    "objective": "Préparer une livraison lisible, reproductible et inspectable.",
    "prerequisites": [
      "Rapport final de mesures ; dépôt propre ; README exécuté ; exemples autorisés."
    ],
    "concepts": [
      {
        "title": "Le lecteur découvre le projet",
        "explanation": "Présenter besoin, données, méthode, comparaison, résultats et limites dans cet ordre. Le détail du réseau n’a de valeur que pour justifier un choix."
      },
      {
        "title": "Une livraison s’inspecte",
        "explanation": "Relier chaque résultat à un artefact et à une commande. Conserver les échecs représentatifs et expliquer les conditions d’utilisation."
      }
    ],
    "demonstration": {
      "title": "Construire un rapport à partir des verdicts réels",
      "instruction": "Nécessite final_verdicts.json produit à la séance précédente.",
      "code": "import json\nfrom pathlib import Path\nrows=json.loads(Path('final_verdicts.json').read_text(encoding='utf-8'))\nlines=['# Rapport d’inspection','', '## Critères mesurés','']\nfor r in rows:\n    lines.append(f\"- {r['metric']} : {r['measured']} — {r['verdict']}\")\nlines += ['', '## Limites', '', '- À compléter avec les limites observées.',\n          '', '## Reproduction', '', '- Ajouter la commande et la version évaluée.']\nPath('REPORT.md').write_text('\\n'.join(lines),encoding='utf-8')\nprint('Brouillon généré ; compléter limites et reproduction avant livraison.')",
      "explanation": [
        "Le script reprend les mesures au lieu de les recopier à la main.",
        "Les sections encore à compléter doivent rester visibles avant remise."
      ],
      "expected": "Un brouillon de rapport dont les chiffres proviennent des fichiers d’évaluation."
    },
    "exercise": {
      "brief": "Prépare le dépôt final, un rapport court et une présentation de dix minutes incluant une démonstration.",
      "constraints": [
        "Aucun secret dans le dépôt ou les captures.",
        "Créditer données, poids et code réutilisés."
      ],
      "deliverables": [
        "README final",
        "Rapport court",
        "Démonstration et galerie"
      ],
      "acceptance": [
        "Une personne reproduit l’exemple.",
        "Le rapport distingue mesure et hypothèse.",
        "Les limites et critères non atteints sont présents."
      ]
    },
    "correction": {
      "steps": [
        "Générer les tableaux depuis les résultats conservés.",
        "Compléter contexte, décisions, limites et reproduction.",
        "Faire une revue de réception du dépôt et répéter la démonstration."
      ],
      "code": "from pathlib import Path\nimport json\nrequired=['README.md','REPORT.md','release_manifest.json','final_verdicts.json']\nfor filename in required:\n    if not Path(filename).is_file(): raise FileNotFoundError(filename)\nreport=Path('REPORT.md').read_text(encoding='utf-8')\nfor marker in ['À compléter','Ajouter la commande']:\n    if marker in report: raise ValueError(f'Rapport encore incomplet : {marker}')\nverdicts=json.loads(Path('final_verdicts.json').read_text(encoding='utf-8'))\nprint('Critères non atteints/non évalués :',sum(r['verdict']!='atteint' for r in verdicts))\nprint('Contrôle structurel passé ; faire maintenant la revue humaine.')",
      "explanation": "La détection de marqueurs évite de livrer le brouillon généré tel quel. Une revue humaine reste nécessaire pour juger clarté et exactitude.",
      "verification": [
        "Suivre toutes les commandes du README.",
        "Faire retrouver une métrique et son fichier source par un tiers."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Rapport et JSON se contredisent",
        "cause": "Chiffres recopiés à la main",
        "fix": "Générer les tableaux depuis une source commune."
      },
      {
        "symptom": "La démo échoue sans Internet",
        "cause": "Dépendances téléchargées au lancement",
        "fix": "Préparer les poids et expliciter les ressources requises."
      }
    ],
    "challenge": "Présente le même projet en deux minutes à un responsable métier puis en dix minutes à un ingénieur.",
    "review": [
      {
        "question": "Pourquoi montrer un échec ?",
        "expected": "Pour rendre les limites concrètes et permettre une décision d’utilisation."
      },
      {
        "question": "Quel est le minimum pour reproduire un résultat ?",
        "expected": "Code/version, données/split, poids, preprocessing, configuration et commande."
      }
    ],
    "reading": [
      {
        "title": "Guide README GitHub",
        "url": "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
        "focus": "Vérifier installation, usage, provenance et aide pour le lecteur."
      }
    ]
  },
  {
    "id": "w8d5",
    "objective": "Démontrer l’autonomie et identifier les compétences à renforcer.",
    "prerequisites": [
      "Livraison complète ; images nouvelles autorisées ; grille de revue préparée."
    ],
    "concepts": [
      {
        "title": "Autonomie observable",
        "explanation": "Réaliser une variante, expliquer les choix et diagnostiquer un échec apportent une preuve plus forte que réciter un tutoriel."
      },
      {
        "title": "Un bilan sert à la suite",
        "explanation": "Noter acquis, fragilités et prochaine action. Une compétence partielle doit rester partielle ; le LMS ne certifie pas automatiquement une capacité professionnelle."
      }
    ],
    "demonstration": {
      "title": "Consigner une revue sans la préremplir comme réussie",
      "instruction": "Exemple autonome de structure à remplir après démonstration réelle.",
      "code": "import json\nfrom pathlib import Path\nreview={\n 'task':'Inspection sur images nouvelles',\n 'evidence':[],\n 'criteria':{'execute':None,'explain':None,'debug':None,'adapt':None},\n 'decision':'à revoir',\n 'feedback':'À renseigner après démonstration',\n 'next_action':'Choisir une variante à réaliser sans tutoriel',\n}\nPath('autonomy_review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf-8')\nprint('Grille créée sans validation automatique.')",
      "explanation": [
        "None signifie pas encore observé, pas échec certain.",
        "Une preuve doit renvoyer au travail démontré, par exemple un commit et une sortie reproductible."
      ],
      "expected": "Une grille prête pour la revue, avec des critères encore non évalués."
    },
    "exercise": {
      "brief": "Présente la solution, traite une nouvelle image, explique un échec et réalise une petite modification du besoin sans tutoriel pas à pas.",
      "constraints": [
        "Demander de l’aide de manière précise si nécessaire.",
        "Ne pas déclarer autonome un point non démontré."
      ],
      "deliverables": [
        "Démonstration",
        "Grille de revue renseignée",
        "Bilan et prochaines actions"
      ],
      "acceptance": [
        "Exécution indépendante réussie ou blocage clairement diagnostiqué.",
        "Choix et limites expliqués.",
        "Variante réalisée avec preuves et niveau d’aide consigné."
      ]
    },
    "correction": {
      "steps": [
        "Confier une entrée ou contrainte nouvelle.",
        "Observer exécution, explication, diagnostic et adaptation.",
        "Consigner les preuves, le niveau d’aide et la décision avec une prochaine action."
      ],
      "code": "import json\nfrom pathlib import Path\nreview=json.loads(Path('autonomy_review.json').read_text(encoding='utf-8'))\nvalues=list(review['criteria'].values())\ncomplete=all(type(value) is bool for value in values)\nevidence=bool(review.get('evidence'))\nready=complete and all(values) and evidence\nif review.get('decision')=='autonome' and not ready:\n    raise ValueError('Déclaration autonome sans critères et preuves suffisants')\nprint('Grille complète :',complete,'preuves présentes :',evidence)\nprint('La décision exige une revue du travail, pas seulement ce contrôle.')",
      "explanation": "Le contrôle vérifie la cohérence de la déclaration. Il ne juge pas le code ni la vérité des preuves : cette partie appartient à la revue avec l’encadrant.",
      "verification": [
        "Faire montrer la preuve correspondant à chaque critère.",
        "Documenter les aides reçues et les points à retravailler."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La démo connue fonctionne mais la variante bloque",
        "cause": "Mémorisation sans transfert",
        "fix": "Revenir au diagnostic et refaire une variante différente."
      },
      {
        "symptom": "La grille est toute cochée sans artefact",
        "cause": "Validation déclarative sans preuve",
        "fix": "Demander une démonstration et un résultat reproductible avant conclusion."
      }
    ],
    "challenge": "Le besoin change : détecter un nouveau type de défaut. Décris les données, annotations et évaluations à préparer avant de réentraîner.",
    "review": [
      {
        "question": "Quand demander de l’aide est-il professionnel ?",
        "expected": "Après avoir isolé le problème et préparé attendu, observé, entrée minimale et essais réalisés."
      },
      {
        "question": "Que prouvent les quiz du LMS ?",
        "expected": "Une compréhension ciblée ; l’autonomie doit être observée sur une réalisation réelle."
      }
    ],
    "reading": [
      {
        "title": "PyTorch : workflow complet à revisiter",
        "url": "https://docs.pytorch.org/tutorials/beginner/basics/",
        "focus": "Identifier l’étape du pipeline encore fragile puis la refaire sans suivre le tutoriel."
      }
    ]
  }
];
