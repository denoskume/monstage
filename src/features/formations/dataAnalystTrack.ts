import type { FormationTrack } from './formationTypes';

export const dataAnalystTrack: FormationTrack = {
  "id": "data-analyst",
  "plan": "Plan B",
  "title": "Data Analyst — Foundations to Job Ready",
  "subtitle": "SQL, Python, EDA, Power BI et analyse industrielle",
  "weeks": "10 à 12 semaines",
  "level": "Débutant à stage junior",
  "tools": [
    "Python",
    "SQL",
    "Pandas",
    "Excel",
    "Power BI"
  ],
  "objective": "De la découverte des données à une mission de reporting autonome et contrôlée sous la supervision d’une équipe.",
  "project": "Projet final : tableau de bord de suivi des équipements industriels",
  "modules": [
    {
      "id": "metier-donnees",
      "title": "Découvrir le métier et les données",
      "objective": "Comprendre le rôle d’un Data Analyst et cadrer une demande métier.",
      "concept": "Une donnée n’est utile que si elle répond à une question. Une mission d’analyse part d’un objectif métier, identifie le grain des observations (commande, machine, client), contrôle les données puis produit une conclusion vérifiable.",
      "points": [
        "Métier, livrables et collaboration avec un tuteur",
        "Données numériques, catégorielles et dates",
        "CSV, tableur, base SQL et notion de source",
        "Unité d’analyse, identifiant et granularité",
        "Question métier, indicateur, décision",
        "Qualité, confidentialité et traçabilité"
      ],
      "example": "Un responsable demande : « Pourquoi les ventes ont-elles baissé ? » Il faut d’abord préciser la période, le périmètre et la comparaison.",
      "code": "import pandas as pd\n# Exemple : ventes de trois semaines, en euros\nventes = pd.DataFrame({\"semaine\":[1,2,3],\"euros\":[1200,1100,900]})\nventes[\"variation_pct\"] = ventes[\"euros\"].pct_change() * 100\nprint(ventes.to_string(index=False))",
      "result": "Le chiffre d’affaires est passé de 1 200 € à 900 €. Cette observation n’explique pas encore la cause de la baisse.",
      "instructions": "Change les valeurs et observe comment évolue la variation en pourcentage. Identifie ce qui manque pour conclure.",
      "mission": "Rédige un brief de cinq lignes : question, unité d’analyse, données utiles, contrôle et livrable.",
      "validation": "Un collègue peut comprendre ce que tu veux mesurer et pourquoi.",
      "quiz": {
        "question": "Quel est le premier réflexe face à une demande d’analyse ?",
        "options": [
          "Choisir un beau graphique",
          "Clarifier la question et le périmètre",
          "Entraîner un modèle"
        ],
        "correct": 1,
        "explanation": "Sans question claire ni grain défini, un calcul exact peut répondre au mauvais problème."
      },
      "codeLanguage": "python"
    },
    {
      "id": "tableurs",
      "title": "Excel et Google Sheets pour l’analyse",
      "objective": "Nettoyer, calculer et résumer des données dans un tableur.",
      "concept": "Un tableur est souvent le point d’entrée d’une mission. Sépare les données sources des calculs, utilise des colonnes cohérentes, des formules auditables et un tableau croisé pour résumer de grands volumes.",
      "points": [
        "Types de cellule, tris et filtres",
        "Formules SOMME, MOYENNE, SI et NB.SI",
        "SOMME.SI.ENS et RECHERCHEX",
        "Références absolues et erreurs de formule",
        "Tableaux croisés dynamiques",
        "Mise en forme conditionnelle et contrôle des totaux"
      ],
      "example": "Pour calculer le total d’un magasin Nantes, on additionne seulement les lignes associées à Nantes.",
      "code": "=SOMME.SI(A2:A6;\"Nantes\";B2:B6)\n=MOYENNE(B2:B6)\n=SI(B2>1000;\"Au-dessus du seuil\";\"Sous le seuil\")",
      "result": "Chaque formule répond à une question distincte : total filtré, moyenne générale ou statut selon un seuil.",
      "instructions": "Reproduis un tableau Magasin/Ventes sur cinq lignes, ajoute ces formules et vérifie manuellement les totaux.",
      "mission": "Produis un fichier de reporting mensuel avec filtres, tableau croisé et total réconcilié.",
      "validation": "Les totaux restent corrects après l’ajout de nouvelles lignes dans la plage prévue.",
      "quiz": {
        "question": "À quoi sert SOMME.SI ?",
        "options": [
          "À additionner les valeurs répondant à un critère",
          "À trier les lignes",
          "À supprimer les doublons"
        ],
        "correct": 0,
        "explanation": "SOMME.SI additionne seulement les valeurs dont la plage de critères correspond à la condition."
      },
      "codeLanguage": "excel"
    },
    {
      "id": "sql",
      "title": "SQL : interroger les bases de données",
      "objective": "Écrire des requêtes pour extraire et agréger les informations nécessaires.",
      "concept": "Dans une base relationnelle, chaque table décrit un type d’entité. SELECT choisit les colonnes, WHERE filtre les lignes, GROUP BY agrège et JOIN rapproche des tables selon leurs clés. Comprendre le grain évite les doubles comptages.",
      "points": [
        "Tables, colonnes, clés et relations",
        "SELECT, WHERE, ORDER BY et LIMIT",
        "COUNT, SUM, AVG, MIN et MAX",
        "GROUP BY, HAVING et CASE",
        "INNER JOIN et LEFT JOIN",
        "CTE, fonctions fenêtre et doublons"
      ],
      "example": "Deux commandes peuvent appartenir au même client. Le total par client nécessite une agrégation, pas un simple comptage de clients.",
      "code": "import sqlite3\nimport pandas as pd\ndb = sqlite3.connect(\":memory:\")\npd.DataFrame({\"client\":[\"A\",\"A\",\"B\"],\"montant\":[100,80,200]}).to_sql(\"commandes\",db,index=False)\nrequete = \"\"\"\nSELECT client, COUNT(*) AS nb, SUM(montant) AS total\nFROM commandes GROUP BY client ORDER BY total DESC\n\"\"\"\nprint(pd.read_sql_query(requete, db))",
      "result": "Le client A a deux commandes pour un total de 180 ; B a une commande de 200. Le nombre de lignes n’est pas le nombre de clients.",
      "instructions": "Ajoute un WHERE montant >= 100 et compare le périmètre sélectionné avant et après le filtre.",
      "mission": "Écris cinq requêtes pour calculer ventes mensuelles, meilleurs produits et clients distincts.",
      "validation": "Chaque total est justifié par le grain des tables et des clés de jointure.",
      "quiz": {
        "question": "Pourquoi une jointure peut-elle multiplier les lignes ?",
        "options": [
          "Les colonnes changent de type",
          "Une clé n’est pas unique dans une table jointe",
          "GROUP BY supprime les valeurs"
        ],
        "correct": 1,
        "explanation": "Une correspondance un-à-plusieurs peut multiplier les lignes et gonfler les sommes."
      },
      "codeLanguage": "python"
    },
    {
      "id": "python",
      "title": "Python pour débuter en analyse de données",
      "objective": "Lire et modifier un script simple dans un notebook.",
      "concept": "Python permet d’automatiser les calculs répétés. Les variables portent des valeurs, les listes stockent des séries d’observations, les conditions prennent des décisions et les fonctions encapsulent une logique réutilisable.",
      "points": [
        "Python et cellules Markdown/code Jupyter",
        "Types, listes, tuples et dictionnaires",
        "Conditions if/else et boucles for",
        "Fonctions, paramètres et return",
        "Lecture de CSV/JSON",
        "Erreurs, exceptions et vérification des résultats"
      ],
      "example": "Une fonction peut calculer la moyenne d’un magasin quel que soit le nombre de ventes.",
      "code": "def moyenne(ventes):\n    # Refuse les listes vides : éviter une division par zéro\n    if not ventes:\n        return None\n    return sum(ventes) / len(ventes)\n\nfor magasin, valeurs in {\"Nantes\":[12,15,18],\"Lyon\":[9,11]}.items():\n    print(magasin, moyenne(valeurs))",
      "result": "Nantes : 15 ; Lyon : 10. La fonction renvoie None lorsque la série est vide, plutôt qu’un faux zéro.",
      "instructions": "Ajoute Paris avec quatre ventes. Teste le cas liste vide et explique pourquoi il mérite un traitement spécifique.",
      "mission": "Créer un petit script qui lit un CSV et produit une synthèse par équipe.",
      "validation": "Les fonctions sont nommées, commentées et testées avec cas nominal et cas vide.",
      "quiz": {
        "question": "À quoi sert return dans une fonction ?",
        "options": [
          "À afficher une valeur seulement",
          "À transmettre un résultat à l’appelant",
          "À créer une boucle"
        ],
        "correct": 1,
        "explanation": "print affiche ; return rend le résultat réutilisable par d’autres étapes."
      },
      "codeLanguage": "python"
    },
    {
      "id": "pandas-numpy",
      "title": "NumPy et Pandas",
      "objective": "Explorer, sélectionner, transformer et fusionner des tables.",
      "concept": "NumPy fournit le calcul vectorisé ; Pandas organise les données en Series et DataFrame. head, info et describe servent à contrôler la structure ; groupby résume ; merge joint les sources après vérification des clés.",
      "points": [
        "ndarray, shape, dtype et opérations vectorisées",
        "DataFrame, Series et read_csv",
        "head, info, describe et colonnes",
        "loc, iloc, filtres et assign",
        "groupby, agg, pivot_table",
        "merge, dates et export"
      ],
      "example": "On doit combiner des ventes avec la table des magasins pour calculer le chiffre d’affaires par ville.",
      "code": "import pandas as pd\nventes = pd.DataFrame({\"id\":[1,2,3],\"magasin\":[10,10,20],\"euros\":[100,130,200]})\nmagasins = pd.DataFrame({\"magasin\":[10,20],\"ville\":[\"Nantes\",\"Lyon\"]})\ntable = ventes.merge(magasins,on=\"magasin\",validate=\"many_to_one\")\nprint(table.groupby(\"ville\",as_index=False)[\"euros\"].sum())",
      "result": "Nantes : 230 € ; Lyon : 200 €. validate='many_to_one' vérifie que la clé magasin est unique côté référence.",
      "instructions": "Ajoute une vente sans magasin connu. Essaie how='left' et contrôle les valeurs manquantes après la jointure.",
      "mission": "Créer une table consolidée à partir de deux sources et tracer les règles de rapprochement.",
      "validation": "Nombre de lignes, doublons de clés et montants sont contrôlés avant/après la fusion.",
      "quiz": {
        "question": "Que garantit validate='many_to_one' ?",
        "options": [
          "La table de droite a des clés uniques",
          "Toutes les valeurs sont numériques",
          "Le résultat est trié"
        ],
        "correct": 0,
        "explanation": "L’option protège contre la multiplication accidentelle des lignes lors de la jointure."
      },
      "codeLanguage": "python"
    },
    {
      "id": "nettoyage",
      "title": "Data Cleaning et contrôle qualité",
      "objective": "Préparer des données fiables sans masquer leurs défauts.",
      "concept": "Les fichiers métier contiennent des doublons, valeurs manquantes et formats incohérents. Le nettoyage doit suivre des règles explicites : conserver la source, mesurer les anomalies, appliquer des corrections justifiées, puis réconcilier les résultats.",
      "points": [
        "Doublons exacts et doublons métiers",
        "Valeurs manquantes et stratégie de traitement",
        "Types incorrects et formats de dates",
        "Normalisation des libellés et catégories",
        "Valeurs aberrantes et contrôles de plage",
        "Journal des modifications et tests qualité"
      ],
      "example": "Un journal contient deux fois l’incident 2 et une durée absente. Supprimer sans examiner ferait disparaître une information utile.",
      "code": "import pandas as pd\ndf = pd.DataFrame({\"incident\":[1,2,2,3],\"minutes\":[20,30,30,None]})\nprint(\"Doublons:\",df.duplicated(\"incident\").sum())\nprint(\"Manquants:\",df[\"minutes\"].isna().sum())\nclean = df.drop_duplicates(\"incident\").copy()\nprint(\"Lignes:\",len(clean),\"Durées connues:\",clean[\"minutes\"].notna().sum())",
      "result": "Après dédoublonnage : 3 incidents, dont 2 avec une durée connue. Le total des durées connues ne doit pas être présenté comme complet.",
      "instructions": "Teste l’impact d’une imputation arbitraire à zéro sur la moyenne. Explique pourquoi cette correction est discutable.",
      "mission": "Livrer un rapport qualité avant/après et un script de nettoyage reproductible.",
      "validation": "Les exclusions et les informations manquantes sont documentées, sans chiffres inventés.",
      "quiz": {
        "question": "Une durée manquante doit-elle automatiquement devenir zéro ?",
        "options": [
          "Oui dans tous les cas",
          "Non, il faut étudier la signification de l’absence",
          "Oui si le CSV est petit"
        ],
        "correct": 1,
        "explanation": "Zéro signifie aucune durée ; une absence signifie souvent durée inconnue."
      },
      "codeLanguage": "python"
    },
    {
      "id": "statistiques-eda",
      "title": "Statistiques essentielles et EDA",
      "objective": "Explorer des distributions et formuler des hypothèses mesurables.",
      "concept": "L’EDA combine inspection numérique et visuelle avant toute interprétation avancée. Moyenne et médiane résument différemment ; dispersion et quantiles décrivent la variabilité ; corrélation renseigne sur l’association, sans prouver la causalité.",
      "points": [
        "Moyenne, médiane, variance, écart type",
        "Quantiles et détection d’outliers",
        "Distributions, asymétrie et valeurs extrêmes",
        "Analyse univariée/bivariée",
        "Corrélation versus causalité",
        "Formulation d’hypothèses et limites"
      ],
      "example": "Un salaire exceptionnellement élevé tire la moyenne vers le haut sans représenter le salaire typique.",
      "code": "import numpy as np\ndata = np.array([45,50,55,60,65,70,150])\nprint(\"Moyenne:\",round(data.mean(),2))\nprint(\"Médiane:\",np.median(data))\nprint(\"Écart-type:\",round(data.std(),2))\nprint(\"Q1/Q3:\",np.percentile(data,[25,75]))",
      "result": "La moyenne dépasse la médiane : il faut vérifier l’influence de la valeur 150 avant de tirer une conclusion.",
      "instructions": "Retire provisoirement la valeur 150 et compare les statistiques, sans la supprimer définitivement du jeu source.",
      "mission": "Rédige une EDA avec cinq constats fondés et deux questions à approfondir.",
      "validation": "Chaque conclusion cite une statistique ou une figure, ainsi qu’une limite.",
      "quiz": {
        "question": "Une corrélation élevée démontre-t-elle la causalité ?",
        "options": [
          "Oui toujours",
          "Non, elle mesure une association",
          "Oui pour les grandes tables"
        ],
        "correct": 1,
        "explanation": "Des facteurs confondants ou une coïncidence peuvent expliquer la corrélation."
      },
      "codeLanguage": "python"
    },
    {
      "id": "visualisation",
      "title": "Matplotlib, Seaborn et Plotly",
      "objective": "Sélectionner le bon graphique et le rendre lisible.",
      "concept": "Le graphique doit répondre à une question, pas seulement être esthétique. Les histogrammes montrent une distribution, les courbes suivent le temps, les nuages de points examinent une relation et les barres comparent des catégories.",
      "points": [
        "Histogramme, boxplot et distribution",
        "Courbe temporelle et axes ordonnés",
        "Scatterplot et variables multiples",
        "Graphiques catégoriels",
        "Titres, unités, légendes et échelles",
        "Graphiques interactifs avec Plotly"
      ],
      "example": "Une série de revenus mensuels se représente par une courbe, tandis qu’une comparaison entre magasins se représente par barres.",
      "code": "import pandas as pd\nimport matplotlib.pyplot as plt\ndf = pd.DataFrame({\"mois\":[\"Jan\",\"Fév\",\"Mar\"],\"ventes\":[12,15,14]})\nfig, ax = plt.subplots()\nax.plot(df[\"mois\"],df[\"ventes\"],marker=\"o\")\nax.set(title=\"Ventes mensuelles\",xlabel=\"Mois\",ylabel=\"Ventes (k€)\")\nax.grid(alpha=.25)\nplt.show()",
      "result": "La figure montre une hausse de janvier à février puis un léger repli en mars. Elle ne renseigne pas sur la marge.",
      "instructions": "Transforme les ventes en euros et vérifie que l’unité de l’axe reste cohérente.",
      "mission": "Créer une planche de trois graphiques complémentaires accompagnés d’observations distinctes.",
      "validation": "Les axes, unités, filtres et titres permettent une lecture indépendante.",
      "quiz": {
        "question": "Qu’est-ce qui rend le résultat exploitable en entreprise ?",
        "options": [
          "Un calcul sans contexte",
          "Un résultat vérifiable et documenté",
          "Une figure sans unité"
        ],
        "correct": 1,
        "explanation": "Une analyse doit pouvoir être comprise et vérifiée par l’équipe."
      },
      "codeLanguage": "python"
    },
    {
      "id": "powerbi",
      "title": "Power BI, Power Query et DAX",
      "objective": "Construire un dashboard métier fondé sur un modèle contrôlé.",
      "concept": "Power Query nettoie les sources ; le modèle en étoile sépare faits et dimensions ; DAX définit des mesures recalculées selon les filtres. Avant publication, tester les indicateurs et respecter les règles d’accès et de confidentialité.",
      "points": [
        "Power BI Desktop : import et transformation",
        "Power Query et types de données",
        "Tables de faits, dimensions et relations",
        "DAX : SUM, DIVIDE et CALCULATE",
        "Segments, interactions et navigation",
        "Validation des chiffres, actualisation et partage"
      ],
      "example": "Les ventes et les objectifs doivent partager une dimension Date fiable pour calculer des KPI mensuels sans additionner des lignes en double.",
      "code": "Total Ventes = SUM(Ventes[Montant])\nTotal Objectif = SUM(Objectifs[Montant])\nAtteinte Objectif = DIVIDE([Total Ventes], [Total Objectif])\nEcart = [Total Ventes] - [Total Objectif]",
      "result": "DIVIDE évite une erreur de division par zéro. Ces mesures changent selon les filtres actifs du rapport.",
      "instructions": "Crée sur papier le schéma FactVentes → DimDate et DimMagasin. Explique quel filtre agit sur quelle mesure.",
      "mission": "Livrer un rapport Power BI avec source vérifiée, trois mesures et deux pages de pilotage.",
      "validation": "Tous les totaux sont réconciliés avec une extraction de référence et le périmètre des filtres est documenté.",
      "quiz": {
        "question": "Pourquoi préférer une mesure DAX pour un KPI filtrable ?",
        "options": [
          "Elle réagit au contexte de filtre",
          "Elle modifie les données sources",
          "Elle remplace toujours Power Query"
        ],
        "correct": 0,
        "explanation": "Une mesure est évaluée dans le contexte de filtre du visuel."
      },
      "codeLanguage": "dax"
    },
    {
      "id": "kpi-decision",
      "title": "KPI, analyse métier et recommandations",
      "objective": "Relier les analyses aux décisions et à leurs limites.",
      "concept": "Un KPI doit avoir une définition précise, une formule, une période, une population et un responsable. Les écarts se décomposent avant de rechercher les causes ; les recommandations sont proportionnées aux données observées.",
      "points": [
        "Question métier et décision attendue",
        "Définition, unité, numérateur/dénominateur",
        "Variations absolues et relatives",
        "Comparaisons par segment et période",
        "Analyse d’écarts et facteurs possibles",
        "Synthèse exécutive et recommandations testables"
      ],
      "example": "Une baisse de 10 % du revenu peut provenir d’une baisse du volume, du panier moyen, ou des deux.",
      "code": "import pandas as pd\ndf = pd.DataFrame({\"mois\":[\"M1\",\"M2\"],\"commandes\":[100,90],\"panier\":[50,52]})\ndf[\"revenu\"] = df[\"commandes\"] * df[\"panier\"]\ndf[\"variation_pct\"] = df[\"revenu\"].pct_change() * 100\nprint(df.to_string(index=False))",
      "result": "Revenu M1 : 5 000 ; M2 : 4 680, soit −6,4 %. Les commandes ont diminué malgré un panier moyen plus élevé.",
      "instructions": "Calcule une cible permettant de revenir à 5 000 à panier moyen constant, puis explique l’hypothèse.",
      "mission": "Rédiger une note d’une page avec KPI, diagnostic, réserves et trois actions vérifiables.",
      "validation": "La note distingue faits, hypothèses et actions recommandées.",
      "quiz": {
        "question": "Un KPI sans période de référence est-il suffisamment défini ?",
        "options": [
          "Oui",
          "Non",
          "Seulement pour une présentation"
        ],
        "correct": 1,
        "explanation": "Sans période ni périmètre, la valeur n’est pas interprétable."
      },
      "codeLanguage": "python"
    },
    {
      "id": "industrie-maintenance",
      "title": "Analytics industriel et maintenance prédictive",
      "objective": "Analyser les performances de machines et leurs événements.",
      "concept": "Les données de capteurs et de maintenance sont horodatées ; elles exigent un contrôle des trous, doublons et unités. Les arrêts se résument par fréquence et durée. Une anomalie statistique n’est pas nécessairement une panne : l’équipe métier doit valider.",
      "points": [
        "Sources capteurs, événements et historique machine",
        "Séries temporelles, fréquence et unités",
        "Temps d’arrêt, disponibilité, MTBF/MTTR",
        "Détection de seuils et anomalies",
        "Agrégations par site, machine et semaine",
        "Introduction à la prévision et à ses limites"
      ],
      "example": "Sur une ligne de production, une machine peut subir peu d’incidents mais des arrêts très longs : fréquence et durée doivent être analysées ensemble.",
      "code": "import pandas as pd\nincidents = pd.DataFrame({\"machine\":[\"A\",\"A\",\"B\",\"B\"],\"minutes\":[20,40,10,90]})\nbilan = incidents.groupby(\"machine\").agg(\n  nb_incidents=(\"minutes\",\"size\"),\n  arret_total=(\"minutes\",\"sum\"),\n  arret_moyen=(\"minutes\",\"mean\"))\nprint(bilan)",
      "result": "A et B ont chacune deux incidents et 60/100 minutes d’arrêt. Le nombre d’événements seul masque la gravité différente.",
      "instructions": "Ajoute un incident sans durée : distingue incident observé et temps d’arrêt renseigné.",
      "mission": "Produire une fiche machine avec tendances, contrôles et proposition d’investigation.",
      "validation": "Les indicateurs ont un dénominateur explicite et aucune panne n’est affirmée sur simple anomalie.",
      "quiz": {
        "question": "Qu’est-ce qui rend le résultat exploitable en entreprise ?",
        "options": [
          "Un calcul sans contexte",
          "Un résultat vérifiable et documenté",
          "Une figure sans unité"
        ],
        "correct": 1,
        "explanation": "Une analyse doit pouvoir être comprise et vérifiée par l’équipe."
      },
      "codeLanguage": "python"
    },
    {
      "id": "simulation-stage",
      "title": "Mission de stage : livrer une analyse de bout en bout",
      "objective": "Réaliser un projet réutilisable, documenté et vérifiable.",
      "concept": "La livraison professionnelle comprend un brief, une source conservée, un pipeline de transformation, des contrôles de qualité, un tableau de KPI et une synthèse des limites. Le code doit être relançable par le tuteur.",
      "points": [
        "Lire un brief et demander des précisions",
        "Conserver la source et versionner son travail",
        "Nettoyage reproductible et jointures contrôlées",
        "Calcul et visualisation de KPI",
        "README, tests et nomenclature",
        "Présentation courte et passation à l’équipe"
      ],
      "example": "Le tuteur fournit un export de tickets incomplet. Il veut savoir sur quel site concentrer une vérification.",
      "code": "import pandas as pd\ntickets = pd.DataFrame({\"id\":[1,2,2,3,4],\"site\":[\"A\",\"A\",\"A\",\"B\",\"B\"],\"minutes\":[30,20,20,40,None]})\nnet = tickets.drop_duplicates(\"id\")\nrapport = net.groupby(\"site\").agg(\n  tickets=(\"id\",\"nunique\"),\n  duree_connue=(\"minutes\",\"sum\"),\n  durees_manquantes=(\"minutes\",lambda s:s.isna().sum()))\nprint(rapport)",
      "result": "Après dédoublonnage : site A = 2 tickets / 50 minutes connues ; B = 2 tickets / 40 minutes connues et une durée manquante. Il faut signaler l’incomplétude de B.",
      "instructions": "Ajoute un contrôle assert sur les identifiants uniques et rédige le message de passation au tuteur.",
      "mission": "Livrer notebook, script de contrôle, tableau de bord synthétique, README et restitution de cinq minutes.",
      "validation": "Le projet se relance, documente les données manquantes et ne confond pas absence avec zéro.",
      "quiz": {
        "question": "Qu’est-ce qui rend le résultat exploitable en entreprise ?",
        "options": [
          "Un calcul sans contexte",
          "Un résultat vérifiable et documenté",
          "Une figure sans unité"
        ],
        "correct": 1,
        "explanation": "Une analyse doit pouvoir être comprise et vérifiée par l’équipe."
      },
      "codeLanguage": "python"
    }
  ]
};
