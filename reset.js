import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "TU_ANON_KEY_AQUI"; // ⚠️ usa el anon key, no el service key
const supabase = createClient(supabaseUrl, supabaseKey);

// Captura la sesión que viene en la URL del correo
window.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
  if (error) {
    document.getElementById("reset-message").textContent = "❌ El enlace no es válido o expiró.";
    document.getElementById("reset-message").classList.add("text-red-500");
  }
});

// Manejo del formulario
document.getElementById("reset-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value;
  const msg = document.getElementById("reset-message");

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    msg.textContent = "✅ Contraseña actualizada correctamente.";
    msg.classList.add("text-green-500");
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.classList.add("text-red-500");
  }
});
