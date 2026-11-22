import type {DeepConceptArticle} from './deepConceptTypes';
export const opencvConceptBasics:DeepConceptArticle[] = [
  {
    "slug": "opencv-introduction",
    "pointIndex": 0,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "What is OpenCV in Python? A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "OpenCV est une bibliothèque libre pour la vision par ordinateur et le traitement d'images. Elle permet de charger, afficher, transformer et analyser des photographies ou des vidéos, avant même l'utilisation de modèles de machine learning.",
        "Ce guide présente son rôle concret dans une chaîne d'inspection, son lien avec NumPy, les principales familles d'opérations et un mini-pipeline reproductible avec une image synthétique."
      ],
      "tldr": [
        "OpenCV signifie Open Source Computer Vision Library ; en Python, elle est importée sous le nom cv2.",
        "Une image OpenCV est généralement un ndarray NumPy ; on peut donc utiliser les opérations NumPy pour examiner ses dimensions et ses pixels.",
        "Les fonctions OpenCV couvrent la lecture et l'écriture d'images, la conversion des couleurs, les filtres, les contours, les transformations et les vidéos."
      ],
      "sections": [
        {
          "id": "role",
          "title": "What is OpenCV Used For?",
          "paragraphs": [
            "OpenCV fournit des fonctions optimisées pour préparer et analyser les images. On l'utilise en robotique, analyse de documents, contrôle qualité et vision classique avant de recourir à des modèles apprenants.",
            "Dans une inspection industrielle, l'image d'une pièce peut être transformée en gris, débruitée puis analysée par contours ou segmentation pour mesurer une zone."
          ],
          "code": "import cv2\nprint(cv2.__name__)\nprint(hasattr(cv2,\"cvtColor\"))",
          "language": "python",
          "output": "cv2\nTrue",
          "interpretation": "Le nom du module Python est cv2. La fonction cvtColor est disponible pour convertir les espaces de couleurs."
        },
        {
          "id": "numpy",
          "title": "How OpenCV Relates to NumPy",
          "paragraphs": [
            "Un pixel est représenté par un ou plusieurs nombres. Une image en niveaux de gris est une matrice 2D, une image couleur est souvent une matrice 3D (hauteur, largeur, canaux).",
            "Une photographie peut être inspectée avec .shape, .dtype et une indexation ligne/colonne. C'est la raison pour laquelle NumPy constitue une base essentielle d'OpenCV."
          ],
          "code": "import numpy as np\nimage=np.zeros((4,6,3),dtype=np.uint8)\nprint(image.shape)\nprint(image.dtype)\nprint(image[0,0])",
          "language": "python",
          "output": "(4, 6, 3)\nuint8\n[0 0 0]",
          "interpretation": "Les quatre lignes et six colonnes portent trois canaux par pixel. Les intensités nulles forment du noir."
        },
        {
          "id": "process",
          "title": "The Classical Image Processing Pipeline",
          "paragraphs": [
            "Une chaîne simple peut suivre les étapes : acquérir → contrôler → convertir → filtrer → détecter → mesurer. Chaque étape modifie ou résume une représentation de l'image.",
            "Il faut comparer le résultat à l'image initiale pour vérifier que le débruitage n'a pas effacé des détails importants ou que le seuil n'a pas supprimé les objets utiles."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((50,50,3),dtype=np.uint8)\ncv2.rectangle(image,(10,10),(40,40),(255,255,255),-1)\ngris=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)\ncontours=cv2.Canny(gris,50,150)\nprint(gris.shape, int(np.count_nonzero(contours))>0)",
          "language": "python",
          "output": "(50, 50) True",
          "interpretation": "Le rectangle blanc sur fond noir produit des changements d'intensité détectés par Canny. La matrice grise a un seul canal."
        },
        {
          "id": "applications",
          "title": "Classical Vision, Machine Learning and Deep Learning",
          "paragraphs": [
            "En vision classique, les fonctions OpenCV peuvent suffire pour compter des objets simples ou mesurer des formes. En machine learning, elles peuvent préparer des caractéristiques. En deep learning, elles préparent souvent les images avant l'inférence.",
            "OpenCV ne constitue pas à lui seul un réseau de neurones. Il est possible de l'utiliser sans apprentissage, puis de le combiner avec PyTorch ou un autre framework."
          ],
          "code": "import cv2\nimport numpy as np\nimg=np.zeros((28,28),dtype=np.uint8)\ncv2.circle(img,(14,14),6,255,-1)\nmasque=(img>100).astype(np.uint8)\nprint(\"Pixels objet :\",int(masque.sum()))",
          "language": "python",
          "output": "Pixels objet : 113",
          "interpretation": "Le masque compte les pixels du disque synthétique dessiné par OpenCV. Il illustre un comptage classique sans modèle appris."
        },
        {
          "id": "pipeline",
          "title": "Mini-project: Inspect a Synthetic Part",
          "paragraphs": [
            "Construis une image simple, applique un filtre et extrait une carte de contours. Cette expérimentation autonome ne dépend d'aucune photographie externe et permet de comprendre les résultats avant d'utiliser une caméra réelle.",
            "Sur des images industrielles, le choix des paramètres doit être validé sur plusieurs scènes et conditions d'éclairage, pas seulement sur une image réussie."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((80,80),dtype=np.uint8)\ncv2.rectangle(image,(15,15),(65,65),200,-1)\nlisse=cv2.GaussianBlur(image,(5,5),0)\ncontours=cv2.Canny(lisse,50,150)\nprint(image.shape)\nprint(\"Contours présents :\",bool(np.any(contours)))",
          "language": "python",
          "output": "(80, 80)\nContours présents : True",
          "interpretation": "L'image conserve sa taille. Les pixels de contour signalent les transitions d'intensité après lissage."
        },
        {
          "id": "practice",
          "title": "How to Learn OpenCV Efficiently",
          "paragraphs": [
            "Prends une photographie et conserve des sorties intermédiaires : originale, gris, floue, contours. N'applique pas plusieurs filtres sans savoir ce que chacun change.",
            "Lorsque tu maîtrises la lecture et les représentations, tu peux aborder la segmentation, la morphologie, l'analyse vidéo et les mesures d'évaluation."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((20,20),dtype=np.uint8)\nimage[5:15,5:15]=255\nprint(\"Intensité max :\",image.max())\nprint(\"Aire seuillée :\",np.count_nonzero(image>127))",
          "language": "python",
          "output": "Intensité max : 255\nAire seuillée : 100",
          "interpretation": "Le carré 10×10 contient 100 pixels blancs. Vérifie ce résultat manuellement : 10 lignes × 10 colonnes."
        }
      ],
      "mistakes": [
        "Confondre OpenCV avec un framework de deep learning.",
        "Oublier la représentation NumPy de l'image et les conventions des canaux.",
        "Appliquer un traitement sans comparer au résultat original.",
        "Conclure à partir d'une seule image de test.",
        "Supposer qu'un pixel a des dimensions physiques sans calibration."
      ],
      "conclusion": [
        "OpenCV fournit le socle des opérations de traitement d'images. Tu sais maintenant comment il s'intègre dans un pipeline et pourquoi NumPy est indispensable pour représenter les pixels.",
        "Le cours suivant traite l'installation puis la lecture et l'enregistrement d'images. Tu pourras ensuite construire un pipeline industriel complet."
      ],
      "faq": [
        {
          "question": "What is OpenCV?",
          "answer": "Une bibliothèque open source de vision et de traitement d'images."
        },
        {
          "question": "Why is OpenCV called cv2 in Python?",
          "answer": "cv2 est le nom historique de son interface Python."
        },
        {
          "question": "Do I need machine learning to use OpenCV?",
          "answer": "Non. La lecture, le filtrage, le seuillage et les contours fonctionnent sans modèle appris."
        },
        {
          "question": "What is the connection between OpenCV and NumPy?",
          "answer": "Les images OpenCV sont généralement des tableaux NumPy, permettant l'accès direct aux pixels et dimensions."
        },
        {
          "question": "What can OpenCV do in industry?",
          "answer": "Préparer des images, isoler des régions, détecter des contours, mesurer des caractéristiques et analyser des vidéos."
        }
      ]
    }
  },
  {
    "slug": "opencv-installation",
    "pointIndex": 0,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "Installing OpenCV in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Avant d'utiliser OpenCV, il faut l'installer dans le bon environnement Python. Plusieurs distributions existent : opencv-python pour les applications locales, opencv-python-headless pour les serveurs et opencv-contrib-python pour des modules additionnels.",
        "Cet article explique comment choisir une variante, vérifier l'import cv2, diagnostiquer les erreurs d'environnement et tester les premières fonctions sans fichier externe."
      ],
      "tldr": [
        "Dans le terminal, utilise python -m pip install opencv-python pour installer la bibliothèque dans l'environnement ciblé.",
        "opencv-python-headless évite les dépendances d'interface graphique pour les serveurs. Choisis la variante adaptée à l'environnement, sans multiplier les distributions concurrentes.",
        "Après l'installation, vérifie import cv2, cv2.__version__ et un exemple de lecture ou de création d'image."
      ],
      "sections": [
        {
          "id": "variants",
          "title": "Which OpenCV Package Should You Choose?",
          "paragraphs": [
            "opencv-python contient les fonctions habituelles et les composants d'interface disponibles selon la plateforme. opencv-python-headless convient à des environnements sans affichage local comme certains serveurs et notebooks hébergés.",
            "opencv-contrib-python fournit des modules additionnels. Évite d'installer plusieurs variantes principales dans le même environnement Python, car elles partagent l'espace de noms cv2."
          ],
          "code": "import sys\nprint(\"Interpréteur :\",sys.executable)\n# Terminal : python -m pip install opencv-python",
          "language": "python",
          "output": "Le chemin de l'interpréteur Python actif s'affiche.",
          "interpretation": "Connaître l'interpréteur aide à comprendre où le package doit être installé."
        },
        {
          "id": "pip",
          "title": "Installing with pip",
          "paragraphs": [
            "La commande python -m pip utilise le module pip associé à l'interpréteur choisi. Cela limite les confusions lorsqu'un ordinateur possède plusieurs versions de Python.",
            "Dans Jupyter, utilise %pip install ... pour installer dans l'environnement du noyau, puis redémarre le noyau si nécessaire."
          ],
          "code": "# Commande à exécuter dans le terminal :\n# python -m pip install opencv-python numpy matplotlib\nimport cv2\nprint(\"cv2 importé\")",
          "language": "python",
          "output": "cv2 importé",
          "interpretation": "L'import fonctionne lorsque le package est installé dans l'environnement qui exécute cette cellule."
        },
        {
          "id": "verify",
          "title": "Checking the Installed Version",
          "paragraphs": [
            "La propriété cv2.__version__ renvoie le numéro de version. Une vérification de fonction comme hasattr(cv2,'resize') confirme également la présence de l'API attendue.",
            "Une version présente ne signifie pas que tous les fichiers ou caméras seront accessibles : les entrées et ressources doivent toujours être vérifiées séparément."
          ],
          "code": "import cv2\nprint(\"Version :\",cv2.__version__)\nprint(\"Resize disponible :\",hasattr(cv2,\"resize\"))",
          "language": "python",
          "output": "Une version OpenCV apparaît et Resize disponible : True.",
          "interpretation": "Le numéro précis dépend de l'installation. Il est utile de le documenter lorsque tu transmets un notebook."
        },
        {
          "id": "test",
          "title": "Creating a Synthetic Image as an Installation Test",
          "paragraphs": [
            "Pour tester OpenCV sans dépendre d'un téléchargement, crée une image NumPy vide puis dessine un objet avec cv2.rectangle. Tu peux ensuite l'enregistrer dans un fichier PNG.",
            "Cette méthode permet de distinguer un problème d'installation d'un problème de fichier d'entrée absent."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((64,64,3),dtype=np.uint8)\ncv2.rectangle(image,(12,12),(52,52),(0,255,0),-1)\nprint(image.shape)\nprint(int(image[30,30,1]))",
          "language": "python",
          "output": "(64, 64, 3)\n255",
          "interpretation": "Le pixel central possède une composante verte de 255 selon l'ordre BGR utilisé par OpenCV."
        },
        {
          "id": "errors",
          "title": "ModuleNotFoundError and Display Errors",
          "paragraphs": [
            "Si import cv2 provoque ModuleNotFoundError, l'installation a peut-être été réalisée dans un autre environnement. Vérifie sys.executable et la commande pip associée.",
            "Sur des serveurs ou notebooks sans interface graphique, cv2.imshow peut échouer même lorsque OpenCV est bien installé. Utilise Matplotlib pour visualiser l'image ou enregistre-la avec imwrite."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((10,10),dtype=np.uint8)\nok=cv2.imwrite(\"test_opencv.png\",image)\nprint(ok)",
          "language": "python",
          "output": "True, si l'environnement autorise l'écriture du fichier.",
          "interpretation": "imwrite signale la réussite de l'écriture avec un booléen. L'absence de fenêtre graphique n'empêche pas le traitement de l'image."
        },
        {
          "id": "environment",
          "title": "Professional Reproducibility and Dependencies",
          "paragraphs": [
            "Un projet de stage doit préciser les versions des dépendances et la procédure d'installation. Le code doit être exécuté dans le même environnement que celui utilisé pendant les tests.",
            "Évite de conserver des fichiers d'installation non maîtrisés ou des versions contradictoires. Un petit README et un fichier requirements.txt facilitent la reproduction par un tuteur."
          ],
          "code": "import cv2,numpy as np\nprint(\"OpenCV :\",cv2.__version__)\nprint(\"NumPy :\",np.__version__)",
          "language": "python",
          "output": "Les versions installées des deux bibliothèques s'affichent.",
          "interpretation": "Le rapport de versions complète les instructions d'installation et aide à diagnostiquer des différences de comportement."
        }
      ],
      "mistakes": [
        "Installer une version d'OpenCV dans un interpréteur et exécuter Jupyter avec un autre.",
        "Installer simultanément plusieurs distributions OpenCV concurrentes.",
        "Confondre import cv2 et le nom du package pip opencv-python.",
        "Utiliser cv2.imshow dans un environnement sans interface graphique.",
        "Diagnostiquer un fichier d'image introuvable comme une erreur d'installation d'OpenCV."
      ],
      "conclusion": [
        "Tu sais maintenant installer et vérifier OpenCV, choisir une variante adaptée à ton environnement et diagnostiquer les problèmes d'import ou d'affichage.",
        "Tu peux passer à l'enseignement de la lecture et de l'enregistrement des images, puis aux conversions et transformations des pixels."
      ],
      "faq": [
        {
          "question": "How do I install OpenCV in Python?",
          "answer": "Exécute python -m pip install opencv-python dans l'environnement où tu travailles."
        },
        {
          "question": "What is cv2?",
          "answer": "Le nom du module Python de la bibliothèque OpenCV."
        },
        {
          "question": "What is opencv-python-headless?",
          "answer": "Une distribution adaptée aux environnements sans interface d'affichage locale."
        },
        {
          "question": "Why does import cv2 fail after installation?",
          "answer": "L'installation a souvent été effectuée dans un autre environnement Python ou noyau Jupyter."
        },
        {
          "question": "Why can imshow fail on a server?",
          "answer": "Il nécessite des fonctions d'interface graphique qui peuvent être absentes d'un environnement headless."
        }
      ]
    }
  },
  {
    "slug": "opencv-loading",
    "pointIndex": 1,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "Reading and Saving Images with OpenCV: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "La première tâche d'un pipeline d'images consiste à lire correctement un fichier, contrôler ses dimensions et son type, puis enregistrer le résultat dans un format adapté.",
        "Ce guide explique cv2.imread, les options de lecture, les erreurs de chemin, cv2.imwrite, l'ordre des dimensions et la différence entre afficher une image et la sauvegarder."
      ],
      "tldr": [
        "cv2.imread('photo.jpg') renvoie généralement un ndarray NumPy, ou None lorsque l'image ne peut pas être lue.",
        "Les attributs shape et dtype permettent de contrôler les dimensions et le type. L'indexation image[ligne,colonne] lit un pixel.",
        "cv2.imwrite enregistre une image sur disque ; l'affichage avec Matplotlib nécessite une conversion BGR vers RGB pour les images couleur."
      ],
      "sections": [
        {
          "id": "imread",
          "title": "Reading an Image with cv2.imread",
          "paragraphs": [
            "imread lit les données d'un fichier et les décode. En mode couleur, le résultat est en général une matrice de forme (hauteur, largeur, 3) en BGR.",
            "La présence du fichier ne garantit pas son décodage : un format corrompu ou une image incompatible peut conduire à None. Vérifie systématiquement la sortie."
          ],
          "code": "import cv2\nimage=cv2.imread(\"photo.jpg\")\nif image is None:\n    print(\"photo.jpg absent ou illisible\")\nelse:\n    print(image.shape)",
          "language": "python",
          "output": "Un avertissement si le fichier est absent ; sinon les dimensions réelles de l'image.",
          "interpretation": "Le test protège les étapes suivantes contre un accès à .shape sur None."
        },
        {
          "id": "modes",
          "title": "Colour vs Grayscale Reading Modes",
          "paragraphs": [
            "Le paramètre IMREAD_COLOR demande une image couleur, IMREAD_GRAYSCALE une image à un canal et IMREAD_UNCHANGED conserve davantage les caractéristiques du fichier lorsque c'est possible.",
            "Le choix du mode dépend du traitement : une analyse de couleurs exige les canaux, tandis qu'un filtre de contours peut travailler en niveaux de gris."
          ],
          "code": "import cv2\nimport numpy as np\ntest=np.zeros((8,12,3),dtype=np.uint8)\ncv2.imwrite(\"image_test.png\",test)\ngris=cv2.imread(\"image_test.png\",cv2.IMREAD_GRAYSCALE)\nprint(gris.shape)",
          "language": "python",
          "output": "(8, 12)",
          "interpretation": "Le mode grayscale produit une matrice 2D, contrairement au tableau source à trois canaux."
        },
        {
          "id": "shape",
          "title": "Understanding Shape and Pixel Coordinates",
          "paragraphs": [
            "Dans NumPy, les dimensions d'une image grise suivent (hauteur, largeur) ; une image couleur ajoute l'axe des canaux. Les indices commencent à 0 et s'écrivent image[y,x].",
            "Ne confonds pas cette convention avec l'API de cv2.resize, qui reçoit la taille souhaitée sous la forme (largeur, hauteur)."
          ],
          "code": "import numpy as np\nimage=np.zeros((480,640,3),dtype=np.uint8)\nprint(image.shape)\nprint(image[100,200])",
          "language": "python",
          "output": "(480, 640, 3)\n[0 0 0]",
          "interpretation": "La ligne 100 et la colonne 200 désignent un pixel noir synthétique. La forme décrit 480 lignes et 640 colonnes."
        },
        {
          "id": "imwrite",
          "title": "Saving a Processed Image with imwrite",
          "paragraphs": [
            "imwrite écrit l'image dans un fichier dont le format dépend généralement de l'extension. Il retourne un booléen indiquant si l'écriture a réussi.",
            "Lorsqu'une sortie est importante, vérifie le booléen, conserve un chemin explicite et évite d'écraser le fichier source sans sauvegarde."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.full((12,18),127,dtype=np.uint8)\nok=cv2.imwrite(\"sortie.png\",image)\nprint(ok)",
          "language": "python",
          "output": "True si la sauvegarde est autorisée.",
          "interpretation": "L'image grise contient les mêmes intensités partout. Le PNG conserve ces valeurs sans compression destructive."
        },
        {
          "id": "display",
          "title": "Displaying Images with OpenCV and Matplotlib",
          "paragraphs": [
            "Sur un ordinateur avec fenêtre graphique, cv2.imshow affiche l'image et cv2.waitKey gère les événements jusqu'à la fermeture. Dans Jupyter, Matplotlib est généralement plus pratique.",
            "Pour une image couleur lue avec OpenCV, Matplotlib attend habituellement RGB et non BGR. Une conversion explicite évite d'afficher des couleurs inversées."
          ],
          "code": "import cv2\nimport matplotlib.pyplot as plt\nimage=cv2.imread(\"photo.jpg\")\nif image is not None:\n    rgb=cv2.cvtColor(image,cv2.COLOR_BGR2RGB)\n    plt.imshow(rgb)\n    plt.axis(\"off\")\n    plt.show()",
          "language": "python",
          "output": "La photographie apparaît avec des couleurs correctes si le fichier est présent.",
          "interpretation": "Le code protège contre les chemins absents et convertit les canaux avant l'affichage avec Matplotlib."
        },
        {
          "id": "project",
          "title": "Professional Mini-project: Image Input Validation",
          "paragraphs": [
            "Définis une procédure de lecture qui refuse une image absente, vérifie la profondeur du type et conserve une copie du résultat. Un pipeline fiable doit diagnostiquer la source avant d'appliquer des transformations.",
            "Dans une inspection automatisée, affiche également la résolution, le nombre de canaux et l'heure d'acquisition lorsque ces informations sont disponibles."
          ],
          "code": "import cv2\nimport numpy as np\nsynthetique=np.zeros((60,90),dtype=np.uint8)\ncv2.imwrite(\"entree.png\",synthetique)\nimage=cv2.imread(\"entree.png\",cv2.IMREAD_GRAYSCALE)\nassert image is not None\nassert image.shape==(60,90)\nprint(image.shape,image.dtype)",
          "language": "python",
          "output": "(60, 90) uint8",
          "interpretation": "Le contrôle vérifie que le fichier attendu a pu être relu et qu'il correspond à la forme prévue."
        }
      ],
      "mistakes": [
        "Accéder à .shape sur None lorsque imread échoue.",
        "Confondre hauteur et largeur dans un ndarray.",
        "Afficher du BGR comme du RGB dans Matplotlib.",
        "Écraser un fichier original sans copie de sécurité.",
        "Supposer qu'un imwrite a réussi sans vérifier le booléen retourné."
      ],
      "conclusion": [
        "Tu sais maintenant lire, vérifier, afficher et enregistrer les images avec OpenCV. Les contrôles de chemin, dimensions, canaux et type doivent devenir des réflexes.",
        "La prochaine étape approfondit la représentation des couleurs et les conversions BGR, RGB et niveaux de gris."
      ],
      "faq": [
        {
          "question": "What does cv2.imread return?",
          "answer": "Un ndarray contenant l'image décodée, ou None lorsque la lecture échoue."
        },
        {
          "question": "What is the difference between IMREAD_COLOR and IMREAD_GRAYSCALE?",
          "answer": "Le premier demande une image couleur, le deuxième une image à un seul canal de niveaux de gris."
        },
        {
          "question": "Why does image.shape use height before width?",
          "answer": "Parce que la matrice NumPy suit les axes ligne puis colonne."
        },
        {
          "question": "What does cv2.imwrite return?",
          "answer": "Un booléen indiquant généralement si l'écriture de l'image a réussi."
        },
        {
          "question": "Why convert BGR to RGB for Matplotlib?",
          "answer": "Matplotlib interprète les trois canaux comme RGB, alors qu'OpenCV les stocke habituellement en BGR."
        }
      ]
    }
  }
];
