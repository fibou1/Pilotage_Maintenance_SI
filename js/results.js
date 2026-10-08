// ======================================================================
// RÉSULTATS — bilan de partie, note d'examen, réussite par domaine,
// révision des erreurs, classement (local ou en ligne) et partage.
// ======================================================================
"use strict";

// ======================================================================
// 1. BILAN DE FIN DE PARTIE
// ======================================================================
function examVerdict(note){
  if(note>=16) return "Très bien — prêt(e) pour l'examen";
  if(note>=12) return "Bien — encore quelques révisions";
  if(note>=10) return "Juste la moyenne — consolide tes bases";
  return "Insuffisant — revois les domaines en rouge";
}
function finishRun(win){
  stopQuizTimers();
  if(win!==undefined) run.won=!!win;
  var isAdv=run.mode===STATE.ADVENTURE;
  var acc = run.asked ? run.correct/run.asked : 0;
  var box=function(id,val,label){ $(id).textContent=val; $(id+"L").textContent=label; };

  if(run.exam){
    var total=queue.length||1, note=run.correct/total*20, bestNote=getBestNote();
    if(bestNote===null || note>bestNote){ bestNote=note; setBestNote(note); }
    $("resEyebrow").textContent="Examen blanc terminé · "+subject.name;
    $("finalScore").textContent=fmtNote(note); $("finalUnit").textContent=" / 20";
    box("rAcc", Math.round(acc*100)+"%", "Précision");
    box("rCombo", run.correct+"/"+total, "Bonnes réponses");
    box("rLevels", fmtTime(Date.now()-run.startedAt), "Temps utilisé"); $("rLevelsBox").style.display="";
    box("rBest", fmtNote(bestNote)+"/20", "Meilleure note");
    $("rankBadge").textContent=examVerdict(note);
  } else {
    var best=getBest(); if(!run.practice && !run.targeted && run.score>best){ best=run.score; setBest(run.score); }
    $("resEyebrow").textContent = isAdv ? (run.secret?"🔑 Fin secrète débloquée":(run.won?"Aventure réussie":"Aventure terminée"))
      : (run.practice?"Révision des erreurs terminée":(run.targeted?"Quiz ciblé terminé":"Mission terminée"));
    $("finalScore").textContent=run.score.toLocaleString("fr-FR"); $("finalUnit").textContent=" PTS";
    box("rAcc", Math.round(acc*100)+"%", "Précision");
    box("rCombo", "x"+Math.min(5,run.bestCombo)+" ("+run.bestCombo+")", "Meilleur combo");
    box("rLevels", run.levelsDone+"/"+run.levelsTotal, "Niveaux"); $("rLevelsBox").style.display = isAdv ? "" : "none";
    box("rBest", best.toLocaleString("fr-FR"), "Record");
    $("rankBadge").textContent=rankFor(acc);
  }
  renderThemeStats();
  renderReview();
  submitToBoard(acc);
  setTheme(subject.color||"#b06bff");
  go(STATE.RESULT);
}

// Réussite par domaine : les domaines les plus faibles en premier
function renderThemeStats(){
  var list=$("themeStatsList"); list.innerHTML="";
  var rows=Object.keys(run.byTheme).map(function(k){ return run.byTheme[k]; });
  $("themeStats").style.display = rows.length ? "" : "none";
  rows.sort(function(a,b){ return a.ok/a.n - b.ok/b.n || b.n-a.n; });
  rows.forEach(function(r){
    var pct=Math.round(r.ok/r.n*100), lvl = pct<50 ? "low" : (pct<75 ? "mid" : "high");
    var row=document.createElement("div"); row.className="ts-row "+lvl;
    var nm=document.createElement("span"); nm.className="ts-name"; nm.textContent=r.theme.name;
    var bar=document.createElement("span"); bar.className="ts-bar"; bar.setAttribute("aria-hidden","true");
    var fill=document.createElement("i"); fill.style.width=Math.max(4,pct)+"%"; bar.appendChild(fill);
    var val=document.createElement("span"); val.className="ts-val"; val.textContent=r.ok+"/"+r.n+" · "+pct+" %";
    row.appendChild(nm); row.appendChild(bar); row.appendChild(val); list.appendChild(row);
  });
}

