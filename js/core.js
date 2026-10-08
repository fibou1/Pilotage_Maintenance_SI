// ======================================================================
// CŒUR DU JEU — outils, stockage, machine à états, matières, écran d'accueil
// Ordre de chargement (index.html) : config → matières → core → fx → sfx
//                                    → quiz → adventure → results → main
// Tous les fichiers partagent la portée globale (scripts classiques, sans build),
// ce qui fonctionne aussi bien sur GitHub Pages qu'en ouvrant index.html en local.
// ======================================================================
"use strict";

var prefersReduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var DEBUG = /[?&]debug\b/.test(location.search);

// ======================================================================
// 1. OUTILS
// ======================================================================
function $(id){ return document.getElementById(id); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function setTheme(c){ document.documentElement.style.setProperty("--theme",c);
  document.documentElement.style.setProperty("--theme-dim", shade(c,-60)); }
function shade(hex,amt){ var n=parseInt(hex.slice(1),16),r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
  return "#"+(1<<24|r<<16|g<<8|b).toString(16).slice(1); }
function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.remove("show"); },2600); }
function shakeBody(){ if(prefersReduced) return; document.body.classList.remove("shake"); void document.body.offsetWidth; document.body.classList.add("shake"); }
function fmtNote(n){ return (Math.round(n*10)/10).toLocaleString("fr-FR"); }          // 14.5 → « 14,5 »
function fmtTime(ms){ var s=Math.max(0,Math.ceil(ms/1000)), m=Math.floor(s/60); return m+":"+("0"+(s%60)).slice(-2); }

// ---------- stockage local (toujours protégé : navigation privée, quota…) ----------
var Store = {
  get:function(k, def){ try{ var v=localStorage.getItem(k); return v===null ? def : v; }catch(e){ return def; } },
  set:function(k, v){ try{ localStorage.setItem(k, String(v)); }catch(e){} }
};
// Record de points et meilleure note d'examen : propres à chaque matière.
// (la matière « pilotage » reprend l'ancien record, enregistré avant la gestion multi-matières)
function getBestFor(id){
  var v=Store.get("cybercrise_best_"+id, null);
  if(v===null && id==="pilotage") v=Store.get("cybercrise_best_v1", "0");
  return parseInt(v||"0",10)||0;
}
function getBestNoteFor(id){ var v=parseFloat(Store.get("cybercrise_exam_"+id, "")); return isNaN(v) ? null : v; }
function getBest(){ return getBestFor(subject.id); }
function setBest(v){ Store.set("cybercrise_best_"+subject.id, v); }
function getBestNote(){ return getBestNoteFor(subject.id); }
function setBestNote(v){ Store.set("cybercrise_exam_"+subject.id, v); }

// Animation du score (HUD)
function animScore(elId, to){
  var el=$(elId), from=parseInt(el.textContent.replace(/\D/g,""),10)||0, t0=null;
  if(prefersReduced){ el.textContent=to.toLocaleString("fr-FR"); return; }
  function f(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/400); el.textContent=Math.round(from+(to-from)*p).toLocaleString("fr-FR"); if(p<1)requestAnimationFrame(f); }
  requestAnimationFrame(f);
}
function floatPoints(x,y,txt,col){
  var f=document.createElement("div"); f.className="float"; f.textContent=txt; f.style.color=col||"var(--ok)";
  f.style.left=x+"px"; f.style.top=y+"px"; document.body.appendChild(f);
  setTimeout(function(){ f.remove(); },1000);
}
function renderLives(boxId, lives, max){
  var box=$(boxId); box.innerHTML="";
  for(var i=0;i<max;i++){ var d=document.createElement("div"); d.className="life"+(i>=lives?" lost":""); box.appendChild(d); }
}

