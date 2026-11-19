import type {FormationModule} from './formationTypes';
import {extraPatterns} from './lessonExamplesAdditional';

export type LessonExample = {
  language:'python'|'sql'|'excel'|'dax'|'text';
  code:string;
  meaning:string;
  output:string;
  challenge:string;
};

function E(code:string,meaning:string,output:string,challenge:string,language:LessonExample['language']='python'):LessonExample {
  return {language,code,meaning,output,challenge};
}

/** Purpose-built introductory examples: one idea per snippet, no prerequisite file. */
const curated: Record<string, LessonExample[]> = {
  'images-pixels': [
    E(`import numpy as np
# Chaque nombre représente un pixel de l'image
image = np.array([[0, 255, 0],
                  [255, 255, 255],
                  [0, 255, 0]], dtype=np.uint8)
print(image[1, 1])  # ligne 1, colonne 1`,
      'Une image en niveaux de gris est une matrice. Le premier indice est la ligne, le second la colonne.','255 : le pixel central est blanc.','Remplace image[1, 1] par image[0, 0]. Que lis-tu ?'),
    E(`import numpy as np
# Une image : deux dimensions spatiales
image = np.zeros((4, 6), dtype=np.uint8)
image[2, 3] = 255  # signal ponctuel
print(image.shape)`,
      'Le signal I(ligne, colonne) indique l’intensité à une position précise. Ce n’est pas une liste de photos : c’est un signal sur deux axes.','(4, 6) : quatre lignes et six colonnes.','Déplace le pixel blanc. Comment ses deux coordonnées changent-elles ?'),
    E(`import numpy as np
# H = hauteur, W = largeur
hauteur, largeur = 480, 640
image = np.zeros((hauteur, largeur), dtype=np.uint8)
print(image.shape, image.size)`,
      'Les dimensions sont données en pixels. La résolution détermine le nombre d’échantillons, pas la taille réelle d’un objet.','(480, 640) 307200','Divise la largeur et la hauteur par deux. Combien de pixels reste-t-il ?'),
    E(`import numpy as np
pixels = np.array([0, 127, 255], dtype=np.uint8)
# uint8 permet 2**8 = 256 valeurs distinctes
print(pixels.dtype, len(np.unique(pixels)))`,
      'Avec huit bits, un pixel peut prendre 256 niveaux, de 0 à 255. Une quantification moins fine fait disparaître des nuances.','uint8 3 : trois niveaux sont utilisés dans notre exemple.','Combien de niveaux peut coder une image à quatre bits ?'),
    E(`import numpy as np
gris = np.zeros((3, 4), dtype=np.uint8)
couleur = np.zeros((3, 4, 3), dtype=np.uint8)
print(gris.shape, couleur.shape)`,
      'Une image couleur possède habituellement plusieurs canaux. Trois canaux codent les composantes rouge, verte et bleue.','(3, 4) et (3, 4, 3)','À quoi correspond le dernier « 3 » ?'),
    E(`# Exemple : compter les pixels lumineux d'une pièce
import numpy as np
inspection = np.array([[20, 210, 215],
                       [25, 205, 30]], dtype=np.uint8)
nombre = np.count_nonzero(inspection >= 200)
print(nombre)`,
      'Sur une caméra industrielle, une règle simple sur les intensités peut déjà compter ou isoler une région. Les paramètres doivent être validés.','3 pixels atteignent ou dépassent 200.','Augmente le seuil à 215 : que devient le compte ?')
  ],
  'metier-donnees': [
    E(`# Une analyse relie une question métier à un livrable
question = "Quels magasins ont moins vendu ?"
livrable = "Tableau comparatif par magasin"
print(question, "→", livrable)`,
      'Le métier demande une décision ; le Data Analyst transforme cette question en mesure, puis en livrable vérifiable.','Une question et son livrable associé.','Écris une question métier liée à la maintenance d’un équipement.'),
    E(`import pandas as pd
d = pd.DataFrame({"machine": ["A", "B"],
                  "température": [65.2, 71.8],
                  "date": ["2026-11-18", "2026-11-19"]})
print(d.dtypes)`,
      'Une colonne numérique se calcule, une catégorie sert à regrouper, une date doit être convertie avant les calculs temporels.','La température est numérique ; machine et date sont initialement des textes.','Convertis la colonne date avec pd.to_datetime.'),
    E(`from io import StringIO
import pandas as pd
csv = StringIO("site,ventes\\nNantes,120\\nParis,180")
df = pd.read_csv(csv)
print(df.shape)`,
      'Les données peuvent venir de CSV, tableurs ou bases SQL. Leur provenance doit toujours être mentionnée.','(2, 2) : deux lignes et deux colonnes.','Quelle information de provenance noterais-tu dans un rapport ?'),
    E(`import pandas as pd
df = pd.DataFrame({"commande": [1, 2, 3],
                   "client": ["A", "A", "B"]})
print("Lignes :", len(df))
print("Clients :", df["client"].nunique())`,
      'Le grain décrit ce que représente une ligne : ici une commande, pas un client. Changer de grain change les indicateurs.','3 commandes, mais seulement 2 clients.','Pourquoi compter les lignes ne donne-t-il pas le nombre de clients ?'),
    E(`ventes_mois_1 = 100
ventes_mois_2 = 125
variation = (ventes_mois_2 / ventes_mois_1 - 1) * 100
print(f"Variation : {variation:.0f} %")`,
      'Une question métier devient un KPI grâce à une formule, une période, une unité et un périmètre.','Variation : 25 %.','Une hausse de 25 % signifie-t-elle automatiquement une hausse de profit ?'),
    E(`import pandas as pd
df = pd.DataFrame({"salaire": [2500, None, 2800]})
print("Valeurs manquantes :", df.isna().sum().sum())`,
      'La qualité, l’accès et la traçabilité font partie de l’analyse. On doit signaler les données inconnues et respecter leur confidentialité.','Valeurs manquantes : 1.','Est-il correct de remplacer automatiquement ce salaire inconnu par zéro ?')
  ],
  'classification-ml': [
    E(`# Une image reçoit une étiquette à apprendre
images = ["photo_01.png", "photo_02.png"]
etiquettes = ["normal", "défaut"]
print(list(zip(images, etiquettes)))`,
      'En classification supervisée, chaque image d’entraînement est associée à une catégorie connue.','Deux exemples : normal et défaut.','Une image peut-elle avoir plusieurs étiquettes ? Dans quel type de problème ?'),
    E(`import numpy as np
image = np.array([[0, 1], [2, 3]])
features = image.ravel()  # quatre valeurs au lieu d'une grille
print(features)`,
      'Les features sont la représentation transmise au modèle : pixels bruts ou caractéristiques apprises.','[0 1 2 3]','Qu’est-ce qu’on perd en ignorant la structure spatiale ?'),
    E(`from sklearn.datasets import load_digits
X, y = load_digits(return_X_y=True)
print("Images :", X.shape[0])
print("Classes :", len(set(y)))`,
      'L’algorithme apprend à partir d’exemples étiquetés ; il ne mémorise pas une règle parfaite dans chaque cas.','1797 images et 10 classes dans le jeu digits de sklearn.','Que faut-il faire si deux classes sont très déséquilibrées ?'),
    E(`from sklearn.model_selection import train_test_split
from sklearn.datasets import load_digits
X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, random_state=7, stratify=y)
print(len(X_tr), len(X_te))`,
      'Les données d’entraînement servent à apprendre. La validation guide les choix et le test final mesure sur des exemples non vus.','1437 exemples train et 360 test.','Pourquoi ne pas régler le modèle sur les exemples du test ?'),
    E(`from sklearn.datasets import load_digits
from sklearn.neighbors import KNeighborsClassifier
X, y = load_digits(return_X_y=True)
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X[:1000], y[:1000])
print(model.predict(X[1000:1001]))`,
      'KNN classe une nouvelle observation selon les classes d’exemples proches, suivant une distance choisie.','Une classe numérique entre 0 et 9 (selon l’exemple).','Que change le nombre de voisins k ?'),
    E(`from sklearn.metrics import confusion_matrix
attendu = [0, 0, 1, 1]
predit  = [0, 1, 1, 1]
print(confusion_matrix(attendu, predit))`,
      'La matrice de confusion distingue prédictions correctes et erreurs par classe.','[[1, 1], [0, 2]] : un cas normal annoncé comme positif.','Où vois-tu un faux positif ?')
  ]
};

