import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { AnimatedNumber, AnimatedEuro, LevelBar } from "../../components/Anim";

const FMT = (n) => new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(n || 0);
const monthStart = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; };

export function AdminRestaurant({ restaurant, onBack }) {
  const [products, setProducts] = useState(null);
  const [receptions, setReceptions] = useState([]);
  const [tab, setTab] = useState("apercu");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [p, r] = await Promise.all([
      supabase.from("restaurant_products").select("*").eq("restaurant_id", restaurant.id).order("nom"),
      supabase.from("receptions").select("*").eq("restaurant_id", restaurant.id).order("received_at", { ascending: false }).limit(300),
    ]);
    setProducts(p.data || []);
    setReceptions(r.data || []);
  }, [restaurant.id]);
  useEffect(() => { load(); }, [load]);

  const ms = monthStart();
  const achatsByCode = useMemo(() => {
    const a = {};
    receptions.filter((r) => new Date(r.received_at) >= ms).forEach((r) => { a[r.code] = (a[r.code] || 0) + (r.qty || 0); });
    return a;
  }, [receptions]);

  const rows = useMemo(() => (products || []).map((p) => {
    const debut = p.stock_debut || 0, achats = achatsByCode[p.code] || 0, actuel = p.stock || 0;
    const consomme = Math.max(0, +(debut + achats - actuel).toFixed(1));
    return { ...p, debut, achats, actuel, consomme, vConso: consomme * (p.prix || 0), vDebut: debut * (p.prix || 0), vAchats: achats * (p.prix || 0), vActuel: actuel * (p.prix || 0) };
  }), [products, achatsByCode]);

  const tot = rows.reduce((a, r) => ({ debut: a.debut + r.vDebut, achats: a.achats + r.vAchats, actuel: a.actuel + r.vActuel, conso: a.conso + r.vConso }), { debut: 0, achats: 0, actuel: 0, conso: 0 });
  const enStock = rows.filter((p) => p.actuel > 0).length;
  const ruptures = rows.filter((p) => p.actuel <= 0).length;
  const sousSeuil = rows.filter((p) => p.min > 0 && p.actuel > 0 && p.actuel <= p.min).length;
  const topConso = [...rows].filter((r) => r.vConso > 0).sort((a, b) => b.vConso - a.vConso).slice(0, 6);

  const TABS = [{ id: "apercu", label: "Aperçu" }, { id: "stock", label: "Stock" }, { id: "reception", label: "Réceptions" }];

  let stockData = rows;
  if (search) { const q = search.toLowerCase(); stockData = rows.filter((p) => (p.nom + p.cat).toLowerCase().includes(q)); }

  return (
    <div className="admin-wrap">
      <div className="admin-top fade-in">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Retour</button>
            <div className="resto-name" style={{ fontSize: 24 }}>{restaurant.name}</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{restaurant.city || "—"} · données réelles</div>
        </div>
        <span className="dot on">actif</span>
      </div>

      <nav className="inv-tabs fade-in-2">
        {TABS.map((t) => <button key={t.id} className={`inv-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </nav>

      {products === null ? <div className="empty-hint" style={{ padding: 50 }}>Chargement des données...</div> : (
        <div className="fade-in" key={tab}>
          {tab === "apercu" && (
            <>
              <div className="glass-grid">
                <div className="glass-kpi"><div className="gk-label">Valeur du stock</div><div className="gk-val" style={{ color: "var(--green)" }}><AnimatedEuro value={tot.actuel} /></div><div className="gk-unit">actuel · HT</div></div>
                <div className="glass-kpi"><div className="gk-label">Achats du mois</div><div className="gk-val" style={{ color: "var(--blue)" }}><AnimatedEuro value={tot.achats} /></div><div className="gk-unit">marchandise reçue</div></div>
                <div className="glass-kpi"><div className="gk-label">Consommé</div><div className="gk-val" style={{ color: "var(--accent2)" }}><AnimatedEuro value={tot.conso} /></div><div className="gk-unit">ce mois</div></div>
                <div className="glass-kpi"><div className="gk-label">Alertes stock</div><div className="gk-val" style={{ color: ruptures > 0 ? "var(--red)" : "var(--green)" }}><AnimatedNumber value={ruptures + sousSeuil} /></div><div className="gk-unit">{ruptures} rupture(s) · {sousSeuil} bas</div></div>
              </div>

              <div className="card glass-card">
                <div className="card-head"><div><div className="card-title">Rapprochement du mois</div><div className="card-sub">Début + achats − consommé = stock actuel</div></div></div>
                <div className="card-body">
                  <div className="recon">
                    <div className="recon-box"><div className="rb-l">Stock début</div><div className="rb-v">{FMT(tot.debut)}</div></div>
                    <div className="recon-op">+</div>
                    <div className="recon-box"><div className="rb-l">Achats</div><div className="rb-v" style={{ color: "var(--blue)" }}>{FMT(tot.achats)}</div></div>
                    <div className="recon-op">−</div>
                    <div className="recon-box"><div className="rb-l">Consommé</div><div className="rb-v" style={{ color: "var(--accent2)" }}>{FMT(tot.conso)}</div></div>
                    <div className="recon-op">=</div>
                    <div className="recon-box hl"><div className="rb-l">Stock actuel</div><div className="rb-v" style={{ color: "var(--green)" }}>{FMT(tot.actuel)}</div></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><div><div className="card-title">Produits les plus consommés</div><div className="card-sub">Ce mois · en valeur</div></div></div>
                <div className="card-body flush">
                  <table className="dtable">
                    <thead><tr><th>Produit</th><th>Consommé</th><th>Valeur</th></tr></thead>
                    <tbody>
                      {topConso.length === 0 && <tr><td colSpan={3} className="empty-hint" style={{ padding: 22 }}>Pas encore de consommation ce mois (stock à compléter).</td></tr>}
                      {topConso.map((p) => (
                        <tr key={p.id}><td><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat}</div></td>
                          <td style={{ color: "var(--accent2)", fontWeight: 700 }}>{p.consomme} {p.unite}</td><td className="euro">{FMT(p.vConso)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-note">Les statistiques de revenus et de rentabilité (EBITDA) s'ajouteront ici quand la collecte des ventes sera activée. Pour l'instant, tout est basé sur l'inventaire réel du restaurant.</div>
            </>
          )}

          {tab === "stock" && (
            <>
              <div className="glass-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                <div className="glass-kpi"><div className="gk-label">Valeur stock</div><div className="gk-val" style={{ color: "var(--green)" }}><AnimatedEuro value={tot.actuel} /></div><div className="gk-unit">HT</div></div>
                <div className="glass-kpi"><div className="gk-label">En stock</div><div className="gk-val" style={{ color: "var(--blue)" }}><AnimatedNumber value={enStock} /></div><div className="gk-unit">sur {rows.length}</div></div>
                <div className="glass-kpi"><div className="gk-label">Ruptures</div><div className="gk-val" style={{ color: ruptures > 0 ? "var(--red)" : "var(--green)" }}><AnimatedNumber value={ruptures} /></div><div className="gk-unit">à recommander</div></div>
              </div>
              <input className="search-input" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="card"><div className="card-body flush">
                <table className="dtable">
                  <thead><tr><th>Produit</th><th>Stock</th><th>Prix</th><th>Valeur</th></tr></thead>
                  <tbody>
                    {stockData.map((p) => {
                      const ratio = p.max > 0 ? p.actuel / p.max : (p.actuel > 0 ? 1 : 0);
                      const col = p.actuel <= 0 ? "var(--red)" : (p.min > 0 && p.actuel <= p.min) ? "var(--accent2)" : "var(--green)";
                      return (<tr key={p.id}><td style={{ minWidth: 160 }}><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat}</div><LevelBar ratio={ratio} color={col} /></td>
                        <td><span className="stock-num" style={{ fontSize: 17, color: col }}>{p.actuel}</span> <span style={{ fontSize: 10, color: "var(--muted)" }}>{p.unite}</span></td>
                        <td style={{ color: "var(--muted)" }}>{(p.prix || 0).toFixed(2)} €</td><td className="euro">{FMT(p.vActuel)}</td></tr>);
                    })}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

          {tab === "reception" && (
            <div className="card"><div className="card-head"><div><div className="card-title">Réceptions</div><div className="card-sub">{receptions.length} entrée(s) enregistrée(s)</div></div></div>
              <div className="card-body">
                {receptions.length === 0 && <div className="empty-hint" style={{ padding: 20 }}>Aucune réception enregistrée pour ce restaurant.</div>}
                {receptions.slice(0, 40).map((m) => (
                  <div className="recep-item" key={m.id}>
                    <div className="recep-icon">↓</div>
                    <div className="recep-main"><div className="recep-prod">{m.nom || m.code}</div><div className="recep-meta">{m.source} · {new Date(m.received_at).toLocaleDateString("fr-BE")}</div></div>
                    <div className="recep-qty" style={{ color: "var(--green)" }}>+{m.qty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
