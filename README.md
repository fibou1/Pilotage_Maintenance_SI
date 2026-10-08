# CyberCrise CampusCloud — Pilotage de la maintenance du SI

**Master 2 · Infrastructure, Cloud, Sécurité**
*Gouverner · prévenir · superviser · rétablir · apprendre*

## ▶ Jouer en ligne

**👉 [https://fibou1.github.io/Pilotage_Maintenance_SI/](https://fibou1.github.io/Pilotage_Maintenance_SI/)**

Le jeu sert à réviser le cours « Pilotage de la maintenance du SI » à partir du cas fil rouge **CampusCloud**. Il tient dans un seul fichier, `index.html`, et fonctionne sur ordinateur comme sur mobile, sans installation.

---

## 📚 Choix de la matière

Le jeu s'ouvre sur un **menu des matières**. Pour l'instant, une seule est disponible : **Pilotage de la Maintenance du SI**. D'autres viendront.

- Le bouton **« ← Changer de matière »** (ou la touche `Échap`) ramène à ce menu.
- **Lien direct** vers une matière, sans passer par le menu : `https://fibou1.github.io/Pilotage_Maintenance_SI/?matiere=pilotage`

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
- Rejoins le drapeau une fois tous les cristaux validés, **avant la fin du chrono RTO**.

| Élément | Effet | Lien avec le cours |
|---|---|---|
| **Bloc « ! »** (à frapper par-dessous) | Donne le **Pare-feu**, ou le **Bouclier PCA** si tu l'as déjà | — |
| 🔥 **Pare-feu** | Tire des boules de feu (`F` / `X` ou bouton 🔥) qui détruisent **tous** les ennemis. Perdu si tu es touché. | Le pare-feu bloque les menaces |
| 🛡 **Bouclier PCA** | Invulnérable 10 s : les ennemis sont détruits au contact | Le PCA maintient l'activité pendant la crise |
| ⏱ **Chrono RTO** | Temps limite du niveau. Alerte à 30 s, compte à rebours sonore à 10 s. À 0 : −1 vie et +60 s. Le temps restant donne un bonus. | RTO = délai maximal de reprise |
| ● **Octets** (pièces) | +10 pts ; **30 octets = +1 vie** | — |
| **Vague ransomware** (niveau 3) | Le SI est chiffré depuis la gauche : avance ! Chaque **bonne réponse** fait reculer le chiffrement. | Restaurer = repousser l'attaque |
| **Ressort** | Maintiens **SAUT** en rebondissant pour aller très haut | — |

> 🥚 **Des secrets sont cachés** : 3 objets rares (un par niveau) débloquent une fin secrète, des blocs invisibles existent, et un célèbre code de jeu vidéo donne un accès… root. À toi de trouver !

### Pseudo et classement

Avant de jouer, choisis un **pseudo** (2 à 16 caractères). En fin de partie, ton score s'affiche dans le **🏆 classement** (Quiz et Aventure séparés), avec ton rang. Les parties « Rejouer mes erreurs » sont des entraînements : elles ne sont pas classées.

- **Par défaut**, le classement est **local** : il ne contient que les scores joués sur l'appareil.
- **Pour un classement partagé entre tous les joueurs**, suis le guide [Classement en ligne](#-classement-en-ligne-partagé-entre-joueurs) (10 minutes, gratuit).

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
| Boule de feu (avec le pare-feu) | `F`, `X`, `K` ou `Maj` | Bouton 🔥 |
| Pause | `Échap` ou `P` | Bouton « Pause » |
| Son / plein écran | Boutons 🔊 et ⛶ du HUD | Idem |
| Lancer un mode depuis l'accueil | `1` = Quiz · `2` = Aventure | — |

La zone de jeu de l'Aventure occupe **toute la largeur disponible** (bouton ⛶ pour le plein écran). Sur téléphone en portrait, elle est automatiquement **zoomée** pour rester lisible.

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

## 🌐 Classement en ligne (partagé entre joueurs)

### Pourquoi faut-il un service externe ?

GitHub Pages ne fait que **servir des fichiers** : il ne peut pas enregistrer de données envoyées par les joueurs. Pour partager les scores, le jeu doit les envoyer à une **petite base de données en ligne**.

Le jeu est prêt pour **[Supabase](https://supabase.com)** : une base PostgreSQL gratuite qui expose directement une API REST. Il n'y a aucun serveur à coder.

### Étapes (environ 10 minutes)

1. **Créer un compte** sur [supabase.com](https://supabase.com), puis un projet (offre *Free*). Choisis une région proche, par exemple `eu-west`.
2. Ouvrir **SQL Editor**, coller le script ci-dessous et cliquer sur **Run** :

   ```sql
   -- Table des scores
   create table public.scores (
     id         bigint generated always as identity primary key,
     pseudo     text not null check (char_length(pseudo) between 2 and 16),
     mode       text not null check (mode in ('quiz', 'aventure')),
     score      integer not null check (score between 0 and 100000),
     accuracy   integer check (accuracy between 0 and 100),
     levels     integer check (levels between 0 and 3),
     created_at timestamptz not null default now()
   );

   -- Sécurité : tout le monde peut LIRE et AJOUTER, personne ne peut modifier ni supprimer
   alter table public.scores enable row level security;
   create policy "lecture publique" on public.scores for select using (true);
   create policy "ajout public"     on public.scores for insert with check (true);
   ```

3. Ouvrir **Project Settings → API** et copier :
   - la **Project URL** (ex. `https://abcdefgh.supabase.co`) ;
   - la clé **`anon` public**.
4. Dans `index.html`, chercher `var LEADERBOARD` et remplir :

   ```js
   var LEADERBOARD = {
     url: "https://abcdefgh.supabase.co",
     anonKey: "eyJhbGciOi...",   // clé anon public
     table: "scores"
   };
   ```

5. Commiter, pousser, et attendre la mise à jour de GitHub Pages. Le classement affiche alors **« 🌐 Classement en ligne partagé entre tous les joueurs »**.

### À savoir

- ✅ **La clé `anon` peut être publique** : elle est faite pour être utilisée dans le navigateur. Ce sont les règles RLS ci-dessus qui protègent la table (lecture et ajout seulement).
- ⚠️ **Ne mets jamais** la clé `service_role` dans le jeu : elle donne tous les droits sur la base.
- ⚠️ **Limite** : comme pour tout jeu 100 % côté navigateur, un joueur averti peut envoyer un faux score. Les contraintes SQL (score ≤ 100 000, pseudo ≤ 16 caractères) limitent les abus. Pour modérer, supprime les lignes suspectes depuis **Table Editor**.
- 🔁 **Si le service est injoignable**, le jeu bascule automatiquement sur le classement local, sans erreur.

---

## ➕ Ajouter une matière (feuille de route)

### Le principe : une branche pour TRAVAILLER, `main` pour PUBLIER

GitHub Pages publie **une seule branche** (`main`). Une matière qui reste sur sa propre branche ne serait donc **jamais visible** sur le site. On utilise les branches pour préparer chaque matière, puis on les fusionne dans `main` :

```text
main  ──────●────────────●────────────●──────▶  publié sur GitHub Pages
             \          /  \          /
matiere/reseaux ●──●──●     \        /           (préparation, puis pull request)
                     matiere/cyber ●──●
```

1. Créer une branche dédiée : `matiere/<nom>` (ex. `matiere/reseaux`).
2. Y ajouter la matière (étapes ci-dessous) et la tester.
3. Ouvrir une **pull request** vers `main`, puis fusionner : la matière apparaît dans le menu.

### Les étapes dans le code

1. Ajouter une entrée dans `var SUBJECTS` (`index.html`) : `id`, nom, icône, couleur, description.
2. Lui donner sa propre banque de questions (`THEMES` + `BANK`) et ses niveaux (`LEVELS`), au même format que la matière actuelle.
3. Lancer `node tools/check-bank.js` pour vérifier les questions.

> 💡 **Prochaine étape conseillée** : dès la 2ᵉ matière, sortir les données de chaque matière dans un fichier dédié (`matieres/pilotage/questions.js`, `matieres/reseaux/questions.js`…). `index.html` restera léger et chaque matière pourra évoluer sans toucher au moteur du jeu. GitHub Pages sert ces fichiers sans aucune configuration.

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

- **Vanilla JavaScript**, un seul fichier, aucune dépendance JavaScript externe : la sphère 3D du mode Quiz est dessinée en Canvas 2D et les **bruitages sont synthétisés en WebAudio** (aucun fichier son).
- Moteur de plateforme sur `<canvas>` : `requestAnimationFrame`, physique à pas fixe (vitesse identique quel que soit le nombre d'images par seconde), collisions sur une grille de tuiles.
- Respect de `prefers-reduced-motion` : animations et secousses réduites.
- Si une image manque, un dessin de remplacement coloré s'affiche : le jeu ne plante jamais.
- Le pseudo, le record et le classement local sont enregistrés dans le navigateur (`localStorage`). Le classement partagé passe par Supabase s'il est configuré.

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
