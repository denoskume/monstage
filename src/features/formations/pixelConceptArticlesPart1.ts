import type {DeepConceptArticle} from './deepConceptTypes';
export const pixelConceptArticlesPart1:DeepConceptArticle[] = [
  {
    "slug": "pixels-coordinates",
    "pointIndex": 0,
    "article": {
      "eyebrow": "IMAGE PROCESSING · FONDAMENTAUX",
      "title": "Pixels, Rows and Columns: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une image numérique est constituée de petites unités appelées pixels. Comprendre leurs coordonnées et la façon dont ils sont stockés permet d'effectuer les premiers calculs de traitement d'images sans apprendre immédiatement des algorithmes complexes.",
        "Dans cet article, tu apprendras ce que représente un pixel, comment accéder à ses coordonnées, pourquoi NumPy utilise (ligne, colonne) et comment sélectionner une région d'intérêt utile dans une mission d'inspection."
      ],
      "tldr": [
        "Un pixel est un échantillon spatial de l'image. Il peut contenir une seule intensité (gris) ou plusieurs composantes (couleurs).",
        "NumPy utilise image[ligne, colonne] : l'origine est en haut à gauche et les indices commencent à zéro. La ligne correspond à y, la colonne à x.",
        "Une région d'intérêt se découpe avec un slice. Il faut toujours vérifier les bornes, les dimensions et les unités de la mesure."
      ],
      "sections": [
        {
          "id": "pixel",
          "title": "What is a Pixel?",
          "paragraphs": [
            "Imagine un échiquier dont chaque case contient une valeur mesurant une intensité lumineuse. Dans une image numérique, chaque case correspond à un échantillon spatial, appelé pixel.",
            "Un pixel ne représente pas automatiquement un millimètre ou une surface physique connue. Pour établir une correspondance avec le monde réel, une calibration ou une métadonnée d'acquisition est nécessaire."
          ],
          "code": "import numpy as np\nimage=np.array([[0,50,100],[150,200,255]],dtype=np.uint8)\nprint(image)\nprint(image.size)",
          "language": "python",
          "output": "[[  0  50 100]\n [150 200 255]]\n6",
          "interpretation": "L'image comporte deux lignes et trois colonnes, soit six pixels. L'intensité varie de 0 (noir) à 255 (blanc)."
        },
        {
          "id": "origin",
          "title": "Image Coordinates and the Top-left Origin",
          "paragraphs": [
            "Dans une matrice NumPy, la première coordonnée désigne la ligne, et la deuxième la colonne. L'origine (0,0) se situe en haut à gauche, y augmente vers le bas et x augmente vers la droite.",
            "En géométrie, on rencontre souvent des points (x,y) ; pour accéder à un tableau d'image, on écrira généralement image[y,x]. Confondre les deux peut conduire à mesurer au mauvais endroit."
          ],
          "code": "import numpy as np\nimage=np.arange(12).reshape(3,4)\nx=2\ny=1\nprint(image[y,x])\nprint(image.shape)",
          "language": "python",
          "output": "6\n(3, 4)",
          "interpretation": "Le point x=2,y=1 correspond à la deuxième ligne et à la troisième colonne. Les indices commencent à zéro."
        },
        {
          "id": "color-pixel",
          "title": "One Pixel, Three Channels",
          "paragraphs": [
            "Une image en niveaux de gris possède une intensité par pixel. Une image couleur possède habituellement trois composantes numériques par pixel ; le tableau ajoute donc un troisième axe.",
            "La forme d'une image couleur est généralement (hauteur, largeur, canaux). OpenCV utilise souvent l'ordre BGR, tandis que Matplotlib attend RGB."
          ],
          "code": "import numpy as np\ngris=np.zeros((3,4),dtype=np.uint8)\ncouleur=np.zeros((3,4,3),dtype=np.uint8)\nprint(gris.shape)\nprint(couleur.shape)\nprint(couleur[1,2])",
          "language": "python",
          "output": "(3, 4)\n(3, 4, 3)\n[0 0 0]",
          "interpretation": "Le même nombre de positions spatiales existe dans les deux images. La couleur comporte trois valeurs par position."
        },
        {
          "id": "roi",
          "title": "Selecting a Region of Interest (ROI)",
          "paragraphs": [
            "Une région d'intérêt ou ROI est une partie de l'image sélectionnée pour une analyse. Elle peut isoler une pièce, un défaut ou une zone où une mesure est pertinente.",
            "Le slice image[y1:y2, x1:x2] exclut les bornes y2 et x2. Lorsque tu découpes une ROI, vérifie les dimensions et préserve les coordonnées d'origine si tu veux restituer une détection sur l'image complète."
          ],
          "code": "import numpy as np\nimage=np.arange(100).reshape(10,10)\nroi=image[2:5,4:8]\nprint(roi.shape)\nprint(roi[0,0])",
          "language": "python",
          "output": "(3, 4)\n24",
          "interpretation": "La ROI possède 3 lignes et 4 colonnes. Son premier pixel correspond à la position globale (ligne 2, colonne 4)."
        },
        {
          "id": "bounds",
          "title": "Checking Image Bounds Safely",
          "paragraphs": [
            "Un programme reçoit parfois des coordonnées hors du cadre d'image. Un indice trop grand déclenche IndexError, tandis qu'un slice hors borne peut simplement renvoyer une région tronquée.",
            "Pour un système automatique, contrôle explicitement les bornes et la taille minimale exigée avant de transmettre une ROI à un algorithme."
          ],
          "code": "import numpy as np\nimage=np.zeros((20,30),dtype=np.uint8)\ny,x=10,25\nvalid=(0<=y<image.shape[0]) and (0<=x<image.shape[1])\nprint(valid)\nif valid:\n    print(image[y,x])",
          "language": "python",
          "output": "True\n0",
          "interpretation": "La ligne 10 et la colonne 25 appartiennent à une image 20×30. Le pixel contient l'intensité 0."
        },
        {
          "id": "practice",
          "title": "Mini-project: Inspect the Centre of a Synthetic Image",
          "paragraphs": [
            "Crée une image 100×120, dessine un rectangle lumineux au centre, puis extrais une ROI. Avant d'exécuter, prédis les dimensions de la région et le nombre de pixels lumineux.",
            "Cette manipulation est une première version du contrôle d'une zone d'inspection fixe, fréquent dans les systèmes de vision industrielle."
          ],
          "code": "import numpy as np\nimage=np.zeros((100,120),dtype=np.uint8)\nimage[30:70,40:80]=200\nroi=image[30:70,40:80]\nprint(roi.shape)\nprint(np.count_nonzero(roi))",
          "language": "python",
          "output": "(40, 40)\n1600",
          "interpretation": "La ROI contient quarante lignes et quarante colonnes lumineuses, soit 1600 pixels. Il faudrait une calibration pour convertir cette aire en mm²."
        }
      ],
      "mistakes": [
        "Confondre x/y et ligne/colonne lorsque l'on indexe un ndarray.",
        "Compter les pixels à partir de 1 alors que les indices NumPy commencent à 0.",
        "Penser qu'un pixel correspond obligatoirement à une distance physique fixe.",
        "Oublier que la borne finale d'un slice est exclue.",
        "Mesurer une ROI tronquée sans vérifier si les limites dépassent la taille de l'image."
      ],
      "conclusion": [
        "Tu sais désormais décrire un pixel, accéder à ses coordonnées, distinguer les dimensions de l'image et extraire une région d'intérêt avec NumPy.",
        "Cette maîtrise est indispensable pour les filtres spatiaux, la segmentation et les mesures de régions dans OpenCV."
      ],
      "faq": [
        {
          "question": "What is a pixel?",
          "answer": "Un échantillon spatial numérique pouvant représenter une intensité ou plusieurs composantes de couleur."
        },
        {
          "question": "Where is the image origin in NumPy?",
          "answer": "Dans le coin supérieur gauche, à la position image[0,0]."
        },
        {
          "question": "How do I access the pixel at x,y?",
          "answer": "Généralement avec image[y,x], car la première dimension est la ligne."
        },
        {
          "question": "What is a region of interest?",
          "answer": "Une sous-partie de l'image choisie pour un traitement particulier."
        },
        {
          "question": "Does one pixel equal one millimetre?",
          "answer": "Non. La correspondance physique exige une calibration ou des informations d'acquisition."
        }
      ]
    }
  },
  {
    "slug": "images-signal-2d",
    "pointIndex": 1,
    "article": {
      "eyebrow": "IMAGE PROCESSING · FONDAMENTAUX",
      "title": "Images as Two-dimensional Signals: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une image est aussi un signal : elle décrit comment une intensité varie selon deux coordonnées spatiales. Comprendre cette représentation relie le traitement d'images à la théorie du signal étudiée en master.",
        "Dans cet article, nous construisons une image synthétique, examinons ses profils horizontaux et verticaux, repérons une transition d'intensité et préparons l'idée de gradient et de filtre spatial."
      ],
      "tldr": [
        "Une image grise peut être décrite comme I(y,x), une fonction échantillonnée sur une grille 2D de lignes et colonnes.",
        "Les variations locales d'intensité portent des informations sur les bords, les textures et les structures de la scène.",
        "Un profil horizontal ou vertical extrait une série 1D de la matrice, ce qui permet de relier image 2D et outils de signal classique."
      ],
      "sections": [
        {
          "id": "signal",
          "title": "What Makes an Image a Signal?",
          "paragraphs": [
            "Un signal associe une valeur à une coordonnée. Dans un signal temporel, cette coordonnée est souvent le temps ; dans une image, ce sont deux positions spatiales.",
            "Un pixel est un échantillon de cette fonction. Une caméra fournit un nombre fini de lignes et de colonnes, ce qui transforme une scène continue en valeurs discrètes manipulables."
          ],
          "code": "import numpy as np\nimage=np.zeros((4,6),dtype=np.uint8)\nimage[:,3:]=100\nprint(image.shape)\nprint(image[0])",
          "language": "python",
          "output": "(4, 6)\n[  0   0   0 100 100 100]",
          "interpretation": "Une frontière verticale sépare les intensités 0 et 100. Toutes les lignes possèdent ici le même profil horizontal."
        },
        {
          "id": "profile",
          "title": "Horizontal and Vertical Intensity Profiles",
          "paragraphs": [
            "Un profil horizontal fixe une ligne et suit les colonnes. Un profil vertical fixe une colonne et suit les lignes. Ces profils révèlent les transitions de luminosité dans une direction.",
            "Les profils sont utiles pour expliquer des bords simples, mais ne suffisent pas toujours à décrire des formes complexes ou des textures à plusieurs orientations."
          ],
          "code": "import numpy as np\nimage=np.array([[0,0,50],[0,50,100],[0,100,150]])\nprint(\"Horizontal :\",image[1,:])\nprint(\"Vertical :\",image[:,1])",
          "language": "python",
          "output": "Horizontal : [  0  50 100]\nVertical : [  0  50 100]",
          "interpretation": "Dans cette matrice, les deux profils croissent d'une manière identique, mais suivant deux directions spatiales différentes."
        },
        {
          "id": "edges",
          "title": "Intensity Changes and Discrete Gradients",
          "paragraphs": [
            "Un bord correspond souvent à une variation rapide d'intensité. Une première approximation du gradient horizontal est la différence entre deux colonnes consécutives.",
            "Cette différence est sensible au bruit : un pixel isolé très différent de ses voisins peut produire un fort gradient même s'il ne correspond pas à un bord réel de l'objet."
          ],
          "code": "import numpy as np\nligne=np.array([0,0,0,100,100],dtype=float)\nvariation=np.diff(ligne)\nprint(variation)",
          "language": "python",
          "output": "[  0.   0. 100.   0.]",
          "interpretation": "La plus forte variation apparaît entre les positions 2 et 3. C'est l'emplacement de la transition artificielle."
        },
        {
          "id": "neighbours",
          "title": "Neighbourhoods and Local Processing",
          "paragraphs": [
            "Un filtre spatial examine une fenêtre de pixels autour d'une position. Dans un voisinage 3×3, il peut calculer une moyenne, une médiane ou une opération de détection de bord.",
            "Près des limites de l'image, le voisinage peut dépasser la grille. Les bibliothèques utilisent différentes règles de padding ; elles peuvent produire des résultats différents sur les bords."
          ],
          "code": "import numpy as np\nimage=np.arange(25).reshape(5,5)\npatch=image[1:4,1:4]\nprint(patch)\nprint(patch.mean())",
          "language": "python",
          "output": "[[ 6  7  8]\n [11 12 13]\n [16 17 18]]\n12.0",
          "interpretation": "Le voisinage 3×3 centré autour de la valeur 12 possède une moyenne de 12 dans ce signal linéaire."
        },
        {
          "id": "sampling",
          "title": "Spatial Sampling and the Continuous Scene",
          "paragraphs": [
            "La scène optique est continue, mais une caméra mesure l'information sur une grille finie. Plus le pas d'échantillonnage spatial est grand, moins les petits détails peuvent être conservés.",
            "L'échantillonnage n'est pas la même chose que la quantification : le premier concerne la position des pixels, la seconde le nombre de niveaux possibles de leurs valeurs."
          ],
          "code": "import numpy as np\nhaute=np.arange(16).reshape(4,4)\nbasse=haute[::2,::2]\nprint(haute.shape)\nprint(basse)",
          "language": "python",
          "output": "(4, 4)\n[[ 0  2]\n [ 8 10]]",
          "interpretation": "Le sous-échantillonnage conserve une ligne et une colonne sur deux. Certaines informations originales ont été supprimées."
        },
        {
          "id": "project",
          "title": "Mini-project: Find a Bright Edge in a 2D Signal",
          "paragraphs": [
            "Crée une image contenant une zone lumineuse à droite et calcule la différence entre colonnes voisines. Repère la colonne où la transition est la plus grande.",
            "Teste ensuite une transition horizontale et une image avec un pixel de bruit isolé pour comprendre pourquoi un algorithme réel combine gradients et débruitage."
          ],
          "code": "import numpy as np\nimage=np.zeros((5,8),dtype=float)\nimage[:,4:]=120\ngrad_x=np.diff(image,axis=1)\nposition=np.unravel_index(np.argmax(np.abs(grad_x)),grad_x.shape)\nprint(position)\nprint(grad_x[position])",
          "language": "python",
          "output": "(0, 3)\n120.0",
          "interpretation": "La transition se situe entre les colonnes 3 et 4. Le premier maximum apparaît sur la ligne 0 car la frontière est identique dans toutes les lignes."
        }
      ],
      "mistakes": [
        "Confondre un signal spatial et un signal temporel.",
        "Supposer qu'un gradient élevé correspond toujours à un bord d'objet réel.",
        "Mesurer une transition sans tenir compte du bruit et de la résolution.",
        "Confondre sous-échantillonnage spatial et quantification des intensités.",
        "Oublier les conditions de bord lors d'un filtrage local."
      ],
      "conclusion": [
        "Tu sais maintenant décrire une image comme un signal 2D, extraire des profils 1D et expliquer pourquoi les gradients locaux peuvent révéler des transitions.",
        "Ces principes se retrouveront dans la convolution, les filtres Sobel, Canny et la transformée de Fourier 2D."
      ],
      "faq": [
        {
          "question": "Why is an image a 2D signal?",
          "answer": "Parce qu'elle associe une intensité à deux coordonnées spatiales."
        },
        {
          "question": "What is an intensity profile?",
          "answer": "Une suite de valeurs extraites le long d'une ligne ou d'une colonne de l'image."
        },
        {
          "question": "What is a discrete gradient?",
          "answer": "Une approximation de la variation locale du signal entre des échantillons voisins."
        },
        {
          "question": "Can noise create false edges?",
          "answer": "Oui. Une variation brutale due au bruit peut produire un gradient élevé."
        },
        {
          "question": "What is spatial sampling?",
          "answer": "La mesure du signal de scène sur une grille finie de positions de pixels."
        }
      ]
    }
  },
  {
    "slug": "image-resolution",
    "pointIndex": 2,
    "article": {
      "eyebrow": "IMAGE PROCESSING · FONDAMENTAUX",
      "title": "Image Resolution, Dimensions and Aspect Ratio: A Complete Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une caméra produit un nombre limité de pixels. Sa résolution définit le détail spatial que l'image peut conserver ; ses dimensions déterminent le nombre de lignes et de colonnes disponibles dans un algorithme.",
        "Ce cours explique largeur, hauteur, résolution, rapport d'aspect, redimensionnement, effet sur la géométrie et différence entre pixels et unités physiques."
      ],
      "tldr": [
        "Une image 640×480 contient 640 colonnes et 480 lignes, soit 307 200 pixels. En NumPy, sa forme grise est (480,640).",
        "Le rapport d'aspect est largeur / hauteur. Le modifier pendant un redimensionnement étire les objets et peut rendre une mesure géométrique incorrecte.",
        "Le nombre de pixels ne donne pas, à lui seul, la taille physique d'une pièce ni la distance réelle observée."
      ],
      "sections": [
        {
          "id": "dimensions",
          "title": "Width, Height and Pixel Count",
          "paragraphs": [
            "La largeur compte les colonnes et la hauteur les lignes. La résolution d'une image est souvent notée largeur × hauteur dans les spécifications des caméras, mais un ndarray utilise le sens inverse.",
            "Le nombre de pixels se calcule par largeur × hauteur. Une image couleur contient souvent trois valeurs par pixel, et son nombre d'éléments NumPy est donc plus élevé."
          ],
          "code": "import numpy as np\nlargeur,hauteur=640,480\ngris=np.zeros((hauteur,largeur),dtype=np.uint8)\nprint(gris.shape)\nprint(gris.size)\nprint(largeur/hauteur)",
          "language": "python",
          "output": "(480, 640)\n307200\n1.3333333333333333",
          "interpretation": "L'image contient 307 200 pixels et un rapport largeur/hauteur de 4:3."
        },
        {
          "id": "aspect",
          "title": "Understanding Aspect Ratio",
          "paragraphs": [
            "Le rapport d'aspect exprime la forme du cadre : 4:3, 16:9 ou d'autres proportions. Si une image 640×480 est transformée directement en 224×224, son rapport passe de 4:3 à 1:1.",
            "Cette transformation peut être acceptable pour certains modèles, mais elle déforme les objets. Pour les mesures de forme, privilégie un redimensionnement proportionnel et, si nécessaire, des marges."
          ],
          "code": "largeur,hauteur=640,480\nratio_original=largeur/hauteur\nratio_carre=224/224\nprint(round(ratio_original,3),ratio_carre)",
          "language": "python",
          "output": "1.333 1.0",
          "interpretation": "Le passage à un carré modifie les proportions. Il faut documenter l'impact sur les objets analysés."
        },
        {
          "id": "resize",
          "title": "Resizing Without Distorting Shapes",
          "paragraphs": [
            "Pour conserver le rapport d'aspect, choisis une dimension cible et calcule l'autre proportionnellement. OpenCV attend dans cv2.resize un tuple (largeur, hauteur).",
            "La taille réduite contient moins d'information spatiale. Une interpolation ne peut pas reconstruire des détails qui n'ont jamais été captés."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((480,640),dtype=np.uint8)\nnouvelle_largeur=320\nnouvelle_hauteur=round(image.shape[0]*nouvelle_largeur/image.shape[1])\nredimensionnee=cv2.resize(image,(nouvelle_largeur,nouvelle_hauteur))\nprint(redimensionnee.shape)",
          "language": "python",
          "output": "(240, 320)",
          "interpretation": "La largeur et la hauteur sont réduites de moitié ; le rapport 4:3 est conservé."
        },
        {
          "id": "memory",
          "title": "Resolution and Memory Usage",
          "paragraphs": [
            "Plus une image possède de pixels, plus son tableau prend de place en mémoire. Une image 8 bits en gris utilise un octet par pixel ; une image BGR 8 bits utilise généralement trois octets par pixel.",
            "Le coût réel d'un pipeline peut être plus élevé lorsqu'il conserve plusieurs copies, des tableaux flottants ou des images intermédiaires."
          ],
          "code": "import numpy as np\ngris=np.zeros((480,640),dtype=np.uint8)\ncouleur=np.zeros((480,640,3),dtype=np.uint8)\nprint(gris.nbytes)\nprint(couleur.nbytes)",
          "language": "python",
          "output": "307200\n921600",
          "interpretation": "La version couleur occupe ici trois fois la mémoire brute du tableau gris."
        },
        {
          "id": "physical",
          "title": "Pixel Coordinates vs Physical Units",
          "paragraphs": [
            "Un pixel est une unité de mesure numérique, pas une longueur physique. Pour obtenir des millimètres, il faut une calibration reliant les coordonnées image à la scène.",
            "En microscopie ou imagerie médicale, la taille du pixel peut être indiquée dans les métadonnées ; en robotique, la projection 3D vers 2D dépend de la caméra et de la géométrie."
          ],
          "code": "largeur_pixels=40\nmm_par_pixel=0.1   # Valeur fictive de calibration\nlargeur_mm=largeur_pixels*mm_par_pixel\nprint(largeur_mm)",
          "language": "python",
          "output": "4.0",
          "interpretation": "Une largeur de 40 pixels correspondrait à 4 mm seulement si la calibration fictive de 0,1 mm/pixel est valide pour cette image."
        },
        {
          "id": "practice",
          "title": "Mini-project: Letterbox an Image",
          "paragraphs": [
            "Dans un pipeline, on souhaite parfois adapter une image 640×480 à un cadre 224×224 sans déformation. Réduis proportionnellement puis ajoute des marges noires à la hauteur restante.",
            "Le résultat doit respecter la géométrie. Une annotation initiale en pixels doit également être transformée selon l'échelle et la marge appliquées."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.ones((480,640),dtype=np.uint8)*180\nred=cv2.resize(image,(224,168))\nresultat=cv2.copyMakeBorder(red,28,28,0,0,cv2.BORDER_CONSTANT,value=0)\nprint(resultat.shape)\nprint(resultat[0,0],resultat[100,100])",
          "language": "python",
          "output": "(224, 224)\n0 180",
          "interpretation": "La nouvelle image est carrée, mais le contenu conserve le rapport 4:3 à l'intérieur de marges hautes et basses."
        }
      ],
      "mistakes": [
        "Confondre la forme NumPy (H,W) avec la convention résolution W×H.",
        "Redimensionner une image rectangulaire vers un carré sans considérer la déformation.",
        "Confondre pixels et millimètres sans calibration.",
        "Réduire fortement la résolution puis supposer que les petits détails sont toujours détectables.",
        "Oublier l'effet des marges sur les coordonnées d'annotation."
      ],
      "conclusion": [
        "Tu sais maintenant contrôler les dimensions, calculer le nombre de pixels et préserver le rapport d'aspect pendant un redimensionnement.",
        "Ces connaissances sont indispensables pour la préparation des images avant les modèles CNN et pour les mesures géométriques en inspection."
      ],
      "faq": [
        {
          "question": "What is image resolution?",
          "answer": "Le nombre d'échantillons spatiaux de l'image, généralement décrit par sa largeur et sa hauteur en pixels."
        },
        {
          "question": "What does 640×480 mean?",
          "answer": "640 colonnes et 480 lignes, soit 307 200 pixels."
        },
        {
          "question": "What is aspect ratio?",
          "answer": "Le rapport entre la largeur et la hauteur de l'image."
        },
        {
          "question": "Why preserve aspect ratio?",
          "answer": "Pour éviter de déformer les formes et les mesures géométriques."
        },
        {
          "question": "Can pixels be converted directly to millimetres?",
          "answer": "Seulement si une calibration physique adaptée est connue."
        }
      ]
    }
  }
];
