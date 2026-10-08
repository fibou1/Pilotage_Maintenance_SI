// ======================================================================
// MODE AVENTURE — sprites, moteur de plateforme 2D, bonus, ennemis, niveaux
// Les niveaux (LEVELS) viennent de la matière choisie : matieres/<id>/matiere.js
// ======================================================================
"use strict";

// ======================================================================
// 1. ASSETS — abstraction des sprites (Kenney Pixel Platformer, CC0)
//    Pour brancher TES PNG :
//      • change ASSETS.base / sheets[*].src (feuille de sprites découpée en grille), ou
//      • donne à un sprite sa propre image :  { src:"mon_perso.png", fb:"#fff" }
//    Si une image manque, un placeholder coloré (fb + shape) est dessiné : le jeu ne plante jamais.
//    i = index dans la feuille (ligne par ligne) ; tableau = variantes / frames d'animation.
//    Un sprite sans sheet ni src (ex. fireItem) est toujours dessiné en placeholder : remplaçable par un PNG.
// ======================================================================
var ASSETS = {
  base: "assets/",
  sheets: {
    tiles: { src:"tilemap_packed.png",            tw:18, th:18, cols:20 },
    chars: { src:"tilemap-characters_packed.png", tw:24, th:24, cols:9  }
  },
  sprites: {
    // --- décor & tuiles (feuille "tiles") ---
    grass:    { sheet:"tiles", i:2,         fb:"#3fb86a", shape:"rect" },
    dirt:     { sheet:"tiles", i:[24,25],   fb:"#a0623a", shape:"rect" },
    platL:    { sheet:"tiles", i:40,        fb:"#d9a05b", shape:"rect" },
    platM:    { sheet:"tiles", i:[41,42],   fb:"#d9a05b", shape:"rect" },
    platR:    { sheet:"tiles", i:43,        fb:"#d9a05b", shape:"rect" },
    spikes:   { sheet:"tiles", i:68,        fb:"#cfd6e0", shape:"tri" },
    crystal:  { sheet:"tiles", i:67,        fb:"#4cc9ff", shape:"diamond" },
    spring:   { sheet:"tiles", i:107,       fb:"#ff5a5a", shape:"rect" },
    springUp: { sheet:"tiles", i:108,       fb:"#ff5a5a", shape:"rect" },
    flagTop:  { sheet:"tiles", i:[111,112], fb:"#ff2e6a", shape:"tri" },
    flagPole: { sheet:"tiles", i:131,       fb:"#cfd6e0", shape:"rect" },
    pine:     { sheet:"tiles", i:126,       fb:"#2f9e63", shape:"tri" },
    sprout:   { sheet:"tiles", i:125,       fb:"#4cd27a", shape:"tri" },
    mushroom: { sheet:"tiles", i:128,       fb:"#e0503c", shape:"circle" },
    sign:     { sheet:"tiles", i:85,        fb:"#b57a45", shape:"rect" },
    cactus:   { sheet:"tiles", i:127,       fb:"#3fa655", shape:"rect" },
    // --- bonus ---
    qblock:   { sheet:"tiles", i:10,        fb:"#f2b630", shape:"rect" },     // bloc « ! » à frapper par-dessous
    usedBlock:{ sheet:"tiles", i:29,        fb:"#a0623a", shape:"rect" },     // bloc vidé
    coin:     { sheet:"tiles", i:[151,152], fb:"#ffd23f", shape:"circle" },   // octet à ramasser
    key:      { sheet:"tiles", i:27,        fb:"#ffd23f", shape:"rect" },     // clé de déchiffrement (secret)
    heart:    { sheet:"tiles", i:44,        fb:"#ff4d6d", shape:"circle" },   // +1 vie
    fireItem: { fb:"#ff7a1a", shape:"circle", w:12, h:12 },                   // pouvoir « Pare-feu »
    shieldItem:{ fb:"#4cc9ff", shape:"diamond", w:12, h:12 },                 // pouvoir « Bouclier PCA »
    // --- personnages (feuille "chars") ---
    playerIdle: { sheet:"chars", i:0,       fb:"#4cd27a", shape:"circle" },
    playerWalk: { sheet:"chars", i:[0,1],   fb:"#4cd27a", shape:"circle" },
    playerJump: { sheet:"chars", i:1,       fb:"#4cd27a", shape:"circle" },
    walker:     { sheet:"chars", i:[18,19], fb:"#3aa0ff", shape:"rect" },
    walkerDead: { sheet:"chars", i:20,       fb:"#3aa0ff", shape:"rect" },
    spiky:      { sheet:"chars", i:[15,16], fb:"#ff5a3c", shape:"tri" },
    bat:        { sheet:"chars", i:[24,25], fb:"#c07a4a", shape:"circle" }
  }
};

var Assets = { img:{}, promise:null };
function assetUrl(u){ return /^(https?:|data:|\/)/.test(u) ? u : ASSETS.base+u; }
// Précharge toutes les images ; résout TOUJOURS (une image en erreur = null → placeholder).
Assets.load = function(){
  if(Assets.promise) return Assets.promise;
  var urls={};
  Object.keys(ASSETS.sheets).forEach(function(k){ urls[ASSETS.sheets[k].src]=1; });
  Object.keys(ASSETS.sprites).forEach(function(k){ var s=ASSETS.sprites[k]; if(s.src) urls[s.src]=1; });
  var list=Object.keys(urls);
  Assets.promise=new Promise(function(resolve){
    var left=list.length; if(!left){ resolve(); return; }
    function done(){ if(--left===0) resolve(); }
    list.forEach(function(u){
      var im=new Image();
      im.onload=function(){ Assets.img[u]=im; done(); };
      im.onerror=function(){ Assets.img[u]=null; done(); };
      im.src=assetUrl(u);
    });
    setTimeout(resolve, 6000);                 // sécurité : on ne bloque jamais le jeu
  });
  return Assets.promise;
};

function placeholder(c, d, x, y, w, h){
  c.save(); c.fillStyle=d.fb||"#ff00ff"; c.strokeStyle="rgba(0,0,0,.45)"; c.lineWidth=1; c.beginPath();
  if(d.shape==="diamond"){ c.moveTo(x+w/2,y+1); c.lineTo(x+w-2,y+h/2); c.lineTo(x+w/2,y+h-1); c.lineTo(x+2,y+h/2); c.closePath(); }
  else if(d.shape==="tri"){ c.moveTo(x+w/2,y+2); c.lineTo(x+w-1,y+h-1); c.lineTo(x+1,y+h-1); c.closePath(); }
  else if(d.shape==="circle"){ c.arc(x+w/2,y+h/2,Math.min(w,h)/2-1,0,6.283); }
  else { c.rect(x+.5,y+.5,w-1,h-1); }
  c.fill(); c.stroke(); c.restore();
}
// Dessine un sprite par son nom ; variant choisit la variante/frame ; flip = miroir horizontal.
function drawSprite(c, name, dx, dy, variant, flip){
  var d=ASSETS.sprites[name]; if(!d) return;
  var sh=d.sheet?ASSETS.sheets[d.sheet]:null, img=null, sx=0, sy=0, sw=d.w||18, shh=d.h||18;
  var idx=Array.isArray(d.i) ? d.i[(((variant|0)%d.i.length)+d.i.length)%d.i.length] : (d.i|0);
  if(sh){ img=Assets.img[sh.src]||null; sw=sh.tw; shh=sh.th; sx=(idx%sh.cols)*sw; sy=Math.floor(idx/sh.cols)*shh; }
  else if(d.src){ img=Assets.img[d.src]||null; if(img){ sw=img.width; shh=img.height; } }
  if(!img){ placeholder(c,d,dx,dy,sw,shh); return; }
  if(flip){ c.save(); c.translate(dx+sw,dy); c.scale(-1,1); c.drawImage(img,sx,sy,sw,shh,0,0,sw,shh); c.restore(); }
  else c.drawImage(img,sx,sy,sw,shh,dx,dy,sw,shh);
}

