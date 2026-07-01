import { useNavigate } from "react-router-dom";
import { DEMO_MODE } from "../lib/supabase";

export function Landing() {
  const nav = useNavigate();
  return (
    <div className="landing">
      {DEMO_MODE && <div className="demo-badge">● MODE DÉMO</div>}
      <div className="land-logo">OTA<span>TRACK</span></div>
      <div className="land-tag">Gestion Fermeture &amp; Inventaire · Gare de l'Ouest</div>
      <div className="land-cards">
        <div className="land-card terrain" onClick={() => nav("/terrain")}>
          <div className="land-icon">📝</div>
          <div className="land-card-title">Espace Terrain</div>
          <div className="land-card-desc">Rapports cuisine &amp; caisse, photos de fermeture, tâches. Pour les responsables et assistants.</div>
          <div className="land-card-go">Entrer <span>→</span></div>
        </div>
        <div className="land-card manager" onClick={() => nav("/manager")}>
          <div className="land-icon">📊</div>
          <div className="land-card-title">Espace Manager</div>
          <div className="land-card-desc">Dashboard, statistiques, inventaire, fiches produits et suivi des pertes. Pour le manager.</div>
          <div className="land-card-go">Entrer <span>→</span></div>
        </div>
      </div>
      <div className="land-foot">PLATEFORME UNIFIÉE · v1.0 · 2026</div>
    </div>
  );
}
