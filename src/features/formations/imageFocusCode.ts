/* Runnable topic-specific image-processing experiments.
   Each fragment executes after its module's reference code in the exported notebook. */
export const imageFocusCode: Record<string,string[]> = {
  "images-pixels": [
    "# Indexation : ligne puis colonne\nprint(\"Pixels shape\",pixels.shape)\nprint(\"Ligne 2 / colonne 3 =\",pixels[1,2])",
    "# Profil 1D d'un signal image 2D\nplt.plot(pixels[1,:],marker='o')\nplt.xlabel(\"Colonne\");plt.ylabel(\"Intensité\");plt.show()",
    "# Résolution et nombre de pixels\nh,w=pixels.shape\nprint(\"Résolution :\",w,\"×\",h,\"=\",w*h,\"pixels\")",
    "# Quantification à quatre niveaux\nq=(pixels//64)*64\nprint(\"Niveaux présents :\",np.unique(q))",
    "# Image grise vers trois canaux RGB\nrgb=np.stack([pixels,pixels,pixels],axis=-1)\nprint(\"Shape image RGB :\",rgb.shape)",
    "# Paramètre métier : compter la surface claire\nprint(\"Zone positive (>128) :\",int((pixels>128).sum()),\"pixels\")"
  ],
  "python-images": [
    "# Exécution des cellules dans l'ordre\nprint(\"Avant\",image.tolist())\nprint(\"Après\",eclaircie.tolist())",
    "# Inspection systématique d'un tableau\nprint(\"Dimensions\",image.shape,\"Type\",image.dtype,\"Plage\",image.min(),image.max())",
    "# Sélection d'une région par slicing\nregion=image[0:2,1:3]\nprint(\"ROI\",region,\"Shape\",region.shape)",
    "# Masque booléen des zones sombres\nmask=image<100\nprint(\"Pixels sombres\",mask.astype(int))",
    "# Arithmétique sûre sur uint8\nsafe=np.clip(image.astype(np.int16)+80,0,255).astype(np.uint8)\nprint(\"Après +80 :\",safe)",
    "# Comparaison à échelle identique\nfig,ax=plt.subplots(1,2)\nfor a,im in zip(ax,[image,eclaircie]):\n a.imshow(im,cmap='gray',vmin=0,vmax=255)\nplt.show()"
  ],
  "opencv-couleurs": [
    "# Contrôle de la bibliothèque\nprint(\"Version OpenCV :\",cv2.__version__)",
    "# Enregistrer puis relire un PNG\nfrom tempfile import TemporaryDirectory\nfrom pathlib import Path\nwith TemporaryDirectory() as d:\n p=str(Path(d)/'bandes.png')\n assert cv2.imwrite(p,bgr)\n recharge=cv2.imread(p)\n print(\"Identique :\",np.array_equal(bgr,recharge))",
    "# Inversion BGR/RGB : constater l'effet\nprint(\"BGR pixel gauche :\",bgr[10,10])\nprint(\"RGB pixel gauche :\",rgb[10,10])",
    "# Teinte, saturation et valeur\nhsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV)\nprint(\"HSV bleu :\",hsv[10,10])\nprint(\"Canaux :\",hsv.shape[-1])",
    "# Pourquoi PNG pour les masques\nmasque=(gray>100).astype(np.uint8)*255\nprint(\"Classes présentes :\",np.unique(masque))",
    "# Validation à la lecture\nassert bgr.ndim==3 and bgr.shape[2]==3\nassert bgr.dtype==np.uint8\nprint(\"Image BGR valide :\",bgr.shape)"
  ],
  "contraste-histogrammes": [
    "# Étendue dynamique avant/après\nprint(\"Avant\",base.min(),base.max())\nprint(\"CLAHE\",corrigee.min(),corrigee.max())",
    "# Histogramme NumPy avec 16 classes\nhist,bins=np.histogram(base,bins=16,range=(0,256))\nprint(\"Pixels :\",hist.sum(),\"Bins :\",bins[:3])",
    "# Correction affine en type flottant\naffine=np.clip(base.astype(float)*1.5+15,0,255).astype(np.uint8)\nprint(\"Étendue\",affine.min(),affine.max())",
    "# Normalisation explicite sur 0–255\nnormalisee=cv2.normalize(base,None,0,255,cv2.NORM_MINMAX)\nprint(\"Min/Max\",normalisee.min(),normalisee.max())",
    "# Correction gamma en intensité normalisée\ngamma=np.round((base/255.0)**0.5*255).astype(np.uint8)\nprint(\"Moyennes\",base.mean(),gamma.mean())",
    "# Réglages CLAHE : comparer\nc1=cv2.createCLAHE(clipLimit=1.0).apply(base)\nc4=cv2.createCLAHE(clipLimit=4.0).apply(base)\nprint(\"Écarts moyens\",np.abs(c1.astype(float)-c4).mean())"
  ],
  "convolution": [
    "# Noyau et somme des coefficients\nprint(\"Noyau :\",noyau)\nprint(\"Somme :\",noyau.sum())",
    "# Calcul du pixel central à la main\nvoisins=image[6:9,6:9]\nprint(\"Moyenne manuelle\",np.sum(voisins*noyau))",
    "# Différence aux bords selon padding\nzero=cv2.filter2D(image,-1,noyau,borderType=cv2.BORDER_CONSTANT)\nreflet=cv2.filter2D(image,-1,noyau,borderType=cv2.BORDER_REFLECT)\nprint(\"Coin\",zero[0,0],reflet[0,0])",
    "# Comparer moyenne et gaussien sur la même source\nmean=cv2.blur(image,(5,5))\ngauss=cv2.GaussianBlur(image,(5,5),0)\nprint(\"Différence\",np.abs(mean-gauss).sum())",
    "# Noyau de netteté : somme des coefficients = 1\nsharp=np.array([[0,-1,0],[-1,5,-1],[0,-1,0]],dtype=np.float32)\nimage_sharp=cv2.filter2D(image,-1,sharp)\nprint(\"Pic après netteté\",image_sharp.max())",
    "# Effet d'une plus grande fenêtre\nlarge=cv2.blur(image,(7,7))\nprint(\"Maximum lissage 3x3\",filtre.max(),\"7x7\",large.max())"
  ],
  "bruit-debruitage": [
    "# Le bruit résiduel se mesure sur une référence connue\nprint(\"Moyenne référence\",base.mean())\nprint(\"Moyenne image dégradée\",bruitee.mean())",
    "# Différencier impulsions et bruit gaussien\ng=np.random.default_rng(10).normal(0,15,base.shape)\nbruit_gauss=np.clip(base.astype(float)+g,0,255).astype(np.uint8)\nprint(\"Pixels modifiés\",np.count_nonzero(bruit_gauss!=base))",
    "# Reproductibilité du générateur aléatoire\na=np.random.default_rng(9).normal(size=10)\nb=np.random.default_rng(9).normal(size=10)\nassert np.array_equal(a,b)\nprint(\"Seed reproductible\")",
    "# Débruitage médian vs gaussien\nprint(\"Erreur médian\",np.mean((median.astype(float)-base)**2))\nprint(\"Erreur gaussien\",np.mean((gauss.astype(float)-base)**2))",
    "# Profil horizontal à travers un bord\ncentre=base.shape[0]//2\nplt.plot(base[centre],label=\"Référence\")\nplt.plot(gauss[centre],label=\"Gaussien\")\nplt.legend();plt.show()",
    "# PSNR à MAX=255 sur référence connue\nmse=np.mean((median.astype(float)-base)**2)\npsnr=float('inf') if mse==0 else 10*np.log10(255**2/mse)\nprint(\"MSE\",mse,\"PSNR (dB)\",psnr)"
  ],
  "transformations": [
    "# ROI : x et y correspondent aux colonnes/lignes\nroi=image[45:95,25:115]\nprint(\"Taille ROI\",roi.shape)",
    "# Conserver le rapport d'aspect\nredim=cv2.resize(image,None,fx=.5,fy=.5)\nprint(\"Avant\",image.shape,\"Après\",redim.shape)",
    "# Nearest-neighbor pour un masque binaire\nr_nearest=cv2.resize(image,(70,70),interpolation=cv2.INTER_NEAREST)\nprint(\"Classes\",np.unique(r_nearest))",
    "# Paramètres de la rotation\nprint(\"Matrice affine 2×3 :\\n\",M)\nprint(\"Centre original\",image[70,70],\"Centre rotaté\",tournee[70,70])",
    "# Perspective sur quatre points correspondants\nsrc=np.float32([[0,0],[139,0],[139,139],[0,139]])\ndst=np.float32([[10,10],[125,0],[139,139],[0,125]])\nH=cv2.getPerspectiveTransform(src,dst)\nprint(\"Homographie\",H.shape)",
    "# Conversion en mm si échelle validée\nlongueur_px=50\npixels_par_mm=20\nprint(\"Longueur physique (mm)\",longueur_px/pixels_par_mm)"
  ],
  "contours-gradients": [
    "# Dérivées discrètes selon x et y\ngx=cv2.Sobel(image,cv2.CV_64F,1,0)\ngy=cv2.Sobel(image,cv2.CV_64F,0,1)\nprint(\"Gradients\",gx.shape,gy.shape)",
    "# Norme et direction du gradient\ngx=cv2.Sobel(image,cv2.CV_64F,1,0)\ngy=cv2.Sobel(image,cv2.CV_64F,0,1)\nmagnitude=np.hypot(gx,gy)\ndirection=np.arctan2(gy,gx)\nprint(\"Gradient max\",magnitude.max(),\"Angle\",direction[30,35])",
    "# Sobel vs Laplacien\nlap=cv2.Laplacian(image,cv2.CV_64F)\nprint(\"Réponse laplacien min/max\",lap.min(),lap.max())",
    "# Double seuil Canny\nbas=cv2.Canny(image,30,90)\nhaut=cv2.Canny(image,100,200)\nprint(\"Pixels de contour\",np.count_nonzero(bas),np.count_nonzero(haut))",
    "# Lissage avant détection des contours\nlisse=cv2.GaussianBlur(image,(5,5),0)\nprint(\"Contours après lissage\",np.count_nonzero(cv2.Canny(lisse,50,150)))",
    "# HoughLinesP détecte des segments, s'ils sont présents\nsegments=cv2.HoughLinesP(edges,1,np.pi/180,threshold=25,minLineLength=20,maxLineGap=5)\nprint(\"Segments\",0 if segments is None else len(segments))"
  ],
  "segmentation": [
    "# Conversion en booléen : fond = False, objet = True\nboolmask=masque>0\nprint(\"Fraction d'objet\",boolmask.mean())",
    "# Seuil fixe à 100, même image source\n_,fixe=cv2.threshold(image,100,255,cv2.THRESH_BINARY)\nprint(\"Différences avec Otsu\",np.count_nonzero(fixe!=masque))",
    "# Otsu renvoie aussi le seuil sélectionné\nprint(\"Seuil Otsu\",seuil,\"Nombre objets pixels\",np.count_nonzero(masque))",
    "# Seuillage adaptatif (bloc impair)\nlocal=cv2.adaptiveThreshold(image,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,\n                            cv2.THRESH_BINARY,11,2)\nprint(\"Pixels retenus\",np.count_nonzero(local))",
    "# Plages HSV sur image couleur synthétique\nrgb=cv2.cvtColor(image,cv2.COLOR_GRAY2BGR)\nhsv=cv2.cvtColor(rgb,cv2.COLOR_BGR2HSV)\ncouleur=cv2.inRange(hsv,(0,0,100),(179,255,255))\nprint(\"Pixels dans la plage\",np.count_nonzero(couleur))",
    "# Compter les régions après Otsu\nn,labels,stats,centres=cv2.connectedComponentsWithStats(masque)\nprint(\"Composantes hors fond\",n-1)\nprint(\"Aires\",stats[1:,cv2.CC_STAT_AREA])"
  ],
  "morphologie": [
    "# Noyau elliptique utilisé pour la morphologie\nprint(\"Element structurant :\",kernel)",
    "# Érosion et dilatation de l'image binaire\nerode=cv2.erode(masque,kernel)\ndilate=cv2.dilate(masque,kernel)\nprint(\"Aires\",np.count_nonzero(erode),np.count_nonzero(dilate))",
    "# L'ouverture et la fermeture ne sont pas identiques\nouvert=cv2.morphologyEx(masque,cv2.MORPH_OPEN,kernel)\nferme=cv2.morphologyEx(masque,cv2.MORPH_CLOSE,kernel)\nprint(\"Pixels objet\",np.count_nonzero(ouvert),np.count_nonzero(ferme))",
    "# Un trou artificiel dans le masque\navec_trou=clean.copy();avec_trou[45,55]=0\nferme=cv2.morphologyEx(avec_trou,cv2.MORPH_CLOSE,kernel)\nprint(\"Pixel centre\",avec_trou[45,55],ferme[45,55])",
    "# ConnectedComponentsWithStats et fond label 0\nn,labels,stats,centres=cv2.connectedComponentsWithStats(clean)\nprint(\"Objets\",n-1,\"Centroïdes\",centres[1:])",
    "# Mesures de contours et bounding box\ncontours,_=cv2.findContours(clean,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)\nfor c in contours:\n print(\"Aire\",cv2.contourArea(c),\"Périmètre\",cv2.arcLength(c,True),\n       \"Box\",cv2.boundingRect(c))"
  ],
  "fourier": [
    "# Energie de la représentation fréquentielle\nf=np.fft.fft2(image)\nprint(\"Moyenne spatial\",image.mean(),\"DC\",f[0,0].real)",
    "# Fourier et inverse : reconstruction\nf=np.fft.fft2(image)\nreconstruction=np.fft.ifft2(f).real\nprint(\"Erreur reconstruction\",np.abs(image-reconstruction).max())",
    "# fftshift : pic basse fréquence au centre\ncentree=np.fft.fftshift(np.fft.fft2(image))\nprint(\"Centre spectral\",np.abs(centree[64,64]))",
    "# Filtrage passe-bas par masque fréquentiel doux\nf=np.fft.fftshift(np.fft.fft2(image))\ny,x=np.ogrid[-64:64,-64:64]\nmask=np.exp(-(x*x+y*y)/(2*14**2))\nfiltre=np.fft.ifft2(np.fft.ifftshift(f*mask)).real\nprint(\"Variance avant/après\",image.var(),filtre.var())",
    "# Localiser les pics d'un motif périodique\nf=np.abs(np.fft.fftshift(np.fft.fft2(image)))\niy,ix=np.unravel_index(np.argmax(f),f.shape)\nprint(\"Pic dominant (y,x)\",iy,ix)",
    "# Contrôler la partie imaginaire de l'inverse\ninverse=np.fft.ifft2(np.fft.fft2(image))\nprint(\"Résidu imaginaire max\",np.abs(inverse.imag).max())"
  ],
  "video-mouvement": [
    "# Définir cadence et durée des frames\nfps=25\nprint(\"250 frames représentent\",250/fps,\"secondes\")",
    "# Vérifier systématiquement le succès du flux\ncap=cv2.VideoCapture(\"fichier_introuvable.mp4\")\nret,lecture=cap.read()\nprint(\"Frame disponible ?\",ret)\ncap.release()",
    "# Différence de frames synthétiques\na=np.zeros((60,100),dtype=np.uint8)\nb=a.copy();b[20:30,30:50]=255\ndiff=cv2.absdiff(a,b)\nprint(\"Pixels différents\",np.count_nonzero(diff))",
    "# Réinitialiser un modèle MOG2 et inspecter un mouvement\ndetecteur=cv2.createBackgroundSubtractorMOG2(history=10,detectShadows=False)\nfor i in range(6):\n im=np.zeros((50,80,3),dtype=np.uint8)\n cv2.circle(im,(10+i*6,25),5,(255,255,255),-1)\n mouvement=detecteur.apply(im)\nprint(\"Pixels mouvement\",np.count_nonzero(mouvement))",
    "# Nettoyer le masque d'une frame\nkernel=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3))\npropre=cv2.morphologyEx(mask,cv2.MORPH_OPEN,kernel)\nprint(\"Avant/après\",np.count_nonzero(mask),np.count_nonzero(propre))",
    "# Boîtes des régions mobiles détectées\ncontours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)\nprint(\"Nombre régions\",len(contours))\nfor c in contours: print(\"BBox\",cv2.boundingRect(c))"
  ],
  "evaluation": [
    "# Ground truth et prédiction : mêmes dimensions\nassert ref.shape==pred.shape\nprint(\"Pixels positifs référence\",ref.sum())",
    "# MSE et PSNR sur deux images de référence\noriginal=np.array([[0,10],[20,30]],dtype=np.float64)\npredite=np.array([[0,12],[20,32]],dtype=np.float64)\nmse=np.mean((original-predite)**2)\nprint(\"MSE\",mse,\"PSNR\",10*np.log10(255**2/mse))",
    "# SSIM sur images assez grandes pour sa fenêtre\nfrom skimage.metrics import structural_similarity as ssim\nbase=np.tile(np.arange(16,dtype=np.uint8)*16,(16,1))\nalt=base.copy();alt[4:8,4:8]=0\nprint(\"SSIM\",ssim(base,alt,data_range=255))",
    "# Intersection et union\nprint(\"TP pixels\",np.logical_and(ref,pred).sum())\nprint(\"Union\",np.logical_or(ref,pred).sum())\nprint(\"IoU\",inter/union)",
    "# Dice et lien avec IoU\ndice=2*inter/(ref.sum()+pred.sum())\nprint(\"Dice\",dice,\"Depuis IoU\",2*(inter/union)/(1+inter/union))",
    "# Faux positifs et faux négatifs\nfp=np.logical_and(pred,~ref).sum()\nfn=np.logical_and(ref,~pred).sum()\nprint(\"Faux positifs\",fp,\"Faux négatifs\",fn)",
    "# Un test indépendant de l'exemple didactique\nautre_ref=np.array([1,0,1],dtype=bool)\nautre_pred=np.array([1,1,0],dtype=bool)\nprint(\"IoU test\",np.logical_and(autre_ref,autre_pred).sum()/np.logical_or(autre_ref,autre_pred).sum())"
  ],
  "pipeline-industrie": [
    "# Exigences vérifiables : deux formes dans cette scène\nprint(\"Attendu : 2 objets ; détectés :\",nb)\nassert nb==2",
    "# Séparer la lecture de la segmentation\ndef preprocess(gris):\n if gris.ndim!=2: raise ValueError(\"Gris attendu\")\n return cv2.GaussianBlur(gris,(3,3),0)\nprint(preprocess(image).shape)",
    "# Validation d'entrée stricte\ntry: compter_objets(None)\nexcept ValueError as err: print(\"Erreur attendue :\",err)",
    "# Traiter un lot d'images et sauvegarder le bilan\nlot=[image,image.copy(),np.zeros_like(image)]\nresultats=[compter_objets(im)[0] for im in lot]\nprint(\"Comptage par image\",resultats)",
    "# Tests : aucun objet, deux objets, données invalides\nassert compter_objets(np.zeros_like(image))[0]==0\nassert compter_objets(image)[0]==2\nprint(\"Tests réussis\")",
    "# Enregistrement PNG d'un masque traité\nfrom tempfile import TemporaryDirectory\nfrom pathlib import Path\nwith TemporaryDirectory() as d:\n sortie=str(Path(d)/'masque.png')\n cv2.imwrite(sortie,masque)\n print(\"Export\",Path(sortie).exists())"
  ]
};
