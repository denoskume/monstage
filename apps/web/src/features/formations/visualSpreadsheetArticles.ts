import type {CourseArticleData} from './courseArticleContent';

export const visualizationArticle:CourseArticleData={
 eyebrow:'DATA ANALYSIS · PYTHON',
 title:'Matplotlib, Seaborn and Plotly: A Beginner’s Guide',
 author:'MonStage Learning',
 intro:[
  'Un Data Analyst doit savoir communiquer ce que montrent les données. Les graphiques permettent de révéler une distribution, une tendance, une différence entre catégories ou une relation entre deux variables.',
  'Trois bibliothèques reviennent souvent : Matplotlib pour le contrôle précis des figures, Seaborn pour les représentations statistiques et Plotly pour l’exploration interactive.'
 ],
 tldr:[
  'Matplotlib fournit les bases des graphiques Python ; Seaborn utilise notamment les DataFrames pour représenter distributions et relations ; Plotly ajoute des interactions comme le survol et le zoom.',
  'Le choix du graphique dépend de la question : histogramme pour une distribution, courbe pour le temps, barres pour les catégories, scatter plot pour deux variables.',
  'Un bon visuel indique toujours les unités, axes, titres, périmètre et éventuelles limites.'
 ],
 sections:[
  {id:'what',title:'What is Data Visualization?',depth:1,pointIndex:0,paragraphs:['La visualisation transforme des chiffres en une représentation qui permet de répondre à une question. La figure doit être lisible sans une longue explication orale.','Avant de choisir une bibliothèque, définis le message : distribution, comparaison, évolution ou relation.']},
  {id:'install',title:'Installing Matplotlib, Seaborn and Plotly',depth:2,pointIndex:0,paragraphs:['Installe les trois bibliothèques dans le même environnement Python. Les exemples ci-dessous sont conçus pour Jupyter, mais s’exécutent aussi dans un script configuré pour afficher les figures.'],language:'bash',code:`python -m pip install pandas matplotlib seaborn plotly`,output:'Les dépendances de visualisation sont installées.',interpretation:'Dans le notebook, importe les modules au début des analyses et signale les versions si le résultat doit être reproduit.'},
  {id:'matplotlib',title:'What is Matplotlib?',depth:1,pointIndex:1,paragraphs:['Matplotlib offre des fonctions pour construire une figure, tracer des données, nommer les axes, définir des limites et enregistrer l’image.','Une courbe temporelle relie les mesures dans l’ordre des dates. Les axes et les unités doivent rester explicites.'],language:'python',code:`import matplotlib.pyplot as plt

jours = ["Lun","Mar","Mer","Jeu"]
production = [100, 115, 108, 127]

plt.plot(jours, production, marker="o")
plt.xlabel("Jour")
plt.ylabel("Pièces produites")
plt.title("Production quotidienne")
plt.show()`,output:'Une courbe de quatre observations, avec dates et unité de production.',interpretation:'La courbe permet de voir que la production augmente globalement, mais le contexte et la période restent indispensables.'},
  {id:'histogram',title:'Histograms and Boxplots',depth:1,pointIndex:0,paragraphs:['L’histogramme regroupe les valeurs numériques dans des intervalles et montre leur fréquence. Le boxplot résume la médiane et les quantiles et aide à repérer les observations atypiques.','Le nombre de bins influence l’apparence de l’histogramme. Il ne faut pas prendre une forme produite par un tout petit échantillon pour une règle générale.'],language:'python',code:`import matplotlib.pyplot as plt
valeurs = [12, 14, 14, 15, 16, 19, 35]

fig, axes = plt.subplots(1, 2, figsize=(8,3))
axes[0].hist(valeurs, bins=4, edgecolor="black")
axes[0].set_xlabel("Durée (min)")
axes[0].set_ylabel("Nombre")
axes[1].boxplot(valeurs)
axes[1].set_ylabel("Durée (min)")
plt.tight_layout()
plt.show()`,output:'Un histogramme et une boîte à moustaches pour les mêmes durées.',interpretation:'La valeur 35 paraît élevée par rapport aux autres valeurs, mais elle ne doit pas être supprimée sans examen métier.'},
  {id:'seaborn',title:'What is Seaborn?',depth:1,pointIndex:2,paragraphs:['Seaborn fournit des visualisations statistiques plus faciles à construire à partir des colonnes d’un DataFrame. Sa fonction scatterplot sert à comparer deux variables et éventuellement une catégorie de couleur.','Les points montrent une association, pas une preuve de causalité. Les axes décrivent des mesures, et la légende identifie les groupes.'],language:'python',code:`import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.DataFrame({
  "temperature":[20,25,28,30],
  "consommation":[10,13,16,17],
  "site":["A","A","B","B"]
})
sns.scatterplot(data=df,x="temperature",y="consommation",hue="site")
plt.xlabel("Température (°C)")
plt.ylabel("Consommation (kWh)")
plt.show()`,output:'Quatre points avec une légende distinguant les sites A et B.',interpretation:'Une tendance croissante apparaît dans cet échantillon, mais elle peut dépendre du site et d’autres variables.'},
  {id:'categories',title:'Bar Charts for Categories',depth:1,pointIndex:3,paragraphs:['Les barres sont adaptées pour comparer des catégories, des machines ou des sites. Contrairement à une courbe chronologique, les catégories ne possèdent pas nécessairement d’ordre naturel.'],language:'python',code:`import matplotlib.pyplot as plt
sites = ["Nantes","Paris","Lyon"]
arrets = [40,15,30]

plt.bar(sites, arrets)
plt.ylabel("Temps d’arrêt (minutes)")
plt.title("Temps d’arrêt cumulé par site")
plt.show()`,output:'Nantes 40 min, Paris 15 min et Lyon 30 min, avec une barre pour chaque site.',interpretation:'Ce graphique compare des totaux, mais il faut connaître la période et la taille du parc de machines avant de conclure.'},
  {id:'plotly',title:'Interactive Charts with Plotly',depth:1,pointIndex:5,paragraphs:['Plotly produit des graphiques interactifs qui permettent d’inspecter les points avec la souris, zoomer et parfois sélectionner des observations.','L’interactivité facilite l’exploration, mais ne remplace pas l’écriture de titres, d’axes et de critères d’analyse.'],language:'python',code:`import pandas as pd
import plotly.express as px

df = pd.DataFrame({
  "mois":["Jan","Fév","Mar"],
  "ventes":[100,125,118]
})
fig = px.line(df,x="mois",y="ventes",markers=True,
              title="Évolution des ventes")
fig.update_yaxes(title="Ventes (€)")
fig.show()`,output:'Une courbe interactive sur trois mois avec valeurs consultables au survol.',interpretation:'Le zoom et le survol servent à explorer ; le rapport final doit expliquer les tendances et leurs limites.'},
  {id:'goodpractice',title:'Common Visualization Best Practices',depth:1,pointIndex:4,paragraphs:['Donne à la figure un titre explicite, nomme les axes, ajoute les unités, choisis une échelle cohérente et évite les couleurs décoratives sans sens.','Pour comparer deux séries, vérifie qu’elles portent sur la même période et des unités comparables. Utilise des annotations uniquement lorsqu’elles apportent une information utile.']}
 ],
 mistakes:[
  'Tracer une courbe pour des catégories sans ordre temporel.',
  'Oublier les unités et les titres des axes.',
  'Employer des échelles différentes pour comparer deux valeurs.',
  'Interpréter un graphique construit sur un échantillon trop petit.',
  'Confondre une association visuelle et une relation causale.'
 ],
 conclusion:['Matplotlib, Seaborn et Plotly ne sont pas interchangeables dans toutes les situations, mais ils se complètent. Apprends d’abord à choisir le bon type de graphique pour la question.','Ton exercice final consiste à produire quatre figures à partir du même tableau et à expliquer quelle question chacune permet de résoudre.'],
 faq:[
  {question:'What is Matplotlib used for?',answer:'Créer des figures et contrôler les axes, légendes, titres et styles.'},
  {question:'What is Seaborn used for?',answer:'Créer rapidement des graphiques statistiques fondés notamment sur les DataFrames Pandas.'},
  {question:'What is Plotly used for?',answer:'Construire des graphiques interactifs pour explorer les valeurs et tendances.'},
  {question:'Which chart should I choose?',answer:'Histogramme : distribution ; courbe : temps ; barres : catégories ; scatter plot : relation entre deux variables.'}
 ]
};

