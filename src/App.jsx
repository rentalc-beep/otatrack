import { Routes, Route } from "react-router-dom";
import { DEMO_MODE } from "./lib/supabase";
import { useAuth } from "./lib/auth";
import { Landing } from "./pages/Landing";
import { ManagerApp } from "./pages/manager/ManagerApp";
import { TerrainApp } from "./pages/terrain/TerrainApp";
import { Login } from "./pages/Login";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { InventoryApp } from "./pages/manager/InventoryApp";

function Splash({ text }) {
  return (
    <div className="login-wrap">
      <div style={{ textAlign: "center" }}>
        <div className="login-logo" style={{ fontSize: 30 }}>OTA<span>TRACK</span></div>
        <div style={{ color: "var(--muted)", marginTop: 10, fontSize: 13 }}>{text}</div>
      </div>
    </div>
  );
}

function AuthedApp() {
  const { session, profile, loading, signOut } = useAuth();
  if (loading) return <Splash text="Chargement..." />;
  if (!session) return <Login />;
  if (!profile) return <Splash text="Préparation de votre espace..." />;
  if (profile.active === false) {
    return (
      <div className="login-wrap">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div className="login-logo">OTA<span>TRACK</span></div>
          <div style={{ color: "var(--muted)", fontSize: 14, margin: "18px 0", lineHeight: 1.5 }}>
            Ce compte est désactivé.<br />Contactez l'administrateur pour le réactiver.
          </div>
          <button className="btn btn-ghost" style={{ width: "100%" }} onClick={signOut}>Se déconnecter</button>
        </div>
      </div>
    );
  }
  if (profile.role === "admin") return <AdminPanel />;
  return <InventoryApp />;
}

export default function App() {
  // Mode démo (sans Supabase configuré) : ancien fonctionnement à 2 espaces.
  if (DEMO_MODE) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/manager/*" element={<ManagerApp />} />
        <Route path="/terrain/*" element={<TerrainApp />} />
      </Routes>
    );
  }
  // Mode réel (Supabase) : authentification + comptes.
  return <AuthedApp />;
}
