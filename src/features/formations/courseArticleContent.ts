import type { FormationModule, FormationTrack } from './formationTypes';

export type ArticleSection = {
  id: string;
  title: string;
  depth?: 1 | 2;
  paragraphs: string[];
  bullets?: string[];
  code?: string;
  language?: string;
  output?: string;
  interpretation?: string;
  visual?: 'opencv'|'pixels'|'colors'|'operations'|'pandas'|'numpy'|'data'|'edges'|'video';
  tip?: string;
  pointIndex?: number;
};
export type CourseArticleData = {
  eyebrow: string;
  title: string;
  author: string;
  intro: string[];
  tldr: string[];
  sections: ArticleSection[];
  mistakes: string[];
  conclusion: string[];
  faq: { question: string; answer: string }[];
};

const opencv: CourseArticleData = {
  eyebrow:'PYTHON · IMAGE PROCESSING',
  title:'What is OpenCV in Python? A Beginner’s Guide',
  author:'MonStage Learning',
  intro:[
    'OpenCV est l’une des bibliothèques les plus importantes du traitement d’images et de la vision par ordinateur. Elle permet de lire des photos, transformer les pixels, changer les espaces de couleurs et analyser des vidéos en temps réel.',
    'Avant d’entraîner un modèle de machine learning ou de deep learning, on doit souvent inspecter, nettoyer, redimensionner et préparer ses images. C’est précisément ce qu’OpenCV permet de faire avec Python.'
  ],
  tldr:[
    'OpenCV signifie Open Source Computer Vision Library. En Python, on l’utilise en important cv2.',
    'Ses fonctions principales servent à lire et enregistrer une image, manipuler des matrices de pixels, convertir les couleurs, appliquer des filtres, détecter les contours et parcourir des vidéos.',
    'Tu vas commencer avec une seule image, puis construire une petite chaîne de traitement exploitable dans un notebook.'
  ],
  sections:[
    {id:'what',title:'What is OpenCV?',depth:1,visual:'opencv',pointIndex:0,paragraphs:[
      'OpenCV (Open Source Computer Vision Library) est une bibliothèque open source destinée à la vision par ordinateur. Ses fonctions optimisées sont très utilisées en robotique, automatisation et inspection visuelle.',
      'Dans Python, son nom est cv2. Le même outil intervient dans plusieurs étapes : traitement d’images classique, préparation des données pour le machine learning et prétraitement avant les modèles de deep learning.',
      'Exemple industriel : une caméra photographie une pièce. OpenCV peut charger l’image, la convertir en gris, réduire le bruit, extraire une région et préparer cette région pour une mesure ou un classifieur.'
    ]},
    {id:'install',title:'Installing OpenCV',depth:2,pointIndex:0,paragraphs:[
      'Installe OpenCV dans ton environnement Python. Pour un ordinateur avec interface graphique, utilise opencv-python. Sur un serveur sans affichage, la variante headless évite les dépendances d’affichage.',
      'Installe une seule variante principale d’OpenCV dans le même environnement pour éviter les conflits. Les fonctions avancées supplémentaires sont distribuées avec opencv-contrib-python.'
    ],language:'bash',code:`# Ordinateur personnel / Jupyter
python -m pip install opencv-python numpy matplotlib

# Sur serveur sans interface graphique (alternative)
# python -m pip install opencv-python-headless

# Vérifier l’installation dans Python
python -c "import cv2; print(cv2.__version__)"`,output:'Une version d’OpenCV apparaît, par exemple 4.x. Si l’import échoue, vérifie l’environnement Python utilisé.',interpretation:'pip installe le package, mais le nom à importer dans le code reste cv2.',tip:'Dans Jupyter, le notebook et le terminal doivent utiliser le même environnement Python.'},
    {id:'images',title:'How OpenCV Sees Images',depth:1,visual:'pixels',pointIndex:1,paragraphs:[
      'Pour OpenCV, une image n’est pas une simple photographie : c’est un tableau de nombres NumPy. Une image couleur a généralement la forme (height, width, channels), soit hauteur, largeur et canaux.',
      'Les pixels des images habituelles en 8 bits prennent des valeurs de 0 à 255. Un pixel couleur possède trois valeurs. Attention : OpenCV les place généralement dans l’ordre BGR et non RGB.'
    ],language:'python',code:`import cv2

# Lire une image en couleurs depuis le disque
image = cv2.imread("photo.jpg")

# Vérifier que le chemin est correct
if image is None:
    raise FileNotFoundError("photo.jpg introuvable")

print(image.shape)    # (hauteur, largeur, 3)
print(image.dtype)    # uint8
print(image[100, 200]) # Pixel : [Bleu, Vert, Rouge]

# Enregistrer une copie
cv2.imwrite("copie.png", image)`,output:'Sur une image couleur 640 × 480, shape serait (480, 640, 3). Les valeurs du pixel dépendent de la photographie.',interpretation:'image[100, 200] correspond à la ligne 100 et à la colonne 200. Ce n’est pas un couple (x,y) au sens graphique.',tip:'Toujours vérifier image is not None avant .shape pour éviter une erreur sur un fichier introuvable.'},
    {id:'colors',title:'Colour Spaces and Conversions',depth:1,visual:'colors',pointIndex:2,paragraphs:[
      'Le même contenu visuel peut être représenté de plusieurs façons. BGR et RGB décrivent des canaux de couleur dans un ordre différent ; les niveaux de gris utilisent un seul canal ; HSV sépare la teinte, la saturation et la luminosité.',
      'Pourquoi convertir ? Une image grise simplifie l’analyse de contours. Le RGB est attendu par Matplotlib. Le HSV aide à isoler certaines couleurs, par exemple une pièce rouge sur un fond variable.'
    ],language:'python',code:`import cv2
image = cv2.imread("photo.jpg")
if image is None:
    raise FileNotFoundError("Image absente")

# 1. Une seule intensité par pixel
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# 2. Les bonnes couleurs dans Matplotlib
rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# 3. Représentation teinte / saturation / valeur
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

print(gray.shape, rgb.shape, hsv.shape)`,output:'Une image 480 × 640 donne gray=(480, 640), rgb=(480, 640, 3), hsv=(480, 640, 3).',interpretation:'La conversion change la représentation, pas la scène photographiée. Elle prépare l’image selon le traitement voulu.'},
    {id:'operations',title:'Core Image Operations',depth:1,visual:'operations',pointIndex:3,paragraphs:[
      'Une chaîne de traitement combine des opérations simples. Le redimensionnement uniformise les tailles ; le filtrage réduit certaines variations inutiles ; la détection de contours met en évidence les transitions d’intensité.',
      'Ces étapes peuvent ensuite être reliées à la segmentation, aux mesures géométriques et au machine learning. Voici les opérations les plus fréquentes.'
    ]},
    {id:'resize',title:'Resizing and Blurring',depth:2,pointIndex:4,paragraphs:[
      'Le redimensionnement transforme une image vers une largeur et une hauteur données. Il faut conserver le rapport d’aspect quand la géométrie compte. Le flou gaussien lisse les variations locales ; le filtre médian est souvent utile pour le bruit impulsionnel.'
    ],language:'python',code:`import cv2
image = cv2.imread("photo.jpg")
if image is None:
    raise FileNotFoundError("Image absente")

# OpenCV attend (largeur, hauteur)
resized = cv2.resize(image, (224, 224))

# Filtre gaussien, noyau 5 × 5
blurred = cv2.GaussianBlur(resized, (5, 5), 0)

# Filtre médian, souvent utile contre le sel-poivre
median = cv2.medianBlur(resized, 5)
print(resized.shape)`,output:'(224, 224, 3). Les images floutées gardent la même taille que resized.',interpretation:'Plus le noyau de filtrage est grand, plus on lisse, mais plus on risque d’effacer des détails fins.',tip:'Pour les masques de segmentation, préfère INTER_NEAREST lors du redimensionnement afin de préserver les valeurs de classe.'},
    {id:'canny',title:'Edge Detection with Canny',depth:2,visual:'edges',pointIndex:5,paragraphs:[
      'Le détecteur Canny recherche les changements rapides d’intensité susceptibles de représenter les bords d’un objet. Il combine plusieurs opérations : réduction du bruit, gradients, sélection des maxima et double seuil.',
      'Canny ne reconnaît pas le nom d’une pièce. Il produit une carte de contours qui peut servir ensuite à détecter des formes, des régions ou des dimensions.'
    ],language:'python',code:`import cv2
image = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE)
if image is None:
    raise FileNotFoundError("Image absente")

# Réduire d’abord le bruit
smooth = cv2.GaussianBlur(image, (5, 5), 0)

# Deux seuils pour sélectionner les contours
edges = cv2.Canny(smooth, 50, 150)

cv2.imwrite("contours.png", edges)`,output:'contours.png est une image binaire : des pixels clairs marquent les contours détectés.',interpretation:'Changer 50 et 150 modifie la sensibilité de la détection. Il faut comparer les vrais bords et les faux contours.'},
    {id:'video',title:'Processing Video and Webcam Feeds',depth:1,visual:'video',pointIndex:5,paragraphs:[
      'Une vidéo est une suite d’images appelées frames. VideoCapture permet de lire un fichier vidéo ou une webcam. À chaque itération, on récupère une frame, on la transforme et on vérifie que la lecture a réussi.',
      'Dans un notebook ou un serveur, afficher chaque frame via cv2.imshow n’est pas toujours possible ; l’export vidéo ou Matplotlib est alors plus adapté.'
    ],language:'python',code:`import cv2

capture = cv2.VideoCapture("video.mp4")
if not capture.isOpened():
    raise FileNotFoundError("Vidéo introuvable")

while True:
    ok, frame = capture.read()
    if not ok:
        break  # Fin du fichier ou erreur de lecture

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    # Ici : segmentation, mesure ou détection

capture.release()  # Toujours libérer la ressource`,output:'Chaque frame reçue est convertie en niveaux de gris jusqu’à la fin de la vidéo.',interpretation:'Le test ok est indispensable : une frame vide ne doit pas être transmise à cvtColor.'}
  ],
  mistakes:[
    'Utiliser cv2.imread() avec un mauvais chemin, puis accéder à .shape sur None.',
    'Afficher directement une image BGR avec Matplotlib sans conversion BGR → RGB.',
    'Confondre (hauteur, largeur) de NumPy et (largeur, hauteur) de cv2.resize().',
    'Choisir un filtre trop fort et supprimer les petits détails utiles.',
    'Traiter une frame vidéo sans vérifier la valeur de retour de read().'
  ],
  conclusion:[
    'OpenCV constitue une base de travail solide en traitement d’images : lecture, conversion, filtrage, contours et vidéo. Le plus important est de comprendre ce que chaque transformation change dans les pixels.',
    'Pour progresser, reprends une même photographie, enregistre les étapes intermédiaires et justifie l’utilité de chacune. Tu pourras ensuite enchaîner avec la segmentation, la morphologie et les projets d’inspection industrielle.'
  ],
  faq:[
    {question:'What is OpenCV in Python?',answer:'C’est une bibliothèque open source de vision par ordinateur accessible en Python sous le nom cv2.'},
    {question:'What is OpenCV used for?',answer:'Lire et transformer des images, appliquer des filtres, extraire des contours et analyser des vidéos.'},
    {question:'Why does OpenCV use BGR instead of RGB?',answer:'La représentation BGR est une convention historique de la bibliothèque. Convertis en RGB pour les bibliothèques qui attendent cet ordre.'},
    {question:'How do I install OpenCV in Python?',answer:'Exécute python -m pip install opencv-python, puis vérifie import cv2.'},
    {question:'What is cv2.waitKey() and why do I need it?',answer:'Dans une application locale avec cv2.imshow(), waitKey gère les événements de fenêtre et attend un délai ou une touche. Dans un notebook, privilégie Matplotlib.'},
    {question:'What is the difference between imread() and VideoCapture()?',answer:'imread lit une image unique. VideoCapture fournit une succession de frames depuis un fichier vidéo ou une caméra.'},
    {question:'How does Canny edge detection work?',answer:'Canny lisse l’image, calcule les gradients, affine les contours et utilise des seuils pour conserver les bords cohérents.'}
  ]
};

export function getOpenCVArticle(){return opencv;}
