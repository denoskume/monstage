import type { FormationTrack } from './formationTypes';

export const imageProcessingTrack: FormationTrack = {
  "id": "traitement-images",
  "plan": "Plan A",
  "title": "Traitement d’images — Foundations to Job Ready",
  "subtitle": "Pixels, NumPy, OpenCV, filtres, segmentation et pipelines",
  "weeks": "12 à 14 semaines",
  "level": "Débutant à stage junior",
  "tools": [
    "Python",
    "NumPy",
    "OpenCV",
    "Matplotlib",
    "Jupyter"
  ],
  "objective": "Comprendre l’image depuis les pixels et livrer des chaînes de traitement classiques mesurées, testées et documentées.",
  "project": "Projet final : inspection et mesure de pièces industrielles",
  "modules": [
    {
      "id": "images-pixels",
      "title": "Images numériques, pixels et signaux 2D",
      "objective": "Comprendre la structure numérique d’une image, avant d’utiliser OpenCV.",
      "concept": "Une image numérique est une grille de valeurs échantillonnées. Une image 8 bits en niveaux de gris utilise souvent les intensités de 0 (noir) à 255 (blanc). Sa forme est (hauteur, largeur) ; une image RGB courante ajoute un troisième axe de trois canaux. La quantification limite les niveaux possibles.",
      "points": [
        "Pixel, lignes/colonnes et origine des coordonnées",
        "Images comme signaux 2D",
        "Résolution, dimensions et rapport d’aspect",
        "Intensité, bits, échantillonnage et quantification",
        "Images de gris, couleur et multi-canaux",
        "Exemples industriels, médicaux et robotiques"
      ],
      "example": "Une croix blanche peut être construite uniquement à partir de neuf valeurs entières.",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# Image en niveaux de gris, 3 lignes × 3 colonnes\npixels = np.array([[0,255,0],[255,255,255],[0,255,0]],dtype=np.uint8)\nprint(\"Dimensions:\",pixels.shape, \"Pixel central:\",pixels[1,1])\nplt.imshow(pixels,cmap=\"gray\",vmin=0,vmax=255,interpolation=\"nearest\")\nplt.title(\"Une image = une matrice\")\nplt.show()",
      "result": "L’image contient neuf pixels et dessine une croix blanche. Les indices sont [ligne, colonne], non [x, y] par défaut.",
      "instructions": "Inverse la valeur centrale ; dessine ensuite la lettre L sur une matrice 5 × 5. Prédis le résultat avant l’exécution.",
      "mission": "Construire un petit alphabet de formes en matrices et expliquer la valeur de trois pixels.",
      "validation": "Les figures correspondent aux matrices et les dimensions sont correctes.",
      "quiz": {
        "question": "Quel est le premier indice de pixels[1,2] ?",
        "options": [
          "La colonne",
          "La ligne",
          "Le canal rouge"
        ],
        "correct": 1,
        "explanation": "NumPy indexe les images par ligne puis colonne."
      },
      "codeLanguage": "python"
    },
    {
      "id": "python-images",
      "title": "Python et NumPy pour manipuler les images",
      "objective": "Savoir lire, indexer et transformer une image sous forme de tableau.",
      "concept": "Le slicing permet d’extraire une région sans parcourir chaque pixel avec une boucle. NumPy vectorise les opérations. Le dtype est indispensable : additionner 10 à un tableau uint8 saturé peut provoquer un débordement si on n’utilise pas un type temporaire plus large.",
      "points": [
        "Python et notebooks Jupyter",
        "NumPy : ndarray, shape et dtype",
        "Slicing et régions d’intérêt",
        "Création de masques booléens",
        "Opérations vectorisées et clipping",
        "Comparaison de plusieurs images avec Matplotlib"
      ],
      "example": "On veut éclaircir une image en préservant la plage d’intensité 0–255.",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\nimage = np.array([[0,80,220],[40,160,250]],dtype=np.uint8)\n# Convertir avant l'addition pour éviter le débordement uint8\neclaircie = np.clip(image.astype(np.int16)+30,0,255).astype(np.uint8)\nprint(\"Original:\\n\",image,\"\\nRésultat:\\n\",eclaircie)\nplt.imshow(eclaircie,cmap=\"gray\",vmin=0,vmax=255)\nplt.show()",
      "result": "Les valeurs ne dépassent jamais 255 ; la valeur 250 devient 255 et non 24.",
      "instructions": "Essaie un ajout de 80 et repère les pixels saturés. Explique pourquoi la conversion préalable est nécessaire.",
      "mission": "Livrer un notebook de transformation de pixels avec trois cas de test et une figure avant/après.",
      "validation": "Le script gère des pixels noirs, moyens et presque blancs sans débordement.",
      "quiz": {
        "question": "Pourquoi convertir en int16 avant l’addition ?",
        "options": [
          "Pour éviter un débordement uint8",
          "Pour obtenir des couleurs RGB",
          "Pour redimensionner"
        ],
        "correct": 0,
        "explanation": "uint8 ne représente que 0 à 255 ; une addition non contrôlée peut déborder."
      },
      "codeLanguage": "python"
    },
    {
      "id": "opencv-couleurs",
      "title": "OpenCV, lecture d’images et espaces colorimétriques",
      "objective": "Lire, afficher, sauvegarder et convertir correctement une image.",
      "concept": "OpenCV lit habituellement les images couleur en BGR, alors que Matplotlib attend du RGB. Une conversion incorrecte produit des couleurs trompeuses. Les espaces HSV isolent séparément teinte, saturation et luminosité, ce qui aide à segmenter certaines couleurs.",
      "points": [
        "Installation et import cv2",
        "imread, imwrite, imshow et waitKey",
        "BGR contre RGB et niveaux de gris",
        "HSV : hue, saturation et value",
        "Formats JPEG, PNG et TIFF",
        "Contrôle des dimensions, dtypes et valeurs"
      ],
      "example": "Créer une image BGR synthétique puis afficher correctement les couleurs dans Matplotlib.",
      "code": "import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\nbgr = np.zeros((80,180,3),dtype=np.uint8)\nbgr[:,:60] = (255,0,0)   # Bleu en BGR\nbgr[:,60:120] = (0,255,0)\nbgr[:,120:] = (0,0,255) # Rouge en BGR\nrgb = cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)\ngray = cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY)\nfig,axes = plt.subplots(1,2,figsize=(8,3))\naxes[0].imshow(rgb); axes[1].imshow(gray,cmap=\"gray\")\nfor a in axes: a.axis(\"off\")\nplt.show()",
      "result": "La conversion BGR→RGB évite l’inversion du rouge et du bleu lors de l’affichage.",
      "instructions": "Enregistre l’image en PNG avec cv2.imwrite. Relis-la et vérifie sa taille ; puis convertis-la en HSV.",
      "mission": "Créer un convertisseur avec contrôle des entrées, aperçu et sauvegarde de l’image traitée.",
      "validation": "L’image enregistrée conserve ses canaux et ses dimensions.",
      "quiz": {
        "question": "Pourquoi convertir BGR vers RGB avant plt.imshow ?",
        "options": [
          "Pour augmenter la résolution",
          "Pour respecter l’ordre de canaux de Matplotlib",
          "Pour supprimer le bruit"
        ],
        "correct": 1,
        "explanation": "OpenCV lit en BGR ; Matplotlib affiche généralement des canaux RGB."
      },
      "codeLanguage": "python"
    },
    {
      "id": "contraste-histogrammes",
      "title": "Luminosité, contraste, histogrammes et CLAHE",
      "objective": "Identifier et corriger les contrastes faibles d’une image.",
      "concept": "Un histogramme compte les pixels par niveau d’intensité. Étendre les valeurs sur une plus grande plage augmente le contraste, mais peut saturer les extrêmes. L’égalisation globale agit sur toute l’image ; CLAHE limite localement l’amplification du contraste.",
      "points": [
        "Intensité et dynamique",
        "Histogramme et distribution de niveaux",
        "Correction affine : a×I+b",
        "Normalisation et clipping",
        "Correction gamma",
        "Égalisation, CLAHE et limites"
      ],
      "example": "Une scène ayant des niveaux compris entre 90 et 140 paraît terne ; on peut étendre ces valeurs.",
      "code": "import numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\nbase = np.tile(np.linspace(90,140,256,dtype=np.uint8),(128,1))\nclahe = cv2.createCLAHE(clipLimit=2.0,tileGridSize=(8,8))\ncorrigee = clahe.apply(base)\nfig,axes = plt.subplots(2,2,figsize=(9,5))\naxes[0,0].imshow(base,cmap=\"gray\",vmin=0,vmax=255)\naxes[0,1].imshow(corrigee,cmap=\"gray\",vmin=0,vmax=255)\naxes[1,0].hist(base.ravel(),bins=32,range=(0,256))\naxes[1,1].hist(corrigee.ravel(),bins=32,range=(0,256))\nplt.tight_layout();plt.show()",
      "result": "L’histogramme montre la plage d’intensité utilisée ; l’amélioration de contraste doit être jugée avec les détails et les artefacts.",
      "instructions": "Teste clipLimit=1 et 4 ; compare l’apparition de zones artificiellement accentuées.",
      "mission": "Améliorer trois images peu contrastées et présenter une comparaison justifiée.",
      "validation": "Chaque exemple a la même échelle, un histogramme et un commentaire sur les pertes possibles.",
      "quiz": {
        "question": "Un contraste plus fort garantit-il une meilleure image ?",
        "options": [
          "Oui, toujours",
          "Non, il peut accentuer le bruit et saturer",
          "Oui si l’image est grande"
        ],
        "correct": 1,
        "explanation": "L’amélioration dépend de la tâche et des détails que l’on cherche à préserver."
      },
      "codeLanguage": "python"
    },
    {
      "id": "convolution",
      "title": "Convolution 2D et filtres spatiaux",
      "objective": "Comprendre les noyaux avant d’appeler les fonctions de filtrage.",
      "concept": "La convolution remplace la valeur de chaque pixel par une combinaison de ses voisins pondérés par un noyau. Les filtres de moyenne lissent ; certains noyaux renforcent les détails. La taille du noyau, la normalisation et le traitement des bords changent le résultat.",
      "points": [
        "Voisinage et kernel",
        "Calcul manuel d’un produit/somme locale",
        "Convolution 2D et padding",
        "Filtre moyenneur et gaussien",
        "Noyau de netteté",
        "Compromis lissage/préservation des contours"
      ],
      "example": "Appliquer une moyenne de voisinage 3 × 3 à un pixel très lumineux au milieu d’une image noire.",
      "code": "import numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\nimage = np.zeros((15,15),dtype=np.float32)\nimage[7,7]=1.\nnoyau = np.ones((3,3),dtype=np.float32)/9\nfiltre = cv2.filter2D(image,-1,noyau)\nprint(\"Centre:\",round(float(filtre[7,7]),3))\nfig,ax=plt.subplots(1,2)\nax[0].imshow(image,cmap=\"gray\",vmin=0,vmax=1)\nax[1].imshow(filtre,cmap=\"gray\",vmin=0,vmax=1)\nplt.show()",
      "result": "La valeur 1 se répartit sur neuf positions ; le centre vaut environ 0,111. La somme est conservée ici sans effet de bord.",
      "instructions": "Calcule à la main la valeur du centre puis essaye un noyau 5 × 5. Compare la netteté.",
      "mission": "Implémenter un filtre moyenneur simple et le comparer à cv2.filter2D sur une image test.",
      "validation": "Le calcul manuel correspond à la bibliothèque et la gestion des bords est décrite.",
      "quiz": {
        "question": "Que représente un noyau 3 × 3 ?",
        "options": [
          "Les neuf voisins et leurs poids",
          "Trois canaux RGB",
          "Une résolution de trois pixels"
        ],
        "correct": 0,
        "explanation": "Le noyau décrit les contributions d’un voisinage de neuf positions."
      },
      "codeLanguage": "python"
    },
    {
      "id": "bruit-debruitage",
      "title": "Bruit et débruitage",
      "objective": "Choisir un filtre selon la nature du bruit et mesurer le compromis.",
      "concept": "Les capteurs peuvent produire un bruit gaussien, impulsionnel ou lié à la faible luminosité. Un filtre médian corrige souvent efficacement les impulsions ; un filtre gaussien lisse mais peut détruire des traits fins. Une évaluation nécessite une image de référence ou des critères métier.",
      "points": [
        "Sources et modèles de bruit",
        "Bruit gaussien et sel-poivre",
        "Simulation reproductible",
        "Filtre gaussien, médian et bilatéral",
        "Préservation des contours",
        "MSE, PSNR et SSIM : sens et limites"
      ],
      "example": "Ajouter des impulsions à une image simple pour comparer la médiane et le gaussien.",
      "code": "import numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\nrng=np.random.default_rng(7)\nbase=np.full((120,160),100,dtype=np.uint8)\nbase[30:90,40:120]=210\nbruitee=base.copy()\nbruitee[rng.random(base.shape)<.08]=255\nmedian=cv2.medianBlur(bruitee,3)\ngauss=cv2.GaussianBlur(bruitee,(5,5),0)\nfor nom,im in [(\"Bruit\",bruitee),(\"Médian\",median),(\"Gaussien\",gauss)]:\n print(nom,\"MSE\",round(float(np.mean((im.astype(float)-base)**2)),2))\nfig,ax=plt.subplots(1,3,figsize=(10,3))\nfor a,im,nom in zip(ax,[bruitee,median,gauss],[\"Bruité\",\"Médian\",\"Gaussien\"]):\n a.imshow(im,cmap=\"gray\",vmin=0,vmax=255);a.set_title(nom);a.axis(\"off\")\nplt.show()",
      "result": "On peut comparer quantitativement les erreurs puisque la référence synthétique est connue. Un faible MSE ne résume pas tout l’intérêt d’une image.",
      "instructions": "Remplace les impulsions par du bruit gaussien ; réévalue les filtres.",
      "mission": "Comparer trois stratégies sur un ensemble d’images et produire un rapport sur les pertes de détail.",
      "validation": "Les conditions de comparaison sont identiques et le critère sélectionné est expliqué.",
      "quiz": {
        "question": "Le filtre médian convient-il souvent au bruit impulsionnel ?",
        "options": [
          "Oui",
          "Non, seulement au RGB",
          "Il ne fonctionne que sur les vidéos"
        ],
        "correct": 0,
        "explanation": "La médiane élimine fréquemment les valeurs isolées extrêmes dans un voisinage."
      },
      "codeLanguage": "python"
    },
    {
      "id": "transformations",
      "title": "Recadrage et transformations géométriques",
      "objective": "Redresser, aligner et normaliser les images sans déformer les mesures.",
      "concept": "Les transformations modifient la position des pixels dans le plan image. Une rotation peut nécessiter de l’interpolation ; redimensionner sans conserver le ratio déforme les objets. Les mesures en pixels ne deviennent physiques qu’avec une calibration adaptée.",
      "points": [
        "Crop et régions d’intérêt",
        "Resize et rapport d’aspect",
        "Nearest, bilinear et bicubic",
        "Translation et rotation",
        "Transformations affine et perspective",
        "Repères, calibration et unités"
      ],
      "example": "Faire pivoter une forme simple autour de son centre pour observer l’interpolation.",
      "code": "import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\nimage=np.zeros((140,140),dtype=np.uint8)\ncv2.rectangle(image,(35,55),(105,85),255,-1)\nM=cv2.getRotationMatrix2D((70,70),30,1.0)\ntournee=cv2.warpAffine(image,M,(140,140),flags=cv2.INTER_LINEAR)\nfig,ax=plt.subplots(1,2)\nax[0].imshow(image,cmap=\"gray\");ax[1].imshow(tournee,cmap=\"gray\")\nplt.show()",
      "result": "Les bords diagonaux contiennent des niveaux intermédiaires : l’interpolation ne conserve pas toujours une image binaire.",
      "instructions": "Compare INTER_NEAREST et INTER_LINEAR ; repère les pixels de bord et explique lequel choisir pour un masque de segmentation.",
      "mission": "Produire un pipeline de redressement et consigner les paramètres géométriques.",
      "validation": "La transformation est reproductible et l’impact sur les mesures est discuté.",
      "quiz": {
        "question": "Quelle interpolation choisir pour redimensionner un masque de classes ?",
        "options": [
          "Bilinear par défaut",
          "Nearest-neighbor",
          "GaussianBlur"
        ],
        "correct": 1,
        "explanation": "Nearest-neighbor préserve les étiquettes discrètes des masques."
      },
      "codeLanguage": "python"
    },
    {
      "id": "contours-gradients",
      "title": "Gradients, Sobel et Canny",
      "objective": "Détecter les changements d’intensité et analyser les contours.",
      "concept": "Un contour correspond souvent à une variation locale d’intensité. Sobel approxime les dérivées horizontales et verticales. Canny combine lissage, gradients, amincissement et hystérésis de seuils. Les contours ne constituent pas automatiquement une segmentation complète.",
      "points": [
        "Gradient et dérivées discrètes",
        "Magnitude et direction des gradients",
        "Sobel et Laplacien",
        "Détecteur Canny et double seuil",
        "Lissage avant détection",
        "Transformée de Hough pour lignes/cercle"
      ],
      "example": "Détecter les contours d’une pièce géométrique sur fond sombre.",
      "code": "import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\nimage=np.zeros((140,180),dtype=np.uint8)\ncv2.rectangle(image,(35,30),(145,110),190,-1)\nimage=cv2.GaussianBlur(image,(3,3),0)\nsobel_x=cv2.Sobel(image,cv2.CV_64F,1,0,ksize=3)\nedges=cv2.Canny(image,50,150)\nfig,ax=plt.subplots(1,3,figsize=(11,3))\nfor a,im,t in zip(ax,[image,np.abs(sobel_x),edges],[\"Image\",\"Gradient X\",\"Canny\"]):\n a.imshow(im,cmap=\"gray\");a.set_title(t);a.axis(\"off\")\nplt.show()",
      "result": "Sobel X réagit aux variations horizontales ; Canny affiche les frontières détectées autour de la pièce.",
      "instructions": "Augmente les seuils Canny et observe quels contours disparaissent. Justifie ton choix selon la tâche.",
      "mission": "Détecter les bords d’une pièce mécanique et rapporter les zones de faux contours.",
      "validation": "L’image, les paramètres et les limites des contours sont documentés.",
      "quiz": {
        "question": "Canny renvoie-t-il directement une classification d’objets ?",
        "options": [
          "Oui, il nomme les objets",
          "Non, il renvoie des contours",
          "Oui, après BGR2RGB"
        ],
        "correct": 1,
        "explanation": "La détection de contours est une étape d’extraction, pas une reconnaissance sémantique."
      },
      "codeLanguage": "python"
    },
    {
      "id": "segmentation",
      "title": "Segmentation classique d’images",
      "objective": "Créer et interpréter des masques séparant objet et fond.",
      "concept": "Une segmentation attribue une classe à chaque pixel. Le seuillage global peut convenir à un éclairage stable ; Otsu cherche automatiquement un seuil séparant les classes d’intensité ; le seuillage adaptatif gère mieux certaines variations locales mais peut amplifier le bruit.",
      "points": [
        "Masques binaires et étiquettes",
        "Seuil fixe et effet du choix",
        "Otsu et histogrammes",
        "Seuillage adaptatif",
        "Segmentation par plages HSV",
        "Régions connexes et cas d’échec"
      ],
      "example": "Segmenter deux objets clairs dans une image bruitée.",
      "code": "import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\nrng=np.random.default_rng(10)\nimage=np.full((140,200),40,dtype=np.float32)\ncv2.circle(image,(60,70),35,180,-1)\ncv2.rectangle(image,(125,40),(180,105),210,-1)\nimage=np.clip(image+rng.normal(0,10,image.shape),0,255).astype(np.uint8)\nseuil,masque=cv2.threshold(image,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)\nprint(\"Seuil Otsu:\",seuil)\nfig,ax=plt.subplots(1,2)\nax[0].imshow(image,cmap=\"gray\");ax[1].imshow(masque,cmap=\"gray\")\nplt.show()",
      "result": "Les deux objets se détachent du fond dans le masque. La qualité dépend de la séparation réelle entre distributions d’intensité.",
      "instructions": "Compare avec un seuil fixe de 100 puis diminue le contraste des objets.",
      "mission": "Livrer trois masques de segmentation d’images différentes et diagnostiquer les erreurs.",
      "validation": "Les masques, les seuils et les régions problématiques sont affichés.",
      "quiz": {
        "question": "Que signifie un pixel blanc dans un masque binaire ?",
        "options": [
          "Toujours une vraie pièce",
          "Il appartient à la classe codée comme blanche",
          "Il est forcément saturé"
        ],
        "correct": 1,
        "explanation": "Le sens de blanc/noir dépend de la convention de classes choisie."
      },
      "codeLanguage": "python"
    },
    {
      "id": "morphologie",
      "title": "Morphologie mathématique et mesure d’objets",
      "objective": "Nettoyer les masques et obtenir des informations quantitatives.",
      "concept": "L’érosion retire des pixels aux régions, la dilatation en ajoute. Une ouverture élimine de petites composantes ; une fermeture peut combler de petites ruptures. Le choix de l’élément structurant doit respecter la géométrie des objets.",
      "points": [
        "Élément structurant et voisinage",
        "Érosion et dilatation",
        "Ouverture et fermeture",
        "Remplissage et trous",
        "Composantes connexes",
        "Contours, aire, périmètre, boîtes englobantes"
      ],
      "example": "Supprimer de petits pixels parasites autour d’un objet sans effacer l’objet principal.",
      "code": "import cv2\nimport numpy as np\nmasque=np.zeros((100,140),dtype=np.uint8)\ncv2.rectangle(masque,(30,25),(95,80),255,-1)\nmasque[8,7]=255;masque[90,125]=255\nkernel=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3))\nclean=cv2.morphologyEx(masque,cv2.MORPH_OPEN,kernel)\nnb,labels,stats,centres=cv2.connectedComponentsWithStats(clean)\nprint(\"Objets hors fond:\",nb-1)\nprint(\"Aire objet principal:\",int(stats[1,cv2.CC_STAT_AREA]))",
      "result": "Après l’ouverture, les pixels isolés disparaissent. L’étiquetage permet de compter les objets connexes et mesurer leur aire.",
      "instructions": "Teste un kernel 9 × 9 ; observe l’érosion potentielle des petits objets réels.",
      "mission": "Concevoir un compteur de pièces avec traitement du bruit et tableau de surfaces.",
      "validation": "Chaque objet détecté a une région, une aire et un compte vérifiables.",
      "quiz": {
        "question": "Une ouverture morphologique consiste à :",
        "options": [
          "Dilater puis éroder",
          "Éroder puis dilater",
          "Inverser les couleurs"
        ],
        "correct": 1,
        "explanation": "L’ouverture est une érosion suivie d’une dilatation avec l’élément structurant."
      },
      "codeLanguage": "python"
    },
    {
      "id": "fourier",
      "title": "Fréquences spatiales et transformée de Fourier",
      "objective": "Interpréter un spectre et filtrer des structures périodiques.",
      "concept": "La transformée de Fourier 2D décompose l’image en composantes spatiales de fréquences différentes. Les fréquences basses traduisent les variations lentes, les hautes fréquences contiennent détails mais aussi bruit. Un masque fréquentiel mal choisi crée des artefacts.",
      "points": [
        "Fréquences spatiales basses et hautes",
        "Fourier 2D et FFT",
        "Spectre d’amplitude et fftshift",
        "Filtres passe-bas et passe-haut",
        "Réduction du bruit périodique",
        "Artefacts et reconstruction inverse"
      ],
      "example": "Créer une image composée d’un gradient et d’ondulations périodiques puis observer le spectre.",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\nx=np.arange(128)\nimage=np.tile((x/127*180 + 30*np.sin(2*np.pi*x/8)),(128,1))\nspectre=np.fft.fftshift(np.fft.fft2(image))\nlog_amp=np.log1p(np.abs(spectre))\nfig,ax=plt.subplots(1,2,figsize=(8,3))\nax[0].imshow(image,cmap=\"gray\")\nax[1].imshow(log_amp,cmap=\"magma\")\nplt.show()",
      "result": "Les pics symétriques hors du centre correspondent à la composante périodique ajoutée. Le centre rassemble les basses fréquences.",
      "instructions": "Change la période de 8 à 16 pixels et compare la distance des pics au centre.",
      "mission": "Éliminer un bruit périodique d’une image synthétique et comparer original, spectre, reconstruction.",
      "validation": "Le filtre préserve les éléments utiles et les artefacts sont commentés.",
      "quiz": {
        "question": "Dans un spectre centré, où apparaissent les basses fréquences ?",
        "options": [
          "Près du centre",
          "Uniquement aux coins",
          "Elles n’existent pas"
        ],
        "correct": 0,
        "explanation": "fftshift place les basses fréquences au voisinage du centre."
      },
      "codeLanguage": "python"
    },
    {
      "id": "video-mouvement",
      "title": "Vidéos et Background Subtraction",
      "objective": "Détecter le mouvement dans une séquence et annoter les frames.",
      "concept": "Une vidéo est une suite d’images avec une cadence temporelle. La soustraction de fond estime l’apparence statique et met en évidence les différences mobiles. Les changements d’éclairage et les ombres peuvent provoquer des faux positifs.",
      "points": [
        "Lecture de frames et FPS",
        "Contrôle d’échec de VideoCapture",
        "Différence de frames successives",
        "Background Subtraction MOG2",
        "Morphologie des masques de mouvement",
        "Contours, bounding boxes et suivi simple"
      ],
      "example": "Une petite forme se déplace sur un fond fixe. On veut détecter ses positions avec MOG2.",
      "code": "import cv2\nimport numpy as np\nfond = cv2.createBackgroundSubtractorMOG2(history=20,varThreshold=20,detectShadows=False)\nfor i in range(35):\n    frame=np.zeros((100,160,3),dtype=np.uint8)\n    cv2.circle(frame,(15+i*3,50),9,(255,255,255),-1)\n    mask=fond.apply(frame)\n    if i in (0,20,34):\n        print(\"Frame\",i,\"pixels en mouvement:\",int(np.count_nonzero(mask)))\n# Pour une vraie vidéo : cap=cv2.VideoCapture(\"video.mp4\")",
      "result": "Les premières frames servent à initialiser le modèle de fond. La détection évolue avec l’historique ; elle ne donne pas une identité d’objet.",
      "instructions": "Teste history=5 puis 40 et observe le nombre de pixels détectés. Ajoute un déplacement d’ombre artificiel.",
      "mission": "Livrer une vidéo annotée et des captures de frames avec les cas d’échec.",
      "validation": "Les paramètres, la cadence et les limites du détecteur sont consignés.",
      "quiz": {
        "question": "La soustraction de fond détecte-t-elle toujours correctement un objet immobile ?",
        "options": [
          "Oui",
          "Non, il peut être intégré au fond",
          "Seulement en RGB"
        ],
        "correct": 1,
        "explanation": "Un objet devenu stable peut être absorbé par le modèle de fond."
      },
      "codeLanguage": "python"
    },
    {
      "id": "evaluation",
      "title": "Mesurer la qualité : PSNR, SSIM, IoU et Dice",
      "objective": "Comparer des méthodes avec une référence et des métriques adaptées.",
      "concept": "Les mesures de qualité d’image évaluent la fidélité à une référence : MSE et PSNR quantifient les erreurs d’intensité ; SSIM compare structure et contraste. Pour les masques, IoU et Dice mesurent le recouvrement. Une mesure élevée ne suffit pas à prouver l’aptitude métier.",
      "points": [
        "Ground truth et annotation",
        "MSE et PSNR, échelle des pixels",
        "SSIM et structure",
        "Intersection, union et IoU",
        "Coefficient Dice",
        "Faux positifs et faux négatifs",
        "Validation sur images inédites"
      ],
      "example": "Deux masques ont des pixels en commun mais ne couvrent pas exactement la même zone.",
      "code": "import numpy as np\nref=np.array([[1,1,0],[0,1,0]],dtype=bool)\npred=np.array([[1,0,0],[0,1,1]],dtype=bool)\ninter=np.logical_and(ref,pred).sum()\nunion=np.logical_or(ref,pred).sum()\niou=inter/union if union else 1.0\ndice=2*inter/(ref.sum()+pred.sum()) if ref.sum()+pred.sum() else 1.0\nprint(\"IoU:\",round(iou,3),\"Dice:\",round(dice,3))",
      "result": "Deux pixels sont communs et quatre figurent dans l’union : IoU=0,50 ; Dice≈0,667. Les scores doivent être calculés sur le même référentiel.",
      "instructions": "Modifie un pixel faux positif puis un faux négatif. Prédit le sens de variation des scores avant l’exécution.",
      "mission": "Comparer deux pipelines sur le même jeu test, avec tableau de métriques et exemples d’erreurs.",
      "validation": "Les résultats, unités, référence et cas de masques vides sont traités.",
      "quiz": {
        "question": "Un score IoU de 1 signifie :",
        "options": [
          "Aucun recouvrement",
          "Une intersection égale à l’union",
          "Une image sans bruit"
        ],
        "correct": 1,
        "explanation": "Les ensembles de pixels positifs sont alors identiques."
      },
      "codeLanguage": "python"
    },
    {
      "id": "pipeline-industrie",
      "title": "Livrer un pipeline de traitement d’images",
      "objective": "Assembler une chaîne reproductible et documentée pour une équipe technique.",
      "concept": "Un pipeline professionnel sépare acquisition, validation, prétraitement, extraction, mesures et évaluation. Les paramètres sont centralisés ; chaque étape a un résultat contrôlable ; les erreurs sont gérées. Le livrable inclut tests, README, limitations et démonstration.",
      "points": [
        "Cahier des charges, objectif mesurable et exemple de référence",
        "Modulariser la chaîne en fonctions",
        "Validation des entrées et des paramètres",
        "Traitement par lot et suivi des erreurs",
        "Tests reproductibles et jeux de référence",
        "Documentation, Git et restitution au tuteur"
      ],
      "example": "Identifier automatiquement des objets clairs sur fond sombre, nettoyer le masque et compter les composantes.",
      "code": "import cv2\nimport numpy as np\n\ndef compter_objets(image_gris, seuil=110):\n    if image_gris is None or image_gris.ndim != 2:\n        raise ValueError(\"Une image 2D est attendue\")\n    masque=(image_gris>=seuil).astype(np.uint8)*255\n    noyau=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3))\n    masque=cv2.morphologyEx(masque,cv2.MORPH_OPEN,noyau)\n    nb,_=cv2.connectedComponents(masque)\n    return nb-1,masque\n\nimage=np.zeros((100,140),dtype=np.uint8)\ncv2.circle(image,(35,45),12,200,-1)\ncv2.circle(image,(100,50),14,200,-1)\nnb,masque=compter_objets(image)\nassert nb==2\nprint(\"Objets détectés:\",nb)",
      "result": "L’image de test contient deux objets et le pipeline en retrouve deux. Un résultat synthétique favorable ne garantit pas la robustesse sur des données réelles.",
      "instructions": "Introduis du bruit, change l’éclairage et mesure quand le comptage échoue. Ajoute deux assertions utiles.",
      "mission": "Livrer notebook, script Python réutilisable, tests, images d’exemple et rapport comparatif de qualité.",
      "validation": "Une autre personne peut exécuter le projet, retrouver les résultats et connaître les cas non couverts.",
      "quiz": {
        "question": "Quel est l’objectif de l’étape ?",
        "options": [
          "Produire un résultat non vérifié",
          "Comprendre, vérifier et expliquer le traitement",
          "Masquer les défauts de l’image"
        ],
        "correct": 1,
        "explanation": "On recherche une transformation justifiée et reproductible."
      },
      "codeLanguage": "python"
    }
  ]
};
