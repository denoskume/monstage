import type {CourseArticleData} from './courseArticleContent';

export const pythonArticle:CourseArticleData={
 eyebrow:'PYTHON · DATA ANALYSIS',
 title:'Python for Data Analysis: A Beginner’s Guide',
 author:'MonStage Learning',
 intro:[
  'Python est l’un des langages les plus utilisés pour analyser des données. Sa syntaxe est lisible, ses bibliothèques sont nombreuses et il s’intègre facilement à Jupyter, aux fichiers CSV, aux bases de données et aux outils de visualisation.',
  'L’objectif n’est pas de mémoriser toutes les fonctionnalités du langage. Tu vas comprendre les notions indispensables pour lire un fichier, transformer des observations et expliquer un calcul professionnel.'
 ],
 tldr:[
  'Python permet d’exprimer des instructions, des conditions, des boucles et des fonctions dans un langage relativement simple.',
  'Pour un Data Analyst, les bases à maîtriser sont les types, listes, dictionnaires, if, for, def, fichiers, erreurs et notebooks.',
  'À la fin du guide, tu disposeras des fondations nécessaires pour apprendre NumPy et Pandas.'
 ],
 sections:[
  {id:'what',title:'What is Python?',depth:1,pointIndex:0,paragraphs:[
    'Python est un langage de programmation généraliste et interprété. Il sert à automatiser des tâches, développer des logiciels, travailler sur des données et construire des systèmes d’intelligence artificielle.',
    'Dans un contexte Data Analyst, Python aide à reproduire la même transformation sur des milliers de lignes sans répéter manuellement les étapes dans un tableur.'
  ]},
  {id:'install',title:'Installing Python and Jupyter',depth:2,pointIndex:0,paragraphs:[
    'Jupyter exécute du code par cellules et permet de mêler texte, figures et résultats. Un notebook constitue ainsi à la fois un environnement de travail et un support d’explication.',
    'Utilise un environnement Python cohérent pour éviter que les bibliothèques soient installées dans un interpréteur et exécutées dans un autre.'
  ],language:'bash',code:`python --version
python -m pip install jupyterlab pandas numpy matplotlib

# Ouvrir les notebooks dans le navigateur
jupyter lab`,output:'Le terminal indique la version Python, puis JupyterLab démarre un serveur local.',interpretation:'Tu peux écrire des cellules Markdown pour documenter le raisonnement et des cellules Python pour effectuer les calculs.'},
  {id:'variables',title:'Variables and Data Types',depth:1,pointIndex:1,paragraphs:[
    'Une variable associe un nom à une valeur. Les types de base comprennent int (entier), float (décimal), str (texte), bool (vrai/faux) et None (valeur absente).',
    'Les listes regroupent des éléments dans un ordre ; les dictionnaires associent des clés à des valeurs. Ces structures sont importantes pour organiser des données avant de les transformer en tableau.'
  ],language:'python',code:`machine = "M1"          # str : identifiant
temperature = 72.5      # float : mesure
alerte = temperature > 70  # bool : condition

mesures = [68, 72, 75]  # liste
fiche = {"machine": machine, "temperature": temperature}

print(alerte)
print(fiche["machine"])`,output:'True puis M1.',interpretation:'La condition produit un booléen et le dictionnaire permet de lire une valeur associée à une clé explicite.'},
  {id:'conditions',title:'Conditions and Loops',depth:1,pointIndex:2,paragraphs:[
    'Une condition if choisit une action selon une règle ; une boucle for parcourt plusieurs observations. Cela permet de vérifier un ensemble de températures sans recopier le même test pour chaque ligne.',
    'Évite de multiplier les boucles complexes quand une fonction Pandas/NumPy peut exprimer plus clairement le calcul, mais comprends d’abord ces mécanismes de base.'
  ],language:'python',code:`temperatures = [65, 82, 74, 90]
seuil = 80

for temperature in temperatures:
    if temperature > seuil:
        print("Alerte :", temperature)`,output:'Alerte : 82\nAlerte : 90',interpretation:'Les quatre mesures sont examinées une à une. Seules celles dépassant 80 déclenchent un message.'},
  {id:'functions',title:'Writing Reusable Functions',depth:1,pointIndex:3,paragraphs:[
    'Une fonction regroupe un calcul nommé et réutilisable. Elle reçoit éventuellement des paramètres, vérifie ses entrées et renvoie une valeur avec return.',
    'Sur un projet professionnel, les fonctions évitent de dupliquer le code et facilitent les tests.'
  ],language:'python',code:`def taux_defaut(defauts, pieces):
    if pieces == 0:
        return None  # éviter une division par zéro
    return 100 * defauts / pieces

print(taux_defaut(8, 200))
print(taux_defaut(0, 0))`,output:'4.0 puis None.',interpretation:'Huit pièces défectueuses sur deux cents correspondent à 4 %. Quand aucun élément n’a été contrôlé, le taux ne peut pas être calculé.'},
  {id:'files',title:'Reading CSV and JSON Files',depth:1,pointIndex:4,paragraphs:[
    'Un CSV représente un tableau de données ; JSON peut représenter des objets imbriqués. Python fournit des modules de lecture, et Pandas simplifie la lecture des fichiers tabulaires.',
    'Pour bien apprendre, commence avec un petit exemple dont tu connais les lignes attendues, puis remplace-le par un fichier d’entreprise.'
  ],language:'python',code:`import csv
from io import StringIO

source = StringIO("machine,arret_min\\nM1,10\\nM2,20")
reader = csv.DictReader(source)

for ligne in reader:
    print(ligne["machine"], int(ligne["arret_min"]))`,output:'M1 10\nM2 20',interpretation:'DictReader transforme chaque ligne du CSV en dictionnaire, puis int convertit le texte numérique en entier.'},
  {id:'errors',title:'Common Python Errors and How to Handle Them',depth:1,pointIndex:5,paragraphs:[
    'Les erreurs font partie du travail. FileNotFoundError signale un chemin absent, ValueError une conversion incorrecte, KeyError une clé absente et ZeroDivisionError une division impossible.',
    'Une bonne pratique consiste à vérifier les entrées et à afficher un message explicite plutôt qu’à ignorer silencieusement les problèmes.'
  ],language:'python',code:`valeur = "inconnue"
try:
    nombre = float(valeur)
except ValueError:
    nombre = None

print(nombre)`,output:'None.',interpretation:'La conversion impossible est signalée dans le résultat. La valeur inconnue n’est pas transformée arbitrairement en zéro.'}
 ],
 mistakes:[
  'Confondre un nombre et une chaîne de caractères, par exemple 10 et "10".',
  'Oublier l’indentation après if, for ou def.',
  'Utiliser une variable avant de l’avoir définie.',
  'Ne pas traiter les listes ou fichiers vides.',
  'Masquer les exceptions avec un except trop général sans les documenter.'
 ],
 conclusion:[
  'Les bases Python forment le socle de l’analyse de données avec NumPy, Pandas, Matplotlib et scikit-learn. Tu dois surtout savoir lire une fonction, la modifier et vérifier son résultat.',
  'Pour la pratique, crée une petite analyse de machines : lis des mesures, compte les alertes et organise le calcul du taux d’anomalies dans une fonction.'
 ],
 faq:[
  {question:'Do I need to master Python before Pandas?',answer:'Tu dois comprendre les variables, listes, fonctions et boucles. Tu peux ensuite approfondir ces notions en pratiquant Pandas.'},
  {question:'What is the difference between a list and a dictionary?',answer:'Une liste est indexée par position ; un dictionnaire associe une clé à une valeur.'},
  {question:'Why use Jupyter Notebook?',answer:'Il regroupe le code, les explications et les résultats dans un document reproductible.'},
  {question:'What does return do?',answer:'return fournit la valeur renvoyée par une fonction à la suite du programme.'},
  {question:'How do I handle missing data?',answer:'Il faut conserver la distinction entre valeur inconnue et valeur nulle, puis choisir une stratégie justifiée par la question métier.'}
 ]
};

