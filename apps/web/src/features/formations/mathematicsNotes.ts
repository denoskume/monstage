export type MathematicsNote = {title:string;equation:string;interpretation:string;example:string};
export const mathematicsNotes:Record<string,MathematicsNote> = {
  "metier-donnees": {
    "title": "Définir un indicateur",
    "equation": "KPI = numérateur / dénominateur × 100 (si c’est un pourcentage).",
    "interpretation": "Un taux n’a de sens que si le périmètre et le dénominateur sont précisés.",
    "example": "Si 18 dossiers sur 60 sont traités, le taux de traitement est 30 %."
  },
  "tableurs": {
    "title": "Moyenne et sommes conditionnelles",
    "equation": "Moyenne = somme des valeurs / nombre de valeurs ; SOMME.SI = somme des cellules vérifiant une condition.",
    "interpretation": "Une moyenne simple diffère d’une moyenne pondérée lorsque les effectifs sont différents.",
    "example": "Deux magasins ont 10 et 100 commandes : moyenne de leurs paniers ≠ panier moyen global sans pondération."
  },
  "sql": {
    "title": "Attention au grain des jointures",
    "equation": "SUM(total) GROUP BY magasin calcule un total par magasin, sous réserve de ne pas avoir multiplié les lignes avec un JOIN.",
    "interpretation": "Une clé du côté droit non unique peut dupliquer une ligne de commandes.",
    "example": "Après une jointure, compare COUNT(*) et COUNT(DISTINCT identifiant)."
  },
  "python": {
    "title": "Fonctions et moyenne",
    "equation": "moyenne(x) = sum(x) / len(x), à condition que len(x) > 0.",
    "interpretation": "La fonction doit définir son comportement lorsque l’ensemble est vide.",
    "example": "Pour [10,20,30], la moyenne vaut 20 ; pour [], une erreur doit être évitée."
  },
  "pandas-numpy": {
    "title": "Agrégation par groupe",
    "equation": "Somme_g = Σ_{i∈g} xᵢ ; moyenne_g = Somme_g / n_g.",
    "interpretation": "La clé de regroupement définit le sens du résultat.",
    "example": "Regrouper par mois ne répond pas à la même question que regrouper par machine."
  },
  "nettoyage": {
    "title": "Taux de données manquantes",
    "equation": "Taux manquant = nombre de cellules manquantes / nombre de cellules attendues × 100.",
    "interpretation": "Il faut distinguer absences aléatoires, champs facultatifs et panne de collecte.",
    "example": "Trois durées absentes parmi vingt événements : 15 % de durées inconnues."
  },
  "statistiques-eda": {
    "title": "Dispersion et robustesse",
    "equation": "μ = (1/n) Σxᵢ ; σ = √[(1/n)Σ(xᵢ − μ)²] ; médiane = valeur centrale triée.",
    "interpretation": "La moyenne est sensible aux valeurs extrêmes ; la médiane est généralement plus robuste.",
    "example": "Pour [2,3,4,100], la moyenne vaut 27,25 mais la médiane 3,5."
  },
  "visualisation": {
    "title": "Évolutions et échelles",
    "equation": "Variation relative (%) = (valeur finale − valeur initiale) / valeur initiale × 100.",
    "interpretation": "Une différence absolue et une variation relative répondent à deux questions différentes.",
    "example": "Passer de 20 à 25 représente +5 unités, soit +25 %."
  },
  "powerbi": {
    "title": "Mesures DAX sécurisées",
    "equation": "Taux = DIVIDE([Numérateur], [Dénominateur]) : le calcul tient compte des filtres actifs.",
    "interpretation": "Un KPI doit être vérifié pour plusieurs filtres et totaux.",
    "example": "Comparer le total de la table à une mesure filtrée par magasin évite les incohérences."
  },
  "kpi-decision": {
    "title": "Décomposition d’un résultat",
    "equation": "Revenu = nombre de commandes × panier moyen.",
    "interpretation": "Une baisse de revenu peut venir du volume, du panier moyen, ou des deux.",
    "example": "100 × 50 € = 5 000 € ; 90 × 52 € = 4 680 € malgré un meilleur panier moyen."
  },
  "industrie-maintenance": {
    "title": "Fiabilité et réparabilité",
    "equation": "MTBF = temps de fonctionnement total / nombre de défaillances ; MTTR = temps de réparation total / nombre d’interventions réparatrices.",
    "interpretation": "Les définitions varient selon le périmètre et doivent être validées par l’équipe de maintenance.",
    "example": "600 h de fonctionnement avec 3 défaillances donnent un MTBF observé de 200 h."
  },
  "simulation-stage": {
    "title": "Couverture des données",
    "equation": "Couverture (%) = observations avec mesure connue / observations attendues × 100.",
    "interpretation": "Un indicateur fiable doit porter une mention du périmètre couvert.",
    "example": "Si 6 incidents sur 8 ont une durée connue, le taux de couverture est 75 %."
  },
  "images-pixels": {
    "title": "Images numériques et quantification",
    "equation": "I(y,x) ∈ {0,…,255} pour une image 8 bits ; sa dimension est (H,W).",
    "interpretation": "Une matrice décrit les intensités des pixels, pas leurs coordonnées physiques.",
    "example": "Un tableau de forme (480,640) contient 307 200 pixels."
  },
  "python-images": {
    "title": "Gestion des plages de valeurs",
    "equation": "I′(x,y) = clip(I(x,y) + Δ, 0, 255).",
    "interpretation": "La conversion de type doit précéder l’addition sur uint8 pour éviter le débordement.",
    "example": "Un pixel à 250 auquel on ajoute 30 devient 255 après clipping, pas 24."
  },
  "opencv-couleurs": {
    "title": "Du RGB aux niveaux de gris",
    "equation": "Y ≈ 0,299R + 0,587G + 0,114B (pondération classique, à titre intuitif).",
    "interpretation": "La luminance et le gris dépendent du codage couleur et des conventions.",
    "example": "Un pixel vert pur apparaît plus clair qu’un pixel bleu pur à composante maximale."
  },
  "contraste-histogrammes": {
    "title": "Transformation affine du contraste",
    "equation": "I′ = clip(αI + β, 0, 255).",
    "interpretation": "α règle la pente (contraste), β décale la luminosité ; l’écrêtage perd des nuances.",
    "example": "Pour α=2 et β=0, une intensité de 150 est écrêtée à 255."
  },
  "convolution": {
    "title": "Convolution discrète 2D",
    "equation": "I′(x,y) = Σᵢ Σⱼ K(i,j) I(x−i, y−j).",
    "interpretation": "Un noyau moyenneur 3×3 a neuf poids égaux à 1/9.",
    "example": "Un pixel isolé d’intensité 90 donne environ 10 au centre après moyenne 3×3."
  },
  "bruit-debruitage": {
    "title": "Modèle de bruit additif",
    "equation": "I_obs = I_vraie + N ; MSE = (1/Nₚ) Σ(I_obs−I_vraie)².",
    "interpretation": "La MSE exige une référence et pénalise fortement les grandes erreurs.",
    "example": "Deux erreurs de 10 ont une contribution totale quadratique de 200."
  },
  "transformations": {
    "title": "Transformation affine de coordonnées",
    "equation": "[x′, y′]ᵀ = A[x,y]ᵀ + t, avec A de taille 2×2.",
    "interpretation": "La rotation et le redimensionnement nécessitent souvent une interpolation.",
    "example": "Pour une translation t=(10,0), le point (20,30) passe à (30,30)."
  },
  "contours-gradients": {
    "title": "Gradient d’intensité",
    "equation": "∇I = [∂I/∂x, ∂I/∂y] ; G = √(Gₓ² + Gᵧ²).",
    "interpretation": "Un gradient élevé suggère un bord, mais pas automatiquement un objet.",
    "example": "Un passage brusque de 20 à 200 crée une forte variation locale."
  },
  "segmentation": {
    "title": "Seuillage binaire",
    "equation": "M(x,y) = 1 si I(x,y) ≥ T, sinon 0.",
    "interpretation": "Changer T modifie les faux positifs et faux négatifs.",
    "example": "Avec T=120, les pixels 80 et 170 deviennent 0 et 1."
  },
  "morphologie": {
    "title": "Ouverture morphologique",
    "equation": "A ∘ B = (A ⊖ B) ⊕ B : érosion suivie de dilatation.",
    "interpretation": "L’élément structurant B influence la taille des éléments supprimés.",
    "example": "Un pixel isolé disparaît souvent sous une ouverture 3×3."
  },
  "fourier": {
    "title": "Transformée de Fourier 2D",
    "equation": "F(u,v) = ΣₓΣᵧ I(x,y) · exp[−2πi(ux/W + vy/H)].",
    "interpretation": "Le spectre représente les fréquences spatiales ; les basses fréquences dominent souvent les variations douces.",
    "example": "Un motif répétitif produit des pics à sa fréquence et à la fréquence symétrique."
  },
  "video-mouvement": {
    "title": "Différence avec le fond",
    "equation": "Dₜ(x,y) = |Iₜ(x,y) − B(x,y)| ; Mₜ=1 si Dₜ > T.",
    "interpretation": "Un changement d’éclairage peut produire de fortes différences sans objet réellement mobile.",
    "example": "Une lampe qui s’allume peut déclencher de nombreux faux pixels en mouvement."
  },
  "evaluation": {
    "title": "IoU, Dice et PSNR",
    "equation": "IoU = |P∩G|/|P∪G| ; Dice = 2|P∩G|/(|P|+|G|).",
    "interpretation": "Les masques vides doivent être traités explicitement ; la comparaison doit porter sur la même grille.",
    "example": "Avec deux pixels communs et une union de quatre pixels, IoU = 0,5."
  },
  "pipeline-industrie": {
    "title": "Composition du pipeline",
    "equation": "Résultat = Évaluer(Analyser(Segmenter(Prétraiter(Image)))).",
    "interpretation": "Chaque fonction doit conserver un contrat d’entrée/sortie testable.",
    "example": "Un masque binaire mal formé à une étape invalide les mesures d’aire suivantes."
  },
  "classification-ml": {
    "title": "Classification probabiliste",
    "equation": "Classe prédite = argmaxₖ p(y=k | image).",
    "interpretation": "La classe gagnante ne dit pas à elle seule si le modèle est bien calibré.",
    "example": "Un modèle peut retourner 0,6 pour la classe A et 0,4 pour B, mais sa confiance doit être vérifiée."
  },
  "reseaux-neurones": {
    "title": "Transformation d’un neurone",
    "equation": "z = Wx + b ; activation = ReLU(z) = max(0,z).",
    "interpretation": "Les poids W et biais b sont appris à partir des données.",
    "example": "Si z = −2, ReLU(z)=0 ; si z=3, ReLU(z)=3."
  },
  "convolutions-cnn": {
    "title": "Dimension des cartes convolutives",
    "equation": "Sortie = ⌊(Entrée + 2P − K)/S⌋ + 1 (dilatation 1).",
    "interpretation": "P est le padding, K la taille du noyau et S le stride.",
    "example": "28×28 avec K=3, P=1, S=1 reste 28×28 spatialement."
  },
  "pytorch-entrainement": {
    "title": "Mise à jour des poids",
    "equation": "θₜ₊₁ = θₜ − η ∇θ L(θₜ).",
    "interpretation": "Le taux η conditionne l’amplitude du changement ; l’optimiseur exploite les gradients.",
    "example": "Avec gradient 2 et η=0,1, un poids 1 devient 0,8 sous une descente simple."
  },
  "detection-objets": {
    "title": "IoU entre boîtes",
    "equation": "IoU_box = aire(intersection) / aire(union).",
    "interpretation": "Une confiance de classe élevée n’assure pas une bonne localisation.",
    "example": "Deux boîtes identiques donnent IoU=1 ; deux boîtes disjointes donnent 0."
  },
  "segmentation-deep": {
    "title": "Perte de segmentation",
    "equation": "Dice loss = 1 − Dice (version simplifiée pour expliquer l’objectif).",
    "interpretation": "Les formes différentiables utilisent des probabilités plutôt que des masques seuilés durs.",
    "example": "Si le Dice vaut 0,8, une perte Dice simplifiée vaut 0,2."
  },
  "evaluation-robustesse": {
    "title": "Précision et rappel",
    "equation": "Précision = VP/(VP+FP) ; Rappel = VP/(VP+FN).",
    "interpretation": "Si les défauts sont rares, l’accuracy seule peut cacher un modèle incapable de les détecter.",
    "example": "Avec 5 vrais défauts et 0 détecté, le rappel des défauts est 0 %."
  },
  "projet-cv": {
    "title": "Qualité de généralisation",
    "equation": "Écart de généralisation = performance train − performance test (sur une même métrique).",
    "interpretation": "Un écart important peut signaler un surapprentissage ou un décalage de distribution.",
    "example": "98 % sur train et 74 % sur test : écart de 24 points à investiguer."
  }
};
