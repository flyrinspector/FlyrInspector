import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Configura tu Supabase
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

// 1. Intercambiar el token temporal de la URL por una sesión
(async () => {
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
    if (error) throw error;
    console.log("✅ Sesión temporal creada:", data);
  } catch (err) {
    console.error("❌ Error al procesar URL:", err);
    msg.textContent = "❌ Enlace inválido o expirado. Solicita otro correo de recuperación.";
    msg.className = "text-red-500";
    form.querySelector("button").disabled = true; // Desactivar botón si no hay sesión
  }
})();

// 2. Cambiar contraseña
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
      window.location.href = "/"; // Redirigir al login
    }, 2000);
  } catch (err) {
    console.error("Error reset password:", err);
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500";
  }
});
