// Données de démonstration — utilisées tant que Supabase n'est pas connecté.
// Le catalogue complet des produits vient de produits.js (extrait du fichier d'inventaire).

import { PRODUITS as CATALOGUE, CATEGORIES as CATS } from "./produits";

export const PRODUITS = CATALOGUE;
export const CATEGORIES = CATS;

export const PROD_LABELS = {
  marine: "Poulet Mariné", nature: "Poulet Nature", hachee: "Viande Hachée",
  merguez: "Merguez", kebab: "Kebab", fromagere: "Sauce Fromagère",
  frites: "Sachets Frites", tortilla: "Sachets Tortilla",
};

export const RAPPORTS = [
  { id: 1, date: "2026-05-13", shift: "Matin", who: "Aminee B.", time: "11:42",
    cuisine: { marine: 2, nature: 3, hachee: 1.5, merguez: 2, kebab: 5, fromagere: 4, frites: 8, tortilla: 5 },
    restes: { marine: "1/2", nature: "—", hachee: "1/3", merguez: "vide", kebab: "1/4" }, pertes: { viandes: 1.2, fritures: 0.8, frites: 1.6, fromagere: 0.35 },
    caisse: { service: "Fluide", attente: "Bon", probleme: "Non", pb_desc: "" }, remarques: "", photos: 6, status: "ok",
    photo_urls: ["https://images.unsplash.com/photo-1571167366136-b57e5b8ca73d?w=400&q=80", "https://images.unsplash.com/photo-1556909114-44e3e9699a0e?w=400&q=80", "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80", "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80"] },
  { id: 2, date: "2026-05-12", shift: "Soir", who: "Ayoub K.", time: "00:05",
    cuisine: { marine: 3, nature: 2, hachee: 2, merguez: 1.5, kebab: 4, fromagere: 3, frites: 10, tortilla: 6 },
    restes: { marine: "vide", nature: "1/4", hachee: "1/2", merguez: "1/3", kebab: "vide" }, pertes: { viandes: 2.1, fritures: 1.5, frites: 2.4, fromagere: 0.7 },
    caisse: { service: "Moyen", attente: "Moyen", probleme: "Oui", pb_desc: "Friteuse 2 en panne" }, remarques: "Friteuse 2 à vérifier", photos: 9, status: "warn",
    photo_urls: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80"] },
  { id: 3, date: "2026-05-12", shift: "Matin", who: "Ismael Br.", time: "16:58",
    cuisine: { marine: 1.5, nature: 3, hachee: 1, merguez: 2, kebab: 3.5, fromagere: 2, frites: 7, tortilla: 4 },
    restes: { marine: "1/3", nature: "1/2", hachee: "vide", merguez: "1/4", kebab: "1/3" }, pertes: { viandes: 0.9, fritures: 0.6, frites: 1.3, fromagere: 0.3 },
    caisse: { service: "Fluide", attente: "Bon", probleme: "Non", pb_desc: "" }, remarques: "", photos: 8, status: "ok", photo_urls: [] },
  { id: 4, date: "2026-05-11", shift: "Soir", who: "AYMANE", time: "23:50",
    cuisine: { marine: 2.5, nature: 2, hachee: 1.5, merguez: 1, kebab: 5, fromagere: 4, frites: 9, tortilla: 5 },
    restes: { marine: "1/4", nature: "vide", hachee: "1/3", merguez: "vide", kebab: "1/2" }, pertes: { viandes: 2.4, fritures: 1.7, frites: 2.6, fromagere: 0.8 },
    caisse: { service: "Fluide", attente: "Bon", probleme: "Non", pb_desc: "" }, remarques: "Stock merguez faible", photos: 11, status: "ok", photo_urls: [] },
  { id: 5, date: "2026-05-11", shift: "Matin", who: "Aminee B.", time: "16:45",
    cuisine: { marine: 2, nature: 3.5, hachee: 2, merguez: 2, kebab: 4, fromagere: 3, frites: 8, tortilla: 5 },
    restes: { marine: "vide", nature: "1/3", hachee: "vide", merguez: "1/2", kebab: "1/4" }, pertes: { viandes: 1.1, fritures: 0.7, frites: 1.4, fromagere: 0.4 },
    caisse: { service: "Fluide", attente: "Bon", probleme: "Non", pb_desc: "" }, remarques: "", photos: 7, status: "ok", photo_urls: [] },
];

export const SEMAINES = [
  { num: 18, label: "Semaine 18", dates: "28 Avr – 4 Mai", conso: { marine: 8, nature: 10, hachee: 6, merguez: 7, kebab: 16, fromagere: 10, frites: 30, tortilla: 18 }, gasp: [{ n: "Poulet Mariné", pct: 10 }, { n: "Poulet Nature", pct: 18 }, { n: "Viande Hachée", pct: 28 }, { n: "Merguez", pct: 12 }, { n: "Kebab", pct: 9 }], pertesEuro: 112 },
  { num: 19, label: "Semaine 19", dates: "5 Mai – 11 Mai", conso: { marine: 11, nature: 13, hachee: 8, merguez: 9, kebab: 20, fromagere: 14, frites: 38, tortilla: 22 }, gasp: [{ n: "Poulet Mariné", pct: 8 }, { n: "Poulet Nature", pct: 22 }, { n: "Viande Hachée", pct: 25 }, { n: "Merguez", pct: 15 }, { n: "Kebab", pct: 11 }], pertesEuro: 111 },
  { num: 20, label: "Semaine 20", dates: "12 Mai – 18 Mai", conso: { marine: 5, nature: 5, hachee: 3.5, merguez: 3.5, kebab: 9, fromagere: 7, frites: 18, tortilla: 11 }, gasp: [{ n: "Poulet Mariné", pct: 15 }, { n: "Poulet Nature", pct: 15 }, { n: "Viande Hachée", pct: 33 }, { n: "Merguez", pct: 17 }, { n: "Kebab", pct: 8 }], pertesEuro: 99 },
];

export const PERTES_CAT = [
  { cat: "Viandes", euro: 42.5 }, { cat: "Volailles", euro: 28.3 },
  { cat: "Sauces", euro: 12.1 }, { cat: "Boulangerie", euro: 9.8 }, { cat: "Snacking", euro: 6.4 },
];

export const TOP_PERTES = [
  { nom: "Kebab poulet mariné", qty: "2.5 gastros", euro: 24.8 },
  { nom: "Viande hachée", qty: "1.8 gastros", euro: 17.7 },
  { nom: "Poulet mariné", qty: "1.2 gastros", euro: 11.3 },
  { nom: "Sauce fromagère", qty: "0.5 carton", euro: 8.2 },
  { nom: "Tortilla wraps", qty: "6 pièces", euro: 5.4 },
];

export const MOUVEMENTS_INIT = [
  { type: "in", prod: "Merguez cuites halal", qty: "+10 cartons", who: "Aminee B.", date: "13/05 09:30" },
  { type: "out", prod: "Kebab poulet mariné", qty: "-3 sachets", who: "Rapport Soir", date: "12/05 23:50" },
  { type: "in", prod: "Sauce fromagère", qty: "+6 cartons", who: "Ayoub K.", date: "12/05 10:15" },
  { type: "out", prod: "Poulet mariné", qty: "-2 sachets", who: "Rapport Matin", date: "12/05 16:58" },
];

export const TASKS_INIT = [
  { id: 1, title: "Nettoyer la friteuse 2", desc: "Tombée en panne hier soir, vérifier et nettoyer avant ouverture.", prio: "urgent", by: "Manager", date: "13/05 08:00", img: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&q=80", done: false },
  { id: 2, title: "Réapprovisionner sauce algérienne", desc: "Stock presque vide au comptoir, remplir depuis la réserve.", prio: "normal", by: "Manager", date: "13/05 10:30", img: "", done: false },
  { id: 3, title: "Vérifier DLC viandes congélateur", desc: "Contrôle des dates avant le service du soir.", prio: "normal", by: "Manager", date: "12/05 14:00", img: "", done: false },
];

export const NIVEAUX = [
  { val: "vide", label: "Vide", fill: 0 },
  { val: "1/4", label: "1/4", fill: 1 },
  { val: "1/3", label: "1/3", fill: 1.33 },
  { val: "1/2", label: "1/2", fill: 2 },
  { val: "3/4", label: "3/4", fill: 3 },
  { val: "plein", label: "Plein", fill: 4 },
];

// ════════ PERTES (closures) — historique de gaspillage au poids (kg) ════════
// Généré sur ~30 jours pour alimenter les statistiques (jour / semaine / mois).
const NOMS = ["Aminee B.", "Ayoub K.", "Ismael Br.", "AYMANE", "Sofia L."];
function genClosures() {
  const out = [];
  const end = new Date(2026, 4, 13); // 13 mai 2026
  for (let d = 29; d >= 0; d--) {
    const date = new Date(end);
    date.setDate(end.getDate() - d);
    const iso = date.toISOString().split("T")[0];
    const we = [0, 6].includes(date.getDay()); // week-end = plus de volume
    const f = we ? 1.45 : 1;
    const jitter = () => 0.8 + Math.random() * 0.4;
    // Soir (gros service)
    out.push({
      date: iso, shift: "Soir", who: NOMS[(d + 1) % NOMS.length],
      viandes: +(1.9 * f * jitter()).toFixed(2),
      fritures: +(1.4 * f * jitter()).toFixed(2),
      frites: +(2.3 * f * jitter()).toFixed(2),
      fromagere: +(0.6 * f * jitter()).toFixed(2),
    });
    // Matin (service plus léger)
    out.push({
      date: iso, shift: "Matin", who: NOMS[d % NOMS.length],
      viandes: +(1.1 * f * jitter()).toFixed(2),
      fritures: +(0.8 * f * jitter()).toFixed(2),
      frites: +(1.5 * f * jitter()).toFixed(2),
      fromagere: +(0.35 * f * jitter()).toFixed(2),
    });
  }
  return out;
}
export const CLOSURES_INIT = genClosures();

// ════════ FINANCE — saisie manuelle (touche humaine) ════════
// Valeurs du MOIS en cours (modifiables dans Manager → Rentabilité).
// Les revenus livraison sont en NET (après commission plateforme) — voir note UI.
export const FINANCE_INIT = {
  periode: "Mois en cours",
  revenus: {
    surplace: 28500,   // ventes sur place + à emporter au comptoir
    uberEats: 9200,    // net reçu après commission Uber Eats
    takeaway: 6400,    // net reçu après commission Takeaway / Just Eat
    deliveroo: 5100,   // net reçu après commission Deliveroo
  },
  // Coût matière (food cost) — marchandise consommée sur la période
  foodCost: 17800,
  // Masse salariale (labor cost) sur la période
  laborCost: 13200,
  // Autres charges fixes (loyer, énergie, etc.) — optionnel
  autresCharges: 6800,
  // Pour passer de l'EBITDA au résultat net
  amortissements: 1800,
  interets: 600,
  impots: 900,
  // Commissions indicatives des plateformes (pour info / simulation)
  commissions: { uberEats: 30, takeaway: 25, deliveroo: 28 },
};
