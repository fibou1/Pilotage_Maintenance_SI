# 🛡️ CyberCrise — Jeu de révision

**Master 2 · Infrastructure, Cloud & Sécurité**
*Réviser en jouant : quiz arcade, examen blanc et aventure 2D.*

## ▶ Jouer en ligne

**👉 [https://fibou1.github.io/Pilotage_Maintenance_SI/](https://fibou1.github.io/Pilotage_Maintenance_SI/)**

Le jeu fonctionne sur ordinateur comme sur mobile, sans installation ni compte.

---

## 📚 1. Choisir sa matière

Le jeu s'ouvre sur un **menu des matières**. Matière disponible aujourd'hui :

| Matière | Contenu |
|---|---|
| 🛠️ **Pilotage de la Maintenance du SI** | 7 modules + cas fil rouge CampusCloud · 160 questions · 12 domaines · 3 niveaux d'aventure |

- Le bouton **« ← Changer de matière »** (ou la touche `Échap`) ramène au menu.
- **Lien direct** vers une matière, sans passer par le menu : [`?matiere=pilotage`](https://fibou1.github.io/Pilotage_Maintenance_SI/?matiere=pilotage)

---

## 🎮 2. Les modes de jeu

Avant de jouer, choisis un **pseudo** (2 à 16 caractères) : il apparaît dans le classement.

### ▶ Mode Quiz (arcade)

- **20 questions** tirées au hasard : chaque partie est différente.
- 3 vies, combos jusqu'à ×5, bonus de rapidité.
- **Chrono adapté** : 16 s par question, **30 s pour les calculs et les pièges**.
- Une explication s'affiche après chaque réponse.

### 🎯 Quiz ciblé (entraînement)

Sur l'accueil, **clique sur un ou plusieurs domaines** : le Quiz ne pioche plus que dans ces domaines. C'est idéal pour retravailler un point faible. Ces parties ne comptent pas dans le classement.

### 📝 Examen blanc (nouveau)

Il reproduit le format du **QCM final** du cours : **40 questions en 60 minutes**.

- Les questions sont **réparties sur tous les domaines** (au moins 3 par domaine).
- Il n'y a ni vies ni correction pendant l'épreuve : tu réponds, tu passes à la suivante.
- À la fin, tu obtiens une **note sur 20**, la **réussite par domaine** et la **correction détaillée**.
- Ta meilleure note est mémorisée et affichée sur l'accueil.

### ◆ Mode Aventure (plateforme 2D)

- **3 niveaux** : Datacenter VMware, Cloud Azure et Salle de crise.
- Chaque **cristal de données** déclenche un QCM :
  - bonne réponse : le cristal est validé ;
  - mauvaise réponse : tu perds une vie et tu recules.
- Rejoins le drapeau quand tous les cristaux sont validés, **avant la fin du chrono RTO**.

| Élément | Effet | Lien avec le cours |
|---|---|---|
| **Bloc « ! »** (à frapper par-dessous) | Donne le **Pare-feu**, ou le **Bouclier PCA** si tu l'as déjà | — |
| 🔥 **Pare-feu** | Boules de feu (`F` / `X` ou bouton 🔥) qui détruisent **tous** les ennemis. Perdu si tu es touché. | Le pare-feu bloque les menaces |
| 🛡 **Bouclier PCA** | Invulnérable 10 s | Le PCA maintient l'activité pendant la crise |
| ⏱ **Chrono RTO** | Alerte à 30 s, bips à 10 s. À 0 : −1 vie et +60 s. Le temps restant donne un bonus. | RTO = délai maximal de reprise |
| ● **Octets** | +10 points ; **30 octets = +1 vie** | — |
| **Vague ransomware** (niveau 3) | Le SI est chiffré depuis la gauche. Chaque **bonne réponse** fait reculer le chiffrement. | Restaurer = repousser l'attaque |
| **Ressort** | Maintiens **SAUT** en rebondissant pour aller très haut | — |

> 🥚 **Des secrets sont cachés** : 3 objets rares débloquent une fin secrète, des blocs invisibles existent, et un célèbre code de jeu vidéo donne un accès… root.

### 📊 En fin de partie

- **Réussite par domaine** : les domaines les plus faibles apparaissent en premier, en rouge sous 50 %.
- **Révision des erreurs** : ta réponse, la bonne réponse, l'explication et la **slide du cours à revoir**.
- **« Rejouer mes erreurs »** relance un quiz composé uniquement des questions ratées.
- **🏆 Classement** Quiz et Aventure, séparé par matière (l'examen blanc et les entraînements ne sont pas classés).

---

## ⌨️ 3. Commandes

| Action | Clavier | Mobile |
|---|---|---|
| Choisir la matière | `1`, `2`… | Toucher la carte |
| Lancer un mode (accueil) | `1` Quiz · `2` Aventure · `3` Examen | Boutons |
| Revenir au choix de la matière | `Échap` | « ← Changer de matière » |
| Répondre à un QCM | Clic, ou `1`–`4` / `A`–`D` | Toucher la réponse |
| Question suivante | `Entrée` ou `Espace` | « Continuer » |
| Se déplacer (Aventure) | `←` `→`, `Q` `D` (AZERTY) ou `A` `D` (QWERTY) | ◀ ▶ |
| Sauter (appui long = plus haut) | `↑`, `Z`, `W` ou `Espace` | ▲ |
| Boule de feu (avec le pare-feu) | `F`, `X`, `K` ou `Maj` | 🔥 |
| Pause (Aventure) | `Échap` ou `P` | « Pause » |
| Son / plein écran | 🔊 et ⛶ dans le bandeau du haut | Idem |

---

## 🗂️ 4. Organisation du projet

```text
index.html                     structure des écrans (HTML seul)
css/style.css                  styles communs
js/
  config.js                    ⚙️ RÉGLAGES : classement en ligne, longueur des parties
  core.js                      outils, stockage, états, menu des matières, accueil
  fx.js                        effets visuels (sphère 3D, particules)
  sfx.js                       bruitages synthétisés (WebAudio)
  quiz.js                      Quiz, Quiz ciblé, Examen blanc
  adventure.js                 moteur de plateforme 2D
  results.js                   bilan, réussite par domaine, classement, partage
  main.js                      boutons, clavier, démarrage
matieres/
  pilotage/
    matiere.js                 📚 DONNÉES de la matière : domaines, 160 QCM, 3 niveaux
    cours/                     supports PDF (cours + cas CampusCloud)
assets/                        sprites Kenney utilisés par le jeu (+ licence CC0)
tools/check-bank.js            vérification automatique des matières
docs/                          analyse du jeu et propositions ; docs/archive : anciennes versions des questions
archive/                       première version du jeu (référence)
sources/                       pack Kenney d'origine (sources des sprites)
.github/workflows/verifier.yml vérifications automatiques à chaque push / pull request
```

**Le principe : un moteur commun, une matière = un dossier.** Le moteur (`js/`) ne contient aucune question. Chaque matière apporte ses propres données dans `matieres/<id>/matiere.js`.

Il n'y a **pas d'étape de build** : des scripts JavaScript classiques, chargés dans l'ordre par `index.html`. Le jeu fonctionne sur GitHub Pages **et** en ouvrant simplement `index.html` sur son ordinateur.

---

## ➕ 5. Ajouter une matière

### Le principe : une branche pour TRAVAILLER, `main` pour PUBLIER

GitHub Pages publie **une seule branche** (`main`). On prépare donc chaque matière sur sa propre branche, puis on la fusionne :

```text
main  ──────●────────────●────────────●──────▶  publié sur GitHub Pages
             \          /  \          /
matiere/reseaux ●──●──●     \        /           (préparation, puis pull request)
                     matiere/cyber ●──●
```

### Les étapes

1. Créer une branche : `git checkout -b matiere/reseaux`
2. Copier le dossier `matieres/pilotage/` en `matieres/reseaux/`.
3. Dans `matieres/reseaux/matiere.js`, remplacer :
   - la **fiche** en bas du fichier : `id: "reseaux"` (minuscules, sans espace), nom, icône, couleur, description ;
   - les **domaines** (`THEMES`) et les **questions** (`BANK`) ;
   - les **niveaux** (`LEVELS`). Avec `LEVELS = []`, le mode Aventure est simplement masqué pour cette matière.
4. Ajouter **une ligne** dans `index.html`, sous celle de la matière existante :

   ```html
   <script src="matieres/reseaux/matiere.js"></script>
   ```

5. Vérifier : `node tools/check-bank.js reseaux`
6. Ouvrir une **pull request** vers `main`. Les vérifications automatiques tournent, puis tu fusionnes : la matière apparaît dans le menu.

Les records, la meilleure note et le classement sont **séparés par matière**, sans rien configurer.

---

## ✍️ 6. Ajouter ou modifier une question

Dans `matieres/<id>/matiere.js`, ajouter un objet dans le domaine voulu :

```js
{q:"Énoncé de la question ?",
 a:["Réponse A","Réponse B","Réponse C","Réponse D"],
 c:2,                         // index de la bonne réponse (0 à 3)
 d:2,                         // difficulté : 1, 2 ou 3 (3 = chrono de 30 s)
 ref:"Cours slide 20",        // affiché dans la révision des erreurs
 e:"Explication courte et pédagogique."}
```

Puis vérifier avec `node tools/check-bank.js`. Le script contrôle le format, les doublons, les niveaux et le **biais de longueur**. Si la bonne réponse est trop souvent la plus longue (au-delà de 30 %), on peut la deviner sans réviser.

> 💡 **Conseil de rédaction** : les mauvaises réponses doivent être des erreurs **plausibles**, celles que fait vraiment un étudiant (confondre SLA et SLO, RTO et RPO, P2 et P3…). Une réponse absurde ne fait rien apprendre.

---

## 🌐 7. Classement en ligne (partagé entre joueurs)

### Pourquoi faut-il un service externe ?

GitHub Pages ne fait que **servir des fichiers** : il ne peut pas enregistrer les scores des joueurs. Le jeu est prêt pour **[Supabase](https://supabase.com)**, une base de données gratuite avec une API REST. Il n'y a aucun serveur à coder.

Sans configuration, le classement reste **local à l'appareil**. Si le service est injoignable, le jeu y revient automatiquement.

### Étapes (environ 10 minutes)

1. Créer un compte sur [supabase.com](https://supabase.com), puis un projet (offre *Free*, région `eu-west` par exemple).
2. Dans **SQL Editor**, coller ce script puis cliquer sur **Run** :

   ```sql
   create table public.scores (
     id         bigint generated always as identity primary key,
     pseudo     text not null check (char_length(pseudo) between 2 and 16),
     matiere    text not null default 'pilotage' check (char_length(matiere) between 1 and 40),
     mode       text not null check (mode in ('quiz', 'aventure')),
     score      integer not null check (score between 0 and 100000),
     accuracy   integer check (accuracy between 0 and 100),
     levels     integer check (levels between 0 and 10),
     created_at timestamptz not null default now()
   );

   -- Sécurité : tout le monde peut LIRE et AJOUTER, personne ne peut modifier ni supprimer
   alter table public.scores enable row level security;
   create policy "lecture publique" on public.scores for select using (true);
   create policy "ajout public"     on public.scores for insert with check (true);
   ```

   > Si tu avais déjà créé la table avec une version précédente du README (sans colonne `matiere`), exécute seulement :
   > `alter table public.scores add column matiere text not null default 'pilotage';`

3. Dans **Project Settings → API**, copier la **Project URL** et la clé **`anon` public**.
4. Les coller dans **`js/config.js`** :

   ```js
   var LEADERBOARD = {
     url: "https://abcdefgh.supabase.co",
     anonKey: "eyJhbGciOi...",
     table: "scores"
   };
   ```

5. Commiter et fusionner dans `main`. Le classement affiche alors **« 🌐 Classement en ligne partagé entre tous les joueurs »**.

### À savoir

- ✅ La clé `anon` **peut être publique** : ce sont les règles RLS ci-dessus qui protègent la table.
- ⚠️ Ne mets **jamais** la clé `service_role` dans le jeu : elle donne tous les droits sur la base.
- ⚠️ Comme pour tout jeu qui tourne dans le navigateur, un joueur averti peut envoyer un faux score. Les contraintes SQL limitent les abus ; tu peux supprimer une ligne suspecte depuis **Table Editor**.

---

## 🛠️ 8. Technique et qualité

- **Vanilla JavaScript**, sans framework ni dépendance JavaScript externe. La sphère 3D est dessinée en Canvas 2D et les sons sont synthétisés en WebAudio.
- Moteur de plateforme : `requestAnimationFrame`, physique à pas fixe (même vitesse quel que soit le nombre d'images par seconde), collisions sur une grille de tuiles.
- Respect de `prefers-reduced-motion`. Si une image manque, un dessin de remplacement s'affiche : le jeu ne plante pas.
- Pseudo, records, meilleure note et classement local sont stockés dans le navigateur (`localStorage`), **par matière**.

### Vérifications

| Commande | Ce qu'elle vérifie |
|---|---|
| `node tools/check-bank.js` | Questions, domaines et niveaux de toutes les matières |
| `for f in js/*.js matieres/*/matiere.js; do node --check "$f"; done` | Syntaxe JavaScript |

Ces vérifications tournent aussi **automatiquement sur GitHub** à chaque push et pull request (onglet *Actions*).

### Tester en local

Ouvre `index.html` dans ton navigateur, ou lance un petit serveur :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ajoute `?debug` à l'adresse pour afficher les zones de collision de l'Aventure.

### Versions

L'historique des versions est dans [`CHANGELOG.md`](CHANGELOG.md). Chaque version publiée porte un **tag git** (`v2.0.0`…).

---

## 🙏 Crédits

- **Sprites** : [Kenney — Pixel Platformer](https://kenney.nl/assets/pixel-platformer), licence **CC0** (domaine public).
- **Polices** : Chakra Petch, IBM Plex Sans et IBM Plex Mono (Google Fonts).
- **Contenu pédagogique** : cours « Pilotage de la maintenance du SI » et cas CampusCloud — Ynov, Master 2.
