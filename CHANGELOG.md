# Historique des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les versions publiées portent un tag git.

## [2.0.0] — 2026-10-08

Réorganisation complète du projet pour accueillir plusieurs matières, et nouveaux modes de révision.

### Ajouté
- **Menu de choix de la matière** au lancement, avec un lien direct `?matiere=<id>`.
- **📝 Examen blanc** : 40 questions en 60 minutes, réparties sur tous les domaines, sans correction pendant l'épreuve, note sur 20 et meilleure note mémorisée.
- **🎯 Quiz ciblé** : clic sur les domaines de l'accueil pour ne réviser qu'eux (entraînement non classé).
- **📊 Réussite par domaine** dans le bilan de fin de partie, les points faibles en premier.
- Vérifications automatiques sur GitHub (`.github/workflows/verifier.yml`) : syntaxe, données des matières, fichiers référencés.
- `CHANGELOG.md` et fichier `.nojekyll` (publication GitHub Pages plus rapide et sans traitement Jekyll).

### Modifié
- **Nouvelle organisation** : `index.html` (structure), `css/`, `js/` (moteur commun découpé par rôle), `matieres/<id>/` (données de chaque matière).
- `js/config.js` regroupe les réglages : classement en ligne, longueur des parties, durée de l'examen.
- Records, meilleure note et classement **séparés par matière**. L'ancien record est repris automatiquement.
- Classement en ligne : nouvelle colonne `matiere` (voir README pour la migration SQL).
- `tools/check-bank.js` vérifie toutes les matières, y compris leurs niveaux d'aventure.
- Fichiers rangés : supports de cours dans `matieres/pilotage/cours/`, pack Kenney dans `sources/`, première version du jeu dans `archive/`.

## Versions précédentes (sans tag)

- **Aventure enrichie** — zone de jeu agrandie, pare-feu et boules de feu, bouclier PCA, chrono RTO, vague ransomware, octets, secrets, sons, pseudo et classement.
- **Corrections pédagogiques** — 160 questions sur 12 domaines, biais de longueur des réponses ramené de 78 % à 15 %, révision des erreurs, chrono adapté, sphère 3D sans Three.js, vue mobile.
- **Version initiale** — quiz arcade (100 questions) et mode Aventure à 3 niveaux.
