export interface Lesson { title: string; explanation: string[]; focus: string[]; code: string; codeTitle: string; exercise: string; checks: string[]; hint: string; solution: string; readings: { title: string; url: string; instruction: string }[]; }
export const lessons: Lesson[] = [
  {
    title: 'Comprendre ce qui entre réellement dans ton pipeline',
    explanation: [
      'Une image chargée est un tableau de valeurs. shape décrit sa hauteur, sa largeur et éventuellement ses canaux. dtype décrit le type numérique. Avant tout calcul, inspecte ces propriétés et la plage des valeurs : une image uint8 et une image float normalisée ne se traitent pas de la même façon.',
      'OpenCV charge généralement les couleurs en BGR. Matplotlib attend du RGB. Le gris combine l’information de couleur en une intensité ; il ne permet pas de retrouver les couleurs originales. Un seuillage sépare des intensités, pas automatiquement des objets : éclairage, ombres et contacts entre pièces peuvent le mettre en échec.',
      'Un dataset exploitable conserve la provenance des images. Les images d’une même pièce ou d’une même séquence doivent rester dans le même ensemble pour éviter de mesurer la reconnaissance d’un exemple presque déjà vu. Le test reste réservé ; la validation sert aux choix pendant le développement.',
    ],
    focus: ['Inspecter les pixels avant de les modifier. Comparer un affichage BGR et RGB et expliquer la différence.', 'Partir d’un fond simple : seuillage, nettoyage du masque, contours. Observer les échecs avant de régler les paramètres.', 'Rendre les chemins et dépendances explicites. Un collègue doit pouvoir relancer le travail.', 'Contrôler la donnée et l’annotation ; conserver les images originales.', 'Construire un manifeste de splits par groupe ; ne pas faire de choix à partir du test.'],
    codeTitle: 'Lire, inspecter et afficher une image — exemple autonome',
    code: `from pathlib import Path
import cv2
import matplotlib.pyplot as plt

path = Path("data/piece.jpg")  # Remplacer par une image existante
image = cv2.imread(str(path), cv2.IMREAD_COLOR)
if image is None:
    raise ValueError(f"Image illisible : {path}")
print("shape:", image.shape, "dtype:", image.dtype)
print("min/max:", image.min(), image.max())
rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
_, mask = cv2.threshold(gray, 0, 255,
                        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
# L’inversion suppose ici des pièces sombres sur fond clair.
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,
                               cv2.CHAIN_APPROX_SIMPLE)
areas = [cv2.contourArea(c) for c in contours]
print("Contours trouvés:", len(contours), "surfaces en pixels²:", areas)
plt.imshow(rgb)
plt.axis("off")
plt.show()`,
    exercise: 'Construis inspect_images.py : entrée = dossier ; sorties = tableau nom/shape/type, liste des fichiers illisibles et images de comptage. Teste sur au moins dix images variées. Aucun chemin propre à ton PC ne doit être codé en dur.',
    checks: ['Un fichier illisible est signalé sans arrêter tout le dossier.', 'Les images sauvegardées ont les couleurs attendues.', 'Le comptage est comparé manuellement ; trois échecs sont conservés.', 'Le README permet de relancer le script.'],
    hint: 'Commence par une image dont tu connais le nombre de pièces. Affiche séparément l’original, le masque et les contours ; ne change qu’un réglage à la fois.',
    solution: 'La démarche attendue : vérifier imread → inspecter shape/dtype → convertir explicitement les canaux → créer un masque → nettoyer si nécessaire → extraire les contours → filtrer par un critère justifié → comparer au comptage manuel. Ne présente pas les surfaces en mm² sans calibration.',
    readings: [
      { title: 'Dataset principal — KolektorSDD2', url: 'https://www.vicos.si/resources/kolektorsdd2/', instruction: 'Télécharger depuis les auteurs. Images conformes/défectueuses et annotations de défauts : support pour classification puis segmentation. Conserver le test officiel et créer la validation à partir du train. Usage pédagogique non commercial selon la licence.' },
      { title: 'OpenCV — opérations sur les images', url: 'https://docs.opencv.org/4.x/d3/df2/tutorial_py_basic_ops.html', instruction: 'Lire accès aux pixels, propriétés, ROI et séparation des canaux ; reproduire chaque opération.' },
      { title: 'OpenCV — morphologie', url: 'https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html', instruction: 'Comparer érosion, dilatation, ouverture et fermeture sur ton masque.' },
      { title: 'scikit-learn — fuites de données', url: 'https://scikit-learn.org/stable/common_pitfalls.html', instruction: 'Lire Data leakage ; donner un exemple de fuite dans ton propre dataset.' },
    ],
  },
  {
    title: 'Maîtriser une boucle d’entraînement',
    explanation: [
      'Le Dataset fournit une image et sa cible. Le DataLoader les regroupe en batches. Pour un CNN, le batch image a généralement la forme N,C,H,W. Pour une classification multiclasse avec CrossEntropyLoss, le modèle fournit des logits N,K et les cibles sont des indices de classe entiers de forme N.',
      'Chaque étape d’apprentissage remet les gradients à zéro, calcule les prédictions, la loss, les gradients puis met à jour les poids. En validation, model.eval() change le comportement de certaines couches ; inference_mode() empêche la construction du graphe de gradients. Les deux ont des rôles différents.',
      'Un premier test utile consiste à surapprendre un minuscule batch. S’il n’y arrive pas, vérifie les labels, la loss, les shapes et les gradients avant d’entraîner longtemps. Une accuracy élevée peut masquer une mauvaise détection des défauts rares : regarde chaque classe.',
    ],
    focus: ['Visualiser un batch et ses cibles avant de créer le modèle.', 'Calculer les dimensions de sortie et tester un forward.', 'Séparer train et validation ; sauvegarder seulement selon la validation.', 'Examiner précision/rappel par classe et exemples d’erreurs.', 'Relancer sans notebook caché et expliquer toute la boucle.'],
    codeTitle: 'Petit CNN et une étape d’apprentissage — test autonome sur tenseurs',
    code: `import torch
from torch import nn

torch.manual_seed(42)
model = nn.Sequential(
    nn.Conv2d(3, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(),
    nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(32, 2)
)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()
# Données synthétiques pour vérifier le code, pas pour évaluer un modèle.
images = torch.rand(4, 3, 64, 64)
labels = torch.tensor([0, 1, 0, 1], dtype=torch.long)
model.train()
optimizer.zero_grad(set_to_none=True)
logits = model(images)
loss = criterion(logits, labels)
loss.backward()
optimizer.step()
print(logits.shape, float(loss.detach()))
model.eval()
with torch.inference_mode():
    predictions = model(images).argmax(dim=1)
print(predictions)
torch.save(model.state_dict(), "cnn.pt")`,
    exercise: 'Remplace les tenseurs synthétiques par ton DataLoader. Entraîne un petit CNN, sauvegarde le meilleur checkpoint et fais une prédiction depuis un second script après rechargement.',
    checks: ['Les images et labels du batch sont vérifiés visuellement.', 'Le petit batch peut être surappris.', 'La validation ne met pas à jour les poids.', 'La matrice de confusion correspond à la bonne correspondance indice/classe.'],
    hint: 'Si la loss ne baisse pas, inspecte un seul batch, imprime les shapes et vérifie qu’au moins un paramètre reçoit un gradient non nul.',
    solution: 'Le checkpoint doit être rechargé dans la même architecture. Conserver aussi class_to_idx, preprocessing et configuration. Comparer la prédiction du modèle avant sauvegarde et après rechargement en mode eval sur la même image.',
    readings: [
      { title: 'PyTorch — workflow de base', url: 'https://docs.pytorch.org/tutorials/beginner/basics/', instruction: 'Suivre uniquement Tensors, Datasets & DataLoaders, Build Model et Optimization avec tes propres données.' },
      { title: 'PyTorch — sauvegarder et recharger', url: 'https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html', instruction: 'Reproduire le rechargement depuis un nouveau processus.' },
    ],
  },
  {
    title: 'Adapter un modèle existant avec une comparaison honnête',
    explanation: [
      'Un backbone préentraîné fournit des caractéristiques déjà apprises. Commence par entraîner une nouvelle tête ; si nécessaire, dégèle ensuite une partie du backbone avec un learning rate plus faible. ResNet18 peut servir pour itérer rapidement ; ResNet50 est une comparaison possible selon les ressources.',
      'Les poids préentraînés ont un preprocessing associé : taille, normalisation et canaux comptent. Geler les paramètres ne gèle pas automatiquement les statistiques BatchNorm : pour une extraction fixe, garde le backbone en mode eval.',
      'Une comparaison exige les mêmes splits et le même protocole d’évaluation. Choisis sur validation ; le test ne sert pas à chercher la meilleure augmentation. Une amélioration utile peut être moins de défauts manqués, même si l’accuracy globale change peu.',
    ],
    focus: ['Charger les poids et leur transform ; inspecter l’entrée obtenue.', 'Comprendre paramètres gelés et statistiques BatchNorm.', 'Vérifier qu’une augmentation ne détruit pas la signature du défaut.', 'Comparer qualité et coût dans les mêmes conditions.', 'Défendre le modèle retenu avec un tableau d’expériences.'],
    codeTitle: 'Construire un extracteur fixe ResNet — nécessite le téléchargement des poids',
    code: `import torch
from torch import nn
from torchvision.models import resnet18, ResNet18_Weights

weights = ResNet18_Weights.DEFAULT
model = resnet18(weights=weights)
for parameter in model.parameters():
    parameter.requires_grad = False
model.fc = nn.Linear(model.fc.in_features, 2)
preprocess = weights.transforms()
optimizer = torch.optim.Adam(model.fc.parameters(), lr=1e-3)
# À refaire au début de chaque époque d’extraction fixe :
model.eval()         # Garde BatchNorm fixe dans le backbone
model.fc.train()     # Seule la nouvelle tête apprend
# images = torch.stack([preprocess(pil_image), ...])
# logits = model(images)
# loss = nn.CrossEntropyLoss()(logits, labels)
# optimizer.zero_grad(); loss.backward(); optimizer.step()`,
    exercise: 'Compare petit CNN, tête seule et fine-tuning des dernières couches. Conserve le même split et un budget d’expérimentation explicite. Présente les erreurs qui changent et celles qui restent.',
    checks: ['Le preprocessing correspond aux poids.', 'Les paramètres entraînés sont identifiés.', 'Le modèle est choisi sur validation.', 'Temps d’inférence et rappel défaut figurent dans la comparaison.'],
    hint: 'Avant un fine-tuning complet, compte les paramètres requires_grad=True et vérifie les modes train/eval des sous-modules.',
    solution: 'La comparaison attendue garde un journal : identifiant, poids, couches dégelées, learning rate, augmentations, durée et métriques. Retenir une configuration justifiée puis la geler avant le test final.',
    readings: [{ title: 'PyTorch — transfer learning', url: 'https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html', instruction: 'Comparer ConvNet as fixed feature extractor et fine-tuning ; traduire les étapes dans ton projet.' }],
  },
  {
    title: 'Détecter signifie localiser et reconnaître',
    explanation: [
      'Une annotation YOLO de détection contient généralement class_id, centre x/y et largeur/hauteur normalisés par la taille de l’image. Une boîte incorrecte enseigne une mauvaise localisation ; visualise l’export avant l’entraînement.',
      'IoU mesure le recouvrement entre deux boîtes. La précision indique la part des détections qui sont correctes ; le rappel indique la part des objets attendus qui sont retrouvés. mAP résume des courbes précision-rappel selon un protocole de classes et de seuils IoU.',
      'Le seuil de confiance et la suppression des boîtes redondantes affectent le résultat. Un seuil plus bas peut retrouver des objets tout en ajoutant de fausses alertes. Choisis les réglages selon le besoin et les données de validation.',
    ],
    focus: ['Écrire des règles d’annotation cohérentes pour les objets coupés ou cachés.', 'Visualiser les prédictions préentraînées avant adaptation.', 'Interpréter mAP50 et mAP50-95 sans les confondre.', 'Examiner les faux positifs au seuil choisi.', 'Livrer aussi les comptages structurés, pas uniquement les images dessinées.'],
    codeTitle: 'Adapter et utiliser YOLO — dépend d’un dataset annoté local',
    code: `from pathlib import Path
from ultralytics import YOLO

# Installer ultralytics, puis préparer data/pieces.yaml.
# Exemple de YAML :
# path: /chemin/vers/dataset
# train: images/train
# val: images/val
# names: {0: piece}
model = YOLO("yolo11n.pt")  # Poids téléchargés au premier appel
run = model.train(data="data/pieces.yaml", epochs=20, imgsz=640)
best = YOLO(str(Path(run.save_dir) / "weights" / "best.pt"))
metrics = best.val(data="data/pieces.yaml", split="val")
print("mAP50-95:", metrics.box.map)
for result in best.predict(source="data/nouvelles_images", conf=0.25):
    print(result.path, "objets:", len(result.boxes))`,
    exercise: 'Annote ou contrôle un petit dataset de pièces, entraîne le détecteur et produis un CSV image/classe/confiance/boîte. Fournis une galerie d’objets manqués et de fausses détections.',
    checks: ['Les boîtes exportées sont correctement superposées.', 'Les classes sont identiques entre annotations et configuration.', 'Les métriques par classe sont rapportées.', 'Le seuil choisi est justifié sur validation.'],
    hint: 'Avant 20 époques, exécute une courte passe pour vérifier données, labels et chemins. Une absence d’annotations ne doit pas être confondue avec des images réellement sans objet.',
    solution: 'D’abord vérifier les données, puis baseline, adaptation, métriques et galerie. Séparer erreurs de classe, objets manqués, doublons et mauvaise localisation ; les actions correctives ne sont pas les mêmes.',
    readings: [
      { title: 'Dataset de détection — NEU-DET', url: 'https://faculty.neu.edu.cn/songkc/en/zdylm/263265/', instruction: 'Récupérer la variante avec bounding boxes depuis la page des auteurs ; contrôler les conditions d’utilisation, les classes et les annotations avant conversion YOLO. Ce jeu porte sur les défauts de surface : adapter les noms de classes au dataset.' },
      { title: 'Ultralytics — détection', url: 'https://docs.ultralytics.com/tasks/detect/', instruction: 'Lire Train, Val et Predict ; retrouver les sorties dont ton script a besoin.' },
      { title: 'Ultralytics — format du dataset', url: 'https://docs.ultralytics.com/datasets/detect/', instruction: 'Lire Ultralytics YOLO format ; visualiser tes annotations après export.' },
    ],
  },
  {
    title: 'Transformer les erreurs en expériences',
    explanation: [
      'Une galerie d’échecs sert à identifier une cause. Distingue annotation erronée, classe ambiguë, manque d’exemples, petit défaut et condition d’acquisition nouvelle. Ne corrige pas automatiquement le modèle quand la donnée est en cause.',
      'Le score global peut cacher une régression : mesure aussi par classe, éclairage, taille et provenance. Une expérience modifie un facteur principal, garde un protocole stable et conserve le résultat même quand l’hypothèse échoue.',
      'Un test de robustesse indique des limites, pas une garantie générale. Après modification des données, vérifie les splits à nouveau. N’ajoute jamais au train une image issue du test réservé pour améliorer le score final.',
    ],
    focus: ['Créer une taxonomie simple des causes d’échec.', 'Construire un sous-ensemble par condition de prise de vue.', 'Corriger les données et conserver la traçabilité.', 'Mesurer les régressions, pas seulement les gains.', 'Présenter une recommandation avec des preuves.'],
    codeTitle: 'Analyser des erreurs de classification — exemple autonome',
    code: `import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

# Remplacer par les labels et prédictions conservés sur validation.
y_true = np.array([0, 1, 1, 0, 1, 0])
y_pred = np.array([0, 0, 1, 1, 1, 0])
conditions = np.array(["clair", "sombre", "clair", "sombre", "clair", "clair"])
print(confusion_matrix(y_true, y_pred, labels=[0, 1]))
print(classification_report(y_true, y_pred, labels=[0, 1],
      target_names=["conforme", "défaut"], zero_division=0))
for condition in np.unique(conditions):
    keep = conditions == condition
    print(condition, "n=", int(keep.sum()),
          "erreurs=", int((y_true[keep] != y_pred[keep]).sum()))`,
    exercise: 'Choisis la cause principale de défauts manqués. Formule une hypothèse, réalise une correction ciblée et compare avant/après. Présente aussi les cas dégradés par ta correction.',
    checks: ['Les exemples d’erreur sont identifiables.', 'La correction répond à une hypothèse explicite.', 'La comparaison garde le même protocole.', 'Les effectifs des sous-groupes et les limites sont visibles.'],
    hint: 'Écris une phrase avant de coder : « Je pense que X explique Y ; si je change Z, je m’attends à observer W. »',
    solution: 'Le compte rendu tient en problème → preuves → hypothèse → modification → mesure → décision. Un gain sur trois images ne suffit pas à conclure à une robustesse générale ; noter l’effectif et collecter davantage si nécessaire.',
    readings: [{ title: 'scikit-learn — rapport de classification', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.classification_report.html', instruction: 'Identifier précision, rappel, F1, support, moyenne macro et moyenne pondérée.' }],
  },
  {
    title: 'Apprendre et vérifier une décision par pixel',
    explanation: [
      'La segmentation binaire associe à chaque pixel une cible fond/défaut. Le masque contient des classes ; son redimensionnement utilise généralement le plus proche voisin pour préserver les valeurs discrètes. Une rotation ou un recadrage doit être identique pour l’image et son masque.',
      'U-Net combine un encodeur et un décodeur avec des connexions qui réinjectent les détails spatiaux. Le modèle produit des logits ; BCEWithLogitsLoss intègre la transformation adaptée pour une loss binaire. Le seuil de prédiction s’applique après sigmoid, au moment de l’évaluation.',
      'IoU compare intersection et union ; Dice pondère l’intersection par la somme des surfaces. Fixe aussi la convention pour deux masques vides et rapporte séparément les images sans défaut : beaucoup de fonds corrects peuvent masquer des défauts manqués.',
    ],
    focus: ['Superposer chaque masque à son image avant de lancer le réseau.', 'Vérifier les transformations synchronisées et les valeurs du masque.', 'Observer les prédictions avec les métriques.', 'Protéger les petits défauts lors du post-traitement.', 'Justifier le choix entre classe, boîte et masque.'],
    codeTitle: 'Loss binaire, Dice et IoU — exemple autonome sur masques',
    code: `import torch
import torch.nn.functional as F

# Démonstration : remplacer logits par model(images).
logits = torch.tensor([[[[-2., 2.], [3., -1.]]]])
target = torch.tensor([[[[0., 1.], [1., 0.]]]])
loss = F.binary_cross_entropy_with_logits(logits, target)
pred = logits.sigmoid() >= 0.5
truth = target.bool()
intersection = (pred & truth).sum().item()
union = (pred | truth).sum().item()
size = pred.sum().item() + truth.sum().item()
# Convention explicite : deux masques vides donnent un score de 1.
iou = intersection / union if union else 1.0
dice = 2 * intersection / size if size else 1.0
print("loss:", loss.item(), "IoU:", iou, "Dice:", dice)`,
    exercise: 'Adapte un U-Net de référence sur un dataset supervisé avec masques. Produis une galerie image/vérité terrain/prédiction et un rapport par image incluant les cas sans défaut.',
    checks: ['Masques et images sont alignés après augmentation.', 'Les valeurs du masque restent valides.', 'Le calcul des métriques est vérifié sur un masque parfait, vide et décalé.', 'Le seuil est choisi sur validation et les défauts manqués sont montrés.'],
    hint: 'Si les contours semblent systématiquement décalés, inspecte les transformations avant d’augmenter la taille du réseau.',
    solution: 'Vérifier un batch → surapprendre quelques images → entraîner sur train → choisir checkpoint et seuil sur validation → garder le test réservé. Les masks ne doivent pas recevoir une normalisation destinée aux images RGB.',
    readings: [
      { title: 'U-Net — article original', url: 'https://arxiv.org/abs/1505.04597', instruction: 'Lire le résumé et le schéma d’architecture ; expliquer les skip connections en une minute.' },
      { title: 'U-Net — implémentation de référence PyTorch', url: 'https://github.com/milesial/Pytorch-UNet', instruction: 'Inspecter dataset, transformations et procédure d’entraînement ; fixer la version utilisée et créditer le code réutilisé.' },
    ],
  },
  {
    title: 'Passer du notebook au programme livré',
    explanation: [
      'Un pipeline livré explicite les entrées, les poids, le preprocessing et le post-traitement. Le même modèle avec une normalisation différente peut donner des résultats faux sans provoquer d’exception. Enregistre la correspondance des classes et la configuration avec les poids.',
      'Un export ONNX doit être comparé au modèle de référence sur plusieurs entrées. Vérifie les sorties numériques et les décisions après post-traitement. Certaines dimensions ou opérations peuvent nécessiter une configuration particulière.',
      'Une mesure de latence précise le matériel, le backend, la résolution et le batch. Fais un warm-up ; sur GPU, synchronise avant et après la mesure. Distingue le temps du modèle du temps complet lecture → preprocessing → prédiction → sortie.',
    ],
    focus: ['Définir une interface simple et rendre la configuration explicite.', 'Produire des sorties réutilisables et des erreurs compréhensibles.', 'Comparer l’export aux sorties du modèle initial.', 'Mesurer dans des conditions reproductibles.', 'Faire exécuter le README par quelqu’un d’autre.'],
    codeTitle: 'Exécuter un modèle ONNX — nécessite un modèle exporté et son preprocessing',
    code: `import numpy as np
import onnxruntime as ort

session = ort.InferenceSession("model.onnx",
                               providers=["CPUExecutionProvider"])
input_info = session.get_inputs()[0]
print("Entrée attendue:", input_info.name, input_info.shape, input_info.type)
# Exemple de shape uniquement. Utiliser le vrai preprocessing du modèle.
x = np.zeros((1, 3, 224, 224), dtype=np.float32)
outputs = session.run(None, {input_info.name: x})
print([value.shape for value in outputs])
# Comparer ensuite à la référence PyTorch sur les MÊMES images.
# np.testing.assert_allclose(onnx_output, torch_output,
#                            rtol=1e-3, atol=1e-5)`,
    exercise: 'Livre une commande predict qui fonctionne sur une image ou un dossier. Ajoute un export, un benchmark et un guide permettant de reproduire les résultats depuis un environnement neuf.',
    checks: ['Aucun chemin absolu privé dans le code.', 'Poids, classes et preprocessing sont identifiés.', 'La différence entre référence et export est mesurée.', 'Temps modèle et temps pipeline sont distingués.'],
    hint: 'Avant de mesurer la vitesse, fais correspondre les résultats. Un pipeline rapide qui applique le mauvais preprocessing ne répond pas au besoin.',
    solution: 'Le paquet minimal comprend dépendances, configuration, référence des poids, commande d’inférence, exemples d’entrée/sortie, métriques et limites. L’utilisateur du programme ne doit pas exécuter les cellules d’un notebook dans un ordre implicite.',
    readings: [
      { title: 'ONNX Runtime — Python', url: 'https://onnxruntime.ai/docs/get-started/with-python.html', instruction: 'Créer une session, inspecter son entrée et exécuter une inférence.' },
      { title: 'Ultralytics — export et benchmark', url: 'https://docs.ultralytics.com/modes/', instruction: 'Lire Export et Benchmark si ton pipeline final utilise YOLO.' },
    ],
  },
  {
    title: 'Répondre à une demande et défendre sa livraison',
    explanation: [
      'Un besoin métier devient des critères mesurables : quels défauts, dans quelles conditions, quelles erreurs sont coûteuses, quel temps de traitement et quel format de sortie. Ces critères précèdent l’évaluation finale.',
      'Réutilise les briques utiles. Une mission de contrôle conforme/défaut ne demande pas forcément une segmentation. Compare à une baseline simple et explique pourquoi la complexité supplémentaire est justifiée.',
      'Gèle la configuration choisie sur validation, puis évalue sur le test réservé. Un critère non atteint doit être visible dans le rapport. La livraison inclut aussi les limites, les conditions d’utilisation et une prochaine action réaliste.',
    ],
    focus: ['Écrire des critères d’acceptation concrets avant la mesure.', 'Intégrer seulement les briques nécessaires.', 'Évaluer honnêtement sur le test réservé.', 'Reproduire depuis un environnement neuf.', 'Démontrer et répondre aux questions sans cacher les limites.'],
    codeTitle: 'Enregistrer une évaluation finale — exemple autonome de structure',
    code: `import json
from pathlib import Path

report = {
    "experiment_id": "final-v1",
    "checkpoint": "artifacts/best.pt",
    "split_manifest": "data/test_manifest.csv",
    "configuration_frozen": True,
    "metrics": {},  # Remplir avec les valeurs réellement calculées
    "acceptance_criteria": [],  # seuil, mesure et verdict pour chaque critère
    "limitations": [],
}
Path("reports").mkdir(exist_ok=True)
Path("reports/final.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
# Ne jamais remplacer une métrique non calculée par une valeur inventée.`,
    exercise: 'Prépare une démonstration de dix minutes : problème, données, baseline, choix, résultats, échecs et utilisation. Fais exécuter la solution à une autre personne puis réponds à une modification du besoin.',
    checks: ['Les critères métier sont évalués explicitement.', 'Le test réservé n’a pas servi à régler le modèle.', 'Le dépôt permet de reproduire la livraison.', 'Tu expliques un échec et proposes une action précise.'],
    hint: 'Commence la présentation par le problème et une démonstration. Réserve les détails du réseau aux choix qu’ils permettent de justifier.',
    solution: 'Une revue solide montre aussi ce qui ne fonctionne pas. Pour chaque critère : objectif fixé, mesure observée, verdict et limite de la mesure. Le bilan final distingue tâches réalisées et compétences démontrées en autonomie.',
    readings: [{ title: 'PyTorch — sauvegarder une solution', url: 'https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html', instruction: 'Vérifier que ton checkpoint contient les éléments nécessaires au rechargement et à la reprise.' }],
  },
];
