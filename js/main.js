// ======================================================================
// CÂBLAGE — boutons, clavier, tactile, easter eggs et démarrage du jeu
// (dernier fichier chargé : tous les modules sont prêts)
// ======================================================================
"use strict";

// ---------- pseudo obligatoire avant de jouer ----------
var pseudoInput=$("pseudo"); pseudoInput.value=getPseudo();
function ensurePseudo(){
  var v=cleanPseudo(pseudoInput.value);
  if(!PSEUDO_RE.test(v)){
    pseudoInput.classList.add("err"); pseudoInput.focus(); shakeBody();
    toast("Choisis d'abord un pseudo (2 à 16 caractères : lettres, chiffres, espace, _ - .)");
    return false;
  }
  pseudoInput.classList.remove("err"); pseudoInput.value=v; setPseudo(v); return true;
}
// avatar : initiale du pseudo, vert quand le pseudo est valide
function refreshAvatar(){
  var v=cleanPseudo(pseudoInput.value), a=$("pseudoAvatar");
  a.textContent = v ? v.charAt(0).toUpperCase() : "?";
  a.classList.toggle("ok", PSEUDO_RE.test(v));
}
pseudoInput.addEventListener("input", function(){ pseudoInput.classList.remove("err"); refreshAvatar(); });
refreshAvatar();
pseudoInput.addEventListener("keydown", function(e){ if(e.key==="Enter" && ensurePseudo()){ pseudoInput.blur(); toast("Salut "+getPseudo()+" ! Choisis ton mode de jeu."); } });
function playQuiz(){ if(ensurePseudo()) startQuiz(); }
function playExam(){ if(ensurePseudo()) startExam(); }
function playAdv(){ if(ensurePseudo() && LEVELS.length) Adv.start(); }

// ---------- boutons de l'accueil ----------
$("quizBtn").addEventListener("click", playQuiz);
$("examBtn").addEventListener("click", playExam);
$("advBtn").addEventListener("click", playAdv);
$("clearTargetBtn").addEventListener("click", clearTargets);
$("targetQuizBtn").addEventListener("click", playQuiz);
$("changeSubjectBtn").addEventListener("click", function(){ go(STATE.SUBJECT); });
Array.prototype.forEach.call(document.querySelectorAll("[data-board]"), function(b){
  b.addEventListener("click", function(){ boardMode=b.getAttribute("data-board"); refreshTitleBoard(); }); });

// ---------- boutons des parties et du résultat ----------
$("nextBtn").addEventListener("click", function(){ if(answered) nextQuestion(); });
$("advPauseBtn").addEventListener("click", function(){ if(Adv.phase()==="PAUSE") Adv.resume(); else Adv.pause(); });
$("replayBtn").addEventListener("click", function(){
  if(run.mode===STATE.ADVENTURE) Adv.start();
  else if(run.exam) startExam();
  else if(run.practice && run.missed.length) startQuiz(run.missed.slice());
  else startQuiz();
});
$("shareBtn").addEventListener("click", share);
$("retryBtn").addEventListener("click", function(){ if(run.missed.length) startQuiz(run.missed.slice()); });
Array.prototype.forEach.call(document.querySelectorAll("[data-menu]"), function(b){ b.addEventListener("click", function(){ go(STATE.TITLE); }); });

// ---------- son, plein écran ----------
Array.prototype.forEach.call(document.querySelectorAll(".mute-btn"), function(b){ b.addEventListener("click", function(){ Sfx.toggle(); b.blur(); }); });
Sfx.label();
var fsBtn=$("advFsBtn"), docEl=document.documentElement;
if(!(docEl.requestFullscreen||docEl.webkitRequestFullscreen)) fsBtn.style.display="none";
fsBtn.addEventListener("click", function(){
  var fs=document.fullscreenElement||document.webkitFullscreenElement;
  if(fs){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); }
  else { (docEl.requestFullscreen||docEl.webkitRequestFullscreen).call(docEl); }
  fsBtn.blur();
});

