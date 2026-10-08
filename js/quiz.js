// ======================================================================
// MODE QUIZ et EXAMEN BLANC (même écran)
//  • Quiz         : GAME.quizLength questions au hasard, vies, combos, chrono par question.
//  • Quiz ciblé   : idem, limité aux domaines cochés sur l'accueil (non classé).
//  • Rejouer mes erreurs : la liste des erreurs de la partie précédente (non classé).
//  • Examen blanc : GAME.examLength questions réparties sur tous les domaines,
//                   chrono global de GAME.examMinutes, pas de vies ni de correction
//                   avant la fin → note sur 20 + réussite par domaine.
// ======================================================================
"use strict";

var queue=[], qi=0, answered=false, quizTimer=null, examTimer=null, timeLeft=0, examEnd=0;
var TQ=GAME.quizTime;                      // secondes pour la question en cours

function stopQuizTimers(){ clearInterval(quizTimer); clearInterval(examTimer); clearTimeout(nextQuestion._t); }

// ---------- construction de la file de questions ----------
function buildQueue(custom, exam){
  var all=[], pick;
  if(custom){
    custom.forEach(function(m){ all.push({theme:m.theme, ti:THEMES.indexOf(m.theme), q:m.q}); });
    pick=shuffle(all);
  } else if(exam){
    // répartition équilibrée : on pioche à tour de rôle dans chaque domaine, puis on mélange
    var pools=THEMES.map(function(t,ti){ return shuffle(BANK[t.id]).map(function(q){ return {theme:t, ti:ti, q:q}; }); });
    pick=[];
    while(pick.length<GAME.examLength && pools.some(function(p){ return p.length; })){
      shuffle(pools).forEach(function(p){ if(p.length && pick.length<GAME.examLength) pick.push(p.shift()); });
    }
    pick=shuffle(pick);
  } else {
    var ids=selectedThemeIds();
    THEMES.forEach(function(t,ti){ if(ids.length && !selectedThemes[t.id]) return;
      BANK[t.id].forEach(function(q){ all.push({theme:t, ti:ti, q:q}); }); });
    pick=shuffle(all).slice(0, Math.min(GAME.quizLength, all.length));
  }
  if(!exam){                                   // quiz : questions regroupées par domaine (vagues)
    pick.sort(function(a,b){ return a.ti-b.ti; });
    var prev=-1; pick.forEach(function(it){ it.first=(it.ti!==prev); prev=it.ti; });
  }
  queue=pick;
}

// custom = liste d'erreurs à rejouer ; exam = true pour l'examen blanc
function startQuiz(custom, exam){
  newRun(STATE.QUIZ);
  run.exam=!!exam; run.practice=!!custom; run.targeted=!custom && !exam && selectedThemeIds().length>0;
  buildQueue(custom, exam); qi=0;
  if(!queue.length){ toast("Aucune question disponible pour ce choix."); return; }
  $("score").textContent="0"; renderLives("lives", run.lives, run.maxLives); updateCombo();
  go(STATE.QUIZ);
  if(run.exam) startExamClock();
  loadQuestion();
}
function startExam(){ startQuiz(null, true); }

function waveBanner(theme, cb){
  var wb=$("waveBanner"); $("wbNum").textContent="DOMAINE";
  $("wbTitle").textContent=theme.name; $("wbTitle").style.textShadow="0 0 40px "+theme.color;
  $("wbNum").style.color=theme.color;
  wb.classList.remove("show"); void wb.offsetWidth; wb.classList.add("show");
  setTimeout(cb, prefersReduced?50:900);
}

function loadQuestion(){
  if(qi>=queue.length || (!run.exam && run.lives<=0)){ finishRun(); return; }
  var item=queue[qi];
  setTheme(item.theme.color); if(core.ok&&core.setColor) core.setColor(item.theme.color);
  $("waveTag").textContent=item.theme.name;
  TQ = item.q.d===3 ? GAME.quizTimeHard : GAME.quizTime;
  $("threatTag").textContent=(run.exam?"EXAMEN · ":"MENACE · ")+item.theme.name.toUpperCase();
  updateProgress();
  function paint(){
    if(state!==STATE.QUIZ) return;               // l'utilisateur a quitté pendant la bannière
    answered=false;
    $("question").textContent=item.q.q;
    item._order=paintAnswers($("answers"), item.q, function(correct, btn){ answer(correct, btn, item); });
    $("explain").className="explain"; $("nextBtn").className="next-btn";
    if(!run.exam) startTimer();
  }
  if(item.first && !run.exam){ waveBanner(item.theme, paint); } else { paint(); }
}
function updateProgress(){
  var item=queue[qi]; if(!item) return;
  var txt="Q <b>"+(qi+1)+"</b>/"+queue.length;
  if(run.exam) txt+=" · ⏱ <b>"+fmtTime(examEnd-Date.now())+"</b>";
  else if(item.q.d===3) txt+=" · ⏱ "+GAME.quizTimeHard+" s";
  $("qProgress").innerHTML=txt;
}