// Révision des erreurs : question, réponse donnée, bonne réponse, explication, référence au cours
function renderReview(){
  var list=$("reviewList"); list.innerHTML="";
  var n=run.missed.length;
  $("reviewTitle").textContent = n ? "Révision des erreurs ("+n+")" : "Révision des erreurs";
  $("retryBtn").style.display = n ? "" : "none";
  if(!n){
    var ok=document.createElement("li"); ok.className="review-empty";
    ok.textContent = run.asked ? "Aucune erreur sur cette partie — bravo !" : "Aucune question jouée sur cette partie.";
    list.appendChild(ok); return;
  }
  run.missed.forEach(function(m){
    var li=document.createElement("li"); li.className="rv"; li.style.setProperty("--rv", m.theme.color);
    function line(cls, txt){ var d=document.createElement("div"); d.className=cls; d.textContent=txt; li.appendChild(d); return d; }
    line("rt", m.theme.name);
    line("rq", m.q.q);
    line("bad", m.given===null ? (run.exam?"✗ Sans réponse":"✗ Temps écoulé") : "✗ Ta réponse : "+m.given);
    line("good", "✓ Bonne réponse : "+m.q.a[m.q.c]);
    line("rx", m.q.e);
    if(m.q.ref) line("rr", "📖 À revoir : "+m.q.ref);
    list.appendChild(li);
  });
}

// ======================================================================
// 2. PSEUDO
// ======================================================================
var PSEUDO_KEY="cybercrise_pseudo_v1";
var PSEUDO_RE=/^[A-Za-z0-9À-ÖØ-öø-ÿ _.\-]{2,16}$/;
function cleanPseudo(s){ return String(s||"").replace(/\s+/g," ").trim(); }
function getPseudo(){ return Store.get(PSEUDO_KEY, ""); }
function setPseudo(v){ Store.set(PSEUDO_KEY, v); }

// ======================================================================
// 3. CLASSEMENT — un classement par matière et par mode (quiz / aventure)
//    Local par défaut ; partagé via Supabase si LEADERBOARD est rempli (js/config.js).
// ======================================================================
var LOCAL_BOARD_KEY="cybercrise_board_v1";
var Board = (function(){
  var online = !!(LEADERBOARD.url && LEADERBOARD.anonKey);
  function api(){ return LEADERBOARD.url.replace(/\/$/,"")+"/rest/v1/"+LEADERBOARD.table; }
  function headers(){ return { "apikey":LEADERBOARD.anonKey, "Authorization":"Bearer "+LEADERBOARD.anonKey, "Content-Type":"application/json" }; }
  function withTimeout(p, ms){ return Promise.race([p, new Promise(function(_,rej){ setTimeout(function(){ rej(new Error("timeout")); }, ms); })]); }
  function readLocal(){ try{ var a=JSON.parse(Store.get(LOCAL_BOARD_KEY,"[]")); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function subjOf(x){ return x.subject || "pilotage"; }           // anciens scores (avant multi-matières) = pilotage
  function sortTop(a, subj, mode, n){
    return a.filter(function(x){ return x.mode===mode && subjOf(x)===subj; })
            .sort(function(x,y){ return y.score-x.score; }).slice(0, n||10);
  }
  function saveLocal(entry){
    var a=readLocal(); a.push(entry);
    // on garde les 30 meilleurs scores par matière et par mode
    var keys={}; a.forEach(function(x){ keys[subjOf(x)+"|"+x.mode]=[subjOf(x), x.mode]; });
    var keep=[]; Object.keys(keys).forEach(function(k){ keep=keep.concat(sortTop(a, keys[k][0], keys[k][1], 30)); });
    Store.set(LOCAL_BOARD_KEY, JSON.stringify(keep));
  }
  return {
    isOnline:function(){ return online; },
    // Enregistre le score (toujours en local, et en ligne si configuré). Résout {online:bool}.
    submit:function(entry){
      saveLocal(entry);
      if(!online) return Promise.resolve({online:false});
      return withTimeout(fetch(api(), {
          method:"POST", headers:Object.assign(headers(), {"Prefer":"return=minimal"}),
          body:JSON.stringify({pseudo:entry.pseudo, matiere:entry.subject, mode:entry.mode, score:entry.score, accuracy:entry.accuracy, levels:entry.levels})
        }), 7000).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return {online:true}; })
        .catch(function(){ return {online:false, failed:true}; });
    },
    // Top 10 d'une matière pour un mode. Résout {list:[…], online:bool, failed:bool}.
    top:function(subj, mode){
      var local=function(failed){ return {list:sortTop(readLocal(), subj, mode), online:false, failed:!!failed}; };
      if(!online) return Promise.resolve(local(false));
      var q="?select=pseudo,score,accuracy,levels,created_at&matiere=eq."+encodeURIComponent(subj)+"&mode=eq."+encodeURIComponent(mode)+"&order=score.desc&limit=10";
      return withTimeout(fetch(api()+q, {headers:headers()}), 7000)
        .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
        .then(function(list){ return {list:list, online:true}; })
        .catch(function(){ return local(true); });
    }
  };
})();

