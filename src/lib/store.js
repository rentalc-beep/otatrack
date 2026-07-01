import { useSyncExternalStore } from "react";
import { PRODUITS, TASKS_INIT, MOUVEMENTS_INIT, RAPPORTS, CLOSURES_INIT, FINANCE_INIT } from "../data/demoData";
import { GRAMMAGE_INIT } from "../data/grammage";

const clone = (o) => JSON.parse(JSON.stringify(o));
const r1 = (n) => Math.round(n * 10) / 10;

// Inventaire mensuel de démo : stock de début de mois + entrées (livraisons) cumulées.
function initInventaire(prods) {
  const stockDebut = {}, entrees = {};
  prods.forEach((p) => {
    stockDebut[p.code] = r1(p.stock * 1.5);
    entrees[p.code] = r1(p.stock * 1.0);
  });
  return { mois: "Mai 2026", debutDate: "2026-05-01", stockDebut, entrees };
}

let state = {
  produits: PRODUITS.map((p) => ({ ...p })),
  tasks: TASKS_INIT.map((t) => ({ ...t })),
  mouvements: MOUVEMENTS_INIT.map((m) => ({ ...m })),
  rapports: RAPPORTS.map((r) => ({ ...r })),
  grammage: clone(GRAMMAGE_INIT),
  closures: CLOSURES_INIT.map((c) => ({ ...c })),
  finance: clone(FINANCE_INIT),
  inventaire: initInventaire(PRODUITS),
};

const listeners = new Set();
function emit() { state = { ...state }; listeners.forEach((l) => l()); }
function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
function getSnapshot() { return state; }
export function useStore() { return useSyncExternalStore(subscribe, getSnapshot); }

const nowHM = () => new Date().toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

export const actions = {
  addTask(task) {
    const id = Math.max(0, ...state.tasks.map((t) => t.id)) + 1;
    state.tasks = [{ id, done: false, ...task }, ...state.tasks];
    emit();
  },
  completeTask(id) {
    state.tasks = state.tasks.map((t) => (t.id === id ? { ...t, done: true } : t));
    emit();
  },
  // Réception de marchandise : qty en unité de stock (kg/unité/L), déjà convertie depuis cartons.
  receiveStock(code, qty, source = "Manuel") {
    state.produits = state.produits.map((p) => (p.code === code ? { ...p, stock: r1(p.stock + qty) } : p));
    const prod = state.produits.find((p) => p.code === code);
    state.inventaire = { ...state.inventaire, entrees: { ...state.inventaire.entrees, [code]: r1((state.inventaire.entrees[code] || 0) + qty) } };
    state.mouvements = [{ type: "in", prod: prod.nom, qty: `+${qty} ${prod.unite}`, who: source, date: `13/05 ${nowHM()}` }, ...state.mouvements];
    emit();
  },
  // Modifier directement le stock réel (comptage / correction).
  setStock(code, value) {
    const v = Math.max(0, parseFloat(value) || 0);
    const prod = state.produits.find((p) => p.code === code);
    const delta = r1(v - (prod?.stock || 0));
    state.produits = state.produits.map((p) => (p.code === code ? { ...p, stock: v } : p));
    if (prod && delta !== 0) {
      state.mouvements = [{ type: delta > 0 ? "in" : "out", prod: prod.nom, qty: `${delta > 0 ? "+" : ""}${delta} ${prod.unite}`, who: "Ajustement stock", date: `13/05 ${nowHM()}` }, ...state.mouvements];
    }
    emit();
  },
  // Ajouter un produit manuellement.
  addProduit(p) {
    const code = (p.code && String(p.code).trim()) || "P" + Date.now().toString().slice(-6);
    if (state.produits.some((x) => x.code === code)) { alert("Ce code produit existe déjà."); return; }
    const stock = parseFloat(p.stock) || 0;
    const prod = {
      code, cat: p.cat || "Divers", nom: p.nom || "Nouveau produit", marque: p.marque || "—",
      desc: p.desc || p.nom || "", unite: p.unite || "unité", parCarton: p.parCarton || "—",
      prix: parseFloat(p.prix) || 0, stock, min: parseFloat(p.min) || 0, max: parseFloat(p.max) || Math.max(1, stock * 2),
      tva: parseFloat(p.tva) || 6, achat: p.achat || "Carton", qteAchat: parseFloat(p.qteAchat) || 1,
    };
    state.produits = [prod, ...state.produits];
    state.inventaire = {
      ...state.inventaire,
      stockDebut: { ...state.inventaire.stockDebut, [code]: stock },
      entrees: { ...state.inventaire.entrees, [code]: 0 },
    };
    emit();
  },
  updateProduit(code, patch) {
    const num = ["prix", "stock", "min", "max", "tva", "qteAchat"];
    const clean = {};
    Object.keys(patch).forEach((k) => { clean[k] = num.includes(k) ? (parseFloat(patch[k]) || 0) : patch[k]; });
    state.produits = state.produits.map((p) => (p.code === code ? { ...p, ...clean } : p));
    emit();
  },
  deleteProduit(code) {
    state.produits = state.produits.filter((p) => p.code !== code);
    emit();
  },
  // Démarrer un nouveau mois d'inventaire : fige le stock actuel comme stock de début.
  demarrerNouveauMois(label) {
    const stockDebut = {};
    state.produits.forEach((p) => { stockDebut[p.code] = p.stock; });
    state.inventaire = { mois: label || "Nouveau mois", debutDate: "2026-05-13", stockDebut, entrees: {} };
    emit();
  },
  addRapport(rapport) {
    const id = Math.max(0, ...state.rapports.map((r) => r.id)) + 1;
    state.rapports = [{ id, ...rapport }, ...state.rapports];
    emit();
  },
  addClosure(poids, meta = {}) {
    state.closures = [{ date: "2026-05-13", shift: "Soir", who: "Terrain", ...meta, ...poids }, ...state.closures];
    emit();
  },
  setPrixKg(catKey, itemId, value) {
    const g = clone(state.grammage);
    const v = Math.max(0, parseFloat(value) || 0);
    if (g[catKey].single) g[catKey].prixKg = v;
    else { const it = g[catKey].items.find((x) => x.id === itemId); if (it) it.prixKg = v; }
    state.grammage = g;
    emit();
  },
  setFinance(path, value) {
    const f = clone(state.finance);
    const v = Math.max(0, parseFloat(value) || 0);
    if (path.includes(".")) { const [a, b] = path.split("."); f[a][b] = v; }
    else f[path] = v;
    state.finance = f;
    emit();
  },
};

export const openTaskCount = () => state.tasks.filter((t) => !t.done).length;