// QCM partagé Quiz / Examen / Aventure : dessine 4 boutons mélangés, renvoie l'ordre
var LETTERS=["A","B","C","D"];
function paintAnswers(box, q, onPick){
  box.innerHTML="";
  var order=shuffle([0,1,2,3]);
  order.forEach(function(orig,pos){
    var b=document.createElement("button"); b.className="ans"; b.type="button";
    var k=document.createElement("span"); k.className="k"; k.textContent=LETTERS[pos];
    var t=document.createElement("span"); t.textContent=q.a[orig];
    b.appendChild(k); b.appendChild(t);
    b.addEventListener("click", function(){ onPick(orig===q.c, b); });
    box.appendChild(b);
  });
  return order;
}
function revealAnswers(box, q, order){
  var btns=box.children;
  for(var i=0;i<btns.length;i++){ btns[i].disabled=true;
    if(order[i]===q.c) btns[i].classList.add("correct"); else btns[i].classList.add("dim"); }
}
function rankFor(acc){
  if(acc>=.95) return "Directeur de crise";
  if(acc>=.85) return "Responsable maintenance";
  if(acc>=.70) return "Incident Manager";
  if(acc>=.50) return "Analyste N2";
  return "Technicien N1 — rejoue pour progresser";
}

// ======================================================================
// 2. MATIÈRES — chaque fichier matieres/<id>/matiere.js s'enregistre dans
//    window.CYBERCRISE_MATIERES. La matière choisie fournit THEMES, BANK et LEVELS.
// ======================================================================
var SUBJECTS = (window.CYBERCRISE_MATIERES || []).filter(function(s){ return s && s.id && s.themes && s.bank; });
var subject = SUBJECTS[0] || {id:"vide", name:"Aucune matière", color:"#b06bff", icon:"📚", desc:"", tags:[], themes:[], bank:{}, levels:[]};
var THEMES = [], BANK = {}, LEVELS = [];
function themeById(id){ for(var i=0;i<THEMES.length;i++) if(THEMES[i].id===id) return THEMES[i]; return THEMES[0]; }
function countQuestions(s){ var n=0; s.themes.forEach(function(t){ n+=(s.bank[t.id]||[]).length; }); return n; }
function applySubject(s){
  subject=s; THEMES=s.themes; BANK=s.bank; LEVELS=s.levels||[];
  selectedThemes={};
}

// ======================================================================
// 3. MACHINE À ÉTATS  MATIÈRE → ACCUEIL → QUIZ | AVENTURE → RÉSULTAT
//    (l'examen blanc utilise l'écran du Quiz, avec run.exam = true)
// ======================================================================
var STATE = { SUBJECT:"SUBJECT", TITLE:"TITLE", QUIZ:"QUIZ", ADVENTURE:"ADVENTURE", RESULT:"RESULT" };
var SCREEN_OF = { SUBJECT:"scrSubject", TITLE:"scrTitle", QUIZ:"scrGame", ADVENTURE:"scrAdv", RESULT:"scrResults" };
var state = STATE.SUBJECT;

// Bilan de la partie en cours (partagé par tous les modes)
var run = { mode:STATE.QUIZ, score:0, combo:0, bestCombo:0, asked:0, correct:0, lives:3, maxLives:3, levelsDone:0, levelsTotal:0,
            won:false, missed:[], byTheme:{}, exam:false, practice:false, targeted:false };
function newRun(mode){
  run.mode=mode; run.score=0; run.combo=0; run.bestCombo=0; run.asked=0; run.correct=0; run.missed=[]; run.byTheme={};
  run.coins=0; run.keys=0; run.secret=false;
  run.exam=false;          // examen blanc : 40 questions, 60 min, correction à la fin
  run.practice=false;      // « rejouer mes erreurs » : entraînement, hors classement
  run.targeted=false;      // quiz limité à certains domaines : entraînement, hors classement
  run.startedAt=Date.now();
  run.maxLives = mode===STATE.ADVENTURE ? 5 : 3; run.lives=run.maxLives; run.levelsDone=0; run.won=false;
  run.levelsTotal = mode===STATE.ADVENTURE ? LEVELS.length : 0;
}
// Comptabilise une réponse (réussite par domaine, affichée dans le bilan)
function recordAnswer(theme, ok){
  var b=run.byTheme[theme.id] || (run.byTheme[theme.id]={theme:theme, n:0, ok:0});
  b.n++; if(ok) b.ok++;
}
// Mémorise une erreur pour l'écran « Révision des erreurs » (given = réponse choisie, null = sans réponse)
function recordMiss(theme, q, given){
  for(var i=0;i<run.missed.length;i++) if(run.missed[i].q===q){ run.missed[i].given=given; return; }
  run.missed.push({theme:theme, q:q, given:given});
}

