import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Configura tus credenciales
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

// ✅ Paso 1: procesar el link de Supabase cuando llega el usuario
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
    if (error) throw error;

    console.log("🔑 Sesión restaurada:", data.session);
  } catch (err) {
    console.error("❌ Error al procesar URL:", err);
    msg.textContent = "❌ El enlace no es válido o ya expiró. Vuelve a solicitar uno nuevo.";
    msg.className = "text-red-500";
    form.querySelector("button").disabled = true; // desactiva botón si no hay sesión válida
  }
});

// ✅ Paso 2: guardar nueva contraseña
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("new-password").value;
  const confirm = document.getElementById("confirm-password").value;

  if (password !== confirm) {
    msg.textContent = "❌ Las contraseñas no coinciden";
    msg.className = "text-red-500";
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;

    msg.textContent = "✅ Contraseña actualizada correctamente. Redirigiendo...";
    msg.className = "text-green-600";

    setTimeout(() => {
      window.location.href = "/"; // vuelve al login
    }, 2000);
  } catch (err) {
    console.error("❌ Error reset password:", err);
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500";
  }
});
