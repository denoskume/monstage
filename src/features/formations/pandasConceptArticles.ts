import type {DeepConceptArticle} from './deepConceptTypes';
export const pandasConceptArticles:DeepConceptArticle[] = [
  {
    "slug": "pandas-dataframe",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PANDAS · DATA ANALYSIS",
      "title": "Pandas Series and DataFrames: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Pandas est une bibliothèque Python qui permet d'analyser des tableaux de données. La Series représente une colonne indexée, et le DataFrame représente un ensemble de colonnes organisées en lignes.",
        "Ce cours explique comment créer ces structures, lire leur forme, comprendre l'index, accéder à une colonne et définir ce qu'une ligne représente dans une mission métier."
      ],
      "tldr": [
        "Une Series associe des valeurs à un index ; un DataFrame rassemble des Series en colonnes nommées.",
        "Chaque ligne doit posséder un sens métier : commande, client, panne ou mesure. Le nombre de lignes ne représente pas automatiquement le nombre de clients ou de machines.",
        "Les données structurées peuvent ensuite être filtrées, nettoyées, regroupées et visualisées."
      ],
      "sections": [
        {
          "id": "what",
          "title": "What is Pandas and Why Use It?",
          "paragraphs": [
            "Pandas facilite la lecture, le nettoyage et l'analyse des données tabulaires. Il est couramment utilisé pour les fichiers CSV/Excel et les tableaux extraits de bases SQL.",
            "NumPy est centré sur les tableaux numériques ; Pandas ajoute une structure de colonnes nommées, des index, des valeurs manquantes et des fonctions de regroupement."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"arret_min\":[10,15]})\nprint(df.shape)\nprint(df.columns.tolist())",
          "language": "python",
          "output": "(2, 2)\n['machine', 'arret_min']",
          "interpretation": "Le DataFrame contient deux observations et deux colonnes. Les noms de colonnes donnent un sens aux valeurs."
        },
        {
          "id": "series",
          "title": "Understanding a Pandas Series",
          "paragraphs": [
            "Une Series est une séquence de valeurs associées à un index. Elle représente souvent une colonne du DataFrame, mais peut aussi être créée indépendamment.",
            "La méthode dtype indique le type de la colonne. Une série de nombres peut être agrégée ; une série de textes sert souvent à compter ou regrouper des catégories."
          ],
          "code": "import pandas as pd\ndurees=pd.Series([10,15,25],name=\"arret_min\")\nprint(durees.sum())\nprint(durees.dtype)",
          "language": "python",
          "output": "50\nint64",
          "interpretation": "Les trois durées totalisent 50 minutes. La Series possède un nom et un type numérique."
        },
        {
          "id": "dataframe",
          "title": "Creating and Inspecting a DataFrame",
          "paragraphs": [
            "Un DataFrame est une table de valeurs avec des colonnes et des lignes. On le crée fréquemment depuis un dictionnaire de listes, un CSV ou une requête SQL.",
            "shape donne les dimensions, columns les noms des colonnes, dtypes leurs types et head un premier aperçu. Vérifie toujours ces informations à l'import."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\",\"M1\"],\"minutes\":[10,15,25]})\nprint(df.shape)\nprint(df[\"machine\"].tolist())",
          "language": "python",
          "output": "(3, 2)\n['M1', 'M2', 'M1']",
          "interpretation": "M1 apparaît deux fois : chaque ligne représente un événement de panne, pas une machine unique."
        },
        {
          "id": "index",
          "title": "Understanding the DataFrame Index",
          "paragraphs": [
            "L'index étiquette les lignes. Par défaut, Pandas utilise souvent 0,1,2,..., mais on peut aussi choisir une colonne comme identifiant d'index.",
            "Un index n'est pas nécessairement un identifiant unique de métier. Il faut vérifier les clés avant une jointure, une déduplication ou un contrôle de comptage."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"minutes\":[10,15]})\ndf=df.set_index(\"machine\")\nprint(df.loc[\"M1\",\"minutes\"])",
          "language": "python",
          "output": "10",
          "interpretation": "La colonne machine devient l'index ; loc sélectionne une ligne par sa clé."
        },
        {
          "id": "columns",
          "title": "Selecting and Creating Columns",
          "paragraphs": [
            "Une colonne est accessible avec df['nom']. Une expression calculée peut créer une nouvelle colonne, par exemple convertir des minutes en heures.",
            "Les unités doivent rester explicites dans les noms des colonnes : arret_min et arret_h décrivent des grandeurs différentes et évitent des erreurs."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"arret_min\":[90,30]})\ndf[\"arret_h\"]=df[\"arret_min\"]/60\nprint(df[\"arret_h\"].tolist())",
          "language": "python",
          "output": "[1.5, 0.5]",
          "interpretation": "Les minutes sont converties en heures par une opération vectorisée sur toute la colonne."
        },
        {
          "id": "grain",
          "title": "Professional Example: Understand the Grain of Data",
          "paragraphs": [
            "Une table d'événements d'arrêt peut contenir plusieurs lignes par machine. Compter les lignes répond à « combien d'événements ? », tandis que nunique répond à « combien de machines ? ».",
            "Cette distinction est fondamentale dans les dashboards : compter des lignes à la place d'entités uniques peut donner des KPI trompeurs."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M1\",\"M2\"],\"minutes\":[10,25,15]})\nprint(\"Événements :\",len(df))\nprint(\"Machines :\",df[\"machine\"].nunique())",
          "language": "python",
          "output": "Événements : 3\nMachines : 2",
          "interpretation": "La table contient trois événements et deux machines distinctes. Ces nombres ne sont pas interchangeables."
        }
      ],
      "mistakes": [
        "Croire qu'un DataFrame est simplement une image de table sans types ni index.",
        "Confondre le nombre de lignes avec le nombre d'entités métiers uniques.",
        "Accéder à une colonne inexistante sans vérifier son nom réel.",
        "Effectuer des calculs sans connaître les unités des colonnes.",
        "Utiliser un index non unique comme clé métier en supposant l'unicité."
      ],
      "conclusion": [
        "Tu comprends maintenant les structures Series et DataFrame, leurs colonnes, leur index et leur granularité métier. Tu sais également créer une colonne calculée et comparer observations et entités uniques.",
        "La suite consiste à importer des données depuis CSV/Excel, puis à vérifier leur qualité avant les premiers calculs."
      ],
      "faq": [
        {
          "question": "What is a Pandas DataFrame?",
          "answer": "Un tableau de données à lignes indexées et colonnes nommées, pouvant avoir différents types."
        },
        {
          "question": "What is the difference between Series and DataFrame?",
          "answer": "Une Series est une structure unidimensionnelle ; un DataFrame rassemble plusieurs colonnes."
        },
        {
          "question": "What does df.shape mean?",
          "answer": "Le nombre de lignes et le nombre de colonnes du DataFrame."
        },
        {
          "question": "Why use nunique?",
          "answer": "Pour compter les valeurs distinctes d'une colonne, par exemple des machines ou clients uniques."
        },
        {
          "question": "What is the DataFrame index?",
          "answer": "Un système d'étiquettes utilisé pour sélectionner et aligner les lignes."
        }
      ]
    }
  },
  {
    "slug": "pandas-import",
    "pointIndex": 1,
    "article": {
      "eyebrow": "PANDAS · DATA ANALYSIS",
      "title": "Reading CSV and Excel with Pandas: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Les données d'entreprise arrivent souvent sous forme de CSV et de fichiers Excel. Pandas permet de les lire dans un DataFrame, mais une lecture réussie ne garantit pas que les valeurs sont correctement interprétées.",
        "Cet article détaille read_csv, read_excel, les séparateurs, les types, les valeurs manquantes et le contrôle de l'import, puis construit un exemple métier complet."
      ],
      "tldr": [
        "pd.read_csv charge un fichier CSV ; pd.read_excel charge une feuille Excel, parfois avec le moteur openpyxl.",
        "Les principaux paramètres incluent sep, encoding, dtype, parse_dates et sheet_name. Vérifie les colonnes après l'import.",
        "Avant toute analyse, contrôle la forme, le grain, les types, les valeurs manquantes et la provenance des données."
      ],
      "sections": [
        {
          "id": "readcsv",
          "title": "Reading a CSV with pd.read_csv",
          "paragraphs": [
            "read_csv construit un DataFrame depuis un chemin ou un objet fichier. Par défaut, il attend une virgule comme séparateur, mais des exports français utilisent souvent un point-virgule.",
            "Un test rapide avec head, shape et dtypes permet de détecter un séparateur incorrect ou une colonne qui aurait dû être numérique."
          ],
          "code": "import pandas as pd\nfrom io import StringIO\ncsv=StringIO(\"machine;minutes\\nM1;10\\nM2;15\")\ndf=pd.read_csv(csv,sep=\";\")\nprint(df.shape)\nprint(df[\"minutes\"].sum())",
          "language": "python",
          "output": "(2, 2)\n25",
          "interpretation": "Le séparateur ; produit deux colonnes distinctes. Les durées sont reconnues comme valeurs numériques."
        },
        {
          "id": "types",
          "title": "Controlling Types and Numeric Conversions",
          "paragraphs": [
            "Une colonne peut contenir du texte là où des nombres sont attendus. pd.to_numeric transforme les valeurs convertibles et permet, avec errors='coerce', de marquer les autres comme manquantes.",
            "Une conversion silencieuse sans comptage des échecs serait problématique. Tu dois mesurer les nouvelles valeurs manquantes et remonter la cause à la source."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"minutes\":[\"10\",\"15\",\"inconnu\"]})\ndf[\"minutes\"]=pd.to_numeric(df[\"minutes\"],errors=\"coerce\")\nprint(df[\"minutes\"].tolist())\nprint(df[\"minutes\"].isna().sum())",
          "language": "python",
          "output": "[10.0, 15.0, nan]\n1",
          "interpretation": "Une durée n'a pas pu être convertie. Elle est marquée NaN et doit être documentée."
        },
        {
          "id": "dates",
          "title": "Parsing Date Columns on Import",
          "paragraphs": [
            "Les dates peuvent être interprétées comme du texte. Une conversion vers datetime permet ensuite de calculer des durées, trier chronologiquement et regrouper par mois.",
            "Précise les formats locaux pour éviter les ambiguïtés comme 03/04/2026, qui peut signifier 3 avril ou 4 mars selon le contexte."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"date\":[\"2026-11-01\",\"2026-11-05\"]})\ndf[\"date\"]=pd.to_datetime(df[\"date\"])\nprint((df.loc[1,\"date\"]-df.loc[0,\"date\"]).days)",
          "language": "python",
          "output": "4",
          "interpretation": "Après conversion, les dates sont de véritables objets temporels utilisables pour un calcul de durée."
        },
        {
          "id": "excel",
          "title": "Reading Excel Worksheets",
          "paragraphs": [
            "read_excel lit des classeurs Excel, éventuellement en choisissant une feuille avec sheet_name. Les formules, valeurs et formats visibles dans Excel ne sont pas toujours identiques aux types chargés.",
            "Après l'import, vérifie la feuille choisie, les en-têtes, le nombre de lignes et les cellules vides. Ne te fie pas uniquement à la mise en forme du classeur."
          ],
          "code": "import pandas as pd\n# Avec un fichier Excel réel :\n# df = pd.read_excel(\"mesures.xlsx\", sheet_name=\"Capteurs\")\n# Puis vérifier :\ndf=pd.DataFrame({\"machine\":[\"M1\"],\"minutes\":[10]})\nprint(df.columns.tolist())",
          "language": "python",
          "output": "['machine', 'minutes']",
          "interpretation": "L'exemple reste autonome sans fichier téléchargé. Avec un vrai classeur, ajoute un contrôle des feuilles disponibles."
        },
        {
          "id": "quality",
          "title": "Initial Import Quality Checklist",
          "paragraphs": [
            "Pour un fichier CSV/Excel, les contrôles de base sont shape, columns, dtypes, isna().sum(), duplicated().sum() et la cohérence des clés métiers.",
            "Une série de nombres calculée dans Pandas peut être erronée si les lignes sont dupliquées ou si les unités ont été mélangées. Il faut corriger en comprenant la source."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M1\"],\"minutes\":[10,None]})\nprint(\"Lignes :\",len(df))\nprint(\"Manquantes :\",df[\"minutes\"].isna().sum())\nprint(\"Doublons exacts :\",df.duplicated().sum())",
          "language": "python",
          "output": "Lignes : 2\nManquantes : 1\nDoublons exacts : 0",
          "interpretation": "La même machine apparaît deux fois sans que les lignes soient exactement identiques : ce n'est pas automatiquement un doublon."
        },
        {
          "id": "project",
          "title": "Mini-project: Import and Validate Downtime Data",
          "paragraphs": [
            "Simule un CSV contenant plusieurs machines, une durée mal saisie et une date. Lis le contenu, convertis explicitement la durée et calcule le taux de couverture.",
            "Dans un projet réel, conserve le fichier brut, les règles de conversion et les lignes rejetées afin qu'un tuteur puisse reproduire les décisions."
          ],
          "code": "import pandas as pd\nfrom io import StringIO\nsrc=StringIO(\"machine,minutes\\nM1,10\\nM2,inconnu\\nM1,25\")\ndf=pd.read_csv(src)\ndf[\"minutes\"]=pd.to_numeric(df[\"minutes\"],errors=\"coerce\")\ncouverture=100*df[\"minutes\"].notna().mean()\nprint(f\"Couverture : {couverture:.1f} %\")\nprint(df.groupby(\"machine\")[\"minutes\"].sum())",
          "language": "python",
          "output": "Couverture : 66.7 %\nmachine\nM1    35.0\nM2     0.0\nName: minutes, dtype: float64",
          "interpretation": "Attention : Pandas sum peut retourner 0 pour un groupe entièrement manquant. Pour éviter de le confondre avec une durée nulle connue, utilise sum(min_count=1)."
        }
      ],
      "mistakes": [
        "Confondre un séparateur CSV incorrect avec des colonnes valides.",
        "Supposer que les nombres et dates importés ont toujours le bon dtype.",
        "Ne pas relever le nombre de conversions ratées avec errors='coerce'.",
        "Interpréter une somme de zéro sur un groupe entièrement manquant comme une absence réelle d'arrêt.",
        "Écraser les données sources après nettoyage."
      ],
      "conclusion": [
        "Tu sais maintenant lire des CSV/Excel et comprendre les paramètres nécessaires pour les interpréter correctement. Le contrôle de qualité doit précéder tout graphique ou tableau de bord.",
        "En stage, conserver la source et produire un rapport des valeurs manquantes ou incorrectes fait partie du livrable, même si le fichier semble simple."
      ],
      "faq": [
        {
          "question": "What does pd.read_csv do?",
          "answer": "Charge un fichier CSV en DataFrame Pandas."
        },
        {
          "question": "How can I read a semicolon-delimited CSV?",
          "answer": "Utilise pd.read_csv('fichier.csv', sep=';')."
        },
        {
          "question": "How do I read an Excel worksheet?",
          "answer": "Utilise pd.read_excel('fichier.xlsx',sheet_name='NomFeuille') lorsque le fichier et les dépendances sont disponibles."
        },
        {
          "question": "Why does pd.to_numeric create NaN?",
          "answer": "Avec errors='coerce', les entrées impossibles à convertir deviennent des valeurs manquantes."
        },
        {
          "question": "What should I check right after reading a dataset?",
          "answer": "Le nombre de lignes et colonnes, les types, les valeurs manquantes, les clés et la provenance."
        }
      ]
    }
  },
  {
    "slug": "pandas-exploration",
    "pointIndex": 2,
    "article": {
      "eyebrow": "PANDAS · DATA ANALYSIS",
      "title": "Exploring Data with head, info and describe: A Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Avant de produire des calculs, un Data Analyst doit comprendre rapidement la structure d'un fichier. Pandas fournit des fonctions pour inspecter les premières lignes, les types, les statistiques et la qualité.",
        "Ce guide enseigne head, tail, shape, info, describe, value_counts, nunique et isna, en expliquant quelles questions elles permettent de résoudre."
      ],
      "tldr": [
        "head et tail montrent des lignes, shape donne les dimensions, info décrit les colonnes et describe résume certaines statistiques.",
        "value_counts et nunique explorent les catégories, tandis que isna quantifie les valeurs manquantes.",
        "Une exploration réussie ne remplace pas l'analyse : elle définit ce qui peut être calculé et les précautions nécessaires."
      ],
      "sections": [
        {
          "id": "head",
          "title": "Inspect the First and Last Rows",
          "paragraphs": [
            "head(n) affiche les n premières lignes ; tail(n) les dernières. C'est souvent la première étape pour vérifier les en-têtes, les formats et la présence de valeurs absurdes.",
            "Une seule vue des cinq premières lignes ne prouve pas que tout le fichier est correct. Combine cet aperçu avec les contrôles de types et de manquants."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\",\"M1\"],\"minutes\":[10,15,25]})\nprint(df.head(2).to_string(index=False))\nprint(df.tail(1).to_string(index=False))",
          "language": "python",
          "output": "machine  minutes\n     M1       10\n     M2       15\nmachine  minutes\n     M1       25",
          "interpretation": "head et tail affichent des portions différentes du jeu de données sans modifier les lignes source."
        },
        {
          "id": "shape",
          "title": "Understand Shape and the Grain",
          "paragraphs": [
            "shape renvoie (lignes, colonnes). Le nombre de lignes mesure le nombre d'enregistrements, qui dépend du grain choisi pour le fichier.",
            "Une table de commandes peut avoir cent lignes mais seulement vingt clients. L'analyste doit préciser ce que chaque ligne représente avant de produire des indicateurs."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"client\":[\"A\",\"A\",\"B\"],\"commande\":[1,2,3]})\nprint(df.shape)\nprint(df[\"client\"].nunique())",
          "language": "python",
          "output": "(3, 2)\n2",
          "interpretation": "Trois commandes sont associées à deux clients uniques, ce qui représente deux indicateurs différents."
        },
        {
          "id": "info",
          "title": "Use info and dtypes to Detect Structural Issues",
          "paragraphs": [
            "info décrit le nombre de valeurs non nulles et les types des colonnes. dtypes renvoie la liste des types, ce qui permet de repérer des nombres importés en texte.",
            "Des types object ou string doivent être examinés avant une opération numérique. Un champ de durée mal typé peut conduire à des calculs impossibles ou incorrects."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"minutes\":[\"10\",\"20\",\"30\"]})\nprint(df.dtypes[\"minutes\"])\ndf[\"minutes\"]=pd.to_numeric(df[\"minutes\"])\nprint(df.dtypes[\"minutes\"])",
          "language": "python",
          "output": "object\nint64",
          "interpretation": "La colonne passe d'un type de texte générique à un type numérique ; la conversion rend la somme pertinente."
        },
        {
          "id": "describe",
          "title": "Descriptive Statistics with describe",
          "paragraphs": [
            "describe fournit des indicateurs comme count, mean, std, min, quartiles et max pour les colonnes numériques. Ces valeurs permettent de repérer une plage surprenante ou une dispersion élevée.",
            "Une valeur maximale très éloignée de la médiane mérite une investigation, mais n'est pas automatiquement une erreur."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"minutes\":[10,15,20,100]})\nprint(df[\"minutes\"].describe()[[\"count\",\"mean\",\"min\",\"max\"]])",
          "language": "python",
          "output": "count      4.00\nmean      36.25\nmin       10.00\nmax      100.00\nName: minutes, dtype: float64",
          "interpretation": "Un événement de 100 minutes augmente la moyenne. La médiane fournirait une information supplémentaire sur l'événement typique."
        },
        {
          "id": "categories",
          "title": "value_counts, nunique and Category Coverage",
          "paragraphs": [
            "value_counts dénombre les occurrences de chaque catégorie et nunique compte les catégories distinctes. Ces fonctions permettent de repérer les déséquilibres ou les variantes d'écriture.",
            "Les catégories 'M1' et ' m1 ' seraient distinctes sans normalisation explicite. Il faut contrôler les libellés avant de conclure sur le nombre réel de machines."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M1\",\"M2\",\"M3\"]})\nprint(df[\"machine\"].value_counts().to_dict())\nprint(df[\"machine\"].nunique())",
          "language": "python",
          "output": "{'M1': 2, 'M2': 1, 'M3': 1}\n3",
          "interpretation": "M1 apparaît deux fois ; trois machines distinctes sont représentées."
        },
        {
          "id": "missing",
          "title": "Missingness and Simple Quality Reports",
          "paragraphs": [
            "isna renvoie un masque de valeurs manquantes ; sum appliqué à ce masque les compte par colonne. Pour comparer des fichiers de tailles différentes, il peut être préférable de calculer un pourcentage.",
            "Un taux de manquants ne précise pas leur cause : panne de collecte, champ facultatif et défaut de saisie nécessitent des traitements différents."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\",\"M3\"],\"minutes\":[10,None,20]})\nprint(df.isna().sum().to_dict())\nprint(round(100*df[\"minutes\"].isna().mean(),1))",
          "language": "python",
          "output": "{'machine': 0, 'minutes': 1}\n33.3",
          "interpretation": "Une durée manque sur trois. Le taux de manque est 33,3 %, mais la raison doit être recherchée."
        },
        {
          "id": "case",
          "title": "Professional Exploration Checklist",
          "paragraphs": [
            "Pour toute nouvelle source, rédige une petite fiche de diagnostic : période, provenance, grain, colonnes, nombre de lignes, valeurs manquantes et types.",
            "Cette procédure permet à l'équipe de détecter rapidement les problèmes avant de passer au nettoyage, puis d'expliquer pourquoi certaines observations seront ou non utilisées."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"minutes\":[10,15]})\ndiagnostic={\n \"lignes\":len(df),\n \"colonnes\":len(df.columns),\n \"machines\":df[\"machine\"].nunique(),\n \"minutes_manquantes\":int(df[\"minutes\"].isna().sum())\n}\nprint(diagnostic)",
          "language": "python",
          "output": "{'lignes': 2, 'colonnes': 2, 'machines': 2, 'minutes_manquantes': 0}",
          "interpretation": "Le diagnostic résume la structure et un contrôle de qualité élémentaire. Il reste à ajouter la période et la source pour un vrai rapport."
        }
      ],
      "mistakes": [
        "Utiliser head() comme seul contrôle des données.",
        "Confondre le nombre de lignes avec le nombre d'entités uniques.",
        "Interpréter les statistiques descriptives sans examiner les distributions.",
        "Ignorer les types des colonnes et les conversions nécessaires.",
        "Supposer que le taux de valeurs manquantes indique leur cause."
      ],
      "conclusion": [
        "Tu sais maintenant explorer un DataFrame avant toute analyse. Les fonctions de diagnostic fournissent des preuves rapides sur la structure, les types et les valeurs.",
        "La suite est d'apprendre à sélectionner précisément les lignes et colonnes pertinentes avec loc, iloc et les masques de filtrage."
      ],
      "faq": [
        {
          "question": "What does df.head() show?",
          "answer": "Les premières lignes d'un DataFrame, par défaut cinq."
        },
        {
          "question": "What does df.info() show?",
          "answer": "La structure des colonnes, les types et les nombres de valeurs non nulles."
        },
        {
          "question": "What is df.describe() for?",
          "answer": "Résumer des statistiques descriptives des colonnes numériques, et d'autres types selon les options."
        },
        {
          "question": "What does nunique count?",
          "answer": "Les valeurs distinctes d'une colonne."
        },
        {
          "question": "How do I calculate the missing rate?",
          "answer": "Avec df['colonne'].isna().mean()*100 pour obtenir un pourcentage."
        }
      ]
    }
  },
  {
    "slug": "pandas-filtering",
    "pointIndex": 3,
    "article": {
      "eyebrow": "PANDAS · DATA ANALYSIS",
      "title": "Pandas loc, iloc and Filtering: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Après l'import, l'analyste doit sélectionner les observations qui répondent à une question : les machines d'un site, les pannes dépassant trente minutes ou les événements d'une période donnée.",
        "Cet article distingue loc et iloc, présente les conditions booléennes, les sélections de colonnes, les filtres combinés et les précautions liées aux vues et copies."
      ],
      "tldr": [
        "loc sélectionne par étiquette d'index et noms de colonnes ; iloc sélectionne par position numérique.",
        "Un filtre booléen comme df[df['minutes'] > 20] sélectionne uniquement les lignes où la condition est vraie.",
        "Lors de l'affectation de nouvelles valeurs, utilise loc ou copy() pour éviter les modifications ambiguës d'un DataFrame filtré."
      ],
      "sections": [
        {
          "id": "loc",
          "title": "Selecting Rows and Columns with loc",
          "paragraphs": [
            "loc utilise les étiquettes de lignes et les noms de colonnes. Sur un index numérique standard, df.loc[0] sélectionne l'étiquette zéro, mais sur un index personnalisé elle sélectionne la clé correspondante.",
            "Une sélection avec loc est très utile pour filtrer et mettre à jour explicitement les valeurs d'une colonne."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\",\"M3\"],\"minutes\":[10,25,40]})\nprint(df.loc[1,\"machine\"])\nprint(df.loc[0:1,\"minutes\"].tolist())",
          "language": "python",
          "output": "M2\n[10, 25]",
          "interpretation": "Contrairement à un slice Python classique, loc inclut généralement la borne finale lorsque l'index est ordonné et que les étiquettes existent."
        },
        {
          "id": "iloc",
          "title": "Selecting Positions with iloc",
          "paragraphs": [
            "iloc utilise les positions entières et fonctionne selon les règles habituelles de slicing Python. La borne finale d'un slice iloc est exclue.",
            "Il est important de différencier une position et une étiquette, surtout après un filtrage ou un tri qui conserve l'index original."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\",\"M3\"],\"minutes\":[10,25,40]})\nprint(df.iloc[0,1])\nprint(df.iloc[:2,0].tolist())",
          "language": "python",
          "output": "10\n['M1', 'M2']",
          "interpretation": "iloc[0,1] sélectionne première ligne, deuxième colonne. [:2] conserve seulement les positions 0 et 1."
        },
        {
          "id": "filter",
          "title": "Boolean Filtering with One Condition",
          "paragraphs": [
            "Un masque de comparaison comme df['minutes'] > 20 renvoie True ou False pour chaque ligne. Le DataFrame filtré conserve seulement les observations marquées True.",
            "Une comparaison doit préciser l'unité et le sens de l'inégalité. > 20 exclut exactement 20, tandis que >= 20 inclut cette valeur."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M2\",\"M3\"],\"minutes\":[10,25,40]})\nlongs=df.loc[df[\"minutes\"]>20]\nprint(longs[\"machine\"].tolist())",
          "language": "python",
          "output": "['M2', 'M3']",
          "interpretation": "Les pannes de 25 et 40 minutes sont retenues ; la panne de 10 minutes est exclue."
        },
        {
          "id": "multiple",
          "title": "Combining Conditions with & and |",
          "paragraphs": [
            "Pandas utilise & pour combiner des masques par et logique, | pour ou logique et ~ pour la négation. Chaque comparaison doit être entourée de parenthèses pour éviter les surprises de priorité.",
            "Les opérateurs Python and et or ne conviennent pas directement à la combinaison de Series booléennes comportant plusieurs éléments."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"site\":[\"Nantes\",\"Paris\",\"Nantes\"],\"minutes\":[10,25,40]})\nselection=df[(df[\"site\"]==\"Nantes\") & (df[\"minutes\"]>20)]\nprint(selection[\"minutes\"].tolist())",
          "language": "python",
          "output": "[40]",
          "interpretation": "Une seule observation appartient à Nantes et dépasse 20 minutes."
        },
        {
          "id": "assign",
          "title": "Updating Columns Safely with loc",
          "paragraphs": [
            "Lorsqu'on modifie une colonne après un filtre, une affectation sur une vue intermédiaire peut être ambiguë. La forme df.loc[masque,'colonne'] = valeur modifie explicitement la table souhaitée.",
            "Pour conserver le DataFrame original, utilise .copy() après la sélection. Ce choix doit être explicite dans le pipeline."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"minutes\":[10,25,40]})\ndf.loc[df[\"minutes\"]>20,\"etat\"]=\"Long\"\nprint(df[\"etat\"].tolist())",
          "language": "python",
          "output": "[nan, 'Long', 'Long']",
          "interpretation": "Les deux lignes au-dessus de 20 reçoivent l'étiquette Long. La première ligne n'a pas d'étiquette et reste manquante."
        },
        {
          "id": "case",
          "title": "Mini-project: Review Long Machine Shutdowns",
          "paragraphs": [
            "Une équipe veut vérifier les arrêts de plus de 30 minutes à Nantes. Combine les filtres puis calcule le nombre d'événements et leur durée cumulée.",
            "Un tel rapport doit documenter la période d'observation et ne pas conclure immédiatement sur la cause des arrêts."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\n \"site\":[\"Nantes\",\"Nantes\",\"Paris\",\"Nantes\"],\n \"minutes\":[15,40,50,35]\n})\nselection=df[(df[\"site\"]==\"Nantes\")&(df[\"minutes\"]>30)]\nprint(len(selection))\nprint(selection[\"minutes\"].sum())",
          "language": "python",
          "output": "2\n75",
          "interpretation": "Deux événements nantais dépassent 30 minutes, avec 75 minutes cumulées dans ce sous-ensemble."
        }
      ],
      "mistakes": [
        "Confondre loc (étiquettes) et iloc (positions).",
        "Supposer que le slicing loc exclut toujours sa borne finale.",
        "Utiliser and/or sur des Series booléennes Pandas.",
        "Oublier les parenthèses lorsque plusieurs comparaisons sont combinées.",
        "Modifier un DataFrame filtré sans comprendre la copie ou la vue."
      ],
      "conclusion": [
        "Tu sais sélectionner précisément des lignes et colonnes avec loc et iloc, combiner plusieurs conditions et mettre à jour une colonne de façon explicite.",
        "Ces compétences préparent les analyses par groupe, où l'on passe d'observations individuelles à des indicateurs synthétiques."
      ],
      "faq": [
        {
          "question": "What is the difference between loc and iloc?",
          "answer": "loc utilise les étiquettes ; iloc utilise les positions numériques."
        },
        {
          "question": "How do I filter rows in Pandas?",
          "answer": "Avec un masque, par exemple df.loc[df['minutes']>20]."
        },
        {
          "question": "How do I combine two filters?",
          "answer": "Utilise des parenthèses autour des comparaisons et & pour ET ou | pour OU."
        },
        {
          "question": "Does iloc include the slice end?",
          "answer": "Non, comme les slices Python habituels."
        },
        {
          "question": "Why use copy after filtering?",
          "answer": "Pour obtenir un DataFrame indépendant avant une transformation."
        }
      ]
    }
  },
  {
    "slug": "pandas-groupby",
    "pointIndex": 4,
    "article": {
      "eyebrow": "PANDAS · DATA ANALYSIS",
      "title": "Pandas GroupBy, Aggregation and Pivot Tables: A Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Les questions métier nécessitent souvent de transformer des observations individuelles en indicateurs par catégorie : ventes par magasin, arrêts par machine, moyenne de température par site.",
        "Pandas fournit groupby, agg et pivot_table pour produire ces résumés. Ce cours explique comment définir le grain, choisir les fonctions d'agrégation, interpréter les valeurs manquantes et vérifier les totaux."
      ],
      "tldr": [
        "groupby rassemble les lignes selon les valeurs d'une ou plusieurs clés. Les fonctions sum, mean, count, size et max réalisent des statistiques par groupe.",
        "agg permet de calculer plusieurs indicateurs à la fois ; pivot_table construit un tableau croisé sous une forme proche d'Excel.",
        "Le résultat doit être contrôlé : la somme de groupes doit correspondre à la source lorsque l'opération choisie le justifie."
      ],
      "sections": [
        {
          "id": "concept",
          "title": "What GroupBy Does and Why It Matters",
          "paragraphs": [
            "Un DataFrame contient des événements ; groupby associe ceux qui appartiennent à une même catégorie, puis calcule les indicateurs voulus. Le grain du résultat devient alors « une ligne par catégorie ».",
            "Il est essentiel de savoir si l'on groupe des événements par machine, site ou mois. Changer de clé change la question à laquelle répond le rapport."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M1\",\"M2\"],\"minutes\":[10,25,15]})\nprint(df.groupby(\"machine\")[\"minutes\"].sum())",
          "language": "python",
          "output": "machine\nM1    35\nM2    15\nName: minutes, dtype: int64",
          "interpretation": "M1 possède deux événements cumulant 35 minutes. Le résultat comporte une ligne par machine."
        },
        {
          "id": "functions",
          "title": "sum, mean, count, size and max",
          "paragraphs": [
            "sum additionne les durées, mean calcule une moyenne, max donne la valeur la plus grande, count compte les valeurs non manquantes et size compte les lignes du groupe.",
            "count et size diffèrent lorsqu'une colonne contient des valeurs absentes. Dans un rapport de qualité, cette distinction permet de mesurer la couverture."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M1\",\"M2\"],\"minutes\":[10,None,15]})\ng=df.groupby(\"machine\")[\"minutes\"]\nprint(g.count().to_dict())\nprint(g.size().to_dict())",
          "language": "python",
          "output": "{'M1': 1, 'M2': 1}\n{'M1': 2, 'M2': 1}",
          "interpretation": "M1 contient deux événements mais une seule durée connue. count n'inclut pas la valeur manquante."
        },
        {
          "id": "agg",
          "title": "Calculate Several Indicators with agg",
          "paragraphs": [
            "agg applique une ou plusieurs fonctions d'agrégation. Les agrégations nommées permettent de fournir des colonnes de résultat avec des noms métier compréhensibles.",
            "Utilise les mêmes périodes et unités pour comparer les groupes. La moyenne de durée ne doit pas être confondue avec le total d'arrêts."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"machine\":[\"M1\",\"M1\",\"M2\"],\"minutes\":[10,25,15]})\nresult=df.groupby(\"machine\").agg(\n total_min=(\"minutes\",\"sum\"),\n moyenne_min=(\"minutes\",\"mean\"),\n evenements=(\"minutes\",\"size\")\n)\nprint(result.loc[\"M1\"].to_dict())",
          "language": "python",
          "output": "{'total_min': 35.0, 'moyenne_min': 17.5, 'evenements': 2.0}",
          "interpretation": "La même machine est décrite par le total 35, la moyenne 17,5 et le nombre d'événements 2."
        },
        {
          "id": "multiplekeys",
          "title": "Grouping by Site and Machine",
          "paragraphs": [
            "On peut regrouper selon plusieurs colonnes, par exemple site et machine. Le résultat possède alors un index à plusieurs niveaux, que reset_index peut convertir en colonnes classiques.",
            "Cette approche est utile lorsque les identifiants de machines ne sont pas uniques entre sites, ou lorsqu'on veut comparer le même type d'équipement dans plusieurs installations."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"site\":[\"N\",\"N\",\"P\"],\"machine\":[\"M1\",\"M2\",\"M1\"],\"min\":[10,20,30]})\nresult=df.groupby([\"site\",\"machine\"],as_index=False)[\"min\"].sum()\nprint(result.shape)",
          "language": "python",
          "output": "(3, 3)",
          "interpretation": "Trois couples site-machine distincts restent dans le résultat. Le même identifiant M1 peut apparaître sur deux sites."
        },
        {
          "id": "pivot",
          "title": "Pivot Tables and Cross-tabulation",
          "paragraphs": [
            "pivot_table transforme une variable catégorielle en lignes, une autre en colonnes, puis calcule une statistique dans chaque cellule. Elle rappelle le tableau croisé dynamique d'Excel.",
            "Il faut choisir explicitement la fonction d'agrégation : par défaut, pivot_table utilise souvent la moyenne ; un total d'arrêt exige sum."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\n \"site\":[\"Nantes\",\"Nantes\",\"Paris\"],\n \"machine\":[\"M1\",\"M2\",\"M1\"],\n \"minutes\":[10,20,30]\n})\ntable=df.pivot_table(index=\"site\",columns=\"machine\",values=\"minutes\",aggfunc=\"sum\")\nprint(table.loc[\"Nantes\",\"M1\"])",
          "language": "python",
          "output": "10.0",
          "interpretation": "La cellule Nantes/M1 correspond à dix minutes. Les combinaisons sans observation peuvent apparaître comme NaN."
        },
        {
          "id": "missing",
          "title": "Avoid Misleading Sums on Missing Groups",
          "paragraphs": [
            "Une somme Pandas peut renvoyer zéro pour un groupe dont toutes les valeurs sont manquantes. Selon le sens métier, ce zéro pourrait être interprété à tort comme « aucun arrêt ».",
            "Le paramètre min_count=1 impose au moins une valeur connue avant de calculer une somme non manquante."
          ],
          "code": "import pandas as pd\ns=pd.Series([None,None],dtype=float)\nprint(s.sum())\nprint(s.sum(min_count=1))",
          "language": "python",
          "output": "0.0\nnan",
          "interpretation": "Le résultat nan signale que la somme est inconnue plutôt que de suggérer zéro minute d'arrêt."
        },
        {
          "id": "project",
          "title": "Professional Project: Machine Downtime Report",
          "paragraphs": [
            "Regroupe les événements par machine puis calcule total, moyenne, nombre d'événements et nombre de durées connues. Ces indicateurs sont complémentaires et permettent de discuter la qualité des données.",
            "Lors d'une restitution, indique la période d'observation et compare les totaux aux lignes originales avant toute conclusion de fiabilité."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\n \"machine\":[\"M1\",\"M1\",\"M2\",\"M2\"],\n \"minutes\":[10,25,15,None]\n})\nr=df.groupby(\"machine\").agg(\n total_min=(\"minutes\",\"sum\"),\n evenements=(\"minutes\",\"size\"),\n durées_connues=(\"minutes\",\"count\")\n)\nprint(r.loc[\"M2\"].to_dict())",
          "language": "python",
          "output": "{'total_min': 15.0, 'evenements': 2.0, 'durées_connues': 1.0}",
          "interpretation": "M2 a deux événements, mais un seul possède une durée connue. Le total de 15 minutes est donc partiel."
        }
      ],
      "mistakes": [
        "Confondre sum et mean et présenter une moyenne comme un total.",
        "Utiliser count à la place de size pour compter toutes les lignes.",
        "Créer une pivot_table sans vérifier aggfunc.",
        "Confondre un zéro calculé et une valeur inconnue dans un groupe entièrement manquant.",
        "Interpréter les groupes sans considérer les différences de période ou de parc machine."
      ],
      "conclusion": [
        "Tu sais désormais regrouper des données, produire plusieurs statistiques, construire un tableau croisé et contrôler la qualité des groupes.",
        "Ces techniques sont centrales dans les missions Data Analyst et facilitent la préparation des jeux de données pour Power BI ou Matplotlib."
      ],
      "faq": [
        {
          "question": "What is groupby in Pandas?",
          "answer": "Une opération qui regroupe des lignes selon des clés afin de calculer des statistiques par groupe."
        },
        {
          "question": "What is the difference between count and size?",
          "answer": "count compte les valeurs non manquantes ; size compte les lignes du groupe."
        },
        {
          "question": "What is agg used for?",
          "answer": "Définir une ou plusieurs agrégations, éventuellement avec des noms de résultat."
        },
        {
          "question": "What is pivot_table?",
          "answer": "Un tableau croisé regroupant les données selon des catégories en lignes et colonnes."
        },
        {
          "question": "Why can a sum of missing values be misleading?",
          "answer": "Par défaut, une somme peut retourner zéro même lorsque toutes les mesures du groupe sont inconnues."
        }
      ]
    }
  },
  {
    "slug": "pandas-merge-dates",
    "pointIndex": 5,
    "article": {
      "eyebrow": "PANDAS · DATA ANALYSIS",
      "title": "Pandas Merge, Dates and Export: A Complete Beginner’s Guide",
      "author": "MonStage Learning",
      "intro": [
        "Une analyse professionnelle combine souvent plusieurs tables : événements de panne, référentiel des machines, calendrier et informations de site. Pandas permet de les rapprocher avec merge et de travailler sur les dates avec to_datetime.",
        "Ce cours explique les clés, les cardinalités des jointures, les lignes sans correspondance, les périodes et les exports, puis crée un rapport prêt à être transmis."
      ],
      "tldr": [
        "merge rapproche les tables selon des colonnes communes et le type de jointure (inner, left, etc.). La cardinalité des clés doit être contrôlée avant et après.",
        "pd.to_datetime convertit les dates textuelles en valeurs temporelles permettant des tris et calculs fiables.",
        "to_csv et to_excel créent des livrables, mais les règles et contrôles de la transformation doivent être documentés."
      ],
      "sections": [
        {
          "id": "joins",
          "title": "What Is a DataFrame Merge?",
          "paragraphs": [
            "Une jointure rapproche des lignes de tables selon une clé, par exemple l'identifiant machine. Une jointure inner ne conserve que les correspondances ; une jointure left conserve toutes les lignes de gauche.",
            "Une même machine peut apparaître dans plusieurs événements, mais devrait souvent n'apparaître qu'une fois dans le référentiel des machines. Cette différence de grain guide le choix de la relation."
          ],
          "code": "import pandas as pd\npannes=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"minutes\":[10,15]})\nsites=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"site\":[\"Nantes\",\"Paris\"]})\nrapport=pannes.merge(sites,on=\"machine\",how=\"left\")\nprint(rapport[\"site\"].tolist())",
          "language": "python",
          "output": "['Nantes', 'Paris']",
          "interpretation": "Chaque événement récupère le site correspondant à son identifiant machine."
        },
        {
          "id": "validate",
          "title": "Join Cardinality and Duplicate Keys",
          "paragraphs": [
            "Une jointure peut multiplier les lignes si la table de droite contient plusieurs correspondances pour une même clé. La somme des durées peut alors augmenter artificiellement.",
            "Le paramètre validate permet d'exprimer les contraintes attendues : one_to_one, many_to_one ou one_to_many. Fais aussi un contrôle des totaux et du nombre de lignes après la jointure."
          ],
          "code": "import pandas as pd\npannes=pd.DataFrame({\"machine\":[\"M1\",\"M1\"],\"minutes\":[10,25]})\nsites=pd.DataFrame({\"machine\":[\"M1\"],\"site\":[\"Nantes\"]})\nres=pannes.merge(sites,on=\"machine\",validate=\"many_to_one\")\nprint(res.shape)\nprint(res[\"minutes\"].sum())",
          "language": "python",
          "output": "(2, 3)\n35",
          "interpretation": "Deux événements de M1 sont reliés à une seule fiche machine, sans multiplication des lignes."
        },
        {
          "id": "unmatched",
          "title": "Finding Rows Without a Matching Reference",
          "paragraphs": [
            "Les événements peuvent contenir une machine absente du référentiel. Une left join garde la panne, mais la colonne site devient manquante ; il est important de compter ces cas.",
            "indicator=True ajoute une colonne indiquant si une ligne vient des deux tables ou seulement de la gauche. C'est un outil pratique de validation des jointures."
          ],
          "code": "import pandas as pd\npannes=pd.DataFrame({\"machine\":[\"M1\",\"M3\"],\"minutes\":[10,20]})\nsites=pd.DataFrame({\"machine\":[\"M1\"],\"site\":[\"Nantes\"]})\nres=pannes.merge(sites,on=\"machine\",how=\"left\",indicator=True)\nprint(res[\"_merge\"].astype(str).tolist())",
          "language": "python",
          "output": "['both', 'left_only']",
          "interpretation": "M3 n'a pas de correspondance dans le référentiel. Il faut corriger ou expliquer ce problème avant une agrégation par site."
        },
        {
          "id": "dates",
          "title": "Converting Dates with to_datetime",
          "paragraphs": [
            "Les dates importées en texte ne doivent pas être comparées comme de simples chaînes de caractères. to_datetime permet de les convertir en dates utilisables et de contrôler les entrées impossibles.",
            "Précise le format ou la convention lorsque la date est ambiguë. Il vaut mieux conserver une colonne de contrôle pour les dates invalides."
          ],
          "code": "import pandas as pd\ndates=pd.to_datetime([\"2026-11-01\",\"2026-11-05\"])\nprint((dates[1]-dates[0]).days)",
          "language": "python",
          "output": "4",
          "interpretation": "Les deux dates sont séparées par quatre jours. Le calcul est possible grâce au type temporel."
        },
        {
          "id": "timegroup",
          "title": "Grouping by Month and Time Period",
          "paragraphs": [
            "Après conversion, dt permet d'extraire le mois, le jour ou l'année d'une colonne de dates. Les regroupements temporels servent à créer des courbes d'évolution.",
            "Une période mensuelle doit être interprétée avec prudence lorsqu'elle est incomplète. Un mois partiel n'est pas directement comparable à un mois complet."
          ],
          "code": "import pandas as pd\ndf=pd.DataFrame({\"date\":[\"2026-11-01\",\"2026-11-15\",\"2026-12-01\"],\"minutes\":[10,20,30]})\ndf[\"date\"]=pd.to_datetime(df[\"date\"])\ndf[\"mois\"]=df[\"date\"].dt.to_period(\"M\")\nprint(df.groupby(\"mois\")[\"minutes\"].sum())",
          "language": "python",
          "output": "mois\n2026-11    30\n2026-12    30\nFreq: M, Name: minutes, dtype: int64",
          "interpretation": "Novembre et décembre ont ici le même total, mais les nombres de jours observés diffèrent."
        },
        {
          "id": "export",
          "title": "Exporting Results to CSV and Excel",
          "paragraphs": [
            "to_csv écrit un DataFrame vers un fichier tabulaire et index=False évite d'ajouter un index technique comme colonne. to_excel produit un classeur, ce qui exige généralement une dépendance de lecture/écriture adaptée.",
            "Un livrable ne doit pas uniquement contenir les chiffres : ajoute la période, les unités, la date de mise à jour et les contrôles effectués."
          ],
          "code": "import pandas as pd\nfrom io import StringIO\nrapport=pd.DataFrame({\"machine\":[\"M1\"],\"total_min\":[35]})\nsortie=StringIO()\nrapport.to_csv(sortie,index=False)\nprint(sortie.getvalue().strip())",
          "language": "python",
          "output": "machine,total_min\nM1,35",
          "interpretation": "Le CSV produit contient seulement les colonnes métier, sans index technique supplémentaire."
        },
        {
          "id": "project",
          "title": "Professional Case: Combining Machine Events and Reference Data",
          "paragraphs": [
            "Un stagiaire reçoit une table d'événements et une table de référence des machines. Il doit associer le site, calculer le temps d'arrêt par site et contrôler les correspondances manquantes.",
            "Utilise validate='many_to_one', vérifie le nombre de lignes et compare la somme des événements avant et après la jointure. Cette méthode évite des erreurs silencieuses."
          ],
          "code": "import pandas as pd\npannes=pd.DataFrame({\"machine\":[\"M1\",\"M1\",\"M2\"],\"minutes\":[10,25,15]})\nsites=pd.DataFrame({\"machine\":[\"M1\",\"M2\"],\"site\":[\"Nantes\",\"Paris\"]})\njoint=pannes.merge(sites,on=\"machine\",validate=\"many_to_one\")\nassert len(joint)==len(pannes)\nassert joint[\"minutes\"].sum()==pannes[\"minutes\"].sum()\nprint(joint.groupby(\"site\")[\"minutes\"].sum().to_dict())",
          "language": "python",
          "output": "{'Nantes': 35, 'Paris': 15}",
          "interpretation": "La jointure conserve les trois événements et la somme de 50 minutes ; l'agrégation par site reste cohérente."
        }
      ],
      "mistakes": [
        "Réaliser une jointure sans contrôler l'unicité de la clé du référentiel.",
        "Perdre les lignes sans correspondance en utilisant inner au lieu de left lorsque la mission exige de toutes les conserver.",
        "Trier des dates au format texte sans les convertir.",
        "Comparer un mois incomplet à un mois complet sans signaler la différence de couverture.",
        "Exporter un fichier sans documenter les unités, la période et les contrôles."
      ],
      "conclusion": [
        "Tu sais maintenant rapprocher des tables Pandas, vérifier les clés, transformer des dates et exporter un rapport. Ces étapes constituent une mission Data Analyst réaliste et vérifiable.",
        "Pour progresser, refais l'analyse avec une table comportant une machine inconnue et documente l'anomalie au lieu de la faire disparaître."
      ],
      "faq": [
        {
          "question": "What is pd.merge?",
          "answer": "Une opération de jointure entre DataFrames fondée sur une ou plusieurs clés."
        },
        {
          "question": "What is the difference between left and inner join?",
          "answer": "left conserve toutes les lignes de gauche ; inner ne garde que les correspondances."
        },
        {
          "question": "How do I validate join cardinality?",
          "answer": "Utilise le paramètre validate de merge et contrôle clés, nombres de lignes et totaux."
        },
        {
          "question": "Why use to_datetime?",
          "answer": "Convertir du texte en valeurs temporelles pour les calculs, tris et regroupements."
        },
        {
          "question": "How do I export a clean CSV?",
          "answer": "Avec df.to_csv('rapport.csv', index=False), en documentant les transformations réalisées."
        }
      ]
    }
  }
];
