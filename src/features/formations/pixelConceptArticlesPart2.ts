import type {DeepConceptArticle} from './deepConceptTypes';
export const pixelConceptArticlesPart2:DeepConceptArticle[] = [
  {
    "slug": "image-quantization",
    "pointIndex": 3,
    "article": {
      "eyebrow": "IMAGE PROCESSING · FONDAMENTAUX",
      "title": "Sampling, Bit Depth and Quantization: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une image numérique ne conserve pas une infinité de positions ni une infinité de niveaux de luminosité. L'échantillonnage spatial définit les positions mesurées, tandis que la quantification définit les intensités pouvant être stockées.",
        "Ce cours explore les bits par pixel, les niveaux d'intensité, la perte d'information lors des conversions, le clipping et leurs conséquences sur un pipeline de traitement d'images."
      ],
      "tldr": [
        "L'échantillonnage spatial sélectionne une grille de pixels ; la quantification transforme des intensités en un nombre fini de niveaux.",
        "Avec b bits, on dispose théoriquement de 2^b niveaux pour une composante entière non signée : 8 bits offrent 256 valeurs, de 0 à 255.",
        "Réduire la profondeur peut créer des paliers visibles. Les calculs doivent éviter le débordement et distinguer clipping, arrondi et conversion de type."
      ],
      "sections": [
        {
          "id": "sampling",
          "title": "Spatial Sampling: Where the Scene Is Measured",
          "paragraphs": [
            "La scène contient des variations spatiales continues, mais le capteur enregistre des intensités sur une grille finie. Cette discrétisation se nomme échantillonnage.",
            "Sous-échantillonner une image sans filtrage préalable peut provoquer des artefacts de repliement spectral, appelés aliasing, lorsque les structures sont plus fines que la grille restante."
          ],
          "code": "import numpy as np\nimage=np.arange(64).reshape(8,8)\nreduite=image[::2,::2]\nprint(image.shape)\nprint(reduite.shape)\nprint(reduite[0])",
          "language": "python",
          "output": "(8, 8)\n(4, 4)\n[0 2 4 6]",
          "interpretation": "On conserve une ligne et une colonne sur deux. La forme est divisée par quatre en nombre de pixels."
        },
        {
          "id": "bits",
          "title": "Bit Depth and the Number of Possible Intensities",
          "paragraphs": [
            "La profondeur en bits indique la quantité d'information utilisée pour coder une composante. Deux bits permettent quatre niveaux, quatre bits seize niveaux et huit bits deux cent cinquante-six niveaux.",
            "Une image d'un instrument scientifique peut conserver douze ou seize bits pour représenter une dynamique plus riche. Il faut choisir les conversions selon l'objectif et l'équipement."
          ],
          "code": "for bits in [2,4,8,16]:\n    print(bits,2**bits)",
          "language": "python",
          "output": "2 4\n4 16\n8 256\n16 65536",
          "interpretation": "Chaque bit supplémentaire double le nombre de niveaux représentables dans cette convention."
        },
        {
          "id": "quantization",
          "title": "Quantization: Approximating an Intensity",
          "paragraphs": [
            "La quantification associe une intensité à une valeur de l'ensemble autorisé. Lorsque les niveaux disponibles sont peu nombreux, plusieurs intensités différentes peuvent devenir identiques.",
            "Cette perte d'information peut masquer les petits écarts importants pour la détection de défauts. Elle apparaît parfois sous forme de bandes dans les gradients d'intensité."
          ],
          "code": "import numpy as np\nimage=np.array([0,40,80,120,160,200,240],dtype=np.uint8)\nquatre_niveaux=(image//64)*64\nprint(quatre_niveaux)",
          "language": "python",
          "output": "[  0   0  64  64 128 192 192]",
          "interpretation": "Sept intensités d'origine sont ramenées à quatre niveaux possibles 0, 64, 128 et 192 dans cette quantification simplifiée."
        },
        {
          "id": "sampling-versus-quant",
          "title": "Sampling vs Quantization: Two Different Losses",
          "paragraphs": [
            "L'échantillonnage affecte la quantité de positions spatiales ; la quantification affecte la précision de l'intensité à chaque position. Les deux opérations réduisent de l'information mais pas de la même manière.",
            "Pour mesurer un petit défaut de forme, manquer de pixels spatiaux peut être très dommageable. Pour distinguer de faibles variations d'intensité, la profondeur radiométrique peut être déterminante."
          ],
          "code": "import numpy as np\nsource=np.arange(16,dtype=np.uint8).reshape(4,4)*16\nmoins_pixels=source[::2,::2]\nmoins_niveaux=(source//64)*64\nprint(moins_pixels.shape,moins_niveaux.shape)\nprint(np.unique(moins_niveaux))",
          "language": "python",
          "output": "(2, 2) (4, 4)\n[  0  64 128 192]",
          "interpretation": "Le sous-échantillonnage réduit les dimensions ; la quantification garde 4×4 pixels mais réduit le nombre de niveaux."
        },
        {
          "id": "clipping",
          "title": "Overflow, Clipping and Dtype Conversion",
          "paragraphs": [
            "Un tableau uint8 représente seulement 0–255. Ajouter une valeur à un pixel de 250 sans élargir le type peut provoquer un débordement ou une saturation incorrectement supposée.",
            "La stratégie sûre consiste à convertir temporairement dans un type plus large, effectuer l'opération, limiter avec clip puis convertir en uint8."
          ],
          "code": "import numpy as np\nimage=np.array([200,250],dtype=np.uint8)\ncorrige=np.clip(image.astype(np.int16)+20,0,255).astype(np.uint8)\nprint(corrige)",
          "language": "python",
          "output": "[220 255]",
          "interpretation": "La deuxième valeur atteint la limite 255 après clipping ; elle ne revient pas accidentellement à une intensité sombre."
        },
        {
          "id": "practice",
          "title": "Mini-project: Compare 8-bit and 4-bit Representations",
          "paragraphs": [
            "Crée un gradient progressif de seize pixels. Convertis ses intensités vers un nombre réduit de niveaux puis observe les valeurs uniques.",
            "Explique ensuite si la perte observée concerne la finesse des positions spatiales ou le nombre de niveaux possibles. Refais l'expérience avec un pas de quantification plus grand."
          ],
          "code": "import numpy as np\ngradient=np.arange(0,256,16,dtype=np.uint8)\nquantifie=(gradient//64)*64\nprint(gradient.size)\nprint(np.unique(quantifie))",
          "language": "python",
          "output": "16\n[  0  64 128 192]",
          "interpretation": "Les seize positions spatiales sont conservées, mais seules quatre intensités distinctes restent après quantification."
        }
      ],
      "mistakes": [
        "Confondre la résolution spatiale et la profondeur radiométrique.",
        "Supposer que réduire des pixels et réduire des niveaux produit la même perte.",
        "Utiliser uint8 pour des valeurs qui dépassent 255 sans conversion sûre.",
        "Quantifier des données scientifiques sans vérifier les détails perdus.",
        "Oublier qu'un sous-échantillonnage sans filtrage peut provoquer de l'aliasing."
      ],
      "conclusion": [
        "Tu sais maintenant distinguer échantillonnage et quantification, calculer des nombres de niveaux à partir de la profondeur et réaliser des conversions contrôlées.",
        "Ces concepts fondent les choix d'acquisition et les étapes de normalisation des images en milieu scientifique ou industriel."
      ],
      "faq": [
        {
          "question": "What is image sampling?",
          "answer": "La mesure de la scène sur une grille discrète de positions spatiales."
        },
        {
          "question": "What is quantization?",
          "answer": "La représentation des intensités avec un nombre fini de niveaux."
        },
        {
          "question": "How many levels are represented by 8 bits?",
          "answer": "256 niveaux, de 0 à 255 pour une composante entière non signée."
        },
        {
          "question": "What is clipping?",
          "answer": "Le fait de limiter des valeurs à une plage autorisée, par exemple de 0 à 255."
        },
        {
          "question": "Why can downsampling create aliasing?",
          "answer": "Des variations spatiales trop fines peuvent être représentées incorrectement par une grille trop espacée."
        }
      ]
    }
  },
  {
    "slug": "image-channels",
    "pointIndex": 4,
    "article": {
      "eyebrow": "IMAGE PROCESSING · FONDAMENTAUX",
      "title": "Grayscale, Colour and Multi-channel Images: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une image peut représenter un seul niveau d'intensité par pixel ou plusieurs mesures réunies sur des canaux. Les images RGB, BGR, RGBA, multispectrales et scientifiques ne se manipulent pas toutes de la même manière.",
        "Cet article explique les matrices 2D et 3D, l'ordre des canaux, l'accès aux composantes, la conversion vers le gris et les précautions de mémoire et d'affichage."
      ],
      "tldr": [
        "Une image en niveaux de gris est généralement un tableau (H,W), tandis qu'une image couleur ordinaire prend la forme (H,W,3).",
        "Les trois canaux peuvent être RGB ou BGR selon la bibliothèque. Un canal alpha peut ajouter une quatrième composante de transparence.",
        "Une image multicanale n'est pas nécessairement RGB : il faut connaître la signification physique ou logique de chaque canal avant d'en calculer une moyenne."
      ],
      "sections": [
        {
          "id": "gray",
          "title": "Grayscale Images and Intensity",
          "paragraphs": [
            "En niveaux de gris, chaque pixel porte une seule intensité ; en uint8, elle varie généralement de zéro à deux cent cinquante-cinq. Cette représentation simplifie les analyses de contraste et de contours.",
            "L'absence d'axe de canal signifie que image.shape possède habituellement deux dimensions. Un programme qui indexe systématiquement un troisième axe peut échouer."
          ],
          "code": "import numpy as np\ngris=np.zeros((12,18),dtype=np.uint8)\ngris[3:9,5:13]=150\nprint(gris.ndim)\nprint(gris.shape)\nprint(gris[4,6])",
          "language": "python",
          "output": "2\n(12, 18)\n150",
          "interpretation": "L'image a deux axes et la zone rectangulaire possède une intensité de 150."
        },
        {
          "id": "rgb",
          "title": "RGB: Three Components at Each Pixel",
          "paragraphs": [
            "Dans le modèle RGB, les composantes décrivent les contributions de rouge, de vert et de bleu. Les valeurs sont généralement ordonnées sous la forme [R,G,B] et peuvent être combinées pour produire une large gamme de couleurs.",
            "Le nom de canal indique une convention de représentation, pas une dimension spatiale supplémentaire. Deux tableaux de même résolution peuvent avoir des nombres de canaux différents."
          ],
          "code": "import numpy as np\nrgb=np.zeros((1,3,3),dtype=np.uint8)\nrgb[0,0]=[255,0,0]\nrgb[0,1]=[0,255,0]\nrgb[0,2]=[0,0,255]\nprint(rgb.shape)\nprint(rgb[0,1])",
          "language": "python",
          "output": "(1, 3, 3)\n[  0 255   0]",
          "interpretation": "La ligne contient trois pixels rouge, vert et bleu en convention RGB."
        },
        {
          "id": "bgr",
          "title": "BGR and OpenCV Colour Conventions",
          "paragraphs": [
            "OpenCV charge habituellement les images couleur en BGR. Si tu affiches directement cette matrice dans Matplotlib, qui attend RGB, les couleurs peuvent paraître incorrectes.",
            "Utilise cv2.cvtColor pour convertir explicitement. Il faut connaître l'état de départ : convertir deux fois sans nécessité inverse à nouveau les canaux."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.array([[[0,0,255]]],dtype=np.uint8)\nrgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)\nprint(rgb[0,0])",
          "language": "python",
          "output": "[255   0   0]",
          "interpretation": "La couleur rouge reste rouge, mais sa composante forte se déplace du dernier au premier canal."
        },
        {
          "id": "alpha",
          "title": "RGBA and Transparency",
          "paragraphs": [
            "Une image RGBA contient une quatrième composante dite alpha. Elle décrit généralement une propriété d'opacité ou de transparence, selon le format et la convention.",
            "Lorsqu'on traite des images à quatre canaux, il faut décider si l'alpha est conservé, utilisé pour composer l'image avec un fond ou supprimé. Ne traite pas le canal alpha comme une couleur ordinaire."
          ],
          "code": "import numpy as np\nrgba=np.array([[[255,0,0,128]]],dtype=np.uint8)\nprint(rgba.shape)\nprint(\"Alpha :\",rgba[0,0,3])",
          "language": "python",
          "output": "(1, 1, 4)\nAlpha : 128",
          "interpretation": "La quatrième composante vaut 128 sur 255, représentant une opacité approximativement à moitié dans une convention courante."
        },
        {
          "id": "multi",
          "title": "Scientific and Multi-spectral Channels",
          "paragraphs": [
            "Des caméras spécialisées peuvent mesurer plusieurs bandes spectrales, des profondeurs ou des modalités différentes. Une matrice (H,W,C) peut alors contenir davantage que trois canaux.",
            "Les canaux ne doivent pas être interprétés automatiquement comme RGB. La documentation du capteur doit expliquer les unités, les plages et les transformations permises."
          ],
          "code": "import numpy as np\ncube=np.zeros((10,10,5),dtype=np.float32)\ncube[:,:,0]=1.5\nprint(cube.shape)\nprint(cube[0,0])",
          "language": "python",
          "output": "(10, 10, 5)\n[1.5 0.  0.  0.  0. ]",
          "interpretation": "L'exemple possède cinq canaux numériques par pixel ; leur sens doit être défini par le système d'acquisition."
        },
        {
          "id": "project",
          "title": "Mini-project: Compare Channels and Memory",
          "paragraphs": [
            "Crée une image grise, une image RGB et une image RGBA de résolution identique. Compare leurs formes et leur mémoire brute. Explique pourquoi le choix de type peut aussi influencer le coût du traitement.",
            "Dans une mission professionnelle, sélectionner les canaux utiles limite parfois les traitements inutiles mais demande de vérifier que les informations importantes ne sont pas perdues."
          ],
          "code": "import numpy as np\ngris=np.zeros((100,100),dtype=np.uint8)\nrgb=np.zeros((100,100,3),dtype=np.uint8)\nrgba=np.zeros((100,100,4),dtype=np.uint8)\nprint(gris.nbytes,rgb.nbytes,rgba.nbytes)",
          "language": "python",
          "output": "10000 30000 40000",
          "interpretation": "À type et résolution constants, la mémoire brute augmente proportionnellement au nombre de canaux."
        }
      ],
      "mistakes": [
        "Confondre l'axe des canaux et les axes spatiaux.",
        "Afficher du BGR comme du RGB.",
        "Traiter le canal alpha comme une quatrième couleur.",
        "Supposer que toute image à trois canaux représente des couleurs RGB ordinaires.",
        "Effacer un canal scientifique sans connaître sa signification ni son utilité."
      ],
      "conclusion": [
        "Tu comprends désormais les différences entre gris, RGB, BGR, RGBA et multicanal. Tu peux inspecter la forme, accéder aux canaux et expliquer les choix de représentation.",
        "Ces bases préparent les conversions colorimétriques d'OpenCV, la segmentation et les modèles CNN qui acceptent différents formats d'entrée."
      ],
      "faq": [
        {
          "question": "What is a grayscale image?",
          "answer": "Une image représentant généralement une seule intensité par pixel."
        },
        {
          "question": "What is the shape of an RGB image in NumPy?",
          "answer": "Le plus souvent (hauteur,largeur,3)."
        },
        {
          "question": "Why does OpenCV use BGR?",
          "answer": "C'est une convention historique de ses interfaces de lecture et de traitement couleur."
        },
        {
          "question": "What is an alpha channel?",
          "answer": "Une composante supplémentaire associée à l'opacité ou la transparence."
        },
        {
          "question": "Does a five-channel image necessarily contain RGB?",
          "answer": "Non. Elle peut représenter des bandes spectrales ou des mesures définies par un capteur spécialisé."
        }
      ]
    }
  },
  {
    "slug": "image-industry-examples",
    "pointIndex": 5,
    "article": {
      "eyebrow": "IMAGE PROCESSING · FONDAMENTAUX",
      "title": "Image Processing in Industry, Medicine and Robotics: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Le traitement d'images ne se limite pas aux photos : il s'applique au contrôle qualité, aux images médicales et aux systèmes robotiques. Dans chaque domaine, on suit une chaîne commune tout en respectant des contraintes très différentes.",
        "Ce cours présente des problèmes réalistes de classification, segmentation, mesure et suivi, puis apprend à définir un objectif, sélectionner les données, choisir les indicateurs et expliquer les limites des résultats."
      ],
      "tldr": [
        "Dans l'industrie, une caméra peut détecter des défauts sur une pièce ; en médecine, une image peut aider à visualiser une structure ; en robotique, une caméra apporte une observation de l'environnement.",
        "Un pipeline crédible distingue acquisition, qualité, prétraitement, analyse, validation et restitution.",
        "Il faut définir des métriques reliées à la mission : précision géométrique, IoU/Dice pour un masque, taux de détection ou latence selon le cas."
      ],
      "sections": [
        {
          "id": "industrial",
          "title": "Industrial Inspection: Detecting Surface Defects",
          "paragraphs": [
            "Une ligne de fabrication peut photographier des pièces pour repérer des rayures, des trous ou des différences de couleur. Selon la stabilité de l'éclairage et des objets, un simple seuillage ou filtre peut parfois suffire.",
            "Le premier travail d'un analyste vision est de comprendre l'anomalie recherchée et les contraintes : taille minimale du défaut, cadence de la ligne, taux de faux rejets et variation de la scène."
          ],
          "code": "import numpy as np\nimage=np.full((40,40),100,dtype=np.uint8)\nimage[15:20,18:23]=230\ndefaut=image>180\nprint(\"Pixels suspects :\",np.count_nonzero(defaut))",
          "language": "python",
          "output": "Pixels suspects : 25",
          "interpretation": "La zone lumineuse représente un défaut synthétique 5×5. Ce seuil simple nécessiterait des tests sur des images réelles."
        },
        {
          "id": "medical",
          "title": "Medical Imaging: Preserving Small Structures",
          "paragraphs": [
            "En imagerie médicale, des structures très petites ou peu contrastées peuvent être importantes. Le prétraitement doit éviter d'effacer un objet d'intérêt, et la validation doit comparer les résultats à des annotations pertinentes.",
            "Un masque obtenu par algorithme ne constitue pas un diagnostic médical. Les traitements de validation nécessitent une expertise du domaine et des protocoles adaptés."
          ],
          "code": "import numpy as np\nmasque_ref=np.zeros((10,10),dtype=bool)\nmasque_ref[3:7,3:7]=True\nprediction=np.zeros((10,10),dtype=bool)\nprediction[3:7,4:8]=True\nintersection=np.count_nonzero(masque_ref & prediction)\nunion=np.count_nonzero(masque_ref | prediction)\nprint(round(intersection/union,3))",
          "language": "python",
          "output": "0.6",
          "interpretation": "Les deux masques partagent 12 pixels sur une union de 20, soit IoU=0,6. Cela mesure un recouvrement, pas la qualité clinique d'une décision."
        },
        {
          "id": "robotics",
          "title": "Robotics: Detecting an Object for a Robot",
          "paragraphs": [
            "Un robot peut utiliser une caméra pour repérer un objet, estimer sa position dans l'image et guider un mouvement. La localisation en pixels n'est cependant pas automatiquement une position dans le monde réel.",
            "Le passage aux coordonnées métriques requiert souvent les paramètres de calibration, la géométrie de la scène et parfois un capteur de profondeur."
          ],
          "code": "import numpy as np\nmasque=np.zeros((20,30),dtype=bool)\nmasque[5:15,10:20]=True\ny,x=np.nonzero(masque)\nprint(round(x.mean(),1),round(y.mean(),1))",
          "language": "python",
          "output": "14.5 9.5",
          "interpretation": "Le centre de la zone est proche de x=14,5, y=9,5 pixels. Ce n'est pas une position métrique sans calibration."
        },
        {
          "id": "pipeline",
          "title": "How to Design a Reproducible Image Pipeline",
          "paragraphs": [
            "Une chaîne reproductible doit connaître la source des images, la résolution, l'ordre des canaux, les paramètres de traitement et les critères de réussite. Sépare les étapes en fonctions claires pour faciliter le diagnostic.",
            "Conserve des sorties intermédiaires afin de montrer ce que chaque filtre ou transformation ajoute ou retire à l'information."
          ],
          "code": "import numpy as np\ndef detection_simple(image,seuil):\n    if image.ndim!=2:\n        raise ValueError(\"Image grise attendue\")\n    return image>seuil\nimage=np.array([[0,100],[200,255]],dtype=np.uint8)\nprint(detection_simple(image,150).astype(int))",
          "language": "python",
          "output": "[[0 0]\n [1 1]]",
          "interpretation": "Le traitement prend une image grise et un seuil, valide le format puis renvoie un masque explicite."
        },
        {
          "id": "metrics",
          "title": "Choose an Evaluation Metric Based on the Task",
          "paragraphs": [
            "Pour une segmentation, IoU et Dice comparent les masques à des annotations de référence. Pour une classification, précision et rappel évaluent des erreurs différentes. Pour des images débruitées, PSNR ou SSIM peuvent aider selon les hypothèses.",
            "Une métrique unique ne garantit pas l'utilité d'un système : il faut également étudier les erreurs, la robustesse aux changements d'éclairage et le temps de traitement."
          ],
          "code": "tp,fp,fn=80,10,20\nprecision=tp/(tp+fp)\nrappel=tp/(tp+fn)\nprint(round(precision,3),round(rappel,3))",
          "language": "python",
          "output": "0.889 0.8",
          "interpretation": "La précision des détections positives vaut environ 0,889 et le rappel vaut 0,8. Les conséquences des faux positifs et faux négatifs dépendent du métier."
        },
        {
          "id": "practice",
          "title": "Mini-project: Define a Technical Mission",
          "paragraphs": [
            "Imagine une caméra inspectant des pièces sur un convoyeur. Rédige un cahier des charges de six lignes : objet, défaut, image d'entrée, méthode de base, métrique, contrainte d'exécution.",
            "Crée ensuite une image synthétique avec un défaut de taille connue et mesure un masque. Vérifie le résultat avant d'ajouter de la complexité ou un modèle de deep learning."
          ],
          "code": "import numpy as np\nimage=np.zeros((50,50),dtype=np.uint8)\nimage[20:30,20:30]=255\nmasque=image>127\naire_pixels=int(masque.sum())\nprint(\"Aire du défaut :\",aire_pixels,\"pixels\")",
          "language": "python",
          "output": "Aire du défaut : 100 pixels",
          "interpretation": "Ce contrôle synthétique donne une référence connue. Une évaluation réelle doit inclure des variations de scène et des annotations indépendantes."
        }
      ],
      "mistakes": [
        "Choisir un modèle deep learning sans avoir défini la question et la métrique.",
        "Confondre position en pixels et coordonnées du monde réel.",
        "Interpréter un résultat de traitement médical comme un diagnostic.",
        "Valider la méthode sur une seule image parfaitement contrôlée.",
        "Ne pas mesurer les faux positifs, les faux négatifs ou les contraintes de cadence."
      ],
      "conclusion": [
        "Tu as maintenant une vue concrète de trois domaines d'application et d'une méthode commune : définir le besoin, contrôler l'acquisition, construire une baseline, évaluer et documenter.",
        "Pour travailler en stage, entraîne-toi d'abord à livrer une chaîne classique simple dont tu peux expliquer chaque fonction et chaque échec."
      ],
      "faq": [
        {
          "question": "How is image processing used in industry?",
          "answer": "Pour inspecter des pièces, mesurer des régions, contrôler des défauts et soutenir l'automatisation."
        },
        {
          "question": "How is image processing used in medicine?",
          "answer": "Pour améliorer la visibilité, analyser des images et assister des tâches évaluées dans un cadre clinique approprié."
        },
        {
          "question": "How does a robot use a camera?",
          "answer": "Il extrait des informations visuelles sur des objets et leur position apparente afin d'aider à la perception."
        },
        {
          "question": "Why do image pixels not give 3D positions?",
          "answer": "La projection de la scène dans la caméra perd des informations géométriques sans calibration et hypothèses ou capteurs supplémentaires."
        },
        {
          "question": "Which metric should I choose?",
          "answer": "Selon la tâche et le coût des erreurs : IoU/Dice pour des masques, précision/rappel pour des détections, et mesures spécifiques à la qualité d'image."
        }
      ]
    }
  }
];
