import { useState } from "react";
import { useStore, actions } from "../lib/store";
import { Modal, useLightbox, Lightbox } from "./Shared";

export function TasksPage({ role }) {
  const { tasks } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const lb = useLightbox();
  const active = tasks.filter((t) => !t.done);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Tâches & messages</div>
        <button className="btn btn-sm" onClick={() => setShowAdd(true)}>+ Nouvelle tâche</button>
      </div>

      {active.length === 0 ? (
        <div className="no-data" style={{ padding: 50 }}>✅ Aucune tâche en cours — tout est fait !</div>
      ) : (
        active.map((t) => (
          <div className={`task-card ${t.prio === "urgent" ? "urgent" : ""}`} key={t.id}>
            {t.img && <img className="task-img" src={t.img} onClick={() => lb.open(t.img)} alt="" />}
            <div className="task-main">
              <div className="task-title">{t.title}</div>
              <div className="task-desc">{t.desc}</div>
              <div className="task-meta">
                <span className={`task-prio ${t.prio === "urgent" ? "tp-urgent" : "tp-normal"}`}>
                  {t.prio === "urgent" ? "🔴 Urgent" : "🟠 Normal"}
                </span>
                <span>Par {t.by}</span>
                <span>{t.date}</span>
              </div>
            </div>
            <button className="task-check" onClick={() => actions.completeTask(t.id)} title="Marquer comme fait">✓</button>
          </div>
        ))
      )}

      {showAdd && <AddTaskModal role={role} onClose={() => setShowAdd(false)} />}
      <Lightbox url={lb.url} onClose={lb.close} />
    </>
  );
}

function AddTaskModal({ role, onClose }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [prio, setPrio] = useState("normal");

  const submit = () => {
    if (!title.trim()) return;
    actions.addTask({
      title: title.trim(),
      desc: desc.trim() || "—",
      prio,
      by: role === "manager" ? "Manager" : "Responsable",
      date: "13/05 " + new Date().toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" }),
      img: "",
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Nouvelle tâche</div>
      <div className="fg"><label className="fl">Titre</label><input className="fi" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Nettoyer la friteuse" /></div>
      <div className="fg"><label className="fl">Description</label><textarea className="fi" style={{ minHeight: 70, resize: "vertical" }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Détails..." /></div>
      <div className="fg"><label className="fl">Priorité</label>
        <select className="fi" value={prio} onChange={(e) => setPrio(e.target.value)}>
          <option value="normal">🟠 Normal</option>
          <option value="urgent">🔴 Urgent</option>
        </select>
      </div>
      <div className="fg">
        <label className="fl">Photo (optionnel)</label>
        <div className="upload-zone" style={{ padding: 20, marginBottom: 0 }} onClick={() => alert("En production : sélection d'image depuis tablette/téléphone")}>
          <div style={{ fontSize: 28 }}>📷</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Ajouter une image</div>
        </div>
      </div>
      <button className="btn" style={{ width: "100%" }} onClick={submit}>CRÉER LA TÂCHE</button>
    </Modal>
  );
}
