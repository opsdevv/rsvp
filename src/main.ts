import { mountRsvp } from "./rsvp";

const root = document.getElementById("rsvp-app");
if (root) {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  if (url) root.dataset.supabaseUrl = url;
  if (anonKey) root.dataset.supabaseAnonKey = anonKey;
  mountRsvp(root);
}
