# Historique des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les versions publiées portent un tag git.

## [2.1.0] — 2026-10-08

Refonte de l'interface des menus.

### Modifié
- **Choix de la matière** : en-tête de marque, cartes de matière plus riches avec ta progression (record, meilleure note) et rappel des trois façons de jouer.
- **Accueil de la matière** : barre de navigation, en-tête avec chiffres clés et carte « pseudo » (avatar qui s'allume quand le pseudo est valide), trois tuiles de mode homogènes (description lisible, durée, raccourci clavier).
- **Quiz ciblé** : panneau dédié avec puces colorées et compteurs, bouton « Lancer le quiz ciblé ». Le ciblage et le classement s'affichent côte à côte.
- **Résultats** : carte de bilan compacte (score, rang, statistiques, actions), réussite par domaine et classement côte à côte, puis correction détaillée.
- Textes secondaires plus contrastés, mise en page mobile revue (aucun débordement horizontal).

### Corrigé
- Le dégradé du fond se répétait en bande sur les pages longues.

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
