import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value.trim();

  if (!newPassword) {
    msg.textContent = "⚠️ Ingresa una nueva contraseña.";
    msg.className = "text-red-500 text-center";
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    msg.textContent = "❌ Error: " + error.message;
    msg.className = "text-red-500 text-center";
    return;
  }

  msg.textContent = "✅ Contraseña actualizada con éxito. Ya puedes iniciar sesión.";
  msg.className = "text-green-500 text-center";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
});
