import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Configura tu Supabase
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

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
    // updateUser funciona solo si el usuario llegó con el "access_token" válido del email
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;

    msg.textContent = "✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión.";
    msg.className = "text-green-600";

    // Opcional: redirigir al login después de 2s
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);

  } catch (err) {
    msg.textContent = "❌ Error: " + err.message;
    msg.className = "text-red-500";
    console.error("Error reset password:", err);
  }
});