// ---------- chrono par question (Quiz) ----------
function startTimer(){
  clearInterval(quizTimer); timeLeft=TQ*1000; var tb=$("timerbar"), fill=$("timerfill");
  tb.classList.remove("low"); fill.style.width="100%";
  var t0=Date.now();
  quizTimer=setInterval(function(){
    var el=Date.now()-t0; timeLeft=TQ*1000-el; var pct=Math.max(0,timeLeft/(TQ*1000)*100);
    fill.style.width=pct+"%"; if(pct<30) tb.classList.add("low");
    if(timeLeft<=0){ clearInterval(quizTimer); quizTimeout(); }
  },80);
}
// ---------- chrono global (Examen blanc) ----------
function startExamClock(){
  var total=GAME.examMinutes*60*1000, tb=$("timerbar"), fill=$("timerfill");
  examEnd=Date.now()+total; tb.classList.remove("low"); fill.style.width="100%";
  clearInterval(examTimer);
  examTimer=setInterval(function(){
    var left=examEnd-Date.now(), pct=Math.max(0,left/total*100);
    fill.style.width=pct+"%"; tb.classList.toggle("low", left<5*60*1000);
    updateProgress();
    if(left<=0){ clearInterval(examTimer); examTimeUp(); }
  },500);
}
function examTimeUp(){
  // les questions non traitées comptent comme fausses
  // (si la question en cours vient d'être répondue, elle est déjà comptée)
  stopQuizTimers();
  for(var i=(answered?qi+1:qi);i<queue.length;i++){ var it=queue[i]; run.asked++; recordAnswer(it.theme,false); recordMiss(it.theme, it.q, null); }
  qi=queue.length; toast("⏱ Temps écoulé : l'examen est terminé.");
  finishRun();
}

function answer(correct, btn, item){
  if(answered) return; answered=true; clearInterval(quizTimer); run.asked++;
  recordAnswer(item.theme, correct);
  if(run.exam){                                    // examen : on enregistre et on passe, sans correction
    if(correct) run.correct++; else recordMiss(item.theme, item.q, btn.lastChild.textContent);
    Array.prototype.forEach.call($("answers").children, function(b){ b.disabled=true; if(b!==btn) b.classList.add("dim"); });
    btn.classList.add("picked");
    nextQuestion._t=setTimeout(nextQuestion, prefersReduced?60:320);
    return;
  }
  revealAnswers($("answers"), item.q, item._order);
  var ex=$("explain"), v=$("exVerdict"), tx=$("exText");
  if(correct){
    btn.classList.remove("dim"); btn.classList.add("correct"); Sfx.good();
    run.combo++; if(run.combo>run.bestCombo)run.bestCombo=run.combo; run.correct++;
    var mult=Math.min(5,run.combo); var speedBonus=Math.round(timeLeft/(TQ*1000)*50);
    var pts=(100+speedBonus)*mult;
    run.score+=pts; animScore("score", run.score);
    if(core.ok&&core.explode) core.explode();
    var r=btn.getBoundingClientRect(); floatPoints(r.left+r.width/2, r.top, "+"+pts, "var(--ok)");
    ex.className="explain good show"; v.textContent=run.combo>=2?("Juste ! x"+mult+" combo"):"Juste !";
    tx.textContent=item.q.e;
  } else {
    btn.classList.remove("dim"); btn.classList.add("wrong");
    run.combo=0; run.lives--; renderLives("lives", run.lives, run.maxLives); shakeBody();
    recordMiss(item.theme, item.q, btn.lastChild.textContent); Sfx.bad();
    ex.className="explain bad show"; v.textContent="Raté —"; tx.textContent=item.q.e;
  }
  updateCombo(); showNext();
}
function quizTimeout(){
  if(answered) return; answered=true; run.asked++;
  var item=queue[qi]; revealAnswers($("answers"), item.q, item._order);
  recordAnswer(item.theme, false);
  run.combo=0; run.lives--; renderLives("lives", run.lives, run.maxLives); updateCombo(); shakeBody();
  recordMiss(item.theme, item.q, null); Sfx.bad();
  $("explain").className="explain bad show";
  $("exVerdict").textContent="Trop tard —"; $("exText").textContent=item.q.e; showNext();
}
function showNext(){
  var nb=$("nextBtn"); nb.textContent=(qi>=queue.length-1||run.lives<=0)?"Voir le résultat ▶":"Continuer ▶"; nb.classList.add("show");
}
function nextQuestion(){ if(state!==STATE.QUIZ) return; qi++; loadQuestion(); }
function updateCombo(){ var c=$("combo"); c.textContent="x"+Math.min(5,Math.max(1,run.combo||1));
  c.classList.toggle("on", run.combo>=2);
  if(run.combo>=2&&!prefersReduced){ c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); } }