// ---------- easter eggs ----------
// 1) code Konami (↑ ↑ ↓ ↓ ← → ← → B A) : « accès root » = pare-feu permanent en Aventure
var KONAMI=["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"], kIdx=0;
document.addEventListener("keydown", function(e){
  var k=(e.key||"").toLowerCase();
  kIdx = (k===KONAMI[kIdx]) ? kIdx+1 : (k===KONAMI[0] ? 1 : 0);
  if(kIdx===KONAMI.length){ kIdx=0; if(!rootMode){ rootMode=true; Sfx.life(); toast("🔓 sudo su — accès root accordé : pare-feu permanent en mode Aventure !"); Adv.enableRoot(); } }
}, true);
// 2) cliquer 5 fois sur le titre
var titleClicks=0, QUOTES=[
  "« Il n'y a pas de cloud, seulement l'ordinateur de quelqu'un d'autre. »",
  "« Une sauvegarde non testée n'est qu'une hypothèse. »",
  "« Le vendredi 17 h n'est pas une fenêtre de maintenance. »",
  "« Tout le monde a un PRA… jusqu'au premier sinistre. »",
  "« Ça marche sur ma machine » n'est pas un critère de succès de RFC."];
Array.prototype.forEach.call(document.querySelectorAll(".bigtitle"), function(t){ t.addEventListener("click", function(){
  if(++titleClicks%5===0){ Sfx.key(); toast("🥚 "+QUOTES[(titleClicks/5-1)%QUOTES.length]); }
}); });

// ---------- clavier ----------
document.addEventListener("keydown", function(e){
  var k=(e.key||"").toLowerCase();
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.target && e.target.tagName==="INPUT") return;            // saisie du pseudo
  if(state===STATE.QUIZ){
    if((k===" "||k==="enter")&&answered&&$("nextBtn").classList.contains("show")){ e.preventDefault(); nextQuestion(); return; }
    if(!answered && /^[1-4a-d]$/.test(k)){
      var map={"1":0,"2":1,"3":2,"4":3,"a":0,"b":1,"c":2,"d":3};
      var btns=$("answers").children; if(btns[map[k]]) btns[map[k]].click();
    }
  } else if(state===STATE.ADVENTURE){
    var ph=Adv.phase();
    if(ph==="QUESTION"){ if(Adv.questionKey(k)){ e.preventDefault(); } return; }
    if((k==="enter"||k===" ")&&(ph==="INTRO"||ph==="PAUSE"||ph==="CLEAR"||ph==="OVER")){ e.preventDefault(); if(ph==="PAUSE") Adv.resume(); else Adv.ovPrimary(); return; }
    if(k==="escape"||k==="p"){ e.preventDefault(); if(ph==="PAUSE") Adv.resume(); else Adv.pause(); return; }
    Adv.onKey(e,true);
  } else if(state===STATE.SUBJECT){
    var n=parseInt(k,10); if(n>=1 && n<=SUBJECTS.length) chooseSubject(SUBJECTS[n-1]);
  } else if(state===STATE.TITLE){
    if(k==="escape"){ go(STATE.SUBJECT); return; }
    if(k==="1"){ playQuiz(); } else if(k==="2"){ playAdv(); } else if(k==="3"){ playExam(); }
  }
});
document.addEventListener("keyup", function(e){ if(state===STATE.ADVENTURE) Adv.onKey(e,false); });
window.addEventListener("blur", function(){ if(state===STATE.ADVENTURE) Adv.pause(); });
document.addEventListener("visibilitychange", function(){ if(document.hidden && state===STATE.ADVENTURE) Adv.pause(); });

// contrôles tactiles : visibles sur écran tactile (ou dès le premier toucher)
if(window.matchMedia && window.matchMedia("(pointer: coarse)").matches) document.body.classList.add("is-touch");
window.addEventListener("touchstart", function(){ document.body.classList.add("is-touch"); }, {once:true, passive:true});

// ---------- démarrage ----------
renderSubjectMenu();
document.body.setAttribute("data-state", state);
(function(){
  if(!SUBJECTS.length){ toast("Aucune matière chargée : vérifie les fichiers matieres/*/matiere.js"); return; }
  // lien direct ?matiere=<id> : on saute le menu des matières
  var m=(location.search.match(/[?&]matiere=([\w-]+)/)||[])[1];
  for(var i=0;i<SUBJECTS.length;i++) if(SUBJECTS[i].id===m){ chooseSubject(SUBJECTS[i]); return; }
  applySubject(SUBJECTS[0]);
})();

// outils de test : index.html?debug
if(DEBUG) window.__cc={Adv:Adv, run:run, go:go, STATE:STATE, Board:Board,
  get BANK(){ return BANK; }, get LEVELS(){ return LEVELS; }, get THEMES(){ return THEMES; }, get subject(){ return subject; }};
