# Stage Computer Vision et traitement d’image

Accès : MonStage → **LMS · Stage CV** (`#/stage-cv`), après connexion habituelle.

## Utilisation

1. Ouvrir le tableau de bord et définir sa date de début.
2. Choisir une semaine dans la roadmap, puis **Apprendre** : leçon, code copiable/téléchargeable, lectures ciblées, exercice, indices et démarche attendue.
3. Ouvrir **Missions & journal** : sélectionner un jour, réaliser les tâches, noter le temps, les résultats, blocages et preuves. La date de chaque séance est ajustable.
4. **Enregistrer le suivi** après la séance. Le suivi est conservé dans l’archive GitHub privée existante, pas dans le dépôt public de l’application.
5. Faire les questions de **Validation**, puis la revue pratique avec l’encadrant. La case maîtrise exige les tâches terminées, la leçon étudiée, les réponses correctes et une preuve dans le journal. Elle est déclarative, pas une certification.

Les tâches cochées et la maîtrise sont deux indicateurs distincts. Réouvrir une tâche invalide la maîtrise de la semaine. Tous les modules restent accessibles pour révision.

## Sauvegarde et conflits

- Les changements restent dans un brouillon local jusqu’à l’enregistrement explicite.
- Un brouillon trouvé à la réouverture est proposé, jamais restauré silencieusement.
- Si la lecture privée échoue, la sauvegarde est bloquée pour protéger les données existantes.
- Un contrôle de révision évite d’écraser une mise à jour effectuée sur un autre appareil. En cas de conflit, exporter le brouillon puis recharger le suivi privé avant de réappliquer les modifications.
- Export/import JSON permet une sauvegarde supplémentaire ; importer ne remplace le suivi privé qu’après enregistrement.

## Contenu

8 modules, 40 journées, 120 tâches, 8 exemples Python, 24 questions de contrôle. Les fondamentaux occupent les jours 1 et 2. Le programme utilise classification, transfer learning, détection, analyse d’erreurs, segmentation et livraison d’un pipeline. Les lectures renvoient aux documentations et auteurs ; les snippets sont pédagogiques et précisent les fichiers/données requis.

## Architecture

`src/features/training/` : programme, leçons, quiz, état validé et interface. `POST /api/training` : lecture et écriture après la vérification habituelle du compte autorisé. Le Worker réutilise `GITHUB_ARCHIVE_TOKEN` côté serveur et stocke le suivi dans `Formation_CV/progression.json` du dépôt privé d’archives. Aucune nouvelle permission ni clé dans le client.

## Séances quotidiennes détaillées

Chaque journée dispose désormais de sa propre leçon : objectifs et prérequis, concepts utiles, démonstration Python commentée, observations attendues, exercice autonome, contraintes et livrables, correction avec code, vérifications, diagnostic des erreurs, variante et questions de revue avec points attendus. Le guide Markdown et les deux scripts Python sont téléchargeables par séance.

40 séances, 80 blocs Python quotidiens, au moins 120 critères pratiques et 80 questions de revue, en plus des 24 questions hebdomadaires. Les fixtures synthétiques sont explicitement séparées des évaluations industrielles. Les données et artefacts préparés requis par certains scripts sont décrits.

La revue quotidienne conserve les critères vérifiés, les explications écrites, une preuve, le niveau d’aide/retour et une décision. La maîtrise hebdomadaire exige désormais les cinq revues quotidiennes consignées, en plus des conditions précédentes. Ces décisions suivent une revue humaine ; le LMS n’exécute pas les scripts et n’évalue pas automatiquement le code ou la véracité des preuves.

Les champs quotidiens sont optionnels dans le format v1 : les anciens suivis, journaux, tâches et sauvegardes restent lisibles. Réouvrir une tâche remet la revue correspondante en attente.
