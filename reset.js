import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Configura tu Supabase
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";

const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");

// 🟢 1. Validar si el enlace está expirado o inválido
const params = new URLSearchParams(window.location.hash.substring(1));
if (params.get("error_code") === "otp_expired") {
  msg.textContent =
    "⚠️ El enlace de recuperación ha expirado. Solicita uno nuevo desde 'Olvidé mi contraseña'.";
  msg.className = "text-red-500";
  if (form) form.querySelector("button[type=submit]").disabled = true;
}

// 🟢 2. Intercambiar el token del URL por una sesión válida
(async () => {
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      window.location.href
    );
    if (error) throw error;
    console.log("✅ Sesión de recuperación iniciada:", data);
  } catch (err) {
    console.error("❌ Error al procesar URL:", err);
    msg.textContent =
      "⚠️ El enlace ya no es válido. Solicita uno nuevo desde 'Olvidé mi contraseña'.";
    msg.className = "text-red-500";
    if (form) form.querySelector("button[type=submit]").disabled = true;
  }
})();

// 🟢 3. Guardar nueva contraseña
form?.addEventListener("submit", async (e) => {
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

    msg.textContent =
      "✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión.";
    msg.className = "text-green-600";

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  } catch (err) {
    console.error("❌ Error reset password:", err);
    msg.textContent = "❌ Error: " + err.message;
    msg.className = "text-red-500";
  }
});
