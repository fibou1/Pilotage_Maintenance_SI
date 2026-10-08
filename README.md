# CyberCrise CampusCloud — Pilotage de la maintenance du SI

**Master 2 · Infrastructure, Cloud, Sécurité**
*Gouverner · prévenir · superviser · rétablir · apprendre*

## ▶ Jouer en ligne

**👉 [https://fibou1.github.io/Pilotage_Maintenance_SI/](https://fibou1.github.io/Pilotage_Maintenance_SI/)**

Le jeu sert à réviser le cours « Pilotage de la maintenance du SI » à partir du cas fil rouge **CampusCloud**. Il tient dans un seul fichier, `index.html`, et fonctionne sur ordinateur comme sur mobile, sans installation.

---

## 🎮 Les modes de jeu

### Mode Quiz (arcade)

- **20 questions** tirées au hasard dans une banque de **160 QCM** : chaque partie est différente.
- Les questions sont regroupées par domaine. Le jeu propose 3 vies, des combos (jusqu'à ×5) et un bonus de rapidité.
- **Chrono adapté** : 16 s par question, et **30 s pour les calculs et les questions pièges**.
- Une explication s'affiche après chaque réponse, juste ou fausse.

### Mode Aventure (plateforme 2D)

- **3 niveaux** : Datacenter VMware, Cloud Azure et Salle de crise.
- Ramasse les **cristaux de données** : chacun déclenche un QCM.
  - Bonne réponse : le cristal est validé et tu gagnes des points.
  - Mauvaise réponse : tu perds une vie et tu recules.
- Évite les piques et les ennemis à pointes, et saute sur les ennemis bleus.
- Rejoins le drapeau une fois tous les cristaux validés.

### En fin de partie : la révision des erreurs

L'écran de résultat liste **chaque question ratée** avec :

- ta réponse et la bonne réponse ;
- l'explication ;
- la **slide du cours à revoir**.

Le bouton **« Rejouer mes erreurs »** relance un quiz composé uniquement de ces questions.

---

## ⌨️ Commandes

| Action | Clavier | Mobile |
|---|---|---|
| Répondre à un QCM | Clic, ou touches `1`–`4` / `A`–`D` | Toucher la réponse |
| Question suivante | `Entrée` ou `Espace` | Bouton « Continuer » |
| Se déplacer (Aventure) | `←` `→`, `Q` `D` (AZERTY) ou `A` `D` (QWERTY) | Boutons ◀ ▶ |
| Sauter (appui long = saut plus haut) | `↑`, `Z`, `W` ou `Espace` | Bouton ▲ |
| Pause | `Échap` ou `P` | Bouton « Pause » |
| Lancer un mode depuis l'accueil | `1` = Quiz · `2` = Aventure | — |

Sur téléphone en portrait, la zone de jeu de l'Aventure est automatiquement **zoomée** pour rester lisible.

---

## 📚 Contenu pédagogique

**12 domaines**, dans l'ordre des 7 modules du cours, puis le cas fil rouge :

| Domaine | Module du cours |
|---|---|
| Gouvernance & planification | 1 – 2 |
| Maintenance du SI | 1 – 2 |
| Disponibilité & SLA | 3 |
| Supervision & dépendances | 3 |
| Gestion d'incident | 4 |
| Changement & CAB | 5 |
| NIST CSF & exercices de crise | 5 et 7 |
| Documentation & CMDB | 6 |
| BIA · RTO / RPO | 7 |
| PCA vs PRA | 7 |
| Sauvegardes | 7 |
| Cas CampusCloud & roadmap | Cas fil rouge |

Chaque question précise sa **difficulté** (1 facile, 2 moyen, 3 piège ou calcul) et renvoie à la **slide** correspondante.

---

## ✍️ Ajouter ou modifier une question

1. Ouvrir `index.html` et chercher `var BANK = {`.
2. Ajouter un objet dans le domaine voulu :

   ```js
   {q:"Énoncé de la question ?",
    a:["Réponse A","Réponse B","Réponse C","Réponse D"],
    c:2,                         // index de la bonne réponse (0 à 3)
    d:2,                         // difficulté : 1, 2 ou 3 (3 = chrono de 30 s)
    ref:"Cours slide 20",        // affiché dans la révision des erreurs
    e:"Explication courte et pédagogique."}
   ```

3. Vérifier la banque :

   ```bash
   node tools/check-bank.js
   ```

   Le script contrôle le format, les doublons et le **biais de longueur**. La bonne réponse ne doit pas être trop souvent la plus longue (30 % maximum), sinon on peut deviner sans réviser.

> 💡 **Conseil de rédaction** : les mauvaises réponses doivent être des erreurs plausibles, que fait vraiment un étudiant (confondre SLA et SLO, RTO et RPO, P2 et P3, correctif et curatif…). Une réponse absurde ne fait rien apprendre.

---

## 🗂️ Structure du dépôt

```text
index.html                    le jeu complet (HTML + CSS + JS, sans framework)
assets/                       sprites Kenney utilisés par le mode Aventure (+ licence CC0)
tools/check-bank.js           vérification automatique de la banque de questions
docs/ANALYSE_ET_PROPOSITIONS.md   analyse du jeu et feuille de route
docs/questions-proposees.js   les 60 questions ajoutées (archive, déjà intégrées)
kenney_pixel-platformer/      pack Kenney d'origine (sources des sprites)
```

---

## 🛠️ Technique

- **Vanilla JavaScript**, un seul fichier, aucune dépendance JavaScript externe : la sphère 3D du mode Quiz est dessinée en Canvas 2D.
- Moteur de plateforme sur `<canvas>` : `requestAnimationFrame`, physique à pas fixe (vitesse identique quel que soit le nombre d'images par seconde), collisions sur une grille de tuiles.
- Respect de `prefers-reduced-motion` : animations et secousses réduites.
- Si une image manque, un dessin de remplacement coloré s'affiche : le jeu ne plante jamais.
- Le record est enregistré dans le navigateur (`localStorage`).

### Tester en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

### Déploiement

Le site est publié par **GitHub Pages** depuis la branche `main` (dossier racine).

---

## 🙏 Crédits

- **Sprites** : [Kenney — Pixel Platformer](https://kenney.nl/assets/pixel-platformer), licence **CC0** (domaine public).
- **Polices** : Chakra Petch, IBM Plex Sans et IBM Plex Mono (Google Fonts).
- **Contenu pédagogique** : cours « Pilotage de la maintenance du SI » et cas CampusCloud — Ynov, Master 2.