const patterns: Array<[RegExp, (topic:string,module:FormationModule)=>LessonExample]> = [
  [/seuil|threshold|Otsu/i,()=>E(`import cv2
import numpy as np
image = np.array([[60, 120, 200]], dtype=np.uint8)
_, masque = cv2.threshold(image, 130, 255, cv2.THRESH_BINARY)
print(masque)`,'Un seuil range chaque pixel dans l’une des deux classes.', '[[  0   0 255]]', 'Abaisse le seuil à 100 ; combien de pixels sont blancs ?')],
  [/Sobel|Canny|gradient|contour/i,()=>E(`import cv2
import numpy as np
image = np.zeros((40, 40), dtype=np.uint8)
image[:, 20:] = 200  # bord vertical net
edges = cv2.Canny(image, 50, 150)
print(np.count_nonzero(edges))`,'Canny repère des changements brusques d’intensité et retourne des pixels de contour.', 'Le nombre de pixels de bord détectés est non nul.', 'Augmente les seuils et observe les bordures conservées.')],
  [/moyen|médian|flou|bruit|Gaussian|filtr|noyau|convolution/i,()=>E(`import cv2
import numpy as np
image = np.zeros((7, 7), dtype=np.uint8)
image[3, 3] = 180  # point blanc isolé
filtre = cv2.blur(image, (3, 3))
print(filtre[3, 3])`,'Un noyau moyenneur partage l’intensité du pixel entre son voisinage 3×3.', '20 : 180 divisé par 9.', 'Essaie un filtre médian ; que devient ce point isolé ?')],
  [/couleur|RGB|BGR|HSV|canaux|imread|cv2/i,()=>E(`import cv2
import numpy as np
bgr = np.array([[[0, 0, 255]]], dtype=np.uint8)
rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
print(rgb[0, 0])`,'OpenCV lit généralement les couleurs en BGR ; Matplotlib préfère RGB.', '[255   0   0] : du rouge en RGB.', 'Que se passe-t-il sans conversion avant plt.imshow ?')],
  [/histogramme|distribution|boxplot/i,()=>E(`import numpy as np
valeurs = np.array([10, 20, 20, 30])
frequences, bins = np.histogram(valeurs, bins=[0, 15, 25, 35])
print(frequences)`,'Un histogramme compte combien d’observations se trouvent dans chaque intervalle.', '[1 2 1]', 'Que devient le second intervalle si tu remplaces un 20 par 30 ?')],
  [/transformation|rotation|translation|resize|crop|recadrage|interpolation/i,()=>E(`import cv2
import numpy as np
image = np.zeros((60, 100), dtype=np.uint8)
petite = cv2.resize(image, (50, 30))
print(petite.shape)`,'OpenCV attend (largeur, hauteur) pour la taille de destination.', '(30, 50) : NumPy ordonne (hauteur, largeur).', 'Quelle interpolation faut-il choisir pour un masque de classes ?')],
  [/IoU|Dice|recouvrement|union|intersection/i,()=>E(`import numpy as np
verite = np.array([1, 1, 0, 0], dtype=bool)
pred = np.array([1, 0, 1, 0], dtype=bool)
inter = np.logical_and(verite, pred).sum()
union = np.logical_or(verite, pred).sum()
print(inter / union)`,'L’IoU compare la partie commune à l’ensemble total des pixels positifs.', '0.333333... : un pixel commun sur trois dans l’union.', 'Ajoute un faux positif : le score monte-t-il ou baisse-t-il ?')],
  [/FFT|Fourier|fréquence|spectre/i,()=>E(`import numpy as np
signal = np.sin(2*np.pi*4*np.arange(64)/64)
spectre = abs(np.fft.rfft(signal))
print(np.argmax(spectre[1:])+1)`,'La transformée de Fourier permet de retrouver une périodicité dans le signal.', '4 : quatre oscillations sur 64 échantillons.', 'Change 4 en 8 : où se déplace le pic ?')],
  [/frame|FPS|vidéo|soustraction de fond|mouvement/i,()=>E(`import cv2
cap = cv2.VideoCapture("video.mp4")
if not cap.isOpened():
    raise FileNotFoundError("Vidéo introuvable")
fps = cap.get(cv2.CAP_PROP_FPS)
print("Images par seconde :", fps)
cap.release()`,'Une vidéo contient plusieurs images par seconde. L’accès doit être vérifié avant de traiter la séquence.', 'Le FPS est lu depuis le fichier réel.', 'Pourquoi vérifier cap.isOpened() ?')],
  [/jointure|JOIN|relation|clé/i,()=>E(`import sqlite3
con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE client(id INTEGER, nom TEXT);
CREATE TABLE commande(client_id INTEGER, montant REAL);
INSERT INTO client VALUES (1, 'A'), (2, 'B');
INSERT INTO commande VALUES (1, 20), (1, 50);
""")
sql = "SELECT nom, SUM(montant) FROM client JOIN commande ON id=client_id GROUP BY nom"
print(con.execute(sql).fetchall())`,'Une jointure rapproche des tables par une clé. La somme doit être faite au bon grain.', "[('A', 70.0)]", 'Pourquoi le client B ne figure-t-il pas ici ?')],
  [/SELECT|WHERE|ORDER BY|GROUP BY|SUM|HAVING|COUNT|SQL/i,()=>E(`import sqlite3
con = sqlite3.connect(":memory:")
con.executescript("CREATE TABLE vente(site TEXT, total REAL); INSERT INTO vente VALUES ('Nantes', 10), ('Nantes', 20), ('Paris', 15);")
sql = "SELECT site, SUM(total) FROM vente GROUP BY site"
print(con.execute(sql).fetchall())`,'SQL exprime en quelques lignes comment sélectionner et agréger une table.', "[('Nantes', 30.0), ('Paris', 15.0)]", 'Ajoute un filtre pour ne garder que Nantes.')],
  [/valeur manquant|doublon|nettoy|qualité|incohérent|outlier|aberrant/i,()=>E(`import pandas as pd
df = pd.DataFrame({"id":[1,1,2], "mesure":[10,None,30]})
print("Doublons :", df.duplicated().sum())
print("Manquants :", df.isna().sum().to_dict())`,'Avant l’analyse, contrôle ce qui manque et ce qui se répète.', "Un manquant sur mesure ; aucun doublon de lignes complètes.", 'Quelle colonne définit un doublon métier ?')],
  [/DataFrame|Pandas|Series|groupby|pivot|merge/i,()=>E(`import pandas as pd
df = pd.DataFrame({"site":["A","A","B"], "vente":[10,20,15]})
resultat = df.groupby("site")["vente"].sum()
print(resultat)`,'Pandas regroupe et calcule des indicateurs sans boucles manuelles.', 'A = 30, B = 15.', 'Que change la moyenne par rapport à la somme ?')],
  [/CSV|JSON|import|export|fichier/i,()=>E(`from io import StringIO
import pandas as pd
source = StringIO("site,ventes\\nA,10\\nB,15")
df = pd.read_csv(source)
print(df.head())`,'Un CSV contient des lignes et des colonnes séparées par un délimiteur. On vérifie sa structure dès la lecture.', 'Deux lignes, deux colonnes.', 'Que se passe-t-il si le séparateur est « ; » ?')],
  [/KPI|taux|variation|indicateur|écart|métier|décision/i,()=>E(`ventes_avant = 100
ventes_apres = 115
variation_pct = (ventes_apres / ventes_avant - 1)*100
print(f"{variation_pct:.0f} %")`,'Un KPI doit être défini par une formule et un contexte métier précis.', '15 % de hausse.', 'Et si la période précédente vaut zéro ?')],
  [/Power BI|DAX|CALCULATE|Power Query|mesure/i,()=>E(`Ventes = SUM(FactVentes[Montant])
TauxConversion = DIVIDE([Commandes], [Visites])`,'Une mesure DAX réagit aux filtres du rapport ; DIVIDE gère le dénominateur nul.', 'Les deux mesures sont calculées dans le contexte de filtre Power BI.', 'Que devient TauxConversion lorsque Visites = 0 ?', 'dax')],
  [/moyenne|médiane|variance|écart.type|statistique|corrélation/i,()=>E(`import numpy as np
x = np.array([10, 11, 12, 100])
print("Moyenne :", x.mean())
print("Médiane :", np.median(x))`,'La moyenne est sensible à une valeur extrême, la médiane beaucoup moins.', 'Moyenne = 33,25 ; médiane = 11,5.', 'Si tu remplaces 100 par 1000, laquelle change le plus ?')],
  [/PyTorch|Conv2d|pooling|feature map|CNN/i,()=>E(`import torch
from torch import nn
images = torch.rand(4, 1, 28, 28)
couche = nn.Conv2d(1, 8, kernel_size=3, padding=1)
print(couche(images).shape)`,'La couche apprend huit filtres et produit huit cartes par image.', 'torch.Size([4, 8, 28, 28])', 'Que change MaxPool2d(2) sur la hauteur ?')],
  [/ReLU|activation|neurone|gradient|optimiseur|backprop/i,()=>E(`import torch
x = torch.tensor([-2., 0., 3.])
y = torch.relu(x)
print(y)`,'ReLU transmet les valeurs positives et ramène les négatives à zéro.', 'tensor([0., 0., 3.])', 'Pourquoi une non-linéarité est-elle utile dans un réseau ?')],
  [/train|test|validation|classification|supervisé|KNN/i,()=>E(`from sklearn.model_selection import train_test_split
X = list(range(20))
train, test = train_test_split(X, test_size=0.2, random_state=7)
print(len(train), len(test))`,'On conserve des exemples non vus pour mesurer la généralisation.', '16 exemples d’entraînement, 4 de test.', 'Pourquoi ne pas ajuster le modèle sur les quatre exemples test ?')],
  [/détection|bounding|boîte|YOLO|localisation/i,()=>E(`# Boîte (x_min, y_min, x_max, y_max)
boite = (10, 20, 40, 50)
largeur = boite[2] - boite[0]
hauteur = boite[3] - boite[1]
print(largeur * hauteur)`,'Une boîte englobante localise l’objet dans l’image et permet de mesurer une aire en pixels.', '900 pixels carrés.', 'L’aire de la boîte est-elle égale à l’aire exacte de l’objet ?')]
];

export function getLessonExample(topic:string,module:FormationModule,index:number):LessonExample {
  const special=curated[module.id]?.[index];
  if(special)return special;
  const match=[...extraPatterns,...patterns].find(([pattern])=>pattern.test(topic));
  if(match)return match[1](topic,module);
  // Preserve a concrete example from the correct module rather than an invented result.
  const lines=module.code.trim().split('\n');
  return E(lines.slice(0,Math.min(14,lines.length)).join('\n'),
    'Ce court extrait appartient au projet réel du module : « '+module.title+' ». Exécute-le dans le notebook, puis explique la sortie avec les données du projet.',
    'La sortie exacte dépend des données et du contexte du module.',
    'Repère dans le code la ligne liée à « '+topic+' » puis modifie un paramètre.',
    module.codeLanguage||'python');
}
