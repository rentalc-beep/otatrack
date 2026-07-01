import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStore } from "../../lib/store";
import { SEMAINES } from "../../data/demoData";
import { coutPerte, CAT_ORDER, FMT_EUR } from "../../data/grammage";

const TODAY = "2026-05-13";
const CAT_COL = { viandes: "#E8431E", fritures: "#FA8C16", frites: "#FFC53D", fromagere: "#4AA3E0" };

function Kpi({ label, val, unit, c }) {
  const col = c === "cr" ? "red" : c === "co" ? "accent2" : c === "cg" ? "green" : "blue";
  return <div className="glass-kpi"><div className="gk-label">{label}</div><div className="gk-val" style={{ color: `var(--${col})` }}>{val}</div><div className="gk-unit">{unit}</div></div>;
}

function daysAgo(dateStr) {
  return Math.floor((new Date(TODAY + "T12:00:00") - new Date(dateStr + "T12:00:00")) / 86400000);
}

export function Stats() {
  const { closures, grammage } = useStore();
  const s = SEMAINES[2]; // consommation démo (semaine en cours)

  const totalLance = Object.values(s.conso).reduce((a, v) => a + v, 0).toFixed(0);
  const consoData = [
    { n: "P.Mariné", v: s.conso.marine, c: "#E8431E" }, { n: "P.Nature", v: s.conso.nature, c: "#E8431E" },
    { n: "Hachée", v: s.conso.hachee, c: "#FA8C16" }, { n: "Merguez", v: s.conso.merguez, c: "#FA8C16" },
    { n: "Kebab", v: s.conso.kebab, c: "#FA8C16" }, { n: "Fromagère", v: s.conso.fromagere, c: "#FFC53D" },
    { n: "Frites", v: s.conso.frites, c: "#4AA3E0" }, { n: "Tortilla", v: s.conso.tortilla, c: "#4AA3E0" },
  ];

  // Pertes (closures)
  const perte = (days) => closures.filter((c) => daysAgo(c.date) < days).reduce((a, c) => a + coutPerte(grammage, c).total, 0);
  const perte7 = perte(7), perte30 = perte(30), perteJour = perte(1);

  // Pertes par catégorie (7 derniers jours)
  const catTotals = { viandes: 0, fritures: 0, frites: 0, fromagere: 0 };
  closures.filter((c) => daysAgo(c.date) < 7).forEach((c) => {
    const { detail } = coutPerte(grammage, c);
    CAT_ORDER.forEach((k) => (catTotals[k] += detail[k].cout));
  });
  const catData = CAT_ORDER.map((k) => ({ n: grammage[k].label, v: +catTotals[k].toFixed(2), c: CAT_COL[k] }));

  // Tendance hebdo (4 semaines) depuis closures
  const weeks = [0, 1, 2, 3].map((w) => {
    const lo = w * 7, hi = lo + 7;
    const euro = closures.filter((c) => daysAgo(c.date) >= lo && daysAgo(c.date) < hi).reduce((a, c) => a + coutPerte(grammage, c).total, 0);
    return { s: w === 0 ? "Cette sem." : `S-${w}`, euro: +euro.toFixed(0) };
  }).reverse();

  return (
    <>
      <div className="section-title">Statistiques</div>

      <div className="glass-grid">
        <Kpi label="Sachets lancés" val={totalLance} unit="cette semaine" c="cb" />
        <Kpi label="Pertes 7 jours" val={FMT_EUR(perte7)} unit={`≈ ${FMT_EUR(perte7 / 7)}/jour`} c="cr" />
        <Kpi label="Pertes 30 jours" val={FMT_EUR(perte30)} unit="gaspillage chiffré" c="co" />
        <Kpi label="Perte aujourd'hui" val={FMT_EUR(perteJour)} unit="fermeture du jour" c="cg" />
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-head"><div><div className="card-title">Consommation (sachets lancés)</div><div className="card-sub">Semaine en cours</div></div></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consoData} margin={{ top: 10, right: 10, bottom: 30, left: -10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="n" tick={{ fill: "#9B8C79", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "#9B8C79", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1D1712", border: "1px solid #3A2D20", borderRadius: 8, color: "#F4EFE8" }} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>{consoData.map((d, i) => <Cell key={i} fill={d.c} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div><div className="card-title">Pertes par catégorie (€)</div><div className="card-sub">7 derniers jours</div></div></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ top: 10, right: 16, bottom: 5, left: 30 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9B8C79", fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <YAxis type="category" dataKey="n" tick={{ fill: "#9B8C79", fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "#1D1712", border: "1px solid #3A2D20", borderRadius: 8, color: "#F4EFE8" }} formatter={(v) => FMT_EUR(v)} />
                <Bar dataKey="v" radius={[0, 6, 6, 0]}>{catData.map((d, i) => <Cell key={i} fill={d.c} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><div className="card-title">Évolution du coût des pertes (€)</div><div className="card-sub">4 dernières semaines</div></div></div>
        <div className="chart-wrap" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeks} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="s" tick={{ fill: "#9B8C79", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9B8C79", fontSize: 11 }} tickFormatter={(v) => `${v} €`} />
              <Tooltip contentStyle={{ background: "#1D1712", border: "1px solid #3A2D20", borderRadius: 8, color: "#F4EFE8" }} formatter={(v) => FMT_EUR(v)} />
              <Line type="monotone" dataKey="euro" stroke="#E8431E" strokeWidth={2} dot={{ r: 4, fill: "#E8431E" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
