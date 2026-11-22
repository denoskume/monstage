import type {CourseArticleData} from './courseArticleContent';

export const sqlArticle:CourseArticleData={
 eyebrow:'DATA ANALYSIS · SQL',
 title:'What is SQL? A Beginner’s Guide to Data Analysis',
 author:'MonStage Learning',
 intro:[
  'SQL (Structured Query Language) est le langage utilisé pour interroger les données conservées dans des bases relationnelles. Il permet de sélectionner les bonnes lignes, agréger des mesures et réunir plusieurs tables.',
  'Les exemples suivants utilisent SQLite : une petite base de données intégrée dans Python, suffisante pour apprendre SELECT, WHERE, GROUP BY et JOIN sans installer un serveur.'
 ],
 tldr:[
  'SELECT lit des colonnes ; WHERE filtre des lignes ; GROUP BY regroupe des observations ; JOIN relie des tables par leurs clés.',
  'Une requête fiable dépend du grain de la donnée et de l’unicité des clés. Une jointure peut produire un résultat plausible mais faux si elle multiplie les lignes.',
  'Pour s’entraîner, on construit une base fictive de commandes et on vérifie les résultats à la main.'
 ],
 sections:[
  {id:'what',title:'What is SQL?',depth:1,pointIndex:0,paragraphs:['SQL exprime une question sous forme de requête : quelles observations chercher, quels calculs effectuer, comment présenter le résultat. Il est essentiel aux analystes qui travaillent sur des bases métier.','Une table comporte des colonnes, des lignes et souvent une clé qui identifie les enregistrements. La qualité du calcul dépend de cette structure.']},
  {id:'setup',title:'Getting Started with SQLite in Python',depth:2,pointIndex:0,paragraphs:['SQLite est disponible dans Python via sqlite3. Une base en mémoire permet de s’entraîner sans fichier ni compte distant. On crée ici une petite table vente.'],language:'python',code:`import sqlite3
conn = sqlite3.connect(":memory:")

conn.executescript("""
CREATE TABLE vente (site TEXT, montant INTEGER);
INSERT INTO vente VALUES ('Nantes', 100);
INSERT INTO vente VALUES ('Nantes', 150);
INSERT INTO vente VALUES ('Paris', 180);
""")

print(conn.execute("SELECT COUNT(*) FROM vente").fetchone())`,output:'(3,) : trois lignes de ventes.',interpretation:'La requête est envoyée à SQLite par conn.execute et son résultat est récupéré avec fetchone.'},
  {id:'select',title:'SELECT, WHERE and ORDER BY',depth:1,pointIndex:1,paragraphs:['SELECT choisit les colonnes à afficher. WHERE exclut les lignes qui ne respectent pas une condition. ORDER BY fixe l’ordre du résultat, ce qui évite de dépendre d’un ordre de stockage non garanti.'],language:'sql',code:`SELECT site, montant
FROM vente
WHERE montant >= 150
ORDER BY montant DESC;`,output:'Paris | 180\nNantes | 150',interpretation:'La vente de 100 est filtrée ; les deux autres lignes sont triées par montant décroissant.'},
  {id:'aggregation',title:'COUNT, SUM, AVG and GROUP BY',depth:1,pointIndex:2,paragraphs:['Les fonctions d’agrégation résument plusieurs lignes. COUNT compte, SUM additionne, AVG calcule une moyenne. GROUP BY définit la catégorie pour laquelle ces calculs sont répétés.'],language:'sql',code:`SELECT site,
       COUNT(*) AS nb_ventes,
       SUM(montant) AS total
FROM vente
GROUP BY site;`,output:'Nantes | 2 | 250\nParis | 1 | 180',interpretation:'Chaque ligne du résultat représente un site, alors que chaque ligne de la table représentait une vente.'},
  {id:'having',title:'HAVING and Conditional Aggregation',depth:1,pointIndex:3,paragraphs:['WHERE filtre avant l’agrégation ; HAVING filtre les groupes après calcul. CASE permet de définir une classification métier calculée dans la requête.'],language:'sql',code:`SELECT site, SUM(montant) AS total
FROM vente
GROUP BY site
HAVING SUM(montant) >= 200;`,output:'Nantes | 250',interpretation:'Paris est exclu parce que son total de 180 est inférieur au seuil de 200.'},
  {id:'join',title:'INNER JOIN and LEFT JOIN',depth:1,pointIndex:4,paragraphs:['Une jointure relie des tables par une clé : par exemple une table de commandes et une table de clients. INNER JOIN conserve les correspondances ; LEFT JOIN garde également les lignes sans correspondance de la table de gauche.','Une clé censée être unique doit être contrôlée : si plusieurs lignes correspondent, une jointure peut multiplier les ventes et fausser un indicateur.'],language:'sql',code:`-- client(id, nom) et commande(client_id, montant)
SELECT c.nom, SUM(o.montant) AS total
FROM client AS c
LEFT JOIN commande AS o ON c.id = o.client_id
GROUP BY c.id, c.nom;`,output:'Une ligne par client avec la somme de ses commandes. Les clients sans commande peuvent rester présents avec un total NULL.',interpretation:'La clé client.id doit être unique ; le regroupement suit ici le client et non chaque commande.',tip:'Vérifie COUNT(*) avant et après les jointures et le nombre de clés distinctes.'},
  {id:'ctes',title:'CTEs and Window Functions',depth:1,pointIndex:5,paragraphs:['Une CTE, introduite par WITH, donne un nom à une sous-requête pour améliorer la lisibilité. Une fonction fenêtre comme ROW_NUMBER ou SUM() OVER permet de calculer un résultat tout en conservant les lignes originales.'],language:'sql',code:`WITH totaux AS (
    SELECT site, SUM(montant) AS total
    FROM vente GROUP BY site
)
SELECT site, total,
       RANK() OVER (ORDER BY total DESC) AS rang
FROM totaux;`,output:'Nantes | 250 | 1\nParis | 180 | 2',interpretation:'La CTE calcule les totaux, puis RANK attribue un classement sans nouveau GROUP BY.'}
 ],
 mistakes:[
  'Faire une jointure sans contrôler l’unicité des clés.',
  'Confondre WHERE, qui filtre les lignes, et HAVING, qui filtre les groupes.',
  'Utiliser SELECT * sans comprendre les colonnes et les données transférées.',
  'Oublier la période dans les indicateurs calculés.',
  'Interpréter un NULL comme un zéro métier.'
 ],
 conclusion:['SQL permet de transformer des données relationnelles en tableaux d’analyse fiables. Les bonnes habitudes sont de vérifier les clés, le grain, les filtres et les totaux.','Pour pratiquer, crée deux tables de clients et de commandes, écris les requêtes et compare les résultats obtenus aux calculs faits à la main.'],
 faq:[
  {question:'What is SQL used for?',answer:'Interroger, filtrer, regrouper et relier les données de bases relationnelles.'},
  {question:'What is the difference between WHERE and HAVING?',answer:'WHERE filtre les lignes avant le calcul ; HAVING filtre les résultats des groupes.'},
  {question:'What is GROUP BY?',answer:'Une clause qui forme des groupes de lignes afin de calculer des agrégations par catégorie.'},
  {question:'What is the difference between INNER JOIN and LEFT JOIN?',answer:'INNER JOIN ne conserve que les correspondances ; LEFT JOIN conserve toutes les lignes de gauche.'},
  {question:'Why can a JOIN inflate sales totals?',answer:'Une clé répétée du côté joint peut produire plusieurs correspondances pour la même vente.'}
 ]
};

