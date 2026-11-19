export const courses = [
  {
    "id": "vision",
    "plan": "Plan A",
    "title": "Computer Vision et traitement d’images",
    "goal": "Construire et évaluer une segmentation, de l’inspection des pixels au diagnostic des erreurs.",
    "project": "/stage-cv",
    "lessons": [
      {
        "id": "pixels",
        "title": "Mesurer le contraste d’une image",
        "code": "from skimage import data\nimport numpy as np\nimport matplotlib.pyplot as plt\nimage = data.coins()\nplt.imshow(image, cmap='gray', vmin=0, vmax=255)\nprint(image.shape, image.dtype, np.percentile(image, [5, 95]))",
        "reading": "Cette photographie de pièces est une matrice de niveaux de gris. Les percentiles 5 et 95 encadrent les 90 % centraux des intensités.",
        "guided": "Découpe la moitié supérieure et affiche-la avec la même échelle. Compare ses percentiles à ceux de l’image entière.",
        "mission": "Compare deux zones de ton choix. Livre les deux images et explique dans laquelle les intensités sont les plus dispersées.",
        "question": "Pourquoi conserver la même échelle de gris ?",
        "answers": [
          "Pour comparer les intensités entre zones",
          "Pour égaliser les moyennes"
        ],
        "correct": 0
      },
      {
        "id": "segmenter",
        "title": "Segmenter les pièces par seuillage",
        "code": "from skimage import data\nimport cv2\nimport matplotlib.pyplot as plt\nimage = data.coins()\nseuil, masque = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)\nplt.imshow(image, cmap='gray')\nplt.contour(masque, levels=[127], colors='red', linewidths=0.6)\nprint(seuil)",
        "reading": "Otsu choisit un seuil global à partir des intensités. Le contour rouge délimite les régions retenues.",
        "guided": "Remplace Otsu par un seuil fixe de 120. Examine le fond clair en haut à gauche.",
        "mission": "Compare les deux méthodes sur deux zones. Livre les superpositions et annote une erreur visible.",
        "question": "Un pixel du fond est identifié comme pièce. Quelle erreur observes-tu ?",
        "answers": [
          "Un faux négatif",
          "Un faux positif"
        ],
        "correct": 1
      },
      {
        "id": "evaluer",
        "title": "Évaluer le recouvrement de deux masques",
        "code": "import numpy as np\nreference = np.array([1,1,1,1,0,0], dtype=bool)\nprediction = np.array([1,1,0,0,1,0], dtype=bool)\nintersection = (reference & prediction).sum()\nunion = (reference | prediction).sum()\nprint('IoU', intersection / union)\nprint('Dice', 2 * intersection / (reference.sum() + prediction.sum()))",
        "reading": "Deux pixels sont communs aux masques. L’union contient cinq pixels. L’IoU vaut 0,4 et le Dice environ 0,57.",
        "guided": "Corrige le troisième pixel de la prédiction. Prédis les deux scores avant de relancer le calcul.",
        "mission": "Reprends deux masques non vides de ton projet. Localise les erreurs sur l’image et explique le score à ton tuteur.",
        "question": "Quel dénominateur utilise l’IoU ?",
        "answers": [
          "Les pixels positifs dans au moins un masque",
          "Tous les pixels de l’image"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": "data",
    "plan": "Plan B",
    "title": "Data Analyst",
    "goal": "Transformer un journal d’arrêts en indicateurs fiables pour une équipe de maintenance.",
    "project": "/stages/data-analysis",
    "lessons": [
      {
        "id": "qualite",
        "title": "Fiabiliser un journal d’arrêts",
        "code": "import pandas as pd\njournal = pd.DataFrame({'incident':[101,102,102,103], 'machine':['A','B','B','A'], 'minutes':[15,60,60,None]})\nprint(journal[journal.duplicated(keep=False)])\nprint(journal.isna().sum())",
        "reading": "Dans cet exemple simulé, 102 apparaît deux fois à l’identique. La durée de 103 est inconnue.",
        "guided": "Supprime les doublons exacts. Compare le nombre d’incidents uniques au nombre de durées renseignées.",
        "mission": "Ajoute une ligne portant le même identifiant avec une durée différente. Isole le conflit et rédige une question au responsable des données.",
        "question": "Comment présenter une durée inconnue ?",
        "answers": [
          "La remplacer systématiquement par zéro",
          "La signaler et préciser combien de durées sont renseignées"
        ],
        "correct": 1
      },
      {
        "id": "indicateurs",
        "title": "Comparer fréquence et durée des arrêts",
        "code": "import pandas as pd\narrets = pd.DataFrame({'machine':['A','A','A','B'], 'minutes':[10,10,10,75]})\nbilan = arrets.groupby('machine').agg(arrets=('minutes','size'), minutes=('minutes','sum'))\nprint(bilan.sort_values('minutes', ascending=False))",
        "reading": "A compte trois arrêts et perd 30 minutes. B perd 75 minutes sur un seul arrêt.",
        "guided": "Calcule la part des minutes perdues par machine. Vérifie que la somme vaut 100 %.",
        "mission": "Ajoute deux arrêts de 30 minutes sur A. Recalcule le classement et explique à l’équipe quelle machine examiner.",
        "question": "Quelle machine concentre le plus de minutes perdues dans l’exemple initial ?",
        "answers": [
          "B",
          "A"
        ],
        "correct": 0
      },
      {
        "id": "bilan",
        "title": "Présenter le bilan de maintenance",
        "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nminutes = pd.Series({'Ligne A':45, 'Ligne B':120, 'Ligne C':30})\nminutes.sort_values().plot.barh()\nplt.xlabel('Durée cumulée des arrêts (minutes)')\nplt.title('Arrêts enregistrés pendant la semaine 1')\nplt.tight_layout()",
        "reading": "La ligne B concentre 120 des 195 minutes enregistrées. Le graphique indique où commencer l’investigation.",
        "guided": "Calcule la part de B. Rédige une phrase qui précise le chiffre, la période et la décision proposée.",
        "mission": "La semaine suivante, A, B et C perdent respectivement 60, 80 et 40 minutes. Livre une figure comparative et formule une question pour le terrain.",
        "question": "Quelle donnée manque pour comparer des taux d’indisponibilité ?",
        "answers": [
          "Le nombre de responsables",
          "Le temps de fonctionnement prévu de chaque ligne"
        ],
        "correct": 1
      }
    ]
  }
];
