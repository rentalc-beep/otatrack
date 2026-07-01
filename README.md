# OtaTrack — Plateforme de gestion O'Tacos

Plateforme unifiée : **Espace Terrain** (rapports + tâches pour les assistants) et **Espace Manager** (dashboard, inventaire, fiches produits, pertes).

Stack : **React + Vite** (front-end) et **Supabase** (base de données + stockage photos).

---

## ⚡ Démarrage rapide (mode démo, sans backend)

Le projet fonctionne immédiatement avec **141 produits réels** du fichier d'inventaire, sans rien configurer.

### Le plus simple : double-clic

- **Windows** → double-cliquez sur **`LANCER-Windows.bat`**
- **Mac** → double-cliquez sur **`LANCER-Mac-Linux.command`**

Le script installe tout automatiquement la première fois, puis ouvre le site dans votre navigateur.
(Il faut juste avoir installé Node.js une fois : https://nodejs.org)

### Ou en ligne de commande

```bash
npm install      # une seule fois
npm run dev      # à chaque lancement
```
Le site s'ouvre sur **http://localhost:5173**

---

## 🧭 Les deux espaces (manager + assistants)

C'est **un seul programme** avec deux espaces séparés, accessibles depuis la page d'accueil :

| Espace | Pour qui | Accès direct |
|--------|----------|-------------|
| 📝 **Terrain** | Assistants, responsables | `http://localhost:5173/terrain` |
| 📊 **Manager** | Manager | `http://localhost:5173/manager` |

Sur la tablette des assistants, mettez en favori l'URL `/terrain` → ils arrivent directement sur leur espace.
Le manager utilise `/manager` sur son ordinateur.

**Sur téléphone / tablette**, la barre latérale se transforme en menu animé (bouton « Menu » en haut à droite) — pratique sur le petit écran de la tablette du magasin.

---


## 🌐 Mettre le site en ligne (hébergement gratuit)

### Option recommandée : Vercel
1. Créez un compte sur https://vercel.com
2. Installez l'outil : `npm install -g vercel`
3. Dans le dossier du projet, tapez : `vercel`
4. Suivez les questions (laissez les valeurs par défaut)
5. Votre site est en ligne avec une URL `otatrack.vercel.app`

### Alternative : GitHub Pages / Netlify
```bash
npm run build
```
Le dossier `dist/` contient le site prêt à héberger — uploadez-le sur Netlify Drop ou GitHub Pages.

---

## 🗄️ Activer le vrai backend (Supabase) — quand vous serez prêt

Tant que ce n'est pas fait, le site reste en mode démo. Pour passer aux vraies données :

### 1. Créer un projet Supabase
- Allez sur https://supabase.com → New project (gratuit)
- Notez le mot de passe de la base

### 2. Créer les tables
- Dashboard Supabase → **SQL Editor** → New query
- Copiez tout le contenu de `supabase/schema.sql` → collez → **Run**

### 3. Créer le bucket photos
- Dashboard → **Storage** → New bucket
- Nom : `photos` → cochez **Public** → créer

### 4. Récupérer vos clés
- Dashboard → **Project Settings** → **API**
- Copiez **Project URL** et **anon public key**

### 5. Configurer le projet
- Copiez le fichier `.env.example` en `.env`
- Remplissez avec vos vraies valeurs :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

### 6. Relancer
```bash
npm run dev
```
Le badge « MODE DÉMO » disparaît → vous êtes en mode réel.

---

## 📁 Structure du projet

```
otatrack/
├── index.html                  Point d'entrée HTML
├── package.json                Dépendances
├── vite.config.js              Config de build
├── .env.example                Modèle de config Supabase
├── supabase/
│   └── schema.sql              Tables de la base de données
└── src/
    ├── main.jsx                Démarrage React
    ├── App.jsx                 Routes (/, /terrain, /manager)
    ├── lib/
    │   ├── supabase.js         Connexion Supabase (+ mode démo)
    │   └── store.js            État partagé (tâches, stock, rapports)
    ├── data/
    │   ├── produits.js         CATALOGUE COMPLET (141 produits du fichier)
    │   └── demoData.js         Rapports, semaines, tâches de démo
    ├── components/
    │   ├── Shared.jsx          Gastro, lightbox, modal
    │   ├── RapportDetail.jsx   Panneau détail d'un rapport
    │   └── TasksPage.jsx       Page tâches (partagée)
    ├── pages/
    │   ├── Landing.jsx         Page d'accueil (choix espace)
    │   ├── terrain/
    │   │   └── TerrainApp.jsx  Espace assistants (rapports, photos, tâches)
    │   └── manager/
    │       ├── ManagerApp.jsx  Coquille + menu manager
    │       ├── Overview.jsx    Vue d'ensemble + alertes
    │       ├── Rapports.jsx    Liste + détail rapports
    │       ├── Stats.jsx       Graphiques par semaine
    │       ├── Calendrier.jsx  Calendrier + détail du jour
    │       ├── Stock.jsx       Stock + fiche produit
    │       ├── Pertes.jsx      Pertes en €
    │       └── Reception.jsx   Réception (facture + manuel)
    └── styles/
        └── global.css          Tout le design
```

---

## 🔜 Étapes suivantes
- Ajouter les ~150 produits complets du fichier d'inventaire dans Supabase
- Brancher l'upload réel des photos (tablette + QR code téléphone)
- Relier les sachets lancés des rapports → sorties automatiques du stock
- Ajouter l'authentification (login séparé Terrain / Manager)
- OCR réel des factures pour l'extraction automatique
