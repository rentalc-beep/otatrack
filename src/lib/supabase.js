import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si Supabase n'est pas encore configuré, on tourne en mode démo (données locales).
export const DEMO_MODE = !url || !key || url.includes("ton-projet");

export const supabase = DEMO_MODE ? null : createClient(url, key);

if (DEMO_MODE) {
  console.info(
    "%cOtaTrack — MODE DÉMO",
    "color:#FA8C16;font-weight:bold",
    "\nLes données sont locales (fake). Configure .env avec Supabase pour passer en réel."
  );
}
