#!/usr/bin/env node
// Met à jour le numéro de version ajouté aux fichiers CSS/JS dans index.html
// (« anti-cache » : css/style.css?v=2.1.1). À lancer à CHAQUE mise à jour publiée,
// sinon un navigateur peut garder d'anciens fichiers en cache et mélanger deux versions.
// Usage : node tools/set-version.js 2.2.0
"use strict";
const fs = require("fs");
const path = require("path");
const v = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(v || "")) { console.error("Usage : node tools/set-version.js X.Y.Z"); process.exit(1); }
const file = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(file, "utf8"), n = 0;
// tous les fichiers locaux .css / .js référencés par src= ou href=
html = html.replace(/((?:src|href)=")((?!https?:|data:|\/\/)[^"?#]+\.(?:css|js))(\?v=[^"]*)?"/g, (m, a, f) => { n++; return a + f + "?v=" + v + '"'; });
html = html.replace(/(<meta name="version" content=")[^"]*(")/, "$1" + v + "$2");
fs.writeFileSync(file, html);
console.log("✓ " + n + " fichier(s) CSS/JS passés en version " + v + " dans index.html");
