# CyberCrise CampusCloud — Analyse complète et propositions d'amélioration

> **Objet** : bilan du jeu de révision « Pilotage de la maintenance du SI » (version en ligne sur GitHub Pages), confronté au cours, au cas fil rouge et aux assets Kenney fournis.
> **Livrables associés** : ce document + `docs/questions-proposees.js` (60 nouvelles questions prêtes à fusionner).

---

## 1. Résumé en 30 secondes

| Constat | Niveau | Ce qu'il faut retenir |
|---|---|---|
| Le moteur de jeu est **solide** | ✅ | Machine à états propre, physique à pas fixe, coyote time, préchargement des images avec placeholders, `prefers-reduced-motion` respecté. |
| La banque de **100 questions** est correcte sur le fond | ✅ | Explications pédagogiques claires, calculs justes, bon ancrage dans le cas CampusCloud. |
| **Biais majeur** : la bonne réponse est la plus longue dans **78 %** des cas | 🔴 | Un étudiant qui « joue la plus longue » obtient environ 78 % sans réviser. C'est le défaut n° 1 à corriger. |
| La couverture du cours est **déséquilibrée** | 🟠 | PRA/PCA/sauvegardes ≈ 36 % des questions ; NIST CSF = 0 ; documentation et CMDB ≈ 2 ; cas (maturité, RACI, roadmap) ≈ 3. |
| Le mode Aventure est **jouable mais générique** | 🟠 | Les 3 niveaux se terminent, mais la mécanique ne « raconte » pas le cours (un cristal = un QCM, rien de plus). |
| Mobile portrait : la zone de jeu est **petite** | 🟠 | Canvas de 346 × 195 px sur un écran de 390 × 844 : deux tiers de l'écran sont vides. |
| Dépôt public : **PDF du cours** et dossier Kenney complet | 🟡 | Question de droits d'auteur (support de l'enseignante, avec son e-mail) et poids inutile (1,2 Mo d'assets non utilisés). |

---

## 2. Ce qui a été analysé

- **Cours** « Pilotage de la maintenance du SI » (63 slides, 7 modules + glossaire).
- **Cas fil rouge** « Campus Cloud » (18 étapes + 6 ateliers).
- **`index.html`** (1 415 lignes) : banque de questions, moteur Quiz, moteur Aventure, assets.
- **Pack Kenney Pixel Platformer** : feuilles `tilemap_packed.png` (180 tuiles) et `tilemap-characters_packed.png` (27 personnages) — chaque indice a été vérifié visuellement.
- **Test réel dans Chromium** (bureau 1100 × 760 et mobile 390 × 844) : écran titre, quiz, 3 niveaux, déclenchement d'un cristal → QCM. Aucune erreur JavaScript.
- **Analyse automatique** de la banque (longueur des réponses, doublons) et des niveaux (hauteur et portée de saut).

---

## 3. Comprendre le cours et le cas (la base de tout le reste)

### 3.1 Le cours : une chaîne de décision en 7 modules

Chaque module produit un **artefact** réutilisé par le suivant. C'est l'idée clé à faire ressentir dans le jeu.

| Module | Verbe | Artefact produit | Notions évaluables |
|---|---|---|---|
| 1. Gouvernance | Décider | Décision argumentée | Types de maintenance, cycle de vie, ITIL 4 (gouverner / créer la valeur / pratiquer) |
| 2. Planification | Prioriser | Inventaire + matrice | Inventaire (quoi, où, qui, dépendances), criticité (4 quadrants), déclencheurs temps / usage / signal |
| 3. Supervision | Observer | KPI | Expérience → service → composants, disponibilité, MTBF, MTTR, SLA/SLO/SLI, alerte actionnable, outils |
| 4. Incidents | Rétablir | Fiche incident | P1–P4 (impact × urgence), flux, 3 escalades, cellule de crise, RETEX |
| 5. Changements | Autoriser | RFC | Standard / normal / urgence, CAB, rollback, **NIST CSF 2.0 (6 fonctions, 7 étapes)** |
| 6. Documentation | Capitaliser | Connaissance | Trouvable / exécutable / maintenue, CMDB, boucle base de connaissances, audit en 4 critères |
| 7. PRA / PCA | Résister | Plan de reprise | PCA ≠ PRA, BIA, RTO / RPO / MTD, exercices (cadrer, animer, évaluer) |

**Évaluation finale (slide 51)** : QCM de **40 questions en 60 minutes**, couvrant les 7 modules, avec cinq types de questions : compréhension, lecture de scénario, **calcul**, preuves / risques / dépendances, articulation entre modules.

> 💡 Le jeu doit donc entraîner à ce format précis : c'est l'argument principal pour un futur mode « Examen blanc ».

### 3.2 Le cas CampusCloud : 4 actes et 8 livrables

1. **Diagnostiquer** : architecture (Moodle, ERP, AD, Azure…, notées I/P/C/E), maturité de 1 à 5, registre des risques.
2. **Exploiter** : inventaire, plan annuel, panne Moodle, RACI, KPI (dispo ≥ 99,5 % / 7 j, MTTR ≤ 2 h, MTBF ≥ 14 j, SLA ≥ 95 %), RFC et CAB.
3. **Résister** : ransomware (T+0 → T+120), PRA / PCA.
4. **Transformer** : roadmap 12 mois (Sécuriser → Stabiliser → Industrialiser → Optimiser), soutenance.

---

## 4. Analyse du jeu actuel

### 4.1 Points forts (à conserver)

- **Architecture claire** : états `TITLE / QUIZ / ADVENTURE / RESULT`, fonction `go()` unique, sections commentées.
- **Physique de qualité** : pas fixe de 1/120 s, accumulateur de delta-time, coyote time, mémoire du saut, saut à hauteur variable, réapparition sur la dernière position sûre.
- **Assets robustes** : objet `ASSETS`, préchargement avec délai maximal de 6 s, placeholders dessinés si une image manque.
- **Accessibilité** : `prefers-reduced-motion`, contrôle au clavier (flèches, ZQSD, WASD, touches 1–4 / A–D), pause automatique si l'onglet perd le focus.
- **Pédagogie** : chaque réponse affiche une explication, y compris en cas d'erreur.

### 4.2 Problèmes constatés

| # | Problème | Preuve | Impact |
|---|---|---|---|
| 1 | **Biais de longueur** des réponses | 78 / 100 bonnes réponses sont les plus longues (supervision : 12 / 13, BIA : 11 / 12) | Le jeu récompense une heuristique, pas la connaissance |
| 2 | **Distracteurs trop absurdes** | « La liste des invités du pot de fin d'année », « Pour décorer la salle serveur », « Hier, aujourd'hui et demain » | Questions trop faciles, éloignées du niveau de l'examen |
| 3 | **Quasi-doublons ransomware** | 5 questions sur le même scénario, réparties entre `incident` et `backup` (chronologie T+15 / T+120, intégrité, preuves) | Répétition dans une même partie |
| 4 | **Une explication inexacte** | Supervision : « Portail étudiant → IAM/SSO, LMS → paiement ». La slide 4 liste ces services sans flèches de dépendance | Risque d'apprendre une information absente du cours |
| 5 | **Minuteur unique de 16 s** | Calcul du MTBF (720 − 8) ÷ 4 en 16 s | Pénalise les questions de calcul, pourtant au programme |
| 6 | **Pas de bilan des erreurs** | L'écran de résultat montre le score, pas les questions ratées | On perd le moment le plus utile pour apprendre |
| 7 | **Rangs orientés cybersécurité** | « Analyste SOC », « RSSI » | Le cours porte sur le pilotage de la maintenance |
| 8 | **Mobile portrait** | Capture : canvas de 346 × 195 px, deux tiers de l'écran vides | Jeu peu confortable sur téléphone |
| 9 | **Niveaux plats et faciles** | Saut max ≈ 3,6 tuiles ; tous les écarts font au plus 4 tuiles ; 3 à 5 lignes de ciel vides en haut de chaque niveau | Pas de progression de difficulté |
| 10 | **Three.js pour une seule sphère** | 670 Ko (167 Ko compressé) ; la console affiche « three.min.js is deprecated » | Lourd, dépend d'un CDN, version figée en fin de vie |
| 11 | **Contrôles tactiles** | Pas de bouton « Pause » dans la zone du pouce ; pas de vibration au contact | Confort mobile limité |

### 4.3 Couverture du cours par la banque actuelle

| Module | Questions actuelles (≈) | Poids à l'examen | Verdict |
|---|---|---|---|
| 1. Gouvernance | 9 | 1/7 ≈ 14 % | Correct |
| 2. Planification | 3 | 14 % | 🔴 Sous-représenté |
| 3. Supervision (dispo + KPI) | 26 | 14 % | 🟠 Sur-représenté |
| 4. Incidents | 13 | 14 % | Correct |
| 5. Changements + NIST CSF | 12 (dont 0 NIST) | 14 % | 🔴 NIST CSF absent |
| 6. Documentation & CMDB | 2 | 14 % | 🔴 Quasi absent |
| 7. PRA / PCA / sauvegardes | 36 | 14 % | 🟠 Très sur-représenté |
| Cas : maturité, RACI, roadmap | 3 | (ateliers) | 🔴 Quasi absent |

---

## 5. Questions proposées (fichier `docs/questions-proposees.js`)

### 5.1 Contenu

- **48 questions dans 4 nouveaux thèmes** qui comblent les trous :
  - `gouv` — Gouvernance & planification (cycle de vie, ITIL 4, appétence au risque, risque résiduel, 4 quadrants, temps / usage / signal, risque différé) ;
  - `doc` — Documentation & CMDB (runbook, chaîne de CI, boucle de connaissance, audit en 4 critères) ;
  - `cyber` — NIST CSF 2.0 & exercices de crise (6 fonctions, 7 étapes, confinement, escalade de communication, débriefings à chaud et à froid) ;
  - `cas` — Cas CampusCloud & roadmap (maturité, registre des risques, score VMware, AD vs Moodle, RACI, roadmap, KPI SLA, soutenance).
- **12 renforts** pour les thèmes existants, surtout des **calculs** (99,95 %, disponibilité sur 7 jours, MTBF ÷ (MTBF + MTTR)) et des **scénarios pièges** (P2 vs P3, correctif vs curatif, gel).

### 5.2 Règles de qualité appliquées

- ✅ Bonne réponse la plus longue dans **18 % des cas** (contre 78 % aujourd'hui ; le hasard donne 25 %).
- ✅ Chaque question contient une explication `e`, une difficulté `d` (1 facile, 2 moyen, 3 piège / calcul) et une référence `ref` vers la slide.
- ✅ Tous les calculs ont été vérifiés (ex. 37 ÷ 40 = 92,5 % ; 167 ÷ 168 ≈ 99,40 %).
- ✅ Fusion testée dans le navigateur : 160 questions, 12 thèmes, aucune erreur.

### 5.3 Comment les intégrer

1. Copier le contenu du fichier juste après `var BANK = {…};` dans `index.html`.
2. Décommenter les 3 lignes de la section « FUSION ».
3. Ajouter les nouveaux thèmes aux niveaux de l'aventure (ex. `themes:["maint","dispo","gouv"]`), sinon ils ne sortiront qu'en mode Quiz.
4. Optionnel : afficher `ref` sous l'explication (« 📖 Cours slide 20 »).

### 5.4 Corrections recommandées sur les 100 questions existantes

- **Rééquilibrer les longueurs** : allonger un distracteur plausible plutôt que raccourcir la bonne réponse.
- **Remplacer les distracteurs absurdes** par des erreurs typiques d'étudiant (confusions SLA / SLO, RTO / RPO, P2 / P3, correctif / curatif, fonctionnelle / hiérarchique).
- **Fusionner les doublons ransomware** : en garder 2 et utiliser les places libérées pour la documentation.
- **Corriger l'explication** « Portail étudiant → IAM/SSO, LMS → paiement » : parler simplement de services dépendant de l'identité (AD / Azure AD), ce qui est cohérent avec le cas.

---

## 6. Idées d'amélioration, par priorité

### P0 — Corrections rapides (moins d'une journée)

1. **Biais de longueur** : appliquer les règles du § 5.4, puis ajouter un test automatique (script Node qui échoue si plus de 35 % des bonnes réponses sont les plus longues).
2. **Écran « Révision des erreurs »** en fin de partie : liste des questions ratées, avec la bonne réponse, l'explication et la slide. *C'est le gain pédagogique le plus fort pour le moins de code.*
3. **Minuteur adaptatif** : 16 s par défaut, 30 s si `d === 3` (calcul ou piège), et option « sans chrono ».
4. **Rangs alignés sur le cours** : Technicien N1 → Analyste N2 → Incident Manager → Responsable maintenance → Directeur de crise.
5. **Vies en cœurs Kenney** (tuiles 44 / 45 / 46 : plein, moitié, vide) au lieu de carrés.

### P1 — Modes pédagogiques (le cœur de la valeur)

6. **Mode « Examen blanc »** : 40 questions, chrono global de 60 min, pas de correction avant la fin, tirage équilibré (≈ 6 par module), puis note sur 20 et **radar de réussite par module**. Il reproduit exactement l'évaluation finale.
7. **Entraînement ciblé** : choisir un ou plusieurs thèmes depuis l'écran titre (les puces de thèmes deviennent cliquables).
8. **Répétition espacée** (méthode Leitner) : mémoriser dans `localStorage` les questions ratées et les retirer plus souvent. Une question réussie trois fois de suite sort du tirage prioritaire.
9. **Nouveaux formats de questions** correspondant aux types d'examen :
   - **saisie numérique** pour les calculs (MTBF, disponibilité, score 2×I+P+C−E), avec une tolérance ;
   - **remettre dans l'ordre** (flux incident, BIA → preuves, RETEX, roadmap) ;
   - **associer** (SLA / SLO / SLI ; Nagios / Zabbix / Centreon / Grafana).
10. **Mode « Cellule de crise »** (scénario enchaîné) : le scénario SSO 08:20 → inscriptions 08:35 → changement réseau de la veille. Chaque choix modifie la suite (retour arrière, contournement ou investigation) et produit une **main courante** horodatée à la fin. C'est l'atelier du module 4 transformé en jeu.

### P2 — Aventure 2D : faire « vivre » les concepts

L'idée directrice : **chaque niveau = un module, et chaque mécanique de jeu = un concept du cours**.

| Niveau | Concept enseigné | Mécanique proposée | Assets Kenney (indices) |
|---|---|---|---|
| 1. Gouvernance | Types de maintenance | Blocs fissurés à réparer (préventif) avant qu'ils ne cassent sous le joueur | Caisses 6 / 26 |
| 2. Planification | Criticité, budget | Budget limité de « jetons » : choisir quels ponts réparer (4 sur 10) | Pièces 151, ponts 48–50 |
| 3. Supervision | Signal → décision | Niveau sombre : poser des « sondes » qui éclairent les dangers | Panneaux 85–88 |
| 4. Incidents | Priorité P1–P4 | Ennemis marqués P1 à P4 ; traiter d'abord les P1 rapporte plus | Personnages 18–26 |
| 5. Changements | RFC, rollback | **Leviers** = retour arrière : un mauvais choix modifie les plateformes, le levier les restaure | Leviers 64–66 |
| 6. Documentation | Runbook, CMDB | Panneaux-indices lisibles = runbooks ; une **clé** (IAM) ouvre les portes des services qui en dépendent | Clé 27, verrous 28 / 10, portes 130 / 150 |
| 7. PRA / PCA | **RPO / RTO** | **Checkpoints = points de sauvegarde** : à la mort, on revient au dernier point (perte = RPO). Chrono de sortie = RTO | Drapeaux 111 / 112 |
| Boss | Ransomware | Boule à pointes (perso 8) qui chiffre les plateformes ; la vaincre = répondre à la chronologie T+0 → T+120 | Perso 8, blocs 11 / 12 |

Autres idées pour l'aventure :

- **Blocs « ? » à la Mario** (tuile 9) : frappés par-dessous, ils posent une question bonus sans perte de vie, avec des points seulement.
- **Cœur à ramasser** (tuile 44) : +1 vie, placé après les passages difficiles.
- **Arrière-plan parallax** avec `tilemap-backgrounds_packed.png` (déjà dans le pack, pas encore copié dans `assets/`).
- **Niveaux plus verticaux** : utiliser les lignes de ciel vides, ajouter des échelles (tuile 51) et des ressorts (`H`, déjà codé mais jamais placé).
- **Sons synthétisés** (WebAudio, aucun fichier à charger) avec un bouton muet.
- **Manette** (Gamepad API) : quelques lignes suffisent.

### P3 — Technique et dépôt

- **Remplacer Three.js** par une sphère filaire dessinée en Canvas 2D (environ 60 lignes) : −670 Ko, plus de dépendance au CDN, jeu 100 % hors ligne.
- **Mobile** : en portrait, agrandir la vue logique (ex. 384 × 300) ou afficher « Tourne ton téléphone » ; ajouter un bouton plein écran.
- **PWA** : un `manifest.json` et un service worker qui met en cache le jeu, les polices et les sprites pour réviser sans réseau.
- **Records séparés** Quiz / Aventure / Examen, et statistiques par module.
- **Dépôt** :
  - demander l'accord de l'enseignante avant de publier les PDF du cours (droits d'auteur et e-mail personnel), ou les retirer du dépôt public ;
  - supprimer `kenney_pixel-platformer/` (1,2 Mo) : seuls `assets/*.png` et la licence sont utiles ;
  - déplacer `CyberCrise_CampusCloud.html` (ancienne version à 44 questions) dans `archive/` ;
  - compléter le `README.md` (comment jouer, ajouter une question, crédits Kenney CC0).

---

## 7. Feuille de route conseillée

| Étape | Contenu | Résultat attendu |
|---|---|---|
| **Sprint 1** | P0 (biais, révision des erreurs, minuteur, rangs, cœurs) + fusion des 60 questions | Banque de 160 questions fiable, apprentissage par l'erreur |
| **Sprint 2** | Mode Examen blanc + entraînement ciblé + statistiques par module | Préparation directe au QCM final |
| **Sprint 3** | Formats saisie numérique / remettre dans l'ordre + répétition espacée | Entraînement aux calculs, mémorisation durable |
| **Sprint 4** | Aventure : checkpoints RPO, leviers rollback, clé IAM, boss ransomware | Le jeu « raconte » le cours |
| **Sprint 5** | Mode Cellule de crise, PWA, nettoyage du dépôt | Produit fini, utilisable hors ligne |

---

## 8. Prompt prêt à l'emploi pour la prochaine itération (Sprint 1)

```text
Contexte : jeu de révision index.html (un seul fichier, GitHub Pages) — voir
docs/ANALYSE_ET_PROPOSITIONS.md pour l'analyse complète.

Sprint 1, garde un seul fichier autonome et le fallback hors ligne :
1. Fusionne docs/questions-proposees.js dans BANK/THEMES (160 questions,
   12 thèmes) ; ajoute gouv/doc/cyber/cas aux thèmes des 3 niveaux Aventure.
2. Corrige le biais de longueur des 100 questions existantes : la bonne
   réponse ne doit pas être la plus longue dans plus de 30 % des cas
   (allonge des distracteurs PLAUSIBLES, remplace les distracteurs absurdes).
   Fusionne les doublons ransomware ; corrige l'explication
   « Portail étudiant → IAM/SSO, LMS → paiement ».
3. Ajoute un écran « Révision des erreurs » après RESULT (question, bonne
   réponse, explication, champ ref si présent).
4. Minuteur Quiz : 16 s par défaut, 30 s si d === 3.
5. Rangs : Technicien N1 → Analyste N2 → Incident Manager → Responsable
   maintenance → Directeur de crise.
6. Vies en cœurs Kenney (tuiles 44/45/46 de tilemap_packed.png).
Ajoute un petit script Node (tools/check-bank.js) qui vérifie : 4 réponses,
c ∈ [0,3], e non vide, pas de doublon, biais de longueur ≤ 30 %.
Commente le code et ne casse rien de l'existant.
```
