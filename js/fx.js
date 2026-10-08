// ======================================================================
// EFFETS VISUELS — menace 3D du Quiz (Canvas 2D) et réseau de particules en fond
// ======================================================================
"use strict";

// ======================================================================
// 1. MENACE 3D — icosaèdre filaire dessiné en Canvas 2D (aucune dépendance)
//    Projection perspective maison : rotation, pulsation, couleur du thème,
//    explosion en particules. API : core.setColor(hex), core.explode().
// ======================================================================
var core = { ok:false };
(function(){
  try{
    var cv=$("core"), c=cv.getContext("2d"); if(!c) return;
    // --- géométrie : icosaèdre subdivisé une fois (42 sommets, 120 arêtes) ---
    var t=(1+Math.sqrt(5))/2, V=[], E={}, edges=[];
    [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]]
      .forEach(function(v){ V.push(norm(v)); });
    var F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
           [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    function norm(v){ var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); return [v[0]/l,v[1]/l,v[2]/l]; }
    var mids={};
    function mid(a,b){ var k=a<b?a+"_"+b:b+"_"+a; if(mids[k]===undefined){ var p=V[a],q=V[b]; V.push(norm([(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2])); mids[k]=V.length-1; } return mids[k]; }
    function edge(a,b){ var k=a<b?a+"_"+b:b+"_"+a; if(!E[k]){ E[k]=1; edges.push([a,b]); } }
    F.forEach(function(f){ var a=mid(f[0],f[1]), b=mid(f[1],f[2]), d=mid(f[2],f[0]);
      [[f[0],a,d],[a,f[1],b],[d,b,f[2]],[a,b,d]].forEach(function(s){ edge(s[0],s[1]); edge(s[1],s[2]); edge(s[2],s[0]); }); });

    // --- particules d'explosion ---
    var PN=140, parts=[];
    for(var i=0;i<PN;i++){ var th=Math.random()*6.283, ph=Math.acos(2*Math.random()-1), sp=.6+Math.random()*1.6;
      parts.push({vx:Math.sin(ph)*Math.cos(th)*sp, vy:Math.sin(ph)*Math.sin(th)*sp, vz:Math.cos(ph)*sp, x:0,y:0,z:0}); }

    function hex2rgb(h){ var n=parseInt(h.replace("#",""),16); return [(n>>16)&255,(n>>8)&255,n&255]; }
    var cur=hex2rgb("#b06bff"), tgt=cur.slice();
    var rx=0, ry=0, exploding=false, et=0, last=0;
    core.setColor=function(hex){ tgt=hex2rgb(hex); };
    core.explode=function(){ if(prefersReduced) return; exploding=true; et=0;
      parts.forEach(function(p){ p.x=p.y=p.z=0; }); };

    function loop(ts){
      requestAnimationFrame(loop);
      if(state!==STATE.QUIZ){ last=ts; return; }             // pas de rendu hors du mode Quiz
      var dt=Math.min(.05,((ts-(last||ts))/1000)); last=ts; var k=dt*60;   // k = « images à 60 FPS »
      var dpr=Math.min(2,devicePixelRatio||1), w=cv.clientWidth||220, h=cv.clientHeight||220;
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
      c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,w,h);
      for(var j=0;j<3;j++) cur[j]+=(tgt[j]-cur[j])*Math.min(1,.08*k);
      var col="rgb("+(cur[0]|0)+","+(cur[1]|0)+","+(cur[2]|0)+")";
      if(!prefersReduced){ ry+=.006*k; rx+=.0024*k; }
      var s = 1+(prefersReduced?0:Math.sin(ts*.004)*.04);
      if(exploding){ et+=k; s=Math.max(0,1-et/18); if(et>58){ exploding=false; } }
      var cx=w/2, cy=h/2, R=Math.min(w,h)*.36*s, cam=3.1;
      var sy=Math.sin(ry), cy_=Math.cos(ry), sx=Math.sin(rx), cx_=Math.cos(rx);
      function proj(v,r){ var x=v[0]*cy_+v[2]*sy, z=-v[0]*sy+v[2]*cy_, y=v[1]*cx_-z*sx; z=v[1]*sx+z*cx_;
        var f=cam/(cam-z); return [cx+x*r*f, cy+y*r*f, z]; }
      if(R>1){
        // noyau plein
        var g=c.createRadialGradient(cx-R*.25,cy-R*.3,R*.1,cx,cy,R*.95);
        g.addColorStop(0,"rgba(80,40,140,.75)"); g.addColorStop(1,"rgba(42,17,80,.5)");
        c.fillStyle=g; c.beginPath(); c.arc(cx,cy,R*.88,0,6.283); c.fill();
        // arêtes : celles de l'arrière sont plus discrètes
        var P=V.map(function(v){ return proj(v,R); });
        c.lineWidth=1.1; c.strokeStyle=col;
        for(var e=0;e<edges.length;e++){ var a=P[edges[e][0]], b=P[edges[e][1]];
          c.globalAlpha = (a[2]+b[2])/2 > 0 ? .95 : .3;
          c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
        c.globalAlpha=1;
      }
      if(exploding){                                     // éclats qui s'éloignent et s'estompent
        var R0=Math.min(w,h)*.36; c.fillStyle=col; c.globalAlpha=Math.max(0,1-et/55);
        parts.forEach(function(p){ p.x+=p.vx*.04*k; p.y+=p.vy*.04*k; p.z+=p.vz*.04*k;
          var q=proj([p.x,p.y,p.z],R0); c.fillRect(q[0]-1.5,q[1]-1.5,3,3); });
        c.globalAlpha=1;
      }
    }
    core.ok=true; requestAnimationFrame(loop);
  }catch(e){ core.ok=false; }
})();

// ---------- particules d'arrière-plan (léger, coupé pendant l'aventure) ----------
(function(){
  var cv=$("bgfx"), ctx=cv.getContext("2d"), W,H,DPR,nodes=[];
  function resize(){ DPR=Math.min(2,devicePixelRatio||1); W=cv.width=innerWidth*DPR;H=cv.height=innerHeight*DPR;
    cv.style.width=innerWidth+"px";cv.style.height=innerHeight+"px"; }
  resize(); addEventListener("resize",resize);
  var N=innerWidth<700?22:40;
  for(var i=0;i<N;i++)nodes.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0003,vy:(Math.random()-.5)*.0003});
  function draw(){
    requestAnimationFrame(draw);
    if(state===STATE.ADVENTURE) return;
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<nodes.length;i++){var n=nodes[i];n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>1)n.vx*=-1;if(n.y<0||n.y>1)n.vy*=-1;}
    for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var a=nodes[i],b=nodes[j],dx=(a.x-b.x)*W,dy=(a.y-b.y)*H,d=Math.sqrt(dx*dx+dy*dy),lim=130*DPR;
      if(d<lim){ctx.strokeStyle="rgba(176,107,255,"+(.1*(1-d/lim)).toFixed(3)+")";ctx.lineWidth=DPR*.6;ctx.beginPath();ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);ctx.stroke();}}
    for(var i=0;i<nodes.length;i++){var n=nodes[i];ctx.fillStyle="rgba(176,107,255,.5)";ctx.beginPath();ctx.arc(n.x*W,n.y*H,DPR*1.3,0,6.283);ctx.fill();}
  }
  if(!prefersReduced) draw(); else cv.style.opacity=".25";
})();
