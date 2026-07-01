import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store";
import { FMT } from "../../components/Shared";
import { TasksPage } from "../../components/TasksPage";
import { StaggeredMenu } from "../../components/StaggeredMenu";
import { Overview } from "./Overview";
import { Rapports } from "./Rapports";
import { Stats } from "./Stats";
import { Calendrier } from "./Calendrier";
import { Stock } from "./Stock";
import { Pertes } from "./Pertes";
import { Reception } from "./Reception";
import { Inventaire } from "./Inventaire";
import { Rentabilite } from "./Rentabilite";

const TODAY = new Date(2026, 4, 13);

export function ManagerApp({ restaurantName, onBack }) {
  const nav = useNavigate();
  const goBack = onBack || (() => nav("/"));
  const [page, setPage] = useState("overview");
  const { tasks } = useStore();
  const openTasks = tasks.filter((t) => !t.done).length;

  const groups = [
    { label: "Pilotage", items: [
      { id: "overview", icon: "📊", label: "Vue d'ensemble" },
      { id: "rapports", icon: "📝", label: "Rapports" },
      { id: "stats", icon: "📈", label: "Statistiques" },
      { id: "calendrier", icon: "📅", label: "Calendrier" },
    ]},
    { label: "Inventaire", items: [
      { id: "stock", icon: "📦", label: "Stock & produits" },
      { id: "pertes", icon: "💸", label: "Pertes" },
      { id: "reception", icon: "📥", label: "Réception" },
      { id: "inventaire", icon: "📋", label: "Inventaire mensuel" },
    ]},
    { label: "Finances", items: [
      { id: "rentabilite", icon: "📈", label: "Rentabilité" },
      { id: "taches", icon: "✅", label: "Tâches", badge: openTasks },
    ]},
  ];

  const titles = {
    overview: "Vue d'ensemble", rapports: "Rapports", stats: "Statistiques", calendrier: "Calendrier",
    stock: "Stock & produits", pertes: "Pertes & gaspillage", reception: "Réception marchandise", inventaire: "Inventaire mensuel",
    rentabilite: "Rentabilité", taches: "Tâches",
  };

  // Liste à plat pour le menu mobile (même ordre que la sidebar)
  const flatItems = groups.flatMap((g) => g.items);
  const menuItems = flatItems.map((it) => ({ label: it.label, ariaLabel: it.label }));
  menuItems.push({ label: restaurantName ? "← Retour admin" : "← Changer d'espace", ariaLabel: "Retour" });
  const onMenuItem = (idx) => {
    if (idx === flatItems.length) { goBack(); return; }
    setPage(flatItems[idx].id);
  };

  return (
    <div className="shell">
      <div className="otatrack-mobile-nav">
        <StaggeredMenu position="right" items={menuItems} subtitle="Manager"
          accentColor="#E8431E" colors={["#3a2a1e", "#E8431E"]} onItemClick={onMenuItem} />
      </div>
      <nav className="sidebar">
        <div className="sidebar-logo" onClick={goBack}>
          <div className="logo">OTA<span>TRACK</span></div>
          <div className="logo-sub">{restaurantName || "Manager"}</div>
        </div>
        <div className="nav">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="nav-section">{g.label}</div>
              {g.items.map((it) => (
                <div key={it.id} className={`nav-item ${page === it.id ? "active" : ""}`} onClick={() => setPage(it.id)}>
                  <span className="nav-icon">{it.icon}</span> {it.label}
                  {it.badge > 0 && <span className="nav-badge">{it.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="back-home" onClick={goBack}>{restaurantName ? "← Retour admin" : "← Changer d'espace"}</div>
        </div>
      </nav>
      <div className="main">
        <div className="topbar">
          <div className="tb-title">{titles[page]}{restaurantName && <span className="tb-resto"> · {restaurantName}</span>}</div>
          <div className="tb-right">
            {restaurantName && <span className="demo-pill">Aperçu démo</span>}
            {FMT(TODAY)}<span className="live-dot" /><span className="tb-live">EN DIRECT</span>
          </div>
        </div>
        <div className="content">
          {page === "overview" && <Overview setPage={setPage} />}
          {page === "rapports" && <Rapports />}
          {page === "stats" && <Stats />}
          {page === "calendrier" && <Calendrier />}
          {page === "stock" && <Stock />}
          {page === "pertes" && <Pertes />}
          {page === "reception" && <Reception />}
          {page === "inventaire" && <Inventaire />}
          {page === "rentabilite" && <Rentabilite />}
          {page === "taches" && <TasksPage role="manager" />}
        </div>
      </div>
    </div>
  );
}
