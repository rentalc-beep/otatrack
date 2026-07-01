import { useState } from "react";
import { useStore } from "../../lib/store";
import { RapportDetail } from "../../components/RapportDetail";
import { Lightbox, useLightbox } from "../../components/Shared";

export function Rapports() {
  const { rapports } = useStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const lb = useLightbox();

  let data = rapports;
  if (filter !== "all") data = data.filter((r) => r.shift === filter);
  if (search) data = data.filter((r) => (r.date + r.who + r.shift).toLowerCase().includes(search.toLowerCase()));

  const filters = [{ k: "all", l: "Tous" }, { k: "Matin", l: "☀️ Matin" }, { k: "Soir", l: "🌙 Soir" }];

  return (
    <div className="detail-split">
      <div>
        <div className="filter-row">
          {filters.map((f) => (
            <button key={f.k} className={`fb ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>{f.l}</button>
          ))}
        </div>
        <input className="search-input" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {data.length ? (
          <table className="dtable"><tbody>
            {data.map((r) => {
              const dot = r.status === "ok" ? "var(--green)" : "var(--accent2)";
              return (
                <tr key={r.id} onClick={() => setSel(r)} style={sel?.id === r.id ? { background: "rgba(212,56,13,0.06)" } : {}}>
                  <td style={{ width: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} /></td>
                  <td><div style={{ fontWeight: 600 }}>{r.date.split("-").reverse().join("/")} — {r.shift}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{r.who} · {r.time}</div></td>
                  <td style={{ textAlign: "right" }}><span className="cat-tag">📸 {r.photos}</span></td>
                </tr>
              );
            })}
          </tbody></table>
        ) : <div className="no-data">Aucun rapport</div>}
      </div>
      <div>
        {sel ? (
          <div className="detail-panel"><RapportDetail r={sel} onPhoto={lb.open} /></div>
        ) : (
          <div className="dp-empty">Cliquez sur un rapport pour voir le détail</div>
        )}
      </div>
      <Lightbox url={lb.url} onClose={lb.close} />
    </div>
  );
}