function boardSourceText(res){
  if(res.online) return "🌐 Classement en ligne partagé entre tous les joueurs";
  if(res.failed) return "⚠ Classement en ligne indisponible — affichage des scores de cet appareil";
  return "💾 Classement local (cet appareil). Le classement partagé s'active dans js/config.js (voir README).";
}
function renderBoard(listEl, srcEl, res, me){
  listEl.innerHTML="";
  if(!res.list.length){ var e=document.createElement("li"); e.className="empty"; e.textContent="Aucun score pour l'instant — sois le premier !"; listEl.appendChild(e); }
  var rank=0;
  res.list.forEach(function(x,i){
    var li=document.createElement("li");
    if(me && !rank && x.pseudo===me.pseudo && Number(x.score)===me.score){ li.className="me"; rank=i+1; }
    var r=document.createElement("span"); r.className="r"; r.textContent="#"+(i+1);
    var n=document.createElement("span"); n.className="n"; n.textContent=x.pseudo;
    var s=document.createElement("span"); s.className="s"; s.textContent=Number(x.score).toLocaleString("fr-FR");
    li.appendChild(r); li.appendChild(n); li.appendChild(s); listEl.appendChild(li);
  });
  srcEl.textContent=boardSourceText(res);
  return rank;
}
var boardMode="quiz";
function refreshTitleBoard(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-board]"), function(b){
    var on=b.getAttribute("data-board")===boardMode; b.classList.toggle("on", on); b.setAttribute("aria-selected", on?"true":"false"); });
  var m=boardMode, s=subject.id;
  Board.top(s, m).then(function(res){ if(m===boardMode && s===subject.id) renderBoard($("boardList"), $("boardSrc"), res, null); });
}
function submitToBoard(acc){
  var sec=$("resBoard");
  if(run.exam){ sec.style.display="none"; return; }               // l'examen blanc n'est pas un concours de points
  sec.style.display="";
  var mode = run.mode===STATE.ADVENTURE ? "aventure" : "quiz", ranked = !run.practice && !run.targeted;
  $("resBoardH").textContent="🏆 Classement "+(mode==="quiz"?"Quiz":"Aventure");
  $("resRank").textContent = ranked ? "Enregistrement du score…"
    : (run.practice ? "Partie d'entraînement (révision des erreurs) : non classée." : "Quiz ciblé sur quelques domaines : entraînement non classé.");
  var me={pseudo:getPseudo()||"Anonyme", score:run.score}, subj=subject.id;
  var p = ranked ? Board.submit({pseudo:me.pseudo, subject:subj, mode:mode, score:run.score,
      accuracy:Math.round(acc*100), levels:run.levelsDone, date:new Date().toISOString()}) : Promise.resolve();
  p.then(function(){ return Board.top(subj, mode); }).then(function(res){
    var rank=renderBoard($("resBoardList"), $("resBoardSrc"), res, ranked?me:null);
    if(ranked) $("resRank").textContent = rank ? ("Bravo "+me.pseudo+" : tu es #"+rank+" du classement !") : ("Score enregistré, "+me.pseudo+" — pas encore dans le top 10. Rejoue !");
  });
}

// ======================================================================
// 4. PARTAGE
// ======================================================================
function share(){
  var acc=run.asked?Math.round(run.correct/run.asked*100):0, who=getPseudo()?getPseudo()+" : ":"", txt;
  if(run.exam){
    txt="📝 CyberCrise — Examen blanc « "+subject.name+" » — "+who+fmtNote(run.correct/(queue.length||1)*20)+"/20 ("+acc+"% de réussite). À toi de faire mieux !";
  } else {
    var mode=run.mode===STATE.ADVENTURE?"Mode Aventure":"Mode Quiz";
    txt="🛡️ CyberCrise — "+subject.name+" ("+mode+") — "+who+run.score.toLocaleString("fr-FR")+" pts ("+rankFor(run.asked?run.correct/run.asked:0)+", "+acc+"% de réussite). À toi de battre mon score !";
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){ toast("Score copié — colle-le où tu veux !"); },function(){ toast(txt); });
  } else { toast(txt); }
}
