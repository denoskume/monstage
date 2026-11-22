import type {DeepConceptArticle} from './deepConceptTypes';
export const opencvConceptColors:DeepConceptArticle[] = [
  {
    "slug": "opencv-bgr-rgb",
    "pointIndex": 2,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "BGR and RGB Colour Spaces in OpenCV: A Complete Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une image couleur contient généralement trois composantes par pixel. Beaucoup d'outils utilisent l'ordre RGB, mais OpenCV représente traditionnellement les images couleur dans l'ordre BGR.",
        "Cette différence est une source d'erreurs fréquentes dans les notebooks. Tu vas comprendre les canaux, observer leurs valeurs numériques, utiliser cv2.cvtColor et afficher correctement une image avec Matplotlib."
      ],
      "tldr": [
        "RGB signifie Red-Green-Blue et BGR Blue-Green-Red. Les valeurs codées peuvent être les mêmes, mais les composantes occupent des positions différentes.",
        "cv2.imread produit généralement une image BGR, tandis que plt.imshow attend RGB pour une image couleur à trois canaux.",
        "cv2.cvtColor(image, cv2.COLOR_BGR2RGB) transforme l'ordre des canaux. Vérifie les valeurs d'un pixel pour comprendre la conversion."
      ],
      "sections": [
        {
          "id": "channels",
          "title": "How Three Colour Channels Represent a Pixel",
          "paragraphs": [
            "Un pixel RGB est un triplet (rouge, vert, bleu). En 8 bits, chaque composante prend une valeur comprise entre 0 et 255. Par exemple, (255, 0, 0) représente du rouge pur en RGB.",
            "Le même triplet de nombres serait interprété comme du bleu pur dans un tableau BGR. Les valeurs numériques n'expliquent la couleur que lorsqu'on connaît la convention utilisée."
          ],
          "code": "import numpy as np\nrgb=np.array([[[255,0,0]]],dtype=np.uint8)\nprint(rgb.shape)\nprint(rgb[0,0])",
          "language": "python",
          "output": "(1, 1, 3)\n[255   0   0]",
          "interpretation": "La forme possède un seul pixel à trois composantes. Dans la convention RGB, la première composante indique le rouge."
        },
        {
          "id": "bgr",
          "title": "Why OpenCV Uses BGR",
          "paragraphs": [
            "La convention BGR est historique dans OpenCV et le traitement d'images. Les fonctions de lecture et d'écriture couleur de la bibliothèque utilisent généralement cet ordre.",
            "Une photographie n'est pas modifiée physiquement par le nom BGR : le changement se situe dans la manière d'interpréter les valeurs du tableau."
          ],
          "code": "import numpy as np\nbgr=np.array([[[0,0,255]]],dtype=np.uint8)\nprint(\"Bleu :\",bgr[0,0,0])\nprint(\"Rouge :\",bgr[0,0,2])",
          "language": "python",
          "output": "Bleu : 0\nRouge : 255",
          "interpretation": "Dans le triplet BGR [0,0,255], le dernier canal représente le rouge maximal."
        },
        {
          "id": "cvtcolor",
          "title": "Converting BGR to RGB with cvtColor",
          "paragraphs": [
            "cv2.cvtColor applique une transformation de représentation entre espaces colorimétriques. La constante COLOR_BGR2RGB précise le sens de la conversion.",
            "Cette opération évite les affichages avec rouge et bleu inversés dans les bibliothèques qui attendent le RGB."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.array([[[0,0,255]]],dtype=np.uint8)\nrgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)\nprint(rgb[0,0])",
          "language": "python",
          "output": "[255   0   0]",
          "interpretation": "Le rouge passe du troisième canal au premier ; l'image continue à représenter un pixel rouge."
        },
        {
          "id": "channel-inspection",
          "title": "Inspecting Separate BGR Channels",
          "paragraphs": [
            "Tu peux examiner les composantes par indexation ou via cv2.split. Pour les pixels d'une image, chaque canal est une matrice 2D de même hauteur et largeur.",
            "Visualiser un seul canal en niveaux de gris montre où sa composante est forte, mais ne constitue pas une conversion de toute l'image en gris."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.array([[[10,20,200]]],dtype=np.uint8)\nbleu,vert,rouge=cv2.split(bgr)\nprint(bleu[0,0],vert[0,0],rouge[0,0])",
          "language": "python",
          "output": "10 20 200",
          "interpretation": "Les trois matrices correspondent aux trois canaux du tableau source."
        },
        {
          "id": "matplotlib",
          "title": "Displaying OpenCV Images with Matplotlib",
          "paragraphs": [
            "Matplotlib permet d'afficher des figures dans Jupyter. Pour afficher une image BGR correctement, convertis-la en RGB avant de l'envoyer à plt.imshow.",
            "Si tu affiches directement du BGR, les zones rouges et bleues peuvent être échangées. C'est un bug de visualisation, pas une modification des pixels dans le fichier."
          ],
          "code": "import cv2\nimport numpy as np\nimport matplotlib.pyplot as plt\nimage_bgr=np.zeros((20,30,3),dtype=np.uint8)\nimage_bgr[:,:]=(0,0,255)\nimage_rgb=cv2.cvtColor(image_bgr,cv2.COLOR_BGR2RGB)\nplt.imshow(image_rgb)\nplt.axis(\"off\")\nplt.show()",
          "language": "python",
          "output": "Un rectangle rouge apparaît dans le notebook.",
          "interpretation": "Le tableau BGR (0,0,255) est converti en RGB (255,0,0) avant affichage."
        },
        {
          "id": "exercise",
          "title": "Mini-project: Check a Pixel Before and After Conversion",
          "paragraphs": [
            "Construis une image comportant une moitié rouge et une moitié bleue. Affiche la matrice originale puis les canaux après conversion. Vérifie au moins deux pixels numériquement.",
            "Explique dans ton carnet pourquoi le même triplet peut produire une couleur différente lorsqu'une bibliothèque suppose l'ordre RGB ou BGR."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.zeros((2,4,3),dtype=np.uint8)\nbgr[:,:2]=(0,0,255)\nbgr[:,2:]=(255,0,0)\nrgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)\nprint(rgb[0,0],rgb[0,3])",
          "language": "python",
          "output": "[255   0   0] [  0   0 255]",
          "interpretation": "Le premier pixel est rouge dans RGB et le dernier est bleu. La conversion respecte la scène colorée."
        }
      ],
      "mistakes": [
        "Afficher une image BGR directement dans Matplotlib comme si elle était RGB.",
        "Confondre un canal isolé et une conversion globale en niveaux de gris.",
        "Supposer que le premier canal d'un tableau OpenCV est toujours le rouge.",
        "Transformer une image déjà RGB avec COLOR_BGR2RGB une deuxième fois.",
        "Oublier le type et la plage de valeurs lors de la manipulation des canaux."
      ],
      "conclusion": [
        "Tu sais maintenant expliquer pourquoi OpenCV utilise BGR et comment convertir correctement en RGB, inspecter les canaux et vérifier une image dans Matplotlib.",
        "Tu peux passer aux images en niveaux de gris, qui simplifient de nombreuses opérations de filtrage et de détection de contours."
      ],
      "faq": [
        {
          "question": "What is the difference between BGR and RGB?",
          "answer": "L'ordre des composantes : BGR stocke Bleu, Vert, Rouge et RGB Rouge, Vert, Bleu."
        },
        {
          "question": "Why does my image look blue instead of red?",
          "answer": "Les canaux d'un tableau BGR ont probablement été interprétés comme RGB."
        },
        {
          "question": "How do I convert BGR to RGB?",
          "answer": "Avec cv2.cvtColor(image,cv2.COLOR_BGR2RGB)."
        },
        {
          "question": "What does cv2.split return?",
          "answer": "Les matrices de canaux séparées de l'image."
        },
        {
          "question": "Does colour conversion change the resolution?",
          "answer": "Une simple conversion BGR vers RGB conserve généralement la hauteur et la largeur."
        }
      ]
    }
  },
  {
    "slug": "opencv-grayscale",
    "pointIndex": 2,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "Grayscale Images in OpenCV: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une image en niveaux de gris possède une seule valeur d'intensité par pixel, contrairement à une image couleur qui contient généralement trois canaux. Cette représentation simplifie le seuillage, certains filtres et l'extraction de contours.",
        "Ce cours explique le sens des intensités, la différence entre chargement en gris et conversion, les formules intuitives, les histogrammes et les contrôles avant traitement."
      ],
      "tldr": [
        "Une image grise 8 bits contient généralement des intensités de 0 (noir) à 255 (blanc). Sa forme NumPy est (hauteur, largeur).",
        "cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY) convertit une image couleur en gris selon une pondération adaptée des canaux.",
        "Il ne faut pas confondre des intensités de gris avec des classes d'objets ; un masque binaire est encore une représentation différente."
      ],
      "sections": [
        {
          "id": "pixels",
          "title": "How Grayscale Pixels Work",
          "paragraphs": [
            "Dans une image en gris, chaque position est représentée par une intensité. Une valeur de 0 représente le noir, 255 le blanc, et les valeurs intermédiaires décrivent des gris plus ou moins clairs.",
            "La forme (H,W) ne possède pas d'axe de couleur. Le premier indice d'accès correspond à la ligne et le deuxième à la colonne."
          ],
          "code": "import numpy as np\ngris=np.array([[0,127,255],[50,100,200]],dtype=np.uint8)\nprint(gris.shape)\nprint(gris[0,2])",
          "language": "python",
          "output": "(2, 3)\n255",
          "interpretation": "La première ligne et la troisième colonne contiennent du blanc. Le tableau comporte deux lignes et trois colonnes."
        },
        {
          "id": "convert",
          "title": "Converting a BGR Image to Grayscale",
          "paragraphs": [
            "cv2.cvtColor utilise une conversion colorimétrique pour produire une intensité par pixel. Une pondération intuitive du rouge, vert et bleu est approximativement 0,299R + 0,587G + 0,114B pour les codages considérés.",
            "Le canal vert contribue davantage à cette luminance approximative que le bleu. La conversion ne revient donc pas simplement à prendre la moyenne arithmétique des canaux."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.array([[[0,255,0]]],dtype=np.uint8)\ngris=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY)\nprint(gris.shape)\nprint(int(gris[0,0]))",
          "language": "python",
          "output": "(1, 1)\n150",
          "interpretation": "Le vert pur est converti en une intensité grise d'environ 150 sur 255 selon la transformation OpenCV."
        },
        {
          "id": "reading",
          "title": "Loading Directly in Grayscale",
          "paragraphs": [
            "cv2.imread accepte un flag IMREAD_GRAYSCALE qui demande le décodage d'une image en niveaux de gris. Cette approche peut convenir lorsque les canaux couleur ne sont pas nécessaires.",
            "Si les informations de couleur sont importantes pour une étape ultérieure, conserve aussi l'original BGR. Une conversion vers le gris ne permet pas de reconstruire exactement les couleurs perdues."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.zeros((15,20,3),dtype=np.uint8)\ncv2.imwrite(\"source_couleur.png\",bgr)\ngris=cv2.imread(\"source_couleur.png\",cv2.IMREAD_GRAYSCALE)\nprint(gris.shape)",
          "language": "python",
          "output": "(15, 20)",
          "interpretation": "L'image relue contient un seul canal de gris, avec sa hauteur et sa largeur conservées."
        },
        {
          "id": "hist",
          "title": "The Grayscale Histogram",
          "paragraphs": [
            "Un histogramme compte le nombre de pixels pour chaque niveau d'intensité ou pour des intervalles d'intensités. Il aide à comprendre le contraste, la dynamique et la séparation possible entre fond et objet.",
            "Deux images peuvent avoir des histogrammes semblables mais des formes spatiales différentes : l'histogramme ne conserve pas la position des pixels."
          ],
          "code": "import numpy as np\ngris=np.array([0,0,128,255],dtype=np.uint8)\nhist,_=np.histogram(gris,bins=[0,1,129,256])\nprint(hist)",
          "language": "python",
          "output": "[2 1 1]",
          "interpretation": "Deux pixels appartiennent au premier intervalle, un au deuxième et un au troisième."
        },
        {
          "id": "threshold",
          "title": "From Grayscale to a Binary Mask",
          "paragraphs": [
            "Le seuillage transforme les intensités en classes de premier plan et de fond. Il produit souvent un masque avec deux valeurs, par exemple 0 et 255, mais cette classification ne signifie pas que les objets ont été reconnus sémantiquement.",
            "Le seuil dépend de l'éclairage, du contraste et des caractéristiques de l'objet. Il doit être testé sur plusieurs images représentatives."
          ],
          "code": "import cv2\nimport numpy as np\ngris=np.array([[50,150,230]],dtype=np.uint8)\n_,masque=cv2.threshold(gris,127,255,cv2.THRESH_BINARY)\nprint(masque)",
          "language": "python",
          "output": "[[  0 255 255]]",
          "interpretation": "Deux pixels dépassent 127 et appartiennent à la classe blanche."
        },
        {
          "id": "case",
          "title": "Mini-project: Measure Bright Regions",
          "paragraphs": [
            "Crée une petite image synthétique en niveaux de gris avec une région lumineuse. Transforme-la en masque puis calcule l'aire en pixels de la zone retenue.",
            "Une aire en pixels ne correspond pas directement à une aire physique : il faut une calibration pour obtenir des unités comme les millimètres carrés."
          ],
          "code": "import numpy as np\ngris=np.full((20,20),40,dtype=np.uint8)\ngris[5:15,5:15]=200\nmasque=gris>120\nprint(np.count_nonzero(masque))",
          "language": "python",
          "output": "100",
          "interpretation": "La région 10×10 représente 100 pixels, indépendamment de son intensité 200."
        }
      ],
      "mistakes": [
        "Traiter un tableau (H,W) comme s'il avait trois canaux.",
        "Considérer une conversion en gris comme une moyenne simple des canaux BGR.",
        "Confondre image grise et masque binaire.",
        "Interpréter un histogramme comme une carte spatiale des objets.",
        "Déduire des dimensions physiques à partir du nombre de pixels sans calibration."
      ],
      "conclusion": [
        "Tu sais maintenant lire et convertir des images en gris, interpréter leurs intensités et mesurer une région à l'aide d'un seuil simple.",
        "Cette représentation prépare les cours de contraste, histogrammes, convolution, Canny et segmentation."
      ],
      "faq": [
        {
          "question": "What is a grayscale image?",
          "answer": "Une image où chaque pixel est représenté par une seule intensité plutôt que par trois composantes couleur."
        },
        {
          "question": "How do I convert BGR to grayscale?",
          "answer": "Avec cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)."
        },
        {
          "question": "What is the shape of a grayscale image?",
          "answer": "En général (hauteur,largeur) pour une image 2D."
        },
        {
          "question": "Can grayscale restore the original RGB colours?",
          "answer": "Non, la conversion réduit l'information et ne permet pas une reconstruction fidèle des couleurs."
        },
        {
          "question": "What is the difference between grayscale and a binary mask?",
          "answer": "Le gris contient de nombreux niveaux d'intensité ; le masque binaire contient deux catégories."
        }
      ]
    }
  },
  {
    "slug": "opencv-hsv",
    "pointIndex": 3,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "HSV Colour Space in OpenCV: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "HSV représente les couleurs selon leur teinte, leur saturation et leur valeur. Il est souvent utile pour sélectionner une couleur dans une image sans travailler directement sur les composantes rouge, vert et bleu.",
        "Ce guide présente les trois composantes, leur plage de valeurs dans OpenCV, la conversion BGR→HSV, les masques avec inRange et les limites dues à l'éclairage."
      ],
      "tldr": [
        "H signifie Hue (teinte), S Saturation et V Value (luminosité dans ce modèle).",
        "Pour les images uint8, OpenCV utilise couramment H dans 0–179 et S/V dans 0–255. La teinte rouge traverse la frontière de l'intervalle de hue.",
        "cv2.inRange crée un masque des pixels situés dans une plage HSV ; cette sélection doit être vérifiée sur des images et éclairages variés."
      ],
      "sections": [
        {
          "id": "meaning",
          "title": "Hue, Saturation and Value Explained",
          "paragraphs": [
            "La teinte H représente une catégorie de couleur autour d'un cercle, par exemple rouge, vert ou bleu. La saturation S mesure l'intensité colorée ; la valeur V représente une composante de luminosité.",
            "Une couleur peu saturée se rapproche du gris et sa teinte peut devenir peu fiable. C'est pourquoi une sélection par couleur peut nécessiter des seuils combinés sur H, S et V."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.array([[[0,0,255]]],dtype=np.uint8)\nhsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV)\nprint(hsv[0,0])",
          "language": "python",
          "output": "[  0 255 255]",
          "interpretation": "Le rouge pur se trouve proche de H=0, avec saturation et valeur maximales dans cette représentation."
        },
        {
          "id": "convert",
          "title": "Converting BGR Images to HSV",
          "paragraphs": [
            "cv2.cvtColor(image,cv2.COLOR_BGR2HSV) convertit chaque pixel. Le tableau obtenu garde normalement sa forme (H,W,3) mais ses trois canaux ont une signification différente.",
            "Ne traite pas le canal H comme une intensité linéaire classique. Il décrit une grandeur circulaire, et des teintes proches peuvent être séparées par la frontière 0/179."
          ],
          "code": "import cv2\nimport numpy as np\nbgr=np.zeros((6,8,3),dtype=np.uint8)\nhsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV)\nprint(hsv.shape)",
          "language": "python",
          "output": "(6, 8, 3)",
          "interpretation": "La conversion ne change pas les dimensions spatiales de l'image synthétique."
        },
        {
          "id": "range",
          "title": "OpenCV HSV Channel Ranges",
          "paragraphs": [
            "Dans la représentation HSV uint8 habituelle d'OpenCV, la teinte utilise une plage 0–179, tandis que saturation et valeur utilisent 0–255. Cette convention diffère de certains logiciels utilisant 0–360 degrés pour la teinte.",
            "Avant de définir des seuils, vérifie la plage utilisée par ton tableau et le type dtype. Une valeur H=180 n'appartient pas à l'intervalle habituel du codage uint8 d'OpenCV."
          ],
          "code": "import cv2\nimport numpy as np\nbleu=np.array([[[255,0,0]]],dtype=np.uint8)\nhsv=cv2.cvtColor(bleu,cv2.COLOR_BGR2HSV)\nprint(hsv[0,0])",
          "language": "python",
          "output": "[120 255 255]",
          "interpretation": "Le bleu pur possède ici une teinte H d'environ 120 dans la convention OpenCV."
        },
        {
          "id": "inrange",
          "title": "Thresholding Colours with cv2.inRange",
          "paragraphs": [
            "inRange compare les trois canaux à des limites basses et hautes puis produit un masque binaire. Il permet par exemple d'isoler une zone bleue dans un décor.",
            "Un seuil fonctionne sur la représentation choisie, pas sur le sens du mot « bleu ». La plage est à calibrer sur des exemples représentatifs."
          ],
          "code": "import cv2\nimport numpy as np\nhsv=np.array([[[120,255,255],[0,255,255]]],dtype=np.uint8)\nbas=np.array([100,150,100])\nhaut=np.array([130,255,255])\nmasque=cv2.inRange(hsv,bas,haut)\nprint(masque)",
          "language": "python",
          "output": "[[255   0]]",
          "interpretation": "Le premier pixel est dans la plage bleue définie, le deuxième en dehors."
        },
        {
          "id": "red-wrap",
          "title": "Why Red Often Needs Two Hue Intervals",
          "paragraphs": [
            "Les teintes suivent un cercle, et le rouge peut se trouver près de H=0 et de H=179. Une seule plage contiguë peut manquer une partie des rouges si elle ignore cette frontière.",
            "On crée alors deux masques, puis on les combine. Les limites exactes varient selon l'éclairage, la caméra et la saturation."
          ],
          "code": "import cv2\nimport numpy as np\nh=np.array([[[0,230,230],[178,230,230]]],dtype=np.uint8)\na=cv2.inRange(h,(0,150,100),(10,255,255))\nb=cv2.inRange(h,(170,150,100),(179,255,255))\nprint(cv2.bitwise_or(a,b))",
          "language": "python",
          "output": "[[255 255]]",
          "interpretation": "Les pixels proches des deux extrémités de la teinte sont sélectionnés comme rouges."
        },
        {
          "id": "case",
          "title": "Professional Example: Segment a Coloured Part",
          "paragraphs": [
            "Une caméra industrielle observe des pièces colorées sur un fond relativement stable. Un masque HSV peut aider à extraire la zone correspondant à une pièce, mais il faut comparer le résultat à une annotation ou à une inspection manuelle.",
            "Ne conclus pas à une bonne détection après un seul cas : teste les variations d'éclairage, de balance des blancs et de brillance."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((20,20,3),dtype=np.uint8)\nimage[5:15,5:15]=(255,0,0) # bleu en BGR\nhsv=cv2.cvtColor(image,cv2.COLOR_BGR2HSV)\nmasque=cv2.inRange(hsv,(100,120,100),(130,255,255))\nprint(np.count_nonzero(masque))",
          "language": "python",
          "output": "100",
          "interpretation": "La région bleue 10×10 est retrouvée dans cet exemple synthétique. Les paramètres doivent être validés sur des photos réelles."
        }
      ],
      "mistakes": [
        "Appliquer des seuils HSV à une image qui est encore en BGR.",
        "Utiliser une plage de hue 0–360 sur un tableau OpenCV uint8 standard.",
        "Oublier le caractère circulaire de la teinte rouge.",
        "Ignorer saturation et luminosité lors d'une sélection par teinte.",
        "Supposer qu'une plage HSV fonctionne sous tous les éclairages."
      ],
      "conclusion": [
        "Tu sais maintenant interpréter H, S et V, convertir une image BGR en HSV et produire des masques de couleur.",
        "Tu peux utiliser cette technique dans un pipeline de segmentation classique, en gardant une procédure de validation sur plusieurs images."
      ],
      "faq": [
        {
          "question": "What does HSV stand for?",
          "answer": "Hue, Saturation, Value : teinte, saturation et composante de luminosité."
        },
        {
          "question": "Why is HSV useful in image processing?",
          "answer": "Il permet d'isoler des plages de couleurs en séparant une teinte de sa saturation et de sa luminosité."
        },
        {
          "question": "What is the OpenCV hue range for uint8?",
          "answer": "La plage courante est de 0 à 179 pour H."
        },
        {
          "question": "Why use two ranges for red?",
          "answer": "Parce que le rouge traverse la frontière de la teinte circulaire."
        },
        {
          "question": "What does cv2.inRange return?",
          "answer": "Un masque binaire marquant les pixels dont les canaux respectent les bornes choisies."
        }
      ]
    }
  },
  {
    "slug": "opencv-formats-validation",
    "pointIndex": 4,
    "article": {
      "eyebrow": "OPENCV · IMAGE PROCESSING",
      "title": "Image Formats and Input Validation in OpenCV: A Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une analyse d'images fiable commence par comprendre le format du fichier et contrôler l'information qui a réellement été chargée. JPEG, PNG et TIFF peuvent différer par compression, profondeur des pixels et prise en charge des canaux.",
        "Ce cours explique les différences importantes, les contrôles de taille, dtype et canaux, puis la préparation d'une image pour un traitement sans perte accidentelle des données utiles."
      ],
      "tldr": [
        "JPEG utilise généralement une compression avec perte adaptée aux photos ; PNG stocke couramment des images sans perte ; TIFF peut conserver des images scientifiques avec davantage de formats et profondeurs.",
        "Une extension ne garantit pas l'intégrité : valide le décodage, les dimensions, le type, la plage des valeurs et les canaux attendus.",
        "Ne convertis pas systématiquement une image 16 bits en uint8 sans comprendre l'effet sur les détails et la dynamique."
      ],
      "sections": [
        {
          "id": "jpeg",
          "title": "JPEG and Lossy Compression",
          "paragraphs": [
            "JPEG réduit la taille de fichier en utilisant une compression généralement avec perte. À forte compression, des artefacts peuvent apparaître autour des contours et des textures fines.",
            "Pour un jeu d'images de machine learning, des JPEG peuvent convenir, mais pour analyser précisément des intensités ou conserver des masques de segmentation, il faut examiner le risque de perte."
          ],
          "code": "import cv2\nimport numpy as np\nimage=np.zeros((30,30,3),dtype=np.uint8)\nimage[10:20,10:20]=255\ncv2.imwrite(\"essai.jpg\",image,[cv2.IMWRITE_JPEG_QUALITY,70])\nrelue=cv2.imread(\"essai.jpg\")\nprint(relue is not None)",
          "language": "python",
          "output": "True si le fichier peut être enregistré puis relu.",
          "interpretation": "La qualité JPEG affecte la compression. Les pixels relus peuvent différer des valeurs originales."
        },
        {
          "id": "png",
          "title": "PNG and Lossless Storage",
          "paragraphs": [
            "PNG utilise une compression sans perte pour les valeurs codées compatibles. Il est souvent choisi pour les masques, les images de référence ou les schémas où l'on veut préserver les intensités.",
            "Une compression sans perte ne signifie pas que toute conversion précédente a préservé les données. Un masque redimensionné par interpolation linéaire peut déjà avoir changé avant l'enregistrement."
          ],
          "code": "import cv2\nimport numpy as np\nmasque=np.array([[0,255],[255,0]],dtype=np.uint8)\ncv2.imwrite(\"masque.png\",masque)\nretour=cv2.imread(\"masque.png\",cv2.IMREAD_GRAYSCALE)\nprint(np.array_equal(masque,retour))",
          "language": "python",
          "output": "True si la sauvegarde et la lecture PNG réussissent.",
          "interpretation": "Les quatre valeurs 0 ou 255 sont préservées lors de cette écriture et relecture PNG."
        },
        {
          "id": "tiff",
          "title": "TIFF and Higher Bit Depths",
          "paragraphs": [
            "TIFF est un conteneur utilisé dans certains contextes scientifiques et industriels. Selon les images et les logiciels, il peut conserver des profondeurs plus élevées que les huit bits habituels des photos.",
            "Pour des mesures dont les intensités dépassent 255, conserve le dtype adapté. Une conversion directe en uint8 peut réduire ou tronquer l'information nécessaire à l'analyse."
          ],
          "code": "import numpy as np\nimage16=np.array([[0,1000,40000]],dtype=np.uint16)\nprint(image16.dtype)\nprint(image16.max())",
          "language": "python",
          "output": "uint16\n40000",
          "interpretation": "Le type uint16 peut représenter des valeurs bien supérieures à 255. Une conversion prématurée pourrait perdre cette dynamique."
        },
        {
          "id": "inspect",
          "title": "Checking Shape, Dtype and Pixel Range",
          "paragraphs": [
            "Après le chargement, examine shape, ndim, dtype, min et max. Ces attributs indiquent si l'image correspond à la forme attendue et si les intensités entrent dans la plage requise par ton algorithme.",
            "Les contrôles doivent être enregistrés dans le pipeline. Une photographie vide, un masque multicanal inattendu ou des valeurs saturées peuvent rendre l'analyse invalide."
          ],
          "code": "import numpy as np\nimage=np.array([[0,80],[150,255]],dtype=np.uint8)\nprint(image.shape,image.ndim,image.dtype)\nprint(image.min(),image.max())",
          "language": "python",
          "output": "(2, 2) 2 uint8\n0 255",
          "interpretation": "L'image synthétique possède deux axes, un type uint8 et couvre toute la dynamique 0–255."
        },
        {
          "id": "channels",
          "title": "Alpha Channels and Unexpected Image Shapes",
          "paragraphs": [
            "Une image PNG peut posséder un canal alpha qui décrit la transparence. Une lecture avec IMREAD_UNCHANGED peut retourner quatre canaux au lieu de trois.",
            "Un programme qui suppose toujours shape[2] == 3 échouera sur une image grise ou à quatre canaux. Adapte les contrôles à la représentation réellement attendue."
          ],
          "code": "import numpy as np\nrgba=np.zeros((10,10,4),dtype=np.uint8)\nprint(rgba.shape)\nprint(rgba.shape[2])",
          "language": "python",
          "output": "(10, 10, 4)\n4",
          "interpretation": "L'image comporte un quatrième canal. Un traitement de couleur doit vérifier comment ce canal doit être conservé ou ignoré."
        },
        {
          "id": "project",
          "title": "Mini-project: Validate Before an Industrial Pipeline",
          "paragraphs": [
            "Crée une petite fonction de vérification qui exige une image non vide, à deux ou trois dimensions, et d'un type connu. Elle doit échouer clairement si l'entrée ne correspond pas au contrat prévu.",
            "Ajoute ensuite un contrôle de résolution minimale et un journal de la source, afin de refuser proprement des entrées impropres à la mesure."
          ],
          "code": "import numpy as np\ndef valider_image(image):\n    if image is None or image.size == 0:\n        raise ValueError(\"Image absente ou vide\")\n    if image.ndim not in (2,3):\n        raise ValueError(\"Nombre d'axes inattendu\")\n    if image.dtype != np.uint8:\n        raise ValueError(\"Type inattendu\")\n    return image.shape\n\nprint(valider_image(np.zeros((20,30),dtype=np.uint8)))",
          "language": "python",
          "output": "(20, 30)",
          "interpretation": "La fonction valide la forme et le type avant de laisser la chaîne se poursuivre. Son contrat est explicite."
        }
      ],
      "mistakes": [
        "Enregistrer un masque de classes en JPEG et perdre l'intégrité des labels.",
        "Convertir des valeurs uint16 en uint8 sans maîtriser le résultat.",
        "Supposer que toutes les images couleur possèdent exactement trois canaux.",
        "Utiliser .shape sur None après une lecture impossible.",
        "Ne pas documenter la résolution et la plage de valeurs attendues."
      ],
      "conclusion": [
        "Tu sais maintenant distinguer JPEG, PNG et TIFF, puis vérifier les dimensions, types, canaux et valeurs d'une image avant de lancer les traitements.",
        "Ces contrôles constituent la première étape d'un pipeline robuste et évitent de nombreuses erreurs silencieuses lors de l'inspection d'images industrielles."
      ],
      "faq": [
        {
          "question": "When should I use PNG instead of JPEG?",
          "answer": "Lorsque les valeurs des pixels ou des masques doivent être conservées sans perte."
        },
        {
          "question": "What is TIFF used for?",
          "answer": "Des images scientifiques et industrielles, notamment lorsque des formats ou profondeurs de pixels spécifiques sont nécessaires."
        },
        {
          "question": "What is uint16?",
          "answer": "Un entier non signé sur 16 bits qui peut représenter des valeurs de 0 à 65535."
        },
        {
          "question": "Why can shape have four channels?",
          "answer": "Certaines images comportent un canal alpha en plus des composantes couleur."
        },
        {
          "question": "What should I check before processing an image?",
          "answer": "Décodage réussi, dimensions, dtype, nombre de canaux, intensités et provenance."
        }
      ]
    }
  }
];
