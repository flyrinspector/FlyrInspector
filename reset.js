import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Configuración de Supabase
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

/* ✅ 1. Procesar el token del enlace */
async function setSessionFromUrl() {
  const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.hash);
  if (error) {
    console.error("❌ Error al procesar URL:", error.message);
    msg.textContent = "❌ El enlace no es válido o ya expiró. Solicita uno nuevo.";
    msg.className = "text-red-500";
    return false;
  }
  console.log("✅ Sesión establecida:", data);
  return true;
}

await setSessionFromUrl();

/* ✅ 2. Escuchar el formulario */
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

    msg.textContent = "✅ Contraseña actualizada. Ya puedes iniciar sesión.";
    msg.className = "text-green-600";

    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000);

  } catch (err) {
    msg.textContent = "❌ Error: " + err.message;
    msg.className = "text-red-500";
    console.error("Error reset password:", err);
  }
});