export const edaArticle:CourseArticleData={
 eyebrow:'PYTHON · DATA ANALYSIS',
 title:'Exploratory Data Analysis (EDA) with Python: A Beginner’s Guide',
 author:'MonStage Learning',
 intro:[
  'Avant de créer un dashboard ou d’entraîner un modèle, il faut comprendre ce que contient le fichier : nombres de lignes, types, distributions, valeurs manquantes, écarts et relations possibles.',
  'L’analyse exploratoire des données (EDA) fournit une méthode pour passer d’un tableau brut à des observations argumentées. NumPy, Pandas, Matplotlib et Seaborn forment une combinaison accessible pour commencer.'
 ],
 tldr:[
  'EDA signifie Exploratory Data Analysis : explorer les données pour comprendre leur qualité, leur structure et les tendances qu’elles peuvent révéler.',
  'NumPy calcule ; Pandas organise et nettoie ; Matplotlib produit des graphiques ; Seaborn facilite les représentations statistiques.',
  'Le processus conseillé est : question → lecture → qualité → statistiques → distribution → relations → interprétation.'
 ],
 sections:[
 {id:'what',title:'What is Exploratory Data Analysis?',depth:1,pointIndex:0,paragraphs:[
   'L’EDA est l’étape où l’on observe et résume les données avant de choisir un modèle ou de produire une décision. Elle sert à poser des questions, détecter des anomalies et éviter les conclusions hâtives.',
   'Exemple : une hausse de ventes peut être due à un magasin particulier, à la saison ou au nombre de commandes. L’EDA sert à distinguer ces pistes.'
 ]},
 {id:'tools',title:'Tools Used for EDA',depth:1,pointIndex:0,paragraphs:[
   'NumPy effectue les calculs sur tableaux ; Pandas gère DataFrames, filtres et agrégations ; Matplotlib fournit un contrôle précis des axes et figures ; Seaborn crée des visualisations statistiques à partir des DataFrames.',
   'Commence par maîtriser les fonctions fondamentales de chaque outil, puis combine-les sur un même cas.'
 ],language:'bash',code:`python -m pip install numpy pandas matplotlib seaborn`,output:'Les quatre bibliothèques sont installées dans l’environnement Python actif.',interpretation:'Ne confonds pas l’installation du package avec son import dans les cellules du notebook.'},
 {id:'load',title:'Step 1: Load and Understand the Dataset',depth:1,pointIndex:1,visual:'pandas',paragraphs:[
   'Lis le fichier et vérifie immédiatement les dimensions, la signification des colonnes et les types. Le grain des données (ce que représente une ligne) doit être clairement défini avant d’effectuer des calculs.',
   'Dans cet exemple, une ligne représente une campagne marketing. Spend correspond aux dépenses de publicité et Revenue aux revenus observés.'
 ],language:'python',code:`import pandas as pd

df = pd.DataFrame({
    "Channel": ["Search","Social","Search","Email"],
    "Spend":   [120, 80, 180, 40],
    "Revenue": [210, 95, 285, 100]
})
print(df.shape)
print(df.head())`,output:'(4, 3) et un tableau de quatre campagnes.',interpretation:'Une ligne est une campagne et non un client. Les revenus ne sont pas automatiquement le profit.'},
 {id:'clean',title:'Step 2: Check Data Quality',depth:1,pointIndex:1,paragraphs:[
   'Recherche les valeurs absentes, identifiants répétés, formats incorrects et valeurs impossibles. Une donnée manquante doit être signalée puis traitée selon son sens métier.',
   'Ces contrôles sont plus utiles qu’une suppression automatique des lignes jugées problématiques.'
 ],language:'python',code:`print("Valeurs manquantes :")
print(df.isna().sum())

print("Lignes exactement dupliquées :", df.duplicated().sum())
print("Types des colonnes :")
print(df.dtypes)`,output:'Zéro valeur manquante, zéro doublon exact, Spend et Revenue numériques.',interpretation:'Le diagnostic doit être refait chaque fois qu’un nouveau fichier arrive.'},
 {id:'summary',title:'Step 3: Descriptive Statistics with NumPy and Pandas',depth:1,pointIndex:0,paragraphs:[
   'La moyenne mesure un niveau moyen, la médiane décrit une valeur centrale plus robuste aux extrêmes et l’écart-type résume la dispersion. Compare plusieurs statistiques avant d’interpréter.',
   'Une distribution asymétrique ou une valeur extrême peut rendre la moyenne peu représentative de l’observation typique.'
 ],language:'python',code:`import numpy as np

print("Dépense moyenne :", df["Spend"].mean())
print("Revenu médian :", df["Revenue"].median())
print("Écart-type dépenses :", round(np.std(df["Spend"]), 2))`,output:'Dépense moyenne : 105.0 ; revenu médian : 155.0 ; écart-type calculé sur les quatre campagnes.',interpretation:'Ces statistiques résument quatre observations seulement : elles ne permettent pas de prédire les performances futures.'},
 {id:'univariate',title:'Step 4: Explore One Variable at a Time',depth:1,pointIndex:2,paragraphs:[
   'L’analyse univariée étudie une variable à la fois : sa répartition, ses valeurs extrêmes et sa dispersion. Un histogramme montre la fréquence des valeurs ; un boxplot facilite la recherche d’observations atypiques.',
   'Choisis des axes explicites et ne laisse pas l’échelle automatique masquer les différences.'
 ],language:'python',code:`import matplotlib.pyplot as plt

plt.hist(df["Revenue"], bins=4, edgecolor="black")
plt.title("Distribution des revenus")
plt.xlabel("Revenue (€)")
plt.ylabel("Nombre de campagnes")
plt.show()`,output:'Un histogramme de quatre revenus avec axes et unités.',interpretation:'La forme de l’histogramme dépend du nombre d’intervalles. Avec quatre observations, les conclusions restent limitées.'},
 {id:'bivariate',title:'Step 5: Compare Variables with Seaborn',depth:1,pointIndex:3,paragraphs:[
   'L’analyse bivariée étudie deux variables ensemble. Un nuage de points peut montrer si les campagnes qui dépensent davantage génèrent aussi des revenus plus élevés.',
   'Une relation observée n’est pas une causalité : d’autres facteurs comme la saison ou le canal peuvent agir sur les deux variables.'
 ],language:'python',code:`import seaborn as sns
import matplotlib.pyplot as plt

sns.scatterplot(data=df, x="Spend", y="Revenue", hue="Channel", s=90)
plt.title("Dépenses et revenus par campagne")
plt.xlabel("Dépenses (€)")
plt.ylabel("Revenus (€)")
plt.show()`,output:'Quatre points colorés selon le canal marketing.',interpretation:'Le graphique suggère une association, pas la preuve qu’augmenter le budget crée automatiquement plus de ventes.'},
 {id:'groups',title:'Step 6: Analyse Groups and Relationships',depth:1,pointIndex:4,paragraphs:[
   'GroupBy permet de répondre à des questions par catégorie. On peut comparer Search, Social et Email, mais il faut vérifier le nombre de campagnes dans chaque groupe.',
   'Une corrélation indique l’intensité d’une relation linéaire ; elle ne prouve pas une cause et peut dépendre fortement des valeurs extrêmes.'
 ],language:'python',code:`totaux = df.groupby("Channel")[["Spend","Revenue"]].sum()
totaux["ROAS"] = totaux["Revenue"] / totaux["Spend"]
print(totaux.round(2))`,output:'ROAS Search = 495 / 300 = 1,65 ; Social = 95 / 80 ≈ 1,19 ; Email = 100 / 40 = 2,50.',interpretation:'Le ROAS compare revenu et dépense publicitaire. Il ne tient pas compte de tous les coûts et n’est donc pas un taux de profit.'},
 {id:'interpret',title:'Step 7: Summarize Findings and Limitations',depth:1,pointIndex:5,paragraphs:[
   'Une bonne conclusion distingue les observations mesurées, les hypothèses possibles et les recommandations testables. Elle précise la période, le volume des données et les éventuelles limites de qualité.',
   'Présente une observation chiffrée, explique ce qu’elle peut signifier, puis propose une vérification. C’est ce qu’un tuteur attend dans un travail professionnel.'
 ],language:'python',code:`meilleur = totaux["ROAS"].idxmax()
print("Canal au ROAS observé le plus élevé :", meilleur)
print("Attention : comparaison limitée à quatre campagnes.")`,output:'Email est le canal avec le ROAS observé le plus élevé dans cet exemple.',interpretation:'Ne recommande pas immédiatement de déplacer tout le budget vers Email : l’échantillon est minuscule et les volumes très différents.'}
 ],
 mistakes:[
   'Interpréter une moyenne sans regarder la distribution et les extrêmes.',
   'Confondre corrélation et causalité.',
   'Supprimer les valeurs manquantes sans documenter leur origine.',
   'Oublier les unités, le périmètre et la période sur les graphiques.',
   'Fonder une recommandation catégorique sur trop peu d’observations.'
 ],
 conclusion:[
   'L’EDA est une méthode de compréhension des données, pas seulement une collection de graphiques. Elle combine qualité, statistiques, visualisation et raisonnement métier.',
   'Pour progresser, applique les mêmes sept étapes à un autre jeu de données : ventes, capteurs industriels ou interventions de maintenance, puis rédige une synthèse courte et vérifiable.'
 ],
 faq:[
   {question:'What is the purpose of EDA?',answer:'Comprendre un jeu de données, ses tendances, anomalies et limites avant de prendre une décision ou d’entraîner un modèle.'},
   {question:'Which Python libraries are used for EDA?',answer:'NumPy, Pandas, Matplotlib et Seaborn sont un ensemble courant pour les premières analyses.'},
   {question:'Is correlation the same as causation?',answer:'Non. Une corrélation mesure une association, pas le mécanisme qui la cause.'},
   {question:'What is the difference between univariate and bivariate analysis?',answer:'L’analyse univariée étudie une variable ; l’analyse bivariée examine une relation entre deux variables.'},
   {question:'How do I present my EDA professionally?',answer:'Définis la question, décris les données, montre les contrôles, présente des graphiques lisibles et sépare constats, hypothèses et recommandations.'}
 ]
};
