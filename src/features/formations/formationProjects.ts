export type FormationProject={
 id:string;title:string;level:string;duration:string;tools:string[];
 brief:string;objectives:string[];steps:string[];deliverables:string[];
 acceptance:string[];starterCode:string;dataName?:string;data?:string;
};
export const formationProjects:Record<string,FormationProject[]> = {
  "data-analyst": [
    {
      "id": "sales",
      "title": "Retail Sales Intelligence",
      "level": "Fondamentaux",
      "duration": "Projet guidé",
      "tools": [
        "Excel",
        "SQL",
        "Pandas"
      ],
      "brief": "Une chaîne de magasins veut comprendre l'évolution de ses ventes par site et par période. Construis un reporting contrôlé à partir des lignes de transactions, sans confondre nombre de commandes et revenu.",
      "objectives": [
        "Charger et vérifier les types de colonnes",
        "Créer des KPI cohérents par magasin",
        "Comparer des périodes de même granularité",
        "Présenter une recommandation vérifiable"
      ],
      "steps": [
        "Importer le CSV et vérifier les identifiants",
        "Contrôler la présence de doublons et de revenus négatifs",
        "Agréger le chiffre d'affaires par magasin et mois",
        "Créer une figure avec axes et unités",
        "Rédiger une conclusion et une limite"
      ],
      "deliverables": [
        "Notebook Jupyter relançable",
        "Tableau récapitulatif des ventes",
        "Graphique mensuel annoté",
        "Synthèse métier de 5 lignes"
      ],
      "acceptance": [
        "La somme totale du CSV correspond aux agrégats",
        "Aucune commande n'est comptée deux fois",
        "Période, unité et filtre sont documentés",
        "Un collègue sait reproduire l'analyse"
      ],
      "starterCode": "import pandas as pd\nimport matplotlib.pyplot as plt\n\n# 1. Charger les commandes fournies dans le ZIP\ncommandes = pd.read_csv(\"sales.csv\")\nprint(commandes.head())\nprint(commandes.info())\n\n# TODO : contrôler id, montants et dates\n# TODO : total du CA par magasin et par mois\n# TODO : graphique et conclusion sur les écarts",
      "dataName": "sales.csv",
      "data": "id,magasin,mois,montant\n1,Nantes,2026-09,120\n2,Nantes,2026-09,90\n3,Paris,2026-09,200\n4,Lyon,2026-09,140\n5,Nantes,2026-10,160\n6,Paris,2026-10,220\n7,Lyon,2026-10,130\n8,Paris,2026-10,180\n"
    },
    {
      "id": "eda-quality",
      "title": "Data Cleaning & EDA — Marketing",
      "level": "Intermédiaire",
      "duration": "Projet guidé",
      "tools": [
        "Python",
        "Pandas",
        "Seaborn"
      ],
      "brief": "Une équipe marketing reçoit un export avec des valeurs manquantes, un doublon et des campagnes hétérogènes. Établis la qualité de la base, son coût et les relations entre dépenses et revenu.",
      "objectives": [
        "Diagnostiquer manquants, doublons et incohérences",
        "Nettoyer sans inventer de valeurs",
        "Décrire les distributions et les extrêmes",
        "Distinguer corrélation et causalité"
      ],
      "steps": [
        "Conserver une copie de l'export brut",
        "Calculer un bilan de qualité et dédupliquer par id",
        "Mesurer la proportion de revenu connu",
        "Tracer dépense, revenu et canal",
        "Rédiger des hypothèses métier sans les présenter comme causalités"
      ],
      "deliverables": [
        "Journal de nettoyage",
        "Notebook EDA avec au moins trois visuels",
        "Tableau de complétude",
        "Conclusions et réserves"
      ],
      "acceptance": [
        "L'incident de campagne 3 n'est pas compté deux fois",
        "La valeur manquante n'est pas assimilée à zéro",
        "Chaque conclusion renvoie à une mesure ou figure",
        "Aucune source brute n'est effacée"
      ],
      "starterCode": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\nsource = pd.read_csv(\"marketing.csv\")\nbrut = source.copy(deep=True)\nprint(source.info())\nprint(source.isna().sum())\nprint(\"Doublons métier\", source.duplicated(\"campaign_id\").sum())\n\n# TODO : dédoublonner et vérifier les montants\n# TODO : visualiser les relations Spend / Revenue\n# TODO : synthèse des limites",
      "dataName": "marketing.csv",
      "data": "campaign_id,channel,spend,revenue\n1,Email,500,800\n2,Social,800,1200\n3,Email,650,1000\n3,Email,650,1000\n4,TV,1500,1250\n5,Print,300,\n6,Social,950,1450\n7,Email,550,780\n"
    },
    {
      "id": "bi",
      "title": "Dashboard opérationnel Power BI",
      "level": "Professionnel",
      "duration": "Projet guidé",
      "tools": [
        "Power BI",
        "Power Query",
        "DAX"
      ],
      "brief": "Un responsable multi-sites souhaite un dashboard dynamique de production et de coûts. Construis un schéma fiable, des mesures DAX qui réagissent aux filtres et une page synthèse plus une page de détail.",
      "objectives": [
        "Importer et typer les données",
        "Modéliser une table de faits et les dimensions",
        "Écrire trois mesures DAX utiles",
        "Valider les filtres et la date d'actualisation"
      ],
      "steps": [
        "Importer le CSV dans Power BI",
        "Créer les dimensions Date et Site",
        "Définir Total Production, Total Coût et Coût par unité",
        "Créer un graphique temporel et une comparaison par site",
        "Tester les filtres puis vérifier les totaux"
      ],
      "deliverables": [
        "Fichier Power BI (.pbix) à produire dans Power BI Desktop",
        "Capture des deux pages du rapport",
        "Dictionnaire des KPI",
        "Procès-verbal de contrôle des chiffres"
      ],
      "acceptance": [
        "Les coûts sont exprimés en euros",
        "Le contexte du filtre Site change les mesures",
        "Les totaux correspondent aux données sources",
        "Les limitations et règles d'accès sont documentées"
      ],
      "starterCode": "# Mesures à ajouter dans Power BI Desktop (DAX)\n# Total Production = SUM(FactProduction[Unites])\n# Total Coût = SUM(FactProduction[CoutEUR])\n# Coût par unité = DIVIDE([Total Coût], [Total Production])\n\n# Les fichiers .pbix sont construits avec Power BI Desktop ;\n# ce notebook sert uniquement à contrôler le fichier source.\nimport pandas as pd\ndf = pd.read_csv(\"production.csv\")\nprint(df.groupby(\"site\")[[\"unites\",\"cout_eur\"]].sum())",
      "dataName": "production.csv",
      "data": "date,site,unites,cout_eur\n2026-09-01,Nantes,120,8200\n2026-09-01,Lyon,90,6500\n2026-09-02,Nantes,133,9100\n2026-09-02,Lyon,110,7200\n2026-10-01,Nantes,138,9300\n2026-10-01,Lyon,105,7000\n"
    },
    {
      "id": "industrial",
      "title": "Industrial Maintenance Analytics",
      "level": "Projet final",
      "duration": "Projet de stage simulé",
      "tools": [
        "SQL",
        "Python",
        "Power BI"
      ],
      "brief": "La maintenance d'un parc de machines doit prioriser une investigation. Les incidents contiennent une duplication et une durée inconnue. Produis un suivi par machine et période, explique les incertitudes et recommande une priorité.",
      "objectives": [
        "Identifier le grain « incident unique »",
        "Calculer temps d'arrêt connu et incidents distincts",
        "Mesurer la complétude et ne pas masquer les NA",
        "Proposer un tableau de bord opérationnel contrôlé"
      ],
      "steps": [
        "Valider le fichier incidents et documenter la règle de doublon",
        "Calculer les KPI par machine et par semaine",
        "Créer graphiques et anomalies vérifiables",
        "Présenter les limites sur les durées manquantes",
        "Livrer le code, les tests et un briefing de trois minutes"
      ],
      "deliverables": [
        "Pipeline Python de nettoyage",
        "Dashboard détaillé ou prototype Power BI",
        "Note d'analyse industrielle",
        "README avec procédure de reprise"
      ],
      "acceptance": [
        "Les incidents distincts sont vérifiés",
        "Une durée inconnue reste inconnue",
        "Une recommandation est assortie d'une hypothèse à confirmer",
        "Les tests du pipeline passent"
      ],
      "starterCode": "import pandas as pd\n\ndata = pd.read_csv(\"incidents.csv\")\nprint(\"Lignes brutes\",len(data))\nprint(\"ID répétés\",data.duplicated(\"incident_id\").sum())\nprint(\"Durées inconnues\",data[\"minutes\"].isna().sum())\n\n# TODO : dédoublonner à partir de l'identifiant d'événement\n# TODO : agréger par machine et semaine, avec complétude\n# TODO : faire vérifier le diagnostic par un responsable métier",
      "dataName": "incidents.csv",
      "data": "incident_id,machine,semaine,minutes\n1,A,1,20\n2,A,1,15\n3,B,1,80\n3,B,1,80\n4,B,2,25\n5,A,2,40\n6,B,2,\n7,C,2,15\n"
    }
  ],
  "traitement-images": [
    {
      "id": "explorer",
      "title": "Image Explorer — Pixel to Histogram",
      "level": "Fondamentaux",
      "duration": "Projet guidé",
      "tools": [
        "NumPy",
        "Matplotlib",
        "OpenCV"
      ],
      "brief": "Construis un outil simple qui lit une image, affiche ses informations numériques, permet un recadrage et compare RGB, gris et histogramme à échelle commune.",
      "objectives": [
        "Inspecter shape et dtype",
        "Extraire une ROI correctement",
        "Comparer BGR, RGB et niveaux de gris",
        "Calculer l'histogramme et sauvegarder le résultat"
      ],
      "steps": [
        "Générer une image couleur synthétique déterministe",
        "Afficher original, gris et ROI",
        "Tracer les histogrammes des canaux",
        "Vérifier dimensions et valeurs d'entrée",
        "Exporter un exemple et documenter la procédure"
      ],
      "deliverables": [
        "Notebook Image Explorer",
        "Planche d'images commentée",
        "Fonction de validation d'entrée",
        "README minimal"
      ],
      "acceptance": [
        "La conversion BGR/RGB est correcte",
        "Les dimensions de la ROI sont vérifiées",
        "Les axes et plages de l'histogramme sont annotés",
        "Le notebook se relance de zéro"
      ],
      "starterCode": "import numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\n\n# Source locale synthétique : aucun fichier externe nécessaire\nbgr = np.zeros((180,240,3),dtype=np.uint8)\nbgr[:,:80]=(255,0,0)       # Bleu en BGR\nbgr[:,80:160]=(0,255,0)    # Vert\nbgr[:,160:]=(0,0,255)      # Rouge\n\n# TODO : afficher en RGB, en gris et recadrer la bande centrale\n# TODO : tracer les histogrammes de canaux\n# TODO : enregistrer une image PNG et vérifier sa relecture"
    },
    {
      "id": "enhancement",
      "title": "Image Enhancement & Denoising",
      "level": "Intermédiaire",
      "duration": "Projet guidé",
      "tools": [
        "OpenCV",
        "NumPy",
        "PSNR"
      ],
      "brief": "Un capteur produit des images bruitées. Comparer plusieurs filtres sur les mêmes données et justifier une configuration qui améliore la qualité sans supprimer les petites structures.",
      "objectives": [
        "Simuler un bruit reproductible",
        "Comparer gaussien, médian et bilatéral",
        "Calculer MSE et PSNR sur référence connue",
        "Examiner une petite structure d'intérêt"
      ],
      "steps": [
        "Générer une scène avec régions et traits fins",
        "Appliquer un bruit impulsionnel et/ou gaussien",
        "Comparer trois filtres avec paramètres explicites",
        "Calculer les erreurs et créer une planche cohérente",
        "Identifier les cas où le filtrage fait perdre des détails"
      ],
      "deliverables": [
        "Notebook de débruitage",
        "Tableau comparatif MSE/PSNR",
        "Planche avant/après",
        "Note de choix d'algorithme"
      ],
      "acceptance": [
        "La référence et le bruit sont les mêmes pour chaque méthode",
        "Les intensités sont comparées sur la même échelle",
        "Les mesures utilisent MAX cohérent avec dtype",
        "La limitation sur les structures fines est citée"
      ],
      "starterCode": "import numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\nrng=np.random.default_rng(7)\nreference=np.full((160,220),70,dtype=np.uint8)\nreference[50:110,60:160]=200\nreference[75:78,20:200]=255  # Structure fine\nbruitee=reference.copy()\nbruitee[rng.random(reference.shape)<.04]=255\n\n# TODO : filtres médian 3 et 7, gaussien 5\n# TODO : MSE et PSNR (MAX=255)\n# TODO : superposer le profil de la structure fine"
    },
    {
      "id": "segmentation",
      "title": "Industrial Segmentation & Object Counting",
      "level": "Intermédiaire",
      "duration": "Projet guidé",
      "tools": [
        "OpenCV",
        "Morphologie",
        "IoU"
      ],
      "brief": "Un atelier veut compter les pièces visibles sur un tapis. Crée des masques binaires, nettoie le bruit, compte les composantes et vérifie que les réglages ne fusionnent pas des pièces proches.",
      "objectives": [
        "Créer un masque par seuil",
        "Utiliser ouverture et composantes connexes",
        "Mesurer aire et bounding box",
        "Évaluer IoU sur masque de référence"
      ],
      "steps": [
        "Créer une image avec trois formes et des pixels parasites",
        "Produire une segmentation par seuil fixe/Otsu",
        "Tester deux tailles d'élément structurant",
        "Calculer les composantes et les surfaces",
        "Mesurer l'IoU au regard de la référence synthétique"
      ],
      "deliverables": [
        "Pipeline de comptage",
        "Images et masques annotés",
        "Tableau de surface des pièces",
        "Rapport d'évaluation"
      ],
      "acceptance": [
        "Les trois formes sont détectées dans le cas nominal",
        "Le fond n'est pas compté comme pièce",
        "L'IoU est définie et reproductible",
        "Les cas de fusion et de perte d'objet sont discutés"
      ],
      "starterCode": "import numpy as np\nimport cv2\nimport matplotlib.pyplot as plt\nreference=np.zeros((160,220),dtype=np.uint8)\ncv2.circle(reference,(45,65),18,255,-1)\ncv2.rectangle(reference,(100,40),(140,90),255,-1)\ncv2.circle(reference,(180,110),20,255,-1)\nimage=np.where(reference>0,200,40).astype(np.uint8)\nimage[8,8]=255;image[125,12]=255\n\n# TODO : segmenter et nettoyer les faux pixels\n# TODO : compter les objets avec connectedComponentsWithStats\n# TODO : calculer IoU entre prédiction et reference"
    },
    {
      "id": "video",
      "title": "Moving Object Detection Pipeline",
      "level": "Projet final",
      "duration": "Projet de stage simulé",
      "tools": [
        "OpenCV",
        "MOG2",
        "IoU/Dice"
      ],
      "brief": "Une caméra fixe observe un objet mobile. Développe une détection de mouvement sur plusieurs frames, enregistre les boîtes et évalue les masques sur une vérité terrain synthétique.",
      "objectives": [
        "Générer une séquence déterministe",
        "Construire une baseline en différence de frames puis MOG2",
        "Nettoyer les masques et extraire des boîtes",
        "Quantifier les erreurs et le temps de traitement"
      ],
      "steps": [
        "Construire 30 frames synthétiques et leurs masques de référence",
        "Comparer différence absolue et MOG2",
        "Optimiser les paramètres sur frames de développement",
        "Évaluer sur frames non utilisées pour les réglages",
        "Documenter les fausses détections et les limites"
      ],
      "deliverables": [
        "Script de traitement de frames",
        "Séquence de résultats annotés",
        "Tableau IoU/Dice et latence",
        "README de reproduction"
      ],
      "acceptance": [
        "Aucun fichier vidéo externe n'est nécessaire",
        "Les frames de test sont distinctes de celles de réglage",
        "Les métriques utilisent les masques alignés",
        "Les résultats sont reproductibles à seed identique"
      ],
      "starterCode": "import numpy as np\nimport cv2\nframes=[]\ntruth=[]\nfor t in range(30):\n    img=np.zeros((100,160,3),dtype=np.uint8)\n    gt=np.zeros((100,160),dtype=np.uint8)\n    x=10+t*3\n    cv2.circle(img,(x,50),9,(255,255,255),-1)\n    cv2.circle(gt,(x,50),9,255,-1)\n    frames.append(img);truth.append(gt)\n\n# TODO : différence de frames et MOG2\n# TODO : masque propre, bounding box, IoU par frame\n# TODO : moyenne et limites sur les frames de test"
    }
  ],
  "computer-vision": [
    {
      "id": "ml",
      "title": "Première classification d'images",
      "level": "Fondamentaux",
      "duration": "Projet guidé",
      "tools": [
        "scikit-learn",
        "KNN",
        "Matrice de confusion"
      ],
      "brief": "Construire une baseline reproductible de reconnaissance de chiffres manuscrits. Comparer KNN et un classifieur naïf, puis expliquer les erreurs plutôt que se limiter à une accuracy globale.",
      "objectives": [
        "Séparer train et test sans fuite",
        "Établir une baseline indépendante",
        "Mesurer accuracy et confusion",
        "Examiner des erreurs représentatives"
      ],
      "steps": [
        "Charger load_digits et observer images/étiquettes",
        "Créer train/test stratifiés",
        "Entraîner KNN et DummyClassifier",
        "Comparer les scores sur le même test",
        "Afficher trois erreurs et les expliquer"
      ],
      "deliverables": [
        "Notebook de classification",
        "Matrice de confusion",
        "Tableau de scores comparatifs",
        "Note d'analyse des erreurs"
      ],
      "acceptance": [
        "Même jeu test pour les modèles",
        "Aucun hyperparamètre choisi sur le test final",
        "Scores et erreur par classe rapportés",
        "Le code se relance"
      ],
      "starterCode": "from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.metrics import confusion_matrix,classification_report\nX,y=load_digits(return_X_y=True)\nX_train,X_test,y_train,y_test=train_test_split(X,y,test_size=.25,stratify=y,random_state=7)\n\n# TODO : baseline DummyClassifier et KNN(k=3)\n# TODO : matrice de confusion sur test\n# TODO : visualiser trois images incorrectes"
    },
    {
      "id": "cnn",
      "title": "Entraîner et évaluer un CNN PyTorch",
      "level": "Intermédiaire",
      "duration": "Projet guidé",
      "tools": [
        "PyTorch",
        "CNN",
        "Validation"
      ],
      "brief": "Apprendre un petit réseau convolutif sur des images 8×8. Expliquer toutes les formes de tenseurs, tracer train/validation loss et comparer à la baseline classique.",
      "objectives": [
        "Lire les shapes N×C×H×W",
        "Implémenter CNN et cross-entropy",
        "Séparer l'entraînement de la validation",
        "Mesurer les erreurs sur un test indépendant"
      ],
      "steps": [
        "Charger et normaliser digits",
        "Séparer train, validation et test",
        "Créer CNN avec Conv2d/ReLU/MaxPool",
        "Entraîner plusieurs époques et tracer les pertes",
        "Tester les erreurs et comparer à KNN"
      ],
      "deliverables": [
        "Notebook PyTorch et seed",
        "Courbes de perte",
        "Rapport par classe",
        "Modèle sauvegardé et procédure de recharge"
      ],
      "acceptance": [
        "Le test n'a pas servi au choix d'époque",
        "Les courbes et les métriques sont reproductibles",
        "L'architecture décrit ses dimensions",
        "La normalisation reste cohérente"
      ],
      "starterCode": "import torch\nfrom torch import nn\nfrom sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\ntorch.manual_seed(7)\ndigits=load_digits()\nx=torch.tensor(digits.images,dtype=torch.float32).unsqueeze(1)/16.\ny=torch.tensor(digits.target,dtype=torch.long)\n\n# TODO : train/validation/test stratifiés\n# TODO : définir Conv2d/ReLU/MaxPool/Linear\n# TODO : entraînement, évaluation, checkpoint"
    },
    {
      "id": "inspection",
      "title": "Vision industrielle — Inspection de défauts",
      "level": "Projet final",
      "duration": "Projet de stage simulé",
      "tools": [
        "OpenCV",
        "CNN",
        "Évaluation"
      ],
      "brief": "Un atelier souhaite différencier les produits acceptables des produits défectueux. Construis un dataset synthétique contrôlé, une baseline par seuil et une expérimentation de modèle appris, puis mesure le rappel des défauts.",
      "objectives": [
        "Générer images et masques de défauts",
        "Mesurer les faux négatifs et faux positifs",
        "Comparer baseline et approche apprise",
        "Rédiger limites et protocole de test"
      ],
      "steps": [
        "Créer 200 images synthétiques avec classes et graines",
        "Répartir train/val/test sans fuite",
        "Établir une baseline de détection des anomalies",
        "Entraîner facultativement un CNN sous PyTorch",
        "Comparer métriques, latence et erreurs réelles simulées"
      ],
      "deliverables": [
        "Dataset synthétique documenté",
        "Pipeline et tests",
        "Tableau précision/rappel/F1",
        "Rapport de robustesse et démonstration"
      ],
      "acceptance": [
        "La classe positive est explicitement le défaut",
        "Aucune image test ne sert à régler la baseline",
        "Le protocole est reproductible",
        "Les limites sur données synthétiques sont signalées"
      ],
      "starterCode": "import numpy as np\nimport cv2\nrng=np.random.default_rng(7)\nimages=[];classes=[]\nfor i in range(200):\n    image=np.full((64,64),100,dtype=np.uint8)\n    cv2.rectangle(image,(15,15),(49,49),180,-1)\n    defect=i%5==0\n    if defect: cv2.circle(image,(32,32),4,25,-1)\n    image=np.clip(image.astype(float)+rng.normal(0,5,image.shape),0,255).astype(np.uint8)\n    images.append(image);classes.append(int(defect))\nimages=np.array(images);classes=np.array(classes)\nprint(images.shape,classes.sum())\n\n# TODO : split train/validation/test\n# TODO : baseline de seuil, métriques et analyse\n# TODO : comparer avec un modèle appris si utile"
    }
  ]
};
