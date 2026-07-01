import { useEffect, useRef, useState } from "react";

// Chiffre qui défile de façon fluide à l'affichage et quand la valeur change.
export function AnimatedNumber({ value, decimals = 0, duration = 750, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(p);
      setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const txt = display.toLocaleString("fr-BE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span>{prefix}{txt}{suffix}</span>;
}

// Montant en euros animé
export function AnimatedEuro({ value, duration = 750 }) {
  return <AnimatedNumber value={value} decimals={0} duration={duration} suffix=" €" />;
}

// Petite barre de niveau de stock animée (0..1)
export function LevelBar({ ratio, color = "var(--accent)" }) {
  const pct = Math.max(0, Math.min(1, ratio || 0)) * 100;
  return (
    <div className="lvl">
      <div className="lvl-fill" style={{ width: pct + "%", background: color }} />
    </div>
  );
}