export const powerBIArticle:CourseArticleData={
 eyebrow:'BUSINESS INTELLIGENCE · DATA ANALYSIS',
 title:'What is Power BI? A Beginner’s Guide to Dashboards and DAX',
 author:'MonStage Learning',
 intro:[
  'Power BI est un environnement de Business Intelligence qui transforme des données d’entreprise en rapports et dashboards interactifs. Son intérêt n’est pas seulement le dessin de graphiques : il permet de préparer, organiser, calculer et vérifier des indicateurs.',
  'Ce guide suit le chemin d’un stagiaire Data Analyst : importer un tableau, nettoyer les colonnes, construire le modèle, créer des mesures DAX, concevoir une page et contrôler les chiffres affichés.'
 ],
 tldr:[
  'Power Query prépare les données ; le modèle relationnel relie les tables ; DAX calcule les mesures selon les filtres actifs ; les visuels restituent les résultats.',
  'Un dashboard fiable commence par des définitions de KPI et un modèle de données cohérent, pas par les couleurs des graphiques.',
  'Il faut vérifier les totaux à la source après chaque transformation et dans plusieurs contextes de filtres.'
 ],
 sections:[
  {id:'what',title:'What is Power BI?',depth:1,pointIndex:0,paragraphs:['Power BI Desktop est l’application de création des rapports ; le service en ligne permet notamment leur publication et leur consultation selon les autorisations.','Une page interactive donne des réponses rapides, mais ses chiffres doivent correspondre aux données source et aux règles métier.']},
  {id:'import',title:'Importing and Transforming Data with Power Query',depth:1,pointIndex:1,paragraphs:['Power Query permet d’importer des fichiers Excel/CSV, de convertir des types, de supprimer des colonnes inutiles et de préparer les tables avant de les charger dans le modèle.','Chaque étape de transformation doit être reproductible et justifiée. Une conversion incorrecte de date ou de nombre affecte les mesures ultérieures.'],language:'text',code:`1. Accueil → Obtenir des données → Texte/CSV.
2. Vérifier les colonnes et l’aperçu.
3. Transformer les données → Power Query.
4. Définir les types : Date, Texte, Nombre décimal.
5. Fermer et appliquer.`,output:'Une table préparée est ajoutée au modèle Power BI.',interpretation:'Power Query gère les transformations à l’import et peut les rejouer lors de l’actualisation.'},
  {id:'model',title:'Understanding Fact Tables and Dimensions',depth:1,pointIndex:2,paragraphs:['Une table de faits contient des événements mesurables, par exemple les ventes. Des dimensions décrivent le contexte : date, produit, site ou machine.','Un modèle en étoile facilite le filtrage et évite des relations ambiguës. Vérifie toujours le sens des relations et l’unicité des clés côté dimension.'],language:'text',code:`DimDate (DateID unique) ──1:n── FactVentes (DateID, SiteID, Montant)
DimSite (SiteID unique) ──1:n── FactVentes`,output:'Les dimensions filtrent la table de faits selon la date ou le site.',interpretation:'Une ligne dans DimSite correspond à un seul site ; FactVentes peut en contenir plusieurs ventes.'},
  {id:'dax',title:'Writing Measures with DAX',depth:1,pointIndex:3,paragraphs:['DAX définit des mesures, calculées dans le contexte de filtre du rapport. SUM additionne une colonne numérique ; DIVIDE protège le calcul d’un ratio contre les dénominateurs nuls.','Une mesure est différente d’une colonne calculée : elle se recalcule à chaque affichage en fonction des filtres sélectionnés.'],language:'dax',code:`Ventes totales = SUM(FactVentes[Montant])

Nombre commandes = DISTINCTCOUNT(FactVentes[CommandeID])

Panier moyen = DIVIDE([Ventes totales], [Nombre commandes])`,output:'Le panier moyen se recalcule lorsqu’un utilisateur filtre un magasin ou une période.',interpretation:'Les champs et tables doivent porter les noms réels du modèle pour que les mesures soient exécutables.'},
  {id:'filters',title:'Slicers, Interactions and Navigation',depth:1,pointIndex:4,paragraphs:['Un segment (slicer) permet de choisir un site, un mois ou un type d’équipement. Le bon comportement consiste à mettre à jour les visuels concernés sans perdre les unités ni les définitions.','Teste les sélections une à une, puis plusieurs filtres combinés. Une carte KPI devrait être cohérente avec le tableau détaillé du même périmètre.'],language:'text',code:`1. Ajoute un segment sur DimSite[NomSite].
2. Sélectionne « Nantes ».
3. Compare [Ventes totales] au tableau détaillé filtré.
4. Efface le segment et vérifie le retour au total général.`,output:'Les visuels affichent les chiffres du site choisi, puis les totaux globaux.',interpretation:'Une interaction mal configurée peut laisser un visuel non filtré tout en affichant un autre contexte.'},
  {id:'visuals',title:'Designing a Clear, Professional Dashboard',depth:1,pointIndex:4,paragraphs:['Chaque visuel doit servir une décision. Une courbe montre une évolution temporelle, des barres comparent des catégories, une carte KPI résume une valeur définie.','Utilise les axes, les titres, les unités, une hiérarchie claire et un nombre limité de couleurs. Prévois une page de détails lorsque la vue d’ensemble ne suffit pas.']},
  {id:'validation',title:'Validating Results and Refreshing Reports',depth:1,pointIndex:5,paragraphs:['Avant de présenter le dashboard, compare les totaux avec la source, teste une période vide, contrôle les types et les relations et documente la date d’actualisation.','Un rapport peut afficher des graphiques élégants tout en contenant des calculs faux ; les validations doivent faire partie du livrable.'],language:'text',code:`Contrôle de recette :
[ ] Le total Power BI correspond à la source.
[ ] Le filtre Site change les bons indicateurs.
[ ] Aucun ratio ne présente une division par zéro.
[ ] Les axes portent les unités correctes.
[ ] La dernière actualisation est indiquée.`,output:'Un tableau de bord testable, prêt pour une revue avec le tuteur.',interpretation:'La validation est une pratique de qualité des données et de qualité logicielle, pas un simple contrôle visuel.'}
 ],
 mistakes:[
  'Créer les visuels avant de comprendre la structure du jeu de données.',
  'Ignorer les relations entre tables et les cardinalités.',
  'Utiliser une mesure DAX sur un champ mal typé.',
  'Oublier que le contexte de filtre change le résultat d’une mesure.',
  'Publier un dashboard sans confronter les chiffres aux données source.'
 ],
 conclusion:['Power BI devient réellement utile lorsqu’il relie des données fiables à des décisions métier claires. Power Query, modèle en étoile, DAX et interactions doivent être compris comme les étapes d’un même workflow.','Pour pratiquer, prends un petit fichier de ventes et crée une page avec trois KPI, une évolution temporelle, un tableau détaillé et un segment Site.'],
 faq:[
  {question:'What is Power BI used for?',answer:'Analyser des données et créer des rapports/dashboard interactifs pour les équipes métier.'},
  {question:'What is Power Query?',answer:'Le moteur de préparation et de transformation des données utilisé notamment dans Power BI et Excel.'},
  {question:'What is DAX?',answer:'Un langage de formules pour calculer des mesures et autres expressions dans un modèle Power BI.'},
  {question:'Why use a star schema?',answer:'Pour organiser les faits et dimensions et faciliter des filtres fiables.'},
  {question:'How do I know my dashboard is correct?',answer:'Compare les chiffres à la source, contrôle les relations et teste les filtres sur plusieurs périmètres.'}
 ]
};
