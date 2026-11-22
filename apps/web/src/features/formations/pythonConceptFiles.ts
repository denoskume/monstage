import type {DeepConceptArticle} from './deepConceptTypes';
export const pythonConceptFiles:DeepConceptArticle[] = [
  {
    "slug": "python-csv",
    "pointIndex": 4,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "CSV Files in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un fichier CSV conserve des lignes et des colonnes de données sous forme de texte délimité. Les entreprises l'utilisent pour exporter des ventes, des mesures industrielles ou des événements depuis des logiciels métiers.",
        "Ce guide va au-delà de l'import : tu vas comprendre le format, les en-têtes, le délimiteur, l'encodage, la lecture ligne par ligne, la conversion des types, l'écriture et les contrôles de qualité."
      ],
      "tldr": [
        "CSV signifie Comma-Separated Values. Chaque ligne représente généralement un enregistrement et chaque colonne possède un nom défini par l'en-tête.",
        "Le module standard csv lit et écrit le format ; Pandas fournit ensuite une interface plus pratique pour l'analyse de tableaux volumineux.",
        "Un CSV contient d'abord du texte : vérifier et convertir les nombres, dates et valeurs manquantes est indispensable avant toute statistique."
      ],
      "sections": [
        {
          "id": "format",
          "title": "What Is a CSV File?",
          "paragraphs": [
            "Un CSV comporte généralement une première ligne contenant les noms de colonnes, suivie de lignes de valeurs. Le séparateur peut être une virgule, un point-virgule ou un autre caractère selon la source.",
            "Un fichier mal délimité peut produire une seule colonne au lieu de plusieurs sans que le contenu visuel semble complètement anormal. Vérifie toujours le nombre de colonnes attendu."
          ],
          "code": "from io import StringIO\ntexte = \"machine,minutes\\nM1,10\\nM2,15\"\nprint(texte.splitlines())",
          "language": "python",
          "output": "['machine,minutes', 'M1,10', 'M2,15']",
          "interpretation": "Le texte contient une ligne d'en-tête et deux enregistrements. Il faut ensuite utiliser un lecteur CSV plutôt qu'un split naïf pour gérer les guillemets."
        },
        {
          "id": "reader",
          "title": "Reading with csv.DictReader",
          "paragraphs": [
            "DictReader utilise la ligne d'en-tête pour créer des dictionnaires : chaque champ peut être lu par son nom. C'est plus robuste que d'utiliser des indices magiques comme ligne[3] lorsque les colonnes peuvent changer.",
            "Par défaut, les valeurs lues sont des chaînes. Il faut contrôler les colonnes obligatoires et les convertir avant de calculer les totaux."
          ],
          "code": "import csv\nfrom io import StringIO\nsource = StringIO(\"machine,minutes\\nM1,10\\nM2,15\")\nreader = csv.DictReader(source)\nfor ligne in reader:\n    print(ligne[\"machine\"], int(ligne[\"minutes\"]))",
          "language": "python",
          "output": "M1 10\nM2 15",
          "interpretation": "Chaque dictionnaire contient une clé machine et une clé minutes. int transforme la durée texte en nombre."
        },
        {
          "id": "quotes",
          "title": "Delimiters, Quoted Fields and Encoding",
          "paragraphs": [
            "Un champ texte peut contenir une virgule : le format CSV le protège alors avec des guillemets. C'est pourquoi un simple split(',') est incorrect pour un CSV général.",
            "Dans les fichiers français, le délimiteur est parfois le point-virgule. Pour lire un fichier local, précise encoding='utf-8' ou l'encodage fourni par la source, ainsi que newline=''."
          ],
          "code": "import csv\nfrom io import StringIO\nsource = StringIO('site;commentaire\\nNantes;\"Panne, arrêt court\"')\nlignes = list(csv.DictReader(source, delimiter=\";\"))\nprint(lignes[0][\"commentaire\"])",
          "language": "python",
          "output": "Panne, arrêt court",
          "interpretation": "La virgule dans le commentaire fait partie d'un champ. Le lecteur CSV respecte le délimiteur point-virgule et les guillemets."
        },
        {
          "id": "conversion",
          "title": "Validating Data Types and Missing Values",
          "paragraphs": [
            "Un fichier peut contenir des cellules vides, du texte à la place d'un nombre ou une unité incohérente. Ces cas doivent être classés et signalés avant l'agrégation.",
            "Utilise try/except pour séparer les observations correctement converties des données invalides, puis compte les rejets. N'écrase jamais silencieusement la valeur originale."
          ],
          "code": "lignes = [{\"minutes\":\"10\"},{\"minutes\":\"\"},{\"minutes\":\"25\"}]\nvalides, rejet = [], 0\nfor ligne in lignes:\n    try:\n        valides.append(float(ligne[\"minutes\"]))\n    except ValueError:\n        rejet += 1\nprint(valides, rejet)",
          "language": "python",
          "output": "[10.0, 25.0] 1",
          "interpretation": "Deux durées sont valides et une ligne manque de valeur numérique. Le taux de couverture est 2/3."
        },
        {
          "id": "writing",
          "title": "Writing a CSV with DictWriter",
          "paragraphs": [
            "DictWriter écrit un fichier CSV à partir de dictionnaires avec une liste explicite de colonnes. Cette méthode convient à la production d'un rapport reproductible et à la transmission à d'autres outils.",
            "Lors d'une écriture sur disque, ouvre le fichier avec newline='' et encoding='utf-8'. Conserve la source brute dans un autre fichier pour permettre une comparaison en cas d'erreur."
          ],
          "code": "import csv\nfrom io import StringIO\nsortie = StringIO(newline=\"\")\nchamps = [\"machine\", \"minutes\"]\nwriter = csv.DictWriter(sortie, fieldnames=champs)\nwriter.writeheader()\nwriter.writerow({\"machine\":\"M1\",\"minutes\":35})\nprint(sortie.getvalue().strip())",
          "language": "python",
          "output": "machine,minutes\nM1,35",
          "interpretation": "La première ligne contient l'en-tête et la seconde les valeurs. Un export sur disque utiliserait open('rapport.csv','w',newline='',encoding='utf-8')."
        },
        {
          "id": "pandas",
          "title": "When to Use pandas.read_csv",
          "paragraphs": [
            "Pandas lit un CSV dans un DataFrame, ce qui facilite les contrôles, les filtres et les agrégations. Mais l'import doit rester auditable : vérifie le séparateur, les types, les valeurs manquantes et les dimensions.",
            "Un DataFrame ne transforme pas automatiquement les données incorrectes en données fiables. Les règles métiers doivent être explicites."
          ],
          "code": "import pandas as pd\nfrom io import StringIO\nsource = StringIO(\"machine,minutes\\nM1,10\\nM1,25\\nM2,15\")\ndf = pd.read_csv(source)\nprint(df.groupby(\"machine\")[\"minutes\"].sum())",
          "language": "python",
          "output": "machine\nM1    35\nM2    15\nName: minutes, dtype: int64",
          "interpretation": "Le groupby calcule une somme par machine, ce qui correspond à une première réponse de maintenance."
        },
        {
          "id": "mini-project",
          "title": "Mini-project: A Reproducible CSV Report",
          "paragraphs": [
            "Un rapport CSV professionnel contient la source, une étape de validation, le nombre de lignes utilisées et les résultats agrégés. Mets en place un contrôle avant toute publication.",
            "Dans cet exercice, le jeu de données est volontairement court. Ajoute ensuite des lignes manquantes, des doublons et des valeurs non numériques pour tester la robustesse du traitement."
          ],
          "code": "import pandas as pd\nfrom io import StringIO\nsource = StringIO(\"machine,minutes\\nM1,10\\nM2,15\\nM1,25\")\ndf = pd.read_csv(source)\nassert df[\"minutes\"].notna().all()\nrapport = df.groupby(\"machine\",as_index=False)[\"minutes\"].sum()\nprint(rapport.to_string(index=False))",
          "language": "python",
          "output": "machine  minutes\n     M1       35\n     M2       15",
          "interpretation": "Le contrôle vérifie qu'aucune durée n'est manquante ; le rapport contient les totaux par machine."
        }
      ],
      "mistakes": [
        "Utiliser split(',') sans respecter les champs entre guillemets.",
        "Oublier que les valeurs CSV sont initialement des textes dans le module csv.",
        "Ne pas contrôler l'encodage et le séparateur réel du fichier.",
        "Remplacer les cellules absentes par zéro sans justification.",
        "Écraser le fichier source lors de la création d'un rapport nettoyé."
      ],
      "conclusion": [
        "Tu sais maintenant lire, vérifier, interpréter et écrire des fichiers CSV, soit avec le module standard, soit avec Pandas. Le format n'est qu'un conteneur : la qualité de l'analyse dépend du sens des colonnes et de leur validation.",
        "Passe ensuite au JSON pour manipuler des objets imbriqués, souvent utilisés par les API et les applications."
      ],
      "faq": [
        {
          "question": "What is a CSV file?",
          "answer": "Un fichier texte tabulaire où chaque enregistrement apparaît sur une ligne et les champs sont séparés par un délimiteur."
        },
        {
          "question": "Why use DictReader instead of split?",
          "answer": "DictReader gère les en-têtes et les champs avec guillemets, y compris les séparateurs à l'intérieur d'un champ."
        },
        {
          "question": "Why are CSV numbers sometimes strings?",
          "answer": "Le format stocke du texte ; il faut identifier et convertir le type selon les règles attendues."
        },
        {
          "question": "When do I use pandas.read_csv?",
          "answer": "Pour charger le fichier sous forme de DataFrame et effectuer des contrôles et agrégations."
        },
        {
          "question": "What should I validate after importing a CSV?",
          "answer": "Dimensions, noms de colonnes, grain, types, valeurs absentes, doublons et unités."
        }
      ]
    }
  },
  {
    "slug": "python-json",
    "pointIndex": 4,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "JSON Files in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "JSON est un format de données textuel très courant dans les API, les applications web et les échanges entre logiciels. Contrairement à un simple CSV, il peut représenter des objets et listes imbriqués.",
        "Tu vas apprendre la structure JSON, la différence entre JSON et dictionnaire Python, les conversions avec json.loads et json.dumps, la lecture de fichiers et les contrôles de schéma."
      ],
      "tldr": [
        "JSON signifie JavaScript Object Notation. Les structures de base sont objets, tableaux, chaînes, nombres, booléens et null.",
        "json.loads lit un texte JSON vers des objets Python ; json.dumps transforme des objets Python vers du texte JSON.",
        "Une API peut changer sa structure : vérifie les champs attendus et les types avant d'utiliser les données dans un tableau d'analyse."
      ],
      "sections": [
        {
          "id": "format",
          "title": "Understanding Objects, Arrays and Primitive Values",
          "paragraphs": [
            "En JSON, un objet est constitué de clés texte entourées de guillemets doubles et de valeurs. Un tableau est une liste ordonnée. Les booléens s'écrivent true ou false et l'absence de valeur s'écrit null.",
            "Le texte JSON n'est pas directement un dictionnaire Python : c'est un format sérialisé que l'on décode. Dans Python, True, False et None utilisent des majuscules spécifiques."
          ],
          "code": "import json\ntexte = '{\"machine\":\"M1\",\"minutes\":25,\"active\":true}'\ndonnee = json.loads(texte)\nprint(donnee[\"machine\"])\nprint(donnee[\"active\"])",
          "language": "python",
          "output": "M1\nTrue",
          "interpretation": "Le lecteur décode true en booléen Python True et transforme l'objet JSON en dictionnaire."
        },
        {
          "id": "loads",
          "title": "Decoding JSON Text with json.loads",
          "paragraphs": [
            "json.loads transforme un texte JSON valide en une structure Python, le plus souvent un dictionnaire ou une liste. Cette opération est utilisée après une réponse d'API ou la lecture d'un fichier.",
            "Une chaîne JSON invalide déclenche JSONDecodeError. Les valeurs décodées doivent ensuite être contrôlées : un champ peut manquer ou contenir un type inattendu."
          ],
          "code": "import json\ntexte = '[{\"machine\":\"M1\",\"arret_min\":10},{\"machine\":\"M2\",\"arret_min\":15}]'\nlignes = json.loads(texte)\nprint(len(lignes))\nprint(lignes[0][\"arret_min\"])",
          "language": "python",
          "output": "2\n10",
          "interpretation": "Le texte représente une liste de deux objets. L'accès lignes[0] récupère le premier enregistrement."
        },
        {
          "id": "dumps",
          "title": "Encoding Python Objects with json.dumps",
          "paragraphs": [
            "json.dumps transforme un dictionnaire, une liste et des valeurs Python prises en charge en texte JSON. Les options ensure_ascii=False et indent rendent le fichier plus lisible et conservent les accents.",
            "La sérialisation ne prend pas en charge automatiquement tous les objets : les dates et les tableaux NumPy exigent souvent une transformation préalable."
          ],
          "code": "import json\nrapport = {\"site\":\"Nantes\",\"arrets\":[10,15],\"ok\":True}\ntexte = json.dumps(rapport,ensure_ascii=False,indent=2)\nprint('\"site\"' in texte)\nprint('\"ok\": true' in texte)",
          "language": "python",
          "output": "True\nTrue",
          "interpretation": "Le booléen Python True est écrit true en JSON. L'indentation rend le texte structuré et facile à lire."
        },
        {
          "id": "nested",
          "title": "Accessing Nested JSON Structures",
          "paragraphs": [
            "Un objet JSON peut contenir une liste de machines, chaque machine pouvant avoir elle-même une liste de mesures. Pour récupérer une valeur, on combine clés de dictionnaires et indices de listes.",
            "Un accès imbriqué doit vérifier les champs optionnels. Lorsqu'une API change, une clé absente peut provoquer KeyError ou un index hors plage IndexError."
          ],
          "code": "data = {\"site\":\"Nantes\",\"machines\":[\n    {\"id\":\"M1\",\"temperatures\":[70,72]},\n    {\"id\":\"M2\",\"temperatures\":[75]}\n]}\nprint(data[\"machines\"][0][\"temperatures\"][-1])",
          "language": "python",
          "output": "72",
          "interpretation": "Le code sélectionne la première machine, sa liste de températures puis sa dernière mesure."
        },
        {
          "id": "files",
          "title": "Reading and Writing JSON Files",
          "paragraphs": [
            "json.load lit un fichier ouvert en lecture ; json.dump écrit vers un fichier ouvert en écriture. Utilise l'instruction with pour fermer correctement les fichiers en cas de sortie normale ou d'erreur.",
            "Choisis un encodage explicite et conserve des chemins distincts pour les données originales et les données produites."
          ],
          "code": "import json\nfrom io import StringIO\nstream = StringIO('{\"site\":\"Nantes\",\"pannes\":3}')\nobjet = json.load(stream)\nsortie = StringIO()\njson.dump(objet, sortie, ensure_ascii=False)\nprint(sortie.getvalue())",
          "language": "python",
          "output": "{\"site\": \"Nantes\", \"pannes\": 3}",
          "interpretation": "StringIO simule un fichier ; avec un fichier réel, utilise with open(..., encoding='utf-8')."
        },
        {
          "id": "validating",
          "title": "Validate Fields, Types and the Intended Grain",
          "paragraphs": [
            "Décoder du JSON ne signifie pas que son contenu respecte le contrat métier. Les champs obligatoires doivent être présents, leurs types corrects et les identifiants cohérents.",
            "Pour une API de mesures, précise si chaque objet représente une machine, un événement ou une observation. Sinon, une transformation en DataFrame peut fausser le nombre de cas."
          ],
          "code": "objet = {\"machine\":\"M1\",\"arret_min\":25}\nif not isinstance(objet.get(\"machine\"), str):\n    raise ValueError(\"Identifiant machine invalide\")\nif not isinstance(objet.get(\"arret_min\"), (int,float)):\n    raise ValueError(\"Durée invalide\")\nprint(\"Objet validé\")",
          "language": "python",
          "output": "Objet validé",
          "interpretation": "Le code valide deux champs obligatoires et évite d'utiliser un texte imprévu à la place d'un nombre."
        },
        {
          "id": "project",
          "title": "Mini-project: JSON API-like Maintenance Response",
          "paragraphs": [
            "Simule une réponse d'API contenant des événements de panne. Décode le JSON, contrôle les champs et calcule les minutes d'arrêt totales. L'objectif est d'expliquer chaque étape avant de passer à une vraie API.",
            "Dans une application professionnelle, ajoute une gestion des erreurs de réseau, un contrôle des dates et un journal des enregistrements invalides."
          ],
          "code": "import json\nreponse = '{\"events\":[{\"machine\":\"M1\",\"minutes\":10},{\"machine\":\"M1\",\"minutes\":25}]}'\nevenements = json.loads(reponse)[\"events\"]\ntotal = sum(e[\"minutes\"] for e in evenements)\nprint(len(evenements), total)",
          "language": "python",
          "output": "2 35",
          "interpretation": "Deux événements distincts existent dans le fichier, pour un total de 35 minutes. Ils ne représentent pas deux machines."
        }
      ],
      "mistakes": [
        "Confondre le texte JSON avec un dictionnaire Python non sérialisé.",
        "Utiliser des guillemets simples pour les noms de clés dans un fichier JSON, alors que le format exige des guillemets doubles.",
        "Supposer qu'un objet JSON décodé contient toujours tous les champs attendus.",
        "Essayer de sérialiser directement un objet Python non pris en charge, comme datetime, sans conversion.",
        "Interpréter un objet d'événement comme une entité machine unique lors de l'agrégation."
      ],
      "conclusion": [
        "JSON permet de représenter et d'échanger des objets hiérarchiques. Tu sais les décoder, parcourir les structures imbriquées, écrire des résultats et vérifier le contrat des données.",
        "Ces connaissances servent aux API métiers et aux formats de configuration de projets Data Analyst et Computer Vision."
      ],
      "faq": [
        {
          "question": "What is JSON?",
          "answer": "Un format texte d'échange de données pouvant représenter des objets, tableaux et valeurs primitives."
        },
        {
          "question": "What is the difference between json.load and json.loads?",
          "answer": "load lit depuis un fichier ouvert ; loads décode une chaîne contenant du JSON."
        },
        {
          "question": "How do JSON booleans differ from Python?",
          "answer": "JSON utilise true et false ; Python utilise True et False."
        },
        {
          "question": "Can I store dates in JSON?",
          "answer": "Oui, généralement sous forme de chaînes normalisées, comme ISO 8601, qu'il faut ensuite interpréter."
        },
        {
          "question": "Why validate JSON after parsing?",
          "answer": "Le texte peut être syntaxiquement valide tout en ayant des champs absents ou des types incorrects."
        }
      ]
    }
  },
  {
    "slug": "python-exceptions",
    "pointIndex": 5,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Python Errors and Exception Handling: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un programme peut rencontrer des fichiers absents, des mesures non numériques, des colonnes manquantes ou des divisions impossibles. Ces situations sont normales dans une chaîne de données réelle.",
        "Ce guide apprend à lire les erreurs, distinguer les exceptions, écrire try/except/else/finally, valider les paramètres, lever ses propres erreurs et tester les cas problématiques."
      ],
      "tldr": [
        "Une exception signale une opération que Python ne peut pas mener normalement. Le message et la trace d'erreur indiquent le type et l'emplacement du problème.",
        "try place le code risqué ; except intercepte les catégories prévues ; else s'exécute si aucune exception n'a été levée ; finally exécute un nettoyage.",
        "La bonne pratique n'est pas d'ignorer toutes les erreurs, mais de récupérer les informations utiles et de rendre les défaillances diagnostiquables."
      ],
      "sections": [
        {
          "id": "errors",
          "title": "Understanding Common Python Exceptions",
          "paragraphs": [
            "NameError apparaît lorsqu'un nom n'est pas défini ; TypeError pour des types incompatibles ; ValueError pour une valeur invalide ; IndexError pour un indice impossible et KeyError pour une clé de dictionnaire absente.",
            "Le message indique ce que Python n'a pas compris. Avant de modifier le programme, vérifie la ligne concernée et les valeurs effectivement fournies."
          ],
          "code": "valeurs = [10, 20]\ntry:\n    print(valeurs[5])\nexcept IndexError as erreur:\n    print(type(erreur).__name__)",
          "language": "python",
          "output": "IndexError",
          "interpretation": "Le code récupère la classe d'erreur au lieu d'interrompre l'ensemble du notebook. Un correctif vérifierait l'indice réellement attendu."
        },
        {
          "id": "tryexcept",
          "title": "Basic try/except for Numeric Conversion",
          "paragraphs": [
            "Dans un CSV, une durée peut être absente ou saisie comme du texte. Une conversion float peut alors lever ValueError ; intercepter cette erreur précise permet de signaler la ligne invalide.",
            "Évite un except: général qui peut masquer des erreurs de programmation différentes de celles que tu voulais gérer."
          ],
          "code": "texte = \"indisponible\"\ntry:\n    minutes = float(texte)\nexcept ValueError:\n    minutes = None\nprint(minutes)",
          "language": "python",
          "output": "None",
          "interpretation": "La valeur est marquée indisponible. Elle ne devient pas 0 minute d'arrêt, qui serait une information différente."
        },
        {
          "id": "else-finally",
          "title": "else and finally: Successful Path and Cleanup",
          "paragraphs": [
            "Le bloc else après un try s'exécute lorsque le code du try n'a levé aucune exception. finally s'exécute que l'opération réussisse ou échoue, pratique pour libérer une ressource.",
            "Dans les programmes de traitement de fichiers, with est souvent préférable à un finally manuel parce qu'il ferme automatiquement la ressource ouverte."
          ],
          "code": "try:\n    valeur = float(\"12.5\")\nexcept ValueError:\n    print(\"Conversion impossible\")\nelse:\n    print(\"Valeur valide :\", valeur)\nfinally:\n    print(\"Contrôle terminé\")",
          "language": "python",
          "output": "Valeur valide : 12.5\nContrôle terminé",
          "interpretation": "La conversion réussit : else s'exécute, puis finally s'exécute également."
        },
        {
          "id": "raise",
          "title": "Raising Errors for Invalid Business Inputs",
          "paragraphs": [
            "Une fonction peut lever volontairement une erreur lorsqu'une règle de validation n'est pas respectée. raise ValueError('...') signale par exemple un nombre de pièces négatif ou un dénominateur nul.",
            "Faire échouer explicitement un calcul invalide évite de produire un KPI qui semble correct mais ne respecte pas son contrat."
          ],
          "code": "def calculer_taux(pannes, machines):\n    if machines <= 0:\n        raise ValueError(\"Nombre de machines invalide\")\n    return 100 * pannes / machines\nprint(calculer_taux(2, 8))",
          "language": "python",
          "output": "25.0",
          "interpretation": "La fonction renvoie 25 % lorsque la base est valable. Sur zéro machine, elle lèverait ValueError."
        },
        {
          "id": "file-errors",
          "title": "Files, Missing Keys and Defensive Checks",
          "paragraphs": [
            "Un fichier introuvable déclenche FileNotFoundError ; une clé absente d'un dictionnaire déclenche KeyError. Les contrôles préalables peuvent rendre les messages d'erreur plus compréhensibles pour l'utilisateur.",
            "Ne supprime pas systématiquement les erreurs : si la source est indispensable, mieux vaut interrompre le traitement et expliquer l'absence plutôt que poursuivre avec des données vides."
          ],
          "code": "from pathlib import Path\nchemin = Path(\"rapport_inexistant_12345.csv\")\nif not chemin.exists():\n    print(\"Source introuvable :\", chemin.name)",
          "language": "python",
          "output": "Source introuvable : rapport_inexistant_12345.csv",
          "interpretation": "Le contrôle fournit un diagnostic clair avant de tenter de lire une source essentielle."
        },
        {
          "id": "tests",
          "title": "Assertions and Automated Checks",
          "paragraphs": [
            "assert vérifie une hypothèse et lève AssertionError si elle est fausse. Les assertions aident à tester le code, mais ne doivent pas remplacer les validations des entrées métier en production.",
            "Les assertions Python peuvent être désactivées avec certaines options d'exécution. Utilise raise ValueError et des vérifications explicites pour les contraintes indispensables."
          ],
          "code": "total = 40 + 15\nassert total == 55\nassert total >= 0\nprint(\"Contrôles satisfaits\")",
          "language": "python",
          "output": "Contrôles satisfaits",
          "interpretation": "Les deux propriétés attendues sont vraies. Dans un test unitaire, des assertions contrôlent aussi les cas limites."
        },
        {
          "id": "logging",
          "title": "Logging Errors Without Hiding Them",
          "paragraphs": [
            "Sur plusieurs milliers d'observations, afficher une erreur sans contexte est insuffisant. Il faut associer l'échec à un identifiant de ligne, un nom de machine ou un fichier source, sans exposer de données sensibles.",
            "Le module logging permet de distinguer messages de débogage, informations, avertissements et erreurs. Il est préférable aux print dispersés dans des pipelines professionnels."
          ],
          "code": "import logging\nlogging.basicConfig(level=logging.WARNING)\nmachine = \"M3\"\nvaleur = \"erreur\"\ntry:\n    float(valeur)\nexcept ValueError:\n    logging.warning(\"Mesure invalide pour %s\", machine)\nprint(\"Traitement poursuivi\")",
          "language": "python",
          "output": "Un avertissement concernant M3, puis « Traitement poursuivi ». ",
          "interpretation": "Le journal contient l'identifiant de l'équipement concerné ; il permet une enquête après exécution."
        },
        {
          "id": "project",
          "title": "Mini-project: Reliable Data Import",
          "paragraphs": [
            "Construis une petite procédure qui transforme des valeurs textuelles en nombres, conserve les observations valides et rassemble les erreurs de conversion. Les valeurs rejetées doivent être visibles dans un rapport de contrôle.",
            "Teste une liste vide, une liste entièrement invalide et une liste mixte. La fonction ne doit pas donner une moyenne numérique lorsque aucune mesure valide n'existe."
          ],
          "code": "brutes = [\"10\", \"erreur\", \"25\", \"\"]\nvalides, erreurs = [], []\nfor index, texte in enumerate(brutes):\n    try:\n        valides.append(float(texte))\n    except ValueError:\n        erreurs.append(index)\nmoyenne = sum(valides)/len(valides) if valides else None\nprint(\"Moyenne :\", moyenne)\nprint(\"Lignes invalides :\", erreurs)",
          "language": "python",
          "output": "Moyenne : 17.5\nLignes invalides : [1, 3]",
          "interpretation": "Deux entrées valides et deux rejetées. Les indices des erreurs rendent possible la correction de la source."
        }
      ],
      "mistakes": [
        "Intercepter toutes les exceptions sans connaître leur cause.",
        "Continuer avec des valeurs de remplacement arbitraires qui rendent les statistiques trompeuses.",
        "Oublier de fermer un fichier ou de libérer une ressource après une erreur.",
        "Utiliser assert comme seul contrôle d'une entrée reçue en production.",
        "Afficher une erreur sans préciser la ligne, le fichier ou l'objet concerné."
      ],
      "conclusion": [
        "Tu sais maintenant distinguer les erreurs courantes, utiliser try/except et documenter les anomalies plutôt que les masquer. Une chaîne d'analyse robuste reconnaît les données invalides et rend leur traitement inspectable.",
        "Pour une mission professionnelle, combine validation des entrées, exceptions précises, journalisation et tests reproductibles."
      ],
      "faq": [
        {
          "question": "What is an exception in Python?",
          "answer": "Un signal indiquant qu'une opération ne peut pas être menée normalement."
        },
        {
          "question": "What is the difference between SyntaxError and ValueError?",
          "answer": "SyntaxError signale un code invalide ; ValueError signale une valeur non acceptable pour une opération."
        },
        {
          "question": "What does finally do?",
          "answer": "Son bloc s'exécute à la sortie du try, avec ou sans exception, pour finaliser ou libérer des ressources."
        },
        {
          "question": "Should I catch every exception?",
          "answer": "Non. Intercepte les erreurs prévues ; laisse les autres visibles ou gère-les à un niveau approprié."
        },
        {
          "question": "Why should I log invalid rows?",
          "answer": "Pour identifier la source du problème et conserver une trace des données écartées lors de l'analyse."
        }
      ]
    }
  }
];