function go(next){
  // --- sortie de l'état courant ---
  if(state===STATE.QUIZ) stopQuizTimers();
  if(state===STATE.ADVENTURE && next!==STATE.ADVENTURE) Adv.stop();
  state=next;
  // --- entrée dans le nouvel état ---
  Object.keys(SCREEN_OF).forEach(function(k){ $(SCREEN_OF[k]).classList.toggle("active", k===next); });
  document.body.setAttribute("data-state", next);
  document.body.classList.toggle("exam", next===STATE.QUIZ && run.exam);
  window.scrollTo(0,0);
  if(next===STATE.TITLE){ setTheme(subject.color); refreshBestLine(); refreshTitleBoard(); }
  if(next===STATE.SUBJECT){ setTheme("#b06bff"); renderSubjectMenu(); var f=document.querySelector(".subject-card:not(.soon)"); if(f) f.focus({preventScroll:true}); }
}

// ======================================================================
// 4. ÉCRAN « CHOIX DE LA MATIÈRE »
// ======================================================================
var SUBJECT_KEY="cybercrise_subject_v1";
function chooseSubject(s){
  applySubject(s); Store.set(SUBJECT_KEY, s.id);
  renderTitle();
  go(STATE.TITLE);
}
function el(tag, cls, txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!==undefined) e.textContent=txt; return e; }
function renderSubjectMenu(){
  var grid=$("subjectGrid"); grid.innerHTML="";
  SUBJECTS.forEach(function(s, i){
    var b=el("button","subject-card"); b.type="button"; b.setAttribute("role","listitem");
    b.style.setProperty("--sc", s.color);
    var top=el("span","sc-top");
    top.appendChild(el("span","sc-ico", s.icon||"📚"));
    top.appendChild(el("span","sc-badge", "Disponible"));
    b.appendChild(top);
    b.appendChild(el("span","sc-name", s.name));
    b.appendChild(el("span","sc-desc", s.desc||""));
    var tags=el("span","sc-tags");
    (s.tags||[]).concat([countQuestions(s)+" questions", s.themes.length+" domaines"]).forEach(function(t){ tags.appendChild(el("span","chip",t)); });
    b.appendChild(tags);
    // progression du joueur sur cette matière
    var best=getBestFor(s.id), note=getBestNoteFor(s.id), prog=el("span","sc-progress");
    [[best>0 ? best.toLocaleString("fr-FR")+" pts" : "—", "Record"], [note!==null ? fmtNote(note)+" / 20" : "—", "Meilleure note"]].forEach(function(p){
      var c=el("span","scp"); c.appendChild(el("b","",p[0])); c.appendChild(el("span","",p[1])); prog.appendChild(c); });
    b.appendChild(prog);
    var cta=el("span","sc-cta","Réviser cette matière "); cta.appendChild(el("span","arrow","→")); b.appendChild(cta);
    if(i===0) b.appendChild(el("kbd","sc-kbd","1"));
    b.addEventListener("click", function(){ chooseSubject(s); });
    grid.appendChild(b);
  });
  // emplacement visuel pour les prochaines matières
  var soon=el("div","subject-card soon"); soon.setAttribute("role","listitem"); soon.setAttribute("aria-disabled","true");
  soon.appendChild(el("span","sc-ico","🔒"));
  soon.appendChild(el("span","sc-name","Bientôt"));
  soon.appendChild(el("span","sc-desc","D'autres matières du Master arrivent prochainement."));
  grid.appendChild(soon);
}

