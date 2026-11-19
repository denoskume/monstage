/* Executable focused follow-up cells after each module's baseline example.
   Excel and Power BI snippets are executed in their native tools. */
export const dataFocusCode: Record<string,string[]> = {
  "metier-donnees": [
    "# Livrable : une évolution vérifiable\nprint(ventes[['semaine','euros','variation_pct']].to_string(index=False))",
    "# Distinguer variables numériques et temporelles\nprint(ventes.dtypes)\nprint(\"Colonnes numériques :\", ventes.select_dtypes('number').columns.tolist())",
    "# Simuler un export CSV puis le relire\ncsv = ventes.to_csv(index=False)\nprint(\"CSV produit :\\n\", csv)",
    "# Une ligne représente une semaine : vérifier la granularité\nassert ventes['semaine'].is_unique\nprint(\"Grain : une semaine, lignes :\", len(ventes))",
    "# Un KPI défini : revenu total, euros\nprint(\"Revenu total (EUR) :\", ventes['euros'].sum())\nprint(\"Variation finale (%) :\", ventes['variation_pct'].iloc[-1])",
    "# Contrôles de traçabilité avant diffusion\nassert ventes['euros'].notna().all()\nassert (ventes['euros']>=0).all()\nprint(\"Données prêtes à être revues par le tuteur\")"
  ],
  "tableurs": [
    "=ESTNUM(B2)\n=TRIER(A2:B6;2;-1)\n=FILTRE(A2:B6;A2:A6=\"Nantes\")",
    "=SOMME(B2:B6)\n=MOYENNE(B2:B6)\n=NB.SI(B2:B6;\">1000\")",
    "=SOMME.SI.ENS(C2:C100;A2:A100;\"Nantes\";B2:B100;\"Mars\")\n=RECHERCHEX(E2;A2:A100;D2:D100;\"Non trouvé\")",
    "=B2/$B$1\n=SIERREUR(B2/C2;\"Valeur non disponible\")",
    "=SOMME.SI(A2:A100;\"Nantes\";B2:B100)\n=NB.SI(A2:A100;\"Nantes\")",
    "=SI(B2<$F$1;\"Sous objectif\";\"Conforme\")\n=SOMME(B2:B100)-F2"
  ],
  "sql": [
    "# Interroger le schéma et la clé métier\nprint(pd.read_sql_query(\"PRAGMA table_info(commandes)\", db))",
    "# Filtrer, trier et limiter les résultats\nprint(pd.read_sql_query(\"SELECT client,montant FROM commandes WHERE montant >= 100 ORDER BY montant DESC LIMIT 5\", db))",
    "# COUNT(*) compte toutes les lignes ; AVG ignore les NULL\nprint(pd.read_sql_query(\"SELECT COUNT(*) n,SUM(montant) total,AVG(montant) moyenne FROM commandes\", db))",
    "# Regrouper avant de filtrer les groupes\nprint(pd.read_sql_query(\"SELECT client,SUM(montant) total FROM commandes GROUP BY client HAVING total >= 180\", db))",
    "# LEFT JOIN : conserver les commandes sans correspondance\npd.DataFrame({\"client\":[\"A\"],\"ville\":[\"Nantes\"]}).to_sql(\"clients\",db,index=False)\nprint(pd.read_sql_query(\"SELECT c.client,c.montant,u.ville FROM commandes c LEFT JOIN clients u ON c.client=u.client\", db))",
    "# Une CTE et ROW_NUMBER analysent sans perdre chaque ligne\nprint(pd.read_sql_query(\"\"\"\nWITH classement AS (SELECT client,montant,\nROW_NUMBER() OVER(PARTITION BY client ORDER BY montant DESC) rang\nFROM commandes)\nSELECT * FROM classement WHERE rang = 1\n\"\"\",db))"
  ],
  "python": [
    "# Un notebook a des cellules et des sorties vérifiables\nprint(\"Objectif : comparer les ventes des magasins\")\nprint(\"Contrôle :\", moyenne([10,20,30])==20)",
    "# Un dictionnaire associe des magasins à des listes\nmagasins={\"Nantes\":[12,15],\"Paris\":[20,18]}\nprint({ville:sum(v) for ville,v in magasins.items()})",
    "# Condition et boucle : une règle lisible\nfor valeur in [9,13,20]:\n    statut=\"Alerte\" if valeur<10 else \"Conforme\"\n    print(valeur,statut)",
    "# Une fonction renvoie son résultat\ndef variation(actuel,precedent):\n    return None if precedent==0 else (actuel-precedent)/precedent*100\nprint(\"Variation (%)\",variation(120,100))",
    "# Lecture/écriture d'un CSV sans fichier externe\nfrom io import StringIO\nimport pandas as pd\ntable=pd.read_csv(StringIO(\"site,euros\\nNantes,120\\nParis,90\"))\nprint(table.to_csv(index=False))",
    "# Contrôler explicitement les entrées\ndef moyenne_positive(valeurs):\n    if not valeurs: raise ValueError(\"Liste vide\")\n    if any(v<0 for v in valeurs): raise ValueError(\"Valeur négative\")\n    return sum(valeurs)/len(valeurs)\nprint(moyenne_positive([2,4,6]))"
  ],
  "pandas-numpy": [
    "# NumPy : forme, type et calcul vectorisé\nimport numpy as np\na=np.array([1,2,3],dtype=np.float32)\nprint(a.shape,a.dtype,(a*60).tolist())",
    "# DataFrame et Series : exploration rapide\nprint(ventes.head().to_string(index=False))\nprint(type(ventes['euros']).__name__)",
    "# Vérifier les types et les statistiques\nprint(table.info())\nprint(table.describe(numeric_only=True))",
    "# Sélection et création de variable\nchoix=table.loc[table['ville']=='Nantes'].copy()\nchoix.loc[:,'euros_majores']=choix['euros']*1.1\nprint(choix)",
    "# Plusieurs agrégations sur la même dimension\nprint(table.groupby('ville').agg(total=('euros','sum'),moyenne=('euros','mean'),n=('euros','size')))",
    "# Sécuriser une fusion de tables et sauvegarder\nassert magasins['magasin'].is_unique\nprint(table.to_csv(index=False))"
  ],
  "nettoyage": [
    "# Un doublon d'identifiant n'est pas forcément un doublon exact\nprint(\"Doublons complets\",df.duplicated().sum())\nprint(\"Identifiants répétés\",df.duplicated('incident').sum())",
    "# Conserver l'incertitude des durées manquantes\nprint(df['minutes'].isna().mean()*100,\"% de durées manquantes\")\nprint(\"Moyenne renseignée\",df['minutes'].mean())",
    "# Un type datetime doit être contrôlé explicitement\ndates=pd.to_datetime(pd.Series(['19/11/2026','invalide']),format='%d/%m/%Y',errors='coerce')\nprint(dates, \"Invalide :\", dates.isna().sum())",
    "# Harmoniser les catégories avant le regroupement\nsites=pd.Series(['Nantes',' nantes ','NANTES','Lyon'])\nprint(sites.str.strip().str.casefold().value_counts())",
    "# Contrôles de plage métier\nprint(\"Durées négatives :\", (clean['minutes']<0).sum())\nprint(\"Durées > 1 jour :\", (clean['minutes']>1440).sum())",
    "# Tests sur le tableau nettoyé\nassert clean['incident'].is_unique\nassert (clean['minutes'].dropna()>=0).all()\nprint(\"Contrôles réussis\")"
  ],
  "statistiques-eda": [
    "# Comparer centre et dispersion\nprint(\"Moyenne\",np.mean(data))\nprint(\"Médiane\",np.median(data))\nprint(\"Ecart type population\",np.std(data,ddof=0))",
    "# Quartiles et règle de l'écart interquartile\nq1,q3=np.percentile(data,[25,75]);iqr=q3-q1\nprint(\"Bornes IQR\",q1-1.5*iqr,q3+1.5*iqr)",
    "# Une distribution : comparer statistiques sans l'extrême\nprint(\"Avec extrême\",float(data.mean()))\nprint(\"Sans 150\",float(data[data<150].mean()))",
    "# Analyse bivariée : montants et quantités\nx=np.array([1,2,3,4]);y=np.array([2,5,6,8])\nprint(\"Couples (x,y)\",list(zip(x.tolist(),y.tolist())))",
    "# La corrélation indique une association\nx=np.array([1,2,3,4]);y=np.array([2,4,6,8])\nprint(\"Corrélation\",np.corrcoef(x,y)[0,1])",
    "# Décrire la question avant de choisir un test\nhypothese={\"population\":\"commandes\",\"mesure\":\"montant\",\"comparaison\":\"avant/après\"}\nprint(hypothese)"
  ],
  "visualisation": [
    "# Histogramme : distribution de montants\nimport matplotlib.pyplot as plt\nplt.hist(df['ventes'],bins=3,edgecolor='black')\nplt.xlabel('Ventes (k€)');plt.ylabel('Nombre de mois');plt.show()",
    "# Courbe temporelle : conserver l'ordre des mois\nplt.plot(df['mois'],df['ventes'],marker='o')\nplt.xlabel('Mois');plt.ylabel('Ventes (k€)');plt.grid(alpha=.3);plt.show()",
    "# Nuage de points : relation entre deux mesures\nplt.scatter([4,6,7,9],[5,8,6,12])\nplt.xlabel('Dépenses (k€)');plt.ylabel('Revenus (k€)');plt.show()",
    "# Barres pour catégories discrètes\nplt.bar(['Nantes','Paris','Lyon'],[12,18,9])\nplt.ylim(bottom=0);plt.ylabel('CA (k€)');plt.show()",
    "# Légendes et unités : rendre la figure autonome\nax=df.plot(x='mois',y='ventes',marker='o',legend=False)\nax.set(title='Ventes par mois',xlabel='Mois',ylabel='Montant (k€)')\nplt.show()",
    "# Graphique interactif avec Plotly\n# Installer si nécessaire : %pip install plotly\nimport plotly.express as px\nfig=px.line(df,x='mois',y='ventes',markers=True,title='Ventes par mois')\nfig.show()"
  ],
  "powerbi": [
    "// Import dans Power Query : définir les types\n= Table.TransformColumnTypes(Source,{{\"Date\", type date},{\"Montant\", type number}})",
    "// Power Query M : filtrer les lignes non nulles\n= Table.SelectRows(#\"Types modifiés\", each [Montant] <> null)",
    "// Mesure DAX dans un schéma en étoile\nMontant total = SUM(FactVentes[Montant])",
    "// Mesures calculées selon le contexte du filtre\nTaux objectif = DIVIDE([Total Ventes],[Total Objectif],0)\nVentes toutes dates = CALCULATE([Total Ventes],REMOVEFILTERS(DimDate))",
    "// Mesure de suivi dans les interactions de filtres\nVentes sélectionnées = [Total Ventes]",
    "// DAX : documenter le calcul et sa source\nEcart de contrôle = [Total Ventes]-[Total Objectif]"
  ],
  "kpi-decision": [
    "# Décomposer la question en indicateurs\nprint(df[['mois','commandes','panier','revenu']].to_string(index=False))",
    "# Revenu et panier moyen : unités et périmètre\nprint(df.assign(taux_par_commande=df['revenu']/df['commandes']))",
    "# Variation relative et absolue\nancien,nouveau=df['revenu'].iloc[0],df['revenu'].iloc[1]\nprint(\"Absolue\",nouveau-ancien,\"Relative %\",(nouveau/ancien-1)*100)",
    "# Comparaison normalisée par activité\nprint(df[['mois','revenu','commandes']])\nprint(\"Revenu par commande\", (df['revenu']/df['commandes']).tolist())",
    "# Décomposition : revenu = quantité × panier\nprint(\"Quantité\",df['commandes'].tolist())\nprint(\"Panier moyen\",df['panier'].tolist())",
    "# Synthèse factuelle vérifiable\nchangement=100*(df['revenu'].iloc[-1]/df['revenu'].iloc[0]-1)\nprint(f\"Revenu : {changement:.1f} % ; causes à confirmer\")"
  ],
  "industrie-maintenance": [
    "# Trois colonnes minimales d'un journal d'incidents\nprint(incidents.head())\nprint(\"Identifiants des machines :\",incidents['machine'].unique())",
    "# Exemple d'horodatages et fréquence\ndates=pd.date_range('2026-11-01',periods=5,freq='5min')\nprint(dates.to_series().diff())",
    "# Disponibilité sur un poste de huit heures\ntemps_planifie=480\nminutes_arret=incidents['minutes'].sum()\nprint(\"Disponibilité\",round((temps_planifie-minutes_arret)/temps_planifie,3))",
    "# Détecter les durées dépassant un seuil\nprint(incidents.assign(alerte=incidents['minutes']>50))",
    "# Bilan par machine : fréquence et durée\nprint(incidents.groupby('machine').agg(\n    incidents=('minutes','size'),minutes=('minutes','sum')))",
    "# Étiquettes futures : ne pas confondre alerte et panne\nprint(\"Nécessite date de panne et horizon prédictif documentés\")"
  ],
  "simulation-stage": [
    "# Contrôler le brief et les données minimales\nprint(\"Granularité : incident unique ; colonnes\",tickets.columns.tolist())",
    "# Conservation source avant toute modification\nsource=tickets.copy(deep=True)\nprint(\"Source intacte ?\",source.equals(tickets))",
    "# Contrôles après dédoublonnage\nassert net['id'].is_unique\nprint(\"Exclus :\",len(tickets)-len(net))",
    "# KPI par site : documenter la complétude\nprint(rapport)\nprint(\"Durée totale connue\",net['minutes'].sum())",
    "# Tests et conventions pour README\nassert net['minutes'].dropna().ge(0).all()\nprint(\"Tests métier exécutés\")",
    "# Passation : points à partager avec le tuteur\nprint(\"Périmètre : incidents uniques\")\nprint(\"Limite : temps d'arrêt manquants non imputés\")"
  ]
};
