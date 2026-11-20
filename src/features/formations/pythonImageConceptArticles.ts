import type {DeepConceptArticle} from './deepConceptTypes';
export const pythonImageConceptArticles:DeepConceptArticle[] = [
  {
    "slug": "image-roi-slicing",
    "pointIndex": 2,
    "article": {
      "eyebrow": "PYTHON · MANIPULATION D’IMAGES",
      "title": "Slicing and Regions of Interest in NumPy Images: A Complete Guide",
      "author": "MonStage Learning",
      "intro": [
        "Dans une image, une région d'intérêt (ROI) est un rectangle de pixels sélectionné pour une analyse. Cette opération permet d'ignorer les zones inutiles et d'examiner précisément une pièce, un défaut ou un détail médical.",
        "Ce cours enseigne les coordonnées, les slices NumPy, les dimensions, l'utilisation d'OpenCV, la translation des coordonnées locales vers l'image complète et le traitement des régions vides."
      ],
      "tldr": [
        "Le découpage d'une ROI suit image[y1:y2, x1:x2]. La première dimension est la ligne, la seconde la colonne et les bornes finales sont exclues.",
        "Une ROI est souvent une vue du tableau d'origine. Modifier son contenu peut modifier les pixels source ; utilise copy pour préserver l'image.",
        "Une détection effectuée en coordonnées locales doit être décalée de (x1,y1) pour retrouver sa position sur l'image entière."
      ],
      "sections": [
        {
          "id": "basics",
          "title": "How Image Slicing Works",
          "paragraphs": [
            "L'indexation NumPy commence à zéro. Pour une image 2D, image[2:5,4:8] sélectionne les lignes 2,3,4 et les colonnes 4,5,6,7. Le résultat forme un rectangle de trois lignes par quatre colonnes.",
            "Cette écriture est plus précise et contrôlable que de découper visuellement une image à la souris. Elle s'applique de la même façon à une image couleur, en conservant implicitement tous les canaux."
          ],
          "code": "import numpy as np\nimage=np.arange(100).reshape(10,10)\nroi=image[2:5,4:8]\nprint(roi.shape)\nprint(roi[0,0])",
          "language": "python",
          "output": "(3, 4)\n24",
          "interpretation": "Le pixel local (0,0) correspond au pixel global (ligne 2, colonne 4)."
        },
        {
          "id": "color",
          "title": "Slicing a Colour Image and Its Channels",
          "paragraphs": [
            "Dans un tableau de forme (H,W,3), les deux premiers slices sélectionnent l'emplacement spatial. Le troisième axe conserve les canaux ou sélectionne un canal particulier.",
            "Une ROI couleur garde ses composantes, mais l'algorithme en aval doit connaître la convention RGB ou BGR et le nombre de canaux attendu."
          ],
          "code": "import numpy as np\nbgr=np.zeros((80,120,3),dtype=np.uint8)\nbgr[20:50,40:90]=(0,255,0)\nroi=bgr[20:50,40:90]\nprint(roi.shape)\nprint(roi[0,0])",
          "language": "python",
          "output": "(30, 50, 3)\n[  0 255   0]",
          "interpretation": "La ROI possède 30 lignes, 50 colonnes et trois canaux BGR. Le premier pixel de la zone est vert."
        },
        {
          "id": "view",
          "title": "Why a ROI Is Often a View",
          "paragraphs": [
            "Un slice NumPy est généralement une vue sur le même bloc de mémoire. Il permet une extraction légère, mais une écriture sur cette ROI modifie aussi les pixels originaux.",
            "Si tu veux tester plusieurs traitements sans altérer les données d'origine, prends une copie avec .copy() et compare les deux résultats."
          ],
          "code": "import numpy as np\nimage=np.zeros((5,5),dtype=np.uint8)\nroi=image[1:3,1:3]\nroi[:]=255\ncopie=image[1:3,1:3].copy()\ncopie[:]=0\nprint(image[1,1])\nprint(copie[0,0])",
          "language": "python",
          "output": "255\n0",
          "interpretation": "La modification de la vue s'est propagée dans image. La copie peut être modifiée indépendamment."
        },
        {
          "id": "coordinates",
          "title": "Local Coordinates vs Global Coordinates",
          "paragraphs": [
            "Un algorithme de détection peut renvoyer des coordonnées relatives à la ROI. Pour dessiner ensuite le résultat sur l'image originale, ajoute les coordonnées du coin supérieur gauche du découpage.",
            "Cette conversion doit aussi être appliquée aux boîtes englobantes et points clés, en respectant l'ordre (x,y) utilisé par l'algorithme de dessin."
          ],
          "code": "x1,y1=40,20\npoint_local=(10,8)\npoint_global=(x1+point_local[0],y1+point_local[1])\nprint(point_global)",
          "language": "python",
          "output": "(50, 28)",
          "interpretation": "Le point situé à dix colonnes et huit lignes de l'origine de la ROI se trouve globalement à x=50,y=28."
        },
        {
          "id": "limits",
          "title": "Checking Crop Bounds and Empty Regions",
          "paragraphs": [
            "Une ROI vide ne permet pas de calculer une moyenne valide et peut faire échouer certains filtres OpenCV. Une erreur de bornes peut donc se propager silencieusement si elle n'est pas contrôlée.",
            "Vérifie que 0 <= x1 < x2 <= largeur et 0 <= y1 < y2 <= hauteur avant l'extraction, puis contrôle roi.size pour les entrées dynamiques."
          ],
          "code": "import numpy as np\nimage=np.zeros((20,30),dtype=np.uint8)\nx1,y1,x2,y2=5,5,15,12\nvalide=0<=x1<x2<=image.shape[1] and 0<=y1<y2<=image.shape[0]\nprint(valide)\nprint(image[y1:y2,x1:x2].shape)",
          "language": "python",
          "output": "True\n(7, 10)",
          "interpretation": "Le rectangle respecte les limites de l'image et contient sept lignes et dix colonnes."
        },
        {
          "id": "practice",
          "title": "Mini-project: Measure a Defect in a Cropped Region",
          "paragraphs": [
            "Une image synthétique contient un petit objet lumineux. Extrais une zone autour de l'objet, calcule le nombre de pixels au-dessus du seuil et situe le centre de la ROI sur l'image originale.",
            "En inspection réelle, ce calcul serait accompagné d'une calibration, d'une validation des seuils et d'une conservation de l'image brute."
          ],
          "code": "import numpy as np\nimage=np.zeros((60,80),dtype=np.uint8)\nimage[25:35,40:50]=200\nx1,y1,x2,y2=35,20,55,40\nroi=image[y1:y2,x1:x2]\nmasque=roi>100\nprint(roi.shape)\nprint(int(masque.sum()))",
          "language": "python",
          "output": "(20, 20)\n100",
          "interpretation": "L'objet lumineux occupe 10×10 pixels à l'intérieur de la ROI 20×20. Le reste correspond au fond."
        }
      ],
      "mistakes": [
        "Confondre x/y avec ligne/colonne.",
        "Oublier les bornes finales exclues dans un slice.",
        "Modifier sans le savoir le tableau source via une ROI qui partage sa mémoire.",
        "Restituer des coordonnées locales sans ajouter le décalage de la ROI.",
        "Transmettre une région vide ou hors bornes à un filtre sans validation."
      ],
      "conclusion": [
        "Tu sais maintenant découper une ROI, lire sa forme, distinguer copie et vue et replacer des coordonnées locales dans l'image complète.",
        "Ces compétences servent à la détection de défauts et à la segmentation de petites structures en conservant le contexte spatial."
      ],
      "faq": [
        {
          "question": "What is a ROI in image processing?",
          "answer": "Une région d'intérêt de l'image sélectionnée pour être analysée indépendamment du reste."
        },
        {
          "question": "How do I crop an image in NumPy?",
          "answer": "Avec image[y1:y2,x1:x2], en gardant l'ordre ligne puis colonne."
        },
        {
          "question": "Do NumPy slices copy the image?",
          "answer": "Ils renvoient souvent une vue partageant la mémoire ; utilise copy pour obtenir une région indépendante."
        },
        {
          "question": "How do I convert local coordinates to global ones?",
          "answer": "Ajoute les coordonnées (x1,y1) de l'origine de la ROI."
        },
        {
          "question": "What happens with an empty ROI?",
          "answer": "Certaines fonctions de mesure ou de traitement peuvent échouer ; vérifie ses dimensions et size."
        }
      ]
    }
  },
  {
    "slug": "image-boolean-masks",
    "pointIndex": 3,
    "article": {
      "eyebrow": "PYTHON · MANIPULATION D’IMAGES",
      "title": "Boolean Masks for Image Segmentation in NumPy: A Complete Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un masque booléen est un tableau de True et False qui indique quels pixels satisfont un critère. C'est l'une des opérations les plus simples et les plus importantes pour isoler un objet par intensité.",
        "Ce cours explique les comparaisons élément par élément, la combinaison des conditions, l'aire d'un masque, la différence entre booléen et uint8, et les contrôles nécessaires à une segmentation exploitable."
      ],
      "tldr": [
        "Une comparaison image > seuil produit une matrice booléenne de même hauteur et largeur que l'image.",
        "Les opérateurs &, | et ~ combinent les masques. Il faut utiliser des parenthèses autour des comparaisons pour une expression correcte.",
        "Un masque permet de compter une aire en pixels et de sélectionner une zone, mais ne prouve pas à lui seul que l'objet recherché a été reconnu."
      ],
      "sections": [
        {
          "id": "definition",
          "title": "What Is a Boolean Image Mask?",
          "paragraphs": [
            "Un masque booléen contient une valeur logique par position. True indique que le pixel satisfait un critère, et False qu'il ne le satisfait pas. Sa forme doit être compatible avec l'image à laquelle il s'applique.",
            "En segmentation classique, le masque peut être produit à partir d'un seuil d'intensité, d'une plage de couleur ou d'une opération géométrique."
          ],
          "code": "import numpy as np\nimage=np.array([[20,140],[200,50]],dtype=np.uint8)\nmasque=image>100\nprint(masque)",
          "language": "python",
          "output": "[[False  True]\n [ True False]]",
          "interpretation": "Deux pixels dépassent le seuil de 100. Le masque garde la position spatiale de ces pixels."
        },
        {
          "id": "count",
          "title": "Count Pixels and Measure Binary Area",
          "paragraphs": [
            "np.count_nonzero compte les positions non nulles, et sur un masque booléen il compte les True. La somme des booléens donne également le nombre de pixels retenus.",
            "La mesure obtenue est une aire en pixels. Une aire physique nécessite la calibration de l'image et éventuellement une correction géométrique."
          ],
          "code": "import numpy as np\nimage=np.zeros((20,20),dtype=np.uint8)\nimage[5:15,5:15]=200\nmasque=image>127\nprint(np.count_nonzero(masque))\nprint(masque.mean())",
          "language": "python",
          "output": "100\n0.25",
          "interpretation": "La zone claire compte 100 pixels sur 400, soit 25 % de l'image."
        },
        {
          "id": "combine",
          "title": "Combine Masks with &, | and ~",
          "paragraphs": [
            "Deux conditions de seuil peuvent être réunies avec &: le pixel doit alors satisfaire les deux. L'opérateur | retient les positions répondant à l'une des conditions ; ~ inverse les booléens.",
            "Utilise des parenthèses lorsque tu compares une image à plusieurs seuils. Les règles doivent être compréhensibles et vérifiables à partir de quelques pixels."
          ],
          "code": "import numpy as np\nimage=np.array([[50,100,150,220]],dtype=np.uint8)\nmasque=(image>=100)&(image<=200)\nprint(masque)",
          "language": "python",
          "output": "[[False  True  True False]]",
          "interpretation": "Seuls 100 et 150 se situent dans la plage inclusive 100–200."
        },
        {
          "id": "dtype",
          "title": "Boolean, uint8 and OpenCV Mask Formats",
          "paragraphs": [
            "NumPy représente les conditions avec dtype bool. De nombreuses fonctions OpenCV utilisent plutôt des masques uint8 contenant 0 et 255.",
            "Convertir un masque booléen en uint8 crée des valeurs 0/1. Il faut multiplier par 255 si une fonction ou un export attend une image binaire visuellement blanche et noire sur la plage 0–255."
          ],
          "code": "import numpy as np\nmasque=np.array([[False,True]],dtype=bool)\nimage_masque=masque.astype(np.uint8)*255\nprint(masque.dtype)\nprint(image_masque)",
          "language": "python",
          "output": "bool\n[[  0 255]]",
          "interpretation": "La conversion produit un masque uint8 adapté à de nombreux usages OpenCV."
        },
        {
          "id": "apply",
          "title": "Apply a Mask to an Image",
          "paragraphs": [
            "Un masque peut être utilisé pour conserver certains pixels et annuler le reste. La sélection doit respecter le nombre de canaux : un masque 2D peut nécessiter une extension d'axe pour une image couleur.",
            "En conservant l'image et le masque séparés, tu peux comparer le résultat du traitement à l'original et corriger les paramètres sans perdre les données."
          ],
          "code": "import numpy as np\nimage=np.array([[10,100],[200,250]],dtype=np.uint8)\nmasque=image>150\nselection=np.where(masque,image,0)\nprint(selection)",
          "language": "python",
          "output": "[[  0   0]\n [200 250]]",
          "interpretation": "Les pixels inférieurs ou égaux à 150 deviennent noirs dans l'image filtrée."
        },
        {
          "id": "case",
          "title": "Mini-project: Build and Validate a Simple Segmentation Mask",
          "paragraphs": [
            "Construis un petit objet synthétique, ajoute un pixel de bruit isolé puis crée un masque par seuil. Compare l'aire totale du masque avec l'aire connue de l'objet.",
            "Tu constateras qu'un seuil peut inclure du bruit. Cela prépare les opérations morphologiques et les mesures de composantes connexes."
          ],
          "code": "import numpy as np\nimage=np.zeros((20,20),dtype=np.uint8)\nimage[5:15,5:15]=220\nimage[0,0]=250\nmasque=image>127\nprint(np.count_nonzero(masque))",
          "language": "python",
          "output": "101",
          "interpretation": "Le carré attendu contient 100 pixels, mais un pixel de bruit est également sélectionné : l'aire mesurée vaut 101."
        }
      ],
      "mistakes": [
        "Traiter un masque booléen comme une image RGB à trois canaux.",
        "Confondre une aire en pixels et une aire en mm².",
        "Utiliser and/or au lieu de &/| pour comparer des tableaux NumPy.",
        "Oublier que astype(uint8) donne 0 et 1, pas automatiquement 0 et 255.",
        "Considérer un masque obtenu par seuil comme une segmentation fiable sans validation."
      ],
      "conclusion": [
        "Tu sais maintenant créer, combiner et utiliser des masques booléens sur des images, ainsi que calculer des aires et convertir les formats pour OpenCV.",
        "Le prochain niveau est de nettoyer les masques par morphologie et de comparer les prédictions à une annotation via IoU ou Dice."
      ],
      "faq": [
        {
          "question": "What is a boolean mask?",
          "answer": "Un tableau de True/False identifiant les positions qui satisfont une condition."
        },
        {
          "question": "How do I create an image mask with NumPy?",
          "answer": "Par exemple masque = image > 127 pour une image grise."
        },
        {
          "question": "How do I combine two masks?",
          "answer": "Avec &, | et ~ sur les tableaux booléens et des parenthèses autour des comparaisons."
        },
        {
          "question": "Why multiply a boolean mask by 255?",
          "answer": "Pour obtenir une image uint8 binaire prenant les valeurs 0 et 255."
        },
        {
          "question": "Can a mask measure object size?",
          "answer": "Oui en pixels ; les mesures physiques nécessitent une calibration."
        }
      ]
    }
  },
  {
    "slug": "image-vectorization-clipping",
    "pointIndex": 4,
    "article": {
      "eyebrow": "PYTHON · MANIPULATION D’IMAGES",
      "title": "Vectorized Image Operations and Clipping: A Complete Guide",
      "author": "MonStage Learning",
      "intro": [
        "Les images peuvent contenir des millions de pixels. Avec NumPy, il est possible de modifier toutes leurs intensités par une seule opération vectorisée, sans écrire une boucle Python pour chaque pixel.",
        "Ce guide couvre les additions et multiplications d'images, le changement de contraste, les conversions de type, le clipping, le broadcasting par canal et la protection contre le débordement uint8."
      ],
      "tldr": [
        "Une opération vectorisée applique le même calcul à tous les pixels d'un tableau. Pour ajuster une intensité, on peut utiliser image.astype(float)*a+b.",
        "Avant de reconvertir une image 8 bits, applique np.clip(...,0,255) pour empêcher les valeurs hors plage.",
        "Sur les images couleur, le broadcasting peut appliquer un facteur différent par canal, mais il faut connaître l'ordre RGB ou BGR."
      ],
      "sections": [
        {
          "id": "vector",
          "title": "Why Vectorized Image Operations Matter",
          "paragraphs": [
            "Une image couleur 1920×1080 comporte plus de deux millions de positions et trois composantes. NumPy peut traiter ces valeurs avec une expression portant directement sur le tableau entier.",
            "Les opérations vectorisées sont généralement plus lisibles et plus efficaces que des boucles Python imbriquées sur les lignes, colonnes et canaux."
          ],
          "code": "import numpy as np\nimage=np.array([[10,20],[30,40]],dtype=float)\nprint(image+5)\nprint(image*2)",
          "language": "python",
          "output": "[[15. 25.]\n [35. 45.]]\n[[20. 40.]\n [60. 80.]]",
          "interpretation": "Les deux opérations modifient toutes les intensités tout en conservant la forme 2×2."
        },
        {
          "id": "brightness",
          "title": "Brightness and Contrast Transformations",
          "paragraphs": [
            "Une transformation affine simple peut s'écrire I' = aI + b. Le coefficient a augmente ou diminue les écarts d'intensité ; le terme b décale les valeurs.",
            "Il faut distinguer le résultat mathématique de la représentation finale. Un calcul peut dépasser 255 avant clipping et doit être vérifié pour ne pas saturer des détails importants."
          ],
          "code": "import numpy as np\nimage=np.array([50,100,200],dtype=float)\nsortie=1.2*image+10\nprint(sortie)",
          "language": "python",
          "output": "[ 70. 130. 250.]",
          "interpretation": "La transformation augmente chaque intensité et les écarts entre niveaux. Les valeurs restent ici dans la plage 0–255."
        },
        {
          "id": "overflow",
          "title": "Preventing uint8 Overflow",
          "paragraphs": [
            "uint8 ne représente que les entiers 0 à 255. Une addition faite sans élargir le type risque de produire un résultat incompatible avec l'intensité attendue, avec des comportements de débordement.",
            "Pour éviter cette erreur, convertis en entier plus large ou en flottant avant le calcul. Applique ensuite clip et reviens au type attendu par ton pipeline."
          ],
          "code": "import numpy as np\nimage=np.array([200,250],dtype=np.uint8)\ncorrige=np.clip(image.astype(np.int16)+20,0,255).astype(np.uint8)\nprint(corrige)",
          "language": "python",
          "output": "[220 255]",
          "interpretation": "La deuxième valeur est limitée à 255, ce qui préserve la plage de pixels 8 bits."
        },
        {
          "id": "broadcast",
          "title": "Broadcasting Corrections Across Colour Channels",
          "paragraphs": [
            "Une image couleur peut être décrite par (H,W,3). Un vecteur de forme (3,) peut être propagé sur les deux axes spatiaux pour appliquer une correction par canal.",
            "Le même code peut conduire à un résultat colorimétrique incorrect si l'ordre réel des canaux est BGR mais que les facteurs sont calculés pour RGB."
          ],
          "code": "import numpy as np\nrgb=np.array([[[100,120,140]]],dtype=float)\ncorrections=np.array([1.1,1.0,0.9])\nsortie=rgb*corrections\nprint(sortie[0,0])",
          "language": "python",
          "output": "[110. 120. 126.]",
          "interpretation": "Les trois canaux reçoivent des facteurs différents. La forme reste (1,1,3)."
        },
        {
          "id": "dtype",
          "title": "Why Dtype Matters for Image Precision",
          "paragraphs": [
            "Les images d'origine uint8 stockent des entiers sans décimales. Certaines transformations ont besoin de flottants pour conserver la précision des calculs intermédiaires.",
            "Une conversion directe vers uint8 peut tronquer ou arrondir selon l'opération et le type. Contrôle explicitement l'ordre des transformations pour préserver ce qui est nécessaire."
          ],
          "code": "import numpy as np\nimage=np.array([10,11],dtype=np.uint8)\nresultat=image.astype(float)/2\nprint(resultat)\nprint(resultat.astype(np.uint8))",
          "language": "python",
          "output": "[5.  5.5]\n[5 5]",
          "interpretation": "La partie décimale 0,5 disparaît lors de la conversion en entier ; il faut choisir la stratégie d'arrondi adaptée."
        },
        {
          "id": "project",
          "title": "Mini-project: Controlled Image Enhancement",
          "paragraphs": [
            "Fabrique une petite image dont une zone est lumineuse puis applique une transformation de contraste. Compare les valeurs avant et après et mesure le nombre de pixels saturés à 255.",
            "Pour une mission réelle, l'amélioration doit préserver les structures utiles et être évaluée sur plusieurs images, pas uniquement selon un rendu visuellement agréable."
          ],
          "code": "import numpy as np\nimage=np.array([30,100,180,230],dtype=np.uint8)\ncalcule=1.4*image.astype(float)+5\nsortie=np.clip(calcule,0,255).astype(np.uint8)\nprint(sortie)\nprint(np.count_nonzero(sortie==255))",
          "language": "python",
          "output": "[ 47 145 255 255]\n2",
          "interpretation": "Les intensités 180 et 230 sont saturées par la transformation ; les détails portés par leurs différences sont perdus à la sortie."
        }
      ],
      "mistakes": [
        "Faire un calcul potentiellement hors plage directement en uint8.",
        "Supposer qu'un gain de contraste améliore toujours les détails.",
        "Oublier les unités et la convention des canaux dans les corrections de couleur.",
        "Convertir en entier avant la fin des calculs puis perdre des décimales.",
        "Évaluer un résultat uniquement à l'œil sans mesurer la saturation ou les changements."
      ],
      "conclusion": [
        "Tu sais maintenant appliquer des transformations vectorisées et contrôler les limites numériques des images. Tu comprends pourquoi dtype, broadcasting et clipping sont des étapes de qualité du traitement.",
        "Tu pourras réutiliser ces principes pour la correction de luminosité, la normalisation et la préparation de jeux d'images pour les CNN."
      ],
      "faq": [
        {
          "question": "What is a vectorized image operation?",
          "answer": "Un calcul NumPy appliqué sur les pixels d'un tableau entier, sans boucle explicite sur chaque pixel."
        },
        {
          "question": "What does np.clip do?",
          "answer": "Limite les valeurs à un intervalle donné, par exemple 0–255."
        },
        {
          "question": "Why convert uint8 to float?",
          "answer": "Pour calculer sans perte précoce de décimales et éviter certaines erreurs de débordement."
        },
        {
          "question": "How do I correct each colour channel differently?",
          "answer": "Avec un vecteur de facteurs de forme (3,) diffusé sur les axes spatiaux."
        },
        {
          "question": "Does clipping recover details?",
          "answer": "Non. Il évite des valeurs hors plage, mais les intensités saturées perdent leurs différences."
        }
      ]
    }
  },
  {
    "slug": "image-compare-matplotlib",
    "pointIndex": 5,
    "article": {
      "eyebrow": "PYTHON · MANIPULATION D’IMAGES",
      "title": "Comparing Images with Matplotlib: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Pour comprendre le traitement d'images, il ne suffit pas de lancer des fonctions. Il faut afficher l'original, le résultat, les détails modifiés et éventuellement des mesures dans des figures comparables.",
        "Ce cours enseigne imshow, cmap, les axes, les figures côte à côte, les histogrammes et les comparaisons de pixels, avec une attention particulière aux conventions BGR/RGB et aux échelles d'intensité."
      ],
      "tldr": [
        "Matplotlib permet d'afficher les images dans Jupyter avec plt.imshow. Pour une image grise, utilise cmap='gray' et une échelle contrôlée.",
        "Pour une image BGR d'OpenCV, convertis en RGB avant l'affichage afin d'éviter l'inversion rouge/bleu.",
        "Une comparaison honnête entre images utilise des échelles cohérentes, des titres, des dimensions documentées et une interprétation."
      ],
      "sections": [
        {
          "id": "imshow",
          "title": "Displaying an Image with imshow",
          "paragraphs": [
            "plt.imshow dessine une matrice comme une image. Pour une image grise, préciser cmap='gray' évite les palettes colorées par défaut qui pourraient induire en erreur.",
            "Les axes représentent les positions spatiales en pixels. Ils peuvent être cachés pour une présentation visuelle, mais doivent être visibles quand l'analyse porte sur des coordonnées."
          ],
          "code": "import matplotlib.pyplot as plt\nimport numpy as np\nimage=np.array([[0,50],[150,255]],dtype=np.uint8)\nplt.imshow(image,cmap=\"gray\",vmin=0,vmax=255)\nplt.title(\"Niveaux de gris\")\nplt.show()\nprint(image.shape)",
          "language": "python",
          "output": "Une image 2×2 en niveaux de gris est affichée.\n(2, 2)",
          "interpretation": "vmin et vmax fixent la plage d'affichage à 0–255. Une même intensité conserve ainsi le même gris entre différentes figures."
        },
        {
          "id": "side-by-side",
          "title": "Original and Processed Image Side by Side",
          "paragraphs": [
            "Une figure à plusieurs axes permet de comparer une image source et une transformation. Utilise des titres simples et des échelles identiques pour que les différences soient interprétables.",
            "Ce style de comparaison est une pratique de base dans un rapport de stage : il aide à expliquer l'effet d'un filtre au lieu d'afficher seulement sa sortie finale."
          ],
          "code": "import matplotlib.pyplot as plt\nimport numpy as np\noriginal=np.array([[0,40],[160,250]],dtype=np.uint8)\nfiltre=np.clip(original.astype(float)+20,0,255).astype(np.uint8)\nfig,axes=plt.subplots(1,2,figsize=(6,3))\naxes[0].imshow(original,cmap=\"gray\",vmin=0,vmax=255)\naxes[1].imshow(filtre,cmap=\"gray\",vmin=0,vmax=255)\naxes[0].set_title(\"Original\")\naxes[1].set_title(\"Après correction\")\nplt.tight_layout();plt.show()",
          "language": "python",
          "output": "Deux figures comparables de même échelle de gris sont affichées.",
          "interpretation": "Le pixel initialement à 250 atteint 255 après correction, révélant une saturation."
        },
        {
          "id": "colors",
          "title": "BGR vs RGB When Displaying OpenCV Images",
          "paragraphs": [
            "OpenCV utilise traditionnellement BGR alors que Matplotlib attend RGB. Lorsque les canaux ne sont pas convertis, les tons rouges peuvent apparaître bleus.",
            "Il faut connaître la représentation courante des données. Une double conversion ou une correction dans le mauvais ordre produit aussi un affichage incorrect."
          ],
          "code": "import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\nbgr=np.array([[[0,0,255]]],dtype=np.uint8)\nrgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)\nplt.imshow(rgb);plt.axis(\"off\");plt.show()\nprint(rgb[0,0])",
          "language": "python",
          "output": "Un pixel rouge est affiché.\n[255   0   0]",
          "interpretation": "La valeur du rouge se situe au premier canal après conversion RGB."
        },
        {
          "id": "histograms",
          "title": "Plotting the Image Histogram",
          "paragraphs": [
            "L'histogramme montre combien de pixels appartiennent à chaque niveau ou intervalle d'intensité. Il complète l'image : un contraste faible peut être détecté par une distribution très concentrée.",
            "Deux images peuvent présenter le même histogramme sans avoir les mêmes formes spatiales. Utilise toujours l'image et la distribution ensemble."
          ],
          "code": "import numpy as np\nimage=np.array([0,0,100,200,255],dtype=np.uint8)\nfrequences,_=np.histogram(image,bins=[0,1,128,256])\nprint(frequences)",
          "language": "python",
          "output": "[2 1 2]",
          "interpretation": "Deux pixels valent zéro, un se trouve dans l'intervalle [1,128[ et deux dans [128,256[."
        },
        {
          "id": "difference",
          "title": "Difference Images and Error Maps",
          "paragraphs": [
            "Soustraire deux images permet de visualiser où un traitement a changé des intensités. Pour éviter les problèmes de uint8, convertis en type signé ou flottant avant de calculer la différence absolue.",
            "Une carte de différences montre les positions modifiées mais n'indique pas directement si la transformation est bénéfique. Une référence ou un objectif métier reste nécessaire."
          ],
          "code": "import numpy as np\navant=np.array([[10,20],[30,40]],dtype=np.uint8)\napres=np.array([[10,25],[30,50]],dtype=np.uint8)\ndiff=np.abs(apres.astype(int)-avant.astype(int))\nprint(diff)",
          "language": "python",
          "output": "[[ 0  5]\n [ 0 10]]",
          "interpretation": "Deux pixels ont changé : l'un de 5 unités et l'autre de 10. Les autres positions sont identiques."
        },
        {
          "id": "project",
          "title": "Mini-project: A Four-panel Image Report",
          "paragraphs": [
            "Construis un rapport de quatre panneaux : original, image traitée, histogramme des intensités et différence absolue. Ajoute titres, axes et paramètres utilisés.",
            "Dans une équipe technique, ce rapport permet de comparer plusieurs versions d'un filtre sans dépendre d'une impression visuelle imprécise."
          ],
          "code": "import numpy as np\noriginal=np.array([[20,60],[120,220]],dtype=np.uint8)\ntraite=np.clip(original.astype(int)+30,0,255).astype(np.uint8)\ndiff=np.abs(traite.astype(int)-original.astype(int))\nprint(\"Moyenne différence :\",diff.mean())\nprint(\"Max différence :\",diff.max())",
          "language": "python",
          "output": "Moyenne différence : 30.0\nMax différence : 30",
          "interpretation": "Toutes les intensités augmentent ici de 30 sans saturation ; la différence absolue est donc constante."
        }
      ],
      "mistakes": [
        "Afficher une image OpenCV BGR comme si elle était RGB.",
        "Comparer des images de gris dont les échelles colorimétriques diffèrent.",
        "Utiliser uniquement le résultat final sans montrer l'original.",
        "Soustraire directement des tableaux uint8 et risquer des valeurs incorrectes.",
        "Interpréter un histogramme comme une carte des positions spatiales."
      ],
      "conclusion": [
        "Tu sais maintenant produire une comparaison visuelle structurée avec Matplotlib : images côte à côte, histogrammes et cartes de différences.",
        "Ces graphiques sont une partie essentielle d'un rapport technique reproductible en traitement d'images et rendent tes choix d'algorithmes plus faciles à justifier."
      ],
      "faq": [
        {
          "question": "How do I display a grayscale image with Matplotlib?",
          "answer": "Avec plt.imshow(image,cmap='gray',vmin=0,vmax=255) pour une image uint8."
        },
        {
          "question": "Why use equal display scales?",
          "answer": "Pour rendre les intensités comparables entre l'original et le traitement."
        },
        {
          "question": "How do I display an OpenCV colour image?",
          "answer": "Convertis BGR vers RGB avant plt.imshow."
        },
        {
          "question": "What is an image difference map?",
          "answer": "Une représentation de la variation des pixels entre deux images alignées."
        },
        {
          "question": "Why combine an image and its histogram?",
          "answer": "Parce que l'image montre les positions spatiales tandis que l'histogramme résume la distribution des intensités."
        }
      ]
    }
  }
];
