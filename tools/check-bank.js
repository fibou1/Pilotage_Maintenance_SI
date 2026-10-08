#!/usr/bin/env node
// Vérifie les données de toutes les matières : matieres/<id>/matiere.js
// Usage : node tools/check-bank.js            (toutes les matières)
//         node tools/check-bank.js pilotage   (une seule matière)
// Contrôles par question : 4 réponses, index c valide, explication présente, difficulté 1-3,
// pas de doublon, biais de longueur (la bonne réponse ne doit pas être trop souvent la plus longue).
// Contrôles par matière : fiche complète, domaines cohérents avec la banque, niveaux valides.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const MAX_BIAS = 0.30;                 // seuil toléré (le hasard pur donne 25 %)
const only = process.argv[2];

// Charge chaque fichier matière dans un bac à sable qui simule « window »
const dir = path.join(ROOT, "matieres");
const files = fs.readdirSync(dir).map(d => path.join(dir, d, "matiere.js")).filter(f => fs.existsSync(f));
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
const subjects = (sandbox.window.CYBERCRISE_MATIERES || []).filter(s => !only || s.id === only);
if (!subjects.length) { console.error("✗ Aucune matière trouvée" + (only ? " pour « " + only + " »" : "")); process.exit(1); }

let errors = 0;
const ids = new Set();
function fail(msg) { console.error("  ✗ " + msg); errors++; }

for (const s of subjects) {
  console.log("\n▶ Matière « " + s.id + " » — " + s.name);
  if (ids.has(s.id)) fail("identifiant de matière en double : " + s.id);
  ids.add(s.id);
  for (const k of ["id", "name", "color", "themes", "bank"]) if (!s[k]) fail("champ « " + k + " » manquant dans la fiche");
  if (s.id && !/^[a-z0-9-]+$/.test(s.id)) fail("id « " + s.id + " » : minuscules, chiffres et tirets uniquement (il sert dans l'URL)");

  // domaines ↔ banque
  const themeIds = new Set((s.themes || []).map(t => t.id));
  for (const t of s.themes || []) if (!Array.isArray(s.bank[t.id]) || !s.bank[t.id].length) fail("domaine « " + t.id + " » sans questions");
  for (const k of Object.keys(s.bank || {})) if (!themeIds.has(k)) fail("banque « " + k + " » sans domaine déclaré dans themes");

  // questions
  let total = 0, longest = 0;
  const seen = new Set();
  for (const theme of Object.keys(s.bank || {})) {
    let tl = 0;
    s.bank[theme].forEach((q, i) => {
      total++;
      const where = theme + "[" + i + "]";
      if (!q.q) fail(where + " : énoncé q manquant");
      if (!Array.isArray(q.a) || q.a.length !== 4) fail(where + " : il faut 4 réponses");
      if (!(q.c >= 0 && q.c <= 3)) fail(where + " : index c invalide");
      if (!q.e) fail(where + " : explication e manquante");
      if (q.d !== undefined && [1, 2, 3].indexOf(q.d) < 0) fail(where + " : d doit valoir 1, 2 ou 3");
      if (Array.isArray(q.a) && new Set(q.a).size !== q.a.length) fail(where + " : deux réponses identiques");
      if (seen.has(q.q)) fail(where + " : question en double");
      seen.add(q.q);
      if (Array.isArray(q.a) && q.a.length === 4) {
        const L = q.a.map(x => x.length);
        if (L[q.c] === Math.max(...L)) { longest++; tl++; }
      }
    });
    console.log("  " + theme.padEnd(12) + String(s.bank[theme].length).padStart(3) + " questions · bonne = plus longue : " + tl);
  }
  const bias = total ? longest / total : 0;
  console.log("  Total : " + total + " questions · biais de longueur : " + (bias * 100).toFixed(0) + " % (max " + MAX_BIAS * 100 + " %)");
  if (bias > MAX_BIAS) fail("biais de longueur trop élevé : allonger des distracteurs plausibles");

  // niveaux de l'aventure (facultatifs)
  (s.levels || []).forEach((L, i) => {
    const where = "niveau " + (i + 1) + " (" + (L.name || "?") + ")";
    if (!Array.isArray(L.map) || !L.map.length) { fail(where + " : carte manquante"); return; }
    const w = L.map[0].length, txt = L.map.join("");
    if (L.map.some(r => r.length !== w)) fail(where + " : toutes les lignes doivent avoir la même longueur");
    if ((txt.match(/P/g) || []).length !== 1) fail(where + " : il faut exactement un départ P");
    if ((txt.match(/X/g) || []).length !== 1) fail(where + " : il faut exactement une sortie X");
    if (!(txt.match(/C/g) || []).length) fail(where + " : aucun cristal C");
    if (/[^.#=^PXCEZBHo?uKtgmwk]/.test(txt)) fail(where + " : caractère inconnu dans la carte");
    (L.themes || []).forEach(t => { if (!themeIds.has(t)) fail(where + " : domaine « " + t + " » inconnu"); });
    if (!(L.themes || []).length) fail(where + " : aucun domaine pour les QCM des cristaux");
  });
  if ((s.levels || []).length) console.log("  Aventure : " + s.levels.length + " niveau(x) vérifié(s)");
}

if (errors) { console.error("\n✗ " + errors + " problème(s) détecté(s)."); process.exit(1); }
console.log("\n✓ Données valides (" + subjects.length + " matière" + (subjects.length > 1 ? "s" : "") + ").");
