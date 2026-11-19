/* 72 concept-specific lesson notes; ordered to match module.points in dataAnalystTrack. */
export const dataLessonNotes: Record<string, Array<[string,string,string]>> = {
  "metier-donnees": [
    [
      "Un Data Analyst transforme une question imprécise en livrable exploitable : requête, tableau contrôlé, analyse et recommandation. Le tuteur valide le besoin, les hypothèses et la conformité avant diffusion.",
      "Écris une demande précise au tuteur : population concernée, période étudiée et décision à prendre.",
      "Un graphique livré sans connaître la décision attendue peut être exact et inutile."
    ],
    [
      "Une variable numérique permet des calculs ; une variable catégorielle désigne des groupes ; une date permet de situer un événement dans le temps. Les trois nécessitent des contrôles différents.",
      "Classe les colonnes date, revenu, région et identifiant selon leur rôle et leur type.",
      "Un identifiant de client constitué de chiffres n’est pas forcément une quantité à moyenner."
    ],
    [
      "Un CSV est un fichier délimité ; le tableur y ajoute des feuilles et des formules ; une base SQL stocke des tables interrogeables. La provenance, la fréquence d’actualisation et les règles d’extraction comptent autant que le format.",
      "Dessine la chaîne source → extraction → nettoyage → tableau de bord pour un fichier de ventes.",
      "Copier plusieurs exports sans identifier leurs dates peut mélanger des versions incompatibles."
    ],
    [
      "Le grain décrit ce que représente une ligne : une vente, un produit, une machine, un jour. Une clé unique identifie idéalement une observation à ce grain. Avant un JOIN, vérifier les cardinalités évite de multiplier les montants.",
      "Indique le grain et la clé primaire d’un tableau de trois tickets de maintenance.",
      "Compter les lignes après une jointure plusieurs-à-plusieurs peut gonfler artificiellement les KPI."
    ],
    [
      "Une question opérationnelle doit conduire à un indicateur défini et à une action possible. « Le service est-il performant ? » ne suffit pas : performance de quoi, quand et par rapport à quel objectif ?",
      "Transforme « nos ventes sont mauvaises » en deux questions mesurables et un KPI défini.",
      "Confondre le chiffre observé avec son explication produit de mauvaises recommandations."
    ],
    [
      "Une analyse doit conserver sa source, documenter les transformations et limiter l’accès aux informations personnelles. Un chiffre agrégé peut aussi divulguer des données si le groupe est trop petit.",
      "Rédige trois règles pour l’usage d’un export clients dans une équipe.",
      "Publier des données nominatives dans un dépôt Git public est une violation de confidentialité."
    ]
  ],
  "tableurs": [
    [
      "Le type de cellule détermine les comparaisons et les calculs. Un nombre stocké comme texte peut empêcher un total ; le tri sur des dates textuelles peut être chronologiquement faux.",
      "Filtre un tableau sur Nantes, trie les commandes par date et compte les lignes visibles.",
      "Un tri sur une seule colonne sans étendre la sélection peut désaligner les enregistrements."
    ],
    [
      "SOMME et MOYENNE décrivent des valeurs ; SI applique une règle ; NB.SI compte les lignes répondant à un critère. Il faut contrôler les plages et distinguer valeurs numériques de cellules vides.",
      "Calcule le total, la moyenne et le nombre de ventes supérieures à 1 000 dans un petit tableau.",
      "Une moyenne sur des lignes filtrées n’a pas le même sens que la moyenne générale."
    ],
    [
      "SOMME.SI.ENS additionne selon plusieurs critères ; RECHERCHEX recherche une clé dans une table de référence et renvoie une valeur associée. Les clés manquantes et les doublons doivent être traités.",
      "Calcule les ventes de Nantes en mars et retrouve le responsable du magasin dans une table de référence.",
      "Une RECHERCHEX sur une clé dupliquée renvoie un résultat qui peut masquer l’ambiguïté."
    ],
    [
      "La référence $A$1 fixe ligne et colonne lors de la recopie, tandis que A1 se déplace. Des références incohérentes peuvent donner des chiffres plausibles mais faux. Les erreurs #N/A et #DIV/0! ont des causes différentes.",
      "Recopie une formule de taux avec un objectif fixé en cellule B1 ; explique les signes $.",
      "Masquer toutes les erreurs avec SIERREUR(...;0) peut transformer une absence en zéro trompeur."
    ],
    [
      "Un tableau croisé dynamique regroupe automatiquement une table détaillée selon dimensions et mesures. Il faut choisir somme, nombre ou moyenne selon la signification de la variable et rafraîchir la source.",
      "Crée un TCD ventes par mois et magasin, puis compare le grand total à la table source.",
      "Compter des identifiants répétés dans un TCD peut surestimer les entités distinctes."
    ],
    [
      "La mise en forme conditionnelle met en évidence un seuil ou une variation mais n’est pas une preuve. Un contrôle des totaux source et rapport, ainsi que la date d’actualisation, sécurise la restitution.",
      "Mets en évidence les ventes sous l’objectif et crée une cellule de contrôle total.",
      "Une couleur rouge sans légende ni seuil explicite peut faire interpréter une performance normale comme critique."
    ]
  ],
  "sql": [
    [
      "Une table représente des lignes d’entités ; une clé primaire distingue les enregistrements ; une clé étrangère relie deux ensembles. Comprendre le modèle relationnel évite de joindre au hasard.",
      "Dessine clients(id) et commandes(client_id), puis détermine le grain de chacune.",
      "Joindre deux tables d’événements sur une colonne non unique multiplie les lignes."
    ],
    [
      "SELECT projette les colonnes, WHERE filtre, ORDER BY trie et LIMIT réduit le nombre de lignes affichées. Le filtrage s’applique avant l’agrégation ; l’ordre n’est pas garanti sans ORDER BY.",
      "Écris une requête affichant les cinq commandes les plus récentes supérieures à 100 €.",
      "LIMIT sans ORDER BY ne garantit pas les « cinq plus grandes » commandes."
    ],
    [
      "COUNT(*) compte les lignes ; COUNT(colonne) ignore ses NULL. SUM et AVG ne remplacent pas des valeurs absentes par zéro. L’unité doit rester cohérente : euros, centimes ou minutes.",
      "Compare COUNT(*) et COUNT(duree) lorsqu’un événement n’a pas de durée renseignée.",
      "Interpréter AVG d’une colonne incomplète comme la moyenne de toutes les observations peut induire en erreur."
    ],
    [
      "GROUP BY fixe les groupes pour les agrégats ; HAVING filtre ces agrégats ; CASE construit des catégories métier. WHERE sélectionne les observations avant la somme, HAVING sélectionne les groupes après.",
      "Regroupe les commandes par client et conserve uniquement ceux dont le total dépasse 500 €.",
      "Écrire WHERE SUM(montant) > 500 au lieu de HAVING est invalide dans une requête agrégée classique."
    ],
    [
      "INNER JOIN conserve les correspondances ; LEFT JOIN conserve toutes les lignes de gauche, même sans correspondance. Vérifier la cardinalité avant et après jointure protège les totaux.",
      "Compare le résultat INNER et LEFT quand une commande référence un client absent.",
      "Un INNER JOIN peut éliminer silencieusement des événements dont la référence est manquante."
    ],
    [
      "Une CTE nommée par WITH rend la transformation lisible. ROW_NUMBER et autres fonctions de fenêtre permettent de classer les événements sans perdre la granularité des lignes.",
      "Classe les commandes par client avec ROW_NUMBER puis conserve la plus récente.",
      "Supprimer un doublon avant d’avoir défini sa clé métier peut supprimer un événement réel."
    ]
  ],
  "python": [
    [
      "Jupyter juxtapose cellules Markdown explicatives et cellules Python exécutables. L’état des variables dépend de l’ordre d’exécution ; « Restart & Run All » révèle les dépendances cachées.",
      "Écris une cellule Markdown qui définit l’objectif, puis une cellule de calcul et une de vérification.",
      "Un notebook qui fonctionne seulement après des exécutions désordonnées n’est pas reproductible."
    ],
    [
      "Les nombres peuvent être additionnés, les chaînes concaténées, les listes modifiées et les dictionnaires associent des clés à des valeurs. Un type ne dit pas à lui seul la signification métier d’une colonne.",
      "Crée un dictionnaire magasin → liste de ventes, puis calcule le total de Nantes.",
      "Additionner des chaînes numériques '10' et '20' produit '1020', pas 30."
    ],
    [
      "if/else exprime des règles, for parcourt des observations et les compréhensions construisent des listes. Les règles métier doivent être lisibles plutôt que cachées dans une boucle compliquée.",
      "Parcours les montants et classe-les en « objectif atteint » ou « à surveiller ».",
      "Modifier une liste pendant qu’on la parcourt peut sauter des éléments."
    ],
    [
      "Une fonction reçoit des paramètres, réalise une opération, puis retourne un résultat avec return. Une fonction courte, nommée et testée est plus facile à intégrer à un pipeline d’équipe.",
      "Écris une fonction taux_variation(actuel, precedent) gérant le cas précédent=0.",
      "print(...) ne remplace pas return lorsqu’une autre fonction doit réutiliser le résultat."
    ],
    [
      "csv et json décrivent des structures différentes. Pour une table, read_csv facilite les types et la manipulation ; pour des objets imbriqués, json.load peut être plus approprié. Les encodages et séparateurs varient.",
      "Crée puis recharge un CSV contenant des caractères accentués ; vérifie les colonnes.",
      "Un séparateur « ; » lu comme « , » peut fusionner toutes les données dans une colonne."
    ],
    [
      "Les exceptions signalent une erreur d’exécution ; assert peut tester des invariants pendant le développement. Pour des données utilisateur, des validations explicites et des messages utiles sont préférables à un plantage silencieux.",
      "Teste une fonction de calcul sur liste vide, valeur négative et type incorrect.",
      "Attraper toutes les exceptions sans journaliser la cause cache les erreurs réelles."
    ]
  ],
  "pandas-numpy": [
    [
      "ndarray stocke des données homogènes avec forme shape et type dtype. Les opérations vectorisées s’appliquent à toutes les valeurs, mais il faut surveiller débordement et unités.",
      "Convertis un tableau de secondes en minutes et vérifie shape et dtype.",
      "Un int8 peut déborder si les valeurs calculées dépassent sa plage."
    ],
    [
      "Une Series décrit une colonne, un DataFrame représente une table indexée. read_csv infère les types, mais ce choix doit être contrôlé avec info et un aperçu des premières lignes.",
      "Charge un CSV minimal et affiche trois premières lignes, types et nombre de colonnes.",
      "Les codes postaux comme '01234' risquent de perdre leur zéro initial s’ils sont convertis en entiers."
    ],
    [
      "head montre les premières lignes, info révèle les types et les non-null, describe résume des variables numériques ou catégorielles. Ces diagnostics précèdent toute transformation complexe.",
      "Rédige trois observations issues de head, info et describe d’un jeu d’essai.",
      "Le fait que head soit propre ne garantit pas que les autres lignes le soient."
    ],
    [
      "loc sélectionne par étiquettes, iloc par position. Une affectation dans une vue intermédiaire peut être ambiguë ; .copy() et .loc améliorent la fiabilité.",
      "Filtre les commandes de Nantes puis ajoute une colonne marge sur une copie explicite.",
      "Une affectation chaînée peut ne pas modifier le tableau que tu crois modifier."
    ],
    [
      "groupby regroupe les lignes et agg calcule plusieurs indicateurs par groupe. pivot_table organise les mesures en lignes/colonnes ; il faut préciser le comportement des valeurs manquantes.",
      "Calcule par magasin total, moyenne et nombre de commandes en une seule agrégation.",
      "Une moyenne de moyennes non pondérée n’est pas toujours la moyenne globale."
    ],
    [
      "merge combine les tables selon leurs clés ; les dates permettent d’agréger selon jours, semaines et mois. Il faut vérifier unicité des clés et fuseaux horaires avant d’exporter.",
      "Fusionne commandes et clients avec validate='many_to_one', puis exporte le résultat.",
      "Faire un merge sur des identifiants de types différents peut produire des correspondances manquantes."
    ]
  ],
  "nettoyage": [
    [
      "Un doublon exact répète toute une ligne ; un doublon métier répète une entité ou un événement selon une clé. La règle de conservation dépend de l’ordre, de la source et de la définition métier.",
      "Compare duplicated() et duplicated(subset=['id']) sur quatre événements.",
      "Supprimer toutes les lignes d’un identifiant répété peut effacer des mises à jour légitimes."
    ],
    [
      "Une valeur manquante peut signifier « non mesuré », « non applicable » ou « inconnu ». La remplacer par 0 change souvent la statistique. Mesurer les taux de manque par colonne et segment.",
      "Calcule la proportion de durées absentes pour chaque machine ; décris la signification de NA.",
      "dropna() sans justification peut exclure systématiquement un groupe particulier."
    ],
    [
      "Un champ date lu comme texte empêche des calculs temporels fiables ; les séparateurs décimaux et les fuseaux doivent être identifiés. Une conversion robuste rapporte les valeurs non interprétables.",
      "Convertis '19/11/2026' avec un format explicite et isole les dates invalides.",
      "Interpréter mois/jour et jour/mois de façon ambiguë déplace des événements dans le calendrier."
    ],
    [
      "Les libellés « Nantes », « nantes » et « Nantes  » peuvent désigner la même catégorie. La normalisation doit être traçable, surtout lorsque plusieurs catégories se ressemblent sans être identiques.",
      "Normalise la casse et les espaces d’une colonne site, puis compare le nombre de catégories.",
      "Réunir deux catégories réellement différentes sous un même libellé crée une erreur métier."
    ],
    [
      "Une valeur extrême peut être une panne rare mais vraie, pas seulement une faute de saisie. Définir plages plausibles, seuils métiers et contrôles statistiques ; examiner avant exclusion.",
      "Repère les durées négatives et celles qui dépassent une journée, puis demande la validation métier.",
      "Retirer automatiquement les 5 % plus grandes durées fausserait l’étude des pannes graves."
    ],
    [
      "Un nettoyage utile produit un journal des modifications, des tests d’unicité et des contrôles de totals réconciliés avec les sources. La transformation doit être relançable sur les futures données.",
      "Écris deux assertions : identifiants uniques et montants non négatifs.",
      "Un fichier nettoyé sans script ni trace ne peut pas être audité facilement."
    ]
  ],
  "statistiques-eda": [
    [
      "La moyenne additionne puis divise ; la médiane coupe les observations ordonnées en deux. Variance et écart type mesurent la dispersion ; préciser population/échantillon pour l’écart type.",
      "Compare moyenne et médiane pour les valeurs 10, 11, 12, 13, 100.",
      "Interpréter la moyenne comme la valeur « typique » dans une distribution très asymétrique peut tromper."
    ],
    [
      "Les quantiles répartissent la distribution ; Q1 et Q3 cadrent la moitié centrale. La règle des 1,5×IQR peut signaler des points à vérifier, pas des erreurs certaines.",
      "Calcule Q1, Q3 et les bornes 1,5×IQR sur sept salaires.",
      "Une observation hors des moustaches n’est pas nécessairement une donnée fausse."
    ],
    [
      "Une distribution peut être symétrique, asymétrique ou multimodale. Histogramme et boxplot révèlent des structures invisibles dans une moyenne, mais le choix des bins influence l’apparence.",
      "Trace des histogrammes à 5 puis 20 bins sur les mêmes valeurs.",
      "Un histogramme trop grossier peut masquer deux populations distinctes."
    ],
    [
      "Une analyse univariée décrit une variable ; la bivariée compare deux ; la multivariée examine plusieurs facteurs simultanément. Le choix dépend de la question et du grain.",
      "Compare ventes par mois puis par mois et catégorie pour déceler un effet de composition.",
      "Comparer des groupes de tailles très différentes sans normalisation peut induire en erreur."
    ],
    [
      "La corrélation linéaire mesure une association, pas un effet causal. Une tendance commune due au temps ou à une troisième variable peut faire croître deux séries sans lien direct.",
      "Calcule une corrélation entre dépenses et revenus, puis propose un facteur confondant.",
      "Annoncer « X provoque Y » à partir de corr(X,Y) n’est pas justifié."
    ],
    [
      "Une hypothèse associe une population, une mesure et une comparaison. Pour la tester, il faut évaluer qualité des données, taille d’échantillon et incertitude ; les observations exploratoires ne sont pas des preuves confirmatoires.",
      "Formule une hypothèse sur l’évolution du taux de panne avant et après maintenance.",
      "Faire 40 tests puis ne publier que celui qui est significatif surestime les preuves."
    ]
  ],
  "visualisation": [
    [
      "L’histogramme regroupe des nombres en intervalles ; le boxplot synthétise les quartiles et points extrêmes. Le choix du nombre de classes change la lisibilité des formes.",
      "Compare deux histogrammes du même tableau avec des nombres de bins différents.",
      "Un histogramme n’est pas un graphique de catégories : l’axe horizontal est continu."
    ],
    [
      "Une courbe trace un ordre temporel ; un axe chronologique correct est essentiel pour interpréter l’évolution. Les séries peuvent nécessiter une granularité hebdomadaire ou mensuelle.",
      "Trace un revenu par mois avec unités et marqueurs, sans trier les mois alphabétiquement.",
      "Relier des observations de dates mal ordonnées crée une trajectoire fictive."
    ],
    [
      "Un scatterplot représente un couple (x,y) par observation. Couleur et taille peuvent coder d’autres variables ; les groupes et valeurs aberrantes méritent une inspection.",
      "Trace dépenses vs ventes, colorées par canal, puis repère les points atypiques.",
      "Tracer une droite de tendance sans examiner les groupes peut masquer des relations divergentes."
    ],
    [
      "Les barres comparent des catégories, idéalement depuis zéro pour éviter d’exagérer les écarts. Pour beaucoup de catégories, trier par valeur et basculer en barres horizontales améliore la lecture.",
      "Classe les dix produits par chiffre d’affaires et explique les unités.",
      "Utiliser des barres 3D ou une échelle tronquée peut fausser la perception des écarts."
    ],
    [
      "Un titre répond à une question, les axes portent des unités, les légendes décrivent les groupes. Les sources, périodes et règles de filtrage doivent être visibles.",
      "Corrige une figure sans unité ni période pour qu’un manager la comprenne sans explication.",
      "Une couleur sans légende ou un axe sans unité rend une conclusion invérifiable."
    ],
    [
      "Plotly ajoute survol, zoom et filtres ; l’interactivité doit servir l’exploration plutôt que distraire. Les boutons et graphiques doivent préserver le sens des données et permettre le retour à la vue d’ensemble.",
      "Ajoute un hover montrant la date, le montant et le magasin, puis teste un filtre.",
      "Un dashboard interactif sans état de filtre visible peut provoquer des conclusions contradictoires."
    ]
  ],
  "powerbi": [
    [
      "Power BI Desktop permet d’importer, transformer, modéliser et créer des rapports. Une requête Power Query sépare les étapes et simplifie l’actualisation ; il faut définir clairement source, droits et fréquence.",
      "Écris la liste des sources et transformations d’un tableau de ventes avant de créer la première page.",
      "Passer directement aux visuels sans vérifier la table importe les erreurs dans tout le modèle."
    ],
    [
      "Power Query applique des transformations répétables : changer les types, retirer des colonnes, fusionner et filtrer. Une transformation doit conserver le grain et indiquer les lignes exclues.",
      "Définis une suite de quatre étapes M pour transformer une date texte et un montant.",
      "Supprimer des lignes à cause d’une erreur de type sans les compter peut créer un biais."
    ],
    [
      "Un schéma en étoile relie une table de faits (événements/mesures) à des dimensions (dates, magasins). Une mauvaise cardinalité ou une direction de filtre incorrecte fausse les résultats.",
      "Dessine FactVentes reliée à DimDate et DimMagasin ; explique les clés uniques côté dimensions.",
      "Une relation plusieurs-à-plusieurs non contrôlée peut produire des totaux surprenants."
    ],
    [
      "SUM agrège, DIVIDE évite une division par zéro et CALCULATE modifie le contexte de filtre DAX. Une mesure réagit aux sélections ; une colonne calculée suit une logique différente.",
      "Écris une mesure Total et un taux d’atteinte de l’objectif avec DIVIDE.",
      "Utiliser une colonne calculée pour un indicateur qui doit réagir au contexte peut donner une valeur inadéquate."
    ],
    [
      "Les segments filtrent une ou plusieurs pages ; les interactions des visuels doivent être contrôlées. Un dashboard utile indique clairement période, filtres actifs et date de fraîcheur.",
      "Dessine deux pages : synthèse et détail machine, avec un filtre site partagé.",
      "Un graphique qui ne réagit pas au filtre attendu peut mener à une décision erronée."
    ],
    [
      "Avant publication, réconcilie les totaux avec une référence, teste les filtres et vérifie les droits d’accès. Définis le propriétaire de la donnée et un plan d’actualisation.",
      "Écris une checklist de recette incluant trois cas de filtre, un contrôle total et un test d’accès.",
      "Un rapport partagé sur le web sans paramétrage d’accès peut exposer des données internes."
    ]
  ],
  "kpi-decision": [
    [
      "Une demande d’analyse sert une décision : prioriser une enquête, allouer une ressource ou vérifier un objectif. Reformule la question dans des termes mesurables et négocie le niveau de détail.",
      "Propose une décision correspondant à la question « pourquoi les délais montent-ils ? ».",
      "Une analyse sophistiquée qui ne peut influencer aucune action a une faible valeur métier."
    ],
    [
      "Chaque KPI exige un nom, une formule, un numérateur, un dénominateur, une unité, une période et des exclusions documentées. Ce contrat rend deux versions comparables.",
      "Écris la définition exacte du taux de disponibilité d’une machine.",
      "Un taux sans dénominateur explicite peut paraître excellent en excluant certains événements."
    ],
    [
      "La variation absolue vaut nouveau−ancien ; la relative vaut (nouveau−ancien)/ancien quand ancien≠0. Une hausse de 10 à 20 vaut +10 unités mais +100 %.",
      "Calcule l’écart absolu et relatif entre 100 et 80 commandes.",
      "Confondre points de pourcentage et pourcentages crée de très grosses erreurs."
    ],
    [
      "Comparer des périodes nécessite des fenêtres de même longueur ou une normalisation ; comparer des segments nécessite de tenir compte de leurs tailles. Les valeurs agrégées peuvent masquer des écarts locaux.",
      "Compare les ventes journalières de février et mars plutôt que les seuls totaux mensuels.",
      "Comparer deux mois avec nombres de jours différents peut confondre durée et performance."
    ],
    [
      "Pour expliquer un écart, décompose la métrique selon ses facteurs connus puis formule des hypothèses. Une décomposition comptable n’est pas à elle seule une preuve causale.",
      "Décompose revenu = commandes × panier moyen sur deux périodes.",
      "Une baisse de volume peut venir d’un changement de mix plutôt que d’une panne."
    ],
    [
      "La restitution destinée à un manager doit distinguer faits, hypothèses, risque et recommandation testable. Une action sans indicateur de suivi ne permet pas de savoir si elle fonctionne.",
      "Rédige une note de cinq lignes : fait, cause possible, action, mesure de suivi, limite.",
      "Présenter une hypothèse comme une certitude réduit la confiance dans l’analyse."
    ]
  ],
  "industrie-maintenance": [
    [
      "Un capteur produit des mesures horodatées ; un journal décrit des incidents ; l’ERP décrit les équipements. Les sources doivent être rapprochées avec des identifiants stables et des unités compatibles.",
      "Définis une clé machine et un horodatage communs aux mesures et aux incidents.",
      "Des codes machine réutilisés entre sites peuvent provoquer des jointures erronées."
    ],
    [
      "Une série temporelle se décrit par sa fréquence, ses intervalles manquants et ses unités. L’agrégation d’une valeur instantanée et d’une quantité cumulative suit des règles différentes.",
      "Représente une mesure toutes les cinq minutes et repère deux trous de collecte.",
      "Faire la moyenne d’un compteur cumulatif ne donne pas l’énergie consommée."
    ],
    [
      "Les temps d’arrêt, MTTR et MTBF nécessitent des définitions opérationnelles claires. Disponibilité = temps disponible / temps planifié selon le contrat métier, et les arrêts exclus doivent être documentés.",
      "Calcule la disponibilité d’un équipement avec 480 minutes planifiées et 30 d’arrêt.",
      "Confondre durée moyenne de réparation et temps moyen entre pannes change la décision."
    ],
    [
      "Un seuil fixe identifie un dépassement, pas toujours une anomalie pertinente. L’historique, le contexte de charge et les faux positifs aident à distinguer dérive et comportement normal.",
      "Teste un seuil température puis compare les dépassements pendant une forte charge.",
      "Une température élevée pendant un cycle normal n’est pas nécessairement une panne."
    ],
    [
      "Les bilans par semaine/site/machine doivent conserver les incidents distincts et les durées connues. Un manque de temps d’arrêt doit apparaître comme une incertitude, pas un zéro.",
      "Calcule les incidents uniques et la somme des minutes connues par machine et semaine.",
      "Additionner des incidents dédupliqués avec des durées non nettoyées déséquilibre les totaux."
    ],
    [
      "Prévoir une panne exige des étiquettes de défaillance, un horizon de prévision et des données historiques fiables. Une courbe de tendance ou une détection de seuil ne constitue pas une maintenance prédictive validée.",
      "Définis ce que signifierait « panne dans 7 jours » et comment éviter une fuite temporelle.",
      "Prédire avec des valeurs mesurées après la panne constitue une fuite d’information."
    ]
  ],
  "simulation-stage": [
    [
      "Un brief doit être clarifié avant la première ligne de code : décision, périmètre, sources, livrable, échéance et validation. Reformuler la demande réduit les itérations inutiles.",
      "Écris les cinq questions que tu poserais à un tuteur pour créer un dashboard de maintenance.",
      "Commencer à coder sans définir la décision finale mène à un livrable hors sujet."
    ],
    [
      "Conserver les données brutes permet de rejouer la transformation ; versionner code et dictionnaire de données rend le travail traçable. Les secrets et données sensibles ne vont pas dans Git.",
      "Organise /data/raw, /data/processed, /src, /reports et un README.",
      "Écraser le fichier source empêche de comprendre les corrections a posteriori."
    ],
    [
      "Un pipeline reproductible doit vérifier les types, doublons et clés de jointure puis conserver un journal de nettoyage. Il faut contrôler les totaux avant/après chaque transformation sensible.",
      "Écris des assertions de clé unique et de non-négativité avant la jointure.",
      "Une jointure silencieusement plusieurs-à-plusieurs peut fausser tout le rapport."
    ],
    [
      "Un tableau de bord de stage doit partir d’indicateurs vérifiés et de trois questions concrètes. Les graphiques racontent des observations, tandis que les notes expliquent limites et décisions.",
      "Dessine une page de synthèse et un détail site à partir d’incidents fictifs.",
      "Un visuel interactif ne corrige pas un indicateur mal défini."
    ],
    [
      "Un README doit expliquer installation, données, exécution, tests et limites. Des noms de variables lisibles et quelques tests simples facilitent la reprise du projet par l’équipe.",
      "Rédige les commandes d’installation et d’exécution de ton pipeline.",
      "Un notebook qui dépend de cellules lancées dans le désordre est fragile."
    ],
    [
      "Une restitution professionnelle privilégie objectif, méthode, résultat, limites et recommandation. Une passation inclut fichiers, versions, procédures et questions ouvertes pour le tuteur.",
      "Prépare cinq diapositives ou une note d’une page et un protocole de reprise.",
      "Un résultat non reproductible perd de sa valeur lorsqu’un autre collaborateur doit le maintenir."
    ]
  ]
};
