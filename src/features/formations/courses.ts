export const courses = [
  {
    "id": "vision",
    "plan": "Plan A",
    "title": "Computer Vision et traitement d’images",
    "goal": "Partir d’une grille de pixels et livrer une inspection visuelle mesurée et reproductible.",
    "project": "/stage-cv",
    "lessons": [
      {
        "id": "premiers-pixels",
        "title": "Du pixel à la première image",
        "why": "Comprendre ce que contient un fichier image une fois lu par Python.",
        "theory": "Un pixel est une case de l’image. Dans notre image en gris sur 8 bits, 0 représente le noir et 255 le blanc. Une grille de nombres suffit donc pour dessiner une forme. Dans Jupyter, une cellule contient des instructions Python. Maj + Entrée les exécute. Le signe = donne un nom à une valeur.",
        "code": "import matplotlib.pyplot as plt\n\ngrille = [[0, 255, 0],\n          [255, 255, 255],\n          [0, 255, 0]]\nplt.imshow(grille, cmap='gray', vmin=0, vmax=255, interpolation='nearest')\nplt.show()",
        "reading": "Les trois listes sont les trois lignes de l’image. Les cinq cases qui valent 255 dessinent une croix blanche.",
        "guided": "Avant de relancer, prédis ce qui changera si tu remplaces la valeur centrale par 0. Vérifie à l’écran.",
        "mission": "Dessine la lettre L dans une grille de cinq lignes et cinq colonnes. Montre la grille et l’image à un collègue.",
        "check": "On reconnaît le L. Tu sais désigner dans le code la case située en haut à gauche et expliquer sa couleur.",
        "question": "Que devient une case quand sa valeur passe de 0 à 255 ?",
        "answers": [
          "Elle devient blanche.",
          "Elle se déplace vers la droite."
        ],
        "correct": 0,
        "hint": "La valeur règle la luminosité. La position dépend de la ligne et de la colonne."
      },
      {
        "id": "lecture",
        "title": "Ouvrir une photographie et en extraire une zone",
        "why": "Savoir contrôler l’entrée d’un traitement avant de modifier l’image.",
        "theory": "Une photo couleur se lit ici comme un tableau de hauteur × largeur × 3. Chaque pixel comporte trois intensités, rouge, vert et bleu. Python numérote les lignes et les colonnes à partir de zéro. La notation [début:fin] conserve le début et exclut la fin.",
        "code": "from matplotlib import cbook\nimport matplotlib.pyplot as plt\n\nphoto = plt.imread(cbook.get_sample_data('grace_hopper.jpg', asfileobj=False))\nprint(photo.shape, photo.dtype)\nzone = photo[100:200, 50:150]\nplt.imshow(zone)\nplt.show()",
        "reading": "La photo est fournie avec Matplotlib. La découpe garde les lignes 100 à 199 et les colonnes 50 à 149, avec les trois couleurs.",
        "guided": "Affiche la photo entière puis décale la découpe de 50 colonnes vers la droite. Vérifie les dimensions avec zone.shape.",
        "mission": "Prépare une fiche d’inspection avec la photo, une zone d’intérêt, leurs dimensions et le sens des trois canaux.",
        "check": "La découpe correspond à la zone annoncée et tu peux retrouver son emplacement dans la photo d’origine.",
        "question": "Quelle dimension change si tu conserves seulement les 50 premières lignes ?",
        "answers": [
          "La largeur.",
          "La hauteur."
        ],
        "correct": 1,
        "hint": "Les lignes constituent le premier axe du tableau."
      },
      {
        "id": "pixels",
        "title": "Lire un histogramme et régler le contraste",
        "why": "Identifier une image peu contrastée et contrôler l’effet d’une correction.",
        "theory": "Un histogramme compte les pixels par intensité. Quand les valeurs occupent une petite partie de l’échelle, les détails peuvent être difficiles à distinguer. Étirer cette plage écarte les gris. Les valeurs au-delà des bornes sont saturées.",
        "code": "from skimage import data, exposure\nimport matplotlib.pyplot as plt\n\nimage = data.camera()\nfigure, axes = plt.subplots(1, 3, figsize=(11, 3))\naxes[0].imshow(image, cmap='gray', vmin=0, vmax=255)\naxes[1].hist(image.ravel(), bins=32, range=(0, 256))\naxes[2].imshow(exposure.rescale_intensity(image, in_range=(40, 190)), cmap='gray', vmin=0, vmax=255)\nplt.show()",
        "reading": "Au centre, l’axe horizontal indique l’intensité, l’axe vertical le nombre de pixels. À droite, les intensités au-dessus de 190 deviennent blanches.",
        "guided": "Compare les bornes (40, 190) puis (80, 160). Observe le visage et le ciel à la même échelle.",
        "mission": "Réalise un comparatif avant/après et choisis un réglage en montrant un détail préservé et une zone saturée.",
        "check": "Les deux vues ont la même échelle et ta conclusion cite une zone précise.",
        "question": "Que signifie un pic proche de zéro ?",
        "answers": [
          "Beaucoup de pixels sombres.",
          "Une image de petite taille."
        ],
        "correct": 0,
        "hint": "La position du pic donne la luminosité et sa hauteur donne l’effectif."
      },
      {
        "id": "filtrer",
        "title": "Réduire le bruit sans effacer les détails",
        "why": "Choisir un filtre en observant le défaut à corriger.",
        "theory": "Le bruit crée des variations parasites. Un filtre médian remplace chaque pixel par la valeur centrale des intensités triées de son voisinage. Une fenêtre plus large peut retirer davantage de bruit et faire disparaître des traits fins.",
        "code": "from skimage import data\nimport numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\n\nimage = data.camera().copy()\nhasard = np.random.default_rng(7)\nimage[hasard.random(image.shape) < 0.05] = 255\nfiltre = cv2.medianBlur(image, 3)\nfig, axes = plt.subplots(1, 2)\nfor axe, vue in zip(axes, [image, filtre]):\n    axe.imshow(vue[100:250, 100:250], cmap='gray', vmin=0, vmax=255)\nplt.show()",
        "reading": "Le même agrandissement permet de voir quels points blancs isolés ont disparu. Le nombre 3 définit une fenêtre de 3 × 3 pixels.",
        "guided": "Essaie 7 à la place de 3. Repère un détail dont le contour se dégrade.",
        "mission": "Livre une planche original bruité, médiane 3 et médiane 7. Annote une amélioration et une perte de détail.",
        "check": "Les trois vues portent sur la même zone. Tu justifies ton choix par deux observations.",
        "question": "Pourquoi agrandir la même zone dans chaque vue ?",
        "answers": [
          "Pour créer des pixels indépendants.",
          "Pour comparer le même détail."
        ],
        "correct": 1,
        "hint": "Une comparaison de filtres doit garder la scène et l’échelle identiques."
      },
      {
        "id": "segmenter",
        "title": "Isoler des objets et vérifier le masque",
        "why": "Construire une première méthode de segmentation avec OpenCV.",
        "theory": "Segmenter consiste à attribuer une classe à chaque pixel. Un masque binaire encode deux classes, par exemple fond et pièce. Un seuil classe chaque pixel selon son intensité. Otsu estime un seuil global à partir de l’histogramme.",
        "code": "from skimage import data\nimport cv2\nimport matplotlib.pyplot as plt\n\nimage = data.coins()\nseuil, masque = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)\nplt.imshow(image, cmap='gray')\nplt.contour(masque, levels=[127], colors='red', linewidths=0.6)\nprint('Seuil', seuil)\nplt.show()",
        "reading": "La ligne rouge matérialise les frontières du masque. Là où elle suit le fond ou traverse une pièce, la segmentation est imparfaite.",
        "guided": "Teste un seuil fixe de 120 avec cv2.THRESH_BINARY. Observe les mêmes pièces dans les deux résultats.",
        "mission": "Livre une planche image, masque, superposition. Annote une pièce bien isolée et une région à corriger.",
        "check": "Une autre personne peut relancer le seuil choisi et retrouver les erreurs signalées.",
        "question": "Un pixel du fond est indiqué comme pièce. Quelle erreur est-ce ?",
        "answers": [
          "Un faux positif.",
          "Un faux négatif."
        ],
        "correct": 0,
        "hint": "Un faux positif est un pixel classé objet alors que la référence le classe fond."
      },
      {
        "id": "evaluer",
        "title": "Mesurer la qualité et expliquer les erreurs",
        "why": "Savoir comparer deux résultats face à une annotation humaine.",
        "theory": "L’annotation indique la classe de référence. L’intersection contient les pixels objets communs aux deux masques. L’IoU divise leur nombre par la taille de l’union. Le Dice divise deux fois l’intersection par la somme des tailles des objets. Un score de 1 indique un accord parfait lorsque l’objet existe.",
        "code": "import numpy as np\nreference = np.array([1,1,1,1,0,0], dtype=bool)\nprediction = np.array([1,1,0,0,1,0], dtype=bool)\ncommuns = (reference & prediction).sum()\nprint('IoU', communs / (reference | prediction).sum())\nprint('Dice', 2 * communs / (reference.sum() + prediction.sum()))",
        "reading": "Les masques ont deux pixels objets en commun. L’union en contient cinq. L’IoU vaut 0,40 et le Dice environ 0,57.",
        "guided": "Corrige le troisième pixel. Calcule les scores à la main, puis vérifie dans la cellule.",
        "mission": "Compare deux prédictions sur la même référence. Remets un tableau de scores et indique quels pixels expliquent l’écart.",
        "check": "Les valeurs peuvent être reproduites et ton explication distingue pixels manqués et fausses détections.",
        "question": "Que représente l’union ?",
        "answers": [
          "Toute l’image.",
          "Les pixels objets dans au moins un masque."
        ],
        "correct": 1,
        "hint": "Un pixel présent dans les deux objets ne compte qu’une fois dans l’union."
      },
      {
        "id": "classer",
        "title": "Entraîner un premier classifieur d’images",
        "why": "Comprendre la différence entre attribuer une classe à une image et dessiner un masque.",
        "theory": "En classification, une étiquette décrit l’image entière. Le modèle apprend sur des exemples étiquetés. On réserve d’autres images pour le tester. Une matrice de confusion indique pour chaque vraie classe combien d’exemples ont reçu chaque prédiction.",
        "code": "from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.metrics import confusion_matrix\n\nimages, chiffres = load_digits(return_X_y=True)\nx_train, x_test, y_train, y_test = train_test_split(images, chiffres, stratify=chiffres, random_state=7)\nmodele = KNeighborsClassifier(n_neighbors=3).fit(x_train, y_train)\npredits = modele.predict(x_test)\nprint(confusion_matrix(y_test, predits))",
        "reading": "Chaque exemple représente un chiffre manuscrit de 8 × 8 pixels. Le modèle consulte les trois exemples d’entraînement les plus proches. Les erreurs sont hors diagonale.",
        "guided": "Affiche la première erreur avec plt.imshow(x_test[i].reshape(8, 8), cmap='gray') après avoir importé matplotlib.pyplot et trouvé un indice i où predits et y_test diffèrent.",
        "mission": "Livre une fiche avec la taille des deux groupes, la proportion de bonnes réponses et trois erreurs illustrées.",
        "check": "Aucune image test ne sert à entraîner le modèle. Chaque erreur indique la classe attendue et la prédiction.",
        "question": "Sur quelles images mesurer la performance finale ?",
        "answers": [
          "Les images réservées au test.",
          "Les images qui ont servi à apprendre."
        ],
        "correct": 0,
        "hint": "La séparation mesure la capacité à traiter des exemples nouveaux."
      },
      {
        "id": "reseau",
        "title": "Comprendre et entraîner un petit réseau convolutif",
        "why": "Relier les filtres étudiés en traitement d’images à un premier modèle PyTorch.",
        "theory": "Un filtre de convolution parcourt une image et produit une carte de réponses. Dans un CNN, l’entraînement ajuste ces filtres. ReLU conserve les réponses positives, le pooling réduit la taille des cartes et la dernière couche produit un score par classe. Une époque correspond à un passage sur les images d’entraînement.",
        "code": "import torch\nfrom torch import nn\nfrom sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\n\ntorch.manual_seed(7)\ntorch.set_num_threads(1)\nchiffres = load_digits()\nx = torch.tensor(chiffres.images, dtype=torch.float32).unsqueeze(1) / 16\ny = torch.tensor(chiffres.target, dtype=torch.long)\ntrain, test = train_test_split(range(len(y)), stratify=y, random_state=7)\nreseau = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),\n                       nn.Flatten(), nn.Linear(8 * 4 * 4, 10))\noptimiseur = torch.optim.Adam(reseau.parameters(), lr=0.005)\nfor epoque in range(5):\n    for lot in torch.randperm(len(train)).split(64):\n        indices = [train[i] for i in lot.tolist()]\n        erreur = nn.functional.cross_entropy(reseau(x[indices]), y[indices])\n        optimiseur.zero_grad()\n        erreur.backward()\n        optimiseur.step()\nwith torch.no_grad():\n    predits = reseau(x[test]).argmax(1)\n    print('Exactitude test', (predits == y[test]).float().mean().item())",
        "reading": "Chaque entrée a un canal de 8 × 8 pixels. Après pooling, les huit cartes de 4 × 4 fournissent 128 valeurs au classifieur. La proportion affichée mesure les prédictions correctes sur le test réservé.",
        "guided": "Affiche les dimensions du lot avant et après les trois premières couches. Vérifie sur papier les 128 valeurs.",
        "mission": "Compare ce CNN au classifieur de la leçon précédente sur la même séparation. Livre les deux scores, deux exemples d’erreurs et une recommandation argumentée.",
        "check": "La comparaison utilise les mêmes images test et tu expliques le rôle du filtre, du pooling et du score de sortie.",
        "question": "Qu’apprend la couche de convolution ?",
        "answers": [
          "Les valeurs des filtres.",
          "Le nom des fichiers."
        ],
        "correct": 0,
        "hint": "Les gradients ajustent les poids des filtres pendant l’entraînement."
      },
      {
        "id": "mission-vision",
        "title": "Mission de stage · évaluer une inspection visuelle",
        "why": "Livrer à un tuteur une méthode reproductible et ses limites.",
        "theory": "Une méthode de référence donne un point de comparaison. Définis les critères avant d’essayer une amélioration. Sépare les images de réglage des images d’évaluation. Un compte rendu doit permettre à un collègue de retrouver les entrées, les paramètres et les résultats.",
        "code": "from skimage import data\nimport matplotlib.pyplot as plt\n\nphoto = data.coins()\nmilieu = photo.shape[0] // 2\nreglage, evaluation = photo[:milieu], photo[milieu:]\nplt.imshow(reglage, cmap='gray')\nplt.title('Zone réservée au réglage')\nplt.show()",
        "reading": "Les deux moitiés permettent un exercice reproductible sur une photo. Une évaluation industrielle demanderait aussi des prises de vue indépendantes.",
        "guided": "Sur deux découpes de réglage, trace manuellement les masques de référence. Compare seuil fixe et Otsu. Fige ensuite leurs paramètres.",
        "mission": "Annote deux découpes inédites de la zone d’évaluation. Livre un notebook relançable, quatre superpositions (deux méthodes × deux découpes), les IoU et une recommandation de cinq lignes.",
        "check": "Un collègue reproduit le tableau. Tu sais montrer un échec, en expliquer la cause probable et proposer un essai suivant.",
        "question": "À quel moment figer les paramètres ?",
        "answers": [
          "Après avoir choisi le meilleur résultat sur le test.",
          "Avant de consulter les résultats d’évaluation."
        ],
        "correct": 1,
        "hint": "Modifier les paramètres après examen du test transforme ces images en données de réglage."
      }
    ]
  },
  {
    "id": "data",
    "plan": "Plan B",
    "title": "Data Analyst",
    "goal": "Partir d’un premier tableau et livrer un bilan de maintenance vérifié.",
    "project": "/stages/data-analysis",
    "lessons": [
      {
        "id": "premier-tableau",
        "title": "Comprendre une ligne, une colonne et une unité",
        "why": "Lire un tableau comme le ferait la personne qui collecte les données.",
        "theory": "Une ligne décrit ici un arrêt de machine. Les colonnes sont ses caractéristiques. Un identifiant distingue deux événements, même si la machine et la durée sont identiques. Dans Jupyter, Maj + Entrée exécute la cellule. En Python, = associe un nom à une valeur.",
        "code": "import pandas as pd\n\narrets = pd.DataFrame({'incident': [101, 102, 103],\n                      'machine': ['A', 'A', 'B'],\n                      'minutes': [10, 15, 60]})\nprint(arrets)\nprint(arrets['minutes'].sum())",
        "reading": "DataFrame construit le tableau à partir de colonnes nommées. La dernière ligne de code additionne les durées. On obtient 85 minutes pour trois arrêts et deux machines.",
        "guided": "Passe l’incident 103 à 30 minutes. Prédis le nouveau total, puis vérifie.",
        "mission": "Construis ton propre journal de cinq arrêts. Fournis un dictionnaire qui définit chaque colonne et précise l’unité des durées.",
        "check": "Un collègue peut expliquer ce que signifie une ligne et retrouver le total à la main.",
        "question": "Que représente une ligne ici ?",
        "answers": [
          "Une machine unique.",
          "Un arrêt de machine."
        ],
        "correct": 1,
        "hint": "Deux arrêts de la même machine restent deux événements."
      },
      {
        "id": "importer",
        "title": "Importer et contrôler un fichier CSV",
        "why": "Lire un export dont les nombres et les dates ont un format français.",
        "theory": "Un CSV sépare les colonnes par un délimiteur. Un nombre lu comme du texte empêche certains calculs. Le type d’une colonne indique comment Python interprète ses valeurs. Inspecte les premiers enregistrements avant toute agrégation.",
        "code": "from io import StringIO\nimport pandas as pd\n\nexport = 'date;machine;heures\\n17/11/2026;A;1,5\\n18/11/2026;B;0,5'\ntable = pd.read_csv(StringIO(export), sep=';', decimal=',')\ntable['date'] = pd.to_datetime(table['date'], format='%d/%m/%Y')\nprint(table.dtypes)\nprint(table['heures'].sum())",
        "reading": "StringIO simule un fichier pour reproduire l’exercice. Les heures sont numériques et le total vaut 2. Pour lire un export local, remplace StringIO(export) par son chemin.",
        "guided": "Retire decimal=',' et observe le type et le total. Rétablis le paramètre.",
        "mission": "Enregistre un CSV de quatre lignes, importe-le et fournis les types, le nombre de lignes et un total de contrôle.",
        "check": "Le total calculé correspond au calcul manuel et les dates sont utilisables pour un filtre.",
        "question": "Pourquoi vérifier le type des heures ?",
        "answers": [
          "Une chaîne peut être concaténée au lieu d’être additionnée.",
          "Le type fixe le nombre de lignes."
        ],
        "correct": 0,
        "hint": "L’opération dépend du type de données."
      },
      {
        "id": "qualite",
        "title": "Traiter doublons et valeurs manquantes",
        "why": "Éviter un bilan surestimé ou artificiellement complet.",
        "theory": "Un doublon exact répète la même ligne. Deux lignes avec le même identifiant et des valeurs différentes forment un conflit à examiner. Une durée manquante représente une information inconnue. Compte les données exploitables en plus du total.",
        "code": "import pandas as pd\njournal = pd.DataFrame({'incident':[101,102,102,103], 'minutes':[15,60,60,None]})\npropre = journal.drop_duplicates()\nprint(propre)\nprint('Durées connues', propre['minutes'].count(), '/', len(propre))\nprint('Minutes renseignées', propre['minutes'].sum())",
        "reading": "Trois incidents subsistent, dont deux avec une durée. Le total observé vaut 75 minutes.",
        "guided": "Ajoute une autre ligne pour 102 avec 65 minutes. Repère les identifiants encore répétés après suppression des doublons exacts.",
        "mission": "Livre un tableau nettoyé et un journal indiquant les lignes retirées, les conflits à arbitrer et les durées absentes.",
        "check": "Chaque exclusion est traçable et le bilan précise sa couverture.",
        "question": "Quelle durée attribuer à une valeur inconnue ?",
        "answers": [
          "Toujours zéro.",
          "La conserver manquante en attendant confirmation."
        ],
        "correct": 1,
        "hint": "Zéro serait une durée connue."
      },
      {
        "id": "indicateurs",
        "title": "Choisir et calculer les bons indicateurs",
        "why": "Répondre à une question opérationnelle avec un indicateur défini.",
        "theory": "La fréquence compte les événements. La durée cumulée mesure le temps perdu. Une moyenne divise la somme par le nombre de valeurs renseignées. Une machine qui s’arrête souvent peut perdre moins de temps qu’une machine immobilisée une seule fois.",
        "code": "import pandas as pd\narrets = pd.DataFrame({'machine':['A','A','A','B'], 'minutes':[10,10,10,75]})\nbilan = arrets.groupby('machine').agg(arrets=('minutes','size'), minutes=('minutes','sum'))\nprint(bilan)",
        "reading": "A connaît trois arrêts et cumule 30 minutes. B perd 75 minutes en un seul arrêt.",
        "guided": "Ajoute la part de chaque machine dans les 105 minutes perdues. Vérifie que les parts totalisent 100 %.",
        "mission": "Ajoute deux arrêts de 30 minutes sur A. Livre les deux classements avant et après et explique ce que tu examinerais en priorité.",
        "check": "Tes titres donnent les unités et chaque classement répond à une question explicite.",
        "question": "Dans le jeu initial, quelle machine perd le plus de temps ?",
        "answers": [
          "B.",
          "A."
        ],
        "correct": 0,
        "hint": "75 minutes dépassent les 30 minutes cumulées de A."
      },
      {
        "id": "sql",
        "title": "Interroger les données en SQL",
        "why": "Extraire un bilan directement depuis une base relationnelle.",
        "theory": "Une table SQL rassemble des lignes. SELECT choisit les colonnes, WHERE filtre les lignes et GROUP BY forme les groupes. SUM additionne une mesure dans chaque groupe. ORDER BY trie le résultat.",
        "code": "import sqlite3\n\nwith sqlite3.connect(':memory:') as base:\n    base.execute('CREATE TABLE arrets (machine TEXT, minutes INTEGER)')\n    base.executemany('INSERT INTO arrets VALUES (?, ?)', [('A',10),('A',15),('B',60)])\n    requete = '''SELECT machine, SUM(minutes) AS total\n                 FROM arrets GROUP BY machine ORDER BY total DESC'''\n    print(base.execute(requete).fetchall())",
        "reading": "SQLite crée la base en mémoire. La requête renvoie B avec 60 minutes, puis A avec 25 minutes.",
        "guided": "Insère WHERE minutes >= 15 avant GROUP BY. Vérifie quels enregistrements entrent dans le calcul.",
        "mission": "Écris une requête qui donne pour chaque machine le nombre d’arrêts, la durée totale et la durée moyenne. Contrôle les résultats à la main.",
        "check": "Le nombre total d’arrêts et la somme des minutes concordent avec les lignes sources.",
        "question": "Quel mot-clé forme un groupe par machine ?",
        "answers": [
          "ORDER BY.",
          "GROUP BY."
        ],
        "correct": 1,
        "hint": "Le regroupement précède le calcul des agrégats par machine."
      },
      {
        "id": "bilan",
        "title": "Construire un visuel pour une décision",
        "why": "Préparer un indicateur compréhensible dans un tableau de bord.",
        "theory": "Une barre compare des catégories selon une même échelle. Le titre précise la mesure et la période. Une évolution demande plusieurs périodes comparables. Pour calculer un taux d’indisponibilité, il faut également connaître le temps prévu de fonctionnement.",
        "code": "import pandas as pd\nimport matplotlib.pyplot as plt\nminutes = pd.Series({'Ligne A':45, 'Ligne B':120, 'Ligne C':30})\nminutes.sort_values().plot.barh()\nplt.xlabel('Durée cumulée des arrêts (minutes)')\nplt.title('Arrêts enregistrés pendant la semaine 1')\nplt.tight_layout()\nplt.show()",
        "reading": "B cumule 120 des 195 minutes. Le visuel permet d’identifier où commencer l’investigation.",
        "guided": "Calcule le pourcentage de B. Rédige une phrase qui associe le chiffre, la période et une question pour le terrain.",
        "mission": "Compare avec une deuxième semaine de 60, 80 et 40 minutes pour A, B et C. Livre une page de bilan avec deux indicateurs et une figure comparative.",
        "check": "Les unités et la période sont lisibles. La conclusion distingue ce que les données montrent et la cause à confirmer.",
        "question": "Que faut-il pour comparer des taux d’indisponibilité ?",
        "answers": [
          "Le temps prévu de fonctionnement.",
          "Le nom du responsable."
        ],
        "correct": 0,
        "hint": "Le temps prévu fournit le dénominateur du taux."
      },
      {
        "id": "power-bi",
        "title": "Construire une page de suivi dans Power BI",
        "why": "Transformer un tableau propre en rapport que le tuteur peut filtrer.",
        "theory": "Un indicateur résume une mesure. Un segment filtre les visuels de la page. Une table détaillée permet de retrouver les événements qui expliquent un chiffre. Le fichier ci-dessous est un export simulé à importer dans Power BI Desktop.",
        "code": "import pandas as pd\narrets = pd.DataFrame({'machine':['A','A','B','A','B'], 'semaine':[1,1,1,2,2], 'minutes':[10,15,60,45,25]})\narrets.to_csv('arrets.csv', index=False)\nprint(arrets.groupby('semaine')['minutes'].sum())",
        "reading": "Télécharge arrets.csv depuis le dossier du notebook. Dans Power BI Desktop, choisis Obtenir les données puis Texte/CSV. Charge le fichier, vérifie que minutes est numérique et ajoute une carte avec la somme des minutes.",
        "guided": "Ajoute un graphique en barres avec machine comme catégorie et la somme des minutes comme valeur. Ajoute un segment sur semaine et sélectionne 1. La carte doit afficher 85 minutes.",
        "mission": "Livre une page Power BI avec carte, barres, filtre par semaine et table de vérification. Teste la semaine 2 et explique la variation par machine.",
        "check": "Sans filtre la carte indique 155 minutes. La semaine 2 donne 70 et chaque total concorde avec la table détaillée.",
        "question": "Quelle agrégation donne le temps total perdu ?",
        "answers": [
          "Le nombre de lignes.",
          "La somme des minutes."
        ],
        "correct": 1,
        "hint": "Chaque ligne porte une durée. Les additionner donne le temps cumulé."
      },
      {
        "id": "mission-data",
        "title": "Mission de stage · prioriser une enquête maintenance",
        "why": "Prendre en charge un export brut jusqu’à la présentation du résultat.",
        "theory": "Avant le calcul, définis la décision à éclairer et l’unité d’analyse. Conserve l’export brut. Documente le nettoyage et les limites, puis fournis un résultat que l’équipe peut vérifier et actualiser.",
        "code": "from io import StringIO\nimport pandas as pd\n\nbrut = '''id,machine,semaine,minutes\n1,A,1,20\n2,A,1,15\n3,B,1,80\n3,B,1,80\n4,B,2,25\n5,A,2,40\n6,B,2,\n7,C,2,15'''\njournal = pd.read_csv(StringIO(brut))\nprint(journal.shape)\nprint(journal.head())",
        "reading": "Ces huit lignes simulées contiennent un doublon et une durée absente. Toute priorité doit préciser à quelle période elle s’applique.",
        "guided": "Formule la question de l’équipe en une phrase. Contrôle les identifiants et indique la couverture des durées avant de choisir une figure.",
        "mission": "Livre le notebook relançable, une page de tableau de bord et une synthèse de cinq lignes. Explique quelle machine examiner d’abord, sur quelle période et avec quelle réserve.",
        "check": "Le contrôle après dédoublonnage donne 7 incidents, 6 durées connues et 195 minutes renseignées. Un collègue retrouve les chiffres et comprend la limite.",
        "question": "Quel contrôle confirme que le bilan n’a pas compté deux fois l’incident 3 ?",
        "answers": [
          "La couleur du graphique.",
          "La réconciliation du total avec les incidents distincts."
        ],
        "correct": 1,
        "hint": "Le total nettoyé doit être vérifié sur les événements uniques."
      }
    ]
  }
];
