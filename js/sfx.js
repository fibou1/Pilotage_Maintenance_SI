"use strict";

// ======================================================================
// SONS — bruitages synthétisés en WebAudio (aucun fichier à charger)
//    Bouton 🔊/🔇 dans les HUD ; préférence mémorisée dans le navigateur.
// ======================================================================
var Sfx = (function(){
  var ac=null, KEY="cybercrise_mute_v1", muted=false;
  try{ muted = localStorage.getItem(KEY)==="1"; }catch(e){}
  function ctx(){
    if(!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } }
    if(ac.state==="suspended") ac.resume();
    return ac;
  }
  function tone(f, dur, type, vol, slideTo, delay){
    if(muted) return; var a=ctx(); if(!a) return;
    var t0=a.currentTime+(delay||0), o=a.createOscillator(), g=a.createGain();
    o.type=type||"square"; o.frequency.setValueAtTime(f,t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,t0+dur);
    g.gain.setValueAtTime(vol||.05,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0+dur+.02);
  }
  function seq(notes, step, type, vol){ notes.forEach(function(n,i){ tone(n, step*1.5, type, vol, 0, i*step); }); }
  var api = {
    jump:   function(){ tone(300,.16,"square",.035,620); },
    coin:   function(){ tone(988,.06,"square",.04); tone(1319,.14,"square",.04,0,.06); },
    bump:   function(){ tone(140,.08,"triangle",.08,90); },
    power:  function(){ seq([523,659,784,1047,1319],.06,"square",.04); },
    fire:   function(){ tone(900,.1,"sawtooth",.03,250); },
    stomp:  function(){ tone(420,.1,"square",.05,120); },
    hurt:   function(){ tone(260,.3,"sawtooth",.05,70); },
    spring: function(){ tone(200,.25,"triangle",.07,900); },
    key:    function(){ seq([784,988,1175,1568],.08,"triangle",.06); },
    life:   function(){ seq([659,784,1319,1047,1175,1568],.07,"square",.035); },
    good:   function(){ seq([659,988],.08,"square",.04); },
    bad:    function(){ seq([311,233],.12,"sawtooth",.04); },
    tick:   function(){ tone(1400,.04,"square",.03); },
    alarm:  function(){ seq([880,660,880,660],.12,"square",.03); },
    clear:  function(){ seq([523,659,784,1047,784,1047,1319],.09,"square",.04); },
    isMuted:function(){ return muted; },
    toggle: function(){ muted=!muted; try{ localStorage.setItem(KEY, muted?"1":"0"); }catch(e){} api.label(); if(!muted) api.coin(); },
    label:  function(){ Array.prototype.forEach.call(document.querySelectorAll(".mute-btn"), function(b){
              b.textContent = muted ? "🔇" : "🔊"; b.setAttribute("aria-label", muted ? "Activer le son" : "Couper le son"); }); }
  };
  return api;
})();
