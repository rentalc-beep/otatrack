import { PROD_LABELS } from "../data/demoData";
import { useStore } from "../lib/store";
import { coutPerte, CAT_ORDER, FMT_EUR } from "../data/grammage";

export function RapportDetail({ r, onPhoto }) {
  const { grammage } = useStore();
  if (!r) return null;
  const dateLabel = new Date(r.date + "T12:00:00").toLocaleDateString("fr-BE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const hasPertes = r.pertes && CAT_ORDER.some((k) => (r.pertes[k] || 0) > 0);
  const perteCalc = hasPertes ? coutPerte(grammage, r.pertes) : null;

  return (
    <>
      <div className="dp-date">{dateLabel}</div>
      <div className="dp-meta">Shift {r.shift} · {r.who} · {r.time}</div>

      {hasPertes && (
        <>
          <div className="dp-section-label">Pertes de fin de service — pesée</div>
          {CAT_ORDER.map((k) => {
            const d = perteCalc.detail[k];
            if (!d.kg) return null;
            return (
              <div className="dp-row" key={k}>
                <span className="dp-key">{grammage[k].icon} {grammage[k].label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="dp-val">{d.kg.toFixed(1)} kg</span>
                  <span className="reste-chip" style={{ background: "rgba(255,90,77,.1)", color: "var(--red)" }}>{FMT_EUR(d.cout)}</span>
                </div>
              </div>
            );
          })}
          <div className="dp-row" style={{ borderTop: "1px solid var(--border-2)", marginTop: 4 }}>
            <span className="dp-key" style={{ fontWeight: 700 }}>Total perte</span>
            <span className="dp-val" style={{ color: "var(--accent)" }}>{FMT_EUR(perteCalc.total)}</span>
          </div>
        </>
      )}

      <div className="dp-section-label">Cuisine — Sachets lancés</div>
      {r.cuisine ? Object.entries(PROD_LABELS).map(([k, lbl]) => (
        <div className="dp-row" key={k}>
          <span className="dp-key">{lbl}</span>
          <span className="dp-val">{r.cuisine[k] ?? "—"}</span>
        </div>
      )) : <div className="no-data">—</div>}

      <div className="dp-section-label">Caisse — Qualité service</div>
      {r.caisse ? (
        <>
          <div className="dp-row"><span className="dp-key">Service global</span><span className="dp-val">{r.caisse.service}</span></div>
          <div className="dp-row"><span className="dp-key">Temps d'attente</span><span className="dp-val">{r.caisse.attente}</span></div>
          <div className="dp-row"><span className="dp-key">Problème</span><span className="dp-val">{r.caisse.probleme}</span></div>
          {r.caisse.probleme === "Oui" && (
            <div className="dp-row"><span className="dp-key">Détail</span><span style={{ fontSize: 13, color: "var(--accent2)" }}>{r.caisse.pb_desc}</span></div>
          )}
        </>
      ) : <div className="no-data">—</div>}

      <div className="dp-section-label">Photos fermeture</div>
      {r.photo_urls && r.photo_urls.length ? (
        <>
          <div className="dp-photo-grid">
            {r.photo_urls.map((u, i) => (
              <div className="dp-photo-cell" key={i} onClick={() => onPhoto(u)}>
                <img src={u} loading="lazy" alt={`Photo ${i + 1}`} />
              </div>
            ))}
          </div>
          {r.photos > r.photo_urls.length && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
              {r.photo_urls.length} affichées · {r.photos} au total
            </div>
          )}
        </>
      ) : (
        <div className="dp-photo-note">📸 {r.photos} photo(s) — dans l'archive</div>
      )}

      {r.remarques && (
        <div style={{ background: "rgba(250,140,22,.08)", border: "1px solid rgba(250,140,22,.15)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--accent2)", marginTop: 12 }}>
          💬 {r.remarques}
        </div>
      )}
    </>
  );
}
