import type {FormationModule} from './formationTypes';
import type {LessonExample} from './lessonExamples';
type Matcher = [RegExp, (point:string,module:FormationModule)=>LessonExample];
const X=(code:string,meaning:string,output:string,challenge:string,language:LessonExample['language']='python'):LessonExample=>({code,meaning,output,challenge,language});
export const extraPatterns:Matcher[]=[
  [/RECHERCHEX|SOMME\.SI\.ENS/i,()=>X(`=SOMME.SI.ENS(C2:C10; A2:A10; "Nantes")`,'Additionne les ventes de Nantes selon une condition, sans mélanger les autres sites.','La somme des lignes où A vaut Nantes.','Ajoute une deuxième condition portant sur le mois.','excel')],
  [/références absolues|erreurs de formule/i,()=>X(`=B2*$F$1`,'Les signes $ fixent une cellule lors de la recopie d’une formule.','En recopiant vers la ligne 3, B2 devient B3 mais F1 reste F1.','Pourquoi B2*$F$1 est-il différent de B2*F1 ?','excel')],
  [/tableaux croisés dynamiques/i,()=>X(`# Équivalent en Pandas d'un tableau croisé dynamique
import pandas as pd
df = pd.DataFrame({"site":["A","A","B"],"CA":[10,20,7]})
print(df.pivot_table(index="site",values="CA",aggfunc="sum"))`,'Un tableau croisé regroupe les données pour comparer les catégories.','A : 30 et B : 7.','Essaie aggfunc="mean".'),
  [/Markdown\/code Jupyter|notebooks Jupyter/i,()=>X(`# Cellule Markdown : explique la question métier
# Cellule Python : exécute un calcul
ventes = [12, 18, 20]
print(sum(ventes))`,'Dans un notebook, le texte explique, le code calcule et les graphiques illustrent.','50.','Quel titre Markdown ajouterais-tu avant ce calcul ?')],
  [/listes, tuples et dictionnaires|types, listes|types, listes, tuples/i,()=>X(`nombre = 10
sites = ["Nantes", "Paris"]
coord = (47.2, -1.55)
client = {"nom":"A", "commandes":3}
print(type(nombre).__name__, sites[0], client["commandes"])`,'Les types structurent les valeurs : nombre, liste modifiable, tuple fixe et dictionnaire à clés.','int Nantes 3','Ajoute un troisième site à la liste.')],
  [/conditions if|boucles for/i,()=>X(`temperatures = [65, 82, 74]
for t in temperatures:
    if t > 80:
        print("Alerte :", t)`,'Une boucle traite chaque observation ; une condition choisit les cas qui déclenchent une action.','Alerte : 82.','Change le seuil de 80 à 70.')],
  [/fonctions, paramètres et return/i,()=>X(`def taux(numerateur, denominateur):
    if denominateur == 0:
        return None
    return numerateur / denominateur * 100
print(taux(2, 8))`,'Une fonction isole un calcul réutilisable et gère les entrées inattendues.','25.0','Que retourne taux(1, 0) ?')],
  [/exceptions|erreurs, exceptions/i,()=>X(`texte = "non numérique"
try:
    resultat = float(texte)
except ValueError:
    resultat = None
print(resultat)`,'Une erreur de conversion est traitée explicitement au lieu d’arrêter toute la chaîne.','None.','Pourquoi ne pas remplacer cette valeur inconnue par zéro ?')],
  [/ndarray|shape|dtype|opérations vectorisées|numpy/i,()=>X(`import numpy as np
x = np.array([100, 150, 200], dtype=np.int16)
print(x.shape, (x + 30).tolist())`,'Le tableau stocke des valeurs d’un même type ; les opérations vectorisées s’appliquent à toutes.','(3,) [130, 180, 230]','Pourquoi choisir int16 ici ?')],
  [/head, info, describe|colonnes/i,()=>X(`import pandas as pd
df = pd.DataFrame({"prix":[10,20,30]})
print(df.head(2))
print(df.describe().loc["mean","prix"])`,'head montre les lignes, info vérifie les types, describe résume les chiffres.','Les deux premiers prix et une moyenne de 20.','Quelle commande indique la présence de valeurs nulles ?')],
  [/valeurs manquantes/i,()=>X(`import pandas as pd
x = pd.Series([20, None, 35])
print("Manquants :", x.isna().sum())
print("Moyenne connue :", x.mean())`,'Une valeur absente n’est pas un zéro. On quantifie les absences avant de les traiter.','1 valeur manquante ; moyenne 27,5 sur deux observations.','Quel biais créerait un remplacement automatique par zéro ?')],
  [/formats? de dates|types incorrects/i,()=>X(`import pandas as pd
dates = pd.to_datetime(["2026-11-01","2026-11-05"])
print((dates[1]-dates[0]).days)`,'Convertir les chaînes en dates permet des calculs temporels fiables.','4 jours.','Pourquoi le tri alphabétique peut-il échouer pour certaines dates ?')],
  [/normalisation des libellés|catégories/i,()=>X(`import pandas as pd
sites = pd.Series([" Nantes ", "NANTES", "nantes"])
print(sites.str.strip().str.lower().nunique())`,'Un même site peut avoir plusieurs écritures. Nettoyer les espaces et la casse évite des groupes artificiels.','1 catégorie unique.','Quel risque présente une normalisation qui fusionne deux noms distincts ?')],
  [/univariée|bivariée/i,()=>X(`import pandas as pd
df = pd.DataFrame({"temps":[1,2,3],"production":[10,14,16]})
print(df["production"].mean())
print(df.corr(numeric_only=True).loc["temps","production"])`,'Univarié : étudier une variable seule. Bivarié : chercher une relation entre deux variables.','Moyenne de production 13,33 et corrélation positive.','Une corrélation positive prouve-t-elle une cause ?')],
  [/hypothèses et limites/i,()=>X(`observations = [3, 4, 3, 5]
print("Observations :", len(observations))
print("Moyenne :", sum(observations)/len(observations))`,'Une moyenne sur quatre cas est une observation ; expliquer sa cause reste une hypothèse à vérifier.','4 observations, moyenne 3,75.','Quelles données supplémentaires demanderas-tu ?')],
  [/courbe temporelle|axes ordonnés/i,()=>X(`import matplotlib.pyplot as plt
dates = ["J1","J2","J3"]
valeurs = [10, 15, 12]
plt.plot(dates, valeurs, marker="o")
plt.xlabel("Jour"); plt.ylabel("Production (u)")
plt.show()`,'Une courbe montre l’évolution dans un ordre temporel explicite, avec unités.','Trois points reliés, axe X = jours, axe Y = production.','Pourquoi une courbe sans dates ordonnées trompe-t-elle ?')],
  [/scatterplot|variables multiples/i,()=>X(`import matplotlib.pyplot as plt
temperature = [20, 25, 30]
consommation = [15, 18, 24]
plt.scatter(temperature, consommation)
plt.xlabel("Température (°C)")
plt.ylabel("Consommation (kWh)")
plt.show()`,'Chaque point représente une paire de mesures. On observe une association sans en déduire la causalité.','Trois points dont la tendance est croissante.','Quelle variable supplémentaire pourrait expliquer la tendance ?')],
  [/graphiques catégoriels/i,()=>X(`import matplotlib.pyplot as plt
sites = ["A", "B", "C"]
ventes = [12, 19, 10]
plt.bar(sites, ventes)
plt.ylabel("Ventes (k€)")
plt.show()`,'Les barres comparent des catégories distinctes.','B est le site ayant le plus de ventes.','Pourquoi ne pas relier ces catégories par une courbe temporelle ?')],
  [/titres, unités, légendes et échelles/i,()=>X(`import matplotlib.pyplot as plt
plt.plot([1,2,3],[20,30,25],label="Capteur A")
plt.title("Température sur 3 jours")
plt.xlabel("Jour");plt.ylabel("Température (°C)")
plt.legend();plt.show()`,'Titre, axes, unités et légende permettent à un collègue d’interpréter la figure sans aide.','Une courbe identifiée, avec unités et titre.','Que manque-t-il si la légende est supprimée de plusieurs séries ?')],
  [/Plotly/i,()=>X(`import plotly.express as px
import pandas as pd
df = pd.DataFrame({"mois":["Jan","Fév","Mar"],"vente":[10,13,12]})
fig = px.line(df, x="mois", y="vente", markers=True)
fig.show()`,'Plotly fournit des infobulles, zoom et sélections sur un vrai graphique.','Une courbe interactive de trois mois.','Survole un point et lis sa valeur. Pourquoi est-ce utile ?')],
  [/segments, interactions et navigation/i,()=>X(`# Étape Power BI Desktop
# 1) Ajoute un segment sur la colonne Site.
# 2) Clique Nantes.
# 3) Vérifie que la carte KPI se recalcule.`,'Les segments filtrent le contexte d’analyse. Ils doivent mettre à jour uniquement les visuels attendus.','Le KPI affiche les ventes pour Nantes seul.','Quelles interactions désactiverais-tu ?','text')],
  [/numérateur\/dénominateur|définition, unité/i,()=>X(`def taux(defauts, pieces):
    return 100*defauts/pieces if pieces else None
print(taux(7, 200))`,'Un pourcentage doit avoir un numérateur, un dénominateur et une unité claire.','3,5 % de pièces défectueuses.','Le résultat change-t-il si le nombre de pièces testées double ?')],
  [/comparaisons par segment|comparaisons par .*période/i,()=>X(`ventes = {"Nantes":120,"Paris":160}
moyenne = sum(ventes.values())/len(ventes)
print(moyenne, ventes["Paris"]-moyenne)`,'Comparer par segment aide à localiser un écart ; le nombre de cas de chaque groupe reste essentiel.','Moyenne 140 ; Paris est à +20.','Que se passe-t-il si Paris a dix fois plus de clients ?')],
  [/sources capteurs|historique machine|événements/i,()=>X(`mesures = [
    {"machine":"A","temperature_C":69,"minute":0},
    {"machine":"A","temperature_C":75,"minute":1}
]
print(mesures[1]["temperature_C"])`,'Une mesure industrielle doit conserver machine, unité et instant pour être interprétable.','75 °C à la minute 1 pour la machine A.','Que peut-il arriver si la colonne minute est perdue ?')],
  [/MTBF|MTTR|disponibilité|temps d’arrêt/i,()=>X(`heures_fonctionnement = 600
pannes = 3
minutes_reparation = [30, 40, 20]
print("MTBF (h):", heures_fonctionnement/pannes)
print("MTTR (min):", sum(minutes_reparation)/len(minutes_reparation))`,'MTBF décrit le temps moyen de fonctionnement entre pannes ; MTTR le temps moyen nécessaire pour réparer.','MTBF 200 h ; MTTR 30 min.','Quelles unités faut-il préciser sur ton dashboard ?')],
  [/agrégations par site|machine et semaine/i,()=>X(`import pandas as pd
d = pd.DataFrame({"site":["A","A","B"],"arret_min":[10,20,5]})
print(d.groupby("site")["arret_min"].sum())`,'L’agrégation compare les arrêts sur le même périmètre de temps et de machines.','A : 30 min, B : 5 min.','Pourquoi comparer deux sites de tailles différentes peut tromper ?')],
  [/prévision et à ses limites/i,()=>X(`reel = [10, 12, 11, 15]
pred = [11, 11, 12, 14]
mae = sum(abs(a-b) for a,b in zip(reel,pred))/4
print(mae)`,'Une prévision doit être comparée à une référence et évaluée hors entraînement.','Erreur absolue moyenne de 1.','La moyenne suffit-elle à vérifier les pics de panne rares ?')],
  [/brief et demander|cahier des charges/i,()=>X(`brief = {
  "objectif":"réduire les arrêts",
  "livrable":"dashboard hebdomadaire",
  "unite":"minutes"
}
print(brief["objectif"])`,'Avant de coder, définis la décision, le livrable, le périmètre et l’unité.','réduire les arrêts.','Quelles données demanderais-tu au tuteur ?')],
  [/conserver la source|versionner/i,()=>X(`from pathlib import Path
source = Path("donnees_originales.csv")
sortie = Path("donnees_nettoyees.csv")
print(source != sortie)`,'Ne jamais écraser l’original : sépare source et résultat et versionne les transformations.','True.','Pourquoi cette séparation facilite-t-elle un audit ?')],
  [/présentation courte|passation à l’équipe|restitution/i,()=>X(`message = {
  "constat":"pannes en hausse",
  "preuve":"graphique sur 12 semaines",
  "action":"examiner la machine B"
}
print(message["action"])`,'Une bonne restitution tient en trois temps : constat, preuve, action vérifiable.','examiner la machine B.','Quelle limite de l’analyse mentionnerais-tu ?')],
  [/slicing|régions d’intérêt/i,()=>X(`import numpy as np
image = np.arange(25).reshape(5,5)
zone = image[1:4, 1:4]
print(zone.shape)`,'Un crop extrait une zone sans modifier le reste de l’image. Les bornes finales sont exclues.','(3,3)','Quelle taille aurait image[0:2,0:5] ?')],
  [/masques booléens/i,()=>X(`import numpy as np
image = np.array([[30,220],[180,40]])
masque = image>100
print(masque)`,'Le masque booléen indique par True ou False les positions vérifiant une condition.','[[False, True], [True, False]]','Change le seuil de 100 à 200.')],
  [/clipping|opérations vectorisées/i,()=>X(`import numpy as np
image = np.array([200,250],dtype=np.uint8)
resultat = np.clip(image.astype(int)+20,0,255)
print(resultat)`,'Le clipping maintient les intensités dans la plage 0–255 et évite le débordement du uint8.','[220 255]','Que se passe-t-il sans conversion de type ?')],
  [/Matplotlib|comparaison de plusieurs images/i,()=>X(`import numpy as np
import matplotlib.pyplot as plt
image = np.eye(5)
fig,axes = plt.subplots(1,2)
axes[0].imshow(image,cmap="gray",vmin=0,vmax=1)
axes[1].imshow(1-image,cmap="gray",vmin=0,vmax=1)
plt.show()`,'Deux panneaux à la même échelle permettent de comparer honnêtement les transformations.','Une diagonale claire et son inversion.','Pourquoi fixer vmin et vmax ?')],
  [/JPEG|PNG|TIFF/i,()=>X(`import cv2
import numpy as np
image = np.zeros((10,10),dtype=np.uint8)
cv2.imwrite("test.png",image)
relue = cv2.imread("test.png",cv2.IMREAD_GRAYSCALE)
print(relue.shape)`,'PNG enregistre sans perte ; JPEG est avec perte ; TIFF peut garder des profondeurs plus élevées.','(10, 10)','Quel format choisir pour préserver un masque binaire ?')],
  [/contrôle des dimensions|dtypes et valeurs/i,()=>X(`import numpy as np
image = np.array([[0,255],[80,120]], dtype=np.uint8)
print(image.shape, image.dtype, image.min(), image.max())`,'Ces contrôles détectent une mauvaise lecture ou un traitement inattendu.','(2,2), uint8, 0, 255.','Quel contrôle ajouterais-tu avant une segmentation ?')],
  [/intensité et dynamique/i,()=>X(`import numpy as np
image = np.array([80,95,110,125],dtype=np.uint8)
print(int(image.min()),int(image.max()))`,'La dynamique de l’image est la plage d’intensités effectivement utilisée.','80 à 125 : seulement une petite partie de la plage 0–255.','Pourquoi cette image paraît-elle peu contrastée ?')],
  [/correction affine/i,()=>X(`import numpy as np
x = np.array([20,80,160],dtype=float)
y = np.clip(1.5*x+10,0,255)
print(y)`,'La formule I′ = aI + b règle contraste et luminosité, puis écrête si nécessaire.','[40. 130. 250.]','Modifie a de 1,5 à 2.')],
  [/normalisation/i,()=>X(`import cv2
import numpy as np
x = np.array([[80,100,120]],dtype=np.uint8)
y = cv2.normalize(x,None,0,255,cv2.NORM_MINMAX)
print(y)`,'La normalisation remet les valeurs sur une plage choisie, en tenant compte de min et max.','[[0 128 255]] environ.','Que faire quand toute l’image est constante ?')],
  [/correction gamma/i,()=>X(`import numpy as np
x = np.array([0,64,128,255],dtype=float)
y = np.round(255*(x/255)**0.5).astype(int)
print(y)`,'Gamma inférieur à 1 éclaircit les niveaux intermédiaires dans cette formule.','0, 128, 181 et 255 environ.','Que ferait gamma = 2 ?')],
  [/CLAHE|égalisation/i,()=>X(`import cv2
import numpy as np
image = np.tile(np.arange(70,130,dtype=np.uint8),(32,1))
clahe = cv2.createCLAHE(clipLimit=2,tileGridSize=(4,4))
amelioration = clahe.apply(image)
print(amelioration.shape)`,'CLAHE améliore localement le contraste en limitant l’amplification de l’histogramme.','Même dimensions que l’original : (32, 60).','Pourquoi un clipLimit énorme peut-il amplifier le bruit ?')],
  [/calcul manuel|produit\/somme locale/i,()=>X(`voisins = [0,0,0,0,90,0,0,0,0]
poids = [1/9]*9
resultat = sum(a*b for a,b in zip(voisins,poids))
print(resultat)`,'Le filtre calcule une somme pondérée des neuf pixels voisins.','10.0','Refais le calcul avec deux pixels non nuls.')],
  [/simulation reproductible/i,()=>X(`import numpy as np
rng = np.random.default_rng(7)
bruit = rng.normal(0,5,size=4)
print(np.round(bruit,1))`,'Une graine fixe facilite les comparaisons honnêtes entre méthodes.','Les quatre valeurs restent identiques d’une exécution à l’autre.','Change la graine ; que devient le bruit ?')],
  [/MSE, PSNR|PSNR et SSIM/i,()=>X(`import numpy as np
ref=np.array([100,200],dtype=float)
pred=np.array([110,190],dtype=float)
mse=np.mean((ref-pred)**2)
psnr=10*np.log10(255**2/mse)
print(round(mse,1),round(psnr,2))`,'MSE mesure l’erreur quadratique ; PSNR la rapporte à la dynamique des valeurs.','100.0 et environ 28,13 dB.','Pourquoi faut-il une image de référence ?')],
  [/nearest|bilinear|bicubic/i,()=>X(`import cv2
import numpy as np
masque=np.array([[0,1],[1,0]],dtype=np.uint8)
grand=cv2.resize(masque,(4,4),interpolation=cv2.INTER_NEAREST)
print(np.unique(grand))`,'Nearest-neighbor conserve les étiquettes entières du masque ; bilinéaire mélange les intensités.','[0 1] : aucune nouvelle classe.','Quelle interpolation choisir pour une photo en niveaux de gris ?')],
  [/repères, calibration|calibration et unités/i,()=>X(`pixels = 45
echelle_mm_par_pixel = 0.2
longueur_mm = pixels * echelle_mm_par_pixel
print(longueur_mm)`,'Une mesure en pixels devient une longueur physique seulement avec une calibration valide.','9,0 millimètres.','Pourquoi une prise de vue différente peut-elle changer l’échelle ?')],
  [/transformée de Hough/i,()=>X(`import numpy as np
rho = 20
theta = np.pi/2
x, y = 15, 20
print(round(x*np.cos(theta)+y*np.sin(theta)))`,'La forme de Hough pour une droite utilise ρ = x cos θ + y sin θ.','20 : le point appartient à la droite décrite par ces paramètres.','À quoi correspond θ = 0 ?')],
  [/masques binaires et étiquettes/i,()=>X(`import numpy as np
masque = np.array([[0,1,1],[0,0,1]],dtype=np.uint8)
print(np.unique(masque))`,'Un masque contient des étiquettes de classes ; en binaire, on utilise deux valeurs.','[0 1]','La valeur 1 indique-t-elle toujours une vraie détection ?')],
  [/régions connexes/i,()=>X(`import cv2
import numpy as np
masque=np.array([[1,1,0],[0,0,0],[0,0,1]],dtype=np.uint8)
nb,labels=cv2.connectedComponents(masque)
print(nb-1)`,'Les composantes connexes comptent les régions de premier plan distinctes.','2 régions.','Que se passe-t-il si les deux régions se touchent ?')],
  [/élément structurant|érosion et dilatation|ouverture et fermeture|remplissage et trous|composantes connexes/i,()=>X(`import cv2
import numpy as np
mask=np.zeros((8,8),dtype=np.uint8)
mask[2:6,2:6]=255
kernel=np.ones((3,3),np.uint8)
erode=cv2.erode(mask,kernel)
print(np.count_nonzero(erode))`,'L’érosion rétrécit les régions ; la dilatation les agrandit.','4 pixels restent après l’érosion du carré 4×4.','Que change une ouverture sur un pixel isolé ?')],
  [/artefacts et reconstruction/i,()=>X(`import numpy as np
signal=np.array([1.,2.,3.,4.])
reconstruit=np.fft.ifft(np.fft.fft(signal)).real
print(np.allclose(signal,reconstruit))`,'La transformée inverse restitue le signal si l’on conserve toutes les composantes.','True.','Qu’arrive-t-il si tu supprimes brutalement des fréquences ?')],
  [/contrôle d’échec de VideoCapture/i,()=>X(`import cv2
cap=cv2.VideoCapture("video.mp4")
if not cap.isOpened():
    print("Fichier vidéo non lisible")
cap.release()`,'Vérifier l’ouverture évite de traiter des frames absentes.','Un message clair si la vidéo ne peut pas être ouverte.','Quelle condition vérifier dans la boucle de lecture ?')],
  [/MOG2/i,()=>X(`import cv2
fond=cv2.createBackgroundSubtractorMOG2(history=40,detectShadows=False)
# Dans la boucle vidéo :
# mouvement = fond.apply(frame)`,'MOG2 construit un modèle de fond adaptatif à partir des frames successives.','Le masque de mouvement est calculé pour chaque nouvelle frame réelle.','Pourquoi un objet longtemps immobile peut-il disparaître ?')],
  [/ground truth|annotation/i,()=>X(`import numpy as np
annotation = np.array([0,1,1,0],dtype=bool)
prediction = np.array([0,1,0,0],dtype=bool)
print(np.sum(annotation & prediction))`,'La ground truth est une annotation de référence contre laquelle comparer la prédiction.','1 pixel correctement détecté en positif.','Qui a créé la référence, et comment a-t-elle été contrôlée ?')],
  [/MSE et PSNR/i,()=>X(`import numpy as np
ref=np.array([0,100],dtype=float)
pred=np.array([0,90],dtype=float)
mse=np.mean((ref-pred)**2)
print(mse)`,'MSE pénalise les grandes erreurs de pixel au carré.','50.0','La MSE peut-elle être calculée sans référence ?')],
  [/SSIM et structure/i,()=>X(`from skimage.metrics import structural_similarity
import numpy as np
image=np.zeros((16,16),dtype=np.uint8)
print(structural_similarity(image,image,data_range=255))`,'SSIM compare des éléments de structure, contraste et luminance à une référence.','1.0 pour deux images identiques.','Quels détails d’une image sont importants pour ton métier ?')],
  [/faux positifs et faux négatifs/i,()=>X(`from sklearn.metrics import confusion_matrix
attendu=[1,1,0,0]
pred=[1,0,1,0]
print(confusion_matrix(attendu,pred))`,'Un faux positif signale un défaut absent ; un faux négatif manque un défaut réel.','[[1 1],[1 1]] : un de chaque type d’erreur.','Lequel est le plus coûteux sur une ligne de production ?')],
  [/modulariser|fonctions/i,()=>X(`def pretraiter(image):
    return image  # étape à remplacer
def mesurer(image):
    return len(image)
print(mesurer(pretraiter([1,2,3])))`,'Sépare les étapes pour les tester individuellement et modifier une seule fonction.','3.','Quel contrôle ajouter avant pretraiter ?')],
  [/traitement par lot|suivi des erreurs/i,()=>X(`images = ["image_01.png", "", "image_03.png"]
for nom in images:
    if not nom:
        print("Entrée manquante : ignorée")
        continue
    print("À traiter :", nom)`,'En production, chaque entrée invalide doit être signalée sans masquer les autres résultats.','Deux noms à traiter et une erreur documentée.','Quels identifiants ajouterais-tu au journal ?')],
  [/documentation, Git|README/i,()=>X(`# Exemple de commande de lancement
# python traiter_images.py --source images --sortie resultats
print("Documenter la commande, les dépendances et les limites")`,'Un README rend le projet reproductible pour un tuteur, un collègue ou un recruteur.','Les informations attendues apparaissent dans la documentation.','Comment prouver qu’un collègue a pu reproduire le résultat ?')],
  [/feed-forward|couches et réseau/i,()=>X(`import torch
from torch import nn
reseau=nn.Sequential(nn.Linear(2,4),nn.ReLU(),nn.Linear(4,1))
print(reseau(torch.ones(1,2)).shape)`,'Les couches réalisent des transformations successives avant une prédiction.','torch.Size([1, 1]).','Que représente la dimension 4 dans la couche cachée ?')],
  [/cross-entropy|fonction de perte/i,()=>X(`import torch
from torch.nn.functional import cross_entropy
scores=torch.tensor([[2.0,0.0]])
classe=torch.tensor([0])
print(round(cross_entropy(scores,classe).item(),3))`,'La cross-entropy compare la distribution des scores à la classe attendue.','Environ 0,127.','Que se passe-t-il si la mauvaise classe a un score dominant ?')],
  [/époques, batches/i,()=>X(`images=100
batch_size=20
epochs=3
print("Mises à jour (si toutes les batches sont complètes) :",images//batch_size*epochs)`,'Une époque parcourt le dataset ; une batch regroupe plusieurs exemples avant la mise à jour.','15 mises à jour.','Que devient le nombre d’étapes avec batch_size=25 ?')],
  [/N×C×H×W|entrées N/i,()=>X(`import torch
images=torch.zeros((8,3,224,224))
print("Batch, canaux, H, W :",images.shape)`,'PyTorch attend généralement le format [N,C,H,W], pas [N,H,W,C].','torch.Size([8, 3, 224, 224]).','Quel axe indique les trois canaux ?')],
  [/Dataset\/DataLoader|tensors et dataset/i,()=>X(`import torch
from torch.utils.data import DataLoader, TensorDataset
ds=TensorDataset(torch.ones(10,2),torch.zeros(10,dtype=torch.long))
print(len(list(DataLoader(ds,batch_size=4))))`,'Le DataLoader fournit des lots de données préparés au réseau.','3 batches (4, 4 et 2 exemples).','Pourquoi la dernière batch est-elle plus petite ?')],
  [/nn\.Module|définition du modèle/i,()=>X(`import torch
from torch import nn
class Modele(nn.Module):
    def __init__(self):
        super().__init__()
        self.couche=nn.Linear(2,1)
    def forward(self,x):
        return self.couche(x)
print(Modele()(torch.ones(1,2)).shape)`,'nn.Module organise les couches et la fonction forward d’un modèle PyTorch.','torch.Size([1, 1]).','Où ajouterais-tu une activation ReLU ?')],
  [/reproductibilité et checkpoints/i,()=>X(`import torch
torch.manual_seed(7)
modele=torch.nn.Linear(2,1)
torch.save(modele.state_dict(),"modele.pt")`,'Un checkpoint enregistre les poids appris ; la graine fixe facilite une comparaison reproductible.','Le fichier modele.pt contient les paramètres.','Que faut-il sauver pour reprendre aussi l’optimiseur ?')],
  [/propositions de régions|confiance/i,()=>X(`boites=[{"score":0.9,"x":10},{"score":0.4,"x":20}]
conservees=[b for b in boites if b["score"]>=0.5]
print(len(conservees))`,'Le score mesure la confiance du détecteur, mais pas à lui seul la précision de localisation.','1 boîte au-dessus du seuil.','Une boîte de confiance 0,9 est-elle nécessairement bien placée ?')],
  [/non-maximum suppression/i,()=>X(`# Deux prédictions très proches :
scores=[0.95,0.70]
# NMS conserve d'abord le score le plus élevé,
# puis supprime les boîtes trop redondantes (selon l'IoU).
print(max(scores))`,'La non-maximum suppression réduit les détections répétées d’un même objet.','0,95 est l’exemple de score prioritaire.','Pourquoi comparer aussi le recouvrement des boîtes ?')],
  [/semantic vs instance|instance segmentation/i,()=>X(`# Deux personnes dans une image :
semantique=[1,1]  # une classe « personne »
instances=[1,2]    # deux identifiants d'objets
print(len(set(instances)))`,'La segmentation sémantique identifie la classe par pixel ; celle par instance sépare les objets individuels.','2 instances.','Comment distinguer deux pièces identiques qui se touchent ?')],
  [/encoder, decoder|skip connections|U-Net/i,()=>X(`# Décomposition intuitive de U-Net :
hauteur=256
encode=[hauteur,hauteur//2,hauteur//4]
decode=[encode[-1]*2,encode[-1]*4]
print(encode,decode)`,'L’encodeur réduit la résolution pour capturer le contexte ; le décodeur la reconstruit, aidé par les skip connections.','[256, 128, 64] puis [128, 256] (schéma simplifié).','Pourquoi réutiliser les détails d’une couche haute résolution ?')],
  [/confusion matrix|précision, rappel, F1/i,()=>X(`from sklearn.metrics import precision_score,recall_score,f1_score
y=[1,1,0,0]
p=[1,0,1,0]
print(precision_score(y,p),recall_score(y,p),f1_score(y,p))`,'Précision pénalise les fausses alertes ; rappel pénalise les défauts manqués ; F1 les combine.','0.5 0.5 0.5.','Quelle métrique choisir si manquer un défaut est très grave ?')],
  [/augmentation|surapprentissage/i,()=>X(`# Augmentation : entraîner sur des variantes réalistes
import numpy as np
image=np.arange(9).reshape(3,3)
miroir=np.fliplr(image)
print(miroir.shape)`,'L’augmentation diversifie les images sans collecter une nouvelle étiquette, sous réserve de conserver la classe.','(3, 3).','Le miroir horizontal reste-t-il réaliste pour tous les objets ?')],
  [/temps d’inférence|performance et latence/i,()=>X(`from time import perf_counter
debut=perf_counter()
resultat=sum(range(10_000))
ms=(perf_counter()-debut)*1000
print(f"{ms:.3f} ms")`,'La latence mesure le temps nécessaire à une prédiction ; elle importe pour les applications temps réel.','Un temps en millisecondes qui dépend de la machine.','Pourquoi une moyenne seule masque-t-elle des pics de latence ?')],
  [/préparation du dataset|annotation/i,()=>X(`images=["image01.png","image02.png"]
labels=["bon","défaut"]
assert len(images)==len(labels)
print(len(images))`,'Les images doivent être alignées avec leurs annotations et séparées avant les augmentations.','2 paires image-étiquette.','Quel risque si deux images identiques sont dans train et test ?')],
  [/baseline classique|modèle appris/i,()=>X(`scores={"seuil_classique":0.74,"modele_appris":0.82}
print(max(scores,key=scores.get))`,'Une baseline simple indique si l’approche plus complexe apporte un gain mesurable.','modele_appris sur cet exemple fictif.','Que faut-il comparer à part le score ?')]
];
