// ════════════════════════════════════════════════════════════
// SYSTÈME DE GRAMMAGE — coût du gaspillage au poids
//
// Principe (validé avec le responsable) :
// À la fermeture, on pèse ce qui est jeté par catégorie.
// - VIANDES : les 5 viandes sont mélangées dans un seul bac → on pèse le total.
//   Coût = poids total (kg) × PRIX MOYEN au kilo des 5 viandes.
//   Prix moyen = moyenne des prix/kg des 5 viandes.
// - FRITURES : même principe (nuggets, tenders, tenders spicy mélangés).
// - FRITES : pesée séparée × prix/kg des frites.
// - SAUCE FROMAGÈRE : pesée séparée × prix/kg.
//
// Les prix/kg ci-dessous sont DÉRIVÉS du catalogue (prix carton ÷ poids carton).
// Ils sont MODIFIABLES dans l'app (Manager → Pertes → Prix au kilo) — le
// responsable peut saisir les vrais prix exacts.
// ════════════════════════════════════════════════════════════

export const GRAMMAGE_INIT = {
  viandes: {
    label: "Viandes",
    icon: "🥩",
    note: "Les 5 viandes mélangées dans un bac, pesée du total.",
    items: [
      { id: "marine", nom: "Poulet Mariné", prixKg: 7.70 },
      { id: "nature", nom: "Poulet Nature", prixKg: 9.11 },
      { id: "hachee", nom: "Viande Hachée", prixKg: 7.25 },
      { id: "merguez", nom: "Merguez", prixKg: 9.30 },
      { id: "kebab", nom: "Kebab", prixKg: 7.75 },
    ],
  },
  fritures: {
    label: "Fritures",
    icon: "🍗",
    note: "Nuggets, tenders, tenders spicy mélangés, pesée du total.",
    items: [
      { id: "nuggets", nom: "Nuggets", prixKg: 5.8 },
      { id: "tenders", nom: "Tenders", prixKg: 8.13 },
      { id: "tenders_spicy", nom: "Tenders Spicy", prixKg: 8.96 },
    ],
  },
  frites: {
    label: "Frites",
    icon: "🍟",
    single: true,
    prixKg: 1.7,
  },
  fromagere: {
    label: "Sauce Fromagère",
    icon: "🧀",
    single: true,
    prixKg: 4.8,
  },
};

export const CAT_ORDER = ["viandes", "fritures", "frites", "fromagere"];

// Prix moyen au kilo d'une catégorie
export function prixMoyenKg(cat) {
  if (!cat) return 0;
  if (cat.single) return cat.prixKg || 0;
  if (!cat.items || !cat.items.length) return 0;
  const sum = cat.items.reduce((a, it) => a + (it.prixKg || 0), 0);
  return sum / cat.items.length;
}

// Coût d'une perte : { viandes: kg, fritures: kg, frites: kg, fromagere: kg }
export function coutPerte(grammage, poidsKg) {
  const detail = {};
  let total = 0;
  CAT_ORDER.forEach((key) => {
    const kg = parseFloat(poidsKg?.[key]) || 0;
    const pmk = prixMoyenKg(grammage[key]);
    const cout = kg * pmk;
    detail[key] = { kg, prixKg: pmk, cout };
    total += cout;
  });
  return { detail, total };
}

export const FMT_EUR = (n) =>
  (Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString("fr-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
