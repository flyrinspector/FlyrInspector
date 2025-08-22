import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Configura tu Supabase
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

/* 🔑 PASO 1: Obtener sesión desde la URL */
async function setSessionFromUrl() {
  const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
  if (error) {
    console.error("❌ Error al procesar URL:", error.message);
    msg.textContent = "❌ Link inválido o expirado. Vuelve a solicitar el cambio.";
    msg.className = "text-red-500";
    return false;
  }
  console.log("✅ Sesión establecida:", data);
  return true;
}

/* Al cargar la página, procesamos el token de la URL */
setSessionFromUrl();

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

    msg.textContent = "✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión.";
    msg.className = "text-green-600";

    setTimeout(() => {
      window.location.href = "/index.html"; // Redirige al login
    }, 2000);

  } catch (err) {
    msg.textContent = "❌ Error: " + err.message;
    msg.className = "text-red-500";
    console.error("Error reset password:", err);
  }
});
