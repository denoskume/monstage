import type { FormationTrack } from './formationTypes';

export const computerVisionTrack: FormationTrack = {
  "id": "computer-vision",
  "plan": "Plan A",
  "title": "Computer Vision — Machine Learning & Deep Learning",
  "subtitle": "Classification, CNN, PyTorch, détection et segmentation",
  "weeks": "8 à 10 semaines après les fondamentaux",
  "level": "Intermédiaire à junior",
  "tools": [
    "Python",
    "PyTorch",
    "scikit-learn",
    "OpenCV"
  ],
  "objective": "Transformer des pipelines d’images en systèmes capables de reconnaître, localiser et segmenter des objets, puis mesurer leur généralisation.",
  "project": "Projet final : baseline et modèle appris sur un problème de vision",
  "modules": [
    {
      "id": "classification-ml",
      "title": "Comprendre la classification d’images",
      "objective": "Passer d’une image à une étiquette en distinguant apprentissage et test.",
      "concept": "La classification assigne une catégorie à une image entière. Une machine apprend à partir de couples (image, étiquette). Pour évaluer la généralisation, on réserve un jeu de test indépendant et on évite toute fuite de données entre entraînement et test.",
      "points": [
        "Images, étiquettes et classes",
        "Features et représentation des pixels",
        "Apprentissage supervisé",
        "Entraînement, validation et test",
        "KNN et premier classifieur",
        "Matrice de confusion et erreurs"
      ],
      "example": "Classer des chiffres manuscrits de 0 à 9 avec les pixels bruts et un classifieur KNN.",
      "code": "from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.metrics import accuracy_score, confusion_matrix\n\nX,y=load_digits(return_X_y=True)\nX_train,X_test,y_train,y_test=train_test_split(X,y,test_size=.25,stratify=y,random_state=7)\nmodel=KNeighborsClassifier(n_neighbors=3).fit(X_train,y_train)\npred=model.predict(X_test)\nprint(\"Accuracy:\",round(accuracy_score(y_test,pred),3))\nprint(confusion_matrix(y_test,pred))",
      "result": "L’accuracy représente la proportion d’images test bien classées ; la matrice révèle quelles classes sont confondues.",
      "instructions": "Teste n_neighbors=1 puis 7. Compare les erreurs et explique pourquoi le score test peut changer.",
      "mission": "Livrer un classifieur baseline, ses métriques et trois exemples d’images mal classées.",
      "validation": "La séparation train/test est respectée et le résultat est reproductible.",
      "quiz": {
        "question": "Sur quel jeu doit-on rapporter la performance finale ?",
        "options": [
          "Entraînement",
          "Test indépendant",
          "Les images choisies à la main"
        ],
        "correct": 1,
        "explanation": "Le test indépendant estime la capacité à traiter des exemples non vus."
      },
      "codeLanguage": "python"
    },
    {
      "id": "reseaux-neurones",
      "title": "Fondamentaux des réseaux de neurones",
      "objective": "Comprendre les couches, les activations, la perte et l’apprentissage.",
      "concept": "Un neurone calcule une combinaison pondérée suivie d’une activation. Le modèle ajuste ses paramètres pour réduire une fonction de perte. La rétropropagation calcule les gradients et l’optimiseur met à jour les poids. Les décisions dépendent des données et de leur représentativité.",
      "points": [
        "Neurone et combinaison linéaire",
        "ReLU, sigmoid et softmax",
        "Couches et réseau feed-forward",
        "Fonction de perte et cross-entropy",
        "Gradient, rétropropagation et optimiseur",
        "Époques, batches et surapprentissage"
      ],
      "example": "Visualiser comment la fonction ReLU met à zéro les valeurs négatives.",
      "code": "import torch\nfrom torch import nn\ntorch.manual_seed(7)\nx=torch.tensor([[-2.,0.,3.]])\nrelu=nn.ReLU()\nprint(\"Entrée:\",x)\nprint(\"ReLU:\",relu(x))\nlinear=nn.Linear(3,2)\nprint(\"Couche linéaire:\",linear(relu(x)))",
      "result": "ReLU conserve les réponses positives et annule les négatives. Les sorties de la couche linéaire dépendent de poids initialisés, puis appris.",
      "instructions": "Modifie l’entrée pour observer quand ReLU devient nulle ; identifie weight et bias de la couche.",
      "mission": "Expliquer schématiquement les étapes forward → loss → backward → update.",
      "validation": "Un collègue peut distinguer prédiction, erreur et apprentissage.",
      "quiz": {
        "question": "Quel est le rôle de l’optimiseur ?",
        "options": [
          "Mettre à jour les poids",
          "Charger le dataset",
          "Changer la couleur de l’image"
        ],
        "correct": 0,
        "explanation": "L’optimiseur utilise les gradients pour mettre à jour les paramètres."
      },
      "codeLanguage": "python"
    },
    {
      "id": "convolutions-cnn",
      "title": "CNN : convolutions, filtres et pooling",
      "objective": "Relier les opérations d’images classiques aux convolutions apprises.",
      "concept": "Un CNN applique des noyaux dont les coefficients sont appris pendant l’entraînement. Chaque noyau produit une carte de caractéristiques ; ReLU introduit une non-linéarité ; le pooling réduit la résolution spatiale. Le nombre de canaux et la taille des tenseurs doivent rester cohérents.",
      "points": [
        "Filtres fixes versus filtres appris",
        "Entrées N×C×H×W",
        "Conv2d, stride et padding",
        "Feature maps et canaux",
        "ReLU et max-pooling",
        "Flatten et couche de classification"
      ],
      "example": "Suivre les dimensions d’un lot de dix images grayscale 28 × 28 après convolution et pooling.",
      "code": "import torch\nfrom torch import nn\nx=torch.rand(10,1,28,28) # batch, channels, height, width\ncnn=nn.Sequential(nn.Conv2d(1,8,kernel_size=3,padding=1),\n                  nn.ReLU(),nn.MaxPool2d(2))\ny=cnn(x)\nprint(\"Entrée:\",tuple(x.shape))\nprint(\"Sortie:\",tuple(y.shape))",
      "result": "10×1×28×28 devient 10×8×14×14. La convolution produit huit cartes ; le pooling divise la hauteur et la largeur par deux.",
      "instructions": "Change padding=0 et recalcule les dimensions. Explique les différences sur papier.",
      "mission": "Créer un mini CNN et annoter les dimensions à chaque couche.",
      "validation": "Chaque forme de tenseur concorde avec les paramètres de couche.",
      "quiz": {
        "question": "Un Conv2d à huit filtres crée généralement combien de canaux de sortie ?",
        "options": [
          "Un",
          "Huit",
          "Vingt-huit"
        ],
        "correct": 1,
        "explanation": "Chaque filtre de sortie produit une carte de caractéristiques."
      },
      "codeLanguage": "python"
    },
    {
      "id": "pytorch-entrainement",
      "title": "PyTorch : entraîner et valider un CNN",
      "objective": "Écrire une boucle d’apprentissage avec des résultats interprétables.",
      "concept": "L’entraînement alterne forward, calcul de perte, remise à zéro des gradients, backward et mise à jour des poids. Le jeu test n’est pas utilisé pour optimiser les hyperparamètres. Une baseline simple aide à juger si le CNN apporte un réel gain.",
      "points": [
        "Tensors et Dataset/DataLoader",
        "Définition du modèle nn.Module",
        "Optimiseur et cross-entropy",
        "Epoch, batch, train/eval",
        "Validation et suivi de la perte",
        "Reproductibilité et checkpoints"
      ],
      "example": "Entraîner un petit CNN sur les chiffres du jeu de données sklearn (8 × 8 pixels).",
      "code": "import torch\nfrom torch import nn\nfrom sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\n\ntorch.manual_seed(7)\ndigits=load_digits()\nx=torch.tensor(digits.images,dtype=torch.float32).unsqueeze(1)/16.\ny=torch.tensor(digits.target,dtype=torch.long)\ntr,te=train_test_split(range(len(y)),test_size=.25,stratify=y,random_state=7)\nnet=nn.Sequential(nn.Conv2d(1,8,3,padding=1),nn.ReLU(),\n                  nn.MaxPool2d(2),nn.Flatten(),nn.Linear(8*4*4,10))\nopt=torch.optim.Adam(net.parameters(),lr=.005)\nnet.train()\nfor epoch in range(5):\n    perm=torch.randperm(len(tr))\n    for batch in perm.split(64):\n        idx=[tr[i] for i in batch.tolist()]\n        loss=nn.functional.cross_entropy(net(x[idx]),y[idx])\n        opt.zero_grad();loss.backward();opt.step()\nnet.eval()\nwith torch.no_grad():\n    acc=(net(x[te]).argmax(1)==y[te]).float().mean().item()\nprint(\"Accuracy test:\",round(acc,3))",
      "result": "La précision de test mesure le comportement sur des exemples non vus. Le résultat varie selon les poids initiaux et le nombre d’époques.",
      "instructions": "Trace la perte par époque et explique ce qu’elle ne dit pas sur la généralisation.",
      "mission": "Comparer CNN et KNN sur le même jeu test et rédiger une recommandation argumentée.",
      "validation": "Deux runs reproductibles, métriques identifiées et aucune fuite train/test.",
      "quiz": {
        "question": "Quand utilise-t-on opt.zero_grad() ?",
        "options": [
          "Avant backward pour effacer les gradients précédents",
          "Avant le chargement d’image",
          "Après un affichage seulement"
        ],
        "correct": 0,
        "explanation": "En PyTorch, les gradients s’accumulent par défaut entre les appels backward."
      },
      "codeLanguage": "python"
    },
    {
      "id": "detection-objets",
      "title": "Détection et localisation d’objets",
      "objective": "Comprendre les boîtes englobantes et les principes de la détection moderne.",
      "concept": "La classification assigne une classe globale, alors que la détection associe classe et bounding box à chaque objet. L’IoU compare une boîte prédite à la référence. Les détecteurs modernes apprennent des boîtes et des scores ; une baseline classique aide à comprendre la géométrie.",
      "points": [
        "Classification vs détection",
        "Bounding boxes et coordonnées",
        "IoU des boîtes",
        "Propositions de régions et confiance",
        "Notion de non-maximum suppression",
        "Détecteurs YOLO/Faster R-CNN : principes et limites"
      ],
      "example": "Localiser deux formes géométriques grâce à leurs contours, comme baseline avant un modèle appris.",
      "code": "import cv2\nimport numpy as np\nimage=np.zeros((130,210,3),dtype=np.uint8)\ncv2.rectangle(image,(20,20),(75,75),(255,255,255),-1)\ncv2.circle(image,(150,65),25,(255,255,255),-1)\nmask=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)\ncontours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)\nfor contour in contours:\n    x,y,w,h=cv2.boundingRect(contour)\n    cv2.rectangle(image,(x,y),(x+w,y+h),(0,255,0),2)\n    print(\"Box:\",(x,y,w,h))",
      "result": "Les boîtes englobantes délimitent les régions détectées, mais la baseline ne sait pas reconnaître la classe réelle d’un objet.",
      "instructions": "Ajoute deux formes proches ; explique pourquoi la segmentation peut fusionner des régions.",
      "mission": "Annoter dix images avec boîtes de référence puis mesurer l’IoU d’une baseline.",
      "validation": "Les coordonnées et l’évaluation sont cohérentes avec le repère image.",
      "quiz": {
        "question": "Pourquoi une boîte de forte confiance peut-elle rester incorrecte ?",
        "options": [
          "Le score n’est pas une preuve de bonne localisation",
          "L’image est toujours vide",
          "L’IoU doit valoir zéro"
        ],
        "correct": 0,
        "explanation": "La confiance et la qualité géométrique sont deux aspects distincts."
      },
      "codeLanguage": "python"
    },
    {
      "id": "segmentation-deep",
      "title": "Segmentation par deep learning",
      "objective": "Distinguer segmentation classique, sémantique et par instance.",
      "concept": "La segmentation sémantique attribue une classe à chaque pixel ; l’instance segmentation distingue des objets individuels de la même classe. Les architectures de type U-Net conservent des informations spatiales grâce aux connexions de saut. Les masques doivent être alignés avec les images et rééchantillonnés sans inventer de classes.",
      "points": [
        "Semantic vs instance segmentation",
        "Masques ground truth et conventions de classe",
        "Encoder, decoder et skip connections",
        "U-Net : intuition architecturale",
        "Loss Dice et cross-entropy",
        "IoU/Dice par classe, validation"
      ],
      "example": "Simuler une prédiction de masque et mesurer le score Dice par rapport à un masque de référence.",
      "code": "import torch\ntarget=torch.tensor([[0,1,1,0],[0,1,1,0]],dtype=torch.bool)\nprediction=torch.tensor([[0,1,0,0],[0,1,1,1]],dtype=torch.bool)\ninter=(target & prediction).sum().item()\ndice=2*inter/(target.sum().item()+prediction.sum().item())\nprint(\"Dice:\",round(dice,3))\n# Sur un vrai projet, les masques viennent des annotations du dataset.",
      "result": "Trois pixels sont correctement prédits en positif ; Dice vaut 0,75. Les faux positifs et faux négatifs affectent le recouvrement.",
      "instructions": "Déplace un pixel de l’objet prédit et calcule l’évolution des faux négatifs.",
      "mission": "Produire un protocole de préparation images/masques et une grille d’évaluation sur données tests.",
      "validation": "Aucun masque test n’entre dans l’entraînement et les classes restent intactes lors du redimensionnement.",
      "quiz": {
        "question": "Pour redimensionner un masque catégoriel, quelle interpolation utiliser ?",
        "options": [
          "Bilinear",
          "Nearest-neighbor",
          "Cubic"
        ],
        "correct": 1,
        "explanation": "L’interpolation nearest-neighbor conserve les codes de classes."
      },
      "codeLanguage": "python"
    },
    {
      "id": "evaluation-robustesse",
      "title": "Évaluer, généraliser et optimiser",
      "objective": "Mesurer une performance réelle et diagnostiquer les échecs.",
      "concept": "La performance dépend de la distribution des données, de l’équilibre des classes et du coût des erreurs. La validation sert aux choix techniques ; le test final reste indépendant. L’analyse des faux positifs, faux négatifs et biais par segment est aussi importante qu’une métrique globale.",
      "points": [
        "Train, validation, test et fuite de données",
        "Confusion matrix, précision, rappel, F1",
        "IoU et Dice pour masques",
        "Surapprentissage et augmentation",
        "Performance par classe et distribution",
        "Reproductibilité, temps d’inférence et limites"
      ],
      "example": "Une détection de défaut peut avoir une bonne accuracy et rater presque tous les défauts si ceux-ci sont rares.",
      "code": "from sklearn.metrics import confusion_matrix,precision_score,recall_score\nreference=[0]*95+[1]*5\nprediction=[0]*100\nprint(\"Matrice:\",confusion_matrix(reference,prediction))\nprint(\"Accuracy:\",sum(a==b for a,b in zip(reference,prediction))/100)\nprint(\"Recall défaut:\",recall_score(reference,prediction,zero_division=0))",
      "result": "Accuracy de 95 %, mais rappel défaut de 0 %. Le modèle ne détecte aucun cas positif : la métrique globale peut tromper.",
      "instructions": "Modifie les cinq dernières prédictions et calcule le compromis entre précision et rappel.",
      "mission": "Rédiger un rapport comparant deux modèles selon les erreurs importantes pour l’entreprise.",
      "validation": "La métrique choisie reflète le coût métier des erreurs.",
      "quiz": {
        "question": "Quelle métrique indique la proportion des défauts réellement retrouvés ?",
        "options": [
          "Recall",
          "Nombre d’images",
          "Taille du modèle"
        ],
        "correct": 0,
        "explanation": "Le rappel mesure la proportion des cas positifs correctement détectés."
      },
      "codeLanguage": "python"
    },
    {
      "id": "projet-cv",
      "title": "Projet Computer Vision de bout en bout",
      "objective": "Livrer une baseline, une évaluation et une démonstration reproductible.",
      "concept": "Un projet de vision professionnel commence par définir la tâche et la qualité attendue. Il établit un dataset et une baseline, entraîne un modèle seulement si nécessaire, mesure les erreurs par catégorie et documente les conditions d’usage. Les données tests ne doivent pas servir à ajuster le modèle.",
      "points": [
        "Brief, métriques et contraintes métier",
        "Préparation du dataset et annotation",
        "Baseline classique puis modèle appris",
        "Validation et analyse d’erreurs",
        "Performance et latence",
        "Versionnement, README, restitution"
      ],
      "example": "Construire un classifieur reproductible sur digits avec une baseline mesurée et des tests simples.",
      "code": "from sklearn.datasets import load_digits\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import classification_report\nX,y=load_digits(return_X_y=True)\nX_tr,X_te,y_tr,y_te=train_test_split(X,y,stratify=y,random_state=7)\nmodel=make_pipeline(StandardScaler(),LogisticRegression(max_iter=1000))\nmodel.fit(X_tr,y_tr)\nprint(classification_report(y_te,model.predict(X_te),zero_division=0))",
      "result": "Le rapport par classe expose la précision et le rappel, pas uniquement une accuracy moyenne. Une baseline claire prépare une comparaison sérieuse.",
      "instructions": "Présente trois échecs, formule une hypothèse sur leurs causes et propose un protocole d’amélioration.",
      "mission": "Livrer notebook, dataset documenté, modèle baseline, rapport et démonstration courte.",
      "validation": "Le code se relance et les métriques proviennent d’un test indépendant.",
      "quiz": {
        "question": "Quelle pratique améliore la fiabilité d’un modèle de vision ?",
        "options": [
          "Évaluer sur un test indépendant",
          "Réutiliser le test pour régler les paramètres",
          "Cacher les exemples erronés"
        ],
        "correct": 0,
        "explanation": "La validation indépendante et l’analyse d’erreurs sont indispensables."
      },
      "codeLanguage": "python"
    }
  ]
};
