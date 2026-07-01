-- ════════════════════════════════════════════════════════════
-- OtaTrack — Schéma de base de données Supabase
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════

-- 1. PRODUITS (catalogue + stock)
create table if not exists produits (
  code        text primary key,
  cat         text not null,
  nom         text not null,
  marque      text,
  description text,
  unite       text default 'carton',
  par_carton  text,
  prix        numeric(10,2) default 0,
  stock       numeric(10,2) default 0,
  seuil_min   numeric(10,2) default 0,
  seuil_max   numeric(10,2) default 0,
  created_at  timestamptz default now()
);

-- 2. RAPPORTS (fermeture cuisine + caisse)
create table if not exists rapports (
  id          bigint generated always as identity primary key,
  date        date not null,
  shift       text not null,            -- 'Matin' | 'Soir'
  poste       text,                     -- 'Cuisine' | 'Caisse'
  assistant   text not null,
  heure       text,
  cuisine     jsonb,                    -- { marine: 2, frites: 8, ... }
  restes      jsonb,                    -- { marine: '1/2', ... }
  caisse      jsonb,                    -- { service, attente, probleme, pb_desc }
  remarques   text,
  nb_photos   int default 0,
  status      text default 'ok',
  created_at  timestamptz default now()
);

-- 3. PHOTOS (liées à un rapport)
create table if not exists photos (
  id          bigint generated always as identity primary key,
  rapport_id  bigint references rapports(id) on delete cascade,
  url         text not null,
  created_at  timestamptz default now()
);

-- 4. MOUVEMENTS (entrées / sorties de stock)
create table if not exists mouvements (
  id          bigint generated always as identity primary key,
  type        text not null,            -- 'in' | 'out'
  produit_code text references produits(code),
  produit_nom text,
  quantite    text,
  source      text,                     -- 'Facture X' | 'Manuel' | 'Rapport Soir'...
  created_at  timestamptz default now()
);

-- 5. TACHES (messages urgents avec image, validables)
create table if not exists taches (
  id          bigint generated always as identity primary key,
  titre       text not null,
  description text,
  priorite    text default 'normal',    -- 'normal' | 'urgent'
  cree_par    text,
  image_url   text,
  done        boolean default false,
  created_at  timestamptz default now()
);

-- ════════════════════════════════════════════════════════════
-- Sécurité : RLS ouvert pour le prototype (pas d'auth pour l'instant)
-- ⚠️ À restreindre quand vous ajouterez l'authentification.
-- ════════════════════════════════════════════════════════════
alter table produits   enable row level security;
alter table rapports   enable row level security;
alter table photos     enable row level security;
alter table mouvements enable row level security;
alter table taches     enable row level security;

create policy "open" on produits   for all using (true) with check (true);
create policy "open" on rapports   for all using (true) with check (true);
create policy "open" on photos     for all using (true) with check (true);
create policy "open" on mouvements for all using (true) with check (true);
create policy "open" on taches     for all using (true) with check (true);

-- ════════════════════════════════════════════════════════════
-- Storage : créer manuellement un bucket public "photos"
-- Dashboard → Storage → New bucket → nom: photos → Public ✓
-- ════════════════════════════════════════════════════════════
