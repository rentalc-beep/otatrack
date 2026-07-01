import { useState, useMemo } from "react";
import { useStore, actions } from "../../lib/store";
import { CATEGORIES } from "../../data/demoData";
import { coutPerte, FMT_EUR } from "../../data/grammage";
import { Modal } from "../../components/Shared";

const TODAY = "2026-05-13";
const daysAgo = (d) => Math.floor((new Date(TODAY + "T12:00:00") - new Date(d + "T12:00:00")) / 86400000);

function GKpi({ label, val, unit, accent }) {
  return (
    <div className="glass-kpi">
      <div className="gk-label">{label}</div>
      <div className="gk-val" style={{ color: accent }}>{val}</div>
      <div className="gk-unit">{unit}</div>
    </div>
  );
}

export function Inventaire() {
  const { produits, inventaire, closures, grammage } = useStore();
  const [cat, setCat] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [ask, setAsk] = useState(false);

  // Calcul par produit
  const rows = useMemo(() => produits.map((p) => {
    const debut = inventaire.stockDebut[p.code] ?? p.stock;
    const entrees = inventaire.entrees[p.code] ?? 0;
    const actuel = p.stock;
    const consomme = Math.max(0, +(debut + entrees - actuel).toFixed(1));
    return { ...p, debut, entrees, actuel, consomme, vConso: consomme * p.prix, vDebut: debut * p.prix, vEntrees: entrees * p.prix, vActuel: actuel * p.prix };
  }), [produits, inventaire]);

  const tot = rows.reduce((a, r) => ({
    debut: a.debut + r.vDebut, entrees: a.entrees + r.vEntrees, actuel: a.actuel + r.vActuel, conso: a.conso + r.vConso,
  }), { debut: 0, entrees: 0, actuel: 0, conso: 0 });

  const pertesMois = closures.filter((c) => daysAgo(c.date) < 30).reduce((a, c) => a + coutPerte(grammage, c).total, 0);
  const consoNette = Math.max(0, tot.conso - pertesMois);

  // Filtrage table
  let data = rows;
  if (cat !== "Toutes") data = data.filter((p) => p.cat === cat);
  if (search) data = data.filter((p) => (p.nom + p.code + p.marque).toLowerCase().includes(search.toLowerCase()));
  data = [...data].sort((a, b) => b.vConso - a.vConso);

  const startMonth = () => {
    const label = prompt("Nom du nouveau mois (ex : Juin 2026) :", "Juin 2026");
    if (label) { actions.demarrerNouveauMois(label); setAsk(false); }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Inventaire mensuel</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="cat-tag">Mois en cours : {inventaire.mois}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setAsk(true)}>🔄 Nouveau mois</button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>
        Stock de début + marchandise reçue − pertes = ce qui a été consommé. Le détail par produit est en bas.
      </div>

      {/* KPIs glassmorphism */}
      <div className="glass-grid">
        <GKpi label="Stock début de mois" val={FMT_EUR(tot.debut)} unit="valeur HT" accent="#9B8C79" />
        <GKpi label="Achats du mois" val={FMT_EUR(tot.entrees)} unit="marchandise reçue" accent="#4AA3E0" />
        <GKpi label="Consommé (total)" val={FMT_EUR(tot.conso)} unit="sorti du stock" accent="#FA8C16" />
        <GKpi label="Stock actuel" val={FMT_EUR(tot.actuel)} unit="reste en stock" accent="#5DBB46" />
      </div>

      {/* Rapprochement */}
      <div className="card glass-card">
        <div className="card-head"><div><div className="card-title">Rapprochement du mois</div><div className="card-sub">D'où vient le stock, où il est parti</div></div></div>
        <div className="card-body">
          <div className="recon">
            <div className="recon-box"><div className="rb-l">Stock début</div><div className="rb-v">{FMT_EUR(tot.debut)}</div></div>
            <div className="recon-op">+</div>
            <div className="recon-box"><div className="rb-l">Achats</div><div className="rb-v" style={{ color: "#4AA3E0" }}>{FMT_EUR(tot.entrees)}</div></div>
            <div className="recon-op">−</div>
            <div className="recon-box"><div className="rb-l">Consommé</div><div className="rb-v" style={{ color: "#FA8C16" }}>{FMT_EUR(tot.conso)}</div></div>
            <div className="recon-op">=</div>
            <div className="recon-box hl"><div className="rb-l">Stock actuel</div><div className="rb-v" style={{ color: "#5DBB46" }}>{FMT_EUR(tot.actuel)}</div></div>
          </div>
          <div className="recon-split">
            <div className="rs-item"><span>🛒 Parti en ventes (estimé)</span><b>{FMT_EUR(consoNette)}</b></div>
            <div className="rs-item"><span>🗑️ Perdu (gaspillage 30 j)</span><b style={{ color: "var(--red)" }}>{FMT_EUR(pertesMois)}</b></div>
            <div className="rs-item"><span>Part du gaspillage dans le consommé</span><b>{tot.conso > 0 ? ((pertesMois / tot.conso) * 100).toFixed(1) : 0} %</b></div>
          </div>
        </div>
      </div>

      {/* Détail par produit */}
      <div className="filter-row">
        {CATEGORIES.map((c) => <button key={c} className={`fb ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <input className="search-input" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="card">
        <div className="card-head"><div><div className="card-title">Détail par produit</div><div className="card-sub">{data.length} produit(s) · trié par valeur consommée</div></div></div>
        <div className="card-body flush">
          <table className="dtable">
            <thead><tr><th>Produit</th><th>Début</th><th>Achats</th><th>Actuel</th><th>Consommé</th><th>Valeur conso.</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.code}>
                  <td><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat}</div></td>
                  <td style={{ color: "var(--muted)" }}>{p.debut} {p.unite}</td>
                  <td style={{ color: "var(--blue)" }}>+{p.entrees}</td>
                  <td style={{ color: "var(--green)" }}>{p.actuel}</td>
                  <td><span className="stock-num" style={{ fontSize: 16, color: "var(--accent2)" }}>{p.consomme}</span> <span style={{ fontSize: 10, color: "var(--muted)" }}>{p.unite}</span></td>
                  <td className="euro">{FMT_EUR(p.vConso)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ask && (
        <Modal onClose={() => setAsk(false)}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Démarrer un nouveau mois ?</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.5 }}>
            Le stock actuel de chaque produit devient le <b>stock de début</b> du nouveau mois, et le compteur d'achats repart à zéro.
            À faire le 1<sup>er</sup> du mois, après le comptage.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" style={{ flex: 1 }} onClick={startMonth}>Confirmer</button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAsk(false)}>Annuler</button>
          </div>
        </Modal>
      )}
    </>
  );
}
