import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; // ⚠️ usa siempre la anon key, nunca service_role
const supabase = createClient(supabaseUrl, supabaseKey);

// ---- Cambiar contraseña ----
document.getElementById("reset-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pass1 = document.getElementById("new-password").value;
  const pass2 = document.getElementById("confirm-password").value;
  const msg = document.getElementById("reset-msg");

  if (pass1 !== pass2) {
    msg.textContent = "❌ Las contraseñas no coinciden.";
    msg.className = "text-red-500 text-center";
    return;
  }

  try {
    // Supabase ya reconoce el access_token de la URL y permite cambiar password
    const { error } = await supabase.auth.updateUser({ password: pass1 });
    if (error) throw error;

    msg.textContent = "✅ Contraseña actualizada. Ahora puedes iniciar sesión.";
    msg.className = "text-green-600 text-center";

    // Opcional: redirigir al login después de 2 segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);

  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500 text-center";
  }
});
