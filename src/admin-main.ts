import { mountAdmin } from "./admin";

const root = document.getElementById("admin-app");
if (root) {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (url) root.dataset.supabaseUrl = url;
  if (serviceRoleKey) root.dataset.supabaseServiceRoleKey = serviceRoleKey;
  mountAdmin(root);
}
