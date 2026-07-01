@echo off
REM ════════════════════════════════════════════════
REM   OtaTrack — Lancement (Windows)
REM   Double-cliquez sur ce fichier pour démarrer
REM ════════════════════════════════════════════════

echo.
echo   ========================================
echo      OtaTrack - Demarrage en cours...
echo   ========================================
echo.

REM Vérifie que Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo   [ERREUR] Node.js n'est pas installe.
  echo   Telechargez-le sur https://nodejs.org puis relancez ce fichier.
  echo.
  pause
  exit /b
)

REM Installe les dépendances si nécessaire
if not exist "node_modules" (
  echo   Premiere utilisation : installation des composants...
  echo   (cela peut prendre 1-2 minutes)
  echo.
  call npm install
)

echo.
echo   Lancement du site... La page va s'ouvrir dans votre navigateur.
echo   Pour arreter : fermez cette fenetre.
echo.

call npm run dev
pause