// ======================================================================
// 5. ACCUEIL DE LA MATIÈRE (pseudo, modes, domaines à cibler, classement)
// ======================================================================
var selectedThemes={};                 // domaines cochés pour un quiz ciblé (vide = tous)
function selectedThemeIds(){ return THEMES.filter(function(t){ return selectedThemes[t.id]; }).map(function(t){ return t.id; }); }
function renderTitle(){
  $("subjectEyebrow").textContent="Matière"+((subject.tags||[]).length ? " · "+subject.tags.join(" · ") : "");
  $("subjectIcon").textContent=subject.icon||"📚";
  $("subjectName").textContent=subject.name;
  $("subjectDesc").textContent=subject.desc||"";
  document.title="CyberCrise — "+subject.name;
  document.documentElement.style.setProperty("--subject", subject.color||"#b06bff");
  var row=$("themesRow"); row.innerHTML="";
  THEMES.forEach(function(t){
    var b=el("button","trow-item"); b.type="button"; b.setAttribute("aria-pressed","false");
    b.style.setProperty("--tc", t.color);
    b.appendChild(el("span","tn", t.name)); b.appendChild(el("span","tc", String(BANK[t.id].length)));
    b.addEventListener("click", function(){
      selectedThemes[t.id]=!selectedThemes[t.id];
      b.classList.toggle("on", !!selectedThemes[t.id]); b.setAttribute("aria-pressed", selectedThemes[t.id]?"true":"false");
      refreshTargetLine();
    });
    row.appendChild(b);
  });
  var nQ=countQuestions(subject);
  $("qCountChip").textContent = nQ;
  $("themesChip").textContent = THEMES.length;
  $("advBtn").style.display = LEVELS.length ? "" : "none";            // une matière sans niveaux n'a pas d'aventure
  $("advLvlPill").textContent = LEVELS.length+" niveau"+(LEVELS.length>1?"x":"");
  $("quizLenPill").textContent = Math.min(GAME.quizLength, nQ)+" questions";
  $("examLenPill").textContent = Math.min(GAME.examLength, nQ)+" questions";
  $("examTimePill").textContent = GAME.examMinutes+" min";
  $("quizSmall").textContent = "Questions au hasard, 3 vies et des combos. "+GAME.quizTime+" s par question, "+GAME.quizTimeHard+" s pour les calculs.";
  $("examSmall").textContent = "Le format du QCM final : toutes les notions, sans correction avant la fin. Tu obtiens une note sur 20.";
  refreshTargetLine();
}
function refreshTargetLine(){
  var ids=selectedThemeIds(), line=$("targetLine");
  if(!ids.length){
    line.textContent="Sélectionne un ou plusieurs domaines pour t'entraîner uniquement dessus (partie non classée).";
    $("clearTargetBtn").style.display="none"; $("targetQuizBtn").style.display="none"; return;
  }
  var n=0; ids.forEach(function(id){ n+=BANK[id].length; });
  line.textContent=ids.length+" domaine"+(ids.length>1?"s":"")+" sélectionné"+(ids.length>1?"s":"")+" · "+n+" questions disponibles.";
  $("clearTargetBtn").style.display=""; $("targetQuizBtn").style.display="";
  $("targetQuizBtn").textContent="⚡ Lancer le quiz ciblé ("+Math.min(GAME.quizLength, n)+" questions)";
}
function clearTargets(){
  selectedThemes={};
  Array.prototype.forEach.call(document.querySelectorAll("#themesRow .trow-item"), function(b){ b.classList.remove("on"); b.setAttribute("aria-pressed","false"); });
  refreshTargetLine();
}
function refreshBestLine(){
  var b=getBest(), nb=getBestNote();
  $("statRecord").textContent = b>0 ? b.toLocaleString("fr-FR") : "—";
  $("statNote").textContent = nb!==null ? fmtNote(nb)+"/20" : "—";
}
