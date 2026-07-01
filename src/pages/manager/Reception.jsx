import { useState } from "react";
import { useStore, actions } from "../../lib/store";
import { FMT_EUR } from "../../data/grammage";

export function Reception() {
  const { produits, mouvements } = useStore();
  const [showInvoice, setShowInvoice] = useState(false);
  const [code, setCode] = useState(produits[0]?.code || "");
  const [qty, setQty] = useState("");

  const sel = produits.find((p) => p.code === code) || produits[0];
  const achat = sel?.achat || "Carton";
  const qa = sel?.qteAchat || 1;
  const unite = sel?.unite || "unité";
  const baseQty = (parseFloat(qty) || 0) * qa;

  const invoiceItems = [
    { code: "38437", nom: "Merguez cuites tranchées halal", cartons: 5, parC: 2, prix: 9.30 },
    { code: "23223", nom: "Sauce fromagère 4x2,5kg", cartons: 2, parC: 10, prix: 4.80 },
    { code: "38186", nom: "Frites allumettes 4x2,5kg", cartons: 4, parC: 10, prix: 1.70 },
  ];

  const validateInvoice = () => {
    invoiceItems.forEach((it) => actions.receiveStock(it.code, it.cartons * it.parC, "Facture Bidfood"));
    setShowInvoice(false);
    alert("✅ Facture validée — 3 produits ajoutés au stock");
  };

  const addManual = () => {
    const n = parseFloat(qty);
    if (!n || n <= 0) { alert("Entrez une quantité valide."); return; }
    actions.receiveStock(code, n * qa, "Manuel");
    setQty("");
    alert(`✅ +${n} ${achat.toLowerCase()}(s) = +${(n * qa).toFixed(1)} ${unite} de ${sel.nom}`);
  };

  return (
    <>
      <div className="section-title">Réception marchandise</div>
      <div className="g2" style={{ alignItems: "start" }}>
        <div>
          <div className="upload-zone" onClick={() => setShowInvoice(true)}>
            <div className="uz-icon">🧾</div>
            <div className="uz-title">Scanner une facture Bidfood</div>
            <div className="uz-sub">Photographiez ou importez la facture — les produits sont extraits et ajoutés au stock après vérification</div>
          </div>

          {showInvoice && (
            <div className="card">
              <div className="card-head"><div><div className="card-title">📄 Facture détectée — Bidfood</div><div className="card-sub">3 produits extraits · vérifiez avant validation</div></div></div>
              <div className="card-body">
                <table className="dtable">
                  <thead><tr><th>Produit détecté</th><th>Reçu</th><th>= Stock</th></tr></thead>
                  <tbody>
                    {invoiceItems.map((it) => (
                      <tr key={it.code}><td>{it.nom}</td><td>{it.cartons} cartons</td><td style={{ color: "var(--green)" }}>+{it.cartons * it.parC}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="btn" style={{ flex: 1 }} onClick={validateInvoice}>✅ Valider et ajouter au stock</button>
                  <button className="btn btn-ghost" onClick={() => setShowInvoice(false)}>Annuler</button>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head"><div><div className="card-title">Saisie manuelle</div><div className="card-sub">Si pas de facture</div></div></div>
            <div className="card-body">
              <div className="fg"><label className="fl">Produit</label>
                <select className="fi" value={code} onChange={(e) => setCode(e.target.value)}>
                  {produits.map((p) => <option key={p.code} value={p.code}>{p.nom} ({p.marque})</option>)}
                </select>
              </div>
              <div className="fg"><label className="fl">Quantité reçue (en {achat.toLowerCase()})</label>
                <input className="fi" type="number" min="0" step="0.1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={`Nombre de ${achat.toLowerCase()}s`} />
              </div>
              {parseFloat(qty) > 0 && (
                <div className="conv-hint">1 {achat.toLowerCase()} = {qa} {unite} → ajout de <b>{baseQty.toFixed(1)} {unite}</b> au stock</div>
              )}
              <button className="btn" style={{ width: "100%", marginTop: 4 }} onClick={addManual}>ENREGISTRER</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-head"><div><div className="card-title">Derniers mouvements</div><div className="card-sub">Entrées et sorties</div></div></div>
          <div className="card-body">
            {mouvements.map((m, i) => (
              <div className="recep-item" key={i}>
                <div className={`recep-icon ${m.type === "out" ? "out" : ""}`}>{m.type === "in" ? "↓" : "↑"}</div>
                <div className="recep-main"><div className="recep-prod">{m.prod}</div><div className="recep-meta">{m.who} · {m.date}</div></div>
                <div className="recep-qty" style={{ color: m.type === "in" ? "var(--green)" : "var(--red)" }}>{m.qty}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
