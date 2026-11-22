export interface Quiz { question: string; options: string[]; correct: number; explanation: string; }
export const quizzes: Quiz[][] = [
  [
    { question: 'Une image OpenCV apparaît avec des couleurs inversées dans Matplotlib. Première vérification ?', options: ['Le nombre d’époques', 'L’ordre BGR/RGB', 'Le learning rate'], correct: 1, explanation: 'OpenCV charge généralement en BGR ; Matplotlib attend du RGB. Convertir explicitement avant affichage.' },
    { question: 'Deux photos de la même pièce sont presque identiques. Comment créer les splits ?', options: ['Les séparer aléatoirement entre train et test', 'Garder les photos de la même pièce dans le même ensemble', 'Les utiliser dans tous les ensembles'], correct: 1, explanation: 'Le regroupement par pièce limite la fuite de données et mesure mieux la généralisation à de nouvelles pièces.' },
    { question: 'Une aire de contour vaut 120 pixels². Peut-on annoncer 120 mm² ?', options: ['Oui', 'Seulement en RGB', 'Non, il faut une calibration et une géométrie appropriées'], correct: 2, explanation: 'Une surface en pixels ne donne pas directement une surface physique.' },
  ],
  [
    { question: 'Avec CrossEntropyLoss multiclasse, que fournit le modèle ?', options: ['Des logits de forme N,K', 'Uniquement la classe prédite', 'Un label entier par pixel'], correct: 0, explanation: 'La loss utilise les logits et les indices de classe ; argmax sert à la décision, pas au calcul de cette loss.' },
    { question: 'model.eval() suffit-il pour désactiver les gradients ?', options: ['Oui', 'Non, utiliser aussi no_grad ou inference_mode', 'Seulement sur GPU'], correct: 1, explanation: 'eval modifie le mode de certaines couches ; la gestion des gradients est indépendante.' },
    { question: 'Le réseau ne peut pas surapprendre un minuscule batch. Que faire ?', options: ['Entraîner plus longtemps sur toutes les données', 'Changer de dataset immédiatement', 'Vérifier labels, shapes, loss et gradients'], correct: 2, explanation: 'Ce test sert à déceler un défaut du pipeline avant un entraînement coûteux.' },
  ],
  [
    { question: 'Quel ensemble sert à choisir le learning rate et le checkpoint ?', options: ['Test', 'Validation', 'Tous les ensembles mélangés'], correct: 1, explanation: 'La validation guide les choix ; le test reste réservé à l’évaluation finale.' },
    { question: 'Geler les paramètres du backbone fige-t-il ses statistiques BatchNorm ?', options: ['Toujours', 'Non, il faut aussi contrôler son mode', 'Seulement avec Adam'], correct: 1, explanation: 'requires_grad contrôle les gradients des paramètres ; les statistiques de BatchNorm dépendent aussi du mode train/eval.' },
    { question: 'Pour comparer CNN et ResNet, faut-il conserver les mêmes splits ?', options: ['Oui', 'Non', 'Uniquement pour le train'], correct: 0, explanation: 'Sans protocole commun, une différence de score peut venir des données et non du modèle.' },
  ],
  [
    { question: 'Que mesure IoU ?', options: ['La vitesse du modèle', 'Le recouvrement intersection/union', 'Le nombre de classes'], correct: 1, explanation: 'IoU quantifie le recouvrement de deux régions, par exemple deux bounding boxes.' },
    { question: 'Tu abaisses le seuil de confiance. Quel effet est possible ?', options: ['Moins de faux positifs garanti', 'Même résultat garanti', 'Davantage d’objets retrouvés et davantage de fausses alertes'], correct: 2, explanation: 'Un seuil plus permissif peut améliorer le rappel au prix de la précision ; il faut le mesurer.' },
    { question: 'Un entraînement signale des labels absents. Que faire ?', options: ['Contrôler chemins, format et annotations', 'Ignorer si la loss baisse', 'Augmenter le nombre d’époques'], correct: 0, explanation: 'Une configuration erronée peut faire interpréter les images comme des fonds sans objet.' },
  ],
  [
    { question: 'Le score global augmente mais le rappel des défauts rares baisse. Conclusion ?', options: ['Amélioration certaine', 'Analyser le compromis selon le besoin métier', 'Supprimer la classe rare'], correct: 1, explanation: 'Le gain global ne suffit pas si les erreurs les plus coûteuses augmentent.' },
    { question: 'Quelle expérience est la plus interprétable ?', options: ['Changer cinq facteurs en même temps', 'Changer le test après chaque essai', 'Modifier un facteur principal avec un protocole stable'], correct: 2, explanation: 'Une modification ciblée permet de mieux relier l’effet observé à sa cause.' },
    { question: 'Une erreur vient d’une mauvaise annotation. Première action ?', options: ['Corriger l’annotation et tracer la modification', 'Agrandir le modèle', 'Masquer l’erreur du rapport'], correct: 0, explanation: 'Le contrôle des annotations précède une conclusion sur le modèle.' },
  ],
  [
    { question: 'Pour redimensionner un masque de classes discrètes, quel choix courant ?', options: ['Interpolation qui crée des classes intermédiaires', 'Plus proche voisin', 'Normalisation ImageNet'], correct: 1, explanation: 'Le plus proche voisin préserve les valeurs discrètes du masque.' },
    { question: 'Un recadrage aléatoire doit être appliqué comment ?', options: ['Indépendamment à l’image et au masque', 'Uniquement au masque', 'Avec les mêmes paramètres géométriques aux deux'], correct: 2, explanation: 'Les pixels de l’image et leurs cibles doivent rester alignés.' },
    { question: 'Deux masques sont vides. Que faire pour Dice/IoU ?', options: ['Laisser une division par zéro', 'Définir et documenter une convention', 'Inventer une surface'], correct: 1, explanation: 'Le cas vide doit être traité explicitement et les images sans défaut rapportées séparément.' },
  ],
  [
    { question: 'Avant d’annoncer qu’ONNX est plus rapide, que vérifier ?', options: ['Équivalence des entrées et des résultats', 'Uniquement la taille du fichier', 'La couleur du graphique'], correct: 0, explanation: 'Comparer des pipelines différents ou incorrects ne produit pas un benchmark utile.' },
    { question: 'Quelle mesure de latence est interprétable ?', options: ['Un temps sans contexte', 'Une première exécution GPU sans synchronisation', 'Warm-up, matériel, backend, résolution et batch explicités'], correct: 2, explanation: 'Ces conditions déterminent la mesure ; distinguer aussi le temps modèle et le temps de bout en bout.' },
    { question: 'Que doit accompagner un checkpoint ?', options: ['Seulement une capture d’écran', 'Classes, architecture, preprocessing et configuration', 'Un score sans protocole'], correct: 1, explanation: 'Les poids seuls ne suffisent pas à garantir une prédiction cohérente.' },
  ],
  [
    { question: 'Quand fixer les critères d’acceptation ?', options: ['Avant l’évaluation finale', 'Après avoir vu le score test', 'Jamais'], correct: 0, explanation: 'Fixer les critères avant la mesure évite de déplacer l’objectif après observation des résultats.' },
    { question: 'Un critère métier n’est pas atteint. Que présenter ?', options: ['Le cacher', 'La mesure, la limite et une prochaine action', 'Une valeur corrigée arbitrairement'], correct: 1, explanation: 'Une livraison honnête permet une décision et une amélioration réalistes.' },
    { question: 'Quelle preuve montre le mieux ton autonomie ?', options: ['Avoir parcouru les leçons', 'Avoir copié tout le code', 'Exécuter, expliquer et adapter la solution sur de nouvelles données'], correct: 2, explanation: 'L’autonomie se démontre par une réalisation transférable et expliquée.' },
  ],
];