// ======================================================================
// 2. MOTEUR de plateforme 2D (canvas, delta-time, pas fixe)
// ======================================================================
var Pool = { used:[] };           // tirage de QCM sans répétition pendant une partie
Pool.reset = function(){ Pool.used=[]; };
Pool.next = function(themeIds){
  var c=[];
  themeIds.forEach(function(id){ BANK[id].forEach(function(q){ if(Pool.used.indexOf(q)<0) c.push({theme:themeById(id), q:q}); }); });
  if(!c.length){ Pool.used=[]; return Pool.next(themeIds); }
  var p=c[Math.floor(Math.random()*c.length)]; Pool.used.push(p.q); return p;
};

var rootMode = false;              // easter egg : code Konami → pare-feu permanent

var Adv = (function(){
  var T=18, VW=320, VH=180, FIXED=1/120;                        // tuile, vue logique (zoom), pas physique
  var VW_WIDE=320, VW_PORTRAIT=200;                             // en portrait : vue plus étroite = sprites plus grands
  var GRAV=1500, JUMP=440, MAXV=118, ACC=1100, FRIC=1300, FRIC_AIR=420, MAXFALL=540;
  var COYOTE=0.1, JBUF=0.12, SPRING=640, SHIELD_TIME=10, COINS_FOR_LIFE=30, MAX_LIVES=9;
  var cv=$("adv"), ctx=cv.getContext("2d");
  var L=null, P=null, levelIdx=0, phase="IDLE", running=false, raf=0, ovShownAt=0, last=0, acc=0, animT=0, camX=0, camY=0;
  var parts=[], pops=[], items=[], shots=[], bumps=[], curCrystal=null, msgT=0, shakeT=0, ovAction1=null, ovAction2=null, skyGrad=null;
  var shotCd=0, lastSec=-1, warned=false;
  var keys={}, touch={left:false,right:false,jump:false};
  var input={left:false,right:false,jump:false};

  // ---------- vue adaptée à l'écran ----------
  // La vue logique (320×180) est agrandie au maximum par le CSS ; en portrait on la rétrécit
  // en largeur (200×180) pour que les sprites restent grands sur téléphone.
  function fitView(){
    var portrait = innerHeight>innerWidth && innerWidth<760;
    var nv = portrait ? VW_PORTRAIT : VW_WIDE;
    if(nv===VW && cv.width===nv && cv.height===VH) return;
    VW=nv; cv.width=VW; cv.height=VH;
    $("advWrap").style.setProperty("--ar", (VW/VH).toFixed(4));
    if(L && P) snapCamera();
  }
  addEventListener("resize", fitView);
  addEventListener("orientationchange", fitView);
  fitView();

  // ---------- overlay générique (intro / pause / fin de niveau) ----------
  function showOv(k,t,d,h,b1,f1,b2,f2){
    $("ovK").textContent=k||""; $("ovT").textContent=t||""; $("ovD").textContent=d||""; $("ovH").textContent=h||"";
    $("ovB1").textContent=b1; ovAction1=f1;
    var B2=$("ovB2"); if(b2){ B2.style.display=""; B2.textContent=b2; ovAction2=f2; } else { B2.style.display="none"; ovAction2=null; }
    ovShownAt=performance.now(); $("ov").classList.add("show"); $("ovB1").focus({preventScroll:true});
  }
  function hideOv(){ $("ov").classList.remove("show"); ovAction1=null; ovAction2=null; }
  function ovReady(){ return performance.now()-ovShownAt>350; }   // évite qu'un même appui active deux overlays d'affilée
  $("ovB1").addEventListener("click", function(){ if(ovAction1 && ovReady()) ovAction1(); });
  $("ovB2").addEventListener("click", function(){ if(ovAction2 && ovReady()) ovAction2(); });
  function say(msg, dur){ var m=$("advMsg"); m.textContent=msg; m.classList.add("show"); msgT=dur||2.2; }

  function hud(){
    renderLives("advLives", run.lives, Math.max(run.maxLives, run.lives));
    $("advCrystals").textContent="◆ "+(L?collected():0)+"/"+(L?L.total:0);
    $("advCoins").textContent="● "+run.coins;
    var k=$("advKeys"); k.textContent = run.keys ? "🔑 "+run.keys+"/"+LEVELS.length : ""; k.style.display = run.keys ? "" : "none";
    var pw=[]; if(P&&P.fire) pw.push("🔥 Pare-feu"); if(P&&P.shield>0) pw.push("🛡 PCA "+Math.ceil(P.shield)+" s");
    var pe=$("advPower"); pe.textContent=pw.join(" · "); pe.style.display = pw.length ? "" : "none";
    document.body.classList.toggle("has-fire", !!(P&&P.fire));
    var c=$("advCombo"); c.textContent="x"+Math.min(5,Math.max(1,run.combo||1)); c.classList.toggle("on", run.combo>=2);
    if(run.combo>=2&&!prefersReduced){ c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    hudTime();
  }
  function hudTime(){
    var t=$("advTime"); if(!L){ t.textContent=""; return; }
    var s=Math.max(0,Math.ceil(L.time)); t.textContent="⏱ "+s;
    t.classList.toggle("low", s<=30);
  }
  function collected(){ var n=0; for(var i=0;i<L.crystals.length;i++) if(L.crystals[i].taken) n++; return n; }

  // ---------- cycle de vie ----------
  function start(){
    newRun(STATE.ADVENTURE); Pool.reset(); levelIdx=0; fitView();
    $("advScore").textContent="0"; L=null; P=null; hud();
    go(STATE.ADVENTURE);
    phase="LOAD";
    showOv("Chargement","Préparation des sprites…","","","…",null);
    $("ovB1").disabled=true;
    Assets.load().then(function(){ $("ovB1").disabled=false; loadLevel(0); });
    begin();
  }
  function begin(){
    if(running) return; running=true; last=performance.now(); acc=0; raf=requestAnimationFrame(frame);
  }
  function stop(){ running=false; cancelAnimationFrame(raf); phase="IDLE"; hideOv(); closeModal(); releaseAll(); document.body.classList.remove("has-fire"); }

  function loadLevel(i){
    var keepFire = P ? P.fire : false;                          // le pare-feu se conserve d'un niveau à l'autre
    levelIdx=i; L=buildLevel(LEVELS[i]);
    setTheme(L.def.accent);
    skyGrad=ctx.createLinearGradient(0,0,0,VH); skyGrad.addColorStop(0,L.def.sky[0]); skyGrad.addColorStop(1,L.def.sky[1]);
    parts=[]; pops=[]; items=[]; shots=[]; bumps=[]; lastSec=-1; warned=false;
    resetPlayer(); P.fire = keepFire || rootMode; snapCamera();
    $("advTag").textContent="Niv "+(i+1)+"/"+LEVELS.length+" · "+L.def.name; hud();
    phase="INTRO";
    showOv("NIVEAU "+(i+1)+" / "+LEVELS.length, L.def.name,
      L.def.sub+" — valide les "+L.total+" cristaux (un QCM chacun) et rejoins le drapeau avant la fin du chrono RTO ("+L.def.time+" s).",
      L.def.hint, "▶ Jouer", function(){ hideOv(); phase="PLAY"; last=performance.now();
        if(L.wave) say("⚠ Un ransomware chiffre le SI depuis la gauche : avance !", 3.2); });
  }

  // ---------- construction d'un niveau depuis ses lignes de texte ----------
  function buildLevel(def){
    var rows=def.map, H=rows.length, W=rows[0].length;
    var lv={def:def, W:W, H:H, grid:[], crystals:[], enemies:[], decor:[], coins:[], keys:[], startTx:1, startTy:1, exit:null, total:0,
            time:def.time||180, wave: def.wave ? {x:-80, speed:def.wave.speed, delay:def.wave.delay} : null};
    for(var y=0;y<H;y++){ lv.grid[y]=rows[y].split(""); }
    for(y=0;y<H;y++) for(var x=0;x<W;x++){
      var ch=lv.grid[y][x], clear=true;
      if(ch==="P"){ lv.startTx=x; lv.startTy=y; }
      else if(ch==="X"){ lv.exit={tx:x,ty:y}; }
      else if(ch==="C"){ lv.crystals.push({tx:x,ty:y,x:x*T,y:y*T,taken:false,cd:0}); }
      else if(ch==="o"){ lv.coins.push({x:x*T+4,y:y*T+4,w:10,h:10,taken:false}); }
      else if(ch==="K"){ lv.keys.push({x:x*T+2,y:y*T+2,w:14,h:14,taken:false}); }
      else if(ch==="E"){ lv.enemies.push({type:"E",x:x*T+2,y:(y+1)*T-12,w:14,h:12,dir:-1,speed:28,alive:true,dead:0,stomp:true}); }
      else if(ch==="Z"){ lv.enemies.push({type:"Z",x:x*T+2,y:(y+1)*T-16,w:14,h:16,dir:1,speed:22,alive:true,dead:0,stomp:false}); }
      else if(ch==="B"){ lv.enemies.push({type:"B",x:x*T+2,y:y*T,y0:y*T,x0:x*T+2,w:14,h:12,dir:1,speed:34,alive:true,dead:0,stomp:true,ph:Math.random()*6}); }
      else if("tgmwk".indexOf(ch)>=0){ lv.decor.push({tx:x,ty:y,s:{t:"pine",g:"sprout",m:"mushroom",w:"sign",k:"cactus"}[ch]}); }
      else clear=false;
      if(clear) lv.grid[y][x]=".";
    }
    lv.total=lv.crystals.length;
    return lv;
  }
  // « ? » et « b » (bloc vidé) sont solides ; « u » (invisible) ne l'est que frappé par-dessous.
  function solidAt(tx,ty){
    if(tx<0||tx>=L.W) return true;        // murs invisibles aux bords
    if(ty<0||ty>=L.H) return false;       // le vide : trous = chute
    var c=L.grid[ty][tx]; return c==="#"||c==="="||c==="?"||c==="b";
  }
  function resetPlayer(){
    P={x:L.startTx*T+3, y:L.startTy*T, w:12, h:18, vx:0, vy:0, onGround:false, face:1, coyote:0, jumpBuf:0, inv:0, stun:0,
       safeX:L.startTx*T+3, safeY:L.startTy*T, safeT:0, fire:false, shield:0, spring:0};
  }

  // ---------- entrées clavier + tactile ----------
  function recompute(){
    input.left  = !!(keys.arrowleft||keys.a||keys.q) || touch.left;
    input.right = !!(keys.arrowright||keys.d) || touch.right;
    input.jump  = !!(keys.arrowup||keys.w||keys.z||keys[" "]) || touch.jump;
  }
  function releaseAll(){ keys={}; touch.left=touch.right=touch.jump=false; ["tcLeft","tcRight","tcJump","tcFire"].forEach(function(id){ $(id).classList.remove("on"); }); recompute(); }
  function pressJump(){ if(P) P.jumpBuf=JBUF; }
  var FIRE_KEYS={f:1,x:1,k:1,shift:1};
  function onKey(e, down){
    var k=(e.key||"").toLowerCase();
    if(["arrowleft","arrowright","arrowup","arrowdown"," "].indexOf(k)>=0 && state===STATE.ADVENTURE) e.preventDefault();
    if(down && !e.repeat && FIRE_KEYS[k] && phase==="PLAY"){ shoot(); return; }
    var wasJump=input.jump;
    keys[k]=down; recompute();
    if(down && !e.repeat && input.jump && !wasJump && phase==="PLAY") pressJump();
  }
  function bindTouch(id, name){
    var el=$(id);
    function on(e){ e.preventDefault(); el.classList.add("on");
      if(name==="fire"){ if(phase==="PLAY") shoot(); return; }
      touch[name]=true; recompute(); if(name==="jump"&&phase==="PLAY") pressJump(); }
    function off(e){ e.preventDefault(); el.classList.remove("on"); if(name==="fire") return; touch[name]=false; recompute(); }
    el.addEventListener("pointerdown", on);
    ["pointerup","pointercancel","pointerleave"].forEach(function(ev){ el.addEventListener(ev, off); });
    el.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  }
  bindTouch("tcLeft","left"); bindTouch("tcRight","right"); bindTouch("tcJump","jump"); bindTouch("tcFire","fire");

  // ---------- boucle : requestAnimationFrame + delta-time, physique à pas fixe ----------
  function frame(ts){
    if(!running) return;
    raf=requestAnimationFrame(frame);
    var dt=Math.min(0.1,(ts-last)/1000); last=ts;
    if(phase==="PLAY"){
      acc+=dt;
      while(acc>=FIXED){ step(FIXED); acc-=FIXED; if(phase!=="PLAY"){ acc=0; break; } }
    }
    if(L){ animT+=dt; updateFx(dt); updateCamera(dt); render(); }
  }

  function step(h){
    var p=P, i;
    p.inv=Math.max(0,p.inv-h); p.stun=Math.max(0,p.stun-h); p.coyote-=h; p.jumpBuf-=h; shotCd-=h; p.spring=Math.max(0,p.spring-h);
    for(i=0;i<L.crystals.length;i++) L.crystals[i].cd=Math.max(0,L.crystals[i].cd-h);
    if(p.shield>0){ var s0=Math.ceil(p.shield); p.shield=Math.max(0,p.shield-h); if(Math.ceil(p.shield)!==s0) hud(); if(p.shield===0) say("Bouclier PCA terminé"); }

    // --- chrono RTO : suspense quand il reste peu de temps ---
    L.time-=h;
    var sec=Math.ceil(L.time);
    if(sec!==lastSec){ lastSec=sec; hudTime();
      if(sec===30 && !warned){ warned=true; say("⚠ RTO bientôt dépassé : 30 s !"); Sfx.alarm(); }
      if(sec<=10 && sec>0) Sfx.tick(); }
    if(L.time<=0){ L.time=60; warned=false; hurt("time"); if(phase!=="PLAY") return; say("RTO dépassé : −1 vie, +60 s pour finir"); }

    // --- vague de ransomware : avance depuis la gauche ---
    if(L.wave){ var w=L.wave;
      if(w.delay>0) w.delay-=h; else w.x+=w.speed*h;
      if(p.x < w.x){ hurt("wave"); if(phase!=="PLAY") return; } }

    // --- déplacement horizontal ---
    var dir = p.stun>0 ? 0 : (input.right?1:0)-(input.left?1:0);
    if(dir){ p.vx=clamp(p.vx+dir*ACC*h,-MAXV,MAXV); p.face=dir; }
    else if(p.stun<=0){ var f=(p.onGround?FRIC:FRIC_AIR)*h; p.vx = p.vx>0 ? Math.max(0,p.vx-f) : Math.min(0,p.vx+f); }
    // --- saut (coyote time + buffer), hauteur variable ---
    if(p.onGround) p.coyote=COYOTE;
    if(p.jumpBuf>0 && p.coyote>0){ p.vy=-JUMP; p.jumpBuf=0; p.coyote=0; p.onGround=false; Sfx.jump(); }
    var g = GRAV*((p.vy<0 && !input.jump)?2.2:1);
    p.vy=Math.min(MAXFALL, p.vy+g*h);

    // --- collisions tilemap, axe par axe (+ blocs frappés par-dessous) ---
    p.x+=p.vx*h; collideX(p);
    p.onGround=false;
    p.y+=p.vy*h;
    if(p.vy<0) headBump(p);
    collideY(p);

    // dernière position sûre (respawn après un piège ou un trou)
    p.safeT-=h;
    if(p.onGround && p.safeT<=0){
      var tx=Math.floor((p.x+p.w/2)/T), ty=Math.floor((p.y+p.h-1)/T);
      if(solidAt(Math.floor(p.x/T),ty+1) && solidAt(Math.floor((p.x+p.w-1)/T),ty+1) &&
         L.grid[ty][tx-1]!=="^" && L.grid[ty][tx]!=="^" && L.grid[ty][tx+1]!=="^" &&
         (!L.wave || p.x > L.wave.x+40)){ p.safeX=p.x; p.safeY=p.y; p.safeT=0.2; }
    }

    // --- ressorts, piques ---
    var x0=Math.floor(p.x/T), x1=Math.floor((p.x+p.w-1)/T), y0=Math.floor(p.y/T), y1=Math.floor((p.y+p.h-1)/T);
    for(var ty2=y0;ty2<=y1;ty2++) for(var tx2=x0;tx2<=x1;tx2++){
      if(ty2<0||ty2>=L.H) continue;
      var c=L.grid[ty2][tx2];
      if(c==="H" && p.vy>=0){ p.vy=-SPRING; p.onGround=false; p.spring=0.25; spark(tx2*T+9, ty2*T+9, "#ff8a8a", 6); Sfx.spring(); }
      else if(c==="^" && p.shield<=0 && p.y+p.h > ty2*T+9 && p.x+p.w-2 > tx2*T+2 && p.x+2 < tx2*T+T-2){ hurt("spike"); if(phase!=="PLAY") return; }
    }
    // --- ennemis, bonus, tirs ---
    updateEnemies(h); if(phase!=="PLAY") return;
    updateItems(h);
    updateShots(h);
    // --- octets (pièces) ---
    for(i=0;i<L.coins.length;i++){ var co=L.coins[i]; if(co.taken) continue;
      if(overlap(p,co)){ co.taken=true; run.coins++; run.score+=10; animScore("advScore", run.score); Sfx.coin(); spark(co.x+5,co.y+5,"#ffd23f",5);
        if(run.coins%COINS_FOR_LIFE===0) gainLife("+1 vie : "+run.coins+" octets récupérés !"); else hud(); } }
    // --- clés de déchiffrement (secret) ---
    for(i=0;i<L.keys.length;i++){ var ky=L.keys[i]; if(ky.taken) continue;
      if(overlap(p,ky)){ ky.taken=true; run.keys++; run.score+=500; animScore("advScore", run.score); Sfx.key(); spark(ky.x+7,ky.y+7,"#ffd23f",20);
        pop(ky.x+7, ky.y-4, "+500"); say("🔑 Clé de déchiffrement "+run.keys+"/"+LEVELS.length+" trouvée !", 3); hud(); } }
    // --- cristaux ---
    for(i=0;i<L.crystals.length;i++){
      var cr=L.crystals[i]; if(cr.taken||cr.cd>0) continue;
      if(p.x+p.w>cr.x+3 && p.x<cr.x+T-3 && p.y+p.h>cr.y+3 && p.y<cr.y+T-3){ openQuestion(cr); return; }
    }
    // --- sortie ---
    var ex=L.exit;
    if(ex && p.x+p.w>ex.tx*T+4 && p.x<ex.tx*T+T-4 && p.y+p.h>(ex.ty-1)*T && p.y<(ex.ty+1)*T){
      if(collected()>=L.total){ levelClear(); return; }
      if(msgT<=0.2) say("Il reste "+(L.total-collected())+" cristal"+(L.total-collected()>1?"ux":"")+" à collecter !");
    }
    // --- chute dans le vide ---
    if(p.y>L.H*T+30){ hurt("pit"); }
  }

  function overlap(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
  function collideX(p){
    var hit=false, x0=Math.floor(p.x/T), x1=Math.floor((p.x+p.w-1e-3)/T), y0=Math.floor(p.y/T), y1=Math.floor((p.y+p.h-1e-3)/T);
    for(var ty=y0;ty<=y1;ty++) for(var tx=x0;tx<=x1;tx++) if(solidAt(tx,ty)){
      if(p.vx>0) p.x=tx*T-p.w; else if(p.vx<0) p.x=(tx+1)*T; p.vx=0; hit=true;
    }
    return hit;
  }
  function collideY(p){
    var hit=false, x0=Math.floor(p.x/T), x1=Math.floor((p.x+p.w-1e-3)/T), y0=Math.floor(p.y/T), y1=Math.floor((p.y+p.h-1e-3)/T);
    for(var ty=y0;ty<=y1;ty++) for(var tx=x0;tx<=x1;tx++) if(solidAt(tx,ty)){
      if(p.vy>0){ p.y=ty*T-p.h; p.onGround=true; } else if(p.vy<0){ p.y=(ty+1)*T; } p.vy=0; hit=true;
    }
    return hit;
  }

  // ---------- blocs bonus frappés par-dessous ----------
  function headBump(p){
    var ty=Math.floor(p.y/T); if(ty<0||ty>=L.H) return;
    var cx=Math.floor((p.x+p.w/2)/T), cand=[cx, Math.floor(p.x/T), Math.floor((p.x+p.w-1)/T)];
    for(var i=0;i<cand.length;i++){ var tx=cand[i], c=L.grid[ty][tx];
      if(c==="?"){ hitBlock(tx,ty, p.fire ? "shield" : "fire"); return; }
      if(c==="u"){ hitBlock(tx,ty,"heart"); say("Bloc secret découvert !"); return; }
      if(c==="b"){ Sfx.bump(); return; }
    }
  }
  function hitBlock(tx,ty,kind){
    L.grid[ty][tx]="b"; bumps.push({tx:tx,ty:ty,t:0.18}); Sfx.bump();
    // l'ennemi posé sur le bloc est éjecté (comme dans les classiques)
    L.enemies.forEach(function(e){ if(e.alive && e.x+e.w>tx*T && e.x<tx*T+T && Math.abs((e.y+e.h)-ty*T)<3) killEnemy(e,100); });
    items.push({kind:kind, x:tx*T+3, y:ty*T-13, w:12, h:12, vx:(kind==="heart"?50:40)*(P.face||1), vy:-160, onGround:false});
    setTimeout(function(){ if(state===STATE.ADVENTURE) Sfx.power(); }, 90);
  }
  function updateItems(h){
    for(var i=items.length-1;i>=0;i--){ var it=items[i];
      it.vy=Math.min(MAXFALL, it.vy+GRAV*.8*h);
      var vx=it.vx; it.x+=it.vx*h; if(collideX(it)) it.vx=-vx;          // rebondit sur les murs
      it.onGround=false; it.y+=it.vy*h; collideY(it);
      if(it.y>L.H*T+40){ items.splice(i,1); continue; }
      if(overlap(P,it)){ items.splice(i,1); grant(it.kind, it.x+6, it.y); }
    }
  }
  function grant(kind, x, y){
    if(kind==="fire"){ P.fire=true; say("🔥 Pare-feu activé : F / X (ou 🔥) pour tirer !", 3.2); }
    else if(kind==="shield"){ P.shield=SHIELD_TIME; say("🛡 Bouclier PCA : invulnérable "+SHIELD_TIME+" s !", 2.6); }
    else if(kind==="heart"){ gainLife("❤ Cœur secret : +1 vie !"); }
    run.score+=200; animScore("advScore", run.score); pop(x, y-4, "+200"); spark(x, y+6, "#ffd23f", 14); Sfx.power(); hud();
  }
  function gainLife(msg){ if(run.lives<MAX_LIVES) run.lives++; Sfx.life(); say(msg, 2.6); hud(); }

  // ---------- pare-feu : boules de feu ----------
  function shoot(){
    if(!P) return;
    if(!P.fire){ if(msgT<=0.2) say("Frappe un bloc « ! » par-dessous pour obtenir le pare-feu"); return; }
    if(shotCd>0 || shots.length>=3) return;
    shotCd=0.22; Sfx.fire();
    shots.push({x:P.x+(P.face>0?P.w:-6), y:P.y+5, w:6, h:6, vx:P.face*230, vy:40, life:1.6, onGround:false});
  }
  function updateShots(h){
    for(var i=shots.length-1;i>=0;i--){ var s=shots[i]; s.life-=h;
      s.vy=Math.min(400, s.vy+1100*h);
      s.x+=s.vx*h; var wall=collideX(s);
      var vyBefore=s.vy; s.y+=s.vy*h; collideY(s);
      if(vyBefore>0 && s.vy===0) s.vy=-210;                              // rebondit au sol
      var dead = wall || s.life<=0 || s.y>L.H*T+20;
      for(var j=0;j<L.enemies.length && !dead;j++){ var e=L.enemies[j];
        if(e.alive && overlap(s,e)){ killEnemy(e,100); dead=true; } }
      if(dead){ spark(s.x+3,s.y+3,"#ff9a3c",6); shots.splice(i,1); }
    }
  }
  function killEnemy(e, pts){
    e.alive=false; e.dead=0; run.score+=pts; animScore("advScore", run.score);
    pop(e.x+e.w/2, e.y-4, "+"+pts); spark(e.x+e.w/2, e.y+e.h/2, "#ffffff", 8); Sfx.stomp();
  }

  function updateEnemies(h){
    var p=P;
    for(var i=0;i<L.enemies.length;i++){
      var e=L.enemies[i];
      if(!e.alive){ e.dead+=h; continue; }
      if(e.type==="B"){                                   // chauve-souris : va-et-vient + ondulation
        e.x+=e.dir*e.speed*h; if(Math.abs(e.x-e.x0)>T*4 || solidAt(Math.floor((e.x+(e.dir>0?e.w:0))/T),Math.floor((e.y+6)/T))) e.dir*=-1;
        e.y=e.y0+Math.sin(animT*2.2+e.ph)*10;
      } else {                                            // marcheur : demi-tour au mur ou au bord du vide
        var nx=e.x+e.dir*e.speed*h, fx=e.dir>0? nx+e.w : nx;
        var wall=solidAt(Math.floor(fx/T),Math.floor((e.y+e.h/2)/T));
        var ledge=!solidAt(Math.floor(fx/T),Math.floor((e.y+e.h+2)/T));
        if(wall||ledge) e.dir*=-1; else e.x=nx;
      }
      // contact avec le joueur
      if(overlap(p,e)){
        var falling = p.vy>30 && (p.y+p.h)-e.y < 10;
        if(p.shield>0){ killEnemy(e,100); }
        else if(e.stomp && falling){ killEnemy(e,50); p.vy = input.jump ? -340 : -230; }
        else if(p.inv<=0){ hurt("enemy"); if(phase!=="PLAY") return; }
      }
    }
  }

  // ---------- dégâts ----------
  function hurt(kind){
    if(phase!=="PLAY") return;
    if(kind!=="pit" && kind!=="time" && (P.inv>0 || P.shield>0)){
      if(kind==="wave" && L.wave) L.wave.x = Math.min(L.wave.x, P.x-30);   // le bouclier protège mais la vague reste au contact
      return;
    }
    run.lives--; run.combo=0; shakeT=0.3; Sfx.hurt();
    if(P.fire && !rootMode){ P.fire=false; say("Pare-feu perdu !"); }
    hud();
    if(run.lives<=0){ gameOver(); return; }
    if(kind==="enemy"){ P.vy=-220; P.vx=-P.face*140; P.stun=0.25; P.inv=1.6; }
    else if(kind==="wave"){ L.wave.x-=110; P.vy=-200; P.vx=150; P.stun=0.25; P.inv=1.6; say("Le chiffrement t'a rattrapé : −1 vie !"); }
    else if(kind==="time"){ P.inv=1.2; }
    else { P.x=P.safeX; P.y=P.safeY; P.vx=0; P.vy=0; P.inv=1.6; snapCamera();
      if(L.wave && L.wave.x > P.x-60) L.wave.x = P.x-90; }       // on ne réapparaît jamais dans la zone chiffrée
  }
  function gameOver(){
    phase="OVER";
    showOv("Mission échouée","Plus de vies","Le SI de CampusCloud reste vulnérable… Révise les explications et retente ta chance.","","Voir le résultat",function(){ hideOv(); finishRun(false); });
  }

  // ---------- cristal → QCM ----------
  function openQuestion(cr){
    phase="QUESTION"; curCrystal=cr; releaseAll();
    var pick=Pool.next(L.def.themes); setTheme(pick.theme.color);
    $("qTag").textContent=pick.theme.name;
    $("qQuestion").textContent=pick.q.q;
    $("qExplain").className="explain"; $("qNext").className="next-btn";
    var answeredQ=false, order;
    order=paintAnswers($("qAnswers"), pick.q, function(correct, btn){
      if(answeredQ) return; answeredQ=true; run.asked++; recordAnswer(pick.theme, correct);
      revealAnswers($("qAnswers"), pick.q, order);
      var ex=$("qExplain"), v=$("qVerdict"), tx=$("qText");
      if(correct){
        btn.classList.remove("dim"); btn.classList.add("correct"); Sfx.good();
        run.combo++; if(run.combo>run.bestCombo) run.bestCombo=run.combo; run.correct++;
        var pts=100*Math.min(5,run.combo); run.score+=pts; animScore("advScore", run.score);
        cr.taken=true; spark(cr.x+9, cr.y+9, "#4cc9ff", 16); pop(cr.x+9, cr.y-2, "+"+pts);
        if(L.wave) L.wave.x-=60;                          // bonne réponse = restauration : le chiffrement recule
        ex.className="explain good show"; v.textContent=run.combo>=2?("Cristal validé ! x"+Math.min(5,run.combo)):"Cristal validé !";
      } else {
        btn.classList.remove("dim"); btn.classList.add("wrong"); Sfx.bad();
        run.combo=0; run.lives--; shakeBody();
        recordMiss(pick.theme, pick.q, btn.lastChild.textContent);
        cr.cd=2.2;                                         // le cristal reste, avec une autre question au prochain essai
        ex.className="explain bad show"; v.textContent="Raté — −1 vie";
      }
      tx.textContent=pick.q.e; hud();
      var nb=$("qNext"); nb.textContent = run.lives<=0 ? "Voir le résultat ▶" : "Continuer ▶"; nb.classList.add("show"); nb.focus({preventScroll:true});
    });
    $("qModal").classList.add("show");
    $("qModal").scrollTop=0;
    qAnswered=function(){ return answeredQ; };
  }
  var qAnswered=function(){ return false; };
  function closeModal(){ $("qModal").classList.remove("show"); }
  function questionDone(){
    closeModal();
    if(run.lives<=0){ gameOver(); return; }
    var cr=curCrystal;
    if(!cr.taken){ P.vx=-P.face*150; P.vy=-200; P.stun=0.25; P.inv=1.2; }     // « on recule »
    else if(collected()>=L.total){ say("Tous les cristaux sont validés — rejoins le drapeau !"); }
    phase="PLAY"; last=performance.now(); acc=0;
  }
  $("qNext").addEventListener("click", function(){ if(phase==="QUESTION" && qAnswered()) questionDone(); });

  // ---------- fin de niveau ----------
  function levelClear(){
    phase="CLEAR"; releaseAll(); Sfx.clear();
    var tb=Math.max(0,Math.floor(L.time))*5, bonus=250+run.lives*50+tb; run.score+=bonus; run.levelsDone++; animScore("advScore", run.score);
    var last_=levelIdx>=LEVELS.length-1;
    if(!last_ && run.lives<run.maxLives) run.lives++;
    hud(); spark(P.x+6,P.y+6,"#2ef0a6",20);
    var detail="Bonus : 250 + 50 par vie + 5 par seconde de RTO restante ("+tb+").";
    if(last_){
      var secret = run.keys>=LEVELS.length;
      if(secret){ run.score+=1000; animScore("advScore", run.score); run.secret=true; }
      showOv(secret?"🔑 Fin secrète débloquée":"Mission accomplie",
        secret?"Les 3 clés de déchiffrement !":"Les 3 niveaux sont validés !",
        detail+" "+(secret?"+1000 pts : le SI de CampusCloud est restauré sans payer la rançon. Bravo, Directeur de crise !":"Le SI de CampusCloud est résilient… mais 3 clés de déchiffrement restent cachées quelque part."),
        "","Voir le résultat",function(){ hideOv(); finishRun(true); });
    } else {
      showOv("Niveau "+(levelIdx+1)+" terminé","+"+bonus+" pts",detail+" Une vie récupérée pour la suite.","","Niveau suivant ▶",function(){ hideOv(); loadLevel(levelIdx+1); });
    }
  }

  // ---------- pause ----------
  function pause(){
    if(phase!=="PLAY") return;
    phase="PAUSE"; releaseAll();
    showOv("Pause","Jeu en pause","","","▶ Reprendre",resume,"⌂ Menu",function(){ hideOv(); go(STATE.TITLE); });
  }
  function resume(){ if(phase!=="PAUSE") return; hideOv(); phase="PLAY"; last=performance.now(); acc=0; }

  // ---------- effets visuels ----------
  function spark(x,y,col,n){ if(prefersReduced) n=Math.min(n,4);
    for(var i=0;i<n;i++){ var a=Math.random()*6.283, s=30+Math.random()*70; parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life:.5+Math.random()*.3,col:col}); } }
  function pop(x,y,txt){ pops.push({x:x,y:y,txt:txt,life:1}); }
  function updateFx(dt){
    for(var i=parts.length-1;i>=0;i--){ var q=parts[i]; q.life-=dt; if(q.life<=0){ parts.splice(i,1); continue; } q.x+=q.vx*dt; q.y+=q.vy*dt; q.vy+=260*dt; }
    for(i=pops.length-1;i>=0;i--){ var o=pops[i]; o.life-=dt; if(o.life<=0){ pops.splice(i,1); continue; } o.y-=22*dt; }
    for(i=bumps.length-1;i>=0;i--){ bumps[i].t-=dt; if(bumps[i].t<=0) bumps.splice(i,1); }
    if(shakeT>0) shakeT-=dt;
    if(msgT>0){ msgT-=dt; if(msgT<=0) $("advMsg").classList.remove("show"); }
    // retire les ennemis écrasés après l'animation
    if(L) for(i=L.enemies.length-1;i>=0;i--){ var e=L.enemies[i]; if(!e.alive && e.dead>0.5) L.enemies.splice(i,1); }
  }

  // ---------- caméra (suit le joueur ; lissée sauf reduced-motion) ----------
  function camTarget(){
    var w=L.W*T, h=L.H*T;
    var tx = w<=VW ? (w-VW)/2 : clamp(P.x+P.w/2-VW/2+P.face*14, 0, w-VW);
    var ty = h<=VH ? (h-VH)/2 : clamp(P.y+P.h/2-VH*0.55, 0, h-VH);
    return [tx,ty];
  }
  function snapCamera(){ var t=camTarget(); camX=t[0]; camY=t[1]; }
  function updateCamera(dt){ var t=camTarget(); if(prefersReduced){ camX=t[0]; camY=t[1]; return; }
    var k=Math.min(1,dt*7); camX+=(t[0]-camX)*k; camY+=(t[1]-camY)*Math.min(1,dt*5); }

  // ---------- rendu ----------
  function hash(n){ var s=Math.sin(n*127.1)*43758.5453; return s-Math.floor(s); }
  function drawRacks(par, w, gap, hMin, hMax, col, lit){
    var step=w+gap, i0=Math.floor(camX*par/step)-1, i1=i0+Math.ceil(VW/step)+3;
    for(var i=i0;i<=i1;i++){
      var x=Math.round(i*step-camX*par), hh=Math.round(hMin+hash(i+par*10)*(hMax-hMin)), y=VH-hh;
      ctx.fillStyle=col; ctx.fillRect(x,y,w,hh);
      ctx.fillStyle="rgba(255,255,255,.05)"; ctx.fillRect(x,y,w,2);
      for(var r=0;r<Math.floor(hh/12);r++) for(var c=0;c<3;c++){
        var on=hash(i*31+r*7+c)>.55; if(!on) continue;
        var blink = prefersReduced ? 1 : (.55+.45*Math.sin(animT*2+i+r*1.3+c));
        ctx.globalAlpha=blink*.8; ctx.fillStyle=lit[(i+r+c)%lit.length]; ctx.fillRect(x+4+c*8,y+6+r*12,4,2);
      }
      ctx.globalAlpha=1;
    }
  }
  function bumpOffset(tx,ty){ for(var i=0;i<bumps.length;i++) if(bumps[i].tx===tx&&bumps[i].ty===ty) return -Math.sin((1-bumps[i].t/0.18)*Math.PI)*5; return 0; }
  function render(){
    var c=ctx; c.imageSmoothingEnabled=false;
    c.save();
    c.fillStyle=skyGrad; c.fillRect(0,0,VW,VH);
    // étoiles / points de données
    c.fillStyle="rgba(255,255,255,.35)";
    for(var s=0;s<40;s++){ var sx=((hash(s)*VW*3)-camX*0.08)%VW; if(sx<0) sx+=VW; c.fillRect(Math.round(sx),Math.round(hash(s+90)*VH*0.6),1,1); }
    drawRacks(0.22, 34, 40, 60, 115, "rgba(10,5,22,.55)", ["#b06bff","#2ef0a6"]);
    drawRacks(0.45, 30, 56, 34, 80,  "rgba(10,5,22,.8)",  ["#ff2e6a","#36c7d6","#ffab2e"]);

    var sh = (shakeT>0 && !prefersReduced) ? (Math.random()*4-2) : 0;
    c.translate(Math.round(-camX+sh), Math.round(-camY));
    var tx0=Math.max(0,Math.floor(camX/T)), tx1=Math.min(L.W-1,Math.floor((camX+VW)/T)+1);
    var ty0=Math.max(0,Math.floor(camY/T)), ty1=Math.min(L.H-1,Math.floor((camY+VH)/T)+1);
    var i, fr=prefersReduced?0:Math.floor(animT*6);

    // décor (derrière)
    for(i=0;i<L.decor.length;i++){ var d=L.decor[i]; if(d.tx<tx0-1||d.tx>tx1) continue; drawSprite(c,d.s,d.tx*T,d.ty*T,d.tx); }
    // tuiles
    for(var ty=ty0;ty<=ty1;ty++) for(var tx=tx0;tx<=tx1;tx++){
      var ch=L.grid[ty][tx], X=tx*T, Y=ty*T;
      if(ch==="#"){ var above=ty>0?L.grid[ty-1][tx]:"."; drawSprite(c,(above==="#"||above==="=")?"dirt":"grass",X,Y,tx+ty); }
      else if(ch==="="){ var lft=tx>0&&L.grid[ty][tx-1]==="=", rgt=tx<L.W-1&&L.grid[ty][tx+1]==="=";
        drawSprite(c, !lft?"platL":(!rgt?"platR":"platM"), X, Y, tx); }
      else if(ch==="^") drawSprite(c,"spikes",X,Y,0);
      else if(ch==="H") drawSprite(c,(P&&P.spring>0&&Math.abs(P.x+P.w/2-X-9)<14)?"springUp":"spring",X,Y,0);
      else if(ch==="?"){ var by=Y+bumpOffset(tx,ty)+(prefersReduced?0:Math.round(Math.sin(animT*3+tx)*0.6)); drawSprite(c,"qblock",X,by,0); }
      else if(ch==="b") drawSprite(c,"usedBlock",X,Y+bumpOffset(tx,ty),0);
    }
    // sortie : drapeau (grisé tant qu'il reste des cristaux)
    if(L.exit){
      var open=collected()>=L.total, fx=L.exit.tx*T, fy=L.exit.ty*T;
      c.globalAlpha=open?1:.5;
      drawSprite(c,"flagPole",fx,fy,0); drawSprite(c,"flagTop",fx,fy-T,prefersReduced?0:Math.floor(animT*4));
      if(open && !prefersReduced){ c.globalAlpha=.25+.15*Math.sin(animT*5); c.fillStyle="#2ef0a6"; c.beginPath(); c.arc(fx+9,fy-4,16,0,6.283); c.fill(); }
      c.globalAlpha=1;
    }
    // octets, clés
    for(i=0;i<L.coins.length;i++){ var co=L.coins[i]; if(co.taken) continue; drawSprite(c,"coin",co.x-4,co.y-4,prefersReduced?0:Math.floor(animT*5+co.x*.1)); }
    for(i=0;i<L.keys.length;i++){ var ky=L.keys[i]; if(ky.taken) continue;
      var kb=prefersReduced?0:Math.sin(animT*2.5)*2;
      if(!prefersReduced){ c.save(); c.globalAlpha=.25+.15*Math.sin(animT*6); c.fillStyle="#ffd23f"; c.beginPath(); c.arc(ky.x+7,ky.y+7+kb,12,0,6.283); c.fill(); c.restore(); }
      drawSprite(c,"key",ky.x-2,ky.y-2+kb,0); }
    // cristaux
    for(i=0;i<L.crystals.length;i++){ var cr=L.crystals[i]; if(cr.taken) continue;
      if(cr.tx<tx0-1||cr.tx>tx1+1) continue;
      var bob = prefersReduced ? 0 : Math.sin(animT*3+cr.tx)*2;
      c.globalAlpha=(cr.cd>0)?.4:1;
      if(!prefersReduced){ c.save(); c.globalAlpha*=.22+.1*Math.sin(animT*4+cr.tx); c.fillStyle="#4cc9ff"; c.beginPath(); c.arc(cr.x+9,cr.y+9+bob,13,0,6.283); c.fill(); c.restore(); }
      drawSprite(c,"crystal",cr.x,cr.y+bob,0); c.globalAlpha=1;
    }
    // bonus en mouvement
    for(i=0;i<items.length;i++){ var it=items[i], nm={fire:"fireItem",shield:"shieldItem",heart:"heart"}[it.kind];
      if(it.kind!=="heart" && !prefersReduced){ c.save(); c.globalAlpha=.35; c.fillStyle=it.kind==="fire"?"#ff7a1a":"#4cc9ff"; c.beginPath(); c.arc(it.x+6,it.y+6,10,0,6.283); c.fill(); c.restore(); }
      drawSprite(c,nm,it.kind==="heart"?it.x-3:it.x,it.kind==="heart"?it.y-3:it.y,0); }
    // ennemis
    for(i=0;i<L.enemies.length;i++){ var e=L.enemies[i];
      var ex=Math.round(e.x+e.w/2-12), ey=Math.round(e.y+e.h-23);
      if(!e.alive){ c.globalAlpha=Math.max(0,1-e.dead*2); drawSprite(c, e.type==="Z"?"spiky":"walkerDead",ex,ey+e.dead*30,0,e.dir<0); c.globalAlpha=1; continue; }
      drawSprite(c, e.type==="E"?"walker":(e.type==="Z"?"spiky":"bat"), ex, ey, fr, e.dir>0);
      if(DEBUG){ c.strokeStyle="#f0f"; c.strokeRect(e.x+.5,e.y+.5,e.w-1,e.h-1); }
    }
    // boules de feu
    for(i=0;i<shots.length;i++){ var so=shots[i];
      c.fillStyle="#ffd23f"; c.beginPath(); c.arc(so.x+3,so.y+3,3.5,0,6.283); c.fill();
      c.fillStyle="#ff5a1a"; c.beginPath(); c.arc(so.x+3-so.vx*.008,so.y+3,2.5,0,6.283); c.fill(); }
    // joueur (aura pare-feu / bouclier)
    var p=P;
    if(p){
      var pcx=p.x+p.w/2, pcy=p.y+p.h/2-2;
      if(p.shield>0 && (p.shield>2 || Math.floor(animT*10)%2===0)){
        c.save(); c.globalAlpha=.35+(prefersReduced?0:.12*Math.sin(animT*8)); c.strokeStyle="#4cc9ff"; c.lineWidth=2;
        c.beginPath(); c.arc(pcx,pcy,14,0,6.283); c.stroke(); c.globalAlpha=.12; c.fillStyle="#4cc9ff"; c.fill(); c.restore(); }
      else if(p.fire && !prefersReduced){ c.save(); c.globalAlpha=.18+.08*Math.sin(animT*9); c.fillStyle="#ff7a1a"; c.beginPath(); c.arc(pcx,pcy,13,0,6.283); c.fill(); c.restore(); }
      var blink = p.inv>0 && !prefersReduced && (Math.floor(p.inv*14)%2===0);
      if(!blink){
        if(p.inv>0&&prefersReduced) c.globalAlpha=.5;
        var nm2 = !p.onGround ? "playerJump" : (Math.abs(p.vx)>12 ? "playerWalk" : "playerIdle");
        drawSprite(c, nm2, Math.round(p.x+p.w/2-12), Math.round(p.y+p.h-23), Math.floor(animT*10), p.face<0);
        c.globalAlpha=1;
      }
      if(DEBUG){ c.strokeStyle="#0f0"; c.strokeRect(p.x+.5,p.y+.5,p.w-1,p.h-1); }
    }
    // vague de ransomware : zone chiffrée + front lumineux
    if(L.wave && L.wave.x>camX-10){
      var wx=L.wave.x, y0=camY, wh=VH;
      c.save(); c.globalAlpha=.55; c.fillStyle="#3a0d52"; c.fillRect(camX-10,y0,wx-camX+10,wh);
      c.globalAlpha=.9; c.fillStyle="#b06bff";
      for(var gy=0;gy<wh;gy+=6){ var gw=4+Math.floor(hash(gy+Math.floor(animT*12))*14); c.fillRect(wx-gw, y0+gy, gw, 3); }
      c.globalAlpha=.35; c.fillStyle="#ff2e6a";
      for(var gz=0;gz<18;gz++){ var gx=camX+hash(gz*3.1+Math.floor(animT*8))*(wx-camX), gyy=y0+hash(gz*7.7)*wh; c.fillRect(gx,gyy,3,3); }
      c.globalAlpha=1; c.font="bold 8px 'Chakra Petch', monospace"; c.fillStyle="#ffd6ff"; c.textAlign="right";
      if(wx-camX>60) c.fillText("🔒 CHIFFRÉ", wx-6, y0+14);
      c.restore();
    }
    // particules + textes flottants
    for(i=0;i<parts.length;i++){ var q=parts[i]; c.globalAlpha=Math.max(0,q.life*2); c.fillStyle=q.col; c.fillRect(Math.round(q.x),Math.round(q.y),2,2); }
    c.globalAlpha=1; c.font="bold 9px 'Chakra Petch', monospace"; c.textAlign="center";
    for(i=0;i<pops.length;i++){ var o=pops[i]; c.globalAlpha=Math.min(1,o.life*2); c.fillStyle="#2ef0a6"; c.fillText(o.txt,Math.round(o.x),Math.round(o.y)); }
    c.globalAlpha=1;
    c.restore();
    // chrono critique : liseré rouge qui pulse
    if(L.time<=10 && phase==="PLAY" && !prefersReduced){ c.save(); c.globalAlpha=.25+.2*Math.sin(animT*10); c.strokeStyle="#ff2e6a"; c.lineWidth=4; c.strokeRect(2,2,VW-4,VH-4); c.restore(); }
  }

  return {
    start:start, stop:stop, pause:pause, resume:resume,
    onKey:onKey,
    phase:function(){ return phase; },
    enableRoot:function(){ if(P){ P.fire=true; hud(); } },
    ovPrimary:function(){ if(ovAction1 && ovReady() && $("ov").classList.contains("show")) { ovAction1(); return true; } return false; },
    questionKey:function(k){
      if(phase!=="QUESTION") return false;
      if(!qAnswered()){ var map={"1":0,"2":1,"3":2,"4":3,"a":0,"b":1,"c":2,"d":3}; if(k in map){ var b=$("qAnswers").children[map[k]]; if(b) b.click(); } return true; }
      if(k==="enter"||k===" "){ questionDone(); } return true;
    },
    _load:function(i){ loadLevel(i); hideOv(); phase="PLAY"; },
    _dbg:function(){ return {L:L,P:P,run:run,phase:phase,items:items,shots:shots}; }
  };
})();
