#!/bin/bash
# ════════════════════════════════════════════════
#   OtaTrack — Lancement (Mac / Linux)
#   Dans un terminal : ./LANCER-Mac-Linux.command
#   (ou double-clic sur Mac)
# ════════════════════════════════════════════════

cd "$(dirname "$0")"

echo ""
echo "  ========================================"
echo "     OtaTrack - Démarrage en cours..."
echo "  ========================================"
echo ""

# Vérifie Node.js
if ! command -v node &> /dev/null; then
  echo "  [ERREUR] Node.js n'est pas installé."
  echo "  Téléchargez-le sur https://nodejs.org puis relancez."
  echo ""
  read -p "Appuyez sur Entrée pour fermer..."
  exit 1
fi

# Installe les dépendances si besoin
if [ ! -d "node_modules" ]; then
  echo "  Première utilisation : installation des composants..."
  echo "  (cela peut prendre 1-2 minutes)"
  echo ""
  npm install
fi

echo ""
echo "  Lancement du site... La page va s'ouvrir dans votre navigateur."
echo "  Pour arrêter : Ctrl + C"
echo ""

npm run dev
