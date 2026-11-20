import type {DeepConceptArticle} from './deepConceptTypes';
export const pythonConceptCollections:DeepConceptArticle[] = [
  {
    "slug": "python-lists",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Python Lists: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une liste Python rassemble plusieurs valeurs dans une séquence ordonnée et modifiable. Dans une mission Data Analyst, tu l'utilises pour conserver des mesures, parcourir des observations ou collecter des résultats avant de passer à NumPy/Pandas.",
        "Ce cours ne s'arrête pas à la définition : il explique la création, les indices, le découpage, les ajouts, les suppressions, les tris, les boucles et les copies, avec des résultats vérifiables."
      ],
      "tldr": [
        "Une liste est délimitée par des crochets : valeurs = [10, 20, 30]. Elle conserve l'ordre, accepte les doublons et peut être modifiée.",
        "Le premier élément porte l'indice 0, le dernier l'indice -1. Un slice valeurs[1:3] conserve les positions 1 et 2, mais exclut la position 3.",
        "Attention aux méthodes qui modifient la liste sur place, aux copies et à la différence entre une moyenne sur mesures valides et une moyenne incluant les données absentes."
      ],
      "sections": [
        {
          "id": "creation",
          "title": "Creating a List and Understanding Its Structure",
          "paragraphs": [
            "Une liste peut contenir des nombres, des textes ou d'autres objets. Elle conserve l'ordre d'insertion et sa taille est donnée par len. Pour des données industrielles, essaie de garder une unité et un type cohérents dans la même liste.",
            "Une liste autorise les doublons : une mesure de 25 °C peut se produire plusieurs fois. Ce n'est pas nécessairement une erreur de données."
          ],
          "code": "temperatures_c = [20, 22, 22, 25]\nprint(temperatures_c)\nprint(len(temperatures_c))\nprint(temperatures_c.count(22))",
          "language": "python",
          "output": "[20, 22, 22, 25]\n4\n2",
          "interpretation": "Quatre observations sont enregistrées, dont deux valeurs égales à 22. count cherche la fréquence d'une valeur particulière."
        },
        {
          "id": "indexing",
          "title": "Indexing and Negative Indices",
          "paragraphs": [
            "Un indice sélectionne une position dans la liste. Python commence à zéro, et un indice négatif compte depuis la fin : -1 est le dernier élément et -2 l'avant-dernier.",
            "Un indice hors des limites déclenche IndexError. Lorsque le numéro est inconnu, vérifie d'abord la longueur plutôt que de supposer qu'un élément existe."
          ],
          "code": "mesures = [10, 15, 20, 25]\nprint(mesures[0])\nprint(mesures[-1])\nprint(mesures[2])",
          "language": "python",
          "output": "10\n25\n20",
          "interpretation": "Le premier indice 0 renvoie 10. Le dernier indice -1 renvoie 25, quelle que soit la longueur de la liste non vide."
        },
        {
          "id": "slicing",
          "title": "Slicing: Extracting Part of a List",
          "paragraphs": [
            "La syntaxe liste[debut:fin:pas] extrait une sous-séquence. La borne fin est exclue. Un pas négatif peut inverser le parcours, et une borne omise utilise l'extrémité correspondante.",
            "Un slice renvoie une nouvelle liste, tandis que l'indexation renvoie un élément. Cette distinction compte lorsque tu veux transformer une fenêtre temporelle."
          ],
          "code": "mesures = [10, 15, 20, 25, 30]\nprint(mesures[1:4])\nprint(mesures[:3])\nprint(mesures[::-1])",
          "language": "python",
          "output": "[15, 20, 25]\n[10, 15, 20]\n[30, 25, 20, 15, 10]",
          "interpretation": "Le slice [1:4] contient trois éléments. Le pas -1 inverse l'ordre des observations, mais ne modifie pas leur valeur."
        },
        {
          "id": "mutations",
          "title": "Adding, Updating and Removing Elements",
          "paragraphs": [
            "append ajoute un élément à la fin ; extend ajoute plusieurs éléments ; insert ajoute à un indice ; pop retire et renvoie un élément. L'affectation liste[i] = valeur remplace l'élément à cette position.",
            "Ces opérations modifient la liste existante. Si une autre variable désigne la même liste, elle voit également les changements."
          ],
          "code": "mesures = [10, 20]\nmesures.append(30)\nmesures[1] = 25\nretire = mesures.pop()\nprint(mesures)\nprint(retire)",
          "language": "python",
          "output": "[10, 25]\n30",
          "interpretation": "On ajoute 30, on remplace 20 par 25, puis pop retire le dernier élément 30. La liste conserve finalement deux valeurs."
        },
        {
          "id": "iteration",
          "title": "Iterating with for and enumerate",
          "paragraphs": [
            "Une boucle for parcourt les valeurs directement. Si tu as aussi besoin de la position de chaque observation, enumerate fournit des couples (indice, valeur) sans gérer manuellement un compteur.",
            "Cette méthode reste lisible pour des listes courtes. Pour de gros calculs numériques, NumPy et Pandas offrent souvent des opérations vectorisées plus efficaces."
          ],
          "code": "mesures = [78, 82, 90]\nfor index, valeur in enumerate(mesures):\n    if valeur > 80:\n        print(\"Alerte à l'indice\", index, \":\", valeur)",
          "language": "python",
          "output": "Alerte à l'indice 1 : 82\nAlerte à l'indice 2 : 90",
          "interpretation": "Les indices 1 et 2 correspondent aux deuxième et troisième observations, qui dépassent le seuil."
        },
        {
          "id": "sorting",
          "title": "Sorting and the Difference Between sort and sorted",
          "paragraphs": [
            "list.sort() modifie la liste sur place et renvoie None. La fonction intégrée sorted() crée une nouvelle liste triée sans modifier l'original.",
            "Éviter de trier les observations sans leurs dates associées : un tri indépendant des mesures peut briser l'alignement avec d'autres colonnes."
          ],
          "code": "valeurs = [30, 10, 20]\ntri = sorted(valeurs)\nprint(\"Original :\", valeurs)\nprint(\"Trié :\", tri)\nvaleurs.sort()\nprint(\"Après sort :\", valeurs)",
          "language": "python",
          "output": "Original : [30, 10, 20]\nTrié : [10, 20, 30]\nAprès sort : [10, 20, 30]",
          "interpretation": "sorted laisse l'original intact. sort transforme ensuite la liste valeurs elle-même."
        },
        {
          "id": "aliasing",
          "title": "Copying Lists and Avoiding Shared Modifications",
          "paragraphs": [
            "Le signe = ne copie pas une liste : il crée simplement un autre nom pour le même objet. Utilise copy() ou list() si tu veux une copie superficielle indépendante.",
            "Attention aux listes imbriquées : une copie superficielle partage encore les listes intérieures. Dans ce cas, copy.deepcopy() peut être nécessaire."
          ],
          "code": "source = [10, 20]\nsame = source\nsame.append(30)\ncopie = source.copy()\ncopie.append(40)\nprint(source)\nprint(copie)",
          "language": "python",
          "output": "[10, 20, 30]\n[10, 20, 30, 40]",
          "interpretation": "L'ajout de 30 change source car same partage l'objet. L'ajout de 40 dans copie n'affecte pas source."
        },
        {
          "id": "industry",
          "title": "Mini-project: Filtering a Measurement List",
          "paragraphs": [
            "Tu reçois huit températures. Tu dois détecter les valeurs supérieures à un seuil, compter les alertes et calculer la moyenne des observations disponibles. Cette opération est une version simplifiée du prétraitement de données de capteurs.",
            "Pour rendre le traitement robuste, vérifie le cas d'une liste vide et documente l'unité. Le seuil doit être choisi avec l'équipe responsable des équipements."
          ],
          "code": "temperatures_c = [72, 85, 80, 91, 74, 83, 77, 88]\nseuil_c = 82\nalertes = [t for t in temperatures_c if t > seuil_c]\nmoyenne = sum(temperatures_c)/len(temperatures_c) if temperatures_c else None\nprint(\"Alertes :\", alertes)\nprint(\"Nombre :\", len(alertes))\nprint(\"Moyenne :\", moyenne)",
          "language": "python",
          "output": "Alertes : [85, 91, 83, 88]\nNombre : 4\nMoyenne : 81.25",
          "interpretation": "Quatre mesures dépassent 82 °C. La moyenne vaut 81,25 °C sur les huit observations ; elle n'indique pas à elle seule les dépassements."
        }
      ],
      "mistakes": [
        "Confondre l'indice de départ 0 avec la première position numérotée 1 dans un tableau.",
        "Attendre que la borne de fin d'un slice soit incluse.",
        "Affecter le résultat de liste.sort() à une variable en pensant obtenir la liste triée.",
        "Penser qu'original = liste.copy() réalise une copie profonde de toutes les structures imbriquées.",
        "Supprimer des valeurs pendant une boucle sans prévoir le décalage des indices."
      ],
      "conclusion": [
        "Les listes sont utiles pour organiser et parcourir une séquence de valeurs. Tu sais maintenant créer, sélectionner, modifier, trier et copier les éléments en comprenant leurs effets.",
        "Pour les calculs sur des millions de valeurs, tu découvriras ensuite ndarray de NumPy et les DataFrames Pandas. Les mêmes questions d'indexation et de type resteront importantes."
      ],
      "faq": [
        {
          "question": "What is a list in Python?",
          "answer": "Une séquence ordonnée et modifiable pouvant contenir plusieurs objets."
        },
        {
          "question": "Can a Python list contain duplicates?",
          "answer": "Oui. Les mêmes valeurs peuvent apparaître à plusieurs positions."
        },
        {
          "question": "What does negative indexing mean?",
          "answer": "Les indices négatifs parcourent la séquence depuis la fin : -1 désigne le dernier élément."
        },
        {
          "question": "What is the difference between append and extend?",
          "answer": "append ajoute un objet ; extend ajoute chacun des éléments d'un itérable."
        },
        {
          "question": "What is the difference between sort and sorted?",
          "answer": "sort modifie la liste d'origine et renvoie None ; sorted fournit une nouvelle liste triée."
        }
      ]
    }
  },
  {
    "slug": "python-tuples",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Tuples in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un tuple est une séquence ordonnée, proche d'une liste mais non modifiable après sa création. Il sert par exemple à représenter une paire de coordonnées, un résultat à plusieurs valeurs ou des paramètres qui ne doivent pas être modifiés.",
        "Ce cours montre comment créer des tuples, sélectionner leurs valeurs, les déballer, les comparer aux listes et les utiliser dans de petits calculs de données."
      ],
      "tldr": [
        "Un tuple s'écrit généralement avec des parenthèses : position = (12, 24). Ses éléments possèdent des indices commençant à zéro.",
        "Le tuple lui-même est immuable : on ne peut pas remplacer directement position[0]. En revanche, un objet mutable contenu dans un tuple peut encore être modifié.",
        "Les tuples sont pratiques pour les retours de fonctions multiples et les coordonnées (ligne, colonne) des matrices d'images."
      ],
      "sections": [
        {
          "id": "definition",
          "title": "What is a Tuple and Why Use It?",
          "paragraphs": [
            "Un tuple conserve un ensemble ordonné de valeurs sans autoriser l'ajout, la suppression ou la modification de ses positions. Cela rend explicite l'intention de garder un groupe d'informations stable.",
            "Une position de pixel peut être représentée par (ligne, colonne), par exemple (100, 200), tandis qu'une série de températures à enrichir progressivement se prête plutôt à une liste."
          ],
          "code": "pixel = (100, 200)\nprint(pixel)\nprint(type(pixel).__name__)\nprint(pixel[0], pixel[1])",
          "language": "python",
          "output": "(100, 200)\ntuple\n100 200",
          "interpretation": "La première coordonnée désigne la ligne et la deuxième la colonne. Le tuple contient exactement deux valeurs."
        },
        {
          "id": "creation",
          "title": "Creating Tuples, Including One-element Tuples",
          "paragraphs": [
            "Les parenthèses aident la lecture, mais une virgule est décisive pour créer un tuple. (5) reste le nombre entier 5, alors que (5,) est un tuple à un élément.",
            "Les tuples peuvent contenir des textes, nombres et autres objets. Les types hétérogènes sont acceptés, mais on doit pouvoir expliquer le rôle de chaque position."
          ],
          "code": "entier = (5)\ntuple_unique = (5,)\ncapteur = (\"M1\", 72.5, \"°C\")\nprint(type(entier).__name__)\nprint(type(tuple_unique).__name__)\nprint(capteur)",
          "language": "python",
          "output": "int\ntuple\n('M1', 72.5, '°C')",
          "interpretation": "La virgule distingue le tuple à un élément de simples parenthèses autour d'une expression."
        },
        {
          "id": "indexing",
          "title": "Indexing, Slicing and Packing",
          "paragraphs": [
            "Comme pour les listes, les indices commencent à 0, les négatifs partent de la fin et le slicing exclut la borne de fin. La longueur est donnée par len().",
            "Tu peux aussi construire un tuple sans écrire explicitement les parenthèses lorsque la syntaxe est non ambiguë : par exemple point = 10, 20."
          ],
          "code": "mesures = (10, 15, 20, 25)\nprint(mesures[1])\nprint(mesures[-1])\nprint(mesures[:2])",
          "language": "python",
          "output": "15\n25\n(10, 15)",
          "interpretation": "Le slice renvoie un nouveau tuple. L'original reste inchangé."
        },
        {
          "id": "unpacking",
          "title": "Unpacking and Multiple Return Values",
          "paragraphs": [
            "Le déballage (unpacking) associe chaque élément du tuple à un nom explicite. Une fonction Python peut aussi renvoyer plusieurs valeurs en utilisant return a, b : le résultat est alors un tuple.",
            "Le déballage évite les accès obscurs à resultat[0] et resultat[1], mais exige généralement le bon nombre de valeurs."
          ],
          "code": "def mesures_resume(valeurs):\n    return min(valeurs), max(valeurs)\n\nminimum, maximum = mesures_resume([15, 10, 27])\nprint(minimum, maximum)",
          "language": "python",
          "output": "10 27",
          "interpretation": "La fonction renvoie une paire et le déballage attribue chacune des deux valeurs à une variable descriptive."
        },
        {
          "id": "immutability",
          "title": "Immutability and Its Practical Limits",
          "paragraphs": [
            "Un tuple n'autorise pas l'instruction coordonnees[0] = 10. Cela aide à protéger la structure d'un groupe de valeurs contre certaines modifications accidentelles.",
            "Cela ne signifie pas qu'un tuple est récursivement figé. Si un de ses éléments est une liste, cette liste reste modifiable : l'immuabilité concerne les positions du tuple."
          ],
          "code": "configuration = (\"M1\", [70, 72])\nconfiguration[1].append(75)\nprint(configuration)",
          "language": "python",
          "output": "('M1', [70, 72, 75])",
          "interpretation": "L'objet tuple n'a pas changé de structure, mais la liste placée dans sa deuxième position a été modifiée."
        },
        {
          "id": "project",
          "title": "Professional Example: Return a Sensor Summary",
          "paragraphs": [
            "Une fonction qui calcule plusieurs indicateurs peut renvoyer un tuple. Cette interface est simple si le nombre de résultats et leur ordre sont connus. Pour un projet plus complexe, une dataclass ou un dictionnaire nommé peut être plus explicite.",
            "Dans cet exemple, vérifie le cas d'une liste vide avant d'appeler min et max, car ces fonctions exigent au moins une valeur."
          ],
          "code": "def analyser(valeurs):\n    if not valeurs:\n        return None\n    return (min(valeurs), max(valeurs), sum(valeurs)/len(valeurs))\n\nresultats = analyser([20, 30, 25])\nif resultats is not None:\n    mini, maxi, moyenne = resultats\n    print(mini, maxi, moyenne)",
          "language": "python",
          "output": "20 30 25.0",
          "interpretation": "Le tuple renvoie les trois indicateurs dans un ordre fixe. Les noms après déballage rendent la sortie compréhensible."
        }
      ],
      "mistakes": [
        "Écrire (5) en pensant avoir créé un tuple à un élément.",
        "Essayer de modifier directement un élément avec tuple[0] = nouvelle_valeur.",
        "Oublier que des objets mutables à l'intérieur d'un tuple peuvent encore changer.",
        "Déballer un tuple dans un nombre incorrect de variables.",
        "Utiliser des tuples très longs sans noms explicites, ce qui rend leurs positions difficiles à interpréter."
      ],
      "conclusion": [
        "Le tuple représente une séquence ordonnée dont les positions restent fixes. Il facilite les retours de fonctions, les coordonnées et de petits groupes de paramètres.",
        "Tu peux choisir entre liste et tuple selon le besoin de modification, et privilégier les dictionnaires lorsque chaque champ doit porter un nom clair."
      ],
      "faq": [
        {
          "question": "What is a tuple in Python?",
          "answer": "Une séquence ordonnée non modifiable dans ses positions."
        },
        {
          "question": "What is the difference between list and tuple?",
          "answer": "Une liste permet la modification des éléments ; un tuple ne permet pas d'en remplacer directement les positions."
        },
        {
          "question": "Why is (5,) different from (5)?",
          "answer": "La virgule crée un tuple à un seul élément ; sans elle, il s'agit d'un entier entouré de parenthèses."
        },
        {
          "question": "Can a tuple contain a list?",
          "answer": "Oui, et la liste intérieure reste modifiable."
        },
        {
          "question": "When should I use a tuple?",
          "answer": "Pour un groupe stable et compact comme des coordonnées, paramètres ou plusieurs valeurs retournées."
        }
      ]
    }
  },
  {
    "slug": "python-dictionaries",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Dictionaries in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Un dictionnaire Python associe des clés à des valeurs. Au lieu de retenir qu'une mesure est la troisième position d'une liste, on peut écrire mesure['temperature_c'] et comprendre immédiatement la donnée récupérée.",
        "Cette structure est fondamentale pour lire du JSON, manipuler les lignes d'un CSV avec DictReader, organiser des paramètres de modèles et construire des résultats d'analyse."
      ],
      "tldr": [
        "Un dictionnaire utilise des paires clé-valeur : {'machine': 'M1', 'temperature_c': 75}. Une clé doit être hachable et unique dans le dictionnaire.",
        "On lit une valeur avec d[cle] ou d.get(cle). get peut fournir une valeur par défaut si la clé est absente.",
        "Pour parcourir toutes les paires, on utilise items(). Les dictionnaires conservent l'ordre d'insertion dans les versions modernes de Python, mais ne constituent pas des tables relationnelles."
      ],
      "sections": [
        {
          "id": "definition",
          "title": "Creating a Dictionary with Named Fields",
          "paragraphs": [
            "Les accolades délimitent un dictionnaire, les deux-points séparent chaque clé de sa valeur. Une clé nommée est plus explicite qu'un indice numérique lorsque les champs possèdent des significations différentes.",
            "Un dictionnaire de mesure peut conserver l'identifiant de machine, la température, l'instant et la source. Il ne remplace pas une base de données, mais simplifie la manipulation d'un enregistrement."
          ],
          "code": "mesure = {\n    \"machine\": \"M1\",\n    \"temperature_c\": 72.5,\n    \"site\": \"Nantes\"\n}\nprint(mesure[\"machine\"])\nprint(mesure[\"temperature_c\"])",
          "language": "python",
          "output": "M1\n72.5",
          "interpretation": "Les deux valeurs sont obtenues par leur nom de champ. Le code est lisible même si l'ordre d'insertion change."
        },
        {
          "id": "lookup",
          "title": "Accessing Values: [] vs get()",
          "paragraphs": [
            "Les crochets d[cle] sont adaptés lorsqu'une clé est obligatoire : une KeyError signale qu'elle manque. get permet de traiter une clé facultative sans lever cette exception et d'indiquer un repli.",
            "Attention à ne pas confondre une clé absente avec une clé dont la valeur est explicitement None : get renvoie None dans les deux cas sans argument supplémentaire."
          ],
          "code": "mesure = {\"machine\": \"M1\", \"temperature_c\": 72}\nprint(mesure[\"machine\"])\nprint(mesure.get(\"humidite_pct\"))\nprint(mesure.get(\"humidite_pct\", \"non disponible\"))",
          "language": "python",
          "output": "M1\nNone\nnon disponible",
          "interpretation": "La clé humidite_pct n'existe pas ; get permet de produire une indication claire au lieu d'arrêter le programme."
        },
        {
          "id": "update",
          "title": "Adding, Updating and Removing Entries",
          "paragraphs": [
            "On ajoute une nouvelle entrée avec d[nouvelle_cle] = valeur et on modifie une entrée en utilisant sa clé existante. pop retire une clé et renvoie sa valeur. Les clés doivent être stables et choisies consciemment.",
            "Dans une analyse professionnelle, conserve une copie des données originales lorsqu'une transformation pourrait être contestée ou lorsqu'un audit doit comparer avant et après."
          ],
          "code": "fiche = {\"machine\": \"M1\"}\nfiche[\"temperature_c\"] = 70\nfiche[\"temperature_c\"] = 75\nprint(fiche)\nretire = fiche.pop(\"temperature_c\")\nprint(retire)",
          "language": "python",
          "output": "{'machine': 'M1', 'temperature_c': 75}\n75",
          "interpretation": "La valeur 70 est remplacée par 75, puis pop retire le champ et renvoie sa dernière valeur."
        },
        {
          "id": "iteration",
          "title": "Traversing Keys, Values and Items",
          "paragraphs": [
            "keys fournit les clés, values fournit les valeurs et items fournit les couples clé-valeur. Pour afficher ou vérifier des indicateurs par machine, items est le plus naturel.",
            "Une boucle sur un dictionnaire parcourt directement les clés. Il est parfois utile de trier ces clés pour obtenir un ordre de restitution reproductible."
          ],
          "code": "temps_arret = {\"M1\": 40, \"M2\": 15}\nfor machine, minutes in temps_arret.items():\n    print(machine, \":\", minutes, \"min\")",
          "language": "python",
          "output": "M1 : 40 min\nM2 : 15 min",
          "interpretation": "Chaque paire est récupérée avec un nom de machine et sa mesure. L'unité est affichée explicitement."
        },
        {
          "id": "nested",
          "title": "Nested Dictionaries and JSON-like Structures",
          "paragraphs": [
            "Les dictionnaires peuvent contenir d'autres dictionnaires ou des listes. Cette structure correspond à de nombreux fichiers JSON renvoyés par des API ou produits par des instruments de mesure.",
            "Plus une structure est imbriquée, plus il faut documenter les champs obligatoires et les valeurs optionnelles, sinon les erreurs de clé deviennent fréquentes."
          ],
          "code": "rapport = {\n    \"site\": \"Nantes\",\n    \"machines\": {\n        \"M1\": {\"arret_min\": 40},\n        \"M2\": {\"arret_min\": 15}\n    }\n}\nprint(rapport[\"machines\"][\"M1\"][\"arret_min\"])",
          "language": "python",
          "output": "40",
          "interpretation": "La clé machines donne un dictionnaire, puis la clé M1 donne un enregistrement contenant arret_min."
        },
        {
          "id": "aggregation",
          "title": "Mini-project: Aggregate Events by Machine",
          "paragraphs": [
            "Un jeu d'événements peut contenir plusieurs lignes pour la même machine. Utilise un dictionnaire comme accumulateur, puis compare le résultat à une somme manuelle.",
            "Cette opération prépare la compréhension de groupby dans Pandas : on crée un groupe par catégorie et on agrège les valeurs qu'il contient."
          ],
          "code": "evenements = [\n    {\"machine\": \"M1\", \"arret_min\": 10},\n    {\"machine\": \"M2\", \"arret_min\": 15},\n    {\"machine\": \"M1\", \"arret_min\": 25}\n]\ntotaux = {}\nfor evenement in evenements:\n    m = evenement[\"machine\"]\n    totaux[m] = totaux.get(m, 0) + evenement[\"arret_min\"]\nprint(totaux)",
          "language": "python",
          "output": "{'M1': 35, 'M2': 15}",
          "interpretation": "get(m, 0) fournit zéro pour une machine rencontrée pour la première fois. Chaque événement est additionné une seule fois."
        },
        {
          "id": "pitfalls",
          "title": "When a Dictionary Is Not Enough",
          "paragraphs": [
            "Un dictionnaire convient pour un enregistrement ou un ensemble de petits indicateurs, mais pas toujours pour des millions de lignes. Pandas apporte des outils d'agrégation, de jointure et d'analyse plus adaptés aux tableaux.",
            "Évite d'utiliser des clés calculées sans contrôler leur normalisation : les clés 'M1', 'm1' et ' M1 ' sont distinctes et formeraient trois groupes différents."
          ],
          "code": "totaux = {\"M1\": 35, \"m1\": 10}\nprint(len(totaux))\ncles_normalisees = {k.strip().upper():v for k,v in totaux.items()}\nprint(cles_normalisees)",
          "language": "python",
          "output": "2\n{'M1': 10}",
          "interpretation": "La compréhension écrase ici une valeur précédente car deux clés deviennent identiques. Une normalisation correcte doit agréger les valeurs, pas écraser silencieusement un groupe."
        }
      ],
      "mistakes": [
        "Accéder à une clé facultative avec [] sans prévoir KeyError.",
        "Supposer que get renvoie toujours une valeur valide alors qu'il peut renvoyer None.",
        "Écraser silencieusement des groupes lors d'une normalisation des clés.",
        "Confondre les paires clé-valeur avec les colonnes et lignes d'un DataFrame.",
        "Modifier le dictionnaire tout en itérant directement sur ses clés sans stratégie adaptée."
      ],
      "conclusion": [
        "Un dictionnaire transforme des données positionnelles en enregistrements nommés. Tu sais ajouter, rechercher et regrouper des valeurs, ainsi qu'utiliser get et items de façon sûre.",
        "Ces notions servent directement lors de la lecture de fichiers JSON et lors de l'élaboration d'un agrégat par catégorie avant de passer à Pandas."
      ],
      "faq": [
        {
          "question": "What is a dictionary in Python?",
          "answer": "Un ensemble de paires clé-valeur permettant de rechercher une donnée par son nom de champ."
        },
        {
          "question": "What is the difference between d[key] and d.get(key)?",
          "answer": "Les crochets lèvent KeyError si la clé manque ; get renvoie None ou une valeur de repli."
        },
        {
          "question": "Can dictionary keys be duplicated?",
          "answer": "Une même clé ne peut avoir qu'une seule valeur finale ; une affectation répétée remplace l'ancienne valeur."
        },
        {
          "question": "How do I loop through a dictionary?",
          "answer": "Avec for key, value in dictionary.items() pour récupérer chaque paire."
        },
        {
          "question": "When should I use Pandas instead?",
          "answer": "Lorsque les données comportent de nombreuses observations structurées en colonnes avec des besoins d'agrégation et de jointure."
        }
      ]
    }
  }
];
