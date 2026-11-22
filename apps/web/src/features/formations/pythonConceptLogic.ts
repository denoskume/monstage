import type {DeepConceptArticle} from './deepConceptTypes';
export const pythonConceptLogic:DeepConceptArticle[] = [
  {
    "slug": "python-conditions",
    "pointIndex": 2,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Conditional Statements in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une condition permet à un programme de prendre une décision à partir des valeurs observées : signaler une température trop élevée, ignorer un enregistrement incomplet ou classer une mesure selon une plage.",
        "Ce guide enseigne if, elif, else, l'indentation, les booléens, les conditions combinées, les cas limites et la validation des données, puis construit un classifieur de seuils simples."
      ],
      "tldr": [
        "if exécute un bloc lorsque sa condition est vraie ; elif ajoute une condition alternative ; else traite le reste.",
        "L'indentation délimite les blocs. En Python, les espaces font partie de la syntaxe et il est conseillé d'utiliser quatre espaces par niveau.",
        "Les règles métier doivent être testées aux limites : juste en dessous, exactement sur le seuil et juste au-dessus."
      ],
      "sections": [
        {
          "id": "if",
          "title": "How the if Statement Works",
          "paragraphs": [
            "Le mot-clé if est suivi d'une expression qui produit une valeur interprétée comme True ou False, puis de deux-points. Les lignes indentées sous if appartiennent au même bloc et sont exécutées lorsque la condition est vraie.",
            "Dans un système industriel, if peut signaler qu'un capteur dépasse un seuil. Le seuil et l'unité doivent être documentés plutôt que choisis au hasard."
          ],
          "code": "temperature_c = 86\nif temperature_c > 80:\n    print(\"Alerte de température\")\nprint(\"Fin du contrôle\")",
          "language": "python",
          "output": "Alerte de température\nFin du contrôle",
          "interpretation": "La première ligne s'affiche parce que 86 > 80. La seconde se trouve hors du bloc if et s'affiche toujours."
        },
        {
          "id": "else",
          "title": "Choosing Between if and else",
          "paragraphs": [
            "else définit un chemin de repli lorsqu'aucun if précédent n'a été satisfait. Il ne possède pas lui-même de condition ; il représente tous les cas non retenus.",
            "Dans un programme métier, le message de repli doit être précis : « seuil non dépassé » est différent de « machine en bon état », car une seule mesure ne décrit pas tout l'équipement."
          ],
          "code": "temperature_c = 75\nif temperature_c > 80:\n    print(\"Seuil dépassé\")\nelse:\n    print(\"Seuil non dépassé\")",
          "language": "python",
          "output": "Seuil non dépassé",
          "interpretation": "Le programme n'affirme pas que la machine est saine : il confirme uniquement qu'une règle particulière n'a pas été franchie."
        },
        {
          "id": "elif",
          "title": "Multiple Branches with elif",
          "paragraphs": [
            "elif signifie une condition alternative examinée seulement si les conditions précédentes sont fausses. Cela permet de définir des catégories exclusives comme normal, surveillance et alerte.",
            "L'ordre des branches compte. Si une règle très générale vient avant une règle plus spécifique, elle peut capturer les observations et rendre la règle suivante inaccessible."
          ],
          "code": "temperature_c = 87\nif temperature_c > 95:\n    statut = \"Alerte critique\"\nelif temperature_c > 80:\n    statut = \"Surveillance\"\nelse:\n    statut = \"Sous les seuils\"\nprint(statut)",
          "language": "python",
          "output": "Surveillance",
          "interpretation": "87 dépasse 80 mais pas 95. Le programme retient la première condition vraie dans l'ordre du code."
        },
        {
          "id": "booleans",
          "title": "Combining Tests with and, or and not",
          "paragraphs": [
            "On utilise and pour exiger plusieurs conditions, or pour accepter l'une d'elles et not pour nier une condition. Ces opérateurs représentent les règles métier impliquant plusieurs variables.",
            "Une condition doit rester lisible. Les parenthèses peuvent clarifier la priorité, surtout lorsque tu combines des tests de plage, de disponibilité et d'état machine."
          ],
          "code": "active = True\ntemperature_c = 90\nvibration_mm_s = 7\nif active and (temperature_c > 80 or vibration_mm_s > 8):\n    print(\"Contrôle nécessaire\")",
          "language": "python",
          "output": "Contrôle nécessaire",
          "interpretation": "La machine est active et au moins une des deux mesures dépasse son seuil. La vibration est ici sous son seuil, mais la température suffit."
        },
        {
          "id": "missing",
          "title": "Checking Missing Values Before Comparing",
          "paragraphs": [
            "Une mesure peut être absente. Comparer None à un entier avec > provoque TypeError, il faut donc séparer la vérification de présence du contrôle de seuil.",
            "Cette distinction évite de traiter une absence d'information comme une valeur conforme. Dans un tableau de bord, le nombre de données manquantes doit souvent être affiché séparément."
          ],
          "code": "temperature_c = None\nif temperature_c is None:\n    statut = \"Mesure indisponible\"\nelif temperature_c > 80:\n    statut = \"Alerte\"\nelse:\n    statut = \"Seuil non dépassé\"\nprint(statut)",
          "language": "python",
          "output": "Mesure indisponible",
          "interpretation": "Le code ne tente pas de comparer None à 80 et ne classe pas l'absence de mesure comme normal."
        },
        {
          "id": "ternary",
          "title": "Conditional Expressions for Simple Choices",
          "paragraphs": [
            "Une expression conditionnelle prend la forme valeur_si_vraie if condition else valeur_si_fausse. Elle est pratique pour un choix très court, mais les règles complexes restent plus lisibles avec plusieurs lignes if/elif.",
            "Évite d'emboîter plusieurs expressions conditionnelles dans une ligne. Lors de la revue d'un projet, la lisibilité est aussi un critère de qualité."
          ],
          "code": "temperature_c = 83\nstatut = \"Alerte\" if temperature_c > 80 else \"Normal\"\nprint(statut)",
          "language": "python",
          "output": "Alerte",
          "interpretation": "La condition s'évalue avant de choisir entre les deux chaînes. Ici, 83 dépasse le seuil."
        },
        {
          "id": "project",
          "title": "Professional Example: Classifying an Equipment's Condition",
          "paragraphs": [
            "Une équipe souhaite une règle simple de tri : alerte si température > 95, surveillance si température > 80, sinon sous les seuils. Les deux seuils sont fictifs ; ils doivent être définis selon les équipements.",
            "Écris une fonction de classification avec une catégorie explicite pour les valeurs absentes et teste 80, 81, 95 et 96 pour comprendre les frontières."
          ],
          "code": "def classer(temperature_c):\n    if temperature_c is None:\n        return \"Non mesuré\"\n    if temperature_c > 95:\n        return \"Critique\"\n    if temperature_c > 80:\n        return \"Surveillance\"\n    return \"Sous les seuils\"\n\nfor valeur in [None, 80, 81, 95, 96]:\n    print(valeur, \"→\", classer(valeur))",
          "language": "python",
          "output": "None → Non mesuré\n80 → Sous les seuils\n81 → Surveillance\n95 → Surveillance\n96 → Critique",
          "interpretation": "95 n'est pas critique parce que le test est strictement supérieur à 95. Les cas limites rendent explicite la règle réellement appliquée."
        }
      ],
      "mistakes": [
        "Oublier les deux-points après if, elif ou else.",
        "Mal indenter les lignes d'un bloc conditionnel.",
        "Placer une condition générale avant une condition spécifique.",
        "Comparer directement None à un nombre.",
        "Utiliser une règle arbitraire sur des données industrielles sans validation des seuils."
      ],
      "conclusion": [
        "Tu sais maintenant organiser des décisions avec if, elif et else, combiner des tests et gérer les valeurs absentes. Ces conditions serviront à nettoyer des données et à implémenter des contrôles d'alerte.",
        "Dans Pandas, les mêmes idées sont souvent appliquées à des colonnes entières avec des masques booléens plutôt qu'avec une boucle explicite."
      ],
      "faq": [
        {
          "question": "What is an if statement in Python?",
          "answer": "Une instruction conditionnelle qui exécute un bloc si une expression est vraie."
        },
        {
          "question": "What does elif mean?",
          "answer": "Une branche alternative testée seulement si les conditions précédentes ont échoué."
        },
        {
          "question": "Is else mandatory?",
          "answer": "Non. Un if peut exister sans else ; son bloc est alors simplement ignoré si la condition est fausse."
        },
        {
          "question": "Why is indentation important?",
          "answer": "Elle délimite les blocs d'instructions de Python et détermine quelles lignes appartiennent à chaque condition."
        },
        {
          "question": "How do I handle missing sensor values?",
          "answer": "Teste is None avant toute comparaison numérique et conserve une catégorie explicite pour les valeurs indisponibles."
        }
      ]
    }
  },
  {
    "slug": "python-loops",
    "pointIndex": 2,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Loops in Python: for, while, break and continue",
      "author": "MonStage Learning",
      "intro": [
        "Une boucle répète une opération sur plusieurs valeurs sans recopier les mêmes lignes. Elle sert à examiner des mesures, lire des lignes de fichiers, produire des rapports par machine ou parcourir des images.",
        "Tu vas maîtriser for, while, range, enumerate, break et continue, puis construire un traitement de mesures capable de gérer des données manquantes."
      ],
      "tldr": [
        "for parcourt les éléments d'un itérable ; while répète un bloc tant qu'une condition est vraie.",
        "range produit une séquence d'entiers ; enumerate associe un indice à chaque observation. break arrête une boucle ; continue passe à l'itération suivante.",
        "Il faut éviter les boucles infinies et distinguer clairement les valeurs reçues, valides et rejetées."
      ],
      "sections": [
        {
          "id": "for",
          "title": "The for Loop: One Observation at a Time",
          "paragraphs": [
            "Une boucle for attribue successivement à une variable chaque élément d'une liste ou d'un autre itérable. Le bloc indenté s'exécute pour chacun de ces éléments.",
            "Cette forme de boucle est naturelle pour des entrées de taille connue. Lorsqu'un tableau est très volumineux, une fonction vectorisée NumPy/Pandas peut être plus efficace."
          ],
          "code": "temperatures = [70, 82, 90]\nfor temperature in temperatures:\n    print(\"Mesure :\", temperature)",
          "language": "python",
          "output": "Mesure : 70\nMesure : 82\nMesure : 90",
          "interpretation": "La variable temperature reçoit l'une après l'autre les trois valeurs de la liste."
        },
        {
          "id": "range",
          "title": "Using range to Generate Iteration Indices",
          "paragraphs": [
            "range(debut, fin, pas) produit une suite d'entiers où la borne de fin est exclue. Utilise range si tu as besoin d'un nombre de répétitions ou de positions numériques.",
            "Si tu veux seulement parcourir les valeurs d'une liste, il est plus lisible de faire for valeur in liste plutôt que d'utiliser range(len(liste))."
          ],
          "code": "for numero in range(1, 4):\n    print(\"Inspection\", numero)",
          "language": "python",
          "output": "Inspection 1\nInspection 2\nInspection 3",
          "interpretation": "range(1, 4) inclut 1, 2 et 3. Le nombre 4 ne fait pas partie de la séquence."
        },
        {
          "id": "enumerate",
          "title": "Getting Indices and Values with enumerate",
          "paragraphs": [
            "enumerate récupère les valeurs avec leur indice. Tu évites ainsi d'incrémenter manuellement un compteur qui pourrait ne plus correspondre à la position de l'observation.",
            "Il est possible de démarrer le comptage à un autre numéro avec start=1, utile pour des lignes de compte rendu destinées à un humain."
          ],
          "code": "machines = [\"M1\", \"M2\", \"M3\"]\nfor ligne, machine in enumerate(machines, start=1):\n    print(ligne, machine)",
          "language": "python",
          "output": "1 M1\n2 M2\n3 M3",
          "interpretation": "L'index commence à 1 pour l'affichage. Ce choix ne modifie pas l'indexation interne des listes, qui reste basée sur zéro."
        },
        {
          "id": "while",
          "title": "The while Loop and Its Stopping Condition",
          "paragraphs": [
            "while teste une condition avant chaque répétition. Cette boucle est adaptée lorsqu'on ne sait pas à l'avance combien de tentatives seront nécessaires, mais elle doit pouvoir s'arrêter.",
            "Si la condition reste vraie et qu'aucune instruction ne modifie son état, le programme peut tourner indéfiniment. Ajoute un compteur ou une limite de tentatives lorsque cela est approprié."
          ],
          "code": "tentative = 0\nwhile tentative < 3:\n    tentative += 1\n    print(\"Tentative\", tentative)",
          "language": "python",
          "output": "Tentative 1\nTentative 2\nTentative 3",
          "interpretation": "Le compteur progresse et finit par rendre la condition fausse. La boucle s'arrête après la troisième tentative."
        },
        {
          "id": "break-continue",
          "title": "When to Use break and continue",
          "paragraphs": [
            "break sort immédiatement de la boucle en cours ; continue saute le reste de l'itération et passe à la suivante. Ces instructions rendent certains contrôles simples, mais trop de sauts rendent le code difficile à lire.",
            "continue est utile lorsqu'une observation est vide ou invalide. Il faut néanmoins enregistrer le nombre de rejets afin de ne pas cacher un problème de qualité."
          ],
          "code": "valeurs = [20, None, 25, 30]\nfor valeur in valeurs:\n    if valeur is None:\n        print(\"Mesure ignorée\")\n        continue\n    if valeur >= 30:\n        print(\"Seuil atteint\")\n        break\n    print(\"Valide :\", valeur)",
          "language": "python",
          "output": "Valide : 20\nMesure ignorée\nValide : 25\nSeuil atteint",
          "interpretation": "continue ignore uniquement la valeur absente ; break arrête la lecture lorsqu'une mesure atteint 30."
        },
        {
          "id": "accumulate",
          "title": "Accumulating Results in a Loop",
          "paragraphs": [
            "Une variable accumulatrice garde le total au fur et à mesure. Une boucle peut aussi compter les observations retenues et calculer une moyenne lorsque les données contiennent des absences.",
            "Le dénominateur doit représenter les mesures effectivement utilisées pour la moyenne. Le nombre total de mesures reçues reste toutefois utile pour mesurer la qualité des données."
          ],
          "code": "mesures = [10, 20, None, 30]\ntotal = 0\nnombre = 0\nfor valeur in mesures:\n    if valeur is None:\n        continue\n    total += valeur\n    nombre += 1\nprint(total, nombre, total / nombre if nombre else None)",
          "language": "python",
          "output": "60 3 20.0",
          "interpretation": "La moyenne est calculée sur trois mesures valides. La liste contenait quatre entrées, dont une absente."
        },
        {
          "id": "comprehension",
          "title": "List Comprehensions: a Compact Alternative",
          "paragraphs": [
            "Une compréhension de liste exprime en une ligne une sélection ou transformation simple. Elle combine la création d'une liste avec une boucle et une condition facultative.",
            "Cette syntaxe est pratique pour des cas courts. Pour une logique complexe impliquant de nombreuses étapes, une boucle classique reste plus facile à lire et à déboguer."
          ],
          "code": "temperatures = [72, 85, 80, 91]\nalertes = [t for t in temperatures if t > 80]\nprint(alertes)",
          "language": "python",
          "output": "[85, 91]",
          "interpretation": "La compréhension conserve uniquement les deux valeurs qui dépassent le seuil strict de 80."
        },
        {
          "id": "case",
          "title": "Professional Mini-project: Validate a Batch of Sensor Values",
          "paragraphs": [
            "Une machine envoie une série de mesures, dont certaines peuvent être absentes ou hors de plage. Conçois une boucle qui sépare observations valides et observations rejetées, puis calcule un résultat synthétique.",
            "Le contrôle de plage doit être adapté aux caractéristiques du capteur. La transparence sur les valeurs rejetées constitue un critère essentiel de qualité."
          ],
          "code": "brutes = [20, 22, None, -100, 25, 200]\nvalides, rejets = [], []\nfor valeur in brutes:\n    if valeur is None or not (-20 <= valeur <= 120):\n        rejets.append(valeur)\n        continue\n    valides.append(valeur)\n\nmoyenne = sum(valides)/len(valides) if valides else None\nprint(\"Valides :\", valides)\nprint(\"Rejets :\", rejets)\nprint(\"Moyenne :\", moyenne)",
          "language": "python",
          "output": "Valides : [20, 22, 25]\nRejets : [None, -100, 200]\nMoyenne : 22.333333333333332",
          "interpretation": "Trois mesures sur six sont utilisables selon la plage choisie. Le rapport doit mentionner le taux de rejet de 50 %."
        }
      ],
      "mistakes": [
        "Écrire une boucle while dont la condition ne peut jamais devenir fausse.",
        "Utiliser range(len(liste)) lorsque le parcours direct de la liste serait plus simple.",
        "Confondre break, qui quitte la boucle, et continue, qui passe à l'itération suivante.",
        "Calculer une moyenne avec le nombre d'entrées totales alors que les valeurs absentes ont été ignorées.",
        "Masquer des observations rejetées sans mesurer leur fréquence ni expliquer la raison du rejet."
      ],
      "conclusion": [
        "Tu sais utiliser for, while, range, enumerate, break, continue et les compréhensions pour traiter des observations répétées. Tu comprends aussi les accumulateurs et les contrôles de qualité dans une boucle.",
        "Ces mécanismes expliquent ce que font les opérations vectorisées de NumPy et Pandas à un niveau plus élevé d'abstraction."
      ],
      "faq": [
        {
          "question": "What is a for loop in Python?",
          "answer": "Une boucle qui parcourt les éléments d'un itérable et exécute un bloc pour chacun d'eux."
        },
        {
          "question": "When should I use while?",
          "answer": "Lorsque la répétition dépend d'une condition de poursuite plutôt que d'une séquence de valeurs connue."
        },
        {
          "question": "What does enumerate do?",
          "answer": "Il fournit à la fois l'indice et la valeur de chaque élément parcouru."
        },
        {
          "question": "What is the difference between break and continue?",
          "answer": "break arrête la boucle ; continue abandonne le reste de l'itération actuelle."
        },
        {
          "question": "Why is a list comprehension useful?",
          "answer": "Elle exprime compactement une sélection ou transformation simple de liste."
        }
      ]
    }
  },
  {
    "slug": "python-builtins",
    "pointIndex": 3,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "Built-in Functions in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Les built-in functions sont les fonctions déjà disponibles dans Python, sans installation ni import. Elles permettent de compter, additionner, trier, convertir, parcourir ou inspecter des valeurs.",
        "Ce cours couvre les fonctions intégrées les plus importantes pour une mission Data Analyst, compare leurs comportements et montre comment les combiner pour calculer des indicateurs sans masquer les cas invalides."
      ],
      "tldr": [
        "print, type, len, sum, min, max, abs, round, sorted, range, enumerate, zip, any et all sont des fonctions intégrées. Elles sont accessibles directement dans Python.",
        "Une fonction peut produire un résultat ou un effet (comme afficher un texte). Vérifie la valeur retournée, les types attendus et le comportement sur une liste vide.",
        "Les built-ins constituent un premier outil d'analyse avant d'utiliser Pandas : ils doivent être maîtrisés réellement, pas simplement mémorisés."
      ],
      "sections": [
        {
          "id": "definition",
          "title": "What Is a Built-in Function?",
          "paragraphs": [
            "Une fonction intégrée est fournie directement par le langage. Tu l'appelles en écrivant son nom suivi de parenthèses et, souvent, d'arguments. Elle exécute une opération prédéfinie et peut renvoyer une valeur.",
            "Par exemple, len renvoie la longueur d'une collection, tandis que print affiche des informations sans renvoyer la chaîne affichée. Il faut distinguer effet et valeur retournée."
          ],
          "code": "mesures = [10, 20, 30]\nprint(len(mesures))\nresultat = print(\"Salut\")\nprint(resultat)",
          "language": "python",
          "output": "3\nSalut\nNone",
          "interpretation": "len renvoie un entier. print écrit dans la sortie standard et sa valeur de retour est None."
        },
        {
          "id": "numeric",
          "title": "Numeric Built-ins: sum, min, max and abs",
          "paragraphs": [
            "sum additionne un itérable numérique ; min et max trouvent les bornes ; abs renvoie la valeur absolue. Ces opérations sont utiles pour résumer des mesures et calculer une amplitude d'écart.",
            "min et max ne fonctionnent pas sur une séquence vide sans traitement adapté. Avant de calculer une statistique, vérifie que les données nécessaires sont présentes."
          ],
          "code": "temperatures = [20, 24, 18, 26]\nprint(sum(temperatures))\nprint(min(temperatures), max(temperatures))\nprint(abs(18 - 24))",
          "language": "python",
          "output": "88\n18 26\n6",
          "interpretation": "La somme est 88 ; les valeurs vont de 18 à 26. L'écart absolu entre 18 et 24 vaut 6."
        },
        {
          "id": "round",
          "title": "Rounding with round and Formatting Output",
          "paragraphs": [
            "round permet d'arrondir une valeur, mais le comportement d'un demi exact n'est pas toujours un arrondi « vers le haut » : Python applique l'arrondi au pair sur de tels cas, avec les subtilités des flottants.",
            "Pour afficher une valeur avec une précision fixe, les f-strings permettent un format comme :.2f. Conserve les valeurs non arrondies pour les calculs suivants."
          ],
          "code": "print(round(2.5))\nprint(round(3.5))\ntaux = 100 / 3\nprint(f\"{taux:.2f} %\")",
          "language": "python",
          "output": "2\n4\n33.33 %",
          "interpretation": "Les nombres terminés par .5 peuvent être arrondis vers l'entier pair. Le format :.2f contrôle seulement l'affichage de taux."
        },
        {
          "id": "conversion",
          "title": "Conversion Built-ins: int, float, str and bool",
          "paragraphs": [
            "int transforme une représentation entière valide en entier ; float lit un décimal valide ; str donne une représentation textuelle ; bool évalue une valeur selon les règles de vérité de Python.",
            "Lors d'un import CSV, la conversion est souvent nécessaire avant tout calcul. Une chaîne non numérique provoque ValueError et doit faire l'objet d'un traitement explicite."
          ],
          "code": "print(int(\"12\"))\nprint(float(\"12.5\"))\nprint(str(75))\nprint(bool(\"\"))",
          "language": "python",
          "output": "12\n12.5\n75\nFalse",
          "interpretation": "La chaîne vide est évaluée comme fausse. Cette règle n'est pas la même qu'une interprétation métier du texte « non »."
        },
        {
          "id": "sorting",
          "title": "sorted, reversed and the Difference with list.sort()",
          "paragraphs": [
            "sorted renvoie une nouvelle liste triée ; reversed fournit un itérateur parcourant les valeurs en ordre inverse. Contrairement à sorted, la méthode list.sort() modifie directement la liste source.",
            "Un tri doit préserver l'alignement des observations liées : si des températures portent des dates, trier séparément les températures détruirait cette relation."
          ],
          "code": "valeurs = [30, 10, 20]\nprint(sorted(valeurs))\nprint(list(reversed(valeurs)))\nprint(valeurs)",
          "language": "python",
          "output": "[10, 20, 30]\n[20, 10, 30]\n[30, 10, 20]",
          "interpretation": "sorted et reversed ne modifient pas la liste de départ ; l'ordre original est conservé."
        },
        {
          "id": "iteration",
          "title": "range, enumerate and zip",
          "paragraphs": [
            "range produit des entiers pour une répétition ; enumerate associe indices et valeurs ; zip regroupe des éléments correspondants de plusieurs séquences.",
            "Attention : zip s'arrête à la longueur de la séquence la plus courte par défaut. Des données désalignées peuvent donc être perdues silencieusement, ce qui exige un contrôle préalable."
          ],
          "code": "machines = [\"M1\", \"M2\"]\nminutes = [40, 15]\nfor numero, (machine, arret) in enumerate(zip(machines, minutes), start=1):\n    print(numero, machine, arret)",
          "language": "python",
          "output": "1 M1 40\n2 M2 15",
          "interpretation": "zip associe le même rang dans les deux listes. enumerate ajoute une numérotation de lignes destinée au rapport."
        },
        {
          "id": "boolean",
          "title": "any and all for Data Validation",
          "paragraphs": [
            "any renvoie True lorsqu'au moins une valeur est vraie ; all renvoie True lorsque toutes les valeurs sont vraies. Ces fonctions expriment des contrôles globaux très lisibles.",
            "Attention aux listes vides : any([]) vaut False alors que all([]) vaut True. Si une vérification exige l'existence de données, contrôle également len(valeurs) > 0."
          ],
          "code": "mesures = [70, 82, 91]\nprint(any(t > 80 for t in mesures))\nprint(all(t > 60 for t in mesures))\nprint(all([]))",
          "language": "python",
          "output": "True\nTrue\nTrue",
          "interpretation": "Au moins une mesure dépasse 80 et toutes dépassent 60. Le dernier résultat illustre pourquoi il faut traiter les collections vides."
        },
        {
          "id": "functions-as-values",
          "title": "Built-ins with key Functions",
          "paragraphs": [
            "Certaines built-ins acceptent une fonction de transformation via le paramètre key. Par exemple, max peut sélectionner un groupe selon sa durée d'arrêt, et sorted peut trier des fiches selon une mesure.",
            "Cette combinaison devient très utile lorsque tu manipules une liste de dictionnaires représentant des événements métiers."
          ],
          "code": "machines = [\n    {\"nom\": \"M1\", \"minutes\": 40},\n    {\"nom\": \"M2\", \"minutes\": 15}\n]\nplus_arretee = max(machines, key=lambda m: m[\"minutes\"])\nprint(plus_arretee[\"nom\"])",
          "language": "python",
          "output": "M1",
          "interpretation": "La fonction key définit le critère de comparaison. max sélectionne le dictionnaire dont le champ minutes est maximal."
        },
        {
          "id": "case",
          "title": "Mini-project: KPIs Using Built-in Functions Only",
          "paragraphs": [
            "Avant d'utiliser Pandas, tu peux calculer plusieurs KPI avec les built-ins et un petit ensemble de données. L'objectif est de savoir expliquer chaque fonction appelée et le sens des résultats.",
            "Dans l'exemple, une observation absente est conservée dans le décompte initial, puis exclue des calculs numériques. Le taux de couverture doit être communiqué."
          ],
          "code": "temps_arret = [10, 15, None, 25]\nvalides = [v for v in temps_arret if v is not None]\ntotal = sum(valides)\nmoyenne = total / len(valides) if valides else None\ncouverture = 100 * len(valides) / len(temps_arret)\nprint(total, moyenne)\nprint(f\"Couverture : {couverture:.0f} %\")",
          "language": "python",
          "output": "50 16.666666666666668\nCouverture : 75 %",
          "interpretation": "Trois durées sur quatre sont connues. La moyenne de 16,67 minutes ne doit pas être présentée comme provenant de quatre événements complets."
        }
      ],
      "mistakes": [
        "Confondre l'affichage de print avec une valeur renvoyée par une fonction.",
        "Exécuter min ou max sur une liste vide sans garde.",
        "Oublier que zip tronque par défaut au plus court itérable.",
        "Croire que all([]) prouve que des données sont réellement présentes.",
        "Écraser une fonction intégrée avec une variable nommée sum, max, len ou list.",
        "Arrondir un KPI à chaque étape et accumuler des erreurs de précision."
      ],
      "conclusion": [
        "Tu sais désormais utiliser les built-in functions essentielles et expliquer ce qu'elles renvoient. Elles permettent des analyses élémentaires autonomes et clarifient le fonctionnement des outils plus avancés.",
        "La suite logique consiste à apprendre à créer tes propres fonctions avec def, afin de transformer ces calculs en composants fiables et réutilisables."
      ],
      "faq": [
        {
          "question": "What is a built-in function?",
          "answer": "Une fonction fournie directement par Python sans import, comme len, sum, sorted ou type."
        },
        {
          "question": "What is the difference between print and return?",
          "answer": "print affiche un message ; return est une instruction utilisée dans une fonction pour renvoyer un résultat."
        },
        {
          "question": "Why does len not work on an integer?",
          "answer": "len attend un objet de longueur définie comme une liste, une chaîne ou un dictionnaire."
        },
        {
          "question": "Why does all([]) return True?",
          "answer": "Il n'existe aucun élément qui contredise la condition. Pour valider un jeu de données, vérifie aussi qu'il n'est pas vide."
        },
        {
          "question": "What is the difference between sorted and sort?",
          "answer": "sorted retourne une nouvelle liste triée ; list.sort modifie la liste source."
        },
        {
          "question": "How do I use zip safely?",
          "answer": "Vérifie les longueurs des séquences ou utilise strict=True dans les versions récentes de Python."
        }
      ]
    }
  },
  {
    "slug": "python-user-defined-functions",
    "pointIndex": 3,
    "article": {
      "eyebrow": "PYTHON · BEGINNER'S GUIDE",
      "title": "User-defined Functions in Python: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une fonction définie par l'utilisateur transforme un calcul répété en une opération nommée, testable et réutilisable. Dans un projet d'analyse de données, elle peut calculer un taux, nettoyer une colonne ou valider une mesure.",
        "Ce cours traite réellement def, les paramètres et arguments, la différence entre print et return, les valeurs par défaut, la portée des variables, les annotations de type, les docstrings et les tests."
      ],
      "tldr": [
        "def nom(parametres): crée une fonction. Son bloc indenté s'exécute lorsque la fonction est appelée.",
        "Les paramètres sont les noms de la définition ; les arguments sont les valeurs fournies à l'appel. return renvoie un résultat réutilisable, contrairement à print.",
        "Une fonction professionnelle définit ce qu'elle accepte, ce qu'elle renvoie et comment elle gère les valeurs invalides."
      ],
      "sections": [
        {
          "id": "definition",
          "title": "What Is a User-defined Function?",
          "paragraphs": [
            "Une fonction définie avec def permet d'encapsuler une opération. Son nom doit exprimer une action : calculer_taux, verifier_temperature ou preparer_donnees sont plus utiles que f1.",
            "Une fonction n'est pas exécutée lorsqu'on écrit sa définition. Elle est exécutée lorsqu'on l'appelle avec des parenthèses et les arguments appropriés."
          ],
          "code": "def saluer(machine):\n    print(\"Inspection de\", machine)\n\nsaluer(\"M1\")\nsaluer(\"M2\")",
          "language": "python",
          "output": "Inspection de M1\nInspection de M2",
          "interpretation": "Une seule définition permet de produire deux messages distincts en variant l'argument machine."
        },
        {
          "id": "parameters",
          "title": "Parameters vs Arguments: Positional and Keyword",
          "paragraphs": [
            "Un paramètre est une variable placée dans la signature d'une fonction. Un argument est une valeur passée lors de son appel. Les arguments positionnels suivent l'ordre ; les arguments nommés identifient explicitement le paramètre.",
            "Pour des calculs métier, les appels nommés évitent des inversions difficiles à détecter lorsque plusieurs arguments portent le même type numérique."
          ],
          "code": "def calculer_pourcentage(part, total):\n    return 100 * part / total\n\nprint(calculer_pourcentage(2, 8))\nprint(calculer_pourcentage(total=8, part=2))",
          "language": "python",
          "output": "25.0\n25.0",
          "interpretation": "Les deux appels sont équivalents ; le second explicite le rôle de chaque valeur."
        },
        {
          "id": "return",
          "title": "The Difference Between return and print",
          "paragraphs": [
            "return renvoie une valeur à l'appelant, qui peut ensuite la stocker, la tester ou la transmettre à un autre calcul. print affiche une information, mais ne fournit pas à lui seul une valeur exploitable comme résultat de fonction.",
            "Une fonction sans return explicite renvoie None. Ce comportement cause souvent des erreurs lorsqu'un débutant essaye d'additionner la sortie d'une fonction qui affiche uniquement une valeur."
          ],
          "code": "def mauvais_double(x):\n    print(x * 2)\n\ndef bon_double(x):\n    return x * 2\n\nprint(mauvais_double(5))\nprint(bon_double(5) + 1)",
          "language": "python",
          "output": "10\nNone\n11",
          "interpretation": "mauvais_double affiche 10 mais renvoie None ; bon_double renvoie 10, qui peut ensuite être utilisé dans le calcul 10 + 1."
        },
        {
          "id": "defaults",
          "title": "Default Values and Named Arguments",
          "paragraphs": [
            "Un paramètre peut avoir une valeur par défaut. Cela réduit le nombre d'arguments à fournir lors des appels simples tout en permettant de personnaliser le comportement lorsque nécessaire.",
            "Évite les listes ou dictionnaires modifiables comme paramètres par défaut : leur contenu peut persister entre plusieurs appels et produire des résultats inattendus."
          ],
          "code": "def filtrer_alertes(mesures, seuil=80):\n    return [x for x in mesures if x > seuil]\n\nprint(filtrer_alertes([70, 85, 95]))\nprint(filtrer_alertes([70, 85, 95], seuil=90))",
          "language": "python",
          "output": "[85, 95]\n[95]",
          "interpretation": "Le seuil par défaut vaut 80. Un argument nommé remplace cette valeur seulement pour le second appel."
        },
        {
          "id": "scope",
          "title": "Local Variables, Scope and Side Effects",
          "paragraphs": [
            "Une variable créée dans une fonction est normalement locale. Pour favoriser la reproductibilité, une bonne fonction utilise ses paramètres et renvoie un résultat plutôt que de modifier des variables globales cachées.",
            "Une fonction qui modifie une liste reçue peut avoir des effets sur le reste du programme. Si ce comportement n'est pas voulu, copie les données ou construis un nouveau résultat."
          ],
          "code": "def ajouter_alerte(mesures, valeur):\n    nouvelle_liste = mesures.copy()\n    nouvelle_liste.append(valeur)\n    return nouvelle_liste\n\nsource = [70, 80]\nresultat = ajouter_alerte(source, 95)\nprint(source)\nprint(resultat)",
          "language": "python",
          "output": "[70, 80]\n[70, 80, 95]",
          "interpretation": "La fonction renvoie une nouvelle liste. Elle ne modifie pas la liste source fournie par l'appelant."
        },
        {
          "id": "types",
          "title": "Type Hints and Docstrings",
          "paragraphs": [
            "Les annotations de type décrivent les entrées et sorties attendues. Elles n'empêchent pas automatiquement Python de recevoir une valeur d'un autre type, mais améliorent l'autocomplétion et les vérifications statiques.",
            "Une docstring explique la finalité, les unités, les paramètres, la valeur retournée et les éventuelles conditions d'échec. Elle est particulièrement utile dans une équipe de développement."
          ],
          "code": "def conversion_minutes_vers_heures(minutes:float)->float:\n    \"\"\"Convertir une durée exprimée en minutes vers des heures.\"\"\"\n    if minutes < 0:\n        raise ValueError(\"Durée négative\")\n    return minutes / 60\n\nprint(conversion_minutes_vers_heures(90))\nprint(conversion_minutes_vers_heures.__doc__)",
          "language": "python",
          "output": "1.5\nConvertir une durée exprimée en minutes vers des heures.",
          "interpretation": "La fonction contrôle le domaine des valeurs puis renvoie une durée en heures. Sa docstring peut être affichée avec help."
        },
        {
          "id": "validation",
          "title": "Validating Input and Handling Edge Cases",
          "paragraphs": [
            "Une fonction métier doit définir une politique pour les entrées invalides. Par exemple, un ratio ne peut pas être calculé lorsque son dénominateur est zéro ou négatif.",
            "Selon le contrat de la fonction, tu peux renvoyer None, lever ValueError ou retourner une structure de résultat détaillée. Ce choix doit rester cohérent à travers le projet."
          ],
          "code": "def calculer_taux(defauts:int, pieces:int)->float:\n    if pieces <= 0:\n        raise ValueError(\"Le nombre de pièces doit être positif\")\n    if not (0 <= defauts <= pieces):\n        raise ValueError(\"Nombre de défauts incohérent\")\n    return 100 * defauts / pieces\n\nprint(calculer_taux(8, 200))",
          "language": "python",
          "output": "4.0",
          "interpretation": "Le contrôle assure un dénominateur positif et un nombre de défauts cohérent. Une entrée erronée ne devient pas un KPI plausible."
        },
        {
          "id": "testing",
          "title": "Testing a Function With Multiple Cases",
          "paragraphs": [
            "Un seul résultat correct ne prouve pas qu'une fonction fonctionne toujours. Il faut tester le cas nominal, une limite, une entrée vide ou invalide et si possible un autre jeu de données.",
            "Des assertions automatisent la comparaison entre le résultat produit et le résultat attendu. Dans un projet professionnel, elles servent de base à des tests unitaires."
          ],
          "code": "assert calculer_taux(8, 200) == 4.0\nassert calculer_taux(0, 100) == 0.0\nassert calculer_taux(100, 100) == 100.0\nprint(\"Trois tests réussis\")",
          "language": "python",
          "output": "Trois tests réussis",
          "interpretation": "Les assertions couvrent un cas nominal et deux limites. Il faut ajouter un test vérifiant que les entrées invalides lèvent ValueError."
        },
        {
          "id": "project",
          "title": "Mini-project: Reusable Industrial KPI Functions",
          "paragraphs": [
            "Construis un petit ensemble de fonctions : une validation des mesures, une agrégation des temps d'arrêt et un calcul du taux de disponibilité. Sépare les étapes pour pouvoir tester chaque composant.",
            "La disponibilité simplifiée est calculée sur une durée totale observée. Ce modèle n'est valable que si les minutes d'arrêt sont mesurées sur la même période et dans la même unité."
          ],
          "code": "def disponibilite_pct(minutes_arret, minutes_total):\n    if minutes_total <= 0:\n        raise ValueError(\"Durée totale invalide\")\n    if not 0 <= minutes_arret <= minutes_total:\n        raise ValueError(\"Durée d'arrêt invalide\")\n    return 100 * (minutes_total-minutes_arret)/minutes_total\n\nprint(disponibilite_pct(45, 600))",
          "language": "python",
          "output": "92.5",
          "interpretation": "La machine est disponible durant 555 des 600 minutes observées. Cette formule est une simplification qui suppose les états connus sur toute la période."
        }
      ],
      "mistakes": [
        "Écrire une fonction qui affiche le résultat sans return, puis essayer de réutiliser sa sortie.",
        "Inverser les arguments positionnels de deux grandeurs numériques.",
        "Utiliser une liste mutable comme valeur par défaut d'un paramètre.",
        "Faire dépendre le résultat de variables globales cachées.",
        "Ne tester que le cas nominal et oublier les bornes ou entrées invalides.",
        "Confondre annotations de type et validation effective des valeurs à l'exécution."
      ],
      "conclusion": [
        "Tu sais créer une fonction Python avec def, lui transmettre des arguments, récupérer ses résultats avec return, documenter son contrat et tester plusieurs cas.",
        "Pour devenir autonome en stage, transforme tes notebooks exploratoires en petites fonctions lisibles et reproductibles, puis fais vérifier leurs résultats et hypothèses par ton tuteur."
      ],
      "faq": [
        {
          "question": "What is a user-defined function in Python?",
          "answer": "Une fonction créée avec def pour exécuter un traitement réutilisable défini par le développeur."
        },
        {
          "question": "What is the difference between a parameter and an argument?",
          "answer": "Un paramètre est le nom dans la définition ; un argument est la valeur fournie lors de l'appel."
        },
        {
          "question": "What is the difference between print and return?",
          "answer": "print affiche une information ; return donne une valeur à l'appelant."
        },
        {
          "question": "Why avoid mutable default arguments?",
          "answer": "Un même objet peut être réutilisé entre plusieurs appels, entraînant des effets de bord inattendus."
        },
        {
          "question": "What is a docstring?",
          "answer": "Un texte placé dans la définition d'une fonction pour documenter son objectif et son contrat."
        },
        {
          "question": "Do type hints enforce runtime types?",
          "answer": "Non, pas par défaut. Ils guident la lecture et les outils de vérification statique."
        }
      ]
    }
  }
];
