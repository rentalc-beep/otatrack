import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Modal } from "../../components/Shared";
import { AnimatedNumber, AnimatedEuro, LevelBar } from "../../components/Anim";

const FMT_EUR = (n) => new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(n || 0);
const UNITES = ["kg", "unité", "L"];
const ACHATS = ["Carton", "Sachet", "Pièce"];
const monthStart = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; };

function useData(restaurantId) {
  const [products, setProducts] = useState(null);
  const [receptions, setReceptions] = useState([]);
  const reload = useCallback(async () => {
    if (!restaurantId) { setProducts([]); return; }
    const [p, r] = await Promise.all([
      supabase.from("restaurant_products").select("*").eq("restaurant_id", restaurantId).order("nom"),
      supabase.from("receptions").select("*").eq("restaurant_id", restaurantId).order("received_at", { ascending: false }).limit(300),
    ]);
    setProducts(p.data || []);
    setReceptions(r.data || []);
  }, [restaurantId]);
  useEffect(() => { reload(); }, [reload]);
  return { products, receptions, reload };
}

export function InventoryApp() {
  const { profile, signOut } = useAuth();
  const restaurantId = profile?.restaurant_id;
  const restoName = profile?.restaurants?.name || "Mon restaurant";
  const { products, receptions, reload } = useData(restaurantId);
  const [tab, setTab] = useState("stock");

  if (!restaurantId) {
    return (
      <div className="login-wrap"><div className="login-card" style={{ textAlign: "center" }}>
        <div className="login-logo">OTA<span>TRACK</span></div>
        <div style={{ color: "var(--muted)", fontSize: 14, margin: "16px 0" }}>Votre compte n'est pas encore relié à un restaurant.<br />Contactez l'administrateur.</div>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={signOut}>Se déconnecter</button>
      </div></div>
    );
  }

  const TABS = [
    { id: "stock", icon: "📦", label: "Stock" },
    { id: "reception", icon: "📥", label: "Réception" },
    { id: "inventaire", icon: "📋", label: "Inventaire" },
  ];

  return (
    <div className="inv-shell">
      <header className="inv-header fade-in">
        <div>
          <div className="login-logo" style={{ fontSize: 22, textAlign: "left" }}>OTA<span>TRACK</span></div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{restoName}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={signOut}>Déconnexion</button>
      </header>

      <nav className="inv-tabs fade-in-2">
        {TABS.map((t) => (
          <button key={t.id} className={`inv-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <main className="inv-main" key={tab}>
        {products === null
          ? <div className="empty-hint" style={{ padding: 50 }}>Chargement...</div>
          : <>
              {tab === "stock" && <StockTab products={products} reload={reload} restaurantId={restaurantId} />}
              {tab === "reception" && <ReceptionTab products={products} receptions={receptions} reload={reload} restaurantId={restaurantId} />}
              {tab === "inventaire" && <InventaireTab products={products} receptions={receptions} reload={reload} restaurantId={restaurantId} />}
            </>}
      </main>
    </div>
  );
}

/* ---------------- STOCK ---------------- */
function StockTab({ products, reload, restaurantId }) {
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [add, setAdd] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => (p.nom + p.code + (p.marque || "") + (p.cat || "")).toLowerCase().includes(q));
  }, [products, search]);

  const valeur = products.reduce((a, p) => a + (p.prix || 0) * (p.stock || 0), 0);
  const enStock = products.filter((p) => (p.stock || 0) > 0).length;

  return (
    <div className="fade-in">
      <div className="glass-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="glass-kpi"><div className="gk-label">Valeur du stock</div><div className="gk-val" style={{ color: "var(--green)" }}><AnimatedEuro value={valeur} /></div><div className="gk-unit">HT</div></div>
        <div className="glass-kpi"><div className="gk-label">En stock</div><div className="gk-val" style={{ color: "var(--blue)" }}><AnimatedNumber value={enStock} /></div><div className="gk-unit">sur {products.length} produits</div></div>
        <div className="glass-kpi"><div className="gk-label">Références</div><div className="gk-val"><AnimatedNumber value={products.length} /></div><div className="gk-unit">au catalogue</div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input className="search-input" style={{ flex: 1, marginBottom: 0, minWidth: 200 }} placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-sm" onClick={() => setAdd(true)}>+ Ajouter</button>
      </div>

      <div className="card">
        <div className="card-body flush">
          <table className="dtable">
            <thead><tr><th>Produit</th><th>Stock</th><th>Prix</th><th>Valeur</th></tr></thead>
            <tbody>
              {filtered.map((p) => {
                const ratio = p.max > 0 ? (p.stock || 0) / p.max : (p.stock > 0 ? 1 : 0);
                const col = (p.stock || 0) <= 0 ? "var(--red)" : (p.min > 0 && p.stock <= p.min) ? "var(--accent2)" : "var(--green)";
                return (
                  <tr key={p.id} onClick={() => setSel(p)} style={{ cursor: "pointer" }}>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ fontWeight: 600 }}>{p.nom}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat} · {p.marque || "—"}</div>
                      <LevelBar ratio={ratio} color={col} />
                    </td>
                    <td><span className="stock-num" style={{ fontSize: 17, color: col }}>{p.stock || 0}</span> <span style={{ fontSize: 10, color: "var(--muted)" }}>{p.unite}</span></td>
                    <td style={{ color: "var(--muted)" }}>{(p.prix || 0).toFixed(2)} €</td>
                    <td className="euro">{FMT_EUR((p.prix || 0) * (p.stock || 0))}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={4} className="empty-hint" style={{ padding: 24 }}>Aucun produit trouvé. Utilisez « + Ajouter ».</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {sel && <EditModal p={sel} onClose={() => setSel(null)} reload={reload} />}
      {add && <AddModal restaurantId={restaurantId} onClose={() => setAdd(false)} reload={reload} />}
    </div>
  );
}

/* ---------------- RÉCEPTION ---------------- */
function ReceptionTab({ products, receptions, reload, restaurantId }) {
  const [code, setCode] = useState(products[0]?.code || "");
  const [qty, setQty] = useState("");
  const [busy, setBusy] = useState(false);

  const sel = products.find((p) => p.code === code) || products[0];
  const achat = sel?.achat || "Carton";
  const qa = sel?.qte_achat || 1;
  const unite = sel?.unite || "unité";
  const baseQty = (parseFloat(qty) || 0) * qa;

  const save = async () => {
    const n = parseFloat(qty);
    if (!n || n <= 0) { alert("Entrez une quantité valide."); return; }
    setBusy(true);
    await supabase.from("receptions").insert({ restaurant_id: restaurantId, product_id: sel.id, code: sel.code, nom: sel.nom, qty: n * qa, source: "Manuel" });
    await supabase.from("restaurant_products").update({ stock: (sel.stock || 0) + n * qa }).eq("id", sel.id);
    setBusy(false); setQty(""); await reload();
  };

  return (
    <div className="g2 fade-in" style={{ alignItems: "start" }}>
      <div className="card">
        <div className="card-head"><div><div className="card-title">Réceptionner de la marchandise</div><div className="card-sub">Entrez ce que vous avez reçu</div></div></div>
        <div className="card-body">
          <div className="fg"><label className="fl">Produit</label>
            <select className="fi" value={code} onChange={(e) => setCode(e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.code}>{p.nom}</option>)}
            </select>
          </div>
          <div className="fg"><label className="fl">Quantité reçue (en {achat.toLowerCase()})</label>
            <input className="fi" type="number" min="0" step="0.1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={`Nombre de ${achat.toLowerCase()}s`} />
          </div>
          {parseFloat(qty) > 0 && <div className="conv-hint">1 {achat.toLowerCase()} = {qa} {unite} → <b>+{baseQty.toFixed(1)} {unite}</b> ajoutés au stock</div>}
          <button className="btn" style={{ width: "100%" }} disabled={busy} onClick={save}>{busy ? "..." : "Ajouter au stock"}</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-head"><div><div className="card-title">Dernières réceptions</div><div className="card-sub">{receptions.length} entrée(s)</div></div></div>
        <div className="card-body">
          {receptions.length === 0 && <div className="empty-hint">Aucune réception enregistrée.</div>}
          {receptions.slice(0, 25).map((m) => (
            <div className="recep-item" key={m.id}>
              <div className="recep-icon">↓</div>
              <div className="recep-main"><div className="recep-prod">{m.nom || m.code}</div><div className="recep-meta">{m.source} · {new Date(m.received_at).toLocaleDateString("fr-BE")}</div></div>
              <div className="recep-qty" style={{ color: "var(--green)" }}>+{m.qty}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- INVENTAIRE MENSUEL ---------------- */
function InventaireTab({ products, receptions, reload, restaurantId }) {
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const ms = monthStart();

  const achatsByCode = useMemo(() => {
    const a = {};
    receptions.filter((r) => new Date(r.received_at) >= ms).forEach((r) => { a[r.code] = (a[r.code] || 0) + (r.qty || 0); });
    return a;
  }, [receptions]);

  const rows = useMemo(() => products.map((p) => {
    const debut = p.stock_debut || 0;
    const achats = achatsByCode[p.code] || 0;
    const actuel = p.stock || 0;
    const consomme = Math.max(0, +(debut + achats - actuel).toFixed(1));
    return { ...p, debut, achats, actuel, consomme, vConso: consomme * (p.prix || 0), vDebut: debut * (p.prix || 0), vAchats: achats * (p.prix || 0), vActuel: actuel * (p.prix || 0) };
  }), [products, achatsByCode]);

  const tot = rows.reduce((a, r) => ({ debut: a.debut + r.vDebut, achats: a.achats + r.vAchats, actuel: a.actuel + r.vActuel, conso: a.conso + r.vConso }), { debut: 0, achats: 0, actuel: 0, conso: 0 });

  let data = rows;
  if (search) { const q = search.toLowerCase(); data = data.filter((p) => (p.nom + p.cat).toLowerCase().includes(q)); }
  data = [...data].sort((a, b) => b.vConso - a.vConso);

  const startMonth = async () => {
    if (!confirm("Démarrer un nouveau mois ?\nLe stock actuel devient le stock de début, et le calcul du consommé repart de cette base. À faire le 1er du mois.")) return;
    setBusy(true);
    await supabase.rpc("start_inventory_month", { p_restaurant: restaurantId });
    setBusy(false); await reload();
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 460, lineHeight: 1.5 }}>
          Consommé = stock de début + marchandise reçue − stock actuel. En fin de mois, comptez le stock réel dans l'onglet <b>Stock</b>, puis démarrez le mois suivant.
        </div>
        <button className="btn btn-sm" disabled={busy} onClick={startMonth}>{busy ? "..." : "🔄 Démarrer le mois"}</button>
      </div>

      <div className="glass-grid">
        <div className="glass-kpi"><div className="gk-label">Stock début</div><div className="gk-val" style={{ color: "var(--muted)" }}><AnimatedEuro value={tot.debut} /></div><div className="gk-unit">début de mois</div></div>
        <div className="glass-kpi"><div className="gk-label">Achats du mois</div><div className="gk-val" style={{ color: "var(--blue)" }}><AnimatedEuro value={tot.achats} /></div><div className="gk-unit">marchandise reçue</div></div>
        <div className="glass-kpi"><div className="gk-label">Consommé</div><div className="gk-val" style={{ color: "var(--accent2)" }}><AnimatedEuro value={tot.conso} /></div><div className="gk-unit">sorti du stock</div></div>
        <div className="glass-kpi"><div className="gk-label">Stock actuel</div><div className="gk-val" style={{ color: "var(--green)" }}><AnimatedEuro value={tot.actuel} /></div><div className="gk-unit">reste en stock</div></div>
      </div>

      <div className="card glass-card">
        <div className="card-body">
          <div className="recon">
            <div className="recon-box"><div className="rb-l">Stock début</div><div className="rb-v">{FMT_EUR(tot.debut)}</div></div>
            <div className="recon-op">+</div>
            <div className="recon-box"><div className="rb-l">Achats</div><div className="rb-v" style={{ color: "var(--blue)" }}>{FMT_EUR(tot.achats)}</div></div>
            <div className="recon-op">−</div>
            <div className="recon-box"><div className="rb-l">Consommé</div><div className="rb-v" style={{ color: "var(--accent2)" }}>{FMT_EUR(tot.conso)}</div></div>
            <div className="recon-op">=</div>
            <div className="recon-box hl"><div className="rb-l">Stock actuel</div><div className="rb-v" style={{ color: "var(--green)" }}>{FMT_EUR(tot.actuel)}</div></div>
          </div>
        </div>
      </div>

      <input className="search-input" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card">
        <div className="card-head"><div><div className="card-title">Détail par produit</div><div className="card-sub">{data.length} produit(s) · trié par valeur consommée</div></div></div>
        <div className="card-body flush">
          <table className="dtable">
            <thead><tr><th>Produit</th><th>Début</th><th>Achats</th><th>Actuel</th><th>Consommé</th><th>Valeur</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat}</div></td>
                  <td style={{ color: "var(--muted)" }}>{p.debut} {p.unite}</td>
                  <td style={{ color: "var(--blue)" }}>+{p.achats}</td>
                  <td style={{ color: "var(--green)" }}>{p.actuel}</td>
                  <td><span className="stock-num" style={{ fontSize: 16, color: "var(--accent2)" }}>{p.consomme}</span></td>
                  <td className="euro">{FMT_EUR(p.vConso)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MODALES PRODUIT ---------------- */
function Field({ label, children }) { return <div className="fg" style={{ marginBottom: 12 }}><label className="fl">{label}</label>{children}</div>; }

function ProductFields({ form, set }) {
  return (
    <>
      <Field label="Nom"><input className="fi" value={form.nom} onChange={(e) => set("nom", e.target.value)} /></Field>
      <div className="form-row-2">
        <Field label="Catégorie"><input className="fi" value={form.cat || ""} onChange={(e) => set("cat", e.target.value)} /></Field>
        <Field label="Marque"><input className="fi" value={form.marque || ""} onChange={(e) => set("marque", e.target.value)} /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Unité de stock"><select className="fi" value={form.unite} onChange={(e) => set("unite", e.target.value)}>{UNITES.map((u) => <option key={u}>{u}</option>)}</select></Field>
        <Field label="Prix HT (€)"><input className="fi" type="number" step="0.01" min="0" value={form.prix} onChange={(e) => set("prix", e.target.value)} /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Acheté en"><select className="fi" value={form.achat} onChange={(e) => set("achat", e.target.value)}>{ACHATS.map((a) => <option key={a}>{a}</option>)}</select></Field>
        <Field label={`${form.unite}/${(form.achat || "carton").toLowerCase()}`}><input className="fi" type="number" step="0.1" min="0" value={form.qte_achat} onChange={(e) => set("qte_achat", e.target.value)} /></Field>
      </div>
      <div className="form-row-2">
        <Field label="Stock actuel"><input className="fi" type="number" step="0.1" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></Field>
        <Field label="Seuil min."><input className="fi" type="number" step="0.1" min="0" value={form.min} onChange={(e) => set("min", e.target.value)} /></Field>
      </div>
    </>
  );
}
const numClean = (o, keys) => { const c = { ...o }; keys.forEach((k) => { c[k] = parseFloat(c[k]) || 0; }); return c; };

function EditModal({ p, onClose, reload }) {
  const [form, setForm] = useState({ ...p, achat: p.achat || "Carton", qte_achat: p.qte_achat || 1 });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    setBusy(true);
    const patch = numClean({ nom: form.nom, cat: form.cat, marque: form.marque, unite: form.unite, prix: form.prix, stock: form.stock, min: form.min, achat: form.achat, qte_achat: form.qte_achat }, ["prix", "stock", "min", "qte_achat"]);
    await supabase.from("restaurant_products").update(patch).eq("id", p.id);
    setBusy(false); await reload(); onClose();
  };
  const del = async () => { if (!confirm(`Supprimer "${p.nom}" ?`)) return; await supabase.from("restaurant_products").delete().eq("id", p.id); await reload(); onClose(); };
  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Modifier le produit</div>
      <ProductFields form={form} set={set} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={save}>{busy ? "..." : "Enregistrer"}</button>
        <button className="btn btn-ghost" style={{ color: "var(--red)", borderColor: "rgba(255,90,77,.4)" }} onClick={del}>Supprimer</button>
      </div>
    </Modal>
  );
}

function AddModal({ restaurantId, onClose, reload }) {
  const [form, setForm] = useState({ nom: "", cat: "", marque: "", unite: "unité", prix: "", achat: "Carton", qte_achat: "", stock: "", min: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const create = async () => {
    if (!form.nom.trim()) { alert("Donnez un nom au produit."); return; }
    setBusy(true);
    const code = "P" + Date.now().toString().slice(-7);
    const row = numClean({ restaurant_id: restaurantId, code, nom: form.nom, cat: form.cat || "Divers", marque: form.marque, unite: form.unite, prix: form.prix, stock: form.stock, stock_debut: form.stock, min: form.min, max: 0, tva: 6, achat: form.achat, qte_achat: form.qte_achat, is_custom: true }, ["prix", "stock", "stock_debut", "min", "qte_achat"]);
    const { error } = await supabase.from("restaurant_products").insert(row);
    setBusy(false);
    if (error) { alert("Erreur : " + error.message); return; }
    await reload(); onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Ajouter un produit</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Ajouté uniquement à votre restaurant.</div>
      <ProductFields form={form} set={set} />
      <button className="btn" style={{ width: "100%", marginTop: 8 }} disabled={busy} onClick={create}>{busy ? "..." : "Créer le produit"}</button>
    </Modal>
  );
}
