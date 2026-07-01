import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, actions } from "../../lib/store";
import { TasksPage } from "../../components/TasksPage";
import { GastroIcon, FMT } from "../../components/Shared";
import { StaggeredMenu } from "../../components/StaggeredMenu";
import { NIVEAUX } from "../../data/demoData";
import { coutPerte, CAT_ORDER, FMT_EUR } from "../../data/grammage";

const TODAY = new Date(2026, 4, 13);

const VIANDES = [
  { id: "marine", name: "Poulet Mariné" }, { id: "nature", name: "Poulet Nature" },
  { id: "hachee", name: "Viande Hachée" }, { id: "merguez", name: "Merguez" }, { id: "kebab", name: "Kebab" },
];
const AUTRES = [
  { id: "fromagere", name: "Sauce Fromagère" }, { id: "frites", name: "Sachets de Frites" }, { id: "tortilla", name: "Sachets de Tortilla" },
];

export function TerrainApp() {
  const nav = useNavigate();
  const [page, setPage] = useState("accueil");
  const [shift, setShift] = useState("matin");
  const { tasks } = useStore();
  const openTasks = tasks.filter((t) => !t.done).length;

  const titles = { accueil: "Accueil", cuisine: "Rapport Cuisine", caisse: "Rapport Caisse", photos: "Photos de fermeture", taches: "Tâches" };

  const items = [
    { id: "accueil", icon: "🏠", label: "Accueil" },
    { id: "cuisine", icon: "🍳", label: "Rapport Cuisine" },
    { id: "caisse", icon: "💰", label: "Rapport Caisse" },
    { id: "photos", icon: "📸", label: "Photos" },
    { id: "taches", icon: "✅", label: "Tâches", badge: openTasks },
  ];

  const menuItems = items.map((it) => ({ label: it.label, ariaLabel: it.label }));
  menuItems.push({ label: "← Changer d'espace", ariaLabel: "Retour accueil" });
  const onMenuItem = (idx) => {
    if (idx === items.length) { nav("/"); return; }
    setPage(items[idx].id);
  };

  return (
    <div className="shell">
      <div className="otatrack-mobile-nav">
        <StaggeredMenu position="right" items={menuItems} subtitle="Terrain"
          accentColor="#FA8C16" colors={["#3a2a1e", "#FA8C16"]} onItemClick={onMenuItem} />
      </div>
      <nav className="sidebar">
        <div className="sidebar-logo" onClick={() => nav("/")}>
          <div className="logo">OTA<span>TRACK</span></div>
          <div className="logo-sub">Terrain</div>
        </div>
        <div className="nav">
          <div className="nav-section">Shift</div>
          {items.map((it) => (
            <div key={it.id} className={`nav-item ${page === it.id ? "active" : ""}`} onClick={() => setPage(it.id)}>
              <span className="nav-icon">{it.icon}</span> {it.label}
              {it.badge > 0 && <span className="nav-badge">{it.badge}</span>}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="back-home" onClick={() => nav("/")}>← Changer d'espace</div>
        </div>
      </nav>
      <div className="main">
        <div className="topbar">
          <div className="tb-title">{titles[page]}</div>
          <div className="tb-right">{FMT(TODAY)}</div>
        </div>
        <div className="content">
          {page === "accueil" && <Accueil shift={shift} setShift={setShift} openTasks={openTasks} setPage={setPage} />}
          {page === "cuisine" && <RapportCuisine shift={shift} setPage={setPage} />}
          {page === "caisse" && <RapportCaisse shift={shift} setPage={setPage} />}
          {page === "photos" && <Photos />}
          {page === "taches" && <TasksPage role="terrain" />}
        </div>
      </div>
    </div>
  );
}

function Accueil({ shift, setShift, openTasks, setPage }) {
  const tiles = [
    { icon: "🍳", label: "Rapport Cuisine", p: "cuisine" },
    { icon: "💰", label: "Rapport Caisse", p: "caisse" },
    { icon: "📸", label: "Photos fermeture", p: "photos" },
    { icon: "✅", label: "Tâches urgentes", p: "taches" },
  ];
  return (
    <div style={{ maxWidth: 680 }}>
      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="kpi co"><div className="kpi-label">Shift en cours</div><div className="kpi-val" style={{ color: "var(--accent2)" }}>{shift === "matin" ? "☀️ Matin" : "🌙 Soir"}</div><div className="kpi-unit">{shift === "matin" ? "10h-17h" : "17h-00h"}</div></div>
        <div className="kpi cr"><div className="kpi-label">Tâches à faire</div><div className="kpi-val" style={{ color: "var(--red)" }}>{openTasks}</div><div className="kpi-unit">voir l'onglet tâches</div></div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Choisir le shift</div></div>
        <div className="card-body">
          <div style={{ display: "flex", gap: 10 }}>
            <button className={`btn ${shift === "matin" ? "" : "btn-ghost"}`} style={{ flex: 1 }} onClick={() => setShift("matin")}>☀️ Matin 10h-17h</button>
            <button className={`btn ${shift === "soir" ? "" : "btn-ghost"}`} style={{ flex: 1 }} onClick={() => setShift("soir")}>🌙 Soir 17h-00h</button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Que voulez-vous faire ?</div></div>
        <div className="card-body">
          <div className="ter-tiles">
            {tiles.map((t) => (
              <div className="ter-tile" key={t.p} onClick={() => setPage(t.p)}>
                <div className="ter-tile-icon">{t.icon}</div>
                <div className="ter-tile-label">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RapportCuisine({ shift, setPage }) {
  const { grammage } = useStore();
  const [sachets, setSachets] = useState({});
  const [poids, setPoids] = useState({ viandes: "", fritures: "", frites: "", fromagere: "" });
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  const step = (id, d) => setSachets((s) => ({ ...s, [id]: Math.max(0, (s[id] || 0) + d) }));
  const setQty = (id, v) => setSachets((s) => ({ ...s, [id]: Math.max(0, parseInt(v) || 0) }));
  const setKg = (key, v) => setPoids((p) => ({ ...p, [key]: v }));

  const { detail, total } = coutPerte(grammage, poids);

  if (done) return <SuccessScreen type="Cuisine" shift={shift} onBack={() => setPage("accueil")} />;

  const submit = () => {
    if (!name.trim()) { alert("Entrez votre nom."); return; }
    actions.addClosure(
      { viandes: parseFloat(poids.viandes) || 0, fritures: parseFloat(poids.fritures) || 0, frites: parseFloat(poids.frites) || 0, fromagere: parseFloat(poids.fromagere) || 0 },
      { shift: shift === "matin" ? "Matin" : "Soir", who: name.trim() }
    );
    setDone(true);
  };

  const SachetRow = ({ v }) => (
    <div className="produit-row">
      <div className="pr-name">{v.name}</div>
      <div className="pr-fields">
        <div className="pr-field">
          <div className="pr-field-lbl">Sachets lancés</div>
          <div className="stepper">
            <button className="st-btn" onClick={() => step(v.id, -1)}>−</button>
            <input className="st-input" type="number" min="0" value={sachets[v.id] || 0} onChange={(e) => setQty(v.id, e.target.value)} />
            <button className="st-btn" onClick={() => step(v.id, 1)}>+</button>
          </div>
        </div>
      </div>
    </div>
  );

  const PeseRow = ({ catKey }) => {
    const cat = grammage[catKey];
    const d = detail[catKey];
    return (
      <div className="pese-row">
        <div className="pese-head">
          <span className="pese-icon">{cat.icon}</span>
          <div style={{ flex: 1 }}>
            <div className="pese-name">{cat.label}</div>
            <div className="pese-sub">{d.prixKg.toFixed(2)} €/kg{cat.items ? " (moy.)" : ""}</div>
          </div>
          <div className="pese-cost">{FMT_EUR(d.cout)}</div>
        </div>
        <div className="pese-input-wrap">
          <input className="fi pese-input" type="number" min="0" step="0.1" inputMode="decimal"
            value={poids[catKey]} onChange={(e) => setKg(catKey, e.target.value)} placeholder="0" />
          <span className="pese-unit">kg jetés</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Shift {shift === "matin" ? "Matin ☀️" : "Soir 🌙"} · Gare de l'Ouest</div>
      <div className="card">
        <div className="card-head"><div className="card-title">Informations</div></div>
        <div className="card-body">
          <div className="form-row-2">
            <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Nom / Prénom</label><input className="fi" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Aminee B." /></div>
            <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Date</label><input className="fi" type="date" defaultValue={TODAY.toISOString().split("T")[0]} /></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><div className="card-title">⚖️ Pertes de fin de service — pesée</div><div className="card-sub">Pesez ce qui est jeté. Le coût se calcule automatiquement.</div></div></div>
        <div className="card-body">
          {CAT_ORDER.map((k) => <PeseRow key={k} catKey={k} />)}
          <div className="pese-total">
            <span>Total perte du jour</span>
            <span className="pese-total-val">{FMT_EUR(total)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><div className="card-title">Sachets lancés (consommation)</div><div className="card-sub">Suivi de la consommation du service</div></div></div>
        <div className="card-body">
          <div className="dp-section-label" style={{ marginTop: 0 }}>Viandes</div>
          {VIANDES.map((v) => <SachetRow key={v.id} v={v} />)}
          <div className="dp-section-label">Autres produits</div>
          {AUTRES.map((v) => <SachetRow key={v.id} v={v} />)}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Remarques</div></div>
        <div className="card-body"><textarea className="fi" style={{ minHeight: 70, resize: "vertical" }} placeholder="Stock faible, incident..." /></div>
      </div>
      <button className="btn" style={{ width: "100%" }} onClick={submit}>✅ SOUMETTRE LE RAPPORT CUISINE</button>
    </div>
  );
}

function RapportCaisse({ shift, setPage }) {
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  if (done) return <SuccessScreen type="Caisse" shift={shift} onBack={() => setPage("accueil")} />;

  const Radio = ({ label, opts }) => {
    const [sel, setSel] = useState(null);
    return (
      <div className="fg">
        <label className="fl">{label}</label>
        <div style={{ display: "flex", gap: 8 }}>
          {opts.map((o) => (
            <div key={o} className={`fb ${sel === o ? "active" : ""}`} style={{ flex: 1, textAlign: "center", padding: 10 }} onClick={() => setSel(o)}>{o}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Shift {shift === "matin" ? "Matin ☀️" : "Soir 🌙"} · Gare de l'Ouest</div>
      <div className="card">
        <div className="card-head"><div className="card-title">Informations</div></div>
        <div className="card-body">
          <div className="form-row-2">
            <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Nom / Prénom</label><input className="fi" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Ayoub K." /></div>
            <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Date</label><input className="fi" type="date" defaultValue={TODAY.toISOString().split("T")[0]} /></div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Qualité du service</div></div>
        <div className="card-body">
          <Radio label="Service global" opts={["Fluide", "Moyen", "Difficile"]} />
          <Radio label="Temps d'attente client" opts={["Bon", "Moyen", "Mauvais"]} />
          <Radio label="Problème pendant le service ?" opts={["Non", "Oui"]} />
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Remarques</div></div>
        <div className="card-body"><textarea className="fi" style={{ minHeight: 70, resize: "vertical" }} placeholder="Détails..." /></div>
      </div>
      <button className="btn" style={{ width: "100%" }} onClick={() => { if (!name.trim()) { alert("Entrez votre nom."); return; } setDone(true); }}>✅ SOUMETTRE LE RAPPORT CAISSE</button>
    </div>
  );
}

function Photos() {
  const [photos, setPhotos] = useState([]);
  const add = (files) => {
    const next = [...photos];
    Array.from(files).slice(0, 8 - photos.length).forEach((f) => next.push(URL.createObjectURL(f)));
    setPhotos(next);
  };
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Maximum 8 photos · Gare de l'Ouest</div>
      <div className="card">
        <div className="card-head"><div className="card-title">Importer depuis la tablette</div></div>
        <div className="card-body">
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{photos.length} / 8 photos</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
            {photos.map((u, i) => (
              <div key={i} style={{ aspectRatio: 1, borderRadius: 10, overflow: "hidden", position: "relative" }}>
                <img src={u} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                <div onClick={() => setPhotos(photos.filter((_, j) => j !== i))} style={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, background: "rgba(0,0,0,.6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 11 }}>✕</div>
              </div>
            ))}
          </div>
          <label className="upload-zone" style={{ display: "block" }}>
            <div className="uz-icon">🗂️</div>
            <div className="uz-title">Importer des photos</div>
            <div className="uz-sub">Cliquez ou glissez (max 8)</div>
            <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => add(e.target.files)} />
          </label>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div><div className="card-title">Ou envoyer depuis le téléphone</div><div className="card-sub">Plus rapide que la tablette</div></div></div>
        <div className="card-body">
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <QRCode />
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 17, fontWeight: 700 }}>Scannez ce QR code</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginTop: 4 }}>Prenez les photos avec votre téléphone et envoyez-les directement. Elles apparaissent ici automatiquement.</div>
            </div>
          </div>
        </div>
      </div>
      <button className="btn" style={{ width: "100%" }} onClick={() => alert("✅ Photos envoyées !")}>📤 ENVOYER LES PHOTOS</button>
    </div>
  );
}

function QRCode() {
  return (
    <div style={{ width: 90, height: 90, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="78" height="78" viewBox="0 0 78 78">
        <rect width="78" height="78" fill="#fff" />
        {[[6, 6], [48, 6], [6, 48]].map(([x, y], i) => (
          <g key={i}><rect x={x} y={y} width="24" height="24" rx="2" fill="none" stroke="#1A1209" strokeWidth="3" /><rect x={x + 6} y={y + 6} width="12" height="12" fill="#1A1209" /></g>
        ))}
        {[[42, 42], [54, 42], [66, 42], [42, 54], [66, 54], [42, 66], [54, 66], [66, 66], [54, 54]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="6" height="6" fill="#1A1209" />
        ))}
      </svg>
    </div>
  );
}

function SuccessScreen({ type, shift, onBack }) {
  return (
    <div className="success">
      <div className="success-icon">✅</div>
      <div className="success-title">Rapport {type} envoyé !</div>
      <div className="success-sub">Shift {shift === "matin" ? "Matin ☀️" : "Soir 🌙"} — Bien reçu</div>
      <button className="btn btn-ghost" onClick={onBack}>← Retour à l'accueil</button>
    </div>
  );
}
