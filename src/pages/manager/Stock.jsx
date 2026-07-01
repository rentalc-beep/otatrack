import { useState, useMemo } from "react";
import { useStore, actions } from "../../lib/store";
import { CATEGORIES } from "../../data/demoData";
import { statusOf, Modal } from "../../components/Shared";
import { FMT_EUR } from "../../data/grammage";

const CAT_COL = ["#E8431E", "#FA8C16", "#FFC53D", "#4AA3E0", "#5DBB46", "#C2360F", "#9B8C79", "#8E7CC3"];

function Kpi({ label, val, unit, c }) {
  const col = c === "cr" ? "red" : c === "co" ? "accent2" : c === "cg" ? "green" : "blue";
  return <div className={`kpi ${c}`}><div className="kpi-label">{label}</div><div className="kpi-val" style={{ color: `var(--${col})` }}>{val}</div><div className="kpi-unit">{unit}</div></div>;
}

export function Stock() {
  const { produits } = useStore();
  const [cat, setCat] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("nom");
  const [sel, setSel] = useState(null);
  const [add, setAdd] = useState(false);

  // KPIs globaux
  const valeurTotale = produits.reduce((a, p) => a + p.prix * p.stock, 0);
  const ruptures = produits.filter((p) => p.stock === 0).length;
  const sousSeuil = produits.filter((p) => p.stock > 0 && p.stock < p.min).length;

  // Valeur par catégorie (top 8)
  const valParCat = useMemo(() => {
    const m = {};
    produits.forEach((p) => { m[p.cat] = (m[p.cat] || 0) + p.prix * p.stock; });
    const arr = Object.entries(m).map(([c, v]) => ({ cat: c, v })).sort((a, b) => b.v - a.v);
    return arr.slice(0, 8);
  }, [produits]);
  const maxCatVal = valParCat.length ? valParCat[0].v : 1;

  // Filtrage + tri
  let data = produits;
  if (cat !== "Toutes") data = data.filter((p) => p.cat === cat);
  if (search) data = data.filter((p) => (p.nom + p.code + p.marque).toLowerCase().includes(search.toLowerCase()));
  data = [...data];
  if (sort === "nom") data.sort((a, b) => a.nom.localeCompare(b.nom));
  else if (sort === "valeur") data.sort((a, b) => b.prix * b.stock - a.prix * a.stock);
  else if (sort === "alerte") {
    const rank = (p) => (p.stock === 0 ? 0 : p.stock < p.min ? 1 : 2);
    data.sort((a, b) => rank(a) - rank(b) || a.nom.localeCompare(b.nom));
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Stock &amp; produits</div>
        <button className="btn btn-sm" onClick={() => setAdd(true)}>+ Ajouter un produit</button>
      </div>

      <div className="kpi-grid">
        <Kpi label="Valeur du stock" val={FMT_EUR(valeurTotale)} unit="total HT" c="cb" />
        <Kpi label="Références" val={produits.length} unit="produits actifs" c="cg" />
        <Kpi label="Ruptures" val={ruptures} unit="stock à zéro" c="cr" />
        <Kpi label="Sous le seuil" val={sousSeuil} unit="à recommander" c="co" />
      </div>

      <div className="card">
        <div className="card-head"><div><div className="card-title">Valeur du stock par catégorie</div><div className="card-sub">Où est immobilisé l'argent · top 8</div></div></div>
        <div className="card-body">
          {valParCat.map((d, i) => (
            <div key={d.cat} style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setCat(d.cat)}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{d.cat}</span>
                <span className="euro" style={{ color: "var(--muted)" }}>{FMT_EUR(d.v)}</span>
              </div>
              <div className="gauge"><div className="gauge-fill" style={{ width: `${(d.v / maxCatVal) * 100}%`, background: CAT_COL[i % CAT_COL.length] }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-row">
        {CATEGORIES.map((c) => <button key={c} className={`fb ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <input className="search-input" style={{ flex: 1, minWidth: 200, marginBottom: 0 }} placeholder="Rechercher produit, code, marque..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="seg">
          <button className={sort === "nom" ? "on" : ""} onClick={() => setSort("nom")}>Nom</button>
          <button className={sort === "valeur" ? "on" : ""} onClick={() => setSort("valeur")}>Valeur</button>
          <button className={sort === "alerte" ? "on" : ""} onClick={() => setSort("alerte")}>Alertes</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-sub">{data.length} produit(s) affiché(s)</div></div>
        <div className="card-body flush">
          <table className="dtable">
            <thead><tr><th>Produit</th><th>Catégorie</th><th>Stock</th><th>Prix HT</th><th>Valeur</th><th>Statut</th></tr></thead>
            <tbody>
              {data.length ? data.map((p) => {
                const st = statusOf(p), pct = Math.min(100, Math.round((p.stock / p.max) * 100));
                const col = st === "out" ? "var(--red)" : st === "low" ? "var(--accent2)" : "var(--green)";
                const pill = st === "out" ? <span className="status-pill s-out">Rupture</span> : st === "low" ? <span className="status-pill s-low">Stock bas</span> : <span className="status-pill s-ok">OK</span>;
                return (
                  <tr key={p.code} onClick={() => setSel(p)}>
                    <td><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.code} · {p.marque}</div></td>
                    <td><span className="cat-tag">{p.cat}</span></td>
                    <td><div className="stock-level"><span className="stock-num" style={{ color: col }}>{p.stock}</span><span style={{ fontSize: 10, color: "var(--muted)" }}>{p.unite}</span></div><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>min {p.min} · max {p.max}</div></td>
                    <td style={{ color: "var(--muted)" }}>{p.prix.toFixed(2)} €</td>
                    <td className="euro">{FMT_EUR(p.prix * p.stock)}</td>
                    <td>{pill}</td>
                  </tr>
                );
              }) : <tr><td colSpan="6" className="no-data">Aucun produit</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {sel && <ProductModal p={sel} onClose={() => setSel(null)} />}
      {add && <AddProductModal onClose={() => setAdd(false)} />}
    </>
  );
}

const UNITES = ["kg", "unité", "L"];
const ACHATS = ["Carton", "Sachet", "Pièce"];
const CATS_NO_ALL = CATEGORIES.filter((c) => c !== "Toutes");

function Field({ label, children }) {
  return <div className="fg" style={{ marginBottom: 12 }}><label className="fl">{label}</label>{children}</div>;
}

function ProductForm({ form, set }) {
  return (
    <>
      <Field label="Nom du produit"><input className="fi" value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Ex : Nuggets de poulet" /></Field>
      <div className="form-row-2">
        <Field label="Catégorie">
          <select className="fi" value={form.cat} onChange={(e) => set("cat", e.target.value)}>
            {CATS_NO_ALL.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Marque"><input className="fi" value={form.marque} onChange={(e) => set("marque", e.target.value)} placeholder="Ex : Bidfood" /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Unité de stock">
          <select className="fi" value={form.unite} onChange={(e) => set("unite", e.target.value)}>{UNITES.map((u) => <option key={u}>{u}</option>)}</select>
        </Field>
        <Field label="Prix unitaire HT (€)"><input className="fi" type="number" step="0.01" min="0" value={form.prix} onChange={(e) => set("prix", e.target.value)} /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Acheté en">
          <select className="fi" value={form.achat} onChange={(e) => set("achat", e.target.value)}>{ACHATS.map((a) => <option key={a}>{a}</option>)}</select>
        </Field>
        <Field label={`${form.unite} par ${(form.achat || "carton").toLowerCase()}`}><input className="fi" type="number" step="0.1" min="0" value={form.qteAchat} onChange={(e) => set("qteAchat", e.target.value)} placeholder="Ex : 10" /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Stock actuel"><input className="fi" type="number" step="0.1" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></Field>
        <Field label="TVA (%)"><input className="fi" type="number" min="0" value={form.tva} onChange={(e) => set("tva", e.target.value)} /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Seuil minimum"><input className="fi" type="number" step="0.1" min="0" value={form.min} onChange={(e) => set("min", e.target.value)} /></Field>
        <Field label="Stock maximum"><input className="fi" type="number" step="0.1" min="0" value={form.max} onChange={(e) => set("max", e.target.value)} /></Field>
      </div>
    </>
  );
}

function ProductModal({ p, onClose }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...p, achat: p.achat || "Carton", qteAchat: p.qteAchat || 1 });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const st = statusOf(p);
  const col = st === "out" ? "var(--red)" : st === "low" ? "var(--accent2)" : "var(--green)";
  const pill = st === "out" ? <span className="status-pill s-out">Rupture</span> : st === "low" ? <span className="status-pill s-low">Stock bas</span> : <span className="status-pill s-ok">OK</span>;
  const Row = ({ k, v }) => <div className="dp-row"><span className="dp-key">{k}</span><span style={{ fontSize: 14, fontWeight: 500, textAlign: "right", maxWidth: 260 }}>{v}</span></div>;

  const save = () => { actions.updateProduit(p.code, form); onClose(); };
  const del = () => { if (confirm(`Supprimer "${p.nom}" ?`)) { actions.deleteProduit(p.code); onClose(); } };

  if (edit) {
    return (
      <Modal onClose={onClose}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Modifier le produit</div>
        <ProductForm form={form} set={set} />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={save}>Enregistrer</button>
          <button className="btn btn-ghost" onClick={() => setEdit(false)}>Annuler</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 800 }}>{p.nom}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>{p.code} · {p.marque}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div><div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 44, fontWeight: 800, color: col, lineHeight: 1 }}>{p.stock}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.unite} en stock</div></div>
        {pill}
      </div>
      <div className="dp-section-label">Informations produit</div>
      <Row k="Catégorie" v={p.cat} /><Row k="Marque" v={p.marque} /><Row k="Description" v={p.desc} />
      <Row k="Unité de stock" v={p.unite} /><Row k="Acheté en" v={`${p.achat || "Carton"} (${p.qteAchat || 1} ${p.unite}/${(p.achat || "carton").toLowerCase()})`} />
      <Row k={`Prix unitaire (HT / ${p.unite})`} v={`${p.prix.toFixed(2)} €`} /><Row k="Valeur en stock (HT)" v={FMT_EUR(p.prix * p.stock)} />
      {p.tva !== undefined && <Row k="TVA" v={`${p.tva} %`} />}
      <div className="dp-section-label">Seuils</div>
      <Row k="Seuil minimum" v={`${p.min} ${p.unite}`} /><Row k="Stock maximum" v={`${p.max} ${p.unite}`} />
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => setEdit(true)}>✏️ Modifier</button>
        <button className="btn btn-ghost" style={{ color: "var(--red)", borderColor: "rgba(255,90,77,.4)" }} onClick={del}>Supprimer</button>
      </div>
    </Modal>
  );
}

function AddProductModal({ onClose }) {
  const [form, setForm] = useState({ code: "", nom: "", cat: CATS_NO_ALL[0], marque: "", unite: "unité", prix: "", achat: "Carton", qteAchat: "", stock: "", tva: 6, min: "", max: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const create = () => {
    if (!form.nom.trim()) { alert("Donnez un nom au produit."); return; }
    actions.addProduit(form);
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Ajouter un produit</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Le code est généré automatiquement si vous le laissez vide.</div>
      <Field label="Code produit (optionnel)"><input className="fi" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="Ex : 39342 ou laisser vide" /></Field>
      <ProductForm form={form} set={set} />
      <button className="btn" style={{ width: "100%", marginTop: 8 }} onClick={create}>Créer le produit</button>
    </Modal>
  );
}
