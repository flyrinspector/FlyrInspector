import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; // ⚠️ usa siempre la anon key, no service_role
const supabase = createClient(supabaseUrl, supabaseKey);

const msg = document.getElementById("reset-msg");
const form = document.getElementById("reset-form");

// ---------------- Detectar error en el hash ----------------
const hash = window.location.hash;
if (hash.includes("error=access_denied")) {
  msg.textContent = "❌ Este enlace ya no es válido o ha expirado. Solicita uno nuevo.";
  msg.className = "text-red-500 text-center";
  form.classList.add("hidden");

  // Crear botón para solicitar nuevo link
  const btn = document.createElement("a");
  btn.textContent = "Solicitar nuevo enlace";
  btn.href = "index.html"; // vuelve al login donde puedes pedir otro reset
  btn.className = "mt-4 inline-block text-blue-600 hover:underline text-center block";
  form.parentNode.appendChild(btn);
}

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

    msg.textContent = "✅ Contraseña actualizada. Ahora puedes iniciar sesión.";
    msg.className = "text-green-600 text-center";

    // Redirigir al login tras 2 segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);

  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500 text-center";
  }
});
