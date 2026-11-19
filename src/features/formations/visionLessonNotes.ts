/* 48 computer-vision lessons with specific theory, guided exercises and pitfalls. */
export const visionLessonNotes: Record<string, Array<[string,string,string]>> = {
  "classification-ml": [
    [
      "En classification, une image reçoit une étiquette globale comme « pièce conforme ». Les classes doivent être définies sans ambiguïté et leurs fréquences connues pour interpréter les résultats.",
      "Étiquette dix images de chiffres et explique le choix pour deux cas ambigus.",
      "Une étiquette appliquée à toute l’image ne localise pas le défaut."
    ],
    [
      "Des features sont des valeurs décrivant l’image : pixels, histogrammes, contours ou représentations apprises. Une caractéristique utile dépend du problème et des variations d’acquisition.",
      "Compare deux images représentées par pixels bruts puis par histogrammes.",
      "Un modèle sensible aux pixels bruts peut échouer lorsque l’objet se déplace légèrement."
    ],
    [
      "L’apprentissage supervisé part d’images accompagnées d’étiquettes de référence. Le modèle ajuste une fonction qui associe une entrée à une classe ; la qualité des annotations conditionne le résultat.",
      "Dessine X (images) et y (labels), puis définis ce que prédit le modèle.",
      "Apprendre sur des étiquettes inconsistantes limite la précision maximale atteignable."
    ],
    [
      "L’entraînement sert à ajuster les paramètres, la validation à choisir la méthode et le test à estimer le comportement final. Les images proches d’un même objet ou patient doivent rester dans le même groupe.",
      "Propose une séparation train/val/test de 100 images et justifie les contraintes de groupe.",
      "Tester des copies presque identiques d’images vues pendant l’apprentissage gonfle le score."
    ],
    [
      "KNN prédit à partir des exemples d’entraînement les plus proches selon une distance. Le choix de k et l’échelle des features influencent la prédiction ; une baseline simple donne un point de comparaison.",
      "Compare k=1 et k=7 sur digits avec la même séparation d’entraînement.",
      "Choisir k en regardant le score du test final contamine l’évaluation."
    ],
    [
      "La matrice de confusion croise vraies et classes prédites. La diagonale représente les réussites, les autres cellules les erreurs ; les métriques par classe sont utiles en cas de déséquilibre.",
      "Trouve la classe la plus souvent confondue avec le chiffre 8 dans une matrice.",
      "Une accuracy élevée peut masquer l’échec complet d’une classe rare."
    ]
  ],
  "reseaux-neurones": [
    [
      "Un neurone réalise une combinaison z=w·x+b, suivie éventuellement d’une activation. Les poids et le biais sont des paramètres appris ; leur initialisation influence la vitesse d’apprentissage.",
      "Calcule z pour x=[1,2], w=[0,5,-1] et b=1, puis vérifie en Python.",
      "Oublier le terme biais réduit inutilement la capacité du modèle."
    ],
    [
      "ReLU=max(0,x) supprime les valeurs négatives ; sigmoid borne entre 0 et 1 ; softmax normalise plusieurs logits en probabilités relatives. Leur rôle dépend de la couche et de la loss utilisée.",
      "Applique ReLU et sigmoid à -2, 0, 2 et compare les résultats.",
      "Mettre softmax avant CrossEntropyLoss dans PyTorch peut doubler le traitement attendu."
    ],
    [
      "Un réseau feed-forward compose des couches successives. Les dimensions doivent s’enchaîner : la sortie de la couche i doit être compatible avec l’entrée de la couche i+1.",
      "Construis un réseau Linear(4,8), ReLU, Linear(8,2) et vérifie les formes.",
      "Une erreur de dimensions de tenseur empêche le calcul forward."
    ],
    [
      "La fonction de perte quantifie l’écart entre prédiction et vérité. La cross-entropy est courante en classification ; la valeur de loss n’est pas directement un pourcentage de bonnes réponses.",
      "Compare une prédiction très confiante correcte à une prédiction très confiante fausse.",
      "Un score de loss plus faible sur train peut cacher une dégradation sur validation."
    ],
    [
      "La rétropropagation calcule les gradients de la perte par rapport aux paramètres ; l’optimiseur les utilise pour ajuster les poids. zero_grad évite l’accumulation involontaire des gradients entre lots.",
      "Écris l’ordre exact forward → loss → zero_grad → backward → step.",
      "Oublier zero_grad modifie l’intensité des mises à jour et peut déstabiliser l’apprentissage."
    ],
    [
      "Une époque correspond à un passage complet sur le jeu d’entraînement ; un batch contient une fraction des exemples. Le surapprentissage apparaît souvent lorsque le train progresse et que la validation se dégrade.",
      "Trace loss train/val sur dix époques et identifie le début de divergence.",
      "Évaluer uniquement la perte d’entraînement ne démontre pas la généralisation."
    ]
  ],
  "convolutions-cnn": [
    [
      "Un filtre classique utilise des coefficients définis à l’avance ; un filtre CNN ajuste ses coefficients à partir de la loss. Il peut apprendre des bords, des textures ou des motifs plus complexes selon les couches.",
      "Compare un Sobel figé à un noyau Conv2d dont les poids changent après entraînement.",
      "Un noyau appris n’est pas automatiquement interprétable comme un détecteur d’objet."
    ],
    [
      "En PyTorch, une image par lot suit généralement N×C×H×W. N est le batch, C les canaux, H la hauteur et W la largeur. Une seule image grise nécessite souvent une dimension canal explicite.",
      "Vérifie la forme de dix images grayscale 28×28 après unsqueeze(1).",
      "Confondre HWC de NumPy avec CHW attendu par PyTorch déforme les entrées."
    ],
    [
      "Conv2d utilise kernel_size, stride, padding et nombre de canaux de sortie. Un padding de 1 avec un noyau 3×3 et stride 1 conserve souvent H et W.",
      "Calcule la taille de sortie pour entrée 28, noyau 3, stride 1, padding 0.",
      "Une mauvaise formule de dimension produit des erreurs lors du flatten."
    ],
    [
      "Une feature map représente la réponse spatiale d’un filtre. Des canaux distincts répondent à des motifs différents ; ils ne sont pas directement des classes ou des masques sémantiques.",
      "Visualise les huit cartes d’une couche Conv2d pour une image synthétique.",
      "Une carte fortement activée ne prouve pas la reconnaissance d’une classe entière."
    ],
    [
      "ReLU annule les réponses négatives ; MaxPool2d sélectionne le maximum d’un voisinage et réduit la résolution. Le pooling peut renforcer une certaine invariance mais fait perdre de la précision spatiale.",
      "Applique pooling 2×2 à une matrice 4×4 et calcule les quatre valeurs de sortie.",
      "Trop de pooling peut effacer les petits défauts à segmenter."
    ],
    [
      "Flatten transforme les cartes de caractéristiques en vecteur, puis Linear produit des scores par classe. La taille d’entrée de Linear doit être calculée à partir de toutes les dimensions après convolution/pooling.",
      "Calcule pourquoi huit cartes 4×4 donnent 128 entrées à une couche linéaire.",
      "Coder une taille d’entrée incorrecte fait échouer l’inférence."
    ]
  ],
  "pytorch-entrainement": [
    [
      "Un Tensor contient des nombres avec shape, dtype et device. Dataset représente les exemples ; DataLoader produit des mini-lots, éventuellement mélangés pendant l’entraînement mais pas nécessairement au test.",
      "Construit un Tensor de dix images, puis parcourt des batches de taille quatre.",
      "Ne pas normaliser de la même façon les jeux train et test crée un écart artificiel."
    ],
    [
      "nn.Module organise les sous-couches et définit forward. Les paramètres enregistrés peuvent être optimisés et sauvegardés automatiquement par PyTorch.",
      "Écris une classe MiniNet avec Conv2d, ReLU et Linear ; teste le shape de sortie.",
      "Créer de nouvelles couches dans forward à chaque appel empêche un apprentissage stable."
    ],
    [
      "CrossEntropyLoss compare logits et classes entières ; Adam ajuste les poids à partir des gradients. Le learning rate règle l’amplitude des mises à jour et influence convergence ou divergence.",
      "Teste deux learning rates et compare la perte après trois époques.",
      "Un learning rate trop élevé peut faire diverger la loss malgré un modèle correct."
    ],
    [
      "model.train active le comportement d’entraînement, notamment dropout et batchnorm ; model.eval prépare l’inférence. torch.no_grad désactive le suivi de gradients pendant l’évaluation.",
      "Vérifie qu’aucun gradient ne s’accumule dans un bloc no_grad pendant la validation.",
      "Oublier model.eval peut rendre l’évaluation instable avec des couches sensibles au mode."
    ],
    [
      "Suivre la loss par époque aide à repérer la convergence ; il faut aussi mesurer les performances de validation pour détecter le surapprentissage. Les résultats doivent être reportés sur un test indépendant.",
      "Trace deux courbes train/val et commente quand le modèle commence à surapprendre.",
      "Choisir la meilleure époque à partir du test final fausse la performance annoncée."
    ],
    [
      "Une seed documentée réduit la variabilité ; un checkpoint enregistre state_dict et paramètres de préparation des données. Pour réutiliser un modèle, l’architecture et les versions doivent correspondre.",
      "Sauvegarde puis recharge state_dict d’un petit réseau et compare les prédictions.",
      "Un fichier de poids sans architecture ni normalisation décrite est difficilement réutilisable."
    ]
  ],
  "detection-objets": [
    [
      "La classification répond « quoi ? » pour l’image entière ; la détection ajoute « où ? » avec boîtes ; la segmentation précise les pixels. Le type de sortie doit correspondre au besoin métier.",
      "Pour une image avec trois vis, écris le résultat attendu en classification puis en détection.",
      "Une étiquette globale « vis » ne permet pas de compter trois objets."
    ],
    [
      "Une bounding box est souvent codée x_min, y_min, x_max, y_max ou centre/largeur/hauteur. Les conventions de coordonnées, échelles normalisées et bords exclusifs doivent être explicites.",
      "Convertis une boîte xyxy en xywh et affiche-la sur une image.",
      "Confondre coordonnées normalisées 0–1 et pixels rend les boîtes inutilisables."
    ],
    [
      "L’IoU des boîtes compare l’aire d’intersection à l’aire de l’union. Une IoU élevée indique un bon recouvrement, mais ne vérifie pas à elle seule la classe prédite.",
      "Calcule l’IoU de deux boîtes 20×20 se chevauchant sur 10 pixels de large.",
      "Une boîte correcte géométriquement mais associée à une mauvaise classe reste une détection incorrecte."
    ],
    [
      "Un détecteur évalue des régions candidates et leur associe classe, boîte et confiance. Les approches one-stage et two-stage diffèrent par leur organisation ; la confiance doit être calibrée ou vérifiée.",
      "Représente un ensemble de propositions de régions et classe-les par score.",
      "Un score de confiance de 0,9 n’est pas nécessairement une probabilité calibrée à 90 %."
    ],
    [
      "Le NMS élimine des boîtes très superposées en conservant les plus prometteuses. Le seuil IoU du NMS dépend de l’éloignement habituel des objets et peut supprimer des objets proches.",
      "Dessine trois boîtes, applique un NMS conceptuel et explique la suppression d’une boîte redondante.",
      "Un NMS trop agressif supprime de vraies détections d’objets voisins."
    ],
    [
      "YOLO est une famille de détecteurs one-stage ; Faster R-CNN utilise notamment un réseau de propositions de régions. Le choix dépend du compromis précision, temps d’inférence, taille et disponibilité des données annotées.",
      "Compare exigences d’une caméra temps réel et d’une inspection hors ligne.",
      "Un modèle rapide sur GPU peut ne pas être temps réel sur un équipement embarqué CPU."
    ]
  ],
  "segmentation-deep": [
    [
      "La segmentation sémantique classe les pixels, l’instance segmentation sépare plusieurs objets de même classe. Une tâche « compter des pièces » peut nécessiter de séparer les instances même si elles partagent l’étiquette.",
      "Dessine deux objets touchants et montre pourquoi un masque sémantique unique ne suffit pas au comptage.",
      "Une bonne IoU sémantique ne garantit pas un bon nombre d’instances."
    ],
    [
      "Les masques ground truth doivent partager géométrie, repère et classes avec les images. Un masque catégoriel est redimensionné en nearest-neighbor afin de ne pas créer de nouvelles étiquettes.",
      "Contrôle shape et valeurs uniques avant et après resize d’un masque.",
      "Appliquer un flou à un masque de classes altère sa référence."
    ],
    [
      "Un encoder extrait des caractéristiques à plusieurs échelles ; un decoder reconstruit une résolution spatiale. Les skip connections transmettent des détails des couches précoces et facilitent les contours.",
      "Dessine les flux de caractéristiques de deux résolutions entre encoder et decoder.",
      "Ignorer l’alignement des dimensions aux connexions de saut fait échouer le modèle."
    ],
    [
      "U-Net associe une partie descendante et une partie montante avec connexions latérales. Son architecture est adaptée à la segmentation dense mais les performances dépendent des annotations et des variations d’acquisition.",
      "Repère quatre échelles d’une U-Net simple et explique la fonction des skip connections.",
      "Une architecture célèbre ne compense pas des masques d’entraînement erronés."
    ],
    [
      "La loss Dice optimise le recouvrement des classes positives ; la cross-entropy traite la classification des pixels. Les deux peuvent être combinées, surtout en présence de déséquilibre, mais il faut définir le traitement du fond.",
      "Calcule manuellement une loss 1−Dice sur deux masques simples.",
      "Comparer directement des losses calculées avec définitions différentes peut être trompeur."
    ],
    [
      "L’IoU et le Dice par classe révèlent les erreurs des classes minoritaires. L’évaluation dépend du seuil de binarisation, du fond et du cas où aucune annotation positive n’existe.",
      "Calcule le Dice de trois images puis compare moyenne image et score global.",
      "Une moyenne sur les seuls cas faciles masque la performance sur les petites cibles."
    ]
  ],
  "evaluation-robustesse": [
    [
      "Les images doivent être séparées en train, validation et test sans fuite entre patients, machines, objets ou séquences proches. La validation sert à régler les paramètres, le test à rapporter le score final.",
      "Prépare un découpage par machine et vérifie l’absence de machines communes entre jeux.",
      "Répartir des frames voisines d’une même séquence entre train et test surestime la performance."
    ],
    [
      "Précision=TP/(TP+FP), rappel=TP/(TP+FN), F1 combine les deux. Une matrice de confusion doit identifier explicitement la classe positive et les coûts des faux positifs/négatifs.",
      "Calcule précision, rappel et F1 pour TP=8, FP=2, FN=4.",
      "Une accuracy de 95 % peut cacher un rappel de 0 % sur une classe rare."
    ],
    [
      "IoU et Dice mesurent le recouvrement des masques et dépendent du seuil, des classes incluses et des conventions de cas vides. Pour comparer deux pipelines, garder le même protocole et mêmes références.",
      "Calcule IoU et Dice sur une segmentation binaire de référence et une prédiction.",
      "Comparer des scores calculés sur des ensembles de test différents est invalide."
    ],
    [
      "Le surapprentissage survient lorsque le modèle apprend trop les particularités du train. L’augmentation de données peut simuler rotation, contraste ou bruit, mais la transformation des annotations doit rester cohérente.",
      "Ajoute une rotation à une image et applique exactement la même transformation géométrique à son masque.",
      "Augmenter uniquement l’image mais pas son masque rend l’apprentissage incohérent."
    ],
    [
      "Un score moyen doit être accompagné d’une analyse par classe, capteur, éclairage et taille d’objet. Les distributions différentes entre développement et production peuvent dégrader la qualité.",
      "Crée un tableau de scores par capteur ou par catégorie de défauts.",
      "Évaluer seulement la classe dominante masque les problèmes des catégories rares."
    ],
    [
      "Un modèle relançable exige seeds, dépendances, version du dataset et contrôle du temps d’inférence sur le matériel cible. La latence et la consommation mémoire sont des contraintes métier.",
      "Compare la latence sur un CPU de production à celle d’un GPU de développement.",
      "Annoncer du temps réel sans mesurer la latence réelle sur le matériel cible est risqué."
    ]
  ],
  "projet-cv": [
    [
      "Le brief du projet doit préciser tâche, images, classes, coût des erreurs et contraintes de performance. Le KPI principal doit suivre la décision métier, pas uniquement la métrique la plus flatteuse.",
      "Rédige un cahier des charges d’inspection de défauts incluant rappel minimal et latence cible.",
      "Un objectif vague « classifier correctement » n’est pas validable."
    ],
    [
      "Le dataset doit documenter source, licences, étiquettes et qualité des annotations. Les séparations évitent les fuites entre exemplaires proches ; la préparation doit rester identique en production.",
      "Écris une fiche dataset et une règle de découpage par objet ou acquisition.",
      "Un dataset déséquilibré non documenté fausse les conclusions d’un modèle."
    ],
    [
      "Une baseline simple (seuil, KNN, régression logistique) sert de référence. Un modèle appris plus complexe ne se justifie que s’il apporte un gain mesurable compte tenu du coût, de la vitesse et de la maintenance.",
      "Compare une baseline légère et un CNN sur un protocole identique.",
      "Adopter un CNN par principe sans comparer à la baseline peut augmenter la complexité sans gain."
    ],
    [
      "La validation sélectionne les paramètres ; l’analyse des erreurs révèle les conditions d’échec. Les cas concrets doivent être montrés avec l’étiquette attendue et la prédiction, pas seulement résumés par un score.",
      "Présente cinq erreurs typiques avec l’hypothèse de leur origine.",
      "Choisir les meilleurs exemples de test pour la démonstration donne une impression trompeuse."
    ],
    [
      "Le coût d’inférence inclut chargement, prétraitement, modèle et post-traitement. Une latence moyenne ne décrit pas la pire latence ; le besoin peut exiger un percentile élevé.",
      "Mesure temps médian et p95 d’un pipeline sur 100 images.",
      "Comparer uniquement la vitesse du modèle en ignorant le prétraitement sous-estime le temps réel."
    ],
    [
      "Un livrable professionnel inclut README, environnement, scripts, tests, version des poids, protocole de validation et démonstration. La passation doit permettre à un collègue de reproduire le résultat.",
      "Conçois l’arborescence du dépôt et une checklist de livraison à ton tuteur.",
      "Un notebook dont les cellules dépendent d’un état caché ne suffit pas comme artefact de production."
    ]
  ]
};
