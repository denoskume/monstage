/* Computer vision guided follow-up cells. Run after the module reference code. */
export const visionFocusCode: Record<string,string[]> = {
  "classification-ml": [
    "# Classes présentes et effectifs\nfrom collections import Counter\nprint(\"Classes :\",sorted(set(y)))\nprint(\"Effectifs :\",Counter(y))",
    "# Une image est ici représentée par 64 intensités\nprint(\"Pixels par image :\",X.shape[1])\nprint(\"Exemple matrice 8×8 :\\n\",X[0].reshape(8,8))",
    "# Pipeline supervisé : apprendre puis prédire\nprint(\"Train :\",X_train.shape,\"Test :\",X_test.shape)\nprint(\"Exemples de prédictions :\",model.predict(X_test[:5]))",
    "# Vérifier le découpage stratifié et reproductible\nimport numpy as np\nassert len(X_train)+len(X_test)==len(X)\nprint(\"Classes test :\",np.unique(y_test,return_counts=True))",
    "# Comparer k=1,3,7 sur le même test\nfor k in [1,3,7]:\n m=KNeighborsClassifier(n_neighbors=k).fit(X_train,y_train)\n print(\"k =\",k,\"accuracy\",round(accuracy_score(y_test,m.predict(X_test)),3))",
    "# Erreurs détaillées par classe\nfrom sklearn.metrics import ConfusionMatrixDisplay\ncm=confusion_matrix(y_test,pred)\nprint(\"Échantillons incorrects :\",int(cm.sum()-cm.trace()))\nprint(\"Matrice 10×10 :\",cm.shape)"
  ],
  "reseaux-neurones": [
    "# Neurone : combinaison z = w·x + b\npoids=torch.tensor([0.5,-1.0])\nentree=torch.tensor([1.0,2.0])\nprint(\"z\",torch.dot(poids,entree)+1)",
    "# Trois activations sur les mêmes valeurs\nv=torch.tensor([-2.0,0.0,2.0])\nprint(\"ReLU\",torch.relu(v))\nprint(\"Sigmoid\",torch.sigmoid(v))\nprint(\"Softmax\",torch.softmax(v,dim=0))",
    "# Deux couches avec dimensions compatibles\nmlp=nn.Sequential(nn.Linear(3,8),nn.ReLU(),nn.Linear(8,2))\nprint(\"Sortie\",mlp(x).shape)",
    "# Entropie croisée : logits et classe cible\nlogits=torch.tensor([[2.0,0.1]])\ncible=torch.tensor([0])\nprint(\"Cross-entropy\",nn.functional.cross_entropy(logits,cible).item())",
    "# Gradients et mise à jour sur une couche simple\nopt=torch.optim.SGD(linear.parameters(),lr=0.1)\nloss=linear(relu(x)).pow(2).mean()\nopt.zero_grad();loss.backward();opt.step()\nprint(\"Loss\",loss.item())",
    "# Définir un batch et la notion d'époque\ndataset=torch.randn(10,3)\nfor epoch in range(2):\n for indices in torch.arange(len(dataset)).split(4):\n  lot=dataset[indices]\n  print(\"Époque\",epoch+1,\"Taille lot\",len(lot))"
  ],
  "convolutions-cnn": [
    "# Filtre fixe contre filtre appris\nsobel=torch.tensor([[-1.,0.,1.],[-2.,0.,2.],[-1.,0.,1.]])\nprint(\"Sobel fixé :\",sobel)\nprint(\"CNN entraînable :\",cnn[0].weight.requires_grad)",
    "# N × C × H × W\nprint(\"Dimensions entrée\",tuple(x.shape))\nprint(\"N\",x.shape[0],\"C\",x.shape[1],\"H\",x.shape[2],\"W\",x.shape[3])",
    "# Géométrie de convolution\nconv=nn.Conv2d(1,8,3,padding=0,stride=1)\nprint(\"Sans padding\",tuple(conv(x).shape))\nprint(\"Avec padding\",tuple(cnn[0](x).shape))",
    "# Visualiser la plage de la première feature map\nmaps=cnn[0](x)\nprint(\"Feature maps\",tuple(maps.shape))\nprint(\"Réponse min/max\",float(maps.min()),float(maps.max()))",
    "# Pooling local : quatre maxima\npetite=torch.arange(1,17,dtype=torch.float32).reshape(1,1,4,4)\nprint(nn.MaxPool2d(2)(petite).reshape(2,2))",
    "# Flatten et couche finale\nvector=nn.Flatten()(y)\nprint(\"Vecteur :\",tuple(vector.shape))\nprint(\"Sortie 10 classes :\",nn.Linear(vector.shape[1],10)(vector).shape)"
  ],
  "pytorch-entrainement": [
    "# Tenseurs : batch N × C × H × W\nprint(\"Images :\",tuple(x.shape),\"Targets :\",tuple(y.shape))\nprint(\"Dtype :\",x.dtype,y.dtype)",
    "# Inspecter les paramètres d'un nn.Module\nfor name,p in net.named_parameters():\n print(name,tuple(p.shape))",
    "# Loss sur un lot sans nouvelle optimisation\nnet.train()\nwith torch.no_grad():\n logits=net(x[tr[:8]])\n print(\"Loss actuelle :\",nn.functional.cross_entropy(logits,y[tr[:8]]).item())",
    "# train() et eval() changent l'état des couches\nnet.train();print(\"Mode train\",net.training)\nnet.eval();print(\"Mode evaluation\",not net.training)",
    "# Evaluer la perte sur un test réservé\nnet.eval()\nwith torch.no_grad():\n loss_test=nn.functional.cross_entropy(net(x[te]),y[te])\n print(\"Loss test :\",loss_test.item())",
    "# Reproductibilité : état et checkpoint temporaire\nfrom tempfile import TemporaryDirectory\nfrom pathlib import Path\nwith TemporaryDirectory() as d:\n p=str(Path(d)/'weights.pt')\n torch.save(net.state_dict(),p)\n print(\"Checkpoint enregistré :\",Path(p).exists())"
  ],
  "detection-objets": [
    "# Classification globale vs localisation\nprint(\"Une classe globale ne décrit pas les positions.\")\nprint(\"Boîtes détectées :\",len(contours))",
    "# Boîtes x, y, largeur, hauteur\nboxes=[cv2.boundingRect(c) for c in contours]\nprint(\"Boîtes (x,y,w,h) :\",boxes)",
    "# IoU de deux boîtes XYXY simples\ndef box_iou(a,b):\n x1,y1=max(a[0],b[0]),max(a[1],b[1])\n x2,y2=min(a[2],b[2]),min(a[3],b[3])\n inter=max(0,x2-x1)*max(0,y2-y1)\n area=lambda z:max(0,z[2]-z[0])*max(0,z[3]-z[1])\n return inter/(area(a)+area(b)-inter) if area(a)+area(b)-inter>0 else 0\nprint(\"IoU\",box_iou((0,0,20,20),(10,0,30,20)))",
    "# Chaque proposition associe boîte et confiance\npropositions=[(0.91,(20,20,75,75)),(0.62,(23,22,76,77))]\nprint(sorted(propositions,reverse=True))",
    "# NMS conceptuel sur deux boîtes voisines\nscores=[.91,.62]\noverlap=box_iou((20,20,75,75),(23,22,76,77))\nprint(\"Overlap\",round(overlap,2),\"Supprimer 2e ?\",overlap>0.5)",
    "# Cadence : un compromis mesurable\nfps=25\nlatence_cible_ms=1000/fps\nprint(\"Budget moyen par frame (ms)\",latence_cible_ms)"
  ],
  "segmentation-deep": [
    "# Deux objets peuvent partager une même classe\nsemantic=prediction.int()\nprint(\"Pixels de classe objet :\",semantic.sum().item())",
    "# Vérifier le masque d'annotation\nassert target.shape==prediction.shape\nprint(\"Shape\",tuple(target.shape),\"Classes\",torch.unique(target.int()).tolist())",
    "# Exemple pédagogique de skip connection : concaténer deux cartes\nfrom torch import nn\nhaut=torch.randn(1,4,8,8)\nbas=torch.randn(1,8,8,8)\nreuni=torch.cat([haut,bas],dim=1)\nprint(\"Canaux après concaténation :\",reuni.shape[1])",
    "# U-Net miniature : chemins à deux résolutions (formes)\nfeature=torch.randn(1,8,16,16)\nencode=nn.MaxPool2d(2)(feature)\ndecode=nn.Upsample(scale_factor=2,mode=\"nearest\")(encode)\nprint(\"Encoder\",encode.shape,\"Decoder\",decode.shape)",
    "# Loss Dice synthétique\ndice_loss=1-dice\nprint(\"Dice\",dice,\"Dice loss\",dice_loss)",
    "# IoU et Dice sur la même prédiction\nunion=torch.logical_or(target,prediction).sum().item()\nintersection=torch.logical_and(target,prediction).sum().item()\nprint(\"IoU\",intersection/union,\"Dice\",2*intersection/(target.sum().item()+prediction.sum().item()))"
  ],
  "evaluation-robustesse": [
    "# Préparer une séparation de données par groupe\nfrom sklearn.model_selection import GroupShuffleSplit\ngroupes=[\"A\",\"A\",\"B\",\"B\",\"C\",\"C\"]\nx=list(range(6))\ntr_idx,te_idx=next(GroupShuffleSplit(test_size=.34,random_state=7).split(x,groups=groupes))\nprint(\"Train groupes\",{groupes[i] for i in tr_idx})\nprint(\"Test groupes\",{groupes[i] for i in te_idx})",
    "# Précision, rappel et F1 des défauts\nfrom sklearn.metrics import f1_score\nprint(\"Précision :\",precision_score(reference,prediction,zero_division=0))\nprint(\"Rappel :\",recall_score(reference,prediction,zero_division=0))\nprint(\"F1 :\",f1_score(reference,prediction,zero_division=0))",
    "# IoU et Dice sur deux masques\nimport numpy as np\na=np.array([1,1,0,0],dtype=bool)\nb=np.array([1,0,1,0],dtype=bool)\ntp=np.logical_and(a,b).sum();union=np.logical_or(a,b).sum()\nprint(\"IoU\",tp/union,\"Dice\",2*tp/(a.sum()+b.sum()))",
    "# Augmentation cohérente image + masque\nimport numpy as np\nimage=np.arange(16).reshape(4,4)\nmasque=image>8\nprint(\"Alignés :\",np.array_equal(np.rot90(masque),np.rot90(image)>8))",
    "# Performance par sous-groupe\nimport pandas as pd\ndf=pd.DataFrame({\"groupe\":[\"A\",\"A\",\"B\",\"B\"],\"ok\":[True,False,False,False]})\nprint(df.groupby(\"groupe\")[\"ok\"].mean())",
    "# Mesurer temps d'exécution et dispersion\nimport time\ndurations=[]\nfor _ in range(20):\n start=time.perf_counter()\n _=sum(range(2000))\n durations.append((time.perf_counter()-start)*1000)\nprint(\"Median/P95 (ms)\",np.percentile(durations,[50,95]))"
  ],
  "projet-cv": [
    "# Spécifier la qualité attendue avant un modèle\nspec={\"tache\":\"classification chiffres\",\"kpi\":\"macro F1\",\"temps_cible_ms\":50}\nprint(spec)",
    "# Documenter les classes du dataset\nimport numpy as np\nclasses,counts=np.unique(y,return_counts=True)\nprint(dict(zip(classes.tolist(),counts.tolist())))",
    "# Comparer une baseline mesurable\nfrom sklearn.dummy import DummyClassifier\nbaseline=DummyClassifier(strategy='most_frequent').fit(X_tr,y_tr)\nprint(\"Accuracy baseline\",baseline.score(X_te,y_te))\nprint(\"Accuracy modèle\",model.score(X_te,y_te))",
    "# Inspecter des erreurs de classification\nimport numpy as np\npred=model.predict(X_te)\nerreurs=np.flatnonzero(pred!=y_te)\nprint(\"Erreurs\",len(erreurs),\"Premiers indices\",erreurs[:5])",
    "# Estimation latence d'inférence, à mesurer sur machine cible\nimport time\nd=[]\nfor _ in range(10):\n start=time.perf_counter();model.predict(X_te[:1]);d.append((time.perf_counter()-start)*1000)\nprint(\"Médiane (ms)\",np.median(d))",
    "# Livrable : informations de reproductibilité\nimport sklearn,sys\nprint(\"Python\",sys.version.split()[0],\"scikit-learn\",sklearn.__version__)\nprint(\"Test exemples :\",len(y_te))"
  ]
};
