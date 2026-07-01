import { useState } from "react";

// ── Gastro illustré ──
export function GastroIcon({ fill, selected, size = 26 }) {
  const W = size, H = Math.round(size * 1.35);
  const pct = Math.min(fill / 4, 1);
  const iH = H * 0.7, iY = H * 0.22, fH = iH * pct, fY = iY + iH - fH;
  const col = selected ? "#D4380D" : "#8C7B6B";
  const fc = pct === 0 ? "none" : selected ? "#D4380D" : "#B4A99E";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect x="4" y={Math.round(H * 0.06)} width={W - 8} height={Math.round(H * 0.1)} rx="2" fill={col} />
      <rect x="1.5" y={Math.round(iY)} width={W - 3} height={Math.round(iH)} rx="3" fill="none" stroke={col} strokeWidth="1.5" />
      {pct > 0 && <rect x="3" y={fY.toFixed(1)} width={W - 6} height={fH.toFixed(1)} rx="2" fill={fc} />}
    </svg>
  );
}

// ── Lightbox photo ──
export function Lightbox({ url, onClose }) {
  if (!url) return null;
  return (
    <div className="lightbox" onClick={onClose}>
      <img src={url} alt="Photo agrandie" />
    </div>
  );
}

// ── Modal générique ──
export function Modal({ children, onClose }) {
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ── Hook lightbox réutilisable ──
export function useLightbox() {
  const [url, setUrl] = useState(null);
  return { url, open: setUrl, close: () => setUrl(null) };
}

export function statusOf(p) {
  if (p.stock === 0) return "out";
  if (p.stock < p.min) return "low";
  return "ok";
}

export const FMT = (d) =>
  d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
