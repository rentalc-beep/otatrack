import { useState } from "react";
import { useStore } from "../../lib/store";
import { RapportDetail } from "../../components/RapportDetail";
import { Lightbox, useLightbox } from "../../components/Shared";

const CAL_STATUS = {
  "2026-05-13": "today", "2026-05-12": "ok", "2026-05-11": "ok", "2026-05-10": "warn",
  "2026-05-09": "ok", "2026-05-08": "ok", "2026-05-07": "ok", "2026-05-06": "ok", "2026-05-05": "warn",
};
const DOT = { ok: "var(--green)", warn: "var(--accent2)" };

export function Calendrier() {
  const { rapports } = useStore();
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState(0);
  const lb = useLightbox();

  const first = new Date(2026, 4, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= 31; d++) cells.push(d);

  const dayReports = sel ? rapports.filter((r) => r.date === sel) : [];
  const dateLabel = sel ? new Date(sel + "T12:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <>
      <div className="section-title">Calendrier Mai 2026</div>
      <div className="detail-split">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700 }}>Mai 2026</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="status-pill s-ok">Complet</span><span className="status-pill s-low">Partiel</span><span className="status-pill s-out">Manquant</span>
              </div>
            </div>
            <div className="cal-labels">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((l) => <div className="cl" key={l}>{l}</div>)}</div>
            <div className="cal-grid">
              {cells.map((d, i) => {
                if (!d) return <div className="cd empty" key={i} />;
                const key = `2026-05-${String(d).padStart(2, "0")}`;
                const st = CAL_STATUS[key];
                const cls = st === "today" ? "today" : st ? "has-data" : "";
                return (
                  <div key={i} className={`cd ${cls} ${sel === key ? "selected" : ""}`} onClick={() => { setSel(key); setTab(0); }}>
                    {d}
                    {st && st !== "today" && <div className="cd-dots"><div className="cd-dot" style={{ background: DOT[st] }} /></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          {sel && dayReports.length ? (
            <div className="detail-panel">
              <div className="dp-date">{dateLabel}</div>
              <div className="dp-tabs">
                {dayReports.map((r, i) => (
                  <button key={i} className={`dp-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{r.shift}</button>
                ))}
              </div>
              <RapportDetail r={dayReports[tab]} onPhoto={lb.open} />
            </div>
          ) : sel ? (
            <div className="dp-empty">Aucun rapport pour le<br /><strong style={{ color: "var(--text)" }}>{dateLabel}</strong></div>
          ) : (
            <div className="dp-empty">Cliquez sur un jour pour voir les rapports</div>
          )}
        </div>
      </div>
      <Lightbox url={lb.url} onClose={lb.close} />
    </>
  );
}
