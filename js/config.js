// ======================================================================
// CONFIGURATION — le seul fichier à modifier pour régler le jeu
// ======================================================================
"use strict";

// ---------- Classement en ligne (optionnel) ----------
// GitHub Pages ne sert que des fichiers statiques : pour PARTAGER les scores entre joueurs,
// il faut une petite base en ligne. Le jeu sait parler à Supabase (gratuit, API REST).
// Renseigne url + anonKey (voir README, section « Classement en ligne »).
// Laissés vides (ou si le service est injoignable), le classement reste LOCAL à l'appareil.
var LEADERBOARD = {
  url: "",          // ex. "https://abcdefgh.supabase.co"
  anonKey: "",      // clé publique « anon » du projet (faite pour être visible côté navigateur)
  table: "scores"
};

// ---------- Réglages des parties ----------
var GAME = {
  quizLength: 20,     // questions par partie de Quiz
  quizTime: 16,       // secondes par question
  quizTimeHard: 30,   // secondes pour les questions de difficulté 3 (calcul / piège)
  examLength: 40,     // questions de l'examen blanc (format du QCM final)
  examMinutes: 60     // durée de l'examen blanc
};
