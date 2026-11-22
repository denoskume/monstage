import type { DailyLesson } from './types';

export const weeks1to4: DailyLesson[] = [
  {
    "id": "w1d1",
    "objective": "Produire un aperçu homogène et un journal des fichiers lisibles sans confondre couleur, forme et type des pixels.",
    "prerequisites": [
      "Python 3 et environnement avec numpy et opencv-python ; créer un dossier de travail inscriptible."
    ],
    "concepts": [
      {
        "title": "Contrat image",
        "explanation": "OpenCV charge une image couleur H×W×3 en BGR, généralement uint8 entre 0 et 255. Le découpage NumPy indexe d’abord y puis x ; un recadrage ne rééchantillonne pas les pixels."
      },
      {
        "title": "Rapport de forme",
        "explanation": "Un resize à largeur et hauteur arbitraires déforme la pièce. Calculer un facteur commun puis compléter avec une bordure conserve sa géométrie."
      }
    ],
    "demonstration": {
      "title": "Créer puis inspecter une pièce synthétique",
      "instruction": "Exécuter dans demo.py. Le rectangle est un support pédagogique, pas une image industrielle ; la boucle accepte ensuite un véritable dossier.",
      "code": "from pathlib import Path\nimport cv2\nimport numpy as np\nroot = Path(\"images\")\nroot.mkdir(exist_ok=True)\nfixture = np.zeros((120, 240, 3), dtype=np.uint8)\nfixture[20:100, 60:180] = (0, 0, 255)\nassert cv2.imwrite(str(root / \"piece.png\"), fixture)\n(root / \"illisible.png\").write_text(\"pas une image\")\nfor path in sorted(root.glob(\"*.png\")):\n    bgr = cv2.imread(str(path))\n    if bgr is None:\n        print(path.name, \"ILLISIBLE\")\n        continue\n    print(path.name, bgr.shape, bgr.dtype, int(bgr.min()), int(bgr.max()))\n    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)\n    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)\n    roi = bgr[20:100, 60:180]\n    h, w = roi.shape[:2]\n    scale = min(128 / w, 128 / h)\n    small = cv2.resize(roi, (round(w * scale), round(h * scale)))\n    canvas = np.zeros((128, 128, 3), dtype=np.uint8)\n    canvas[:small.shape[0], :small.shape[1]] = small\n    assert cv2.imwrite(str(root / (path.stem + \"_preview.jpg\")), canvas)\n    print(\"RGB central\", rgb[60, 120].tolist(), \"gris\", gray.shape)",
      "explanation": [
        "Path évite de construire les chemins à coups de séparateurs ; sous Windows, fournir un chemin brut ou utiliser / dans les chaînes.",
        "Le test None précède tout accès à shape. BGR reste utilisé pour imwrite ; RGB sert à un affichage Matplotlib.",
        "Le fond complète le carré sans étirer le rectangle ; ne pas comparer des mesures sur le crop et sur sa version redimensionnée."
      ],
      "expected": "Le fichier invalide est signalé, la pièce est uint8 (120, 240, 3), le pixel central RGB vaut [255, 0, 0] et un aperçu carré est enregistré."
    },
    "exercise": {
      "brief": "Traiter un dossier contenant paysage, portrait, niveaux de gris et fichier cassé, en conservant un aperçu 160×160 par image.",
      "constraints": [
        "Lire les entrées depuis un dossier distinct des sorties.",
        "Conserver le rapport de forme ; ne jamais écraser un original.",
        "Journaliser nom, dimensions, type et statut."
      ],
      "deliverables": [
        "audit.json",
        "Dossier previews/",
        "Trois exemples BGR/RGB/gris commentés"
      ],
      "acceptance": [
        "Toutes les entrées figurent dans le journal, y compris les invalides.",
        "Chaque aperçu valide mesure 160×160 et contient la pièce entière.",
        "Le pixel rouge de la fixture est enregistré rouge dans l’aperçu et expliqué comme [0, 0, 255] en BGR."
      ]
    },
    "correction": {
      "steps": [
        "Lister les entrées avant de créer les sorties.",
        "Tester le décodage puis calculer une seule échelle.",
        "Centrer le résultat avec des bordures et enregistrer le statut."
      ],
      "code": "from pathlib import Path\nimport json\nimport cv2\nimport numpy as np\nsource, target = Path(\"images\"), Path(\"previews\")\nassert source.is_dir(), \"Créer images/ avec les fixtures de la démonstration\"\ntarget.mkdir(exist_ok=True)\nrows = []\nfor p in sorted(source.iterdir()):\n    if not p.is_file():\n        continue\n    im = cv2.imread(str(p))\n    row = {\"name\": p.name, \"status\": \"invalid\"}\n    if im is not None:\n        h, w = im.shape[:2]\n        scale = min(160 / w, 160 / h)\n        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))\n        resized = cv2.resize(im, (nw, nh))\n        out = np.zeros((160, 160, 3), np.uint8)\n        x, y = (160 - nw) // 2, (160 - nh) // 2\n        out[y:y+nh, x:x+nw] = resized\n        assert cv2.imwrite(str(target / (p.name + \".png\")), out)\n        row.update(status=\"ok\", shape=list(im.shape), dtype=str(im.dtype))\n    rows.append(row)\nPath(\"audit.json\").write_text(json.dumps(rows, indent=2), encoding=\"utf-8\")\nassert len(rows) == len([p for p in source.iterdir() if p.is_file()])",
      "explanation": "Les noms de sortie conservent l’extension initiale dans le nom afin de distinguer a.jpg et a.png.",
      "verification": [
        "python demo.py puis python correction.py",
        "Ouvrir previews/piece.png.png ; vérifier bordures et couleur rouge.",
        "Lire audit.json : illisible.png doit être invalid."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le rouge apparaît bleu",
        "cause": "Un tableau BGR a été affiché comme RGB.",
        "fix": "Convertir avec COLOR_BGR2RGB avant Matplotlib, garder BGR pour imwrite."
      },
      {
        "symptom": "imread retourne None sous Windows",
        "cause": "Chemin incorrect, fichier corrompu ou extension trompeuse.",
        "fix": "Afficher repr(str(path)), vérifier is_file et traiter None sans planter."
      }
    ],
    "challenge": "Ajouter la prise en charge d’un canal alpha en justifiant la couleur du fond de composition.",
    "review": [
      {
        "question": "Pourquoi shape[:2] donne-t-il h puis w ?",
        "expected": "NumPy indexe les lignes puis les colonnes ; OpenCV resize attend pourtant (w, h)."
      },
      {
        "question": "Un crop change-t-il la taille physique d’un pixel ?",
        "expected": "Non ; un resize change l’échelle et invalide une mesure en pixels sans recalibrage."
      }
    ],
    "reading": [
      {
        "title": "opencv",
        "url": "https://docs.opencv.org/4.x/d3/df2/tutorial_py_basic_ops.html",
        "focus": "Reproduire ROI, shape et conversion de canaux ; relever l’ordre des indices."
      }
    ]
  },
  {
    "id": "w1d2",
    "objective": "Compter des pièces isolées par un masque contrôlé et expliquer les échecs dus au contact, au contraste et au bruit.",
    "prerequisites": [
      "w1d1 ; numpy et opencv-python ; distinguer tableau gris et couleur."
    ],
    "concepts": [
      {
        "title": "Seuillage et hypothèse",
        "explanation": "Un seuil sépare une intensité de fond et d’objet, pas des catégories sémantiques. Otsu suppose une séparation exploitable de l’histogramme ; une ombre peut devenir un objet."
      },
      {
        "title": "Composantes et morphologie",
        "explanation": "L’ouverture enlève de petites régions mais peut supprimer un défaut fin. Un contour externe représente une région connectée : deux pièces en contact peuvent ne produire qu’un contour."
      }
    ],
    "demonstration": {
      "title": "Compter deux disques et éliminer une poussière",
      "instruction": "Fixture synthétique ; observer masque et image annotée avant d’appliquer les paramètres à des photos réelles.",
      "code": "import cv2\nimport numpy as np\nim = np.zeros((220, 320), np.uint8)\ncv2.circle(im, (80, 110), 35, 180, -1)\ncv2.circle(im, (230, 110), 42, 220, -1)\ncv2.circle(im, (150, 20), 2, 255, -1)\nblur = cv2.GaussianBlur(im, (5, 5), 0)\nthreshold, mask = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)\nkernel = np.ones((3, 3), np.uint8)\nclean = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)\ncontours, _ = cv2.findContours(clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)\nkept = [c for c in contours if cv2.contourArea(c) >= 200]\nview = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)\nfor index, contour in enumerate(kept):\n    x, y, w, h = cv2.boundingRect(contour)\n    cv2.rectangle(view, (x, y), (x+w, y+h), (0, 255, 0), 2)\n    print(index, \"aire px2\", cv2.contourArea(contour), \"boîte\", w, h)\ncv2.imwrite(\"mask.png\", clean)\ncv2.imwrite(\"count.png\", view)\nprint(\"seuil\", threshold, \"nombre\", len(kept))\nassert len(kept) == 2",
      "explanation": [
        "Le flou réduit le bruit mais peut faire fusionner des frontières proches.",
        "Le filtre d’aire est une règle explicite en pixels carrés ; il dépend de la résolution.",
        "Une aire de contour n’est ni une surface en mm² ni le nombre exact de pixels blancs."
      ],
      "expected": "Deux boîtes sont dessinées et la poussière est exclue ; les aires et le seuil sont calculés à l’exécution."
    },
    "exercise": {
      "brief": "Comparer le comptage sur trois variantes : disques séparés, disques en contact et disque sombre sur fond clair.",
      "constraints": [
        "Conserver les trois images et leurs masques.",
        "Ne pas masquer les échecs par des paramètres différents sans les documenter.",
        "Aucune conversion en millimètres sans calibration."
      ],
      "deliverables": [
        "Table CSV attendu/prédit/cause",
        "Trois masques",
        "Une règle d’utilisation acceptable"
      ],
      "acceptance": [
        "Le cas séparé compte deux pièces.",
        "Le cas contact est explicitement identifié comme fusion possible.",
        "La polarité du seuil du cas clair est justifiée."
      ]
    },
    "correction": {
      "steps": [
        "Créer des cas dont le nombre attendu est connu.",
        "Appliquer les deux polarités et inspecter le fond sélectionné.",
        "Relier le comptage aux composantes et rédiger une limite sur les objets en contact."
      ],
      "code": "import csv\nimport cv2\nimport numpy as np\nrows = []\nfor name, touching, invert in [(\"separe\", False, False), (\"contact\", True, False), (\"clair\", False, True)]:\n    im = np.zeros((160, 260), np.uint8)\n    cv2.circle(im, (80, 80), 35, 220, -1)\n    cv2.circle(im, (140 if touching else 190, 80), 35, 220, -1)\n    if invert:\n        im = 255 - im\n    mode = cv2.THRESH_BINARY_INV if invert else cv2.THRESH_BINARY\n    _, mask = cv2.threshold(im, 0, 255, mode + cv2.THRESH_OTSU)\n    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)\n    count = sum(cv2.contourArea(c) > 200 for c in contours)\n    cv2.imwrite(name + \"_mask.png\", mask)\n    rows.append([name, 2, count, \"fusion\" if touching else \"regions separees\"])\nassert rows[0][2] == 2 and rows[1][2] == 1 and rows[2][2] == 2\nwith open(\"counts.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as stream:\n    writer = csv.writer(stream)\n    writer.writerow([\"cas\", \"attendu\", \"predit\", \"cause\"])\n    writer.writerows(rows)",
      "explanation": "La correction conserve un échec volontaire : compter une région connectée ne sépare pas deux objets collés.",
      "verification": [
        "python correction.py",
        "Vérifier counts.csv : 2, 1, 2 ; inspecter le pont entre les disques du masque contact."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Une seule boîte pour deux pièces",
        "cause": "Les pièces appartiennent à la même région connectée.",
        "fix": "Signaler le cas hors hypothèse ou étudier une séparation par distance, sans promettre une correction universelle."
      },
      {
        "symptom": "Le fond est compté",
        "cause": "Polarité du seuillage inversée.",
        "fix": "Inspecter le masque et choisir BINARY_INV pour objets sombres sur fond clair."
      }
    ],
    "challenge": "Refaire le comptage après réduction par deux et adapter le seuil d’aire par le carré du facteur.",
    "review": [
      {
        "question": "Pourquoi une ouverture peut-elle faire perdre un défaut ?",
        "expected": "Elle érode puis dilate ; une zone plus fine que le noyau peut disparaître."
      },
      {
        "question": "Peut-on obtenir une dimension en mm avec boundingRect seul ?",
        "expected": "Non, il faut une calibration et contrôler perspective et résolution."
      }
    ],
    "reading": [
      {
        "title": "morph",
        "url": "https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html",
        "focus": "Comparer ouverture et fermeture ; dessiner un cas où chacune fusionne ou efface une information."
      }
    ]
  },
  {
    "id": "w1d3",
    "objective": "Livrer un projet exécutable depuis un terminal neuf avec dépendances figées et paramètres explicites.",
    "prerequisites": [
      "Script de comptage w1d2 fonctionnel ; Python 3, Git et accès autorisé au dépôt de stage."
    ],
    "concepts": [
      {
        "title": "Environnement isolé",
        "explanation": "Un venv sépare les bibliothèques du projet de celles de la machine. Le fichier de versions provient d’un environnement minimal vérifié ; pip freeze d’un environnement personnel pollué ne garantit pas une installation utile."
      },
      {
        "title": "Point d’entrée",
        "explanation": "Une commande documentée doit résoudre les chemins depuis ses arguments et non depuis un notebook. src contient la logique, scripts les entrées, configs les paramètres ; les données et secrets ne vont pas dans Git."
      }
    ],
    "demonstration": {
      "title": "Initialiser un squelette vérifiable",
      "instruction": "Python standard uniquement pour ce générateur ; exécuter dans un dossier vide. Puis créer .venv, installer numpy opencv-python, et figer les versions réellement installées.",
      "code": "from pathlib import Path\nimport json\nimport subprocess\nroot = Path(\"atelier_cv\")\nfor name in [\"src\", \"scripts\", \"configs\", \"notebooks\"]:\n    (root / name).mkdir(parents=True, exist_ok=True)\n(root / \".gitignore\").write_text(\".venv/\\n__pycache__/\\ndata/\\noutputs/\\n.env\\n\", encoding=\"utf-8\")\n(root / \"configs\" / \"count.json\").write_text(json.dumps({\"min_area\": 200}), encoding=\"utf-8\")\nscript = \"\"\"import argparse, json\nfrom pathlib import Path\nparser = argparse.ArgumentParser()\nparser.add_argument(\"--config\", type=Path, required=True)\nargs = parser.parse_args()\nconfig = json.loads(args.config.read_text())\nassert config[\"min_area\"] > 0\nprint(\"configuration valide\", config)\n\"\"\"\n(root / \"scripts\" / \"check.py\").write_text(script, encoding=\"utf-8\")\n(root / \"README.md\").write_text(\"# Atelier CV\\n\\npython scripts/check.py --config configs/count.json\\n\", encoding=\"utf-8\")\nsubprocess.run([\"git\", \"init\", str(root)], check=True)\nsubprocess.run([\"python\", str(root / \"scripts/check.py\"), \"--config\", str(root / \"configs/count.json\")], check=True)",
      "explanation": [
        "Le script exige un chemin de configuration et échoue immédiatement si la valeur est invalide.",
        "Le générateur ne crée ni faux numéro de version ni dépendance implicite : le verrouillage se fait après installation réussie."
      ],
      "expected": "Un dépôt atelier_cv est créé ; le contrôle imprime min_area=200 et ne dépend pas d’un notebook."
    },
    "exercise": {
      "brief": "Intégrer le compteur dans ce squelette et faire reproduire une exécution avec une image synthétique par un collègue.",
      "constraints": [
        "Documenter activation Windows et Unix.",
        "Conserver les versions Python et dépendances testées.",
        "Exclure données, sorties et environnement de Git."
      ],
      "deliverables": [
        "README avec commandes exactes",
        "requirements.txt issu du venv minimal",
        "Commande scripts/count.py --input ... --config ..."
      ],
      "acceptance": [
        "Installation dans un nouveau venv puis comptage réussi.",
        "git status ne propose ni .venv ni data.",
        "La commande du README fonctionne depuis un autre répertoire en passant les chemins des entrées et de la configuration."
      ]
    },
    "correction": {
      "steps": [
        "Créer un venv minimal et installer seulement les dépendances nécessaires.",
        "Enregistrer pip freeze et la version de Python.",
        "Exécuter le contrôle depuis un autre dossier avec chemins absolus pour détecter les dépendances au cwd."
      ],
      "code": "from pathlib import Path\nimport json\nimport subprocess\nimport sys\nroot = Path(\"atelier_cv\").resolve()\nassert (root / \"scripts/check.py\").is_file(), \"Exécuter la démonstration\"\nversions = subprocess.check_output([sys.executable, \"-m\", \"pip\", \"freeze\"], text=True)\n(root / \"requirements.txt\").write_text(versions, encoding=\"utf-8\")\n(root / \"python-version.txt\").write_text(sys.version, encoding=\"utf-8\")\nresult = subprocess.run([sys.executable, str(root / \"scripts/check.py\"), \"--config\", str(root / \"configs/count.json\")], cwd=root.parent, capture_output=True, text=True)\nassert result.returncode == 0, result.stderr\nassert \"configuration valide\" in result.stdout\nignored = subprocess.check_output([\"git\", \"-C\", str(root), \"check-ignore\", \".venv/probe\", \"data/probe\", \"outputs/probe\"], text=True)\nassert len(ignored.splitlines()) == 3\nprint(result.stdout, \"Exclusions vérifiées\")",
      "explanation": "Exécuter cette correction avec le Python du venv minimal ; elle capture les versions réellement utilisées, sans prétendre verrouiller les bibliothèques système.",
      "verification": [
        "python -m venv .venv ; activer puis python -m pip install numpy opencv-python",
        "python correction.py ; python -m pip check",
        "Recréer un autre venv et lancer python -m pip install -r atelier_cv/requirements.txt puis la commande du README."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Le paquet est installé mais introuvable",
        "cause": "pip et python appartiennent à deux environnements.",
        "fix": "Employer python -m pip et vérifier sys.executable."
      },
      {
        "symptom": "Le script marche seulement dans le notebook",
        "cause": "Chemin relatif dépendant du répertoire courant.",
        "fix": "Passer input/config en arguments et tester depuis un autre dossier."
      }
    ],
    "challenge": "Ajouter un mode --dry-run qui vérifie les entrées sans créer de sortie.",
    "review": [
      {
        "question": "Pourquoi ignorer .venv ?",
        "expected": "Il contient des fichiers dépendants de la machine ; on recrée l’environnement depuis les instructions et versions."
      },
      {
        "question": "Que prouve pip freeze ?",
        "expected": "Les versions Python installées dans cet environnement, pas la reproductibilité du matériel ou des bibliothèques système."
      }
    ],
    "reading": [
      {
        "title": "opencv",
        "url": "https://docs.opencv.org/4.x/d3/df2/tutorial_py_basic_ops.html",
        "focus": "Lister les modules réellement utilisés dans le script de comptage pour limiter les dépendances."
      }
    ]
  },
  {
    "id": "w1d4",
    "objective": "Auditer intégrité, doublons et annotations avant de choisir un dataset supervisé et d’en documenter les droits.",
    "prerequisites": [
      "w1d3 ; choisir une source autorisée, par exemple KolektorSDD2 pour classification/masques ; ne pas inventer une licence.",
      "Préparer manifest.csv avec colonnes path,label,group ; chemins relatifs au manifeste, labels 0=conforme et 1=défaut."
    ],
    "concepts": [
      {
        "title": "Doublon exact et quasi-doublon",
        "explanation": "SHA-256 repère les fichiers identiques octet par octet, pas une même pièce réencodée. Compléter avec groupes de production et inspection des images proches avant le split."
      },
      {
        "title": "Annotation exploitable",
        "explanation": "Une absence de masque n’implique pas automatiquement une pièce conforme. Vérifier la convention de la source, les classes, dimensions et cas ambigus ; enregistrer URL, licence consultée, date et restrictions dans une fiche source."
      }
    ],
    "demonstration": {
      "title": "Auditer un manifeste sans supprimer les preuves",
      "instruction": "Nécessite numpy/opencv-python et manifest.csv préparé ci-dessus ; parcourir le dataset choisi, pas une arborescence supposée.",
      "code": "from pathlib import Path\nfrom collections import Counter, defaultdict\nimport csv, hashlib, json\nimport cv2\nmanifest = Path(\"manifest.csv\")\nrows = list(csv.DictReader(manifest.open(encoding=\"utf-8\")))\nseen, report = defaultdict(list), []\nfor row in rows:\n    path = manifest.parent / row[\"path\"]\n    issues = []\n    if row[\"label\"] not in {\"0\", \"1\"}:\n        issues.append(\"label_invalide\")\n    if not row[\"group\"]:\n        issues.append(\"groupe_absent\")\n    im = cv2.imread(str(path))\n    if im is None:\n        issues.append(\"illisible\")\n    else:\n        digest = hashlib.sha256(path.read_bytes()).hexdigest()\n        seen[digest].append(row[\"path\"])\n    report.append({**row, \"issues\": issues, \"shape\": None if im is None else list(im.shape)})\nduplicates = [paths for paths in seen.values() if len(paths) > 1]\nPath(\"audit.json\").write_text(json.dumps({\"files\": report, \"duplicates\": duplicates}, indent=2), encoding=\"utf-8\")\nprint(\"classes\", Counter(r[\"label\"] for r in rows))\nprint(\"doublons exacts\", len(duplicates), \"fichiers a revoir\", sum(bool(r[\"issues\"]) for r in report))",
      "explanation": [
        "Le rapport conserve l’entrée source même en cas d’erreur ; aucune suppression silencieuse.",
        "Le groupe doit identifier une pièce, un lot ou une séquence pertinent, pas être déduit arbitrairement du label.",
        "Les effectifs affichés ne prouvent ni l’absence de biais ni la validité des annotations."
      ],
      "expected": "Un audit.json liste les statuts, dimensions et groupes de doublons ; les effectifs dépendent des données effectivement lues."
    },
    "exercise": {
      "brief": "Créer une galerie de revue de douze cas couvrant chaque classe, petits défauts, raretés et ambiguïtés ; établir une liste de corrections.",
      "constraints": [
        "Vérifier la licence auprès de la source et conserver son texte ou lien daté.",
        "Ne jamais relabelliser un cas ambigu sans règle ou validation de l’encadrant.",
        "Inclure un doublon exact et un fichier cassé de test dans une copie pédagogique."
      ],
      "deliverables": [
        "audit.json et revue.csv",
        "Galerie indexée par chemin",
        "Fiche source/licence et décisions de correction"
      ],
      "acceptance": [
        "Les deux anomalies injectées sont signalées.",
        "Chaque cas ambigu possède un statut et une décision à prendre.",
        "Les doublons à labels contradictoires bloquent le split."
      ]
    },
    "correction": {
      "steps": [
        "Charger l’audit pour séparer problèmes techniques et problèmes d’annotation.",
        "Repérer les groupes de hachages ayant plusieurs labels.",
        "Produire une file de revue sans changer le manifeste original."
      ],
      "code": "from pathlib import Path\nfrom collections import defaultdict\nimport json, csv\nreport = json.loads(Path(\"audit.json\").read_text(encoding=\"utf-8\"))\nby_path = {r[\"path\"]: r for r in report[\"files\"]}\nqueue = []\nfor row in report[\"files\"]:\n    for issue in row[\"issues\"]:\n        queue.append([row[\"path\"], issue, \"a_verifier\"])\nfor paths in report[\"duplicates\"]:\n    labels = {by_path[p][\"label\"] for p in paths}\n    issue = \"labels_contradictoires\" if len(labels) > 1 else \"doublon_exact\"\n    queue.extend([p, issue, \"a_verifier\"] for p in paths)\nwith open(\"revue.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as stream:\n    writer = csv.writer(stream)\n    writer.writerow([\"path\", \"probleme\", \"decision\"])\n    writer.writerows(queue)\nprint(\"Actions à arbitrer\", len(queue))\nassert all(row[2] == \"a_verifier\" for row in queue)",
      "explanation": "Les contradictions sont des alertes de qualité, jamais une raison de choisir automatiquement le label majoritaire.",
      "verification": [
        "python demo.py puis python correction.py",
        "Contrôler que le fichier cassé est illisible et le doublon apparaît dans audit.json.",
        "Ouvrir chaque vignette avec son original avant de valider revue.csv."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Deux images presque identiques ne sont pas détectées",
        "cause": "La compression ou le recadrage modifie le hachage.",
        "fix": "Regrouper aussi par pièce/lot et examiner des contactsheets de voisins visuels."
      },
      {
        "symptom": "Toutes les images sans masque sont conformes",
        "cause": "La convention du fournisseur n’a pas été vérifiée.",
        "fix": "Lire le protocole d’annotation et marquer les cas inconnus comme non exploitables."
      }
    ],
    "challenge": "Ajouter un contrôle de dimensions image/masque pour le futur travail de segmentation.",
    "review": [
      {
        "question": "Un hash distinct exclut-il une fuite ?",
        "expected": "Non ; une autre vue ou un réencodage de la même pièce peut rester très proche."
      },
      {
        "question": "Pourquoi consigner la licence avant de télécharger ?",
        "expected": "Les usages autorisés et restrictions déterminent si le dataset peut être utilisé et redistribué."
      }
    ],
    "reading": [
      {
        "title": "leak",
        "url": "https://scikit-learn.org/stable/common_pitfalls.html",
        "focus": "Repérer les exemples de contamination et distinguer audit de données et apprentissage de transformations."
      }
    ]
  },
  {
    "id": "w1d5",
    "objective": "Créer des splits disjoints par groupe et une baseline classique évaluée uniquement sur validation.",
    "prerequisites": [
      "Audit w1d4 résolu ; manifest.csv avec path,label,group, au moins plusieurs groupes par classe ; numpy, opencv-python, scikit-learn.",
      "Le test officiel éventuel reste inchangé ; le code de split ci-dessous vise un jeu sans test officiel."
    ],
    "concepts": [
      {
        "title": "Unité indépendante",
        "explanation": "Des vues d’une même pièce ou des images successives ne doivent pas traverser les splits. Un split par groupe réduit cette fuite mais ne garantit pas une distribution de classes équilibrée ; contrôler les effectifs."
      },
      {
        "title": "Pipeline ajusté sur train",
        "explanation": "Le scaler, le classifieur et toute sélection de paramètres sont appris sur train ; validation sert aux choix, test reste réservé. Une statistique de gris est une baseline faible, utile pour tester la chaîne et exposer ses limites."
      }
    ],
    "demonstration": {
      "title": "Split de groupes puis classification sur intensité",
      "instruction": "Le manifeste et ses images doivent exister. Si un test officiel existe, conserver ce test et appliquer uniquement la séparation train/validation sur son train.",
      "code": "from pathlib import Path\nimport pandas as pd\nimport cv2\nfrom sklearn.model_selection import GroupShuffleSplit\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import classification_report\nframe = pd.read_csv(\"manifest.csv\", dtype={\"group\": str})\nfirst = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=11)\ndev_idx, test_idx = next(first.split(frame, groups=frame.group))\ndev = frame.iloc[dev_idx]\nsecond = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=12)\ntrain_idx, val_idx = next(second.split(dev, groups=dev.group))\nframe[\"split\"] = \"test\"\nframe.loc[dev.iloc[train_idx].index, \"split\"] = \"train\"\nframe.loc[dev.iloc[val_idx].index, \"split\"] = \"val\"\nassert frame.groupby(\"group\").split.nunique().max() == 1\nfeatures = []\nfor path in frame.path:\n    im = cv2.imread(str(Path(path)), cv2.IMREAD_GRAYSCALE)\n    assert im is not None, path\n    features.append([float(im.mean()), float(im.std())])\nframe[[\"mean\", \"std\"]] = features\ntrain, val = frame[frame.split == \"train\"], frame[frame.split == \"val\"]\nassert train.label.nunique() == 2 and val.label.nunique() == 2, \"Revoir les groupes\"\nmodel = make_pipeline(StandardScaler(), LogisticRegression(random_state=11))\nmodel.fit(train[[\"mean\", \"std\"]], train.label)\nprint(classification_report(val.label, model.predict(val[[\"mean\", \"std\"]]), zero_division=0))\nframe[[\"path\", \"label\", \"group\", \"split\"]].to_csv(\"splits.csv\", index=False)",
      "explanation": [
        "Installer également pandas pour cette démonstration ; les chemins sont relatifs au dossier courant du projet.",
        "Deux tirages donnent environ 60/20/20 en groupes, pas forcément en nombre d’images.",
        "Les descripteurs mean/std ne voient pas la localisation du défaut ; aucun score n’est présupposé."
      ],
      "expected": "splits.csv attribue un seul split par groupe et un rapport validation est calculé ; le test n’est pas évalué."
    },
    "exercise": {
      "brief": "Figer les splits, exporter leur inventaire et prouver qu’aucun doublon exact ne traverse les ensembles ; documenter la limite de la baseline.",
      "constraints": [
        "Réutiliser la même partition pour toutes les semaines suivantes.",
        "Bloquer si train ou validation ne contient pas toutes les classes.",
        "Aucune augmentation sur validation/test ; ne pas tirer de nouveau split pour obtenir un meilleur score."
      ],
      "deliverables": [
        "splits.csv versionné",
        "Rapport effectifs par split/classe",
        "Résultats validation et limites de mean/std"
      ],
      "acceptance": [
        "Intersection des groupes et des hashes égale à zéro entre splits.",
        "Test réservé, scaler ajusté uniquement dans fit(train).",
        "Les effectifs par classe sont consignés pour chaque split et une classe absente bloque la baseline."
      ]
    },
    "correction": {
      "steps": [
        "Vérifier groupes et classes avant de former les tenseurs.",
        "Recalculer les hashes après partition pour repérer les doublons intergroupes.",
        "Refuser le manifeste si une fuite subsiste et corriger les groupes à la source."
      ],
      "code": "from pathlib import Path\nfrom collections import defaultdict, Counter\nimport csv, hashlib\nrows = list(csv.DictReader(open(\"splits.csv\", encoding=\"utf-8\")))\ngroups, hashes = defaultdict(set), defaultdict(set)\ncounts = Counter()\nfor row in rows:\n    assert row[\"split\"] in {\"train\", \"val\", \"test\"}\n    groups[row[\"group\"]].add(row[\"split\"])\n    digest = hashlib.sha256(Path(row[\"path\"]).read_bytes()).hexdigest()\n    hashes[digest].add(row[\"split\"])\n    counts[(row[\"split\"], row[\"label\"])] += 1\nassert all(len(s) == 1 for s in groups.values()), \"Fuite de groupe\"\nassert all(len(s) == 1 for s in hashes.values()), \"Doublon entre splits\"\nfor split in [\"train\", \"val\", \"test\"]:\n    assert {r[\"label\"] for r in rows if r[\"split\"] == split} == {\"0\", \"1\"}\n    print(split, {label: counts[split, label] for label in [\"0\", \"1\"]})\nprint(\"Manifeste vérifié ; test encore réservé\")",
      "explanation": "Un doublon dans deux groupes montre que la définition des groupes est insuffisante ; refaire les groupes, pas seulement supprimer l’assertion.",
      "verification": [
        "python demo.py puis python correction.py",
        "Relancer avec les mêmes graines et comparer splits.csv octet par octet.",
        "Vérifier que le rapport ne contient aucune prédiction du split test."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Une classe manque en validation",
        "cause": "Peu de groupes portent cette classe ; tirage par groupe non stratifié.",
        "fix": "Examiner les groupes disponibles et définir une partition justifiée avant toute expérience."
      },
      {
        "symptom": "La validation semble parfaite",
        "cause": "Images proches ou descripteur corrélé au lot plutôt qu’au défaut.",
        "fix": "Contrôler les groupes et tester une autre condition de production sur validation dédiée."
      }
    ],
    "challenge": "Ajouter une colonne caméra et vérifier si la baseline apprend surtout un écart d’éclairage entre caméras.",
    "review": [
      {
        "question": "Pourquoi ne pas ajuster le scaler sur tout le dataset ?",
        "expected": "Ses statistiques transmettraient de l’information de validation/test au modèle."
      },
      {
        "question": "Peut-on appliquer une rotation aléatoire au test ?",
        "expected": "Non pour l’évaluation standard figée ; une étude de robustesse séparée doit être explicitement définie."
      }
    ],
    "reading": [
      {
        "title": "leak",
        "url": "https://scikit-learn.org/stable/common_pitfalls.html",
        "focus": "Lire les sections preprocessing et Pipeline, puis identifier les appels fit autorisés."
      }
    ]
  },
  {
    "id": "w2d1",
    "objective": "Construire un Dataset réel depuis le manifeste et vérifier un batch avant tout entraînement.",
    "prerequisites": [
      "PyTorch, torchvision, Pillow installés dans le venv ; splits.csv validé w1d5 et images accessibles."
    ],
    "concepts": [
      {
        "title": "Contrat tenseur",
        "explanation": "Une image PIL RGB devient un float32 C×H×W ; ToTensor convertit uint8 en [0,1]. Les labels de CrossEntropyLoss sont des indices int64, pas des noms de classes ni des vecteurs one-hot."
      },
      {
        "title": "Dataset et DataLoader",
        "explanation": "Dataset associe chaque chemin à un label et une transformation ; DataLoader regroupe les échantillons, mélange train et garde un ordre stable pour validation. Les transformations validation doivent être déterministes."
      }
    ],
    "demonstration": {
      "title": "Charger des images du manifeste",
      "instruction": "Données réelles préparées : splits.csv avec path,label,group,split ; utiliser le mapping 0 conforme/1 défaut conservé depuis l’audit.",
      "code": "import csv\nfrom PIL import Image\nimport torch\nfrom torch.utils.data import Dataset, DataLoader\nfrom torchvision import transforms\nclass Inspection(Dataset):\n    def __init__(self, manifest, split):\n        self.rows = [r for r in csv.DictReader(open(manifest, encoding=\"utf-8\")) if r[\"split\"] == split]\n        self.transform = transforms.Compose([transforms.Resize((64, 64)), transforms.ToTensor()])\n        assert self.rows, \"Split vide\"\n    def __len__(self):\n        return len(self.rows)\n    def __getitem__(self, index):\n        row = self.rows[index]\n        with Image.open(row[\"path\"]) as image:\n            tensor = self.transform(image.convert(\"RGB\"))\n        label = int(row[\"label\"])\n        assert label in (0, 1)\n        return tensor, torch.tensor(label, dtype=torch.long)\ntrain = Inspection(\"splits.csv\", \"train\")\nloader = DataLoader(train, batch_size=8, shuffle=True, num_workers=0)\nx, y = next(iter(loader))\nassert x.ndim == 4 and x.shape[1:] == (3, 64, 64)\nassert x.dtype == torch.float32 and y.dtype == torch.int64\nassert 0 <= x.min() and x.max() <= 1\nprint(x.shape, y.tolist(), \"device disponible\", \"cuda\" if torch.cuda.is_available() else \"cpu\")",
      "explanation": [
        "L’ouverture avec with ferme les fichiers, utile sur de gros dossiers.",
        "Resize(64,64) impose ici un carré : acceptable pour ce contrôle technique, mais préférer une politique conservant l’aspect si la forme porte le défaut.",
        "num_workers=0 facilite le premier débogage sur Windows ; augmenter ensuite avec une entrée protégée par __main__."
      ],
      "expected": "Un batch B×3×64×64 et B labels valides est affiché ; aucune normalisation par statistiques globales ni entraînement ne sont effectués."
    },
    "exercise": {
      "brief": "Exporter une grille de huit images avec leurs labels et expliquer chaque conversion de type/canal.",
      "constraints": [
        "Conserver les mêmes splits et mapping.",
        "Validation sans transformation aléatoire.",
        "Vérifier une image grise et une RGB avec convert(\"RGB\")."
      ],
      "deliverables": [
        "dataset.py",
        "batch.png",
        "Table shape/dtype/plage avant et après transformation"
      ],
      "acceptance": [
        "La grille correspond aux lignes du manifeste.",
        "Le loader validation produit le même premier batch deux fois.",
        "Les images grises et RGB produisent toutes un tenseur float32 à trois canaux et un label int64 valide."
      ]
    },
    "correction": {
      "steps": [
        "Réutiliser la classe Inspection de la démonstration dans dataset.py.",
        "Créer un loader validation sans mélange.",
        "Dessiner la grille puis comparer deux itérations pour contrôler le déterminisme."
      ],
      "code": "import torch\nfrom torch.utils.data import DataLoader\nfrom torchvision.utils import save_image\nfrom dataset import Inspection\nvalidation = Inspection(\"splits.csv\", \"val\")\nloader = DataLoader(validation, batch_size=8, shuffle=False, num_workers=0)\nx1, y1 = next(iter(loader))\nx2, y2 = next(iter(loader))\nassert torch.equal(x1, x2) and torch.equal(y1, y2)\nassert x1.shape[0] == y1.shape[0]\nsave_image(x1, \"batch.png\", nrow=4)\nfor i, label in enumerate(y1.tolist()):\n    print(\"case\", i, \"classe\", label, \"chemin\", validation.rows[i][\"path\"])\nassert torch.isfinite(x1).all()\nassert y1.min() >= 0 and y1.max() < 2",
      "explanation": "dataset.py doit contenir Inspection sans exécution au niveau module ; le code vérifie le contrat et fournit les légendes de la grille.",
      "verification": [
        "python demo.py ; déplacer la classe dans dataset.py puis python correction.py",
        "Ouvrir batch.png et rapprocher les huit indices des chemins imprimés."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "CrossEntropy réclame Long",
        "cause": "Les labels ont été convertis en float.",
        "fix": "Retourner torch.tensor(label, dtype=torch.long)."
      },
      {
        "symptom": "Les couleurs sont permutées",
        "cause": "Un tableau OpenCV BGR a été utilisé sans conversion.",
        "fix": "Charger via PIL RGB ou convertir explicitement BGR vers RGB."
      }
    ],
    "challenge": "Remplacer le resize carré par un letterbox et comparer visuellement la forme des défauts.",
    "review": [
      {
        "question": "Pourquoi shuffle=False en validation ?",
        "expected": "Pour stabiliser l’ordre des résultats et relier chaque prédiction à son chemin."
      },
      {
        "question": "Quelle est la différence HWC/CHW ?",
        "expected": "HWC est courant dans les images NumPy ; PyTorch Conv2d attend des batches NCHW."
      }
    ],
    "reading": [
      {
        "title": "base",
        "url": "https://docs.pytorch.org/tutorials/beginner/basics/",
        "focus": "Lire Datasets & DataLoaders et vérifier les responsabilités respectives de __getitem__ et du loader."
      }
    ]
  },
  {
    "id": "w2d2",
    "objective": "Vérifier dimensions et gradients d’un CNN puis le faire surapprendre sur un batch fixe.",
    "prerequisites": [
      "w2d1 ; torch ; code autonome ci-dessous sur des carrés synthétiques, à ne pas présenter comme performance industrielle."
    ],
    "concepts": [
      {
        "title": "Dimensions et logits",
        "explanation": "Conv2d conserve ici 16×16 grâce au padding ; le pooling réduit à 8×8, le pooling global produit huit features. La dernière couche retourne B×2 logits non bornés ; CrossEntropyLoss applique déjà log-softmax."
      },
      {
        "title": "Test de surapprentissage",
        "explanation": "Un batch fixe permet de vérifier apprentissage, gradients et labels sans confondre généralisation et fonctionnement technique. Une loss qui baisse ici ne valide ni les splits ni la capacité sur des défauts réels."
      }
    ],
    "demonstration": {
      "title": "Apprendre un batch synthétique fixe",
      "instruction": "Script autonome CPU ; toutes les données sont produites en mémoire pour contrôler les shapes et la propagation des gradients.",
      "code": "import torch\nfrom torch import nn\nfrom torch.utils.data import Dataset, DataLoader\ntorch.manual_seed(17)\nclass Pieces(Dataset):\n    def __init__(self, n=32, seed=1):\n        generator = torch.Generator().manual_seed(seed)\n        self.y = torch.arange(n) % 2\n        self.x = torch.rand(n, 3, 16, 16, generator=generator) * 0.15\n        self.x[self.y == 1, :, 5:11, 5:11] += 0.7\n    def __len__(self):\n        return len(self.y)\n    def __getitem__(self, i):\n        return self.x[i], self.y[i].long()\ndef network():\n    return nn.Sequential(nn.Conv2d(3, 8, 3, padding=1), nn.ReLU(),\n                         nn.MaxPool2d(2), nn.AdaptiveAvgPool2d(1),\n                         nn.Flatten(), nn.Linear(8, 2))\n\nmodel = network()\nx, y = next(iter(DataLoader(Pieces(8), batch_size=8, shuffle=False)))\noptimizer = torch.optim.Adam(model.parameters(), lr=0.02)\ncriterion = nn.CrossEntropyLoss()\ninitial = criterion(model(x), y).item()\nfor step in range(120):\n    model.train()\n    optimizer.zero_grad(set_to_none=True)\n    logits = model(x)\n    assert logits.shape == (8, 2)\n    loss = criterion(logits, y)\n    loss.backward()\n    optimizer.step()\nmodel.eval()\nwith torch.no_grad():\n    final = criterion(model(x), y).item()\nprint(\"loss initiale/finale\", initial, final)\nassert final < initial",
      "explanation": [
        "zero_grad évite l’accumulation entre mises à jour.",
        "Aucun softmax ne précède la loss ; argmax des logits suffit pour la classe prédite.",
        "Le test exige une amélioration de loss, sans inventer une valeur obtenue."
      ],
      "expected": "Les shapes sont cohérentes et la loss finale doit être inférieure à l’initiale ; un échec déclenche l’inspection des gradients."
    },
    "exercise": {
      "brief": "Instrumenter chaque couche et comparer un modèle entraîné normalement avec un optimiseur volontairement omis.",
      "constraints": [
        "Même batch et même état initial pour la comparaison.",
        "120 mises à jour maximum.",
        "Ne pas utiliser ces résultats comme score validation."
      ],
      "deliverables": [
        "Table des dimensions par couche",
        "Deux suites de loss",
        "Explication de l’ablation sans optimizer.step"
      ],
      "acceptance": [
        "La branche sans step conserve sa loss à tolérance numérique près.",
        "La branche complète réduit la loss et conserve des gradients finis.",
        "La table des dimensions retrouve B×2 logits et la loss reçoit directement ces logits sans softmax préalable."
      ]
    },
    "correction": {
      "steps": [
        "Reprendre fixture et network de la démonstration dans fixture.py sans la boucle.",
        "Copier le même modèle initial dans deux branches.",
        "Modifier uniquement l’appel optimizer.step et comparer les pertes."
      ],
      "code": "import copy\nimport torch\nfrom torch import nn\nfrom fixture import Pieces, network\nx, y = Pieces(8).x, Pieces(8).y\nbase = network()\nresults = {}\nfor update in (False, True):\n    model = copy.deepcopy(base)\n    optimizer = torch.optim.Adam(model.parameters(), lr=0.02)\n    losses = []\n    for step in range(120):\n        optimizer.zero_grad(set_to_none=True)\n        loss = nn.functional.cross_entropy(model(x), y)\n        losses.append(loss.item())\n        loss.backward()\n        assert all(p.grad is not None and torch.isfinite(p.grad).all() for p in model.parameters())\n        if update:\n            optimizer.step()\n    results[update] = losses\nassert abs(results[False][-1] - results[False][0]) < 1e-6\nassert results[True][-1] < results[True][0]\nprint({k: (v[0], v[-1]) for k, v in results.items()})",
      "explanation": "fixture.py contient seulement les imports, la graine, Pieces et network. Ce test distingue le calcul des gradients de la modification des poids.",
      "verification": [
        "python demo.py ; python correction.py après création de fixture.py",
        "Comparer les deux courbes ; vérifier la sortie B×2 au dernier Linear."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Erreur mat1/mat2",
        "cause": "La taille aplatie ne correspond pas au Linear.",
        "fix": "Inspecter les shapes ; employer AdaptiveAvgPool2d(1) pour stabiliser les huit features."
      },
      {
        "symptom": "Loss figée malgré backward",
        "cause": "optimizer.step absent ou paramètres non optimisés.",
        "fix": "Comparer l’identité des paramètres de l’optimiseur et vérifier la mise à jour de poids."
      }
    ],
    "challenge": "Remplacer le pooling global par Flatten et calculer exactement la taille du Linear pour des images 16×16.",
    "review": [
      {
        "question": "Pourquoi pas softmax avant CrossEntropyLoss ?",
        "expected": "La loss attend des logits et intègre log-softmax ; un softmax préalable fausse son contrat."
      },
      {
        "question": "Surapprendre huit images prouve-t-il la généralisation ?",
        "expected": "Non, seulement que cette chaîne sait mémoriser ces exemples."
      }
    ],
    "reading": [
      {
        "title": "base",
        "url": "https://docs.pytorch.org/tutorials/beginner/basics/",
        "focus": "Lire Build Model puis Optimization ; tracer le chemin logits → loss → backward → step."
      }
    ]
  },
  {
    "id": "w2d3",
    "objective": "Écrire une boucle train/validation complète et sauvegarder le meilleur état selon la loss validation.",
    "prerequisites": [
      "w2d2 ; torch ; fixture synthétique autonome ci-dessous. Pour le projet, remplacer Pieces par Inspection de w2d1 avec les splits figés."
    ],
    "concepts": [
      {
        "title": "Modes et gradients",
        "explanation": "model.train() active les comportements d’entraînement ; model.eval() les désactive, mais seul no_grad ou inference_mode désactive le graphe. L’optimiseur n’intervient jamais en validation."
      },
      {
        "title": "Agrégation et checkpoint",
        "explanation": "Pondérer chaque loss de batch par son effectif évite de surpondérer le dernier batch. Sauvegarder les poids lors de l’amélioration validation, avec configuration et classes, puis recharger ce fichier pour l’évaluation."
      }
    ],
    "demonstration": {
      "title": "Entraîner et sélectionner sans toucher au test",
      "instruction": "Les deux jeux synthétiques ont des graines distinctes ; ils vérifient la boucle, pas la qualité d’un inspecteur réel.",
      "code": "import torch\nfrom torch import nn\nfrom torch.utils.data import Dataset, DataLoader\ntorch.manual_seed(17)\nclass Pieces(Dataset):\n    def __init__(self, n=32, seed=1):\n        generator = torch.Generator().manual_seed(seed)\n        self.y = torch.arange(n) % 2\n        self.x = torch.rand(n, 3, 16, 16, generator=generator) * 0.15\n        self.x[self.y == 1, :, 5:11, 5:11] += 0.7\n    def __len__(self):\n        return len(self.y)\n    def __getitem__(self, i):\n        return self.x[i], self.y[i].long()\ndef network():\n    return nn.Sequential(nn.Conv2d(3, 8, 3, padding=1), nn.ReLU(),\n                         nn.MaxPool2d(2), nn.AdaptiveAvgPool2d(1),\n                         nn.Flatten(), nn.Linear(8, 2))\n\nimport json\ntrain_loader = DataLoader(Pieces(32, 1), batch_size=8, shuffle=True)\nval_loader = DataLoader(Pieces(16, 2), batch_size=8, shuffle=False)\ndevice = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")\nmodel = network().to(device)\noptimizer = torch.optim.Adam(model.parameters(), lr=0.01)\ncriterion, best, history = nn.CrossEntropyLoss(), float(\"inf\"), []\nfor epoch in range(12):\n    metrics = {}\n    for phase, loader in [(\"train\", train_loader), (\"val\", val_loader)]:\n        model.train(phase == \"train\")\n        total, correct, count = 0.0, 0, 0\n        with torch.set_grad_enabled(phase == \"train\"):\n            for x, y in loader:\n                x, y = x.to(device), y.to(device)\n                if phase == \"train\":\n                    optimizer.zero_grad(set_to_none=True)\n                logits = model(x)\n                loss = criterion(logits, y)\n                if phase == \"train\":\n                    loss.backward()\n                    optimizer.step()\n                total += loss.item() * len(y)\n                correct += (logits.argmax(1) == y).sum().item()\n                count += len(y)\n        metrics[phase] = {\"loss\": total / count, \"accuracy\": correct / count}\n    history.append(metrics)\n    if metrics[\"val\"][\"loss\"] < best:\n        best = metrics[\"val\"][\"loss\"]\n        torch.save({\"model\": model.state_dict(), \"epoch\": epoch, \"val_loss\": best,\n                    \"classes\": [\"conforme\", \"defaut\"], \"size\": 16, \"seed\": 17}, \"best.pt\")\nwith open(\"history.json\", \"w\") as stream:\n    json.dump(history, stream, indent=2)\nprint(\"meilleure loss validation\", best)",
      "explanation": [
        "Le transfert x/y vers le même device précède forward.",
        "Le checkpoint contient l’état au moment de l’amélioration, pas une référence à un modèle qui continue à changer.",
        "Le fichier history permet d’analyser les courbes ; l’accuracy seule ne révèle pas tous les défauts manqués."
      ],
      "expected": "best.pt et history.json sont créés avec des métriques réellement calculées ; aucun jeu test n’est utilisé."
    },
    "exercise": {
      "brief": "Adapter la boucle au Dataset réel et ajouter une vérification que la validation ne modifie ni poids ni état du modèle.",
      "constraints": [
        "Une seule architecture et mêmes splits que la baseline.",
        "Aucune augmentation en validation.",
        "Conserver config, nombre d’époques et règle de sélection."
      ],
      "deliverables": [
        "train.py",
        "best.pt et config",
        "Courbes train/validation"
      ],
      "acceptance": [
        "Le checkpoint correspond au minimum de loss validation enregistré.",
        "Les tenseurs du state_dict restent identiques pendant un passage validation.",
        "La loss moyenne de chaque phase est pondérée par les effectifs et inclut le dernier batch incomplet."
      ]
    },
    "correction": {
      "steps": [
        "Réutiliser fixture.py de w2d2 pour contrôler le rechargement.",
        "Charger le checkpoint sur CPU et passer en eval.",
        "Comparer les états avant/après un passage sans gradients et confronter la loss enregistrée à history."
      ],
      "code": "import json\nimport torch\nfrom torch.utils.data import DataLoader\nfrom fixture import Pieces, network\ncheckpoint = torch.load(\"best.pt\", map_location=\"cpu\", weights_only=True)\nmodel = network()\nmodel.load_state_dict(checkpoint[\"model\"])\nmodel.eval()\nbefore = {k: v.clone() for k, v in model.state_dict().items()}\nwith torch.inference_mode():\n    for x, y in DataLoader(Pieces(16, 2), batch_size=8):\n        logits = model(x)\n        assert logits.shape == (len(y), 2)\nassert all(torch.equal(v, before[k]) for k, v in model.state_dict().items())\nhistory = json.load(open(\"history.json\"))\nminimum = min(row[\"val\"][\"loss\"] for row in history)\nassert abs(checkpoint[\"val_loss\"] - minimum) < 1e-8\nassert checkpoint[\"epoch\"] < len(history)\nprint(\"Checkpoint sélectionné à l'époque\", checkpoint[\"epoch\"])",
      "explanation": "La correction vérifie la cohérence des artefacts synthétiques ; effectuer le même contrôle sur le vrai modèle avec sa propre définition et taille d’entrée.",
      "verification": [
        "python demo.py puis python correction.py",
        "Supprimer best.pt et relancer pour exclure un ancien fichier.",
        "Comparer le nombre de points des courbes au nombre d’époques."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "CUDA/CPU mélangés",
        "cause": "Modèle et batch placés sur des devices différents.",
        "fix": "Déplacer x et y avec le même device que le modèle."
      },
      {
        "symptom": "La loss validation dépend du dernier batch",
        "cause": "Moyenne non pondérée ou total réinitialisé dans la boucle.",
        "fix": "Accumuler loss×taille puis diviser par le total d’images."
      }
    ],
    "challenge": "Ajouter une reprise avec état de l’optimiseur et numéro d’époque sans perdre la meilleure valeur validation.",
    "review": [
      {
        "question": "eval désactive-t-il les gradients ?",
        "expected": "Non ; il change le comportement de couches comme Dropout/BatchNorm. no_grad ou inference_mode gère le graphe."
      },
      {
        "question": "Pourquoi garder le meilleur checkpoint plutôt que le dernier ?",
        "expected": "Le dernier peut avoir commencé à surapprendre ; la règle de sélection doit être fixée sur validation."
      }
    ],
    "reading": [
      {
        "title": "save",
        "url": "https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html",
        "focus": "Reproduire state_dict et map_location puis lister les métadonnées nécessaires à la reconstruction."
      }
    ]
  },
  {
    "id": "w2d4",
    "objective": "Recharger le CNN dans un processus séparé et rendre visibles les faux négatifs de la classe défaut.",
    "prerequisites": [
      "best.pt de la démonstration w2d3 ; fixture.py de w2d2 ; torch, scikit-learn. Pour les données réelles, réutiliser Inspection et conserver les chemins."
    ],
    "concepts": [
      {
        "title": "Métriques par classe",
        "explanation": "Le rappel défaut est TP/(TP+FN), la précision défaut TP/(TP+FP). F1 combine les deux mais ne remplace pas le support ; une classe absente rend certaines métriques non interprétables."
      },
      {
        "title": "Galerie reliée aux données",
        "explanation": "La matrice de confusion doit annoncer lignes=vrai et colonnes=prédit ainsi que l’ordre des classes. Toute erreur est liée à un index ou chemin pour distinguer annotation, acquisition et véritable confusion."
      }
    ],
    "demonstration": {
      "title": "Évaluer le checkpoint synthétique indépendamment",
      "instruction": "Exécuter dans evaluate.py, sans importer le script d’entraînement. On utilise la validation pour l’analyse, pas le test réservé.",
      "code": "import csv\nimport torch\nfrom torch.utils.data import DataLoader\nfrom sklearn.metrics import classification_report, confusion_matrix\nfrom torchvision.utils import save_image\nfrom fixture import Pieces, network\ncheckpoint = torch.load(\"best.pt\", map_location=\"cpu\", weights_only=True)\nmodel = network()\nmodel.load_state_dict(checkpoint[\"model\"])\nmodel.eval()\ndataset = Pieces(16, 2)\ntruth, predictions, errors = [], [], []\noffset = 0\nwith torch.inference_mode():\n    for x, y in DataLoader(dataset, batch_size=8, shuffle=False):\n        pred = model(x).argmax(1)\n        truth.extend(y.tolist())\n        predictions.extend(pred.tolist())\n        for j in range(len(y)):\n            if y[j] != pred[j]:\n                errors.append([offset + j, int(y[j]), int(pred[j])])\n                save_image(x[j], f\"error_{offset+j}.png\")\n        offset += len(y)\nprint(\"lignes vrai, colonnes predit\", confusion_matrix(truth, predictions, labels=[0, 1]))\nprint(classification_report(truth, predictions, labels=[0, 1], target_names=checkpoint[\"classes\"], zero_division=0))\nwith open(\"errors.csv\", \"w\", newline=\"\") as stream:\n    writer = csv.writer(stream)\n    writer.writerow([\"index\", \"vrai\", \"predit\"])\n    writer.writerows(errors)",
      "explanation": [
        "Le compteur offset préserve l’index malgré les batches.",
        "La galerie peut être vide sur cette fixture facile : ne pas inventer d’erreurs, passer ensuite aux vraies images validation.",
        "zero_division évite un avertissement, mais une précision à zéro doit être interprétée avec support et nombre de prédictions."
      ],
      "expected": "Rapport par classe, matrice 2×2 et errors.csv sont produits ; les images erronées ne sont exportées que si elles existent."
    },
    "exercise": {
      "brief": "Calculer manuellement les métriques d’une petite liste de décisions puis rapprocher les erreurs du dataset réel.",
      "constraints": [
        "Annoncer classe positive et orientation de la matrice.",
        "Ne jamais régler un seuil sur le test.",
        "Vérifier au moins trois annotations d’erreurs réelles si elles existent."
      ],
      "deliverables": [
        "metrics.json",
        "Galerie FN/FP avec chemins",
        "Note sur support et causes observées"
      ],
      "acceptance": [
        "Les comptes manuels correspondent à sklearn.",
        "Chaque faux négatif réel est traçable à une ligne du manifeste.",
        "L’ordre des classes est écrit et la matrice indique explicitement lignes=vrai, colonnes=prédit."
      ]
    },
    "correction": {
      "steps": [
        "Utiliser une fixture de décisions pour tester le calcul indépendamment de la qualité du modèle.",
        "Définir explicitement TP, FP et FN pour défaut=1.",
        "Comparer rappel/précision calculés aux sorties sklearn."
      ],
      "code": "import json\nfrom sklearn.metrics import confusion_matrix, precision_recall_fscore_support\ntruth = [0, 0, 1, 1, 1, 0]\npred = [0, 1, 1, 0, 1, 0]\ncm = confusion_matrix(truth, pred, labels=[0, 1])\ntn, fp, fn, tp = cm.ravel()\nprecision = tp / (tp + fp)\nrecall = tp / (tp + fn)\np, r, f, support = precision_recall_fscore_support(truth, pred, labels=[0, 1], zero_division=0)\nassert abs(precision - p[1]) < 1e-12\nassert abs(recall - r[1]) < 1e-12\nassert (tn, fp, fn, tp) == (2, 1, 1, 2)\nreport = {\"fixture_pedagogique\": True, \"cm\": cm.tolist(), \"precision_defaut\": precision,\n          \"rappel_defaut\": recall, \"support\": support.tolist()}\nwith open(\"metrics.json\", \"w\") as stream:\n    json.dump(report, stream, indent=2)\nprint(report)",
      "explanation": "Ces valeurs proviennent uniquement de six décisions fabriquées pour vérifier les formules ; elles ne sont pas des scores ML mesurés sur le projet.",
      "verification": [
        "python evaluate.py ; python correction.py",
        "Vérifier FP=1 et FN=1 sur la liste manuelle.",
        "Sur données réelles, comparer le nombre d’images exportées au nombre d’erreurs dans la matrice."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "La matrice semble inversée",
        "cause": "Ordre des classes ou orientation non annoncé.",
        "fix": "Passer labels=[0,1] et écrire lignes=vrai, colonnes=prédit."
      },
      {
        "symptom": "Les images ne correspondent pas aux erreurs",
        "cause": "Shuffle ou index de batch confondu avec index dataset.",
        "fix": "Désactiver shuffle et retourner aussi le chemin depuis Dataset."
      }
    ],
    "challenge": "Créer un rapport séparé par caméra sans réentraîner ; signaler les sous-groupes de support insuffisant.",
    "review": [
      {
        "question": "Un rappel défaut élevé garantit-il peu de fausses alertes ?",
        "expected": "Non, la précision dépend des faux positifs ; inspecter les deux."
      },
      {
        "question": "Pourquoi joindre le support ?",
        "expected": "Une métrique calculée sur deux défauts est beaucoup moins stable qu’une métrique sur un grand nombre de cas."
      }
    ],
    "reading": [
      {
        "title": "report",
        "url": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html",
        "focus": "Lire la définition des moyennes macro/pondérée et expliquer leur différence sur un dataset déséquilibré."
      }
    ]
  },
  {
    "id": "w2d5",
    "objective": "Reproduire une expérience et expliquer les écarts entre apprentissage, validation et stabilité des exécutions.",
    "prerequisites": [
      "history.json de w2d3 ; torch, numpy, matplotlib ; fixture.py de w2d2."
    ],
    "concepts": [
      {
        "title": "Courbes et capacité",
        "explanation": "Une loss train qui baisse pendant que la validation augmente suggère du surapprentissage ; deux pertes hautes peuvent venir d’une capacité insuffisante, d’un bug ou de données mal étiquetées. Les courbes orientent une enquête, pas une conclusion automatique."
      },
      {
        "title": "Reproductibilité bornée",
        "explanation": "Fixer graines, ordre des données et versions aide à répéter une expérience sur le même environnement. Des différences de backend ou de GPU peuvent subsister ; consigner matériel et tolérances plutôt que promettre une identité universelle."
      }
    ],
    "demonstration": {
      "title": "Relancer deux entraînements contrôlés",
      "instruction": "Fixture pédagogique et CNN définis dans fixture.py ; ce test CPU évite d’attribuer un écart à un dataset externe.",
      "code": "import random, json, platform\nimport numpy as np\nimport torch\nfrom torch.utils.data import DataLoader\nfrom fixture import Pieces, network\n\ndef run(seed):\n    random.seed(seed)\n    np.random.seed(seed)\n    torch.manual_seed(seed)\n    torch.use_deterministic_algorithms(True)\n    generator = torch.Generator().manual_seed(seed)\n    loader = DataLoader(Pieces(32, 1), batch_size=8, shuffle=True, generator=generator)\n    model = network()\n    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)\n    losses = []\n    for epoch in range(3):\n        total = 0.0\n        for x, y in loader:\n            optimizer.zero_grad(set_to_none=True)\n            loss = torch.nn.functional.cross_entropy(model(x), y)\n            loss.backward()\n            optimizer.step()\n            total += loss.item() * len(y)\n        losses.append(total / len(loader.dataset))\n    return losses\nfirst, second = run(21), run(21)\nassert np.allclose(first, second, atol=1e-7)\nprint(first, second)\nwith open(\"reproduction.json\", \"w\") as stream:\n    json.dump({\"seed\": 21, \"torch\": torch.__version__, \"python\": platform.python_version(), \"device\": \"cpu\", \"losses\": first}, stream, indent=2)",
      "explanation": [
        "Réinitialiser uniquement la graine après construction du modèle ne réinitialise pas ses poids.",
        "La graine du générateur DataLoader contrôle le mélange indépendamment des autres opérations aléatoires.",
        "Une répétition réussie ne remplace pas la comparaison de plusieurs graines pour estimer la variabilité."
      ],
      "expected": "Les deux listes de loss doivent être proches dans cet environnement CPU ; reproduction.json conserve le contexte de la relance."
    },
    "exercise": {
      "brief": "Produire les courbes réelles puis une synthèse orale de trois limites : données, architecture, protocole.",
      "constraints": [
        "Ne pas attribuer automatiquement toute divergence au surapprentissage.",
        "Conserver une configuration par essai.",
        "Ne pas sélectionner une graine d’après le test."
      ],
      "deliverables": [
        "curves.png",
        "reproduction.json",
        "Note de diagnostic étayée par courbes et galerie"
      ],
      "acceptance": [
        "Axes et légende indiquent loss et époque.",
        "La relance reprend configuration et seed.",
        "Les trois limites citent des preuves ou une vérification à mener."
      ]
    },
    "correction": {
      "steps": [
        "Lire les métriques réellement sauvegardées.",
        "Tracer train et validation sur les mêmes axes sans lisser les divergences.",
        "Repérer l’époque choisie et conserver les valeurs brutes."
      ],
      "code": "import json\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nhistory = json.load(open(\"history.json\"))\nassert history and all(\"train\" in r and \"val\" in r for r in history)\nepochs = list(range(len(history)))\ntrain = [r[\"train\"][\"loss\"] for r in history]\nval = [r[\"val\"][\"loss\"] for r in history]\nbest = min(epochs, key=lambda i: val[i])\nfig, ax = plt.subplots(figsize=(7, 4))\nax.plot(epochs, train, label=\"train\")\nax.plot(epochs, val, label=\"validation\")\nax.axvline(best, linestyle=\"--\", color=\"black\", label=\"checkpoint retenu\")\nax.set(xlabel=\"Époque (indice)\", ylabel=\"CrossEntropy moyenne\")\nax.legend()\nfig.tight_layout()\nfig.savefig(\"curves.png\", dpi=150)\nprint(\"Époque retenue\", best, \"Dernières pertes\", train[-1], val[-1])",
      "explanation": "Le minimum validation est visible ; le graphe ne contient aucune mesure test et n’invente pas une tendance de surapprentissage.",
      "verification": [
        "python demo.py puis python correction.py",
        "Vérifier que le trait de sélection correspond au best.pt de w2d3.",
        "Exécuter depuis un terminal neuf avec les commandes du README."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Deux essais diffèrent malgré une graine",
        "cause": "Modèle non réinitialisé, workers ou opérations non déterministes.",
        "fix": "Réinitialiser chaque run, commencer CPU/num_workers=0 et consigner les versions."
      },
      {
        "symptom": "Courbes train/val incomparables",
        "cause": "Pertes agrégées différemment ou augmentation active en validation.",
        "fix": "Utiliser la même loss moyenne par image et une validation déterministe."
      }
    ],
    "challenge": "Comparer trois graines sur validation et rapporter étendue et effectifs sans déclarer un gain sur une seule exécution.",
    "review": [
      {
        "question": "Une courbe validation montante prouve-t-elle toujours le surapprentissage ?",
        "expected": "Non ; vérifier mode eval, pipeline, support et éventuel changement de distribution."
      },
      {
        "question": "Pourquoi enregistrer la configuration en plus de la graine ?",
        "expected": "La graine ne décrit ni architecture, ni données, ni preprocessing, ni versions."
      }
    ],
    "reading": [
      {
        "title": "base",
        "url": "https://docs.pytorch.org/tutorials/beginner/basics/",
        "focus": "Relire Optimization et identifier les choix nécessaires à une relance indépendante."
      }
    ]
  },
  {
    "id": "w3d1",
    "objective": "Adapter ResNet18 aux deux classes, entraîner sa tête et vérifier que le backbone y compris BatchNorm reste figé.",
    "prerequisites": [
      "dataset.py contenant Inspection de w2d1 ; splits.csv inchangé ; torch et torchvision compatibles.",
      "Poids ResNet18 officiels disponibles en cache ou téléchargement autorisé ; images RGB réelles, pas les carrés du test technique."
    ],
    "concepts": [
      {
        "title": "Preprocessing des poids",
        "explanation": "Les poids portent une recette d’entrée : taille, recadrage et normalisation. weights.transforms() rend cette recette explicite ; ne pas renormaliser une seconde fois. Vérifier qu’un center crop ne coupe pas le défaut."
      },
      {
        "title": "Gel complet",
        "explanation": "requires_grad=False fige les paramètres mais pas les running_mean/running_var de BatchNorm. Pour la tête seule, appeler model.eval() puis model.fc.train() à chaque époque ; le backbone conserve ainsi ses statistiques préentraînées."
      }
    ],
    "demonstration": {
      "title": "Entraîner uniquement la tête",
      "instruction": "Nécessite les fichiers préparés ci-dessus ; ce code est une vraie boucle Dataset/DataLoader, sans score promis.",
      "code": "import torch\nfrom torch import nn\nfrom torch.utils.data import DataLoader\nfrom torchvision.models import resnet18, ResNet18_Weights\nfrom dataset import Inspection\nweights = ResNet18_Weights.DEFAULT\ntrain = Inspection(\"splits.csv\", \"train\")\nvalidation = Inspection(\"splits.csv\", \"val\")\ntrain.transform = weights.transforms()\nvalidation.transform = weights.transforms()\ntrain_loader = DataLoader(train, batch_size=8, shuffle=True, num_workers=0)\nval_loader = DataLoader(validation, batch_size=8, shuffle=False, num_workers=0)\nmodel = resnet18(weights=weights)\nfor parameter in model.parameters():\n    parameter.requires_grad = False\nmodel.fc = nn.Linear(model.fc.in_features, 2)\n\noptimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)\nbefore = {k: v.clone() for k, v in model.state_dict().items() if not k.startswith(\"fc.\")}\nfor epoch in range(2):\n    model.eval()\n    model.fc.train()\n    for x, y in train_loader:\n        optimizer.zero_grad(set_to_none=True)\n        logits = model(x)\n        loss = nn.functional.cross_entropy(logits, y)\n        loss.backward()\n        optimizer.step()\n    model.eval()\n    total, count = 0.0, 0\n    with torch.inference_mode():\n        for x, y in val_loader:\n            total += nn.functional.cross_entropy(model(x), y, reduction=\"sum\").item()\n            count += len(y)\n    print(epoch, \"loss validation\", total / count)\nassert all(torch.equal(value, before[key]) for key, value in model.state_dict().items() if key in before)\ntorch.save({\"model\": model.state_dict(), \"weights\": str(weights), \"classes\": [\"conforme\", \"defaut\"]}, \"head.pt\")",
      "explanation": [
        "L’optimiseur ne reçoit que fc ; le gel des autres paramètres évite le calcul inutile de leurs gradients.",
        "model.eval() ne désactive pas le gradient de fc : la tête apprend malgré ce mode global.",
        "La comparaison state_dict inclut les buffers BatchNorm, contrairement à une comparaison des seuls parameters."
      ],
      "expected": "La loss validation est affichée et head.pt est produit ; tous les poids et buffers hors fc restent strictement identiques."
    },
    "exercise": {
      "brief": "Comparer la tête seule au CNN sur le même manifeste et prouver le gel des statistiques BatchNorm.",
      "constraints": [
        "Même ordre des classes et mêmes images validation.",
        "Documenter les différences de preprocessing.",
        "Aucun model.train() global pendant la phase tête seule."
      ],
      "deliverables": [
        "head.pt",
        "Configuration poids/preprocessing",
        "Vérification du gel et rapport validation"
      ],
      "acceptance": [
        "Seule fc a requires_grad=True.",
        "Les running_mean/running_var ne changent pas.",
        "La tête reçoit des gradients non nuls sur un batch valide."
      ]
    },
    "correction": {
      "steps": [
        "Construire une architecture ResNet18 sans téléchargement et charger head.pt.",
        "Inspecter les paramètres entraînables.",
        "Vérifier le contrat logits sur un batch réel et l’absence de mode train dans BatchNorm."
      ],
      "code": "import torch\nfrom torch import nn\nfrom torchvision.models import resnet18, ResNet18_Weights\nfrom dataset import Inspection\ncheckpoint = torch.load(\"head.pt\", map_location=\"cpu\", weights_only=True)\nmodel = resnet18(weights=None)\nmodel.fc = nn.Linear(model.fc.in_features, 2)\nmodel.load_state_dict(checkpoint[\"model\"])\nfor name, p in model.named_parameters():\n    p.requires_grad = name.startswith(\"fc.\")\nmodel.eval()\nmodel.fc.train()\nassert all(not m.training for m in model.modules() if isinstance(m, nn.BatchNorm2d))\ndata = Inspection(\"splits.csv\", \"val\")\ndata.transform = ResNet18_Weights.DEFAULT.transforms()\nx, y = data[0]\nlogits = model(x.unsqueeze(0))\nloss = nn.functional.cross_entropy(logits, y.unsqueeze(0))\nloss.backward()\nassert model.fc.weight.grad is not None\nassert model.conv1.weight.grad is None\nassert logits.shape == (1, 2)\nprint(\"Paramètres entraînables\", [n for n, p in model.named_parameters() if p.requires_grad])",
      "explanation": "Charger weights=None évite un second téléchargement ; le checkpoint fournit tous les paramètres et buffers.",
      "verification": [
        "python demo.py puis python correction.py",
        "Comparer la galerie validation avec le CNN, sans changer les splits.",
        "Inspecter quelques crops pour vérifier que les défauts restent visibles."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les buffers changent malgré le gel",
        "cause": "model.train() active BatchNorm.",
        "fix": "Rappeler eval sur le backbone ; pour tête seule, model.eval() puis model.fc.train()."
      },
      {
        "symptom": "Défauts supprimés au preprocessing",
        "cause": "Center crop trop restrictif pour leur localisation.",
        "fix": "Inspecter les crops et définir une politique alternative comparée sur validation, documentée avec le modèle."
      }
    ],
    "challenge": "Tester une politique de conservation du champ entier ; comparer sur les mêmes cas sans attribuer le gain au backbone seul.",
    "review": [
      {
        "question": "requires_grad=False suffit-il à geler BatchNorm ?",
        "expected": "Non ; ses statistiques de running sont des buffers mis à jour en mode train."
      },
      {
        "question": "Pourquoi charger weights.transforms() ?",
        "expected": "Pour retrouver la normalisation et les transformations associées aux poids utilisés."
      }
    ],
    "reading": [
      {
        "title": "transfer",
        "url": "https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html",
        "focus": "Lire ConvNet as fixed feature extractor et repérer ce qu’il faut compléter pour figer les buffers BatchNorm."
      }
    ]
  },
  {
    "id": "w3d2",
    "objective": "Dégeler layer4 avec un learning rate inférieur à celui de la tête et sélectionner le meilleur fine-tuning sur validation.",
    "prerequisites": [
      "head.pt de w3d1 ; dataset.py, splits.csv ; torch/torchvision ; même preprocessing et matériel consignés."
    ],
    "concepts": [
      {
        "title": "Dégel progressif",
        "explanation": "Dégeler une partie du réseau augmente sa capacité d’adaptation et le risque de surapprentissage. Commencer par layer4 et comparer à la tête seule, sans changer simultanément données et résolution."
      },
      {
        "title": "Groupes de paramètres",
        "explanation": "Un optimiseur créé avant le dégel peut oublier les nouvelles couches. Le reconstruire avec deux groupes explicites permet un LR faible pour layer4 et plus élevé pour fc ; la politique BatchNorm doit être annoncée."
      }
    ],
    "demonstration": {
      "title": "Fine-tuner le dernier bloc en gardant BatchNorm figé",
      "instruction": "Préparer dataset.py/Inspection et head.pt ; on entraîne layer4 et fc, avec toutes les BatchNorm en eval et leurs paramètres affines figés.",
      "code": "import torch\nfrom torch import nn\nfrom torch.utils.data import DataLoader\nfrom torchvision.models import resnet18, ResNet18_Weights\nfrom dataset import Inspection\nmodel = resnet18(weights=None)\nmodel.fc = nn.Linear(model.fc.in_features, 2)\nmodel.load_state_dict(torch.load(\"head.pt\", map_location=\"cpu\", weights_only=True)[\"model\"])\nfor name, p in model.named_parameters():\n    p.requires_grad = name.startswith((\"layer4.\", \"fc.\"))\nfor module in model.modules():\n    if isinstance(module, nn.BatchNorm2d):\n        for p in module.parameters():\n            p.requires_grad = False\noptimizer = torch.optim.Adam([\n    {\"params\": [p for n, p in model.named_parameters() if n.startswith(\"layer4.\") and p.requires_grad], \"lr\": 1e-5},\n    {\"params\": model.fc.parameters(), \"lr\": 1e-4}])\nloaders = {}\nfor split in [\"train\", \"val\"]:\n    data = Inspection(\"splits.csv\", split)\n    data.transform = ResNet18_Weights.DEFAULT.transforms()\n    loaders[split] = DataLoader(data, batch_size=8, shuffle=split == \"train\")\nbest = float(\"inf\")\nfor epoch in range(3):\n    for phase in [\"train\", \"val\"]:\n        model.train(phase == \"train\")\n        for module in model.modules():\n            if isinstance(module, nn.BatchNorm2d):\n                module.eval()\n        total, count = 0.0, 0\n        with torch.set_grad_enabled(phase == \"train\"):\n            for x, y in loaders[phase]:\n                optimizer.zero_grad(set_to_none=True)\n                loss = nn.functional.cross_entropy(model(x), y)\n                if phase == \"train\":\n                    loss.backward()\n                    optimizer.step()\n                total += loss.item() * len(y)\n                count += len(y)\n        if phase == \"val\" and total / count < best:\n            best = total / count\n            torch.save({\"model\": model.state_dict(), \"epoch\": epoch, \"val_loss\": best,\n                        \"lr_backbone\": 1e-5, \"lr_head\": 1e-4, \"bn\": \"frozen\"}, \"finetune.pt\")\nprint(\"meilleure loss validation\", best)",
      "explanation": [
        "BatchNorm est remis en eval après chaque model.train(), sinon ses buffers changeraient.",
        "Les paramètres affines BatchNorm sont exclus des groupes en cohérence avec la politique gelée.",
        "Le meilleur fichier n’est sélectionné que sur validation ; trois époques servent de première expérience courte."
      ],
      "expected": "finetune.pt contient le meilleur état validation et les LR documentés ; aucun test n’est lu."
    },
    "exercise": {
      "brief": "Comparer un dégel layer4 et un dégel fc seul sur un budget fixé, en contrôlant les paramètres réellement présents dans l’optimiseur.",
      "constraints": [
        "Une seule différence : couches entraînées/LR associés.",
        "Fixer budget et seed avant lancement.",
        "Conserver la politique BatchNorm dans la configuration."
      ],
      "deliverables": [
        "Deux configurations",
        "Journal des loss validation",
        "Liste des paramètres optimisés et décision"
      ],
      "acceptance": [
        "Tous les paramètres entraînables sont optimisés une fois exactement.",
        "Aucun paramètre gelé n’est dans l’optimiseur.",
        "La décision cite des valeurs mesurées, même si le fine-tuning perd."
      ]
    },
    "correction": {
      "steps": [
        "Conserver le code de construction du modèle/optimiseur dans setup_finetune.py.",
        "Comparer les identités des tenseurs, pas seulement leurs noms.",
        "Contrôler les buffers BN après une mise à jour."
      ],
      "code": "import torch\nfrom torch import nn\n# setup_finetune.py contient la construction du modèle et de l'optimiseur\n# de la démonstration, sans la boucle ni les DataLoaders.\nfrom setup_finetune import model, optimizer\nexpected = {id(p) for p in model.parameters() if p.requires_grad}\nactual = [id(p) for group in optimizer.param_groups for p in group[\"params\"]]\nassert len(actual) == len(set(actual))\nassert set(actual) == expected\nmodel.train()\nfor module in model.modules():\n    if isinstance(module, nn.BatchNorm2d):\n        module.eval()\nbefore = {n: b.clone() for n, b in model.named_buffers()}\nx, y = torch.rand(2, 3, 224, 224), torch.tensor([0, 1])\noptimizer.zero_grad(set_to_none=True)\nnn.functional.cross_entropy(model(x), y).backward()\noptimizer.step()\nassert all(torch.equal(b, before[n]) for n, b in model.named_buffers())\nprint(\"LR\", [g[\"lr\"] for g in optimizer.param_groups], \"BN inchangées\")",
      "explanation": "Le batch synthétique de vérification contrôle uniquement les mécanismes de dégel ; la comparaison qualité utilise les vraies données validation.",
      "verification": [
        "python demo.py ; python correction.py après extraction de setup_finetune.py",
        "Vérifier que val_loss du checkpoint correspond au minimum du journal."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "layer4 ne change jamais",
        "cause": "L’optimiseur a été créé avant le dégel ou ne contient que fc.",
        "fix": "Reconstruire les groupes et comparer leurs id aux paramètres entraînables."
      },
      {
        "symptom": "La validation se dégrade immédiatement",
        "cause": "LR trop fort ou adaptation excessive sur peu de données.",
        "fix": "Revenir au checkpoint tête seule et tester un LR plus faible avec le même protocole."
      }
    ],
    "challenge": "Dégeler layer3 lors d’une expérience séparée et mesurer le coût en temps et le rappel défaut avant de le conserver.",
    "review": [
      {
        "question": "Pourquoi plusieurs LR ?",
        "expected": "La tête neuve doit davantage s’adapter ; les poids préentraînés demandent des mises à jour plus prudentes."
      },
      {
        "question": "Quand réappliquer la politique BN ?",
        "expected": "Après chaque appel global model.train(), car il remet les sous-modules en mode train."
      }
    ],
    "reading": [
      {
        "title": "transfer",
        "url": "https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html",
        "focus": "Comparer fine-tuning et extraction fixe ; expliquer la liste de paramètres transmise à l’optimiseur."
      }
    ]
  },
  {
    "id": "w3d3",
    "objective": "Tester une augmentation plausible et une stratégie de déséquilibre sans changer le protocole d’évaluation.",
    "prerequisites": [
      "dataset.py, splits.csv, classes 0/1 ; torch/torchvision ; règles métier sur la géométrie et la couleur des défauts validées."
    ],
    "concepts": [
      {
        "title": "Invariance métier",
        "explanation": "Une transformation n’est acceptable que si le défaut conserve son sens. Une rotation peut être plausible pour une pièce libre mais fausse pour un montage orienté ; un crop peut effacer un défaut fin et conserver son label à tort."
      },
      {
        "title": "Déséquilibre et échantillonnage",
        "explanation": "WeightedRandomSampler modifie la fréquence des exemples train. Une loss pondérée modifie leur coût ; cumuler les deux sans justification peut surcorriger. La distribution validation reste réelle et le rappel défaut se lit avec la précision."
      }
    ],
    "demonstration": {
      "title": "Construire trois variantes isolées",
      "instruction": "Le code prépare baseline, augmentation seule et échantillonnage seul. Les flips sont un exemple uniquement si l’orientation ne définit pas la conformité.",
      "code": "import torch\nfrom torch.utils.data import DataLoader, WeightedRandomSampler\nfrom torchvision import transforms\nfrom torchvision.models import ResNet18_Weights\nfrom dataset import Inspection\nbase = ResNet18_Weights.DEFAULT.transforms()\nvariants = {}\nfor mode in [\"baseline\", \"flip\", \"sampler\"]:\n    data = Inspection(\"splits.csv\", \"train\")\n    data.transform = transforms.Compose([transforms.RandomHorizontalFlip(p=0.5), base]) if mode == \"flip\" else base\n    labels = torch.tensor([int(r[\"label\"]) for r in data.rows])\n    counts = torch.bincount(labels, minlength=2)\n    assert (counts > 0).all(), \"Une classe manque dans train\"\n    sampler = None\n    if mode == \"sampler\":\n        sample_weights = 1.0 / counts[labels].float()\n        sampler = WeightedRandomSampler(sample_weights, len(labels), replacement=True,\n                                        generator=torch.Generator().manual_seed(31))\n    variants[mode] = DataLoader(data, batch_size=8, sampler=sampler,\n                               shuffle=sampler is None, num_workers=0)\nvalidation = Inspection(\"splits.csv\", \"val\")\nvalidation.transform = base\nfor name, loader in variants.items():\n    histogram = torch.zeros(2, dtype=torch.long)\n    for x, y in loader:\n        histogram += torch.bincount(y, minlength=2)\n    print(name, \"effectifs vus dans une époque\", histogram.tolist())",
      "explanation": [
        "Les effectifs tirés par le sampler fluctuent ; équilibrer en espérance ne garantit pas 50/50 à chaque époque.",
        "Validation reprend exactement le preprocessing déterministe, sans sampler.",
        "Entraîner ensuite chaque variante avec la boucle w3d2, même initialisation et même budget, en modifiant un facteur à la fois."
      ],
      "expected": "Les distributions réellement vues sont imprimées ; aucune amélioration de qualité n’est affirmée avant entraînement et évaluation."
    },
    "exercise": {
      "brief": "Comparer baseline à une seule modification et montrer huit exemples augmentés avant de lancer l’expérience.",
      "constraints": [
        "Ne pas cumuler sampler et pondération de loss.",
        "Aucun changement de split ni d’annotations.",
        "Inspecter petits défauts après transformation."
      ],
      "deliverables": [
        "Galerie avant/après",
        "Config de l’essai",
        "Rappel/précision défaut et support validation"
      ],
      "acceptance": [
        "Les huit transformations conservent le défaut ou sont rejetées.",
        "La validation garde ses effectifs initiaux.",
        "Un seul facteur explique la comparaison."
      ]
    },
    "correction": {
      "steps": [
        "Vérifier le sampler sur une liste déséquilibrée contrôlée.",
        "Comparer les probabilités totales par classe plutôt qu’exiger des tirages exactement égaux.",
        "Fixer une graine et consigner les effectifs observés."
      ],
      "code": "import torch\nfrom torch.utils.data import WeightedRandomSampler\nlabels = torch.tensor([0] * 18 + [1] * 2)\ncounts = torch.bincount(labels)\nweights = 1 / counts[labels].float()\nprobabilities = weights / weights.sum()\nmass = torch.stack([probabilities[labels == c].sum() for c in [0, 1]])\nassert torch.allclose(mass, torch.tensor([0.5, 0.5]))\nsampler = WeightedRandomSampler(weights, 200, replacement=True,\n                                generator=torch.Generator().manual_seed(31))\nindices = torch.tensor(list(sampler))\nobserved = torch.bincount(labels[indices], minlength=2)\nprint(\"masses théoriques\", mass.tolist(), \"tirages observés\", observed.tolist())\nassert observed.sum() == 200\nassert len(indices.unique()) <= len(labels)",
      "explanation": "Cette fixture démontre le mécanisme probabiliste, pas un gain de rappel ; le remplacement peut revoir plusieurs fois les mêmes défauts rares.",
      "verification": [
        "python demo.py ; python correction.py",
        "Comparer les supports validation avant/après : ils doivent être identiques.",
        "Revoir chaque image dont le défaut disparaît après crop."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "sampler et shuffle provoquent une erreur",
        "cause": "DataLoader interdit leur activation simultanée.",
        "fix": "Utiliser shuffle=False lorsqu’un sampler est fourni."
      },
      {
        "symptom": "Le modèle voit toujours les mêmes défauts rares",
        "cause": "Échantillonnage avec remplacement sur très peu de cas distincts.",
        "fix": "Collecter de nouveaux défauts et inspecter le surapprentissage plutôt que répéter davantage."
      }
    ],
    "challenge": "Proposer une augmentation d’éclairage bornée à partir de mesures d’acquisition, puis vérifier les défauts dont le contraste change de signe.",
    "review": [
      {
        "question": "Pourquoi garder la distribution validation ?",
        "expected": "Pour mesurer les erreurs sur la population visée plutôt que sur un jeu artificiellement équilibré."
      },
      {
        "question": "Un sampler crée-t-il de nouvelles informations ?",
        "expected": "Non ; il répète des observations existantes et ne remplace pas une collecte de cas rares."
      }
    ],
    "reading": [
      {
        "title": "transfer",
        "url": "https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html",
        "focus": "Examiner data augmentation et expliquer quelles transformations seraient dangereuses pour les défauts du projet."
      }
    ]
  },
  {
    "id": "w3d4",
    "objective": "Comparer CNN, tête seule et fine-tuning sur les mêmes images et mesurer leur latence dans des conditions explicites.",
    "prerequisites": [
      "Préparer predictions.csv : path,truth,cnn,head,finetune sur exactement la même validation ; torch.",
      "Pour le benchmark, head.pt et finetune.pt de w3d1/2 ; architecture ResNet18 ; CPU dans cet exemple."
    ],
    "concepts": [
      {
        "title": "Comparaison appariée",
        "explanation": "Le score global peut masquer des erreurs corrigées et de nouvelles régressions. Comparer image par image sur une validation identique, avec mapping de classes stable, puis regarder classes et conditions."
      },
      {
        "title": "Latence comparable",
        "explanation": "Préchauffer, répéter, annoncer device, taille, batch et périmètre. Le temps modèle seul exclut décodage et preprocessing ; sur CUDA synchroniser avant et après la mesure pour éviter de chronométrer seulement l’envoi des tâches."
      }
    ],
    "demonstration": {
      "title": "Analyser les erreurs communes et mesurer deux ResNet",
      "instruction": "predictions.csv est exporté par les scripts d’évaluation sur validation ; les checkpoints restent ceux sélectionnés en validation.",
      "code": "import csv, time, statistics\nimport torch\nfrom torch import nn\nfrom torchvision.models import resnet18\nrows = list(csv.DictReader(open(\"predictions.csv\", encoding=\"utf-8\")))\nassert rows and len({r[\"path\"] for r in rows}) == len(rows)\nfor name in [\"cnn\", \"head\", \"finetune\"]:\n    wrong = [r[\"path\"] for r in rows if r[name] != r[\"truth\"]]\n    print(name, \"erreurs\", len(wrong), \"/\", len(rows))\nfixed = [r[\"path\"] for r in rows if r[\"cnn\"] != r[\"truth\"] and r[\"finetune\"] == r[\"truth\"]]\nregressed = [r[\"path\"] for r in rows if r[\"cnn\"] == r[\"truth\"] and r[\"finetune\"] != r[\"truth\"]]\nprint(\"corrigées\", fixed, \"régressions\", regressed)\nx = torch.rand(1, 3, 224, 224)\nfor filename in [\"head.pt\", \"finetune.pt\"]:\n    model = resnet18(weights=None)\n    model.fc = nn.Linear(model.fc.in_features, 2)\n    model.load_state_dict(torch.load(filename, map_location=\"cpu\", weights_only=True)[\"model\"])\n    model.eval()\n    durations = []\n    with torch.inference_mode():\n        for _ in range(5):\n            model(x)\n        for _ in range(30):\n            start = time.perf_counter()\n            model(x)\n            durations.append((time.perf_counter() - start) * 1000)\n    print(filename, \"CPU batch1 224x224 modèle seul médiane ms\", statistics.median(durations))",
      "explanation": [
        "Les listes corrigées/régressions rendent visible le coût de l’amélioration.",
        "Tête seule et fine-tuning partagent une architecture ; leurs latences devraient être proches dans un protocole stable, malgré des poids différents.",
        "Pour CNN, exécuter son architecture et son entrée réelle séparément ; rapporter aussi l’effet du changement de résolution."
      ],
      "expected": "Comptes d’erreurs et latences mesurées sont affichés ; ils ne sont pas présupposés et n’incluent pas le chargement image."
    },
    "exercise": {
      "brief": "Livrer un tableau qualité/temps des trois modèles et une galerie de deux erreurs corrigées et deux régressions si disponibles.",
      "constraints": [
        "Même validation et même matériel.",
        "Distinguer temps modèle et temps pipeline complet.",
        "Ne pas inventer de cas si la catégorie est vide."
      ],
      "deliverables": [
        "comparison.csv avec support",
        "Rapport benchmark avec versions et dimensions",
        "Galerie appariée avec chemins"
      ],
      "acceptance": [
        "Le nombre de prédictions est identique pour les trois modèles.",
        "Les listes d’erreurs se recalculent depuis les prédictions.",
        "Le périmètre de chaque temps est écrit."
      ]
    },
    "correction": {
      "steps": [
        "Calculer les mesures par modèle depuis la table jointe par chemin.",
        "Inclure le support défaut et le nombre de régressions.",
        "Exporter les données avant de rédiger la décision."
      ],
      "code": "import csv\nfrom sklearn.metrics import precision_recall_fscore_support\nrows = list(csv.DictReader(open(\"predictions.csv\", encoding=\"utf-8\")))\nassert rows and all(r[\"truth\"] in {\"0\", \"1\"} for r in rows)\ntruth = [int(r[\"truth\"]) for r in rows]\nsummary = []\nfor name in [\"cnn\", \"head\", \"finetune\"]:\n    pred = [int(r[name]) for r in rows]\n    p, r, f, support = precision_recall_fscore_support(truth, pred, labels=[0, 1], zero_division=0)\n    regressions = sum(row[\"cnn\"] == row[\"truth\"] and row[name] != row[\"truth\"] for row in rows)\n    summary.append([name, p[1], r[1], f[1], int(support[1]), regressions])\nwith open(\"comparison.csv\", \"w\", newline=\"\") as stream:\n    writer = csv.writer(stream)\n    writer.writerow([\"model\", \"precision_defaut\", \"rappel_defaut\", \"f1_defaut\", \"support_defaut\", \"regressions_vs_cnn\"])\n    writer.writerows(summary)\nassert len(summary) == 3\nprint(summary)",
      "explanation": "La table ne contient pas de faux temps : ajouter seulement les latences effectivement chronométrées, avec leurs conditions.",
      "verification": [
        "python demo.py puis python correction.py",
        "Échantillonner cinq chemins et vérifier les prédictions dans les sorties originales.",
        "Répéter le benchmark après fermeture des tâches concurrentes si les temps fluctuent fortement."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Modèle GPU annoncé très rapide",
        "cause": "Mesure asynchrone sans synchronisation CUDA.",
        "fix": "Synchroniser avant le début et à la fin, puis refaire warm-up et répétitions."
      },
      {
        "symptom": "Le nouveau modèle corrige tout",
        "cause": "Jointure sur index après shuffle plutôt que sur chemin.",
        "fix": "Joindre par identifiant stable et refuser doublons/manquants."
      }
    ],
    "challenge": "Ajouter un benchmark décodage+preprocessing+modèle sur un dossier, en séparant premier passage et régime chaud.",
    "review": [
      {
        "question": "Pourquoi comparer les erreurs une à une ?",
        "expected": "Un gain moyen peut cacher la perte de défauts critiques auparavant détectés."
      },
      {
        "question": "Le temps modèle seul suffit-il pour promettre un débit usine ?",
        "expected": "Non ; acquisition, transferts, preprocessing et export contribuent aussi au temps total."
      }
    ],
    "reading": [
      {
        "title": "report",
        "url": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html",
        "focus": "Interpréter F1 macro et rappel défaut pour éviter de choisir un modèle uniquement sur accuracy."
      }
    ]
  },
  {
    "id": "w3d5",
    "objective": "Choisir modèle et seuil avec un coût explicite des erreurs, puis figer une décision exploitable.",
    "prerequisites": [
      "validation_scores.csv avec path,truth,prob_defaut provenant des logits via softmax ; classes 0/1.",
      "Coûts FN/FP et contraintes métier discutés avec l’encadrant ; aucun accès au test pour régler le seuil."
    ],
    "concepts": [
      {
        "title": "Score et seuil",
        "explanation": "Le score softmax est une sortie du modèle, pas une garantie de calibration. Avec défaut=1, abaisser le seuil augmente normalement les alertes et le rappel sur une même liste de scores, au prix de faux positifs."
      },
      {
        "title": "Décision et incertitude",
        "explanation": "Choisir un seuil selon coût et contraintes sur validation ; un petit support ou une nouvelle caméra limite la confiance. Figer modèle, preprocessing et seuil ensemble avant toute évaluation finale."
      }
    ],
    "demonstration": {
      "title": "Explorer un coût sur validation",
      "instruction": "Les coûts ci-dessous sont des hypothèses pédagogiques à remplacer par des coûts métier documentés ; les scores proviennent de votre validation.",
      "code": "import csv, json\nrows = list(csv.DictReader(open(\"validation_scores.csv\", encoding=\"utf-8\")))\ntruth = [int(r[\"truth\"]) for r in rows]\nscores = [float(r[\"prob_defaut\"]) for r in rows]\nassert rows and set(truth) == {0, 1}\nassert all(0 <= s <= 1 for s in scores)\ncost_fn, cost_fp = 10, 1\ncandidates = sorted({0.0, 1.0, *scores})\nresults = []\nfor threshold in candidates:\n    predictions = [int(s >= threshold) for s in scores]\n    fn = sum(y == 1 and p == 0 for y, p in zip(truth, predictions))\n    fp = sum(y == 0 and p == 1 for y, p in zip(truth, predictions))\n    tp = sum(y == 1 and p == 1 for y, p in zip(truth, predictions))\n    recall = tp / sum(truth)\n    results.append({\"threshold\": threshold, \"fn\": fn, \"fp\": fp,\n                    \"recall\": recall, \"cost\": cost_fn * fn + cost_fp * fp})\nbest = min(results, key=lambda r: (r[\"cost\"], -r[\"recall\"], r[\"threshold\"]))\nwith open(\"threshold_search.json\", \"w\") as stream:\n    json.dump({\"cost_fn\": cost_fn, \"cost_fp\": cost_fp, \"results\": results, \"selected\": best}, stream, indent=2)\nprint(\"Choix validation seulement\", best)",
      "explanation": [
        "La règle >= est identique lors du réglage et de l’inférence.",
        "Un coût 10/1 est une hypothèse de démonstration, pas une donnée industrielle mesurée.",
        "Si aucun seuil ne satisfait les exigences, conclure que le modèle est insuffisant plutôt que déplacer les exigences."
      ],
      "expected": "Un tableau de seuils et un choix validation sont sauvegardés ; le fichier ne contient aucune mesure test."
    },
    "exercise": {
      "brief": "Ajouter une contrainte de taux de fausses alertes et livrer une fiche de décision incluant le cas où aucune solution ne convient.",
      "constraints": [
        "Écrire les critères avant la sélection.",
        "Ne pas traiter le softmax comme probabilité calibrée.",
        "Préserver checkpoint, classes, preprocessing et seuil."
      ],
      "deliverables": [
        "decision.json",
        "Courte justification modèle/seuil",
        "Plan de collecte pour une nouvelle caméra"
      ],
      "acceptance": [
        "La règle choisie satisfait la contrainte déclarée ou est explicitement refusée.",
        "La décision cite support, coût supposé et limites.",
        "Le calcul FN/FP sur cinq scores proches du seuil reproduit exactement la règle de comparaison enregistrée."
      ]
    },
    "correction": {
      "steps": [
        "Reprendre les résultats mesurés du balayage.",
        "Filtrer par taux de faux positifs acceptable.",
        "Enregistrer un statut bloqué si la contrainte est impossible."
      ],
      "code": "import json, csv\nrows = list(csv.DictReader(open(\"validation_scores.csv\", encoding=\"utf-8\")))\nnegative_count = sum(int(r[\"truth\"]) == 0 for r in rows)\nassert negative_count > 0\nsearch = json.load(open(\"threshold_search.json\"))\nmax_fpr = 0.05  # Exemple de contrainte à valider avec le métier\neligible = [r for r in search[\"results\"] if r[\"fp\"] / negative_count <= max_fpr]\nif eligible:\n    selected = min(eligible, key=lambda r: (r[\"cost\"], -r[\"recall\"]))\n    decision = {\"status\": \"candidat_validation\", \"rule\": \"prob_defaut >= threshold\", \"selected\": selected}\nelse:\n    decision = {\"status\": \"bloque\", \"reason\": \"aucun seuil admissible\"}\ndecision.update(max_fpr=max_fpr, validation_size=len(rows), test_used=False,\n                next_action=\"Vérifier le rappel minimum métier avant gel final\")\nwith open(\"decision.json\", \"w\") as stream:\n    json.dump(decision, stream, indent=2)\nprint(decision)",
      "explanation": "Le filtre FPR seul peut retenir un modèle au rappel nul : la prochaine action demande explicitement de vérifier aussi le rappel minimum métier avant de le livrer.",
      "verification": [
        "python demo.py puis python correction.py",
        "Recalculer FN/FP manuellement sur cinq exemples proches du seuil.",
        "Vérifier que la nouvelle caméra est réservée à une validation dédiée ou à une évaluation future, sans fuite."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Un seuil donne zéro alerte",
        "cause": "Il dépasse tous les scores ou la classe positive est inversée.",
        "fix": "Contrôler l’ordre des classes et la distribution des scores ; inclure le rappel dans les critères."
      },
      {
        "symptom": "Le seuil change à chaque nouveau dossier",
        "cause": "Le réglage est effectué sur les entrées de production.",
        "fix": "Figer la décision et traiter le changement de domaine avec une nouvelle validation annotée."
      }
    ],
    "challenge": "Proposer une zone d’abstention envoyée à un opérateur et mesurer sa charge sur validation.",
    "review": [
      {
        "question": "Pourquoi ne pas optimiser le seuil sur le test ?",
        "expected": "Le test deviendrait un jeu de réglage et ne mesurerait plus une décision indépendante."
      },
      {
        "question": "Un coût minimal suffit-il à autoriser la production ?",
        "expected": "Non ; vérifier contraintes métier, support, domaine, calibration éventuelle et limites de collecte."
      }
    ],
    "reading": [
      {
        "title": "report",
        "url": "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html",
        "focus": "Relier rappel et précision au déplacement du seuil ; distinguer coût métier et moyenne F1."
      }
    ]
  },
  {
    "id": "w4d1",
    "objective": "Écrire une convention d’annotation de boîtes puis valider un export YOLO avant entraînement.",
    "prerequisites": [
      "Images de détection multi-objets autorisées et annotées ; ultralytics, Pillow ; groupes train/val/test figés.",
      "Créer dataset/images/train et dataset/labels/train ; fichier label homonyme à chaque image, même vide pour une image négative vérifiée."
    ],
    "concepts": [
      {
        "title": "Format YOLO",
        "explanation": "Chaque ligne est class_id cx cy width height, coordonnées normalisées par largeur/hauteur image. Les centres et tailles doivent définir une boîte entièrement incluse dans [0,1] ; une taille positive seule ne suffit pas."
      },
      {
        "title": "Convention et supervision",
        "explanation": "Définir classes, objets tronqués/occlus, boîte serrée et traitement des ambiguïtés avant annotation. Une image sans label vérifié n’est pas équivalente à une image négative ; les groupes empêchent des vues d’une même pièce de traverser les splits."
      }
    ],
    "demonstration": {
      "title": "Valider les bornes et dessiner l’export",
      "instruction": "Exemple à une classe pièce ; adapter le nombre de classes et contrôler tous les splits avant d’écrire data.yaml.",
      "code": "from pathlib import Path\nfrom PIL import Image, ImageDraw\nroot = Path(\"dataset\")\nclasses = [\"piece\"]\nimages = sorted((root / \"images/train\").glob(\"*.jpg\"))\nassert images, \"Préparer les images et labels annotés\"\nPath(\"annotation_review\").mkdir(exist_ok=True)\nfor path in images:\n    label = root / \"labels/train\" / (path.stem + \".txt\")\n    assert label.is_file(), f\"Annotation manquante : {path}\"\n    with Image.open(path) as source:\n        image = source.convert(\"RGB\")\n    w, h = image.size\n    draw = ImageDraw.Draw(image)\n    for line in label.read_text().splitlines():\n        values = [float(v) for v in line.split()]\n        assert len(values) == 5\n        cls, cx, cy, bw, bh = values\n        assert cls.is_integer() and 0 <= cls < len(classes)\n        assert 0 < bw <= 1 and 0 < bh <= 1\n        x1, y1, x2, y2 = cx-bw/2, cy-bh/2, cx+bw/2, cy+bh/2\n        assert 0 <= x1 < x2 <= 1 and 0 <= y1 < y2 <= 1\n        draw.rectangle((x1*w, y1*h, x2*w, y2*h), outline=\"red\", width=2)\n    image.save(Path(\"annotation_review\") / path.name)\nprint(\"Images vérifiées\", len(images))",
      "explanation": [
        "Une ligne en pixels au lieu de coordonnées normalisées est rejetée.",
        "Une boîte qui sort de l’image est un problème à revoir, pas à tronquer silencieusement.",
        "Le contrôle syntaxique n’atteste pas que la boîte entoure le bon objet ; la galerie est obligatoire."
      ],
      "expected": "Chaque image train possède son label et une superposition ; toute boîte invalide bloque le script."
    },
    "exercise": {
      "brief": "Annoter un échantillon couvrant occlusion, petits objets et images négatives, puis exporter data.yaml et les splits.",
      "constraints": [
        "Convention écrite et revue par une deuxième personne.",
        "Aucun groupe partagé entre splits.",
        "Toutes les images négatives sont relues."
      ],
      "deliverables": [
        "Convention de boîtes",
        "data.yaml",
        "Galerie et liste des annotations à arbitrer"
      ],
      "acceptance": [
        "Les boîtes respectent format, classe et bornes.",
        "La configuration pointe vers des dossiers existants.",
        "Chaque objet attendu est couvert selon la convention."
      ]
    },
    "correction": {
      "steps": [
        "Écrire une conversion xyxy pixels vers YOLO sur un cas connu.",
        "Tester l’aller-retour pour éviter la confusion centre/coin.",
        "Créer la configuration avec un chemin absolu vers la racine dataset."
      ],
      "code": "from pathlib import Path\nimport math\n\ndef to_yolo(box, width, height):\n    x1, y1, x2, y2 = box\n    assert 0 <= x1 < x2 <= width and 0 <= y1 < y2 <= height\n    return ((x1+x2)/(2*width), (y1+y2)/(2*height), (x2-x1)/width, (y2-y1)/height)\nbox = (20, 10, 80, 50)\ncx, cy, bw, bh = to_yolo(box, 100, 80)\nrestored = ((cx-bw/2)*100, (cy-bh/2)*80, (cx+bw/2)*100, (cy+bh/2)*80)\nassert all(math.isclose(a, b, abs_tol=1e-9) for a, b in zip(box, restored))\nroot = Path(\"dataset\").resolve()\nfor split in [\"train\", \"val\", \"test\"]:\n    assert (root / \"images\" / split).is_dir(), f\"Créer le split {split}\"\nconfig = f\"path: {root.as_posix()}\\ntrain: images/train\\nval: images/val\\ntest: images/test\\nnames:\\n  0: piece\\n\"\nPath(\"data.yaml\").write_text(config, encoding=\"utf-8\")\nprint(\"Boîte YOLO\", cx, cy, bw, bh)",
      "explanation": "La convention est une classe pièce ; pour des défauts NEU-DET, remplacer les classes par celles réellement annotées et ne pas mélanger pièce et défaut.",
      "verification": [
        "python demo.py puis python correction.py",
        "Introduire cx=1,width=0.2 dans une copie : le validateur doit refuser.",
        "Inspecter les superpositions train, val et test sans ajuster le modèle sur le test."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Boîtes décalées ou hors image",
        "cause": "Confusion xyxy/cxcywh ou division par mauvaise dimension.",
        "fix": "Reconstituer xyxy et tester l’aller-retour sur une boîte connue."
      },
      {
        "symptom": "Le modèle apprend des fonds comme négatifs",
        "cause": "Annotations manquantes traitées comme fichiers vides.",
        "fix": "Distinguer missing et négatif validé ; compléter les annotations."
      }
    ],
    "challenge": "Ajouter un contrôle des noms homonymes .jpg/.png et refuser deux images qui partageraient le même label stem.",
    "review": [
      {
        "question": "Pourquoi normaliser x par largeur et y par hauteur ?",
        "expected": "Chaque axe utilise sa propre dimension ; les inverser déforme les boîtes hors images carrées."
      },
      {
        "question": "Un fichier label vide signifie quoi ?",
        "expected": "Aucun objet cible uniquement si cette image a été explicitement vérifiée comme négative."
      }
    ],
    "reading": [
      {
        "title": "format",
        "url": "https://docs.ultralytics.com/datasets/detect/",
        "focus": "Lire Ultralytics YOLO format ; reconstituer une boîte sur une image non carrée."
      }
    ]
  },
  {
    "id": "w4d2",
    "objective": "Établir une baseline YOLO11 puis adapter le détecteur avec un dataset contrôlé et conserver les artefacts.",
    "prerequisites": [
      "ultralytics installé et version figée ; data.yaml et annotations w4d1 validés ; poids officiels yolo11n.pt accessibles.",
      "Préparer baseline_images/ : scènes de validation représentatives ; comprendre que les classes COCO ne sont pas les classes industrielles."
    ],
    "concepts": [
      {
        "title": "Baseline préentraînée",
        "explanation": "Un détecteur COCO peut illustrer des limites de domaine mais ne reconnaît pas automatiquement une nouvelle classe pièce ou rayure. Sa sortie avant adaptation sert à observer ce décalage, pas à annoncer une performance sur une classe absente."
      },
      {
        "title": "Adaptation supervisée",
        "explanation": "model.train(data=...) apprend les classes et boîtes du YAML ; le meilleur checkpoint est choisi selon validation. Garder versions, paramètres et hash du manifeste pour comparer les expériences sans toucher au test."
      }
    ],
    "demonstration": {
      "title": "Prédire avant adaptation puis entraîner",
      "instruction": "Exemple court de 10 époques pour valider le pipeline ; budget à fixer selon matériel et données, aucune qualité promise.",
      "code": "from pathlib import Path\nimport json, hashlib\nimport ultralytics\nfrom ultralytics import YOLO\nassert Path(\"data.yaml\").is_file()\nimages = sorted(Path(\"baseline_images\").glob(\"*.jpg\"))\nassert images, \"Préparer quelques images de validation\"\nmodel = YOLO(\"yolo11n.pt\")\nfor result in model.predict(source=[str(p) for p in images], conf=0.25, verbose=False):\n    print(Path(result.path).name, \"classes préentraînées\", [result.names[int(c)] for c in result.boxes.cls])\n    result.save(filename=\"baseline_\" + Path(result.path).name)\nmodel.train(data=\"data.yaml\", epochs=10, imgsz=640, batch=4,\n            device=\"cpu\", seed=41, project=\"runs_stage\", name=\"pieces_v1\", exist_ok=False)\nbest = Path(model.trainer.best)\nassert best.is_file()\nadapted = YOLO(str(best))\nmetrics = adapted.val(data=\"data.yaml\", split=\"val\", device=\"cpu\")\nrecord = {\"ultralytics\": ultralytics.__version__, \"weights_initial\": \"yolo11n.pt\",\n          \"best\": str(best), \"yaml_sha256\": hashlib.sha256(Path(\"data.yaml\").read_bytes()).hexdigest(),\n          \"validation\": metrics.results_dict}\nPath(\"run_record.json\").write_text(json.dumps(record, indent=2), encoding=\"utf-8\")\nprint(\"checkpoint\", best)",
      "explanation": [
        "CPU est explicite pour une exécution sans hypothèse GPU ; utiliser device=0 seulement si le GPU est disponible et documenté.",
        "best est récupéré depuis le trainer afin d’éviter de charger par erreur le dernier run d’un autre essai.",
        "Le hash YAML ne remplace pas le hash des images/labels ; ajouter le manifeste versionné pour identifier les données."
      ],
      "expected": "Des prédictions avant adaptation, un best.pt et run_record.json sont créés ; les métriques validation proviennent de l’exécution."
    },
    "exercise": {
      "brief": "Relancer avec les mêmes données et une configuration nommée ; comparer les erreurs de classes et les objets manqués avant/après.",
      "constraints": [
        "Conserver yolo11n.pt comme initialisation identifiée.",
        "Ne pas considérer COCO comme une annotation des classes métier.",
        "Ne pas modifier le test ou utiliser split=test pendant le réglage."
      ],
      "deliverables": [
        "Poids best.pt",
        "Configuration/version/manifeste",
        "Galerie validation avant/après avec limites"
      ],
      "acceptance": [
        "Le modèle adapté annonce exactement les classes du YAML.",
        "Le checkpoint se recharge dans un nouveau processus.",
        "Les prédictions sont liées à leurs images sources."
      ]
    },
    "correction": {
      "steps": [
        "Lire le chemin du meilleur checkpoint depuis le run record.",
        "Charger le détecteur dans un nouveau script.",
        "Vérifier les classes et exporter les boîtes sur une image validation."
      ],
      "code": "import json\nfrom pathlib import Path\nfrom ultralytics import YOLO\nrecord = json.loads(Path(\"run_record.json\").read_text())\nmodel = YOLO(record[\"best\"])\nassert list(model.names.values()) == [\"piece\"], \"Adapter cette vérification aux classes réelles\"\nimage = next(Path(\"baseline_images\").glob(\"*.jpg\"))\nresult = model.predict(str(image), conf=0.25, device=\"cpu\", verbose=False)[0]\nrows = []\nfor box in result.boxes:\n    rows.append({\"class\": int(box.cls.item()), \"confidence\": float(box.conf.item()),\n                 \"xyxy\": box.xyxy[0].cpu().tolist()})\nPath(\"prediction.json\").write_text(json.dumps({\"image\": str(image), \"detections\": rows}, indent=2))\nresult.save(filename=\"adapted_review.jpg\")\nassert all(len(r[\"xyxy\"]) == 4 for r in rows)\nprint(\"Détections\", len(rows))",
      "explanation": "La vérification une classe est volontairement stricte ; remplacer la liste par le mapping réellement validé en w4d1.",
      "verification": [
        "python demo.py puis python correction.py",
        "Vérifier le mapping de classes dans best.pt et data.yaml.",
        "Ouvrir adapted_review.jpg et rapprocher ses boîtes de prediction.json."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les classes affichées restent celles de COCO",
        "cause": "Le script recharge yolo11n.pt au lieu du checkpoint adapté.",
        "fix": "Charger record[\"best\"] et contrôler model.names."
      },
      {
        "symptom": "Mémoire insuffisante",
        "cause": "Batch/résolution trop grands pour le matériel.",
        "fix": "Réduire batch, documenter la modification et conserver les mêmes images validation."
      }
    ],
    "challenge": "Évaluer séparément les petites pièces et noter si la résolution d’entrée les rend presque invisibles.",
    "review": [
      {
        "question": "Pourquoi ne pas seulement utiliser le modèle COCO ?",
        "expected": "Les classes métier et l’apparence industrielle peuvent être absentes de son apprentissage."
      },
      {
        "question": "Quel fichier doit utiliser le script livré ?",
        "expected": "Le checkpoint adapté sélectionné en validation, avec configuration et mapping associés."
      }
    ],
    "reading": [
      {
        "title": "detect",
        "url": "https://docs.ultralytics.com/tasks/detect/",
        "focus": "Identifier Train, Val, Predict et les artefacts best.pt/args.yaml nécessaires à la reproduction."
      }
    ]
  },
  {
    "id": "w4d3",
    "objective": "Relier IoU, appariement des objets et métriques agrégées sans confondre défaut de localisation et objet manqué.",
    "prerequisites": [
      "best.pt adapté et data.yaml ; numpy, ultralytics ; connaître les coordonnées xyxy et les classes."
    ],
    "concepts": [
      {
        "title": "IoU et appariement",
        "explanation": "IoU est aire d’intersection divisée par aire d’union. Une prédiction de bonne classe doit correspondre à une vérité terrain disponible au seuil demandé ; deux prédictions sur le même objet ne donnent pas deux vrais positifs."
      },
      {
        "title": "AP et mAP",
        "explanation": "AP résume une courbe précision/rappel en faisant varier la confiance ; mAP50 utilise IoU=0.50, mAP50-95 moyenne plusieurs seuils de localisation. Un simple comptage à une confiance fixe ne calcule pas l’AP ; regarder classe et taille avec leurs supports."
      }
    ],
    "demonstration": {
      "title": "Contrôler IoU sur une fixture puis lire les vraies métriques",
      "instruction": "La fixture teste la géométrie seulement ; la validation Ultralytics calcule les métriques sur les données annotées.",
      "code": "import numpy as np\nfrom ultralytics import YOLO\n\ndef iou(a, b):\n    a, b = np.asarray(a, float), np.asarray(b, float)\n    intersection_wh = np.maximum(0, np.minimum(a[2:], b[2:]) - np.maximum(a[:2], b[:2]))\n    intersection = float(np.prod(intersection_wh))\n    area_a = float(np.prod(np.maximum(0, a[2:] - a[:2])))\n    area_b = float(np.prod(np.maximum(0, b[2:] - b[:2])))\n    union = area_a + area_b - intersection\n    return intersection / union if union > 0 else 0.0\ntruth = [10, 10, 50, 50]\nassert iou(truth, truth) == 1.0\nassert iou(truth, [60, 60, 80, 80]) == 0.0\nprint(\"boîte décalée\", iou(truth, [20, 10, 60, 50]))\nmodel = YOLO(\"runs_stage/pieces_v1/weights/best.pt\")\nmetrics = model.val(data=\"data.yaml\", split=\"val\", device=\"cpu\", plots=True)\nprint(\"mAP50\", metrics.box.map50, \"mAP50-95\", metrics.box.map)\nfor class_index, ap in enumerate(metrics.box.maps):\n    print(model.names[class_index], \"AP50-95\", float(ap))\nprint(\"Détails et figures\", metrics.save_dir)",
      "explanation": [
        "Une boîte décalée de dix pixels perd de l’IoU même si la classe est juste.",
        "box.maps suit l’ordre des classes ; vérifier le support dans les sorties détaillées avant d’interpréter une classe absente.",
        "Une mAP50 élevée et mAP50-95 faible suggère une localisation approximative à confirmer visuellement."
      ],
      "expected": "Les assertions géométriques passent ; les mAP et figures sont calculées sur validation et non inventées."
    },
    "exercise": {
      "brief": "Classer les erreurs d’un échantillon en manqué, classe incorrecte, doublon et localisation insuffisante ; compter petits/grands objets selon une règle écrite.",
      "constraints": [
        "Définir les tailles avec la résolution de référence.",
        "Ne pas appeler AP une précision à seuil fixe.",
        "Appariement un-à-un par classe, ordonné par confiance."
      ],
      "deliverables": [
        "Table des erreurs avec IoU",
        "Rapport global et par classe/support",
        "Sous-groupes de taille et règle de définition"
      ],
      "acceptance": [
        "Un doublon d’une vérité déjà appariée est FP.",
        "Un objet non apparié est FN.",
        "La règle pédagogique et les métriques officielles sont distinguées."
      ]
    },
    "correction": {
      "steps": [
        "Tester l’appariement sur deux prédictions du même objet.",
        "Trier par confiance puis consommer chaque vérité terrain au plus une fois.",
        "Vérifier TP/FP/FN sans prétendre reconstruire toute l’AP officielle."
      ],
      "code": "# Fixture autonome à une classe, boîtes xyxy en pixels.\ndef iou(a, b):\n    w = max(0, min(a[2], b[2]) - max(a[0], b[0]))\n    h = max(0, min(a[3], b[3]) - max(a[1], b[1]))\n    inter = w * h\n    union = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - inter\n    return inter / union if union else 0\nground_truth = [[0, 0, 20, 20], [50, 50, 70, 70]]\npredictions = [(0.9, [0, 0, 20, 20]), (0.8, [1, 1, 21, 21])]\nused, tp, fp = set(), 0, 0\nfor confidence, box in sorted(predictions, reverse=True):\n    available = [(iou(box, gt), i) for i, gt in enumerate(ground_truth) if i not in used]\n    score, index = max(available, default=(0, -1))\n    if score >= 0.5:\n        used.add(index)\n        tp += 1\n    else:\n        fp += 1\nfn = len(ground_truth) - len(used)\nassert (tp, fp, fn) == (1, 1, 1)\nprint(\"Fixture géométrique TP FP FN\", tp, fp, fn)",
      "explanation": "Ce matching simplifié ne gère qu’une classe et un seuil IoU ; Ultralytics reste la référence du rapport complet mAP multi-classes/multi-seuils.",
      "verification": [
        "python demo.py puis python correction.py",
        "Contrôler le cas de doublon à la main : TP=1, FP=1, FN=1.",
        "Vérifier que chaque score par taille indique le nombre d’objets annotés."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Deux boîtes correctes donnent deux TP sur un objet",
        "cause": "Appariement sans consommation de la vérité terrain.",
        "fix": "Maintenir un ensemble des GT déjà utilisées par classe."
      },
      {
        "symptom": "mAP50 bonne mais boîtes imprécises",
        "cause": "Le seuil 0.50 tolère des écarts rejetés aux seuils élevés.",
        "fix": "Inspecter les erreurs de contours et comparer mAP50-95 et convention d’annotation."
      }
    ],
    "challenge": "Comparer l’IoU du même décalage de trois pixels sur une petite et une grande boîte, puis expliquer le biais de taille.",
    "review": [
      {
        "question": "Une détection de mauvaise classe peut-elle être TP grâce à son IoU ?",
        "expected": "Non ; le matching exige aussi la classe correcte."
      },
      {
        "question": "Pourquoi mAP50 et mAP50-95 diffèrent-elles ?",
        "expected": "La seconde demande une localisation correcte à plusieurs seuils, dont des seuils beaucoup plus stricts."
      }
    ],
    "reading": [
      {
        "title": "detect",
        "url": "https://docs.ultralytics.com/tasks/detect/",
        "focus": "Lire les métriques de Val ; relier box.map et box.map50 aux seuils d’IoU."
      }
    ]
  },
  {
    "id": "w4d4",
    "objective": "Choisir confiance et suppression de doublons sur validation en séparant leur effet sur les erreurs.",
    "prerequisites": [
      "Checkpoint YOLO adapté et data.yaml ; images validation annotées ; ultralytics.",
      "Définir le coût des objets manqués et fausses alertes ; ne pas utiliser le test pour choisir les seuils."
    ],
    "concepts": [
      {
        "title": "Confiance et NMS",
        "explanation": "Le seuil confidence retire les prédictions peu confiantes. La NMS supprime des boîtes concurrentes dont l’IoU dépasse son seuil ; augmenter le seuil NMS supprime moins et peut conserver davantage de doublons."
      },
      {
        "title": "Deux IoU différents",
        "explanation": "L’IoU de NMS compare des prédictions entre elles ; l’IoU d’évaluation compare une prédiction à une annotation. Régler NMS à 0.5 ne définit pas le seuil de mAP ; les objets proches peuvent être supprimés à tort."
      }
    ],
    "demonstration": {
      "title": "Balayer quelques configurations de prédiction",
      "instruction": "Évaluer sur validation ; les métriques de qualité à la confiance de déploiement exigent un appariement à ce seuil, pas seulement une mAP agrégée.",
      "code": "from pathlib import Path\nimport json\nfrom ultralytics import YOLO\nmodel = YOLO(\"runs_stage/pieces_v1/weights/best.pt\")\nimages = sorted(Path(\"dataset/images/val\").glob(\"*.jpg\"))\nassert images\nrecords = []\nfor conf, nms_iou in [(0.15, 0.7), (0.4, 0.7), (0.15, 0.4)]:\n    folder = Path(f\"sweep/conf_{conf}_nms_{nms_iou}\")\n    folder.mkdir(parents=True, exist_ok=True)\n    boxes_by_image = []\n    for result in model.predict([str(p) for p in images], conf=conf, iou=nms_iou,\n                                device=\"cpu\", stream=True, verbose=False):\n        result.save(filename=str(folder / Path(result.path).name))\n        boxes_by_image.append({\"image\": result.path, \"xyxy\": result.boxes.xyxy.cpu().tolist(),\n                               \"classes\": result.boxes.cls.cpu().tolist(),\n                               \"scores\": result.boxes.conf.cpu().tolist()})\n    record = {\"conf\": conf, \"nms_iou\": nms_iou, \"predictions\": boxes_by_image}\n    (folder / \"predictions.json\").write_text(json.dumps(record, indent=2))\n    records.append({\"conf\": conf, \"nms_iou\": nms_iou,\n                    \"detections\": sum(len(r[\"scores\"]) for r in boxes_by_image)})\nPath(\"sweep_summary.json\").write_text(json.dumps(records, indent=2))\nprint(records)",
      "explanation": [
        "Le premier et le second essai isolent confiance ; le premier et le troisième isolent NMS.",
        "Le nombre de détections seul ne mesure pas le rappel : il faut les annotations et le matching w4d3 étendu aux classes.",
        "Une NMS trop agressive peut supprimer deux objets réels proches ; inspecter les scènes denses."
      ],
      "expected": "Trois galeries et exports sont produits ; aucune configuration n’est déclarée meilleure sans comptage FP/FN sur annotations."
    },
    "exercise": {
      "brief": "Créer un tableau TP/FP/FN par configuration et choisir le compromis selon un coût fixé à l’avance.",
      "constraints": [
        "Même liste d’images pour les essais.",
        "Matching un-à-un par classe à IoU d’évaluation annoncé.",
        "Conserver un groupe de scènes denses dans la revue."
      ],
      "deliverables": [
        "Table seuils/TP/FP/FN",
        "Galerie manqués/doublons/mauvaises classes",
        "Configuration choisie avec justification"
      ],
      "acceptance": [
        "Les changements de confiance et NMS sont analysés séparément.",
        "Un objet réel supprimé par NMS est identifié si présent.",
        "Le choix repose sur FP/FN, pas seulement nombre de boîtes."
      ]
    },
    "correction": {
      "steps": [
        "Contrôler la direction de la NMS sur une fixture de deux boîtes proches.",
        "Vérifier que seuil haut conserve plus de boîtes concurrentes.",
        "Appliquer ensuite cette interprétation aux exports réels, avec matching annoté."
      ],
      "code": "# NMS pédagogique à une classe, sans dépendance externe.\ndef iou(a, b):\n    inter = max(0, min(a[2], b[2])-max(a[0], b[0])) * max(0, min(a[3], b[3])-max(a[1], b[1]))\n    union = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - inter\n    return inter / union\nboxes = [(0.9, [0, 0, 20, 20]), (0.8, [2, 0, 22, 20])]\ndef nms(threshold):\n    pending = sorted(boxes, reverse=True)\n    kept = []\n    while pending:\n        best = pending.pop(0)\n        kept.append(best)\n        pending = [candidate for candidate in pending if iou(best[1], candidate[1]) <= threshold]\n    return kept\nlow, high = nms(0.4), nms(0.9)\nassert len(low) == 1 and len(high) == 2\nprint(\"IoU mutuelle\", iou(boxes[0][1], boxes[1][1]))\nprint(\"boîtes retenues seuil NMS bas/haut\", len(low), len(high))",
      "explanation": "La fixture ne dit pas si les deux boîtes correspondent à un ou deux objets : seule l’annotation permet de décider si la suppression est correcte.",
      "verification": [
        "python demo.py puis python correction.py",
        "Vérifier les mêmes chemins et supports dans les trois exports.",
        "Recalculer les erreurs sur les annotations avant de figer conf et iou."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Augmenter iou augmente les doublons",
        "cause": "Le seuil NMS haut rend la suppression moins agressive.",
        "fix": "Diminuer prudemment iou et inspecter les objets voisins réellement distincts."
      },
      {
        "symptom": "Moins de boîtes interprété comme meilleure précision",
        "cause": "Des vrais objets peuvent avoir disparu.",
        "fix": "Apparier aux annotations et comparer TP/FP/FN au même seuil d’évaluation."
      }
    ],
    "challenge": "Comparer les compromis sur images peu denses et très denses sans adopter deux seuils conditionnels avant validation dédiée.",
    "review": [
      {
        "question": "L’IoU NMS est-il l’IoU de mAP50 ?",
        "expected": "Non : NMS compare prédictions entre elles ; mAP50 compare prédictions et vérités terrain à 0.50."
      },
      {
        "question": "Pourquoi la confiance élevée réduit-elle souvent le rappel ?",
        "expected": "Elle rejette aussi de vrais objets dont le score est faible."
      }
    ],
    "reading": [
      {
        "title": "detect",
        "url": "https://docs.ultralytics.com/tasks/detect/",
        "focus": "Lire les arguments Predict conf et iou puis expliquer leur effet séparément."
      }
    ]
  },
  {
    "id": "w4d5",
    "objective": "Livrer une commande image/dossier qui exporte annotations et comptages traçables avec une configuration gelée.",
    "prerequisites": [
      "ultralytics et OpenCV ; best.pt sélectionné, mapping de classes et seuils w4d4 figés ; préparer une copie d’images nouvelles.",
      "Pour des métriques de qualité, les nouvelles scènes doivent être annotées ; un simple comptage visuel n’est pas une évaluation complète."
    ],
    "concepts": [
      {
        "title": "Contrat de livraison",
        "explanation": "Chaque entrée doit produire un statut, des boîtes xyxy, scores, classes et comptages, même avec zéro détection. Séparer un fichier illisible d’une image valide sans objet ; conserver le nom source pour audit."
      },
      {
        "title": "Évaluation et collecte",
        "explanation": "Exécuter sur nouvelles scènes avec la configuration gelée ; ne pas retoucher les seuils sur ce test. Documenter objets petits, occlus ou confondus et proposer des données ciblées à collecter pour une prochaine version."
      }
    ],
    "demonstration": {
      "title": "Créer une CLI d’inférence et un export JSON",
      "instruction": "Enregistrer en predict.py ; exemple : python predict.py --input nouvelles_images --weights runs_stage/pieces_v1/weights/best.pt --output livraison. Copier les seuils réellement retenus à la place des valeurs pédagogiques par défaut.",
      "code": "import argparse, json\nfrom pathlib import Path\nfrom collections import Counter\nimport cv2\nfrom ultralytics import YOLO\nparser = argparse.ArgumentParser()\nparser.add_argument(\"--input\", type=Path, required=True)\nparser.add_argument(\"--weights\", type=Path, required=True)\nparser.add_argument(\"--output\", type=Path, required=True)\nparser.add_argument(\"--conf\", type=float, default=0.25)\nparser.add_argument(\"--iou\", type=float, default=0.7)\nargs = parser.parse_args()\nassert args.input.exists() and args.weights.is_file()\nassert 0 <= args.conf <= 1 and 0 <= args.iou <= 1\nassert args.output.resolve() != args.input.resolve(), \"Sorties séparées des entrées\"\npaths = [args.input] if args.input.is_file() else sorted(p for p in args.input.iterdir() if p.is_file())\nargs.output.mkdir(parents=True, exist_ok=True)\nmodel = YOLO(str(args.weights))\nrecords = []\nfor path in paths:\n    image = cv2.imread(str(path))\n    if image is None:\n        records.append({\"source\": str(path), \"status\": \"illisible\"})\n        continue\n    result = model.predict(image, conf=args.conf, iou=args.iou, device=\"cpu\", verbose=False)[0]\n    boxes = [{\"class\": int(b.cls.item()), \"score\": float(b.conf.item()), \"xyxy\": b.xyxy[0].cpu().tolist()} for b in result.boxes]\n    counts = Counter(model.names[b[\"class\"]] for b in boxes)\n    records.append({\"source\": str(path), \"status\": \"ok\", \"boxes\": boxes, \"counts\": dict(counts)})\n    result.save(filename=str(args.output / (path.name + \".jpg\")))\n(args.output / \"results.json\").write_text(json.dumps({\"weights\": str(args.weights), \"names\": model.names,\n    \"conf\": args.conf, \"nms_iou\": args.iou, \"images\": records}, indent=2), encoding=\"utf-8\")",
      "explanation": [
        "Une liste de boîtes vide reste status=ok ; elle ne devient pas un fichier invalide.",
        "Les noms de sortie ajoutent .jpg au nom complet pour éviter collision entre a.jpg et a.png.",
        "La CLI traite un dossier plat ; annoncer cette limite dans README plutôt que laisser croire à un parcours récursif."
      ],
      "expected": "Un results.json associe chaque entrée à un statut ; les images valides ont une visualisation et les comptages calculés depuis leurs boîtes."
    },
    "exercise": {
      "brief": "Faire exécuter la livraison par un collègue sur une image, un dossier avec fichier cassé et une image sans objet cible.",
      "constraints": [
        "Configuration gelée pour les nouvelles scènes.",
        "Sorties dans un dossier séparé.",
        "Aucun score de qualité sans annotations correspondantes."
      ],
      "deliverables": [
        "predict.py et README",
        "results.json et images annotées",
        "Rapport de limites et plan de collecte"
      ],
      "acceptance": [
        "Le nombre d’entrées JSON égale le nombre de fichiers fournis.",
        "La somme des comptages égale le nombre de boîtes par image valide.",
        "L’image sans objet garde status=ok et counts vide si aucune détection."
      ]
    },
    "correction": {
      "steps": [
        "Exécuter la CLI avec les paramètres retenus puis charger le JSON.",
        "Contrôler cohérence des comptages, classes et bornes des scores.",
        "Vérifier les fichiers invalides et documenter les échecs observés avec chemins."
      ],
      "code": "from pathlib import Path\nimport json\nreport = json.loads(Path(\"livraison/results.json\").read_text(encoding=\"utf-8\"))\nimages = report[\"images\"]\nassert images and len({r[\"source\"] for r in images}) == len(images)\nvalid = 0\nfor row in images:\n    assert row[\"status\"] in {\"ok\", \"illisible\"}\n    if row[\"status\"] != \"ok\":\n        continue\n    valid += 1\n    assert sum(row[\"counts\"].values()) == len(row[\"boxes\"])\n    for box in row[\"boxes\"]:\n        assert 0 <= box[\"score\"] <= 1\n        x1, y1, x2, y2 = box[\"xyxy\"]\n        assert x1 <= x2 and y1 <= y2\n        assert str(box[\"class\"]) in report[\"names\"]\n    assert (Path(\"livraison\") / (Path(row[\"source\"]).name + \".jpg\")).is_file()\nprint(\"Images valides\", valid, \"invalides\", len(images) - valid)",
      "explanation": "JSON convertit les clés numériques du mapping names en chaînes, d’où str(class). Le contrôle ne remplace pas une revue sémantique des boîtes ni une évaluation annotée.",
      "verification": [
        "python predict.py --input nouvelles_images --weights runs_stage/pieces_v1/weights/best.pt --output livraison --conf 0.25 --iou 0.7 ; remplacer les seuils par ceux retenus",
        "python correction.py",
        "Rejouer la commande image seule et vérifier la même prédiction, mêmes paramètres et poids."
      ]
    },
    "troubleshooting": [
      {
        "symptom": "Les images sans objet manquent dans le rapport",
        "cause": "Seules les détections ont été exportées.",
        "fix": "Créer un enregistrement par image valide même si boxes est vide."
      },
      {
        "symptom": "Le comptage est faux malgré de bonnes classes",
        "cause": "Doublons ou objets proches supprimés par NMS.",
        "fix": "Revoir les galeries et le protocole validation ; garder le test figé et planifier une version suivante."
      }
    ],
    "challenge": "Ajouter une sortie CSV une ligne par image avec toutes les classes, y compris les zéros, puis tester une reprise sans écraser les résultats précédents.",
    "review": [
      {
        "question": "Comment distinguer aucun objet et lecture impossible ?",
        "expected": "Statut ok avec liste vide pour le premier ; statut illisible sans prédiction pour le second."
      },
      {
        "question": "Que faire si les nouvelles scènes échouent ?",
        "expected": "Rapporter les échecs sans régler sur ce test ; constituer une nouvelle collecte et un protocole validation pour la version suivante."
      }
    ],
    "reading": [
      {
        "title": "detect",
        "url": "https://docs.ultralytics.com/tasks/detect/",
        "focus": "Relire Predict et retrouver boxes.xyxy, boxes.conf, boxes.cls et save pour l’export livré."
      }
    ]
  }
];
