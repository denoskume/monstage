/* 85 focused image-processing lessons. Indexed in the order of imageProcessingTrack.points. */
export const imageLessonNotes: Record<string, Array<[string,string,string]>> = {
  "images-pixels": [
    [
      "Le pixel est la plus petite unité adressable de l’image raster. Dans NumPy, image[ligne, colonne] suit l’ordre (y,x), alors qu’un point dessiné en OpenCV est souvent fourni comme (x,y).",
      "Modifie exactement le pixel (ligne 2, colonne 3), puis repère-le sur la figure.",
      "Inverser ligne/colonne provoque un déplacement de la sélection, parfois invisible sur des images carrées."
    ],
    [
      "Une image peut être traitée comme un signal à deux variables spatiales I(x,y), dont l’amplitude représente une intensité. Cette représentation permet d’appliquer filtres, dérivées et transformées de Fourier.",
      "Dessine une ligne d’intensité horizontale et représente son profil en fonction de x.",
      "Un profil 1D extrait de l’image ne résume pas toutes les structures 2D."
    ],
    [
      "La résolution donne le nombre de pixels en hauteur et largeur ; le rapport d’aspect est largeur/hauteur. Une image de 640×480 contient 307 200 pixels, sans indiquer nécessairement la taille physique de l’objet.",
      "Compare 640×480 et 320×240 et calcule le nombre de pixels et le ratio.",
      "La résolution en pixels ne suffit pas pour mesurer une distance en millimètres."
    ],
    [
      "L’échantillonnage transforme un signal continu en grille ; la quantification associe chaque amplitude à un niveau discret. Une image uint8 possède jusqu’à 256 niveaux, pas nécessairement tous utilisés.",
      "Quantifie une rampe 0–255 en quatre niveaux et compare les contours visibles.",
      "Une quantification trop grossière crée des bandes et perd des nuances irréversiblement."
    ],
    [
      "En niveaux de gris, un pixel comporte une intensité ; en RGB, trois canaux représentent les composantes rouge, verte et bleue. D’autres formats peuvent contenir alpha, profondeur ou plusieurs bandes spectrales.",
      "Construis un pixel RGB (255,0,0), puis convertis trois pixels colorés en niveaux de gris.",
      "Traiter un masque de segmentation comme une photo RGB peut altérer ses étiquettes."
    ],
    [
      "Les mêmes opérations élémentaires servent à inspecter une pièce, une image médicale ou un flux robotique, mais les contraintes diffèrent : éclairage, sécurité, fréquence, résolution et besoin de validation.",
      "Choisis deux domaines et rédige pour chacun une question mesurable et une contrainte de qualité.",
      "Un algorithme performant sur un banc synthétique peut échouer sur un capteur réel."
    ]
  ],
  "python-images": [
    [
      "Dans un notebook, les cellules Markdown expliquent et les cellules Python calculent. L’ordre d’exécution doit être cohérent ; un redémarrage puis exécution complète doit reproduire chaque figure.",
      "Crée trois cellules : objectif, matrice NumPy, figure de résultat, puis exécute tout dans l’ordre.",
      "Un notebook dépendant de variables laissées en mémoire par une session précédente n’est pas reproductible."
    ],
    [
      "Un ndarray décrit un bloc homogène avec shape, ndim et dtype. Une image uint8 n’a pas le même comportement arithmétique qu’une image float32 ; vérifier le type évite les surprises.",
      "Affiche ndim, shape, dtype, min et max d’une image synthétique.",
      "Une multiplication sur uint8 peut produire un débordement si le calcul n’est pas converti avant."
    ],
    [
      "Le slicing image[y1:y2,x1:x2] découpe une région d’intérêt. Le bord final est exclusif ; on doit vérifier que les indices restent dans la taille de l’image.",
      "Extrais une région de 30×40 pixels et prouve sa dimension avec shape.",
      "Confondre x et y décale la région sur les images non carrées."
    ],
    [
      "Un masque booléen a la même taille spatiale que l’image et indique les pixels sélectionnés. Il permet des modifications vectorisées, par exemple éclaircir uniquement les pixels sombres.",
      "Définis masque=image<100, puis compte les pixels concernés et applique une correction.",
      "Un masque dont la forme ne correspond pas à l’image peut produire des sélections incorrectes."
    ],
    [
      "Les opérations vectorisées agissent sur tous les pixels sans boucle Python. clip borne les valeurs ; pour uint8 il faut d’abord élargir le type afin de prévenir l’enroulement arithmétique.",
      "Ajoute 30 à une image contenant 250 puis vérifie que la valeur corrigée vaut 255.",
      "Additionner sur uint8 sans conversion peut faire passer 250+30 à 24."
    ],
    [
      "Matplotlib peut juxtaposer plusieurs images et histogrammes. Pour comparer deux résultats, fixer cmap et vmin/vmax à des échelles identiques permet d’éviter des impressions trompeuses.",
      "Affiche original et image corrigée avec vmin=0 et vmax=255 et titre explicite.",
      "Une normalisation automatique différente sur deux figures peut faire paraître identiques des images très différentes."
    ]
  ],
  "opencv-couleurs": [
    [
      "opencv-python expose le module cv2. Une installation headless convient aux serveurs sans interface graphique ; en notebook, Matplotlib est souvent préférable à cv2.imshow.",
      "Vérifie cv2.__version__ et teste l’import sans dépendre d’une fenêtre desktop.",
      "Installer plusieurs variantes incompatibles d’OpenCV dans le même environnement provoque parfois des conflits."
    ],
    [
      "cv2.imread retourne un tableau ou None si le fichier est introuvable. cv2.imwrite exporte ; imshow affiche une fenêtre native nécessitant waitKey et destroyAllWindows.",
      "Teste volontairement un chemin erroné et gère le cas image is None.",
      "Appeler cvtColor sur None provoque une erreur ultérieure qui masque la cause initiale."
    ],
    [
      "OpenCV lit les images couleur en BGR tandis que Matplotlib attend RGB. La conversion cvtColor(...COLOR_BGR2RGB) préserve la correspondance sémantique des canaux ; le gris repose sur une pondération, pas une simple somme.",
      "Crée une bande rouge et une bande bleue et compare les rendus avant/après conversion.",
      "Une inversion BGR/RGB peut rendre incohérents les masques de couleur."
    ],
    [
      "HSV sépare la teinte, la saturation et la valeur. Dans OpenCV uint8, H est en général codé entre 0 et 179 ; les seuils doivent être adaptés aux conditions d’éclairage et à la teinte recherchée.",
      "Convertis une image RGB synthétique en HSV et affiche séparément H, S et V.",
      "Utiliser 360 comme teinte OpenCV uint8 au lieu de l’intervalle attendu produit des filtres inutiles."
    ],
    [
      "JPEG est compressé avec pertes ; PNG conserve précisément les masques et bords ; TIFF est courant en imagerie scientifique et peut stocker davantage de profondeur. Les métadonnées peuvent être importantes.",
      "Enregistre un masque binaire en PNG et vérifie l’unicité de ses valeurs après lecture.",
      "Enregistrer un masque de segmentation en JPEG introduit des valeurs intermédiaires indésirables."
    ],
    [
      "Contrôle shape, dtype, min/max et nombre de canaux dès le chargement. Une image float en 0–1 ne s’interprète pas comme une uint8 en 0–255 ; la conversion doit être explicite.",
      "Écris une fonction de validation refusant les images vides ou aux dimensions inattendues.",
      "Un mélange de plages 0–1 et 0–255 fausse les seuils et métriques."
    ]
  ],
  "contraste-histogrammes": [
    [
      "La dynamique est l’intervalle de valeurs représentées dans l’image. Une scène utilisant seulement 80–120 sur 0–255 apparaît peu contrastée ; élargir la dynamique augmente la séparation visuelle mais peut saturer les extrêmes.",
      "Mesure min et max puis compare la plage avant et après correction.",
      "Une plage plus large n’est pas toujours préférable pour une tâche quantitative."
    ],
    [
      "L’histogramme compte combien de pixels appartiennent à chaque niveau. Un pic près de zéro signifie beaucoup de pixels sombres ; un histogramme ne donne pas leur position spatiale.",
      "Calcule l’histogramme d’une image contenant moitié noir et moitié gris moyen.",
      "Deux images très différentes peuvent avoir exactement le même histogramme."
    ],
    [
      "La transformation affine I'=aI+b change respectivement contraste et luminosité. Les calculs sur uint8 demandent une conversion et un clipping afin d’éviter les débordements.",
      "Applique a=1,5 et b=15 à une image et mesure les pixels saturés.",
      "Modifier l’intensité sans garder le même référentiel rend la comparaison difficile."
    ],
    [
      "La normalisation redistribue une plage vers une autre selon une règle explicite. clip coupe les valeurs hors de la plage autorisée ; la saturation détruit des différences entre pixels.",
      "Normalise des valeurs comprises entre 90 et 140 vers 0–255 puis compare la rampe.",
      "Utiliser min et max calculés sur chaque image peut fausser une comparaison inter-images."
    ],
    [
      "La correction gamma I'=I^γ (avec valeurs normalisées) modifie les niveaux moyens de manière non linéaire. Selon la convention, γ<1 éclaire les tons sombres ; γ>1 assombrit.",
      "Applique gamma 0,5 puis 2 à une rampe 0–1 et compare les courbes.",
      "Utiliser des intensités 0–255 sans les normaliser change complètement la transformation."
    ],
    [
      "L’égalisation répartit globalement l’histogramme ; CLAHE agit localement par blocs avec limitation du contraste. La méthode aide sous éclairage irrégulier, mais peut renforcer le bruit.",
      "Compare equalizeHist et CLAHE sur une image peu contrastée avec bruit.",
      "Un contraste local spectaculaire peut déformer l’apparence des régions homogènes."
    ]
  ],
  "convolution": [
    [
      "Un kernel est une petite matrice de poids appliquée autour de chaque pixel. Sa taille détermine le voisinage ; la somme des poids influence la conservation de la luminosité globale.",
      "Écris un noyau 3×3 uniforme puis vérifie que ses neuf coefficients somment à 1.",
      "Un noyau non normalisé peut rendre toute l’image beaucoup plus lumineuse."
    ],
    [
      "Pour calculer un pixel filtré, multiplie chaque voisin par son coefficient puis additionne. Un exemple numérique 3×3 est une manière directe de comprendre ce qu’OpenCV calcule.",
      "Calcule à la main la sortie du noyau moyenneur quand seul le centre vaut 90.",
      "Une erreur d’alignement du noyau change le pixel auquel on associe le résultat."
    ],
    [
      "La convolution 2D glisse le noyau ; le padding ajoute des valeurs autour des bords pour calculer la sortie. Selon le padding, un même pixel proche du bord peut changer de valeur.",
      "Compare borderType=BORDER_CONSTANT et BORDER_REFLECT sur une image avec bord blanc.",
      "Ignorer la politique aux bords rend des résultats difficiles à comparer."
    ],
    [
      "Le filtre moyenneur réalise une moyenne locale ; le gaussien pondère davantage les pixels proches du centre. Tous deux lissent le bruit et atténuent aussi des détails fins.",
      "Applique blur et GaussianBlur sur une image de lignes fines et compare leur épaisseur.",
      "Une grande fenêtre de lissage peut faire disparaître un défaut industriel réel."
    ],
    [
      "Un noyau de netteté renforce les différences entre le centre et ses voisins. Il améliore parfois la lisibilité mais peut amplifier le bruit et créer des halos.",
      "Applique un noyau de netteté 3×3 à une image bruitée et repère les halos.",
      "Une image plus nette visuellement n’est pas toujours plus fidèle à la référence."
    ],
    [
      "Le filtrage optimise un compromis entre bruit résiduel et détails préservés. Choisir le noyau et sa taille exige une comparaison sur les régions importantes pour la mission.",
      "Trace l’erreur moyenne et l’apparence des bords pour au moins trois tailles de noyau.",
      "Optimiser uniquement l’apparence globale peut éliminer des petits objets critiques."
    ]
  ],
  "bruit-debruitage": [
    [
      "Le bruit provient de capteurs, illumination, compression ou transmission. Le modèle de bruit détermine quel filtre est pertinent ; une image peut mélanger plusieurs sources de dégradation.",
      "Observe une zone uniforme et décris le type de fluctuations visibles.",
      "Supposer un bruit gaussien sans vérifier l’image réelle peut conduire au mauvais filtre."
    ],
    [
      "Le bruit gaussien ajoute des valeurs continues autour de l’intensité originale ; le bruit sel-poivre introduit des pixels extrêmes. Leurs histogrammes et effets visuels diffèrent.",
      "Simule bruit normal et impulsionnel sur la même image de référence.",
      "Un filtre adapté au bruit impulsionnel n’est pas nécessairement optimal pour un bruit gaussien."
    ],
    [
      "Une simulation reproductible fixe un générateur aléatoire et conserve l’image originale pour comparer les résultats. Sans référence, PSNR et MSE ne peuvent pas être interprétés comme des mesures de fidélité absolue.",
      "Fais deux simulations avec la même seed puis vérifie qu’elles sont identiques.",
      "Comparer deux filtres sur deux réalisations différentes du bruit n’est pas rigoureux."
    ],
    [
      "GaussianBlur lisse les petites variations, medianBlur supprime souvent les impulsions et bilateralFilter préserve mieux certains bords. Les paramètres de taille et d’intensité contrôlent le compromis.",
      "Teste médian 3, médian 7 et gaussien 5 sur un trait fin bruité.",
      "Augmenter trop la fenêtre peut effacer précisément le détail à détecter."
    ],
    [
      "La conservation des contours compte plus que la douceur globale si la mission est une mesure de géométrie. Compare le profil d’intensité autour d’un bord avant/après débruitage.",
      "Calcule la largeur apparente d’un bord avant/après filtrage.",
      "Un filtre peut réduire le MSE tout en déplaçant un contour utilisé pour les mesures."
    ],
    [
      "MSE est une erreur quadratique moyenne ; PSNR l’exprime en décibels selon la plage maximale ; SSIM évalue aussi la structure locale. Les trois exigent une référence alignée et une plage maîtrisée.",
      "Calcule MSE pour deux images synthétiques puis déduis leur PSNR pour MAX=255.",
      "Comparer des PSNR avec des plages d’intensité différentes peut rendre les scores incomparables."
    ]
  ],
  "transformations": [
    [
      "Le crop extrait une région d’intérêt définie par ses coordonnées. Les indices sont généralement [y1:y2,x1:x2] ; conserver l’origine de la zone facilite un report ultérieur des positions.",
      "Recadre 20×30 pixels puis reporte une coordonnée locale dans l’image complète.",
      "Oublier l’offset du recadrage décale toutes les détections reportées."
    ],
    [
      "Un resize modifie la grille et éventuellement le rapport d’aspect ; conserver largeur/hauteur proportionnelles évite de déformer les pièces. Le choix de l’interpolation dépend du contenu.",
      "Réduis une image à 50 % sans modifier son ratio puis calcule le nombre de pixels.",
      "Forcer une image 16:9 en 1:1 déforme les distances et les formes."
    ],
    [
      "Nearest prend un voisin, bilinear interpole quatre valeurs et bicubic utilise davantage de voisins. Pour les masques étiquetés, nearest évite de créer de fausses classes intermédiaires.",
      "Redimensionne un masque binaire avec nearest puis bilinear et compare ses valeurs uniques.",
      "Interpoler un masque de classes avec bilinear peut créer des étiquettes non valides."
    ],
    [
      "La translation ajoute un décalage aux coordonnées ; la rotation applique une matrice autour d’un point de pivot. Une opération inverse permet de remonter aux coordonnées originales.",
      "Tourne une image de 30° autour de son centre et observe les régions sorties du cadre.",
      "Une rotation non compensée peut couper les extrémités de l’objet."
    ],
    [
      "Une transformation affine conserve le parallélisme ; une homographie perspective peut redresser un plan photographié en biais. Il faut des points correspondants fiables et vérifier les distorsions.",
      "Redresse un quadrilatère en rectangle à partir de quatre points.",
      "Une homographie sur une surface non plane ne reproduit pas correctement la géométrie 3D."
    ],
    [
      "Un pixel n’est pas une unité physique. La calibration relie des positions d’image à des coordonnées géométriques ou métriques, selon les propriétés de la caméra et la profondeur.",
      "Calcule une longueur en mm avec une échelle validée de 20 pixels/mm.",
      "Une échelle obtenue à une distance donnée n’est pas forcément valable à une autre profondeur."
    ]
  ],
  "contours-gradients": [
    [
      "Le gradient estime comment l’intensité évolue selon x et y. Des dérivées discrètes remplacent les dérivées continues sur la grille numérique.",
      "Compare trois intensités consécutives et estime une différence horizontale.",
      "Le gradient réagit autant aux limites d’objets qu’à certaines fluctuations de bruit."
    ],
    [
      "Les composantes Gx et Gy déterminent norme et orientation du gradient ; l’orientation du contour lui est perpendiculaire. La magnitude indique la force du changement local.",
      "Calcule sqrt(Gx²+Gy²) pour Gx=3, Gy=4 et l’angle associé.",
      "Confondre direction du gradient et direction de la ligne de contour fausse l’orientation estimée."
    ],
    [
      "Sobel applique des noyaux de dérivation avec lissage partiel ; Laplacien combine des dérivées secondes et répond différemment aux changements. Le dtype de sortie doit préserver les valeurs négatives.",
      "Compare Sobel X, Sobel Y et Laplacian sur un rectangle clair.",
      "Calculer directement une dérivée en uint8 peut perdre les réponses négatives."
    ],
    [
      "Canny effectue lissage, calcul des gradients, suppression des non-maxima et hystérésis avec deux seuils. Seuil faible et seuil fort contrôlent la sensibilité et la continuité des contours.",
      "Teste (30,90) et (100,200) sur une même scène et compare faux contours.",
      "Choisir des seuils sur une seule image d’entraînement peut mal généraliser."
    ],
    [
      "Le bruit crée des gradients indésirables ; un lissage avant le gradient réduit les faux contours. Mais le lissage peut aussi masquer des petits défauts, d’où la validation sur plusieurs images.",
      "Compare Canny avant/après GaussianBlur sur une image perturbée.",
      "Un gros filtre peut supprimer les petits contours industriels recherchés."
    ],
    [
      "La transformée de Hough agrège des votes pour des formes paramétrées. HoughLinesP détecte des segments ; HoughCircles détecte des cercles selon des hypothèses géométriques.",
      "Détecte les lignes d’une grille puis dessine les segments retrouvés.",
      "Des structures non rectilignes ou partiellement visibles peuvent ne pas être correctement détectées."
    ]
  ],
  "segmentation": [
    [
      "Un masque binaire indique une classe par pixel selon une convention explicite, souvent 0=fond et 255=objet. Les étiquettes doivent rester cohérentes entre traitements, métriques et sauvegardes.",
      "Crée un masque booléen puis convertis-le en uint8×255 pour OpenCV.",
      "Inverser la classe positive inverse l’interprétation de nombreux KPI."
    ],
    [
      "Un seuil global compare chaque pixel à une intensité unique ; il marche si objet et fond ont des distributions séparées. Le seuil se règle sur des données de validation, pas directement sur le test.",
      "Teste les seuils 80, 120 et 170 sur la même image.",
      "Un seuil choisi pour une scène peut échouer si l’éclairage change."
    ],
    [
      "Otsu choisit automatiquement le seuil qui maximise la séparation statistique entre deux classes de valeurs dans l’histogramme. Il suppose un histogramme suffisamment discriminant.",
      "Compare un seuil fixe et Otsu sur une scène avec deux grandes populations d’intensité.",
      "Otsu ne résout pas les situations où objet et fond se chevauchent fortement."
    ],
    [
      "Un seuil adaptatif calcule des seuils locaux à partir d’un voisinage et aide quand l’illumination varie spatialement. BlockSize doit être impair et supérieur à 1, et C ajuste le niveau local.",
      "Crée un gradient d’éclairage puis compare seuil global et adaptiveThreshold.",
      "Un voisinage trop petit peut renforcer les artefacts du bruit local."
    ],
    [
      "HSV permet de sélectionner une plage de teinte et de saturation indépendamment de certaines variations de luminosité. Les objets rouges peuvent nécessiter deux plages autour de la discontinuité de H.",
      "Construit deux masques HSV pour rouge foncé et rouge clair puis combine-les.",
      "Un seuil HSV fixé en laboratoire peut échouer sous un éclairage d’usine différent."
    ],
    [
      "Les composantes connexes regroupent les pixels positifs adjacents et servent à compter les objets. L’erreur de segmentation se voit quand deux objets fusionnent ou qu’un objet se fragmente.",
      "Compte deux formes séparées puis relie-les par un pixel et compare le résultat.",
      "Le nombre de composantes n’est pas toujours le nombre réel d’objets."
    ]
  ],
  "morphologie": [
    [
      "L’élément structurant est un voisinage souvent carré ou elliptique qui définit quelles positions participent à l’opération morphologique. Sa taille doit être liée à la dimension des détails utiles.",
      "Compare un noyau carré et elliptique de taille 5 sur un masque de forme ronde.",
      "Un kernel trop grand peut effacer entièrement les objets minces."
    ],
    [
      "L’érosion retire des pixels aux frontières, la dilatation en ajoute. Leur effet dépend du noyau et du nombre d’itérations.",
      "Érode une barre de largeur 3 pixels avec un noyau 3×3 puis dilate-la.",
      "La dilatation rapproche des objets séparés et peut les fusionner."
    ],
    [
      "L’ouverture est érosion puis dilatation, utile contre de petits objets isolés ; la fermeture est dilatation puis érosion, utile pour combler de petites ruptures. L’ordre ne commute pas.",
      "Applique ouverture et fermeture sur un masque avec une poussière et un trou.",
      "Utiliser fermeture contre des poussières peut au contraire agrandir les régions parasites."
    ],
    [
      "Le remplissage de trous distingue les régions de fond entièrement entourées par l’objet. Il faut décider si le trou est une erreur de segmentation ou un détail réel de la pièce.",
      "Remplis un trou au centre d’un anneau et compare l’aire avant/après.",
      "Remplir un trou réel dans une pièce peut détruire une caractéristique essentielle."
    ],
    [
      "connectedComponentsWithStats renvoie étiquettes, aire, bounding box et centroïdes de chaque composante. Le label 0 correspond généralement au fond.",
      "Compte les objets hors fond et trie les composantes par surface.",
      "Compter le label 0 comme objet ajoute une détection fantôme."
    ],
    [
      "Aire et périmètre décrivent la région en pixels ; boundingRect donne la boîte englobante et moments le centre. La conversion en mm exige un étalonnage valide.",
      "Compare la surface en pixels de deux pièces de tailles différentes.",
      "Une boîte englobante sur une image inclinée ne mesure pas directement la longueur réelle."
    ]
  ],
  "fourier": [
    [
      "Les variations lentes de luminosité correspondent à des fréquences spatiales faibles ; textures et transitions abruptes contribuent davantage aux hautes fréquences. Les hautes fréquences peuvent représenter aussi bien détails que bruit.",
      "Compare une rampe lisse à un damier en observant leur spectre.",
      "Supprimer toutes les hautes fréquences enlève aussi les vrais contours."
    ],
    [
      "La FFT calcule efficacement la transformée de Fourier discrète, qui représente amplitude et phase des composantes sinusoïdales. La transformée inverse reconstruit l’image à partir de ces informations.",
      "Calcule fft2 puis ifft2 d’une image synthétique et mesure l’erreur de reconstruction.",
      "Ne garder que l’amplitude sans la phase ne reconstitue pas fidèlement la scène."
    ],
    [
      "fftshift place la composante continue au centre. L’amplitude dynamique du spectre étant très large, log1p(abs(F)) permet souvent une visualisation plus lisible.",
      "Compare abs(fft2(image)) et log1p(abs(fftshift(fft2(image)))).",
      "Lire un spectre non centré comme s’il était centré inverse la localisation des fréquences."
    ],
    [
      "Un passe-bas conserve les basses fréquences et lisse ; un passe-haut met en évidence variations rapides et contours. Un masque abrupt peut générer du ringing dans le domaine spatial.",
      "Crée un masque fréquentiel circulaire de rayon 15 et observe l’image reconstruite.",
      "Des coupures fréquentielles trop abruptes peuvent créer des halos."
    ],
    [
      "Un bruit périodique produit souvent des pics localisés et symétriques dans le spectre. On peut concevoir des encoches qui atténuent ces composantes sans effacer le centre.",
      "Ajoute des rayures horizontales périodiques et localise les pics correspondants.",
      "Un notch trop large peut supprimer des textures utiles de l’objet."
    ],
    [
      "La reconstruction inverse nécessite un traitement cohérent du décalage fftshift/ifftshift et la conservation du caractère réel attendu de l’image. Les artefacts proviennent aussi des bordures et des masques trop abrupts.",
      "Reconstruis après filtre en appliquant ifftshift puis ifft2 et compare l’écart.",
      "Afficher abs de la reconstruction sans réfléchir peut masquer des valeurs négatives artificielles."
    ]
  ],
  "video-mouvement": [
    [
      "Une vidéo est une suite de frames avec une cadence FPS et une résolution. Pour un mouvement rapide, la cadence détermine la distance entre positions mesurées successives.",
      "Calcule le nombre de frames d’une vidéo de 10 secondes à 25 FPS.",
      "Confondre index de frame et secondes entraîne des vitesses erronées."
    ],
    [
      "VideoCapture.read() retourne succès et image ; il faut traiter False avant cvtColor. Les flux peuvent être corrompus, incomplets ou absents, et les ressources doivent être libérées.",
      "Écris une boucle qui vérifie ret, puis release même après erreur.",
      "Faire cvtColor(frame) quand ret=False provoque une erreur sur un frame inexistant."
    ],
    [
      "La différence absolue entre deux frames met en évidence les variations ; elle détecte aussi les changements de caméra et d’éclairage. On la binarise souvent après un léger lissage.",
      "Soustrais deux images d’un objet déplacé et affiche les zones positives.",
      "Une caméra qui bouge crée des différences sur presque toute l’image."
    ],
    [
      "MOG2 maintient un modèle probabiliste de fond au fil des frames. History, varThreshold et detectShadows règlent l’adaptation et la sensibilité.",
      "Teste history=10 et history=100 sur une séquence synthétique.",
      "Un objet immobile suffisamment longtemps peut être intégré au fond."
    ],
    [
      "Les masques de mouvement contiennent souvent des pixels isolés ou des trous ; ouverture et fermeture peuvent les nettoyer. Le kernel doit préserver les petites cibles en mouvement.",
      "Supprime de faux points isolés avec une ouverture 3×3 sur une frame.",
      "Un nettoyage excessif peut supprimer un micro-objet d’intérêt."
    ],
    [
      "Une détection de mouvement peut donner une boîte englobante et une position par frame. Suivre un objet dans le temps demande d’associer les détections et de gérer occultations, croisements et faux positifs.",
      "Calcule les centroïdes de deux frames et estime un déplacement en pixels par seconde.",
      "Associer naïvement le plus proche objet peut échouer lorsque deux trajectoires se croisent."
    ]
  ],
  "evaluation": [
    [
      "La ground truth est une annotation de référence, potentiellement imparfaite, produite selon un protocole. L’évaluation exige alignement des dimensions, choix de la classe positive et cohérence entre annotateurs.",
      "Compare deux masques annotés par des opérateurs et note leurs désaccords.",
      "Traiter une annotation approximative comme une vérité absolue peut masquer un problème de référentiel."
    ],
    [
      "MSE mesure la différence quadratique par pixel ; PSNR utilise 10log10(MAX²/MSE). MSE=0 correspond à un PSNR infini ; MAX dépend de la plage réelle de l’image.",
      "Calcule MSE puis PSNR avec MAX=255 pour deux petites matrices uint8.",
      "Utiliser MAX=1 pour des images en 0–255 donne une valeur PSNR incorrecte."
    ],
    [
      "SSIM compare luminance, contraste et structure dans des fenêtres locales. Sa valeur dépend du paramétrage et de l’échelle ; le comparer entre images non alignées est peu significatif.",
      "Compare SSIM d’une image bruitée et d’une image simplement éclaircie à une même référence.",
      "Une bonne SSIM n’implique pas toujours que les petites structures critiques soient préservées."
    ],
    [
      "IoU = |P∩G| / |P∪G| pour un masque prédit P et une référence G. La convention lorsque les deux masques sont vides doit être définie avant de comparer les méthodes.",
      "Compte intersection et union sur deux masques binaires 3×3.",
      "Inclure le fond dans l’intersection lorsque la classe positive est l’objet donne une IoU artificielle."
    ],
    [
      "Dice = 2|P∩G| / (|P|+|G|) est lié à l’IoU pour des masques binaires non vides : Dice = 2 IoU/(1+IoU). Il met l’accent sur le recouvrement des régions positives.",
      "Calcule Dice pour une IoU de 0,5 et vérifie le résultat.",
      "Une moyenne globale peut masquer une très mauvaise performance sur les petites lésions ou pièces."
    ],
    [
      "Un faux positif marque un objet absent ; un faux négatif manque un objet réel. Le bon compromis dépend du coût de l’erreur, très différent entre inspection de défaut et simple comptage.",
      "Sur un tableau TP/FP/FN, calcule précision et rappel et explique le coût métier.",
      "Une précision élevée ne garantit pas que la méthode retrouve la plupart des cibles."
    ],
    [
      "Les paramètres se choisissent sur entraînement/validation ; les images de test doivent rester inédites. La robustesse s’évalue selon éclairages, capteurs, tailles et défauts rares.",
      "Constitue un protocole de séparation train/val/test au niveau des lots d’acquisition.",
      "Mettre des frames presque identiques d’une même vidéo à la fois en train et test surestime la performance."
    ]
  ],
  "pipeline-industrie": [
    [
      "Un cahier des charges associe image d’entrée, objet d’intérêt, résultat attendu, tolérances et délai de traitement. Une référence annotée et des cas d’échec sont nécessaires pour mesurer la réussite.",
      "Rédige les entrées, sorties, critères d’acceptation et limites d’un système de comptage.",
      "Un objectif « détecter correctement » sans métrique chiffrée est impossible à valider."
    ],
    [
      "Une chaîne modulaire sépare lecture, validation, correction, segmentation, mesure et export. Chaque fonction a un contrat d’entrée/sortie explicite, ce qui facilite tests et remplacement d’étapes.",
      "Écris les signatures de six fonctions et précise les dtype/shape attendus.",
      "Une seule fonction de 300 lignes difficile à tester ralentit la maintenance en équipe."
    ],
    [
      "La validation refuse une image None, un dtype inattendu ou un seuil hors de plage avant le traitement. Un message précis aide à distinguer défaut d’entrée et défaut de méthode.",
      "Ajoute des exceptions pour image vide, image couleur inattendue et seuil 300.",
      "Un résultat silencieux sur une entrée invalide peut sembler plausible mais être totalement faux."
    ],
    [
      "Le traitement par lot parcourt plusieurs fichiers, enregistre réussites et échecs et produit un rapport récapitulatif. Le parcours doit être déterministe et ne pas abandonner les autres fichiers après une erreur non critique.",
      "Propose une boucle sur dix images qui journalise les noms impossibles à lire.",
      "Masquer toutes les erreurs de lecture dans un except vide rend le bilan invérifiable."
    ],
    [
      "Des tests unitaires vérifient les règles et les cas limites ; un jeu de référence vérifie les résultats de bout en bout. Les paramètres doivent être figés et versionnés.",
      "Écris des tests pour 0, 1 et 2 objets ainsi que pour image=None.",
      "Tester uniquement sur des images synthétiques faciles ne démontre pas la fiabilité terrain."
    ],
    [
      "Le README explique installation, dépendances, exécution, format d’entrée, métriques, limites et versions. Le tuteur doit pouvoir relancer et contrôler les résultats sans connaître toute l’histoire du projet.",
      "Prépare une structure README avec commande Python, exemple et section erreurs connues.",
      "Une démo qui ne fonctionne que sur ton ordinateur n’est pas un livrable professionnel."
    ]
  ]
};
