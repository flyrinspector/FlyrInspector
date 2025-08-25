import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const msg = document.getElementById("reset-msg");
const form = document.getElementById("reset-form");
const newLinkBtn = document.getElementById("new-link-btn");

// ---------------- Procesar token de recuperación ----------------
window.addEventListener("DOMContentLoaded", async () => {
  if (window.location.hash.includes("error=access_denied")) {
    msg.textContent =
      "❌ Este enlace ya no es válido o ha expirado. Solicita uno nuevo.";
    msg.className = "text-red-500 text-center";
    form.classList.add("hidden");
    newLinkBtn.classList.remove("hidden");
    return;
  }

  try {
    // 🔹 Procesar el token de recuperación
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      window.location.hash
    );
    if (error) throw error;

    console.log("✅ Sesión de recuperación activa:", data.session);

    // 🔹 Importante: borrar el hash para que no se reprocesse en recarga
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (err) {
    console.error("❌ Error al procesar el link:", err.message);
    msg.textContent = "❌ El enlace no es válido o ya fue usado.";
    msg.className = "text-red-500 text-center";
    form.classList.add("hidden");
    newLinkBtn.classList.remove("hidden");
  }
});

// ---------------- Guardar nueva contraseña ----------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pass1 = document.getElementById("new-password").value;
  const pass2 = document.getElementById("confirm-password").value;

  if (pass1 !== pass2) {
    msg.textContent = "❌ Las contraseñas no coinciden.";
    msg.className = "text-red-500 text-center";
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: pass1 });
    if (error) throw error;

    msg.textContent =
      "✅ Contraseña actualizada. Ahora puedes iniciar sesión.";
    msg.className = "text-green-600 text-center";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500 text-center";
  }
});
