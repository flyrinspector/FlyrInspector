import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";

// ⚠️ si quieres forzar pkce usa: { auth: { flowType: "pkce" } }
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg  = document.getElementById("reset-message");
const btn  = form?.querySelector("button[type=submit]");

const show = (t, ok=false) => {
  msg.textContent = t;
  msg.className = ok ? "text-green-600" : "text-red-500";
};

function parseHash() {
  const h = window.location.hash.replace(/^#/, "");
  return Object.fromEntries(new URLSearchParams(h));
}

async function hydrateSessionFromUrl() {
  const hashParams = parseHash();

  // Si viene error en el hash (otp_expired, etc)
  if (hashParams.error || hashParams.error_code) {
    show(`❌ ${hashParams.error_description || hashParams.error || "Link inválido o expirado"}`);
    const container = document.getElementById("resend-container");
    if (container) container.classList.remove("hidden");
    return false;
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");

  // Flujo PKCE
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(window.location.href);
      return true;
    } catch (e) {
      show("❌ No pudimos validar el enlace. Ábrelo en el mismo navegador donde pediste el correo o reenvíalo.");
      const container = document.getElementById("resend-container");
      if (container) container.classList.remove("hidden");
      return false;
    }
  }

  // Flujo implícito legacy (hash con tokens)
  if (hashParams.access_token && hashParams.refresh_token) {
    await supabase.auth.setSession({
      access_token: hashParams.access_token,
      refresh_token: hashParams.refresh_token,
    });
    return true;
  }

  return false;
}

// Reenviar correo si link caducó
document.getElementById("resend-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("resend-email").value.trim();
  if (!email) return;
  try {
    const redirectTo = `${window.location.origin}/reset.html`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    show("✅ Te enviamos un nuevo enlace. Ábrelo en este navegador.", true);
  } catch (err) {
    show("❌ " + err.message);
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  if (btn) btn.disabled = true;
  const ok = await hydrateSessionFromUrl();
  if (ok) {
    if (btn) btn.disabled = false;
    msg.textContent = "";
    msg.className = "";
  } else {
    if (btn) btn.disabled = true;
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pw = document.getElementById("new-password").value;
  const cf = document.getElementById("confirm-password").value;
  if (!pw || pw !== cf) {
    show("❌ Las contraseñas no coinciden");
    return;
  }
  try {
    if (btn) { btn.disabled = true; btn.textContent = "Guardando..."; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) throw error;
    show("✅ Contraseña actualizada. Redirigiendo…", true);
    setTimeout(() => (window.location.href = "/"), 1500);
  } catch (err) {
    show("❌ " + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Guardar cambios"; }
  }
});
