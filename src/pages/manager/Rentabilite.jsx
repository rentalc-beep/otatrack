import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useStore, actions } from "../../lib/store";
import { coutPerte, FMT_EUR } from "../../data/grammage";

const TODAY = "2026-05-13";
const REV_COLORS = { surplace: "#E8431E", uberEats: "#5DBB46", takeaway: "#FA8C16", deliveroo: "#4AA3E0" };
const REV_LABELS = { surplace: "Sur place / à emporter", uberEats: "Uber Eats", takeaway: "Takeaway", deliveroo: "Deliveroo" };

function pct(part, whole) { return whole > 0 ? (part / whole) * 100 : 0; }
function Gauge({ value, target, invert = true }) {
  // invert: plus c'est bas, mieux c'est (food/labor cost)
  const ok = invert ? value <= target : value >= target;
  const warn = invert ? value <= target * 1.15 : value >= target * 0.85;
  const col = ok ? "var(--green)" : warn ? "var(--accent2)" : "var(--red)";
  return <div className="gauge"><div className="gauge-fill" style={{ width: `${Math.min(100, value)}%`, background: col }} /></div>;
}

export function Rentabilite() {
  const { finance, closures } = useStore();
  const r = finance.revenus;
  const caTotal = r.surplace + r.uberEats + r.takeaway + r.deliveroo;
  const caLivraison = r.uberEats + r.takeaway + r.deliveroo;

  // Coût des pertes sur 30 jours (lié à la marchandise jetée)
  const { grammage } = useStore();
  const ref = new Date(TODAY + "T12:00:00");
  const perteMois = closures
    .filter((c) => Math.floor((ref - new Date(c.date + "T12:00:00")) / 86400000) < 30)
    .reduce((a, c) => a + coutPerte(grammage, c).total, 0);

  const foodPct = pct(finance.foodCost, caTotal);
  const laborPct = pct(finance.laborCost, caTotal);
  const primePct = foodPct + laborPct;
  const pertePct = pct(perteMois, caTotal);

  // EBITDA = CA − coûts d'exploitation (matière + salaires + autres charges), hors amortissements/intérêts/impôts
  const ebitda = caTotal - finance.foodCost - finance.laborCost - finance.autresCharges;
  const ebitdaPct = pct(ebitda, caTotal);
  // Résultat net = EBITDA − amortissements − intérêts − impôts
  const resultatNet = ebitda - (finance.amortissements || 0) - (finance.interets || 0) - (finance.impots || 0);
  const resultatNetPct = pct(resultatNet, caTotal);
  const ebitdaColor = ebitdaPct >= 15 ? "var(--green)" : ebitdaPct >= 8 ? "var(--accent2)" : "var(--red)";

  const revData = Object.keys(REV_LABELS).map((k) => ({ key: k, name: REV_LABELS[k], v: r[k] }));

  const RevInput = ({ k }) => (
    <div className="fin-input-row">
      <div className="fin-input-label">{REV_LABELS[k]}{k !== "surplace" && <small>net après commission ({finance.commissions[k]}%)</small>}</div>
      <div><input className="fin-input" type="number" min="0" defaultValue={r[k]} onBlur={(e) => actions.setFinance(`revenus.${k}`, e.target.value)} /> €</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Rentabilité mensuelle — EBITDA</div>
        <span className="cat-tag">{finance.periode}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>EBITDA = chiffre d'affaires − coûts d'exploitation (matière, salaires, charges). C'est le bénéfice du restaurant avant amortissements, intérêts et impôts.</div>

      <div className="glass-grid">
        <div className="glass-kpi"><div className="gk-label">Chiffre d'affaires</div><div className="gk-val" style={{ color: "var(--blue)" }}>{FMT_EUR(caTotal)}</div><div className="gk-unit">dont {FMT_EUR(caLivraison)} livraison</div></div>
        <div className="glass-kpi"><div className="gk-label">EBITDA</div><div className="gk-val" style={{ color: ebitdaColor }}>{FMT_EUR(ebitda)}</div><div className="gk-unit">marge {ebitdaPct.toFixed(1)}% · sain 10–20%</div></div>
        <div className="glass-kpi"><div className="gk-label">Food / Labor</div><div className="gk-val" style={{ color: primePct <= 60 ? "var(--green)" : "var(--accent2)" }}>{foodPct.toFixed(0)}/{laborPct.toFixed(0)}%</div><div className="gk-unit">prime cost {primePct.toFixed(1)}%</div></div>
        <div className="glass-kpi"><div className="gk-label">Résultat net</div><div className="gk-val" style={{ color: resultatNet >= 0 ? "var(--green)" : "var(--red)" }}>{resultatNetPct.toFixed(1)}%</div><div className="gk-unit">{FMT_EUR(resultatNet)}</div></div>
      </div>

      <div className="g2">
        {/* Revenus */}
        <div className="card">
          <div className="card-head"><div><div className="card-title">Revenus par canal</div><div className="card-sub">3 sources : sur place + 3 plateformes</div></div></div>
          <div className="card-body">
            <RevInput k="surplace" />
            <RevInput k="uberEats" />
            <RevInput k="takeaway" />
            <RevInput k="deliveroo" />
            <div className="fin-input-row" style={{ borderTop: "1px solid var(--border-2)", marginTop: 4 }}>
              <div className="fin-input-label" style={{ fontWeight: 700 }}>Chiffre d'affaires total</div>
              <div className="euro" style={{ fontSize: 18 }}>{FMT_EUR(caTotal)}</div>
            </div>
          </div>
        </div>
        {/* Donut revenus */}
        <div className="card">
          <div className="card-head"><div className="card-title">Répartition du CA</div></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revData} dataKey="v" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {revData.map((d) => <Cell key={d.key} fill={REV_COLORS[d.key]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1D1712", border: "1px solid #3A2D20", borderRadius: 8, color: "#F4EFE8" }} formatter={(v) => FMT_EUR(v)} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#9B8C79" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="g2">
        {/* Coûts */}
        <div className="card">
          <div className="card-head"><div><div className="card-title">Coûts de la période</div><div className="card-sub">Saisie manuelle</div></div></div>
          <div className="card-body">
            <div className="fin-input-row">
              <div className="fin-input-label">Food cost (coût matière)<small>marchandise consommée</small></div>
              <div><input className="fin-input" type="number" min="0" defaultValue={finance.foodCost} onBlur={(e) => actions.setFinance("foodCost", e.target.value)} /> €</div>
            </div>
            <div className="fin-input-row">
              <div className="fin-input-label">Labor cost (salaires)<small>masse salariale</small></div>
              <div><input className="fin-input" type="number" min="0" defaultValue={finance.laborCost} onBlur={(e) => actions.setFinance("laborCost", e.target.value)} /> €</div>
            </div>
            <div className="fin-input-row">
              <div className="fin-input-label">Autres charges<small>loyer, énergie...</small></div>
              <div><input className="fin-input" type="number" min="0" defaultValue={finance.autresCharges} onBlur={(e) => actions.setFinance("autresCharges", e.target.value)} /> €</div>
            </div>
            <div className="fin-input-row" style={{ borderTop: "1px solid var(--border-2)", marginTop: 4 }}>
              <div className="fin-input-label" style={{ fontWeight: 700, color: ebitdaColor }}>= EBITDA</div>
              <div className="euro" style={{ fontSize: 18, color: ebitdaColor }}>{FMT_EUR(ebitda)}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", margin: "10px 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>Pour le résultat net</div>
            <div className="fin-input-row">
              <div className="fin-input-label">Amortissements<small>matériel, équipement</small></div>
              <div><input className="fin-input" type="number" min="0" defaultValue={finance.amortissements} onBlur={(e) => actions.setFinance("amortissements", e.target.value)} /> €</div>
            </div>
            <div className="fin-input-row">
              <div className="fin-input-label">Intérêts<small>emprunts, crédits</small></div>
              <div><input className="fin-input" type="number" min="0" defaultValue={finance.interets} onBlur={(e) => actions.setFinance("interets", e.target.value)} /> €</div>
            </div>
            <div className="fin-input-row">
              <div className="fin-input-label">Impôts<small>taxes</small></div>
              <div><input className="fin-input" type="number" min="0" defaultValue={finance.impots} onBlur={(e) => actions.setFinance("impots", e.target.value)} /> €</div>
            </div>
          </div>
        </div>
        {/* Indicateurs */}
        <div className="card">
          <div className="card-head"><div><div className="card-title">Indicateurs clés</div><div className="card-sub">% du chiffre d'affaires</div></div></div>
          <div className="card-body">
            <Indic label="Food cost" value={foodPct} target={30} note="cible ≤ 30%" />
            <Indic label="Labor cost" value={laborPct} target={30} note="cible ≤ 30%" />
            <Indic label="Prime cost (food + labor)" value={primePct} target={60} note="cible ≤ 60%" />
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(232,67,30,0.06)", border: "1px solid rgba(232,67,30,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>dont gaspillage (30 j)</span>
                <span className="euro" style={{ color: "var(--red)" }}>{FMT_EUR(perteMois)} · {pertePct.toFixed(1)}%</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Le gaspillage fait partie du food cost — le réduire améliore directement la marge.</div>
            </div>
            <div className="cascade">
              <div className="casc-row"><span>Chiffre d'affaires</span><b>{FMT_EUR(caTotal)}</b></div>
              <div className="casc-row neg"><span>− Food cost</span><b>−{FMT_EUR(finance.foodCost)}</b></div>
              <div className="casc-row neg"><span>− Labor cost</span><b>−{FMT_EUR(finance.laborCost)}</b></div>
              <div className="casc-row neg"><span>− Autres charges</span><b>−{FMT_EUR(finance.autresCharges)}</b></div>
              <div className="casc-row total" style={{ color: ebitdaColor }}><span>= EBITDA</span><b>{FMT_EUR(ebitda)} · {ebitdaPct.toFixed(1)}%</b></div>
              <div className="casc-row neg"><span>− Amort. / intérêts / impôts</span><b>−{FMT_EUR((finance.amortissements || 0) + (finance.interets || 0) + (finance.impots || 0))}</b></div>
              <div className="casc-row total" style={{ color: resultatNet >= 0 ? "var(--green)" : "var(--red)" }}><span>= Résultat net</span><b>{FMT_EUR(resultatNet)} · {resultatNetPct.toFixed(1)}%</b></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Indic({ label, value, target, note }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: value <= target ? "var(--green)" : value <= target * 1.15 ? "var(--accent2)" : "var(--red)" }}>{value.toFixed(1)}%</span>
      </div>
      <Gauge value={value} target={target} />
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{note}</div>
    </div>
  );
}
