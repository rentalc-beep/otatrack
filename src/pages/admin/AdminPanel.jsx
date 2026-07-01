import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { AnimatedNumber, AnimatedEuro } from "../../components/Anim";
import { AdminRestaurant } from "./AdminRestaurant";

export function AdminPanel() {
  const { profile, signOut, user } = useAuth();
  const [restos, setRestos] = useState([]);
  const [users, setUsers] = useState([]);
  const [agg, setAgg] = useState({});
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [viewResto, setViewResto] = useState(null);

  const load = useCallback(async () => {
    const [r, u, rp] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at"),
      supabase.from("profiles").select("*, restaurants(name)").order("role", { ascending: false }),
      supabase.from("restaurant_products").select("restaurant_id, prix, stock"),
    ]);
    setRestos(r.data || []);
    setUsers(u.data || []);
    const a = {};
    (rp.data || []).forEach((p) => {
      const k = p.restaurant_id;
      if (!a[k]) a[k] = { n: 0, val: 0 };
      a[k].n += 1; a[k].val += (p.prix || 0) * (p.stock || 0);
    });
    setAgg(a);
  }, []);
  useEffect(() => { load(); }, [load]);

  const createResto = async () => {
    if (!name.trim()) { setMsg("Donnez un nom au restaurant."); return; }
    setBusy(true); setMsg("");
    const { error } = await supabase.rpc("create_restaurant", { p_name: name.trim(), p_city: city.trim() || null });
    setBusy(false);
    if (error) { setMsg("Erreur : " + error.message); return; }
    setName(""); setCity(""); setMsg("Restaurant créé, avec les 141 produits (stock à zéro).");
    load();
  };

  const patchUser = async (id, patch) => {
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) setMsg("Erreur : " + error.message); else load();
  };

  const totalVal = Object.values(agg).reduce((s, x) => s + x.val, 0);
  const activeCount = users.filter((u) => u.active !== false).length;
  const accountsByResto = (rid) => users.filter((u) => u.restaurant_id === rid).length;

  if (viewResto) return <AdminRestaurant restaurant={viewResto} onBack={() => setViewResto(null)} />;

  return (
    <div className="admin-wrap">
      <div className="admin-top fade-in">
        <div>
          <div className="login-logo" style={{ fontSize: 26, textAlign: "left" }}>OTA<span>TRACK</span></div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Console d'administration · {profile?.email || user?.email}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={signOut}>Se déconnecter</button>
      </div>

      {msg && <div className="admin-msg fade-in">{msg}</div>}

      <div className="glass-grid fade-in-2" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="glass-kpi"><div className="gk-label">Restaurants</div><div className="gk-val"><AnimatedNumber value={restos.length} /></div><div className="gk-unit">dans le réseau</div></div>
        <div className="glass-kpi"><div className="gk-label">Comptes</div><div className="gk-val" style={{ color: "var(--blue)" }}><AnimatedNumber value={users.length} /></div><div className="gk-unit">{activeCount} actifs</div></div>
        <div className="glass-kpi"><div className="gk-label">Valeur stock réseau</div><div className="gk-val" style={{ color: "var(--green)" }}><AnimatedEuro value={totalVal} /></div><div className="gk-unit">tous restos · HT</div></div>
        <div className="glass-kpi"><div className="gk-label">Catalogue</div><div className="gk-val" style={{ color: "var(--gold)" }}><AnimatedNumber value={141} /></div><div className="gk-unit">produits communs</div></div>
      </div>

      <div className="g2 fade-in-3" style={{ alignItems: "start" }}>
        <div>
          <div className="section-title" style={{ fontSize: 16 }}>Restaurants</div>
          {restos.length === 0 && <div className="empty-hint" style={{ padding: 20 }}>Aucun restaurant. Créez-en un ci-contre.</div>}
          {restos.map((r) => (
            <div key={r.id} className="resto-card" onClick={() => setViewResto(r)} style={{ cursor: "pointer" }}>
              <div className="resto-head">
                <div><div className="resto-name">{r.name}</div><div className="resto-city">{r.city || "—"}</div></div>
                <span className="dot on">actif</span>
              </div>
              <div className="resto-stats">
                <div className="resto-stat"><div className="v"><AnimatedNumber value={agg[r.id]?.n || 0} /></div><div className="l">produits</div></div>
                <div className="resto-stat"><div className="v" style={{ color: "var(--green)" }}><AnimatedEuro value={agg[r.id]?.val || 0} /></div><div className="l">valeur stock</div></div>
                <div className="resto-stat"><div className="v" style={{ color: "var(--blue)" }}><AnimatedNumber value={accountsByResto(r.id)} /></div><div className="l">comptes</div></div>
              </div>
              <div className="resto-cta">Voir le tableau de bord complet →</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head"><div><div className="card-title">Nouveau restaurant</div><div className="card-sub">Reçoit le catalogue automatiquement</div></div></div>
          <div className="card-body">
            <div className="fg"><label className="fl">Nom</label><input className="fi" value={name} onChange={(e) => setName(e.target.value)} placeholder="O'Tacos ..." /></div>
            <div className="fg"><label className="fl">Ville</label><input className="fi" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bruxelles" /></div>
            <button className="btn" style={{ width: "100%" }} disabled={busy} onClick={createResto}>{busy ? "Création..." : "Créer le restaurant"}</button>
          </div>
        </div>
      </div>

      <div className="section-title" style={{ fontSize: 16, marginTop: 26 }}>Comptes &amp; accès</div>
      <div className="admin-note">
        Nouveau compte : Supabase → <b>Authentication</b> → <b>Add user</b> (e-mail + mot de passe, « Auto Confirm »). Il apparaît ici — choisissez son restaurant et activez-le.
      </div>
      <div className="card">
        <div className="card-body">
          {users.length === 0 && <div className="empty-hint" style={{ padding: 12 }}>Aucun compte.</div>}
          {users.map((u) => (
            <div key={u.id} className="admin-user">
              <div style={{ minWidth: 160, flex: 1 }}>
                <div className="au-mail">{u.email || u.id.slice(0, 8)}</div>
                <div style={{ fontSize: 11, marginTop: 3 }}>
                  <span className={`dot ${u.active !== false ? "on" : "off"}`}>{u.active !== false ? "actif" : "désactivé"}</span>
                </div>
              </div>
              <div className="au-controls">
                <select className="fi fi-sm" value={u.role} onChange={(e) => patchUser(u.id, { role: e.target.value })}>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <select className="fi fi-sm" value={u.restaurant_id || ""} onChange={(e) => patchUser(u.id, { restaurant_id: e.target.value || null })}>
                  <option value="">— Aucun resto —</option>
                  {restos.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <label title="Activer / désactiver" style={{ display: "flex", alignItems: "center" }}>
                  <input type="checkbox" className="toggle" checked={u.active !== false} onChange={(e) => patchUser(u.id, { active: e.target.checked })} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
