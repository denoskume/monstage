import type {DeepConceptArticle} from './deepConceptTypes';
export const numpyConceptArticles:DeepConceptArticle[] = [
  {
    "slug": "numpy-introduction",
    "pointIndex": 0,
    "article": {
      "eyebrow": "NUMPY · DATA ANALYSIS & IMAGE PROCESSING",
      "title": "What is NumPy in Python? A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "NumPy est la bibliothèque de base du calcul numérique en Python. Elle permet de conserver et transformer des tableaux de nombres très efficacement : mesures de capteurs, séries numériques, matrices et images.",
        "Ce guide explique l'utilité de NumPy, son installation, la création de tableaux, la notion d'axes et la différence avec une liste Python. Tous les exemples sont suffisamment petits pour être vérifiés à la main."
      ],
      "tldr": [
        "NumPy signifie Numerical Python. Sa structure centrale est le ndarray, un tableau pouvant avoir plusieurs dimensions avec un type de données homogène.",
        "Par rapport aux listes Python, NumPy propose des opérations mathématiques vectorisées et des outils adaptés aux tableaux numériques volumineux.",
        "Pour travailler correctement, commence par comprendre shape, dtype, les axes, l'indexation et le sens de chaque dimension."
      ],
      "sections": [
        {
          "id": "what",
          "title": "What is NumPy Used For?",
          "paragraphs": [
            "NumPy représente des collections de nombres sous une structure commune, ndarray. La bibliothèque est utilisée pour calculer des statistiques, filtrer des mesures et transformer des matrices d'images.",
            "Dans un pipeline Data Analyst, NumPy peut calculer des agrégations. Dans un pipeline Image Processing, une photographie en niveaux de gris devient une matrice d'intensités."
          ],
          "code": "import numpy as np\ntemperatures = np.array([20, 22, 25, 27])\nprint(type(temperatures).__name__)\nprint(temperatures.mean())",
          "language": "python",
          "output": "ndarray\n23.5",
          "interpretation": "Une liste de quatre températures est convertie en ndarray ; mean calcule la moyenne globale sans écrire une boucle."
        },
        {
          "id": "install",
          "title": "Installing NumPy and Verifying the Environment",
          "paragraphs": [
            "NumPy est un package tiers qu'il faut installer dans l'environnement Python utilisé par Jupyter ou le terminal. Une installation dans le mauvais environnement provoque ModuleNotFoundError.",
            "Dans un notebook, l'import standard import numpy as np définit un alias court. Vérifie ensuite la version et le comportement d'un petit tableau."
          ],
          "code": "import numpy as np\nprint(np.__version__)\nprint(np.array([1, 2, 3]).sum())",
          "language": "python",
          "output": "Une version de NumPy s'affiche, suivie de 6.",
          "interpretation": "L'import confirme la disponibilité de la bibliothèque. Si l'import échoue, installe numpy dans le noyau ou environnement actif."
        },
        {
          "id": "python-list",
          "title": "Python Lists vs NumPy Arrays",
          "paragraphs": [
            "Une liste Python peut contenir différents types et sert à stocker une séquence d'objets. Un tableau NumPy homogène possède une structure plus adaptée au calcul numérique.",
            "L'opérateur + ne signifie pas la même chose pour une liste et pour un ndarray : il concatène généralement les listes, mais additionne les éléments du tableau."
          ],
          "code": "import numpy as np\nprint([1, 2] + [3, 4])\nprint((np.array([1,2]) + np.array([3,4])).tolist())",
          "language": "python",
          "output": "[1, 2, 3, 4]\n[4, 6]",
          "interpretation": "La première opération réunit les listes ; la seconde effectue deux additions élément par élément."
        },
        {
          "id": "axes",
          "title": "Understanding One-dimensional and Two-dimensional Arrays",
          "paragraphs": [
            "Un tableau NumPy peut avoir un axe (une série), deux axes (une matrice) ou davantage (une image couleur). ndim compte les axes et shape donne la taille de chaque axe.",
            "Une matrice de températures peut représenter deux machines avec trois mesures chacune. La signification des axes dépend du problème : il faut la documenter."
          ],
          "code": "import numpy as np\nmesures = np.array([[20, 22, 24],\n                    [19, 21, 23]])\nprint(mesures.ndim)\nprint(mesures.shape)\nprint(mesures.size)",
          "language": "python",
          "output": "2\n(2, 3)\n6",
          "interpretation": "Deux lignes, trois colonnes et six valeurs au total. Les lignes représentent ici les machines et les colonnes les instants."
        },
        {
          "id": "creation",
          "title": "Creating Arrays with zeros, ones and arange",
          "paragraphs": [
            "np.zeros crée des valeurs nulles, np.ones des valeurs égales à un et np.arange une suite à pas régulier. Ces fonctions sont utiles pour initialiser des mesures, des masques et des expériences contrôlées.",
            "Attention : créer une matrice de zéros ne signifie pas que la source réelle contenait des zéros. Dans une simulation, explique que les données ont été initialisées."
          ],
          "code": "import numpy as np\na = np.zeros((2,3))\nb = np.arange(0, 6, 2)\nprint(a.shape)\nprint(b)",
          "language": "python",
          "output": "(2, 3)\n[0 2 4]",
          "interpretation": "zeros reçoit ici une forme à deux axes ; arange produit les valeurs 0, 2 et 4 en excluant la borne 6."
        },
        {
          "id": "business",
          "title": "Mini-project: Compare Two Sensor Series",
          "paragraphs": [
            "Une équipe suit les températures de deux machines sur trois périodes. Un tableau 2D permet de calculer la moyenne de chaque machine avec axis=1, puis de comparer ces résultats.",
            "Le mot axis désigne l'axe que la fonction réduit : axis=1 supprime les colonnes de chaque ligne en les agrégeant, ce qui donne une statistique par machine."
          ],
          "code": "import numpy as np\nmesures = np.array([[20, 22, 24],\n                    [19, 21, 23]], dtype=float)\npar_machine = mesures.mean(axis=1)\nprint(par_machine)\nprint(\"Écart :\", par_machine[0]-par_machine[1])",
          "language": "python",
          "output": "[22. 21.]\nÉcart : 1.0",
          "interpretation": "Sur ces trois périodes, la première machine est en moyenne 1 °C plus chaude. Cela ne suffit pas à conclure à une panne."
        }
      ],
      "mistakes": [
        "Confondre concaténation de listes et addition élément par élément NumPy.",
        "Ne pas vérifier l'ordre des axes d'un tableau.",
        "Interpréter une matrice de démonstration comme des données réelles.",
        "Oublier que np.arange exclut la borne finale.",
        "Comparer des mesures dont les unités ou les instants diffèrent."
      ],
      "conclusion": [
        "Tu comprends le rôle de NumPy et la structure ndarray. Tu sais créer des tableaux, interpréter leurs axes et calculer un premier indicateur par machine.",
        "La suite consiste à maîtriser shape, dtype et les opérations d'indexation avant d'utiliser NumPy dans des traitements plus élaborés."
      ],
      "faq": [
        {
          "question": "What is NumPy?",
          "answer": "Une bibliothèque Python spécialisée dans les tableaux multidimensionnels homogènes et les calculs numériques."
        },
        {
          "question": "What is an ndarray?",
          "answer": "Le tableau NumPy, qui possède des axes, une forme et un type de données."
        },
        {
          "question": "Why use NumPy instead of lists?",
          "answer": "NumPy facilite des opérations mathématiques vectorisées sur des tableaux numériques, souvent plus efficaces sur de grandes données."
        },
        {
          "question": "What does shape mean?",
          "answer": "Le nombre d'éléments selon chaque axe du tableau."
        },
        {
          "question": "What is an axis?",
          "answer": "Une dimension du tableau ; les fonctions de réduction agrègent le long de l'axe choisi."
        }
      ]
    }
  },
  {
    "slug": "numpy-shape-dtype",
    "pointIndex": 0,
    "article": {
      "eyebrow": "NUMPY · DATA ANALYSIS & IMAGE PROCESSING",
      "title": "NumPy ndarray, Shape and Dtype: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un tableau de nombres n'est exploitable que si l'on comprend sa structure. shape décrit ses dimensions, dtype indique le type de chaque élément, et ndim compte le nombre d'axes.",
        "Ce cours enseigne ces attributs en détail, y compris la différence entre une série, une matrice, une image couleur, la conversion de types, le reshape et les pièges de dépassement d'entiers."
      ],
      "tldr": [
        "shape indique la taille de chaque axe ; ndim indique combien d'axes existent ; size donne le nombre total d'éléments.",
        "dtype définit la représentation numérique : int, float, uint8, etc. Les opérations peuvent déborder si le type ne permet pas de représenter le résultat.",
        "reshape réorganise les éléments sans changer leur nombre ; il faut vérifier la correspondance entre les données et leur signification métier."
      ],
      "sections": [
        {
          "id": "attributes",
          "title": "Inspecting ndim, shape, size and dtype",
          "paragraphs": [
            "Les attributs d'un ndarray permettent de vérifier ce qui a été importé. Une matrice de forme (2,3) possède deux lignes et trois colonnes ; son nombre d'éléments est 6.",
            "Le type des données doit être adapté à leur sens. Des températures avec décimales nécessitent généralement float ; une image 8 bits utilise fréquemment uint8."
          ],
          "code": "import numpy as np\nx = np.array([[1, 2, 3],[4, 5, 6]],dtype=np.int16)\nprint(x.ndim, x.shape, x.size, x.dtype)",
          "language": "python",
          "output": "2 (2, 3) 6 int16",
          "interpretation": "Les deux axes ont respectivement 2 et 3 éléments. Chaque valeur occupe un type entier signé de 16 bits."
        },
        {
          "id": "dimensions",
          "title": "From Series to Matrices and Color Images",
          "paragraphs": [
            "Un tableau 1D correspond à une suite de mesures ; un tableau 2D à une matrice ; un tableau 3D peut représenter une image couleur avec hauteur, largeur et canaux.",
            "Dans une image, l'ordre des dimensions est critique. NumPy et OpenCV traitent généralement (H,W,C), tandis que certains frameworks deep learning utilisent (N,C,H,W)."
          ],
          "code": "import numpy as np\nserie = np.zeros(10)\nmatrice = np.zeros((4,6))\nimage = np.zeros((4,6,3),dtype=np.uint8)\nprint(serie.shape, matrice.shape, image.shape)",
          "language": "python",
          "output": "(10,) (4, 6) (4, 6, 3)",
          "interpretation": "Le dernier axe de l'image couleur représente les trois canaux. Une image en gris peut ne pas posséder cet axe."
        },
        {
          "id": "dtype",
          "title": "Choosing Numeric Types",
          "paragraphs": [
            "int représente des entiers, float des décimales ; uint8 est un entier non signé limité à 0–255. La mémoire et les opérations disponibles dépendent du type.",
            "Un type trop petit peut perdre des informations lors d'une conversion. Les unités, valeurs extrêmes et résultats intermédiaires doivent être contrôlés avant de choisir dtype."
          ],
          "code": "import numpy as np\na = np.array([0, 255],dtype=np.uint8)\nb = a.astype(np.int16)\nprint(a.dtype,b.dtype)\nprint((b + 10).tolist())",
          "language": "python",
          "output": "uint8 int16\n[10, 265]",
          "interpretation": "La conversion vers int16 permet de calculer 265 sans déborder sur la plage 0–255."
        },
        {
          "id": "overflow",
          "title": "Integer Overflow and Safe Image Calculations",
          "paragraphs": [
            "Une opération exécutée dans un entier non signé de 8 bits peut déborder ou retourner une valeur inattendue. C'est une source fréquente d'erreur dans le traitement d'images.",
            "Pour augmenter la luminosité, élargis temporairement le type, effectue le calcul, puis applique np.clip avant de revenir en uint8."
          ],
          "code": "import numpy as np\npixels=np.array([200,250],dtype=np.uint8)\ncorriges=np.clip(pixels.astype(np.int16)+20,0,255).astype(np.uint8)\nprint(corriges)",
          "language": "python",
          "output": "[220 255]",
          "interpretation": "Le pixel à 250 atteint la limite 255, et non 270. Le clipping empêche une valeur impossible sur 8 bits."
        },
        {
          "id": "reshape",
          "title": "Reshaping Arrays and Preserving Element Counts",
          "paragraphs": [
            "reshape change l'organisation des éléments, mais pas leur quantité. Il est nécessaire que le produit des nouvelles dimensions corresponde à size.",
            "Une matrice reshaped peut modifier la manière dont un algorithme interprète les axes. Décris toujours ce que représentent lignes et colonnes avant de transformer la forme."
          ],
          "code": "import numpy as np\na = np.arange(12)\nb = a.reshape(3,4)\nprint(b.shape)\nprint(b[2,3])",
          "language": "python",
          "output": "(3, 4)\n11",
          "interpretation": "Les douze valeurs sont réorganisées en trois lignes de quatre. La dernière cellule vaut 11."
        },
        {
          "id": "project",
          "title": "Mini-project: Validate a Sensor Matrix",
          "paragraphs": [
            "Tu reçois une matrice censée contenir trois machines et quatre observations par machine. Avant de produire un rapport, vérifie le nombre d'axes, la forme et le type numérique.",
            "Les assertions de forme permettent de détecter rapidement un CSV mal importé ou un tableau transposé accidentellement."
          ],
          "code": "import numpy as np\nmesures=np.arange(12,dtype=float).reshape(3,4)\nassert mesures.ndim==2\nassert mesures.shape==(3,4)\nprint(\"Moyenne par machine :\",mesures.mean(axis=1))",
          "language": "python",
          "output": "Moyenne par machine : [1.5 5.5 9.5]",
          "interpretation": "Chaque ligne représente quatre mesures d'une machine. axis=1 calcule une moyenne par ligne."
        }
      ],
      "mistakes": [
        "Interpréter shape=(H,W,C) comme (W,H,C).",
        "Confondre size avec le nombre d'axes.",
        "Effectuer des additions hors plage sur uint8.",
        "Utiliser reshape sans vérifier le sens des axes.",
        "Convertir en entier des décimales importantes pour l'analyse."
      ],
      "conclusion": [
        "Tu sais maintenant diagnostiquer la structure d'un ndarray et choisir un dtype approprié. Ce sont des contrôles fondamentaux avant tout calcul et avant la manipulation d'images.",
        "Dans la prochaine notion, tu utiliseras l'indexation, les slices et les masques booléens pour sélectionner les observations utiles."
      ],
      "faq": [
        {
          "question": "What does numpy.shape return?",
          "answer": "Un tuple contenant le nombre d'éléments de chaque dimension."
        },
        {
          "question": "What is the difference between ndim and size?",
          "answer": "ndim compte les axes, size compte tous les éléments."
        },
        {
          "question": "What is dtype?",
          "answer": "Le type numérique ou autre type représenté par les éléments de l'array."
        },
        {
          "question": "Why does uint8 matter in image processing?",
          "answer": "Il est fréquent pour les intensités de 0 à 255, mais peut déborder lors de calculs non sécurisés."
        },
        {
          "question": "What does reshape do?",
          "answer": "Il réorganise les dimensions d'un tableau sans changer le nombre d'éléments."
        }
      ]
    }
  },
  {
    "slug": "numpy-indexing",
    "pointIndex": 0,
    "article": {
      "eyebrow": "NUMPY · DATA ANALYSIS & IMAGE PROCESSING",
      "title": "NumPy Indexing, Slicing and Masks: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un tableau NumPy peut contenir des millions de nombres. L'indexation permet d'extraire un élément, le slicing une zone et un masque booléen les valeurs qui respectent une condition.",
        "Tu vas comprendre l'ordre des axes, les bornes des slices, les sélections de lignes et colonnes et la différence entre une vue partagée et une copie indépendante."
      ],
      "tldr": [
        "Dans une matrice, tableau[ligne,colonne] accède à une position ; les indices commencent à zéro.",
        "Un slice tableau[debut:fin] exclut fin. Un masque tableau > seuil produit des booléens ; tableau[masque] extrait les valeurs retenues.",
        "Un slice NumPy renvoie souvent une vue : modifier cette vue peut aussi modifier l'original. Utilise copy quand tu veux une version indépendante."
      ],
      "sections": [
        {
          "id": "indices",
          "title": "Selecting One Pixel or One Measurement",
          "paragraphs": [
            "Dans un ndarray 2D, deux indices sélectionnent un élément : le premier correspond à la ligne et le deuxième à la colonne. L'indice négatif -1 sélectionne la dernière position d'un axe.",
            "Pour un tableau de capteurs organisé par machines et instants, l'axe 0 peut désigner les machines et l'axe 1 les périodes ; un accès m[0,2] signifie première machine, troisième mesure."
          ],
          "code": "import numpy as np\nm=np.array([[10,20,30],[40,50,60]])\nprint(m[0,2])\nprint(m[-1,-1])",
          "language": "python",
          "output": "30\n60",
          "interpretation": "La valeur de la première ligne à la troisième colonne est 30 ; la dernière cellule vaut 60."
        },
        {
          "id": "slicing",
          "title": "Selecting a Region with Slices",
          "paragraphs": [
            "Un slice indique une plage d'indices. m[0:2,1:3] sélectionne les deux premières lignes et les colonnes d'indices 1 et 2. La borne finale est exclue dans les deux axes.",
            "Cette opération est utilisée pour extraire une région d'intérêt d'une image ou une période de mesures dans une matrice."
          ],
          "code": "import numpy as np\nm=np.arange(16).reshape(4,4)\nprint(m[1:3,1:4])",
          "language": "python",
          "output": "[[ 5  6  7]\n [ 9 10 11]]",
          "interpretation": "Deux lignes sont conservées, avec trois colonnes chacune. Les valeurs proviennent du tableau 4×4 d'origine."
        },
        {
          "id": "columns",
          "title": "Selecting Full Rows and Columns",
          "paragraphs": [
            "Le symbole : seul signifie « toutes les positions » de l'axe. m[:,0] extrait la première colonne, m[0,:] extrait la première ligne.",
            "Cette distinction est importante dans des jeux de données organisés par capteur, machine ou date. Documente l'orientation avant de produire une moyenne par colonne."
          ],
          "code": "import numpy as np\nm=np.array([[10,20],[30,40],[50,60]])\nprint(m[:,0])\nprint(m[1,:])",
          "language": "python",
          "output": "[10 30 50]\n[30 40]",
          "interpretation": "La première sélection contient une valeur par ligne ; la seconde toutes les valeurs de la deuxième ligne."
        },
        {
          "id": "boolean",
          "title": "Boolean Masks and Threshold Filtering",
          "paragraphs": [
            "Une comparaison appliquée à un tableau produit un tableau de booléens de la même forme. Tu peux ensuite utiliser ce masque pour extraire les valeurs ou pour calculer le nombre de dépassements.",
            "Ce mécanisme est central en Data Analysis et Image Processing : le même principe permet d'isoler des températures hors seuil ou des pixels lumineux."
          ],
          "code": "import numpy as np\nm=np.array([65,85,72,91])\nmask=m>80\nprint(mask)\nprint(m[mask])",
          "language": "python",
          "output": "[False  True False  True]\n[85 91]",
          "interpretation": "Deux valeurs dépassent 80. Le masque garde exactement la position de ces observations."
        },
        {
          "id": "views",
          "title": "Views, Copies and Shared Memory",
          "paragraphs": [
            "Un slicing NumPy produit souvent une vue qui partage sa mémoire avec le tableau source. Modifier les valeurs de cette vue peut donc changer le tableau d'origine, même si tu as utilisé un nouveau nom.",
            "Pour traiter une région sans affecter les données originales, appelle copy() explicitement. Vérifie cette différence sur un petit exemple avant une opération destructrice."
          ],
          "code": "import numpy as np\noriginal=np.array([1,2,3,4])\nvue=original[1:3]\nvue[0]=99\ncopie=original[1:3].copy()\ncopie[0]=77\nprint(original)\nprint(copie)",
          "language": "python",
          "output": "[ 1 99  3  4]\n[77  3]",
          "interpretation": "La vue modifie original à l'indice 1. La copie est indépendante et ne modifie pas le tableau source."
        },
        {
          "id": "case",
          "title": "Mini-project: Count Values Beyond a Limit",
          "paragraphs": [
            "Une inspection de capteurs souhaite connaître les mesures dépassant un seuil et leur proportion. Grâce à un masque booléen, le programme reste court tout en conservant l'ensemble du tableau.",
            "Il faut préciser la convention « strictement supérieur » et vérifier que la série n'est pas vide avant de calculer un pourcentage."
          ],
          "code": "import numpy as np\ntemperatures=np.array([70,81,85,77,90])\nmask=temperatures>80\nprint(\"Alertes :\",np.count_nonzero(mask))\nprint(\"Taux :\",round(100*mask.mean(),1),\"%\")",
          "language": "python",
          "output": "Alertes : 3\nTaux : 60.0 %",
          "interpretation": "Trois valeurs sur cinq dépassent 80, soit 60 %. La moyenne d'un tableau booléen correspond à la proportion de True."
        }
      ],
      "mistakes": [
        "Confondre l'ordre (ligne,colonne) avec (x,y).",
        "Oublier que les indices commencent à zéro.",
        "Croire qu'une borne finale de slice est incluse.",
        "Modifier une vue alors qu'on voulait préserver l'original.",
        "Calculer une moyenne de masque sur un tableau vide."
      ],
      "conclusion": [
        "L'indexation NumPy permet de sélectionner précisément une valeur, une région et toutes les valeurs satisfaisant une condition. Tu sais également protéger les données originales en différenciant copie et vue.",
        "Dans la prochaine notion, tu apprendras les opérations vectorisées et le broadcasting pour calculer sur des tableaux entiers."
      ],
      "faq": [
        {
          "question": "How does indexing work in NumPy?",
          "answer": "Avec des indices par axe, par exemple m[ligne,colonne] pour une matrice 2D."
        },
        {
          "question": "Is the end of a slice included?",
          "answer": "Non. Une sélection [1:3] contient les indices 1 et 2."
        },
        {
          "question": "What is a boolean mask?",
          "answer": "Un tableau de True/False indiquant quelles positions répondent à une condition."
        },
        {
          "question": "What is the difference between a view and a copy?",
          "answer": "Une vue partage souvent la mémoire du tableau source ; une copie possède ses propres données."
        },
        {
          "question": "How do I count True values?",
          "answer": "Avec np.count_nonzero(mask) ou une somme sur un masque booléen."
        }
      ]
    }
  },
  {
    "slug": "numpy-vectorization",
    "pointIndex": 0,
    "article": {
      "eyebrow": "NUMPY · DATA ANALYSIS & IMAGE PROCESSING",
      "title": "NumPy Vectorization and Broadcasting: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Les opérations vectorisées de NumPy permettent de calculer sur de nombreux éléments en une seule expression. Le broadcasting permet de combiner des tableaux de formes compatibles sans les dupliquer manuellement.",
        "Ce guide part d'une addition élément par élément et explique les opérations, les tableaux de formes différentes, les axes et les pièges de dimensions avant un cas d'analyse de capteurs."
      ],
      "tldr": [
        "Une opération vectorisée traite les éléments d'un ndarray sans boucle for Python explicite : mesures + 5, mesures * 2, mesures > seuil.",
        "Le broadcasting propage virtuellement les dimensions de taille 1 lorsque les formes sont compatibles, par exemple une correction par capteur appliquée à toutes les périodes.",
        "Vérifie shape pour éviter une erreur de broadcasting ou un résultat valide numériquement mais incorrect selon le sens des axes."
      ],
      "sections": [
        {
          "id": "vector",
          "title": "What Is a Vectorized Operation?",
          "paragraphs": [
            "NumPy implémente des opérations qui s'appliquent à chaque élément du tableau : addition, multiplication, comparaison ou fonction mathématique. Cette écriture est généralement plus simple et plus efficace qu'une boucle Python pour les gros tableaux.",
            "On doit comprendre quelle opération est appliquée : pour deux tableaux de même forme, l'addition NumPy se fait élément par élément, contrairement à la concaténation des listes."
          ],
          "code": "import numpy as np\na=np.array([10,20,30])\nb=np.array([1,2,3])\nprint(a+b)\nprint(a*2)",
          "language": "python",
          "output": "[11 22 33]\n[20 40 60]",
          "interpretation": "Chaque position est traitée séparément. L'opération *2 ne duplique pas la liste : elle multiplie les valeurs."
        },
        {
          "id": "scalars",
          "title": "Broadcasting a Scalar",
          "paragraphs": [
            "Une valeur seule, appelée scalaire, peut être combinée à tous les éléments d'un tableau. Cette forme simple de broadcasting est utilisée pour une correction de calibration, une conversion d'unités ou un ajustement numérique.",
            "Il faut toutefois éviter d'appliquer aveuglément une même correction à toutes les colonnes si les capteurs possèdent des calibrations distinctes."
          ],
          "code": "import numpy as np\nx=np.array([10,20,30],dtype=float)\ny=x+1.5\nprint(y)",
          "language": "python",
          "output": "[11.5 21.5 31.5]",
          "interpretation": "La valeur 1,5 est ajoutée à chaque mesure indépendamment."
        },
        {
          "id": "rules",
          "title": "Understanding Broadcasting Rules",
          "paragraphs": [
            "NumPy compare les dimensions depuis la droite. Deux dimensions sont compatibles si elles sont égales ou si l'une vaut 1. Sinon, l'opération lève généralement ValueError.",
            "Cette règle n'est pas une propriété métier : même lorsque les formes sont compatibles, vérifie que la correspondance entre axes a un sens."
          ],
          "code": "import numpy as np\nmatrice=np.array([[10,20,30],[40,50,60]])\ncorrection=np.array([1,2,3])\nprint(matrice+correction)",
          "language": "python",
          "output": "[[11 22 33]\n [41 52 63]]",
          "interpretation": "La correction de trois valeurs est appliquée aux trois colonnes de chacune des deux lignes."
        },
        {
          "id": "axes",
          "title": "Broadcasting Per Machine vs Per Time Slot",
          "paragraphs": [
            "Une matrice (2,3) peut contenir deux machines et trois instants. Un vecteur de forme (2,1) apporte une correction propre à chaque machine, alors qu'un vecteur (3,) apporte une correction propre à chaque instant.",
            "Les deux opérations peuvent fonctionner numériquement, mais représentent des réalités différentes. Documente les axes et vérifie au moins une ligne à la main."
          ],
          "code": "import numpy as np\nm=np.array([[10,20,30],[40,50,60]])\ncorrection_machine=np.array([[1],[5]])\nprint(m+correction_machine)",
          "language": "python",
          "output": "[[11 21 31]\n [45 55 65]]",
          "interpretation": "La première machine reçoit +1 et la seconde +5. L'axe de taille 1 permet d'étendre la correction à ses trois mesures."
        },
        {
          "id": "where",
          "title": "np.where and Conditional Transformation",
          "paragraphs": [
            "np.where(condition, a, b) choisit élément par élément entre deux résultats. Il est utile pour construire un indicateur d'alerte ou remplacer des valeurs selon une règle contrôlée.",
            "Il ne faut pas confondre l'opération avec un nettoyage sans justification. Par exemple, remplacer toute valeur négative par zéro peut masquer un défaut de capteur."
          ],
          "code": "import numpy as np\nmesures=np.array([70,85,92])\netats=np.where(mesures>80,\"alerte\",\"normal\")\nprint(etats)",
          "language": "python",
          "output": "['normal' 'alerte' 'alerte']",
          "interpretation": "Le tableau de sortie possède la même longueur que les mesures. Chaque état dépend de la comparaison à 80."
        },
        {
          "id": "case",
          "title": "Mini-project: Calibrate Multiple Sensors",
          "paragraphs": [
            "Trois capteurs d'une installation reçoivent chacun une correction différente, appliquée sur deux périodes. Utilise le broadcasting et vérifie les dimensions avant le calcul.",
            "Affiche les valeurs brutes, les paramètres de correction et les valeurs corrigées. Cette trace facilite la reproduction du résultat en équipe."
          ],
          "code": "import numpy as np\nbrut=np.array([[20.,22.,24.],[18.,20.,22.]])\noffset=np.array([[0.5],[-1.0]])\ncorrige=brut+offset\nassert corrige.shape==brut.shape\nprint(corrige)",
          "language": "python",
          "output": "[[20.5 22.5 24.5]\n [17.  19.  21. ]]",
          "interpretation": "La première machine est corrigée de +0,5 et la seconde de -1. La matrice garde deux lignes et trois colonnes."
        }
      ],
      "mistakes": [
        "Confondre concaténation Python et addition NumPy.",
        "Supposer que le broadcasting vérifie automatiquement le sens métier des axes.",
        "Ajouter un vecteur de mauvaise orientation à une matrice.",
        "Oublier que les comparaisons produisent des tableaux de booléens.",
        "Effectuer des transformations sur uint8 sans contrôler le débordement."
      ],
      "conclusion": [
        "La vectorisation et le broadcasting permettent des opérations concises sur des tableaux multidimensionnels. Tu sais appliquer des corrections globales et par axe, puis vérifier la forme du résultat.",
        "Ces idées sont essentielles à la préparation de données, au prétraitement d'images et aux réseaux de neurones, où la signification des axes conditionne la validité du calcul."
      ],
      "faq": [
        {
          "question": "What is vectorization?",
          "answer": "L'application d'une opération sur un tableau NumPy entier sans écrire une boucle explicite pour chaque élément."
        },
        {
          "question": "What is broadcasting?",
          "answer": "L'extension virtuelle de dimensions compatibles pour effectuer des opérations entre tableaux de formes différentes."
        },
        {
          "question": "How does NumPy check broadcasting?",
          "answer": "Les dimensions sont comparées depuis la droite et doivent être égales ou valoir 1."
        },
        {
          "question": "Can broadcasting produce a logically wrong result?",
          "answer": "Oui, si les axes sont compatibles mais ne correspondent pas à la même signification métier."
        },
        {
          "question": "Why use np.where?",
          "answer": "Pour choisir élément par élément un résultat selon une condition."
        }
      ]
    }
  },
  {
    "slug": "numpy-statistics",
    "pointIndex": 0,
    "article": {
      "eyebrow": "NUMPY · DATA ANALYSIS & IMAGE PROCESSING",
      "title": "Descriptive Statistics with NumPy: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Les statistiques descriptives résument les observations : moyenne, médiane, écart-type, minimum, maximum et quantiles. NumPy offre ces calculs sous une forme lisible sur des tableaux numériques.",
        "Tu vas apprendre les formules intuitives, l'effet des valeurs extrêmes, les réductions par axe et le traitement des mesures absentes, puis calculer un mini-rapport industriel."
      ],
      "tldr": [
        "np.mean calcule la moyenne ; np.median la valeur centrale triée ; np.std la dispersion ; np.percentile les quantiles.",
        "La moyenne est sensible aux valeurs extrêmes et ne suffit pas pour comprendre une distribution. Compare-la à la médiane et aux valeurs minimale et maximale.",
        "Pour les matrices, axis détermine la dimension agrégée ; pour les NaN, les fonctions nanmean et nanstd peuvent être appropriées après un contrôle des données."
      ],
      "sections": [
        {
          "id": "mean",
          "title": "Mean and Median: Two Different Centers",
          "paragraphs": [
            "La moyenne est la somme divisée par le nombre d'observations. La médiane est la valeur centrale des observations ordonnées. Une valeur extrême peut fortement augmenter la moyenne tout en modifiant peu la médiane.",
            "Dans une analyse de maintenance, un seul arrêt très long peut rendre le temps moyen atypique par rapport aux interventions habituelles."
          ],
          "code": "import numpy as np\ndurees=np.array([10,12,13,15,100])\nprint(\"Moyenne :\",durees.mean())\nprint(\"Médiane :\",np.median(durees))",
          "language": "python",
          "output": "Moyenne : 30.0\nMédiane : 13.0",
          "interpretation": "Quatre interventions sont courtes, mais l'événement de 100 minutes augmente fortement la moyenne. La médiane reflète mieux la durée centrale ici."
        },
        {
          "id": "dispersion",
          "title": "Variance and Standard Deviation",
          "paragraphs": [
            "L'écart-type mesure l'ampleur des écarts autour de la moyenne, dans la même unité que les données. La variance mesure le carré moyen de ces écarts, dans une unité au carré.",
            "NumPy utilise par défaut ddof=0, adapté à une variance de population. Pour l'estimateur d'écart-type d'un échantillon, ddof=1 est souvent utilisé lorsque les hypothèses statistiques le justifient."
          ],
          "code": "import numpy as np\nx=np.array([10,12,14],dtype=float)\nprint(np.mean(x))\nprint(round(np.std(x,ddof=0),3))\nprint(np.var(x,ddof=0))",
          "language": "python",
          "output": "12.0\n1.633\n2.6666666666666665",
          "interpretation": "La dispersion est calculée autour de 12. ddof=0 divise la somme des carrés des écarts par le nombre de mesures."
        },
        {
          "id": "quantiles",
          "title": "Min, Max, Percentiles and Quantiles",
          "paragraphs": [
            "Les valeurs minimale et maximale bornent les observations, tandis que les quantiles permettent de décrire la position d'une fraction du jeu de données. Le 50e percentile correspond à la médiane.",
            "Les quantiles sont souvent utilisés pour repérer des valeurs inhabituelles, mais une valeur atypique peut représenter un événement réel important et ne doit pas être supprimée automatiquement."
          ],
          "code": "import numpy as np\nx=np.array([10,20,30,40,50])\nprint(x.min(),x.max())\nprint(np.percentile(x,[25,50,75]))",
          "language": "python",
          "output": "10 50\n[20. 30. 40.]",
          "interpretation": "La moitié des valeurs se situe de part et d'autre de 30. Les quartiles indiquent la position de 25 % et 75 % selon la convention utilisée."
        },
        {
          "id": "axis",
          "title": "Statistics Along Rows and Columns",
          "paragraphs": [
            "Dans une matrice de forme (machines, instants), axis=1 réduit chaque ligne et donne une valeur par machine, tandis que axis=0 réduit les lignes et donne une valeur par instant.",
            "Confondre l'axe du calcul peut produire un tableau de nombres plausible mais répondre à une question totalement différente."
          ],
          "code": "import numpy as np\nx=np.array([[10,20,30],[20,30,40]])\nprint(x.mean(axis=1))\nprint(x.mean(axis=0))",
          "language": "python",
          "output": "[20. 30.]\n[15. 25. 35.]",
          "interpretation": "axis=1 produit deux moyennes par machine ; axis=0 produit trois moyennes par instant."
        },
        {
          "id": "missing",
          "title": "Handling NaN Values Explicitly",
          "paragraphs": [
            "NumPy utilise np.nan pour représenter certaines valeurs numériques manquantes dans les tableaux flottants. Une moyenne ordinaire contenant NaN devient généralement NaN ; nanmean peut ignorer ces entrées.",
            "Ignorer les absences n'est pas toujours la bonne réponse métier. Il faut aussi compter les mesures manquantes et comprendre leur mécanisme."
          ],
          "code": "import numpy as np\nx=np.array([10.,np.nan,20.])\nprint(np.isnan(x).sum())\nprint(np.mean(x))\nprint(np.nanmean(x))",
          "language": "python",
          "output": "1\nnan\n15.0",
          "interpretation": "Une entrée est manquante. La moyenne connue vaut 15 sur deux mesures, mais la couverture est seulement de deux observations sur trois."
        },
        {
          "id": "case",
          "title": "Professional Mini-project: Summarize Machine Downtime",
          "paragraphs": [
            "Une équipe veut comparer les temps d'arrêt de deux machines. Utilise une matrice de lignes « machines » et colonnes « événements », puis calcule moyenne et maximum par machine.",
            "Les machines doivent avoir des périodes et définitions d'événements comparables. Une durée moyenne seule ne mesure pas la disponibilité d'un équipement."
          ],
          "code": "import numpy as np\narrêts=np.array([[10,15,20],[5,5,60]],dtype=float)\nprint(\"Moyenne :\",arrêts.mean(axis=1))\nprint(\"Maximum :\",arrêts.max(axis=1))",
          "language": "python",
          "output": "Moyenne : [15.         23.33333333]\nMaximum : [20. 60.]",
          "interpretation": "La deuxième machine a une moyenne plus élevée en raison de son arrêt de 60 minutes. Vérifie la médiane avant toute conclusion."
        }
      ],
      "mistakes": [
        "Interpréter une moyenne comme la valeur typique sans contrôler les valeurs extrêmes.",
        "Confondre la variance avec l'écart-type et leurs unités.",
        "Utiliser axis=0 alors qu'on voulait une statistique par ligne.",
        "Ignorer la convention ddof dans une comparaison d'écarts-types.",
        "Calculer nanmean sans signaler le nombre de valeurs manquantes."
      ],
      "conclusion": [
        "Tu sais maintenant calculer et interpréter des statistiques descriptives avec NumPy. Tu comprends également pourquoi moyenne, médiane, quantiles et dispersion apportent des informations complémentaires.",
        "Ces compétences préparent l'Exploratory Data Analysis : les chiffres doivent toujours être accompagnés d'une description des données et de leurs limites."
      ],
      "faq": [
        {
          "question": "What is the difference between mean and median?",
          "answer": "La moyenne dépend de toutes les valeurs ; la médiane est la valeur centrale de la distribution triée."
        },
        {
          "question": "What does np.std calculate?",
          "answer": "Une mesure de dispersion autour de la moyenne, dans la même unité que les données."
        },
        {
          "question": "What does axis mean in np.mean?",
          "answer": "La dimension que la réduction agrège."
        },
        {
          "question": "What is ddof?",
          "answer": "Un paramètre qui ajuste le dénominateur des calculs de variance et d'écart-type."
        },
        {
          "question": "How does np.nanmean differ from np.mean?",
          "answer": "nanmean ignore les NaN dans le calcul, mais cela ne dispense pas de contrôler leur fréquence."
        }
      ]
    }
  }
];
