import { useState } from "react";
import { supabase } from "../lib/supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !pwd) { setErr("Entrez votre e-mail et mot de passe."); return; }
    setErr(""); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd });
    setBusy(false);
    if (error) setErr("E-mail ou mot de passe incorrect.");
  };

  return (
    <div className="login-wrap">
      <div className="login-stack">
        <div className="login-card">
          <div className="login-badge">Version démo</div>
          <div className="login-logo">OTA<span>TRACK</span></div>
          <div className="login-sub">Gestion d'inventaire · O'Tacos</div>
          <form onSubmit={submit}>
            <div className="fg"><label className="fl">E-mail</label>
              <input className="fi" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@restaurant.be" />
            </div>
            <div className="fg"><label className="fl">Mot de passe</label>
              <input className="fi" type="password" autoComplete="current-password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {err && <div className="login-err">{err}</div>}
            <button className="btn" style={{ width: "100%", marginTop: 6 }} disabled={busy} type="submit">
              {busy ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <div className="login-foot">Accès réservé · compte fourni par l'administrateur</div>
        </div>

        <div className="about-card">
          <div className="about-title">À propos d'OtaTrack</div>
          <p className="about-p">
            OtaTrack est une plateforme de gestion pensée pour les restaurants <b>O'Tacos</b>.
          </p>
          <p className="about-p">
            Cette version est une <b>démo</b> : elle sert à collecter les données et à commencer à construire la base
            complète qui gérera l'inventaire, les pertes, la réception des marchandises et les calculs financiers.
          </p>
          <p className="about-p">
            <b>Objectif de cette première version :</b> avoir une vue claire de l'inventaire et du stock réel de chaque restaurant.
          </p>
        </div>
      </div>
    </div>
  );
}
