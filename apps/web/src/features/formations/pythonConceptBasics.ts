import type {DeepConceptArticle} from './deepConceptTypes';
export const pythonConceptBasics:DeepConceptArticle[] = [
  {
    "slug": "python-introduction",
    "pointIndex": 0,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "What is Python? A Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Python est un langage de programmation lisible qui permet de décrire des calculs, d'automatiser des tâches et de manipuler des données. Il est utilisé dans l'analyse de données, le traitement d'images, la recherche scientifique et de nombreuses applications professionnelles.",
        "Ce cours part d'un programme de quelques lignes et explique comment Python l'exécute. Tu vas distinguer langage, interpréteur, bibliothèque, script et notebook avant de construire un premier traitement de mesures."
      ],
      "tldr": [
        "Python décrit une suite d'instructions exécutées par un interpréteur. Les variables gardent des valeurs, les fonctions regroupent les calculs et les bibliothèques apportent des outils prêts à utiliser.",
        "Pour l'analyse de données, l'ordre naturel est : découvrir les données → vérifier les valeurs → calculer → visualiser → interpréter.",
        "À l'issue de l'article, tu sauras écrire un script élémentaire, lire une erreur et expliquer l'utilisation de Python dans une mission professionnelle."
      ],
      "sections": [
        {
          "id": "language",
          "title": "Python: un langage, pas un logiciel de graphique",
          "paragraphs": [
            "Un langage de programmation est une manière précise de décrire des instructions qu'un ordinateur peut exécuter. Python utilise des mots-clés tels que if, for et def, ainsi que des valeurs, des opérations et des appels de fonctions.",
            "On écrit les instructions dans un fichier .py ou une cellule Jupyter. L'interpréteur Python lit le code, produit les résultats et affiche des erreurs si une instruction est invalide."
          ],
          "code": "# Un programme Python exécute les instructions dans l'ordre\nmachine = \"M1\"\ntemperature = 72.5\nprint(\"Machine :\", machine)\nprint(\"Température :\", temperature)",
          "language": "python",
          "output": "Machine : M1\nTempérature : 72.5",
          "interpretation": "Les deux variables contiennent les données du capteur. print permet d'observer les valeurs mais ne les enregistre pas dans un fichier."
        },
        {
          "id": "runtime",
          "title": "Interpréteur, script et notebook",
          "paragraphs": [
            "Le programme python --version indique l'interpréteur accessible depuis le terminal. Un fichier analyse.py peut être exécuté avec python analyse.py. Un notebook .ipynb découpe le travail en cellules exécutables et en notes Markdown.",
            "Dans un notebook, les cellules peuvent être lancées dans le désordre : elles partagent cependant l'état du noyau Python. Une analyse professionnelle doit pouvoir être relancée proprement du début à la fin."
          ],
          "code": "# Fichier analyse.py ou cellule Jupyter\nvaleurs = [10, 15, 25]\ntotal = sum(valeurs)\nprint(\"Total :\", total)",
          "language": "python",
          "output": "Total : 50",
          "interpretation": "Dans un script, les lignes sont exécutées de haut en bas. Dans Jupyter, exécute d'abord la cellule qui définit valeurs."
        },
        {
          "id": "libraries",
          "title": "Différence entre Python et une bibliothèque",
          "paragraphs": [
            "La bibliothèque standard fournit notamment csv, json, math, statistics et pathlib sans installation supplémentaire. Les bibliothèques tierces NumPy, Pandas, Matplotlib et OpenCV s'installent séparément.",
            "On importe un module avec import ou from ... import .... Le module ajoute des fonctions adaptées à un besoin précis : calcul de moyenne, lecture de fichiers ou traitement d'images."
          ],
          "code": "import statistics\ntemps_arret = [10, 15, 25]\nprint(statistics.mean(temps_arret))\nprint(statistics.median(temps_arret))",
          "language": "python",
          "output": "16.666666666666668\n15",
          "interpretation": "La moyenne et la médiane sont deux statistiques différentes. La médiane est ici la valeur centrale du groupe trié."
        },
        {
          "id": "pipeline",
          "title": "Le déroulement d'une analyse de données",
          "paragraphs": [
            "Une analyse ne commence pas par un modèle d'intelligence artificielle. Elle commence par une question métier : par exemple « quelle machine cumule le plus d'arrêts ? ». Il faut alors définir les mesures, les unités et la période d'observation.",
            "Le code ne remplace pas le raisonnement. Il sert à effectuer une opération reproductible, puis un humain vérifie que la conclusion est compatible avec les données utilisées."
          ],
          "code": "arrets = {\"M1\": [10, 25, 5], \"M2\": [15]}\ntotaux = {machine: sum(durees)\n          for machine, durees in arrets.items()}\nprint(totaux)\nprint(\"À examiner :\", max(totaux, key=totaux.get))",
          "language": "python",
          "output": "{'M1': 40, 'M2': 15}\nÀ examiner : M1",
          "interpretation": "M1 cumule davantage de minutes sur cet exemple. Il faudrait les heures d'utilisation pour comparer réellement la fiabilité des machines."
        },
        {
          "id": "first-program",
          "title": "Construire un premier programme vérifiable",
          "paragraphs": [
            "Un programme fiable ne doit pas simplement produire un chiffre. Il doit expliciter ce qu'il représente et vérifier que les valeurs reçues sont possibles. Ici, un taux d'alerte compte les mesures dépassant un seuil.",
            "Les valeurs du jeu d'exemple sont volontairement petites : tu peux recalculer chaque étape à la main et vérifier que la sortie de Python correspond au résultat prévu."
          ],
          "code": "temperatures = [65, 82, 74, 90]\nseuil = 80\nalertes = sum(t > seuil for t in temperatures)\ntaux = 100 * alertes / len(temperatures)\nprint(f\"Alertes : {alertes}/{len(temperatures)}\")\nprint(f\"Taux : {taux:.1f} %\")",
          "language": "python",
          "output": "Alertes : 2/4\nTaux : 50.0 %",
          "interpretation": "L'expression t > seuil vaut True ou False. sum compte les True ; le taux utilise le nombre total de mesures comme dénominateur."
        },
        {
          "id": "practice",
          "title": "Mini-exercice: expliquer un résultat sans recopier",
          "paragraphs": [
            "Refais le programme précédent avec les valeurs 70, 85, 95 et le seuil 90. Avant de l'exécuter, écris le nombre d'alertes et leur pourcentage sur papier.",
            "Ensuite, ajoute un contrôle pour éviter de diviser par zéro si le tableau de mesures est vide. Cette vérification montre pourquoi la logique métier est aussi importante que la syntaxe."
          ],
          "code": "mesures = [70, 85, 95]\nseuil = 90\nnombre = sum(v > seuil for v in mesures)\npourcentage = (100 * nombre / len(mesures)) if mesures else None\nprint(nombre, pourcentage)",
          "language": "python",
          "output": "1 33.333333333333336",
          "interpretation": "Une seule mesure dépasse 90. Dans un rapport, arrondis si nécessaire et précise qu'il s'agit de trois mesures."
        }
      ],
      "mistakes": [
        "Confondre Python avec Pandas : Pandas est une bibliothèque utilisée depuis Python, pas un langage distinct.",
        "Exécuter des cellules Jupyter hors ordre puis oublier qu'elles dépendent de variables créées plus tôt.",
        "Lire une sortie numérique sans connaître son unité ni le dénominateur utilisé.",
        "Réutiliser un nom de fichier python.py ou pandas.py pouvant masquer un module à importer.",
        "Conclure sur la fiabilité d'une machine sans rapporter la durée d'arrêt aux heures de fonctionnement."
      ],
      "conclusion": [
        "Python constitue le langage commun des opérations que tu vas réutiliser avec NumPy et Pandas. Tu sais maintenant distinguer le langage, son interpréteur et les bibliothèques, puis expliquer la sortie d'un programme court.",
        "La prochaine étape consiste à maîtriser les variables et les types de données : ils déterminent ce que chaque instruction peut faire correctement."
      ],
      "faq": [
        {
          "question": "Dois-je connaître toutes les commandes Python ?",
          "answer": "Non. Commence avec les structures essentielles et apprends à retrouver la documentation des outils au moment où tu en as besoin."
        },
        {
          "question": "Quelle différence entre Python et Jupyter ?",
          "answer": "Python exécute les instructions ; Jupyter est un environnement de travail qui permet de lancer et documenter des cellules Python."
        },
        {
          "question": "Python est-il réservé aux Data Analysts ?",
          "answer": "Non. Il est également utilisé en traitement d'images, automatisation, backend et recherche scientifique."
        },
        {
          "question": "Pourquoi un script peut-il fonctionner dans Jupyter mais pas depuis le terminal ?",
          "answer": "Une cellule précédente peut avoir défini une variable ou une dépendance qui n'est pas disponible lorsque le script repart de zéro."
        },
        {
          "question": "Comment vérifier qu'un exemple est compris ?",
          "answer": "Recalcule la sortie manuellement, modifie une entrée et justifie précisément pourquoi la sortie change."
        }
      ]
    }
  },
  {
    "slug": "jupyter-notebook",
    "pointIndex": 0,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Jupyter Notebook and Markdown Cells: A Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Jupyter Notebook combine du code Python exécutable, des textes explicatifs, des tableaux et des graphiques dans un même document. Cette structure est particulièrement adaptée à l'analyse de données parce qu'elle rend le raisonnement inspectable.",
        "Dans ce cours tu vas créer un notebook, distinguer les cellules Markdown et Python, comprendre l'ordre d'exécution et apprendre à rendre un carnet lisible pour un tuteur."
      ],
      "tldr": [
        "Un notebook est un document .ipynb composé de cellules. Le noyau Python garde les variables et exécute les cellules de code ; les cellules Markdown expliquent le contexte.",
        "Une cellule exécutée peut modifier l'état partagé du notebook. L'ordre de lancement doit donc être maîtrisé pour obtenir des résultats reproductibles.",
        "Une bonne analyse est un enchaînement question → préparation → calcul → graphique → interprétation, pas une accumulation de cellules."
      ],
      "sections": [
        {
          "id": "install",
          "title": "Installer et ouvrir JupyterLab",
          "paragraphs": [
            "Dans un terminal, vérifie l'installation Python puis installe jupyterlab dans le même environnement que les bibliothèques utilisées. La commande jupyter lab ouvre une interface dans le navigateur et te permet de créer un carnet.",
            "Le noyau choisi dans le menu doit correspondre à l'environnement Python dans lequel tu as installé Pandas et NumPy. Sinon, import pandas peut échouer malgré une installation réalisée ailleurs."
          ],
          "code": "# Commandes à exécuter dans un terminal, pas dans une cellule Python :\n# python --version\n# python -m pip install jupyterlab pandas numpy\n# jupyter lab\nprint(\"Le noyau Python fonctionne\")",
          "language": "python",
          "output": "Le noyau Python fonctionne",
          "interpretation": "Les commentaires rappellent l'installation à effectuer dans le terminal. La dernière ligne confirme l'exécution de Python dans le notebook."
        },
        {
          "id": "cells",
          "title": "Cellule de code et cellule Markdown",
          "paragraphs": [
            "Une cellule de code calcule ou produit des sorties. Une cellule Markdown utilise des titres, du texte, des listes et éventuellement des formules pour expliquer l'objectif, la méthode et les observations.",
            "Dans un rapport professionnel, chaque série de calculs doit être précédée de son intention. Une cellule contenant simplement df.head() sans explication ne renseigne pas le lecteur sur ce que tu souhaites vérifier."
          ],
          "code": "# Exemple de cellule Python\ncapteurs = [20, 25, 30]\nmoyenne = sum(capteurs) / len(capteurs)\nprint(f\"Température moyenne : {moyenne:.1f} °C\")",
          "language": "python",
          "output": "Température moyenne : 25.0 °C",
          "interpretation": "La cellule Markdown qui la précède pourrait porter le titre « Calcul de la température moyenne » et définir la période étudiée."
        },
        {
          "id": "kernel",
          "title": "Comprendre l'état du noyau et l'ordre d'exécution",
          "paragraphs": [
            "Le noyau conserve les variables définies dans les cellules déjà exécutées. Il est donc possible de lire une valeur obsolète si une cellule a été modifiée sans être relancée.",
            "Pour vérifier la reproductibilité, redémarre le noyau et relance toutes les cellules dans l'ordre. Une cellule qui dépend d'un état caché échouera et indiquera une dépendance à corriger."
          ],
          "code": "# Cellule 1\nmesures = [10, 20, 30]\n\n# Cellule 2 (à exécuter après la cellule 1)\nresultat = sum(mesures)\nprint(resultat)",
          "language": "python",
          "output": "60",
          "interpretation": "Sans l'exécution préalable de la première cellule, mesures n'existe pas et une NameError est levée."
        },
        {
          "id": "outputs",
          "title": "Afficher une figure et expliquer la sortie",
          "paragraphs": [
            "Les sorties d'un notebook peuvent être du texte, des tableaux ou des graphiques. Une figure n'est pas un résultat complet si ses axes, son unité et son contexte sont absents.",
            "Une cellule Markdown placée après le graphique doit dire ce qu'on observe effectivement et ce qu'on ne peut pas conclure. Cela facilite la revue par un collègue."
          ],
          "code": "import matplotlib.pyplot as plt\njours = [1, 2, 3]\nproduction = [20, 25, 22]\nplt.plot(jours, production, marker=\"o\")\nplt.xlabel(\"Jour\")\nplt.ylabel(\"Pièces produites\")\nplt.title(\"Production observée\")\nplt.show()",
          "language": "python",
          "output": "Une courbe à trois points : 20, 25 et 22 pièces.",
          "interpretation": "Le jour 2 présente la valeur la plus élevée parmi les trois observations ; cela ne décrit pas toute la production de l'usine."
        },
        {
          "id": "reproducibility",
          "title": "Pratiques de carnet professionnel",
          "paragraphs": [
            "Indique les bibliothèques utilisées, les sources, les paramètres et la période. Conserve les cellules exécutables en ordre linéaire et évite d'inclure des informations confidentielles dans le notebook.",
            "Avant de transmettre un carnet, relance-le entièrement, vérifie les totaux et supprime les sorties inutiles. Sauvegarde le notebook dans Git en évitant les données personnelles."
          ],
          "code": "import sys\nimport pandas as pd\nprint(\"Python :\", sys.version_info.major, sys.version_info.minor)\nprint(\"Pandas :\", pd.__version__)",
          "language": "python",
          "output": "Les versions de Python et Pandas réellement utilisées s'affichent.",
          "interpretation": "Ces informations aident un collègue à reproduire le travail si les comportements varient selon les environnements."
        },
        {
          "id": "exercise",
          "title": "Exercice : un carnet de cinq cellules",
          "paragraphs": [
            "Crée dans cet ordre une cellule Markdown intitulée « Objectif », une cellule de données, une cellule de calcul, une cellule graphique et une cellule Markdown d'interprétation. La dernière cellule doit inclure une limite du jeu de données.",
            "Redémarre puis exécute tout le notebook pour vérifier qu'aucune variable n'est manquante. Fais relire la conclusion sans montrer le code : elle doit rester compréhensible."
          ],
          "code": "mesures = [5, 7, 6, 10]\ntotal = sum(mesures)\nprint(f\"Quatre mesures, total = {total}\")",
          "language": "python",
          "output": "Quatre mesures, total = 28",
          "interpretation": "L'exemple est volontairement autonome : remplace les mesures par un tableau lié à ton propre mini-projet."
        }
      ],
      "mistakes": [
        "Exécuter les cellules dans un ordre non documenté.",
        "Installer une bibliothèque dans un environnement différent de celui du noyau sélectionné.",
        "Présenter des figures sans axes ni unités.",
        "Partager des données sensibles dans les sorties enregistrées du notebook.",
        "Confondre le nombre affiché après In [ ] avec un ordre d'exécution garanti lors d'une prochaine ouverture."
      ],
      "conclusion": [
        "Le notebook est à la fois un environnement de code et un document de travail vérifiable. Les cellules Markdown donnent le contexte ; les cellules Python effectuent les calculs ; l'interprétation rend les résultats utiles.",
        "Tu peux maintenant commencer des analyses simples et apprendre les variables et les types de données dans des notebooks structurés."
      ],
      "faq": [
        {
          "question": "Pourquoi utiliser Markdown ?",
          "answer": "Pour expliquer une question métier, une hypothèse, la méthode et la signification des sorties."
        },
        {
          "question": "Que fait Restart Kernel ?",
          "answer": "Il efface l'état Python en mémoire ; les variables devront être recréées en exécutant les cellules."
        },
        {
          "question": "Les notebooks remplacent-ils les scripts Python ?",
          "answer": "Non. Les notebooks facilitent l'exploration ; les scripts et fonctions modulaires conviennent mieux à certaines tâches reproductibles et automatisées."
        },
        {
          "question": "Pourquoi mon import fonctionne-t-il dans un terminal mais pas dans Jupyter ?",
          "answer": "Le noyau du notebook peut utiliser un autre environnement Python."
        },
        {
          "question": "Comment préparer un notebook pour un tuteur ?",
          "answer": "Inclure objectif, données, calculs, contrôles, graphiques lisibles et limites, puis vérifier une exécution intégrale."
        }
      ]
    }
  },
  {
    "slug": "python-variables",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Variables in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une variable est un nom qui permet de retrouver une valeur pendant l'exécution d'un programme. Dans l'analyse de données, elle peut désigner une mesure, un nom de machine, un seuil ou le résultat d'un calcul.",
        "Comprendre les variables évite les erreurs élémentaires dans Pandas, NumPy et OpenCV : tu vas apprendre l'affectation, les conventions de nommage, la réaffectation, le lien entre nom et objet et les cas d'usage métier."
      ],
      "tldr": [
        "On crée une variable avec le signe = : temperature = 72.5. On peut ensuite la lire, la modifier et l'utiliser dans un calcul.",
        "Un nom clair indique le rôle, l'unité ou le périmètre d'une valeur. Python est sensible aux majuscules et ne permet pas certains identifiants.",
        "Les objets mutables comme les listes peuvent être partagés entre plusieurs noms : modifier le contenu d'un objet partagé peut affecter les deux variables."
      ],
      "sections": [
        {
          "id": "definition",
          "title": "What is a Variable in Python?",
          "paragraphs": [
            "Une variable donne un nom à un objet. L'instruction temperature = 72.5 associe le nom temperature à une valeur décimale. Python n'exige pas de déclaration de type avant l'affectation.",
            "Dans les projets Data Analyst, des noms comme temps_arret_minutes ou nombre_pannes sont préférables à x ou valeur1 : ils donnent du sens à un calcul sans devoir relire tout le contexte."
          ],
          "code": "temperature = 72.5\nmachine = \"M1\"\nnombre_mesures = 3\nprint(machine, temperature, nombre_mesures)",
          "language": "python",
          "output": "M1 72.5 3",
          "interpretation": "Chaque nom donne accès à une valeur. Le fait d'utiliser trois types différents n'exige pas trois syntaxes de déclaration."
        },
        {
          "id": "assignment",
          "title": "Assignment and Reassignment",
          "paragraphs": [
            "Le signe = signifie affecter une valeur et non tester une égalité. Pour comparer deux valeurs, on utilise ==. Le code s'exécute de haut en bas : une affectation ultérieure remplace la liaison précédente du nom.",
            "Une variable peut changer de type, mais cela complique la lecture d'un pipeline. Évite par exemple de remplacer une mesure numérique par une chaîne de texte sans nécessité."
          ],
          "code": "temperature = 70\ntemperature = temperature + 5\nprint(temperature)\nprint(temperature == 75)",
          "language": "python",
          "output": "75\nTrue",
          "interpretation": "La deuxième ligne lit l'ancienne valeur 70, ajoute 5 puis réaffecte temperature. La comparaison renvoie un booléen."
        },
        {
          "id": "naming",
          "title": "Python Variable Naming Rules and Conventions",
          "paragraphs": [
            "Un identifiant peut contenir des lettres, des chiffres (pas en première position) et le caractère _. Les mots réservés comme if ou for ne peuvent pas être utilisés comme noms.",
            "En Python, la convention snake_case sépare les mots par des underscores. Préfère duree_arret_min plutôt que DAM ou A ; ce nom reste compréhensible lors d'une revue par un collègue."
          ],
          "code": "duree_arret_min = 25\nnombre_pannes = 4\nsite_nantes = True\nprint(duree_arret_min * nombre_pannes)",
          "language": "python",
          "output": "100",
          "interpretation": "Les noms sont valides et expressifs. L'exemple multiplie deux valeurs, mais le sens métier dépend de ce qu'elles représentent."
        },
        {
          "id": "multiple",
          "title": "Multiple Assignment and Unpacking",
          "paragraphs": [
            "Python permet d'affecter plusieurs valeurs simultanément avec le déballage (unpacking). Cette notation est utile pour lire un enregistrement, des coordonnées ou plusieurs résultats d'une fonction.",
            "Le nombre d'éléments à gauche doit correspondre au nombre de valeurs à droite. Tu peux aussi utiliser l'échange a, b = b, a, sans variable temporaire."
          ],
          "code": "machine, temperature, unite = \"M2\", 68, \"°C\"\nprint(machine)\nprint(temperature, unite)",
          "language": "python",
          "output": "M2\n68 °C",
          "interpretation": "La même instruction attribue trois valeurs à trois noms. Un déballage incorrect provoque ValueError."
        },
        {
          "id": "references",
          "title": "Mutable Objects and Shared References",
          "paragraphs": [
            "Il est important de distinguer la variable d'un objet modifiable. Deux noms peuvent désigner la même liste : une modification par l'un devient visible par l'autre. Cette situation apparaît fréquemment dans les opérations sur tableaux et dictionnaires.",
            "Pour obtenir une copie indépendante d'une liste simple, utilise copy(). Pour les tableaux NumPy, vérifie également la différence entre copie et vue."
          ],
          "code": "mesures = [10, 20]\ncopie_nom = mesures\ncopie_nom.append(30)\nprint(mesures)\n\ncopie_independante = mesures.copy()\ncopie_independante.append(40)\nprint(mesures)",
          "language": "python",
          "output": "[10, 20, 30]\n[10, 20, 30]",
          "interpretation": "copie_nom désigne la même liste que mesures. copie_independante contient un nouveau conteneur : l'ajout de 40 n'affecte pas mesures."
        },
        {
          "id": "scope",
          "title": "Where Does a Variable Exist?",
          "paragraphs": [
            "Une variable définie dans une fonction appartient normalement à son espace local. Cela évite qu'un calcul interne modifie involontairement un nom extérieur et facilite le test des fonctions.",
            "Évite de multiplier les variables globales dans un projet d'analyse. Transmets plutôt les paramètres nécessaires à une fonction et récupère son résultat avec return."
          ],
          "code": "seuil = 80\n\ndef compter_alertes(valeurs):\n    nombre = sum(v > seuil for v in valeurs)\n    return nombre\n\nprint(compter_alertes([70, 82, 90]))",
          "language": "python",
          "output": "2",
          "interpretation": "nombre n'est accessible qu'à l'intérieur de compter_alertes. Cette fonction utilise ici seuil global ; une version plus robuste le passerait explicitement en paramètre."
        },
        {
          "id": "case",
          "title": "Professional Example: Readable KPI Variables",
          "paragraphs": [
            "Supposons qu'une équipe de maintenance souhaite afficher la part des mesures dépassant un seuil. Les noms doivent permettre de reconnaître le numérateur, le dénominateur et l'unité.",
            "Le calcul doit prévoir le cas où aucune mesure n'a été reçue : une division par zéro ne constitue pas une valeur KPI valide."
          ],
          "code": "temperatures_c = [72, 84, 91, 77]\nseuil_alerte_c = 80\nnombre_alertes = sum(t > seuil_alerte_c for t in temperatures_c)\nnombre_mesures = len(temperatures_c)\ntaux_alertes_pct = (\n    100 * nombre_alertes / nombre_mesures\n    if nombre_mesures else None\n)\nprint(nombre_alertes, taux_alertes_pct)",
          "language": "python",
          "output": "2 50.0",
          "interpretation": "Deux mesures sur quatre dépassent 80 °C. Le suffixe _pct évite de confondre 50 % avec la proportion 0.5."
        },
        {
          "id": "practice",
          "title": "Try It Yourself: Change Values and Predict",
          "paragraphs": [
            "Remplace 84 par 79 et annonce le nombre d'alertes avant d'exécuter. Change ensuite le seuil de 80 à 90. Compare les deux effets : une variation de donnée et une variation de règle métier.",
            "Explique pourquoi le calcul n'aurait plus de sens si tu mélangeais des températures exprimées en Fahrenheit et en Celsius dans la même liste sans conversion."
          ],
          "code": "temperatures_c = [72, 79, 91, 77]\nseuil_c = 80\nprint(sum(t > seuil_c for t in temperatures_c))\nseuil_c = 90\nprint(sum(t > seuil_c for t in temperatures_c))",
          "language": "python",
          "output": "1\n1",
          "interpretation": "Dans les deux cas, seule la valeur 91 dépasse le seuil. Teste d'autres valeurs pour observer la différence."
        }
      ],
      "mistakes": [
        "Utiliser = au lieu de == pour effectuer une comparaison.",
        "Réutiliser comme variable les noms built-in list, sum, max ou str, ce qui masque ces fonctions.",
        "Confondre deux variables pointant vers la même liste avec deux copies indépendantes.",
        "Donner des noms très courts qui masquent les unités et le sens du calcul.",
        "Supposer qu'une variable locale créée dans une fonction est accessible à l'extérieur."
      ],
      "conclusion": [
        "Tu sais désormais créer, nommer, modifier et lire une variable, et tu comprends la différence entre une valeur, un nom et une référence à un objet modifiable.",
        "Ces principes reviennent partout : colonnes Pandas, tableaux NumPy, paramètres OpenCV et variables de mesures industrielles. La prochaine notion est le type de données."
      ],
      "faq": [
        {
          "question": "What is a variable in Python?",
          "answer": "Un nom associé à un objet en mémoire pendant l'exécution du programme."
        },
        {
          "question": "Do I need to declare a variable type?",
          "answer": "Non. Python associe les valeurs à des objets typés au moment de l'exécution."
        },
        {
          "question": "What is the difference between = and ==?",
          "answer": "= réalise une affectation ; == vérifie une égalité et renvoie un booléen."
        },
        {
          "question": "Why does changing one list also change another variable?",
          "answer": "Les deux noms peuvent référencer le même objet mutable."
        },
        {
          "question": "What is snake_case?",
          "answer": "Une convention de nommage avec des mots minuscules séparés par des underscores, par exemple temps_arret_min."
        }
      ]
    }
  },
  {
    "slug": "python-data-types",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Data Types in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un type de données indique quel genre de valeur un programme manipule et quelles opérations sont valides. Un nombre, un texte, une date et une valeur manquante ne se traitent pas de la même manière.",
        "Ce guide explique les types essentiels de Python, les conversions, le comportement des nombres flottants, les booléens et les valeurs absentes. Tu verras aussi pourquoi ces choix influencent directement la qualité d'une analyse Pandas."
      ],
      "tldr": [
        "int sert aux entiers, float aux décimaux, str aux textes, bool aux conditions et None à l'absence de valeur Python.",
        "La fonction type permet d'inspecter une valeur ; int, float, str et bool convertissent certains types, mais une conversion peut échouer.",
        "Les colonnes importées d'un CSV commencent par des chaînes : il faut contrôler les types avant les calculs."
      ],
      "sections": [
        {
          "id": "int-float",
          "title": "Integers and Floating-point Numbers",
          "paragraphs": [
            "int représente les entiers comme 42 ou -3. float représente des valeurs décimales approximatives. L'opération / produit une division décimale ; // effectue une division entière arrondie vers le bas ; % donne le reste.",
            "Les flottants ne représentent pas exactement tous les nombres décimaux en base binaire : évite les comparaisons d'égalité exactes sur des résultats calculés. Pour certaines opérations monétaires, Decimal est plus approprié."
          ],
          "code": "pieces = 200               # int\ntemperature = 21.5         # float\nprint(type(pieces).__name__)\nprint(type(temperature).__name__)\nprint(7 / 2, 7 // 2, 7 % 2)",
          "language": "python",
          "output": "int\nfloat\n3.5 3 1",
          "interpretation": "Les opérations retournent différents résultats. La différence entre division et division entière devient importante lors du calcul d'un indicateur."
        },
        {
          "id": "strings",
          "title": "Text: Strings and String Methods",
          "paragraphs": [
            "str représente du texte, même si la chaîne contient uniquement des chiffres. On peut concaténer, découper et transformer les chaînes avec lower, strip, split et replace.",
            "Dans un fichier de données, les noms d'équipements ou les dates mal formatées arrivent fréquemment sous forme de texte. Une normalisation comme strip().upper() permet de réduire des variantes d'un même identifiant."
          ],
          "code": "code_machine = \"  m1  \"\nnormalise = code_machine.strip().upper()\ntexte_nombre = \"25\"\nprint(normalise)\nprint(type(texte_nombre).__name__)",
          "language": "python",
          "output": "M1\nstr",
          "interpretation": "La chaîne '25' n'est pas encore le nombre 25. strip retire les espaces de bord et upper met l'identifiant en majuscules."
        },
        {
          "id": "boolean",
          "title": "Boolean Values and Comparisons",
          "paragraphs": [
            "bool possède deux valeurs : True et False. Les expressions de comparaison (<, <=, >, >=, == et !=) produisent souvent des booléens. Ils sont utilisés pour les filtres, les contrôles et les conditions.",
            "Ne confonds pas un booléen False avec la valeur None. False signifie qu'une proposition est fausse ; None indique qu'aucune valeur n'a été fournie."
          ],
          "code": "temperature = 85\nseuil = 80\nalarme = temperature > seuil\nprint(alarme)\nprint(type(alarme).__name__)",
          "language": "python",
          "output": "True\nbool",
          "interpretation": "La mesure est au-dessus du seuil ; la variable alarme contient une réponse logique, non le texte 'True'."
        },
        {
          "id": "none",
          "title": "None and Missing Information",
          "paragraphs": [
            "None sert notamment à représenter une valeur indisponible. Ce n'est pas le nombre zéro : une température inconnue ne doit pas être interprétée comme 0 °C sans justification métier.",
            "Pour vérifier None, on utilise is None ou is not None. Dans Pandas, les valeurs manquantes possèdent aussi des représentations propres et se détectent avec isna."
          ],
          "code": "temperature = None\nif temperature is None:\n    print(\"Mesure inconnue\")\nelse:\n    print(\"Température :\", temperature)",
          "language": "python",
          "output": "Mesure inconnue",
          "interpretation": "La condition évite une comparaison numérique sur une valeur absente. Dans une série d'observations, on doit également mesurer le taux de données manquantes."
        },
        {
          "id": "conversions",
          "title": "Type Conversion: int(), float(), str(), bool()",
          "paragraphs": [
            "Une conversion transforme une valeur vers une représentation plus utile. int('12') fonctionne, float('12.5') fonctionne ; int('12.5') échoue car ce texte n'est pas un entier valide directement.",
            "La fonction bool possède des règles qui peuvent surprendre : bool('False') vaut True parce que la chaîne n'est pas vide. Les champs texte 'oui' et 'non' doivent être interprétés explicitement."
          ],
          "code": "print(int(\"12\"))\nprint(float(\"12.5\"))\nprint(str(42))\nprint(bool(\"False\"))",
          "language": "python",
          "output": "12\n12.5\n42\nTrue",
          "interpretation": "La dernière sortie rappelle qu'une chaîne non vide est truthy. Elle n'est pas convertie d'après son sens en langue naturelle."
        },
        {
          "id": "precision",
          "title": "Numeric Precision and Round-off Errors",
          "paragraphs": [
            "Les représentations flottantes approchent certains nombres décimaux : 0.1 + 0.2 peut afficher 0.30000000000000004. Pour tester l'égalité de résultats calculés, math.isclose est généralement plus approprié que ==.",
            "Il faut aussi distinguer arrondir pour l'affichage et arrondir dans les calculs : arrondir trop tôt peut cumuler des erreurs sur un grand nombre de lignes."
          ],
          "code": "import math\ntotal = 0.1 + 0.2\nprint(total)\nprint(total == 0.3)\nprint(math.isclose(total, 0.3))",
          "language": "python",
          "output": "0.30000000000000004\nFalse\nTrue",
          "interpretation": "Le résultat est proche de 0.3 mais n'est pas représenté exactement. isclose accepte une tolérance numérique."
        },
        {
          "id": "data-case",
          "title": "Professional Example: Convert CSV-like Values",
          "paragraphs": [
            "Les colonnes d'un CSV sont souvent lues d'abord comme des chaînes. Avant de calculer un KPI, transforme les valeurs selon la convention du fichier et prévois des erreurs de saisie.",
            "Dans un fichier français, une virgule décimale peut nécessiter une conversion spécifique. Dans un fichier international, les points décimaux sont courants. Le séparateur doit être documenté."
          ],
          "code": "lignes = [\"20.5\", \"21.0\", \"inconnu\", \"19.5\"]\nmesures = []\nfor texte in lignes:\n    try:\n        mesures.append(float(texte))\n    except ValueError:\n        print(\"Valeur non numérique :\", texte)\nprint(\"Mesures valides :\", len(mesures))\nprint(\"Moyenne :\", sum(mesures) / len(mesures))",
          "language": "python",
          "output": "Valeur non numérique : inconnu\nMesures valides : 3\nMoyenne : 20.333333333333332",
          "interpretation": "La moyenne se calcule sur trois mesures valides. Il faut signaler une valeur manquante sur quatre au lieu de la remplacer arbitrairement par zéro."
        },
        {
          "id": "exercise",
          "title": "Mini-project: Validate Sensor Measurements",
          "paragraphs": [
            "Ajoute une valeur négative ou une température supérieure à 150 °C à la liste précédente. Construis une règle de plage acceptable et distingue une valeur non numérique d'une valeur numérique mais aberrante.",
            "Calcule aussi le taux de mesures utilisables. Le nombre de mesures reçues doit rester le dénominateur, même lorsque certaines entrées sont écartées après contrôle."
          ],
          "code": "valeurs = [\"20.5\", \"21.0\", \"inconnu\", \"190\"]\nvalides = []\nfor txt in valeurs:\n    try:\n        valeur = float(txt)\n        if -20 <= valeur <= 120:\n            valides.append(valeur)\n    except ValueError:\n        pass\nprint(len(valides), len(valeurs))",
          "language": "python",
          "output": "2 4",
          "interpretation": "Deux valeurs sont utilisables sur quatre, soit 50 %. Une mesure '190' est numérique mais hors de la plage définie."
        }
      ],
      "mistakes": [
        "Penser qu'une chaîne '20' peut automatiquement être additionnée à un nombre 20.",
        "Supposer que bool('False') vaut False.",
        "Interpréter None comme 0.",
        "Comparer des flottants calculés avec == sans tolérance.",
        "Arrondir les données trop tôt puis utiliser ces valeurs tronquées dans les calculs."
      ],
      "conclusion": [
        "Tu sais identifier les types de données essentiels, expliquer leurs opérations et vérifier les conversions. Les types déterminent les calculs possibles et la fiabilité de leurs résultats.",
        "Applique ces contrôles dès l'import d'un fichier et avant de calculer des KPI, puis approfondis les collections Python : listes, tuples et dictionnaires."
      ],
      "faq": [
        {
          "question": "What are data types in Python?",
          "answer": "Des catégories d'objets comme int, float, str, bool et NoneType, qui déterminent leur comportement."
        },
        {
          "question": "What is the difference between int and float?",
          "answer": "int représente un entier ; float représente un nombre décimal approximatif."
        },
        {
          "question": "Why does float('abc') fail?",
          "answer": "Le texte ne correspond pas à la représentation d'un nombre décimal valide, ce qui déclenche ValueError."
        },
        {
          "question": "Is None the same as zero?",
          "answer": "Non. None indique l'absence de valeur Python tandis que 0 est un nombre connu."
        },
        {
          "question": "Why does bool('False') return True?",
          "answer": "Parce que Python considère toute chaîne non vide comme vraie en contexte booléen."
        }
      ]
    }
  },
  {
    "slug": "python-operators",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Operators and Expressions in Python: A Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un opérateur combine ou compare des valeurs : additionner une durée, tester un seuil ou réunir plusieurs conditions. Les calculs d'un Data Analyst utilisent constamment les opérateurs arithmétiques, logiques et de comparaison.",
        "Dans cet article, tu vas apprendre les symboles, leur priorité d'exécution et quelques cas d'erreur fréquents, puis les appliquer aux mesures d'un équipement."
      ],
      "tldr": [
        "Les opérateurs +, -, *, /, //, %, ** effectuent des calculs ; ==, !=, <, <=, > et >= comparent ; and, or et not combinent les conditions.",
        "Les parenthèses clarifient la priorité des opérations. Un test de seuil n'est fiable que si les unités et les valeurs de référence sont cohérentes.",
        "Un calcul peut échouer sur une valeur absente ou un dénominateur nul : vérifie les entrées avant de publier un KPI."
      ],
      "sections": [
        {
          "id": "arithmetic",
          "title": "Arithmetic Operators and Priority",
          "paragraphs": [
            "Python suit les priorités mathématiques habituelles : puissance, multiplication/division, puis addition/soustraction. Utilise les parenthèses pour rendre le calcul explicite à l'équipe.",
            "Les opérateurs // et % sont utiles pour découper une durée en heures et minutes, mais // arrondit vers le bas, y compris pour les nombres négatifs."
          ],
          "code": "minutes = 135\nheures = minutes // 60\nreste = minutes % 60\nprint(heures, reste)\nprint(2 + 3 * 4, (2 + 3) * 4)",
          "language": "python",
          "output": "2 15\n14 20",
          "interpretation": "135 minutes représentent 2 heures et 15 minutes. Les parenthèses changent le second calcul de 14 à 20."
        },
        {
          "id": "comparison",
          "title": "Comparison Operators",
          "paragraphs": [
            "Les opérateurs de comparaison produisent True ou False. == compare des valeurs ; = affecte une valeur. Pour définir une plage acceptable, Python permet également une comparaison chaînée.",
            "Il est indispensable de préciser si un seuil est strict (>) ou inclusif (>=). Cette différence modifie le nombre d'événements classés comme alertes."
          ],
          "code": "temperature = 80\nprint(temperature > 80)\nprint(temperature >= 80)\nprint(20 <= temperature <= 100)",
          "language": "python",
          "output": "False\nTrue\nTrue",
          "interpretation": "Le pixel ou capteur exactement égal à la limite ne dépasse pas la limite, mais satisfait un test inclusif."
        },
        {
          "id": "logic",
          "title": "Logical Operators: and, or and not",
          "paragraphs": [
            "and exige que deux conditions soient vraies, or accepte qu'au moins une soit vraie et not inverse la valeur logique. Ces opérateurs sont courants pour filtrer les lignes selon plusieurs critères.",
            "Attention : or n'est pas un remplacement de and dans un contrôle de plage. La condition temperature >= 0 or temperature <= 100 accepte pratiquement toutes les valeurs numériques."
          ],
          "code": "machine_active = True\ntemperature = 87\nalerte = machine_active and temperature > 80\nprint(alerte)\nprint(not machine_active)",
          "language": "python",
          "output": "True\nFalse",
          "interpretation": "Une alerte est déclenchée parce que la machine est active et que la température dépasse 80."
        },
        {
          "id": "membership",
          "title": "Membership, Identity and Compound Assignment",
          "paragraphs": [
            "in vérifie l'appartenance à une collection. is compare l'identité d'objets et sert notamment avec None. += est une forme abrégée d'affectation après addition.",
            "Ne remplace pas == par is pour comparer des textes ou des nombres. Le test is None est en revanche approprié pour une valeur manquante."
          ],
          "code": "sites_autorises = {\"Nantes\", \"Paris\"}\nsite = \"Nantes\"\nnombre_pannes = 2\nnombre_pannes += 1\nprint(site in sites_autorises)\nprint(nombre_pannes)",
          "language": "python",
          "output": "True\n3",
          "interpretation": "L'ensemble autorise Nantes et Paris ; += incrémente le compteur sans modifier l'unité de mesure."
        },
        {
          "id": "industry",
          "title": "Case Study: Anomaly Condition with Two Criteria",
          "paragraphs": [
            "Une équipe peut définir qu'une alerte nécessite simultanément une température élevée et une vibration anormale. Une autre règle pourrait déclencher l'alerte dès qu'une seule condition apparaît.",
            "Il faut tester les frontières et écrire les conditions comme des règles métier lisibles. Les seuils utilisés dans l'exemple sont fictifs."
          ],
          "code": "temperature_c = 86\nvibration_mm_s = 7.2\nalerte_critique = (temperature_c > 80) and (vibration_mm_s > 6)\nprint(\"Alerte critique :\", alerte_critique)",
          "language": "python",
          "output": "Alerte critique : True",
          "interpretation": "Les deux critères sont satisfaits. Teste température_c = 80 pour vérifier la différence entre > et >=."
        },
        {
          "id": "exercise",
          "title": "Try It Yourself: Validate a Rate",
          "paragraphs": [
            "Un taux d'arrêt correspond à minutes_arret / minutes_observees × 100. Avant de le calculer, vérifie que la durée d'observation est strictement positive et que l'arrêt ne dépasse pas cette durée.",
            "Test ensuite une observation de durée nulle, puis une observation où minutes_arret est négatif. Une entrée invalide doit être détectée, pas transformée en indicateur."
          ],
          "code": "minutes_observees = 120\nminutes_arret = 15\nvalide = (minutes_observees > 0\n          and 0 <= minutes_arret <= minutes_observees)\ntaux = 100 * minutes_arret / minutes_observees if valide else None\nprint(taux)",
          "language": "python",
          "output": "12.5",
          "interpretation": "Quinze minutes d'arrêt sur cent vingt représentent 12,5 % de la durée observée."
        }
      ],
      "mistakes": [
        "Confondre = et ==.",
        "Utiliser or à la place de and pour une plage numérique.",
        "Oublier que / et // produisent des comportements différents.",
        "Ne pas protéger une division lorsque le dénominateur peut être zéro.",
        "Comparer des unités incompatibles, comme des minutes et des heures."
      ],
      "conclusion": [
        "Les opérateurs transforment une question en calculs et en règles testables. Tu sais maintenant interpréter la priorité, les comparaisons et les conditions composées.",
        "Ces outils deviennent essentiels pour écrire des filtres Pandas et pour définir des règles de qualité et d'alerte dans un projet industriel."
      ],
      "faq": [
        {
          "question": "What does // mean in Python?",
          "answer": "Division entière arrondie vers le bas, contrairement à / qui fournit une division décimale."
        },
        {
          "question": "What is the difference between and and or?",
          "answer": "and exige toutes les conditions ; or en exige au moins une."
        },
        {
          "question": "Is = the same as ==?",
          "answer": "Non. = affecte une variable ; == compare deux valeurs."
        },
        {
          "question": "When should I use is?",
          "answer": "Pour tester l'identité d'un objet, particulièrement is None pour l'absence de valeur."
        },
        {
          "question": "Why check the denominator?",
          "answer": "Un dénominateur zéro rend une division impossible ; un KPI doit signaler cette absence de base de calcul."
        }
      ]
    }
  }
];
