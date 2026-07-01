import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useStore, actions } from "../../lib/store";
import { coutPerte, prixMoyenKg, CAT_ORDER, FMT_EUR } from "../../data/grammage";
import { Modal } from "../../components/Shared";

const TODAY = "2026-05-13";
const COLORS = { viandes: "#E8431E", fritures: "#FA8C16", frites: "#FFC53D", fromagere: "#4AA3E0" };

function Kpi({ label, val, unit, c }) {
  const col = c === "cr" ? "red" : c === "co" ? "accent2" : c === "cg" ? "green" : "blue";
  return <div className="glass-kpi"><div className="gk-label">{label}</div><div className="gk-val" style={{ color: `var(--${col})` }}>{val}</div><div className="gk-unit">{unit}</div></div>;
}

// Filtre les closures selon la période en partant du 13 mai 2026
function inPeriod(dateStr, period) {
  const d = new Date(dateStr + "T12:00:00");
  const ref = new Date(TODAY + "T12:00:00");
  const diff = Math.floor((ref - d) / 86400000);
  if (period === "jour") return dateStr === TODAY;
  if (period === "semaine") return diff < 7;
  return diff < 30; // mois
}

export function Pertes() {
  const { grammage, closures } = useStore();
  const [period, setPeriod] = useState("semaine");
  const [showPrices, setShowPrices] = useState(false);

  const rows = closures.filter((c) => inPeriod(c.date, period));
  // Agrégation des coûts par catégorie
  const totals = { viandes: 0, fritures: 0, frites: 0, fromagere: 0 };
  let totalEuro = 0;
  rows.forEach((c) => {
    const { detail, total } = coutPerte(grammage, c);
    CAT_ORDER.forEach((k) => (totals[k] += detail[k].cout));
    totalEuro += total;
  });
  const days = period === "jour" ? 1 : period === "semaine" ? 7 : 30;
  const pieData = CAT_ORDER.map((k) => ({ key: k, name: grammage[k].label, euro: +totals[k].toFixed(2) }));
  const worst = [...pieData].sort((a, b) => b.euro - a.euro)[0];

  // Tendance par jour (pour le mois) ou par closure
  const byDay = {};
  rows.forEach((c) => {
    const { total } = coutPerte(grammage, c);
    byDay[c.date] = (byDay[c.date] || 0) + total;
  });
  const trend = Object.keys(byDay).sort().map((d) => ({ d: d.slice(8) + "/" + d.slice(5, 7), euro: +byDay[d].toFixed(2) }));

  const periodLabel = period === "jour" ? "aujourd'hui" : period === "semaine" ? "7 derniers jours" : "30 derniers jours";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Pertes &amp; gaspillage</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="seg">
            <button className={period === "jour" ? "on" : ""} onClick={() => setPeriod("jour")}>Jour</button>
            <button className={period === "semaine" ? "on" : ""} onClick={() => setPeriod("semaine")}>Semaine</button>
            <button className={period === "mois" ? "on" : ""} onClick={() => setPeriod("mois")}>Mois</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPrices(true)}>⚙️ Prix au kilo</button>
        </div>
      </div>

      <div className="glass-grid">
        <Kpi label={`Total perdu (${periodLabel})`} val={FMT_EUR(totalEuro)} unit={`${rows.length} fermetures`} c="cr" />
        <Kpi label="Moyenne / jour" val={FMT_EUR(totalEuro / days)} unit={`sur ${days} j`} c="co" />
        <Kpi label="Pire catégorie" val={worst ? worst.name : "—"} unit={worst ? FMT_EUR(worst.euro) : ""} c="cr" />
        <Kpi label="Projection / mois" val={FMT_EUR((totalEuro / days) * 30)} unit="au rythme actuel" c="cb" />
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-head"><div><div className="card-title">Répartition par catégorie</div><div className="card-sub">Coût du gaspillage · {periodLabel}</div></div></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="euro" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {pieData.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1D1712", border: "1px solid #3A2D20", borderRadius: 8, color: "#F4EFE8" }} formatter={(v) => FMT_EUR(v)} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#9B8C79" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div><div className="card-title">Détail par catégorie</div><div className="card-sub">Poids jeté &amp; coût</div></div></div>
          <div className="card-body flush">
            <table className="dtable">
              <thead><tr><th>Catégorie</th><th>Poids total</th><th>€/kg</th><th>Coût</th></tr></thead>
              <tbody>
                {CAT_ORDER.map((k) => {
                  const kg = rows.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
                  return (
                    <tr key={k}>
                      <td style={{ fontWeight: 600 }}>{grammage[k].icon} {grammage[k].label}</td>
                      <td>{kg.toFixed(1)} kg</td>
                      <td style={{ color: "var(--muted)" }}>{prixMoyenKg(grammage[k]).toFixed(2)} €</td>
                      <td className="euro" style={{ color: "var(--red)" }}>{FMT_EUR(totals[k])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><div className="card-title">Évolution du coût des pertes (€)</div><div className="card-sub">Par jour · {periodLabel}</div></div></div>
        <div className="chart-wrap" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 10, right: 10, bottom: 5, left: -8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: "#9B8C79", fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#9B8C79", fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
              <Tooltip contentStyle={{ background: "#1D1712", border: "1px solid #3A2D20", borderRadius: 8, color: "#F4EFE8" }} formatter={(v) => FMT_EUR(v)} />
              <Bar dataKey="euro" fill="#E8431E" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showPrices && <PrixModal grammage={grammage} onClose={() => setShowPrices(false)} />}
    </>
  );
}

function PrixModal({ grammage, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Prix au kilo</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Ajustez les prix exacts. La moyenne par catégorie sert au calcul des pertes.</div>
      {CAT_ORDER.map((k) => {
        const cat = grammage[k];
        return (
          <div key={k} style={{ marginBottom: 16 }}>
            <div className="dp-section-label" style={{ marginTop: 0 }}>{cat.icon} {cat.label}{!cat.single && ` — moyenne ${prixMoyenKg(cat).toFixed(2)} €/kg`}</div>
            {cat.single ? (
              <div className="price-edit-row">
                <span>{cat.label}</span>
                <div><input className="price-input" type="number" step="0.1" min="0" defaultValue={cat.prixKg} onBlur={(e) => actions.setPrixKg(k, null, e.target.value)} /> €/kg</div>
              </div>
            ) : cat.items.map((it) => (
              <div className="price-edit-row" key={it.id}>
                <span>{it.nom}</span>
                <div><input className="price-input" type="number" step="0.1" min="0" defaultValue={it.prixKg} onBlur={(e) => actions.setPrixKg(k, it.id, e.target.value)} /> €/kg</div>
              </div>
            ))}
          </div>
        );
      })}
      <button className="btn" style={{ width: "100%" }} onClick={onClose}>Terminé</button>
    </Modal>
  );
}
