# Modèle de CV « CV DESIGN 01 » — en-tête centré

Ce modèle est proposé dans **MonStage → Studio CV → Modèle → 9 · CV DESIGN 01** en complément du modèle Thierry KUME (8).

## Référence visuelle et geometry

Référence : document `CV-DESIGN_01.pdf` fourni par l'utilisateur.
- Page A4 : 595,32 × 841,92 pt, une seule page.
- Cadre fin cyan : `#0F9ED5`, environ 1,5 pt.
- En-tête pleine largeur, nom centré en bleu `#215F9A`; formation, titre, coordonnées et LinkedIn/GitHub sur des lignes distinctes.
- Colonne grise `#BFBFBF` de x=7,5 à x=180,8, commençant à y=102 pt; séparateurs bleus.
- Colonne principale de x≈189,8 à x≈580,8 : PROFIL, EXPÉRIENCE, COMPÉTENCES.
- Expériences et compétences avec losanges bleus vectoriels, titres et sections sous forme de texte natif.

## Utilisation / fidélité ATS

Les champs proviennent du CV édité ; le modèle ne contient aucun texte personnel ou contact pré-rempli provenant de la référence. Les projets et les expériences sont réunis dans une même rubrique, avec des champs facultatifs séparés **Mission / Expériences acquises / Résultats**.

**ATS :** export PDF en texte natif sélectionnable, sans rasterisation du CV ni capture; titres standards, vecteurs décoratifs sans caractères parasites. Les polices Helvetica encodées font partie du PDF. Une validation empêche l'export si le texte excède une page A4 avec une taille encore lisible : l'utilisateur raccourcit alors le texte, au lieu qu'une partie du CV soit silencieusement coupée.

La compatibilité avec tous les lecteurs ATS tiers ne peut jamais être garantie pour une mise en page en deux colonnes. Pour les portails qui interprètent mal les colonnes, les modèles existants à une seule colonne restent disponibles sans modifier les données.

## Contrôles

`src/features/cv/design01Pdf.test.tsx` vérifie :
- l'identité de modèle et ses couleurs;
- la présence de texte HTML, les titres sémantiques et l'absence de rendu canvas/image;
- l'export PDF A4 une page, avec des ressources de police et sans image XObject;
- le rejet des CV trop longs plutôt que la perte de données.
