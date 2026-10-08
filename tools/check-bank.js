#!/usr/bin/env node
// Vérifie la banque de questions de index.html.
// Usage : node tools/check-bank.js [chemin/vers/index.html]
// Contrôles : 4 réponses, index c valide, explication présente, pas de doublon,
// et biais de longueur (la bonne réponse ne doit pas être trop souvent la plus longue).
"use strict";
const fs = require("fs");
const path = process.argv[2] || require("path").join(__dirname, "..", "index.html");
const html = fs.readFileSync(path, "utf8");
const m = html.match(/var BANK = (\{[\s\S]*?\n\});/);
if (!m) { console.error("BANK introuvable dans " + path); process.exit(1); }
const BANK = Function('"use strict";return (' + m[1] + ");")();
const MAX_BIAS = 0.30;                 // seuil toléré (le hasard pur donne 25 %)

let total = 0, longest = 0, errors = 0;
const seen = new Set();
for (const theme of Object.keys(BANK)) {
  let tl = 0;
  BANK[theme].forEach((q, i) => {
    total++;
    const where = theme + "[" + i + "]";
    if (!Array.isArray(q.a) || q.a.length !== 4) { console.error("✗ " + where + " : il faut 4 réponses"); errors++; }
    if (!(q.c >= 0 && q.c <= 3)) { console.error("✗ " + where + " : index c invalide"); errors++; }
    if (!q.e) { console.error("✗ " + where + " : explication e manquante"); errors++; }
    if (q.d !== undefined && [1, 2, 3].indexOf(q.d) < 0) { console.error("✗ " + where + " : d doit valoir 1, 2 ou 3"); errors++; }
    if (seen.has(q.q)) { console.error("✗ " + where + " : question en double"); errors++; }
    seen.add(q.q);
    if (Array.isArray(q.a) && q.a.length === 4) {
      const L = q.a.map(s => s.length);
      if (L[q.c] === Math.max(...L)) { longest++; tl++; }
    }
  });
  console.log(theme.padEnd(12) + String(BANK[theme].length).padStart(3) + " questions · bonne = plus longue : " + tl);
}
const bias = longest / total;
console.log("\nTotal : " + total + " questions · biais de longueur : " + (bias * 100).toFixed(0) + " % (max " + MAX_BIAS * 100 + " %)");
if (bias > MAX_BIAS) { console.error("✗ Biais de longueur trop élevé : allonger des distracteurs plausibles."); errors++; }
if (errors) { console.error("\n" + errors + " problème(s) détecté(s)."); process.exit(1); }
console.log("✓ Banque valide.");