export const spreadsheetArticle:CourseArticleData={
 eyebrow:'DATA ANALYSIS · EXCEL / GOOGLE SHEETS',
 title:'Excel and Google Sheets for Data Analysis: A Beginner’s Guide',
 author:'MonStage Learning',
 intro:[
  'Les tableurs restent très utilisés pour organiser des fichiers métier, contrôler des mesures et produire une première analyse. Excel et Google Sheets combinent cellules, formules, tableaux et filtres dans une interface accessible.',
  'Ce cours apprend à comprendre les types de cellules, filtrer des lignes, écrire des formules, construire un tableau croisé dynamique et éviter les erreurs de références.'
 ],
 tldr:[
  'Une feuille de calcul organise les données en lignes et colonnes. Une cellule peut être une valeur fixe ou une formule.',
  'Les fonctions SOMME, MOYENNE, SI, NB.SI, SOMME.SI.ENS et RECHERCHEX permettent de répondre rapidement à des questions simples.',
  'Une analyse fiable commence par des données structurées et des références correctes, puis vérifie les totaux après chaque transformation.'
 ],
 sections:[
  {id:'what',title:'What is a Spreadsheet?',depth:1,pointIndex:0,paragraphs:['Un tableur contient des cellules identifiées par une colonne et une ligne, par exemple B2. Un tableau métier doit avoir des colonnes cohérentes et une ligne par observation.','Les filtres masquent temporairement des lignes, tandis que les tris changent leur ordre. Ils n’effacent pas les données source.']},
  {id:'types',title:'Understanding Cells, Types and Filters',depth:1,pointIndex:0,paragraphs:['Un nombre n’est pas équivalent à une chaîne de caractères contenant des chiffres. Les dates et formats doivent aussi être cohérents pour que les sommes, les filtres et les tris donnent des résultats corrects.'],language:'text',code:`Colonne A : Site      Colonne B : Ventes
A2 : Nantes           B2 : 100
A3 : Paris            B3 : 150
A4 : Nantes           B4 : 80`,output:'Trois observations, deux sites distincts.',interpretation:'Chaque ligne est ici une vente. Un même site peut donc apparaître plusieurs fois.'},
  {id:'formulas',title:'SUM, AVERAGE, IF and COUNTIF',depth:1,pointIndex:1,paragraphs:['Une formule commence par = et utilise des références à des cellules. SOMME additionne, MOYENNE résume un groupe, SI renvoie un résultat selon une condition et NB.SI compte les cellules qui respectent un critère.'],language:'excel',code:`=SOMME(B2:B4)
=MOYENNE(B2:B4)
=SI(B2>=100;"Objectif atteint";"À suivre")
=NB.SI(A2:A4;"Nantes")`,output:'Somme 330 ; moyenne 110 ; objectif atteint pour B2 ; deux lignes Nantes.',interpretation:'Les séparateurs d’arguments varient avec la langue et les paramètres du tableur.'},
  {id:'conditional',title:'SUMIFS and XLOOKUP',depth:1,pointIndex:2,paragraphs:['SOMME.SI.ENS additionne selon plusieurs critères. RECHERCHEX rapproche une valeur d’une table de référence, par exemple un identifiant machine et son site.'],language:'excel',code:`=SOMME.SI.ENS(B2:B4;A2:A4;"Nantes")
=RECHERCHEX(D2;TableMachines[ID];TableMachines[Site])`,output:'La somme des ventes Nantes vaut 180 ; la deuxième formule renvoie le site de l’identifiant situé en D2, selon la table de référence.',interpretation:'Le résultat de RECHERCHEX dépend des lignes effectivement présentes dans TableMachines.'},
  {id:'references',title:'Absolute References and Formula Errors',depth:1,pointIndex:3,paragraphs:['Une référence relative comme B2 se décale lors de la recopie. Une référence absolue comme $F$1 reste fixée. Ce choix est essentiel lorsque l’on applique une même hypothèse ou un même taux à de nombreuses lignes.'],language:'excel',code:`=B2*$F$1

# En recopiant la formule vers la ligne suivante :
=B3*$F$1`,output:'La valeur de B change de ligne, tandis que le taux défini en F1 reste fixe.',interpretation:'Une référence mal fixée peut produire une colonne entière de calculs faux mais plausibles.'},
  {id:'pivot',title:'Pivot Tables for Analysis',depth:1,pointIndex:4,paragraphs:['Un tableau croisé dynamique regroupe les données selon des champs choisis. Il permet d’afficher une somme de ventes par magasin ou une moyenne de panne par machine sans écrire de longues formules.'],language:'text',code:`1. Sélectionner une table structurée.
2. Insérer → Tableau croisé dynamique.
3. Lignes : Site.
4. Valeurs : Somme de Ventes.
5. Vérifier le total général avec la source.`,output:'Nantes : 180 ; Paris : 150 ; total général : 330.',interpretation:'Le tableau croisé agrège les lignes. Vérifie la fonction de calcul utilisée : somme, moyenne ou compte.'},
  {id:'quality',title:'Formatting, Data Validation and Checking Totals',depth:1,pointIndex:5,paragraphs:['La mise en forme conditionnelle aide à repérer une valeur anormale, mais ne corrige pas les données. La validation des cellules peut limiter les entrées incorrectes.','Toujours comparer les sommes et le nombre de lignes à la source avant de transmettre un fichier à un tuteur.']}
 ],
 mistakes:[
  'Conserver des nombres importés au format texte.',
  'Recopier une formule avec une référence absolue ou relative incorrecte.',
  'Oublier d’actualiser un tableau croisé après ajout de lignes.',
  'Confondre une ligne de commande et un client unique.',
  'Masquer ou supprimer des données sans conserver l’original.'
 ],
 conclusion:['Excel et Google Sheets conviennent à de nombreuses analyses initiales, à condition de travailler avec des données structurées et des formules vérifiées.','Tu pourras ensuite utiliser SQL et Pandas lorsque le volume, la complexité ou la reproductibilité nécessitent un traitement plus automatisé.'],
 faq:[
  {question:'Do I need Excel as a Data Analyst?',answer:'Il est utile de savoir structurer, filtrer, calculer et vérifier des données dans un tableur.'},
  {question:'What is a pivot table?',answer:'Un outil de regroupement pour produire des sommes, moyennes et comptes par catégorie.'},
  {question:'What is the difference between relative and absolute references?',answer:'Une référence relative se décale à la recopie ; une référence absolue reste fixe.'},
  {question:'When should I use Python instead of Excel?',answer:'Lorsque les transformations sont nombreuses, répétitives, volumineuses ou doivent être testées et versionnées.'}
 ]
};
