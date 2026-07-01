import { useStore } from "../../lib/store";
import { statusOf, FMT } from "../../components/Shared";
import { coutPerte, FMT_EUR } from "../../data/grammage";

const TODAY = new Date(2026, 4, 13);

function Kpi({ label, val, unit, c }) {
  const col = c === "cr" ? "red" : c === "co" ? "accent2" : c === "cg" ? "green" : "blue";
  return (
    <div className="glass-kpi">
      <div className="gk-label">{label}</div>
      <div className="gk-val" style={{ color: `var(--${col})` }}>{val}</div>
      <div className="gk-unit">{unit}</div>
    </div>
  );
}

export function Overview({ setPage }) {
  const { produits, rapports, tasks, closures, grammage } = useStore();
  const out = produits.filter((p) => p.stock === 0);
  const low = produits.filter((p) => p.stock > 0 && p.stock < p.min);
  const today = rapports.filter((r) => r.date === "2026-05-13");
  const hasSoir = today.some((r) => r.shift === "Soir");
  const totalStock = produits.reduce((a, p) => a + p.stock * p.prix, 0);
  const openTasks = tasks.filter((t) => !t.done).length;
  const matin = today.find((r) => r.shift === "Matin");
  const soir = today.find((r) => r.shift === "Soir");
  const ref = new Date("2026-05-13T12:00:00");
  const perteSemaine = closures
    .filter((c) => Math.floor((ref - new Date(c.date + "T12:00:00")) / 86400000) < 7)
    .reduce((a, c) => a + coutPerte(grammage, c).total, 0);

  const ShiftRow = ({ label, r }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
      <div><div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{r ? r.who : "—"}</div></div>
      {r ? <span className="status-pill s-ok">✅ {r.time}</span> : <span className="status-pill s-out">En attente</span>}
    </div>
  );

  const alerts = produits.filter((p) => statusOf(p) !== "ok").sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <>
      {!hasSoir && <div className="alert-bar warn">⚠️ <strong>Rapport Soir manquant</strong> — shift 17h-00h non soumis</div>}
      {out.length > 0 && <div className="alert-bar red">🔴 <strong>{out.length} rupture(s) de stock</strong> — {out.map((p) => p.nom).join(", ")}</div>}
      {low.length > 0 && <div className="alert-bar warn">🟠 <strong>{low.length} produit(s) en stock bas</strong></div>}
      {openTasks > 0 && <div className="alert-bar info">✅ <strong>{openTasks} tâche(s) en cours</strong></div>}

      <div className="glass-grid">
        <Kpi label="Valeur stock" val={`${totalStock.toFixed(0)} €`} unit={`${produits.length} produits`} c="cb" />
        <Kpi label="Ruptures" val={out.length} unit="à commander" c="cr" />
        <Kpi label="Pertes semaine" val={FMT_EUR(perteSemaine)} unit="gaspillage chiffré" c="co" />
        <Kpi label="Tâches actives" val={openTasks} unit="à traiter" c="cg" />
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-head"><div><div className="card-title">Rapports du jour</div><div className="card-sub">{FMT(TODAY)}</div></div></div>
          <div className="card-body">
            <ShiftRow label="☀️ Matin 10h-17h" r={matin} />
            <ShiftRow label="🌙 Soir 17h-00h" r={soir} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Produits en alerte</div><div className="card-action" onClick={() => setPage("stock")}>Voir stock →</div></div>
          <div className="card-body flush">
            <table className="dtable"><tbody>
              {alerts.map((p) => {
                const st = statusOf(p), col = st === "out" ? "var(--red)" : "var(--accent2)";
                return (
                  <tr key={p.code} onClick={() => setPage("stock")}>
                    <td><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat}</div></td>
                    <td><span className="stock-num" style={{ color: col }}>{p.stock}</span></td>
                    <td>{st === "out" ? <span className="status-pill s-out">Rupture</span> : <span className="status-pill s-low">Bas</span>}</td>
                  </tr>
                );
              })}
            </tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}
