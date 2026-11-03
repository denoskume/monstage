# LMS : compléter les 40 séances

Goal: transformer les fiches de tâches existantes en séances guidées de bout en bout, sans modifier le programme validé ni l’avancement existant.
Spec: demande utilisateur « fait le » après identification des manques (contenu quotidien, code expliqué, correction détaillée, revue de maîtrise, vérification de sauvegarde).
Architecture: 40 DailyLesson typées, divisées par demi-parcours ; vue de séance avec sections pédagogiques et téléchargement du guide. Suivi optionnel dailyStudy/dailyReview compatible avec le format v1. Validation pratique par grille et preuve, explicitement déclarative (aucun évaluateur IA automatique).
Constraints: 8 semaines/40 jours ; fondamentaux jours1–2 ; français pratique ; aucune réponse inventée ni résultat ML annoncé sans exécution ; exemples de démonstration autonomes ou prérequis explicites ; pas de code exécuté dans le navigateur ; données de suivi privées.

- [x] Contenu semaines1–4 : 20 séances, 20 démonstrations, 20 corrections détaillées, exercices, diagnostic et questions.
- [x] Contenu semaines5–8 : mêmes éléments, 20 séances.
- [x] Interface quotidienne, guide téléchargeable, grille de revue pratique et compatibilité des données.
- [ ] Tests, vérification syntaxe/exécution représentative, revue, déploiement. Sauvegarde de production si session autorisée disponible ; sinon préciser la limite.
Review focus: contenu réellement spécifique au jour ; code cohérent ; anciens suivis conservés ; statut réalisé ≠ maîtrise ; aucune régression des candidatures.

Verification: 40 lessons / 80 Python AST checks; 38 code snippets executed on isolated fixtures, including PyTorch CNN and segmentation loops; UI checked in browser with isolated test state. Old state v1 preservation and out-of-order review inputs are covered by tests. Production account is signed out: a real authenticated save/read round trip remains unverified.
Review: author review completed; independent final reviewer could not run because of its service quota. Last changes from main (navigation and action-button cleanup) preserved via rebase.
