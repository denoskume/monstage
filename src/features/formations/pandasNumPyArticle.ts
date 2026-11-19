import type {CourseArticleData} from './courseArticleContent';

export const pandasNumpyArticle:CourseArticleData={
 eyebrow:'PYTHON · DATA ANALYSIS',
 title:'NumPy and Pandas in Python: A Beginner’s Guide',
 author:'MonStage Learning',
 intro:[
  'Un Data Analyst manipule des tableaux, pas seulement des nombres isolés. Deux bibliothèques jouent un rôle central : NumPy pour les calculs sur des tableaux numériques et Pandas pour l’analyse de données organisées en lignes et colonnes.',
  'Dans ce guide, tu vas apprendre à créer un tableau, comprendre ses dimensions, importer un fichier de ventes, nettoyer ses colonnes, filtrer les lignes, calculer des indicateurs et rapprocher plusieurs sources.'
 ],
 tldr:[
  'NumPy = des tableaux multidimensionnels homogènes et du calcul rapide ; Pandas = des Series et DataFrames pour explorer, nettoyer, filtrer et agréger des données métier.',
  'Les étapes indispensables sont : lire → vérifier → sélectionner → nettoyer → regrouper → interpréter. Chaque étape doit être comprise et contrôlée.',
  'Les exemples fonctionnent dans Jupyter avec des données intégrées : aucun téléchargement préalable n’est nécessaire.'
 ],
 sections:[
 {id:'what-numpy',title:'What is NumPy?',depth:1,pointIndex:0,visual:'numpy',paragraphs:[
   'NumPy est la base du calcul numérique en Python. Il crée des tableaux homogènes appelés ndarray : tous les éléments possèdent un type cohérent et peuvent être traités ensemble sans écrire une boucle pour chaque valeur.',
   'Dans l’analyse de données, NumPy sert à calculer moyennes, écarts-types, seuils et transformations. Dans le traitement d’images, les matrices de pixels sont aussi des tableaux NumPy.'
 ]},
 {id:'install-numpy',title:'Installing and Importing NumPy',depth:2,pointIndex:0,paragraphs:[
   'Installe NumPy dans l’environnement Python de ton notebook puis importe-le avec son alias habituel np. L’installation ne doit être exécutée qu’une fois par environnement.'
 ],language:'bash',code:`python -m pip install numpy pandas matplotlib

# Vérifier depuis Python :
python -c "import numpy as np; print(np.__version__)"`,output:'La commande affiche la version de NumPy installée.',interpretation:'L’alias np permet d’appeler numpy.array, numpy.mean ou numpy.arange avec une écriture courte.'},
 {id:'ndarray',title:'Understanding NumPy Arrays, Shape and Dtype',depth:1,visual:'numpy',pointIndex:0,paragraphs:[
   'Un ndarray peut représenter une liste de mesures, une matrice ou une image à plusieurs canaux. shape indique la taille de chaque axe ; ndim le nombre d’axes ; dtype le type des nombres.',
   'Pour éviter les erreurs, commence chaque analyse en inspectant la forme, le type et quelques valeurs. Ce contrôle devient indispensable sur un tableau provenant d’un fichier externe.'
 ],language:'python',code:`import numpy as np

# Deux capteurs, trois mesures chacun
temperature = np.array([[21, 22, 23],
                        [19, 20, 22]], dtype=float)

print("Shape :", temperature.shape)
print("Dimensions :", temperature.ndim)
print("Type :", temperature.dtype)
print("Moyenne :", temperature.mean())`,output:'Shape : (2, 3) ; Dimensions : 2 ; Type : float64 ; Moyenne : 21.1666…',interpretation:'Le tableau contient six mesures sur deux lignes. NumPy calcule la moyenne globale sans boucle explicite.'},
 {id:'operations',title:'Indexing, Slicing and Vectorized Calculations',depth:1,pointIndex:0,paragraphs:[
   'L’indexation sélectionne un élément ; le slicing découpe un sous-tableau ; le calcul vectorisé applique une opération à toutes les valeurs. Les indices commencent à zéro et la borne de fin d’un slice est exclue.',
   'Pour ajouter une température de correction à chaque capteur, tu n’as pas besoin de parcourir les cellules une par une.'
 ],language:'python',code:`import numpy as np
mesures = np.array([20, 22, 25, 28], dtype=float)

# Les deux premières mesures
print(mesures[:2])

# Ajouter 1,5 à chaque mesure
corrigees = mesures + 1.5

# Conserver uniquement celles de plus de 24 °C
print(corrigees[corrigees > 24])`,output:'[20. 22.] puis [26.5 29.5].',interpretation:'Le masque corrigees > 24 sélectionne les valeurs correspondant à une condition logique.'},
 {id:'what-pandas',title:'What is Pandas?',depth:1,visual:'pandas',pointIndex:1,paragraphs:[
   'Pandas est une bibliothèque Python spécialement conçue pour travailler sur des données tabulaires. Ses objets principaux sont la Series (une colonne de valeurs) et le DataFrame (un tableau complet).',
   'Imagine un fichier d’entreprise contenant les machines, les sites, les dates et les minutes d’arrêt. Avec Pandas, tu peux calculer les arrêts de chaque machine, identifier les valeurs manquantes et préparer un rapport.'
 ]},
 {id:'dataframe',title:'Understanding Series and DataFrames',depth:2,visual:'data',pointIndex:1,paragraphs:[
   'Une ligne de DataFrame représente une observation : une commande, une mesure, une panne ou un client selon le fichier. Chaque colonne possède un nom et un type.',
   'Le grain des données est essentiel : trois commandes ne signifient pas trois clients différents. Il faut toujours savoir ce que représente une ligne avant d’agréger.'
 ],language:'python',code:`import pandas as pd

data = {
    "Machine": ["M1", "M2", "M1", "M1"],
    "Arret_min": [10, 15, 25, 5]
}
df = pd.DataFrame(data)

print(df)
print("Dimensions :", df.shape)`,output:'Un tableau de 4 lignes et 2 colonnes. shape = (4, 2).',interpretation:'Les observations sont des événements d’arrêt. M1 apparaît trois fois parce qu’elle a eu trois événements.'},
 {id:'csv',title:'Reading CSV and Excel Files',depth:1,pointIndex:1,paragraphs:[
   'Un fichier CSV stocke des données séparées par un délimiteur ; un fichier Excel conserve des feuilles avec davantage de mise en forme. Pandas sait lire les deux formats.',
   'Le premier contrôle après l’import concerne le nombre de lignes, les colonnes, les types et les valeurs absentes. Il faut éviter de commencer une visualisation avant cette vérification.'
 ],language:'python',code:`import pandas as pd
from io import StringIO

csv = StringIO("""Machine,Site,Arret_min
M1,Nantes,10
M2,Paris,15
M1,Nantes,25
""")

df = pd.read_csv(csv)
print(df.head())
print(df.dtypes)
# Avec un vrai fichier : pd.read_csv("pannes.csv")
# Pour Excel : pd.read_excel("pannes.xlsx")`,output:'Les trois observations s’affichent et Arret_min est reconnu comme une colonne numérique.',interpretation:'head permet de voir rapidement si l’import respecte le format attendu. Les types doivent ensuite être validés.'},
 {id:'explore',title:'Exploring and Selecting Data',depth:1,pointIndex:2,paragraphs:[
   'head donne un aperçu, info décrit colonnes et valeurs non nulles, describe fournit des statistiques numériques. loc sélectionne par étiquette ; iloc sélectionne par position.',
   'Une sélection conditionnelle ne modifie pas automatiquement la source. Tu obtiens une nouvelle vue des observations correspondant à la question métier.'
 ],language:'python',code:`import pandas as pd
df = pd.DataFrame({
    "Machine": ["M1","M2","M1","M3"],
    "Arret_min": [10,15,25,8]
})

print(df.head(2))
print(df.describe())

# Toutes les pannes de M1
m1 = df.loc[df["Machine"] == "M1"]
print(m1)`,output:'Les lignes de M1 portent les durées 10 et 25 minutes.',interpretation:'Le filtre utilise une condition sur la colonne Machine. Il permet de répondre à une question précise sans mélanger les autres équipements.'},
 {id:'clean',title:'Cleaning Missing and Duplicate Values',depth:1,pointIndex:3,paragraphs:[
   'Les données réelles contiennent des doublons, des valeurs manquantes et des types incorrects. Pandas fournit isna, duplicated, drop_duplicates et astype pour les identifier ou corriger.',
   'Ne supprime pas aveuglément les lignes. Une température manquante n’est pas une température de zéro ; une machine peut légitimement avoir deux pannes identiques.'
 ],language:'python',code:`import pandas as pd
df = pd.DataFrame({
    "Machine": ["M1","M1","M2"],
    "Arret_min": [10,10,None]
})

print("Durées inconnues :", df["Arret_min"].isna().sum())
print("Lignes identiques :", df.duplicated().sum())

# Ne modifier qu’après validation métier
clean = df.drop_duplicates()
print("Lignes conservées :", len(clean))`,output:'1 durée inconnue, 1 doublon exact, 2 lignes après suppression du doublon exact.',interpretation:'Un doublon exact n’est pas toujours un doublon métier. Vérifie les identifiants et l’horodatage avant de supprimer un événement.'},
 {id:'groupby',title:'Filtering, GroupBy and Aggregations',depth:1,visual:'data',pointIndex:4,paragraphs:[
   'groupby rassemble les observations qui partagent une valeur, puis applique une fonction statistique comme sum, mean, count ou max. C’est une des opérations les plus utiles pour produire des KPI.',
   'Par exemple, une équipe maintenance souhaite connaître les minutes d’arrêt cumulées par machine. L’indicateur doit être mesuré sur une période explicite.'
 ],language:'python',code:`import pandas as pd
df = pd.DataFrame({
    "Machine": ["M1","M2","M1","M1"],
    "Arret_min": [10,15,25,5]
})

total = df.groupby("Machine")["Arret_min"].sum()
print(total)`,output:'M1    40\nM2    15',interpretation:'M1 totalise 40 minutes d’arrêt et M2 en totalise 15. Cela ne prouve pas encore que M1 est la moins fiable : il faut aussi connaître les heures de fonctionnement.'},
 {id:'merge',title:'Merging Tables, Dates and Exporting Results',depth:1,pointIndex:5,paragraphs:[
   'Une analyse métier combine souvent plusieurs sources. merge rapproche les tableaux selon une clé ; to_datetime convertit les dates ; to_csv permet de livrer un fichier exploitable.',
   'Le piège des jointures est important : une clé non unique peut multiplier les lignes et gonfler les résultats. Contrôle systématiquement la cardinalité de la relation.'
 ],language:'python',code:`import pandas as pd

pannes = pd.DataFrame({"Machine":["M1","M2"],"Arret_min":[40,15]})
sites = pd.DataFrame({"Machine":["M1","M2"],"Site":["Nantes","Paris"]})

rapport = pannes.merge(sites, on="Machine", validate="one_to_one")
print(rapport)
rapport.to_csv("rapport_pannes.csv", index=False)`,output:'Deux machines avec leurs arrêts et sites respectifs. Le fichier rapport_pannes.csv est créé.',interpretation:'validate="one_to_one" signale une jointure non conforme lorsque des clés censées être uniques se répètent.'}
 ],
 mistakes:[
   'Confondre la ligne (grain des données) et l’entité métier, par exemple une commande et un client.',
   'Faire une opération sur une colonne de texte supposée numérique sans contrôler dtype.',
   'Remplacer toutes les valeurs absentes par zéro.',
   'Supprimer des doublons sans vérifier l’identifiant métier.',
   'Utiliser une jointure plusieurs-à-plusieurs puis interpréter des sommes artificiellement gonflées.'
 ],
 conclusion:[
   'NumPy permet les calculs rapides sur tableaux ; Pandas permet de gérer des données métier structurées. Ensemble, ils constituent la base de nombreux projets Data Analyst.',
   'Après ce guide, entraîne-toi sur un vrai fichier CSV : contrôle les lignes, nettoie les valeurs, calcule les KPI et explique les limites des résultats. La suite naturelle est l’EDA et la visualisation.'
 ],
 faq:[
  {question:'What is the difference between NumPy and Pandas?',answer:'NumPy travaille avec des tableaux numériques ; Pandas fournit des Series et DataFrames avec colonnes, index et outils d’analyse métier.'},
  {question:'Do I need NumPy before learning Pandas?',answer:'Il est utile de comprendre tableaux, types et calculs vectorisés. Tu peux toutefois apprendre les deux progressivement.'},
  {question:'What is a DataFrame?',answer:'Un tableau de données composé de lignes d’observations et de colonnes nommées.'},
  {question:'How do I import a CSV file?',answer:'Avec pd.read_csv("fichier.csv"), puis vérifie head, shape et dtypes.'},
  {question:'What is groupby used for?',answer:'Regrouper des lignes par catégorie pour calculer des totaux, moyennes et autres indicateurs.'},
  {question:'Why can a merge produce more rows?',answer:'Une clé dupliquée peut créer une relation un-à-plusieurs ou plusieurs-à-plusieurs. Vérifie validate et le nombre de lignes.'}
 ]
};
