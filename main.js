import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Configura tus credenciales
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

function showMsg(el, text, ok = false) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove("text-red-500", "text-blue-500", "text-green-500", "hidden");
  el.classList.add(ok ? "text-green-500" : "text-blue-500");
}

function showSuccessModal(title, message) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").textContent = message;
  document.getElementById("message-modal").style.display = "block";
}

document.getElementById("close-message-modal")?.addEventListener("click", () => {
  document.getElementById("message-modal").style.display = "none";
});

/* -------- SIGNUP (registro + login inmediato) -------- */
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true; btn.textContent = "Creando...";

  const nombre   = document.getElementById("signup-name").value.trim();
  const apellido = document.getElementById("signup-lastname").value.trim();
  const email    = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const telefono = document.getElementById("signup-phone").value.trim();
  const msg = document.getElementById("signup-message");
  showMsg(msg, "Creando cuenta...");

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, telefono, full_name: `${nombre} ${apellido}` } }
    });
    if (authError) throw authError;
    if (!authData?.user) throw new Error("No se pudo crear el usuario");

    // Login inmediato
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { error: siError } = await supabase.auth.signInWithPassword({ email, password });
      if (siError) throw siError;
    }

    // Guardar en tabla usuarios
    try {
      await supabase.from("usuarios").upsert({
        id: authData.user.id,
        correo: email,
        nombre,
        apellido,
        telefono: telefono || null,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn("⚠️ Tabla usuarios no accesible:", dbErr.message);
    }

    showMsg(msg, "✅ Registro e inicio de sesión exitoso!", true);
    showSuccessModal("🎉 Bienvenido", `¡Hola ${nombre}! Tu cuenta está lista.`);
    await loadProfile();
    e.target.reset();
    document.getElementById("signup-modal").style.display = "none";

  } catch (err) {
    console.error("❌ Error en signup:", err);
    showMsg(msg, "❌ " + err.message, false);
    showSuccessModal("❌ Error al registrar", err.message);
  }
  btn.disabled = false; btn.textContent = "Crear cuenta";
});

/* -------- LOGIN -------- */
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  const msg = document.getElementById("login-error-message");
  btn.disabled = true; btn.textContent = "Ingresando...";
  showMsg(msg, "Comprobando credenciales...");

  try {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Usuario no encontrado");

    showMsg(msg, "✅ Login exitoso", true);
    await loadProfile();

  } catch (err) {
    console.error("❌ Error login:", err);
    showMsg(msg, "❌ " + err.message, false);
    showSuccessModal("❌ Error al iniciar sesión", err.message);
  }
  btn.disabled = false; btn.textContent = "Login";
});

/* -------- FORGOT PASSWORD (enviar email) -------- */
document.getElementById("forgot-password-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  const msg = document.getElementById("forgot-message");

  if (!email) {
    showMsg(msg, "Ingresa tu correo", false);
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset.html",
    });
    if (error) throw error;
    showMsg(msg, "✅ Te enviamos un correo con el link para cambiar contraseña.", true);
  } catch (err) {
    console.error("❌ Error reset password:", err);
    showMsg(msg, "❌ " + err.message, false);
  }
});

/* -------- PERFIL -------- */
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("profile-view").classList.remove("hidden");

  document.getElementById("profile-email").value = user.email || "";
  document.getElementById("profile-name").value = user.user_metadata?.nombre || "";
  document.getElementById("profile-lastname").value = user.user_metadata?.apellido || "";
  document.getElementById("profile-phone").value = user.user_metadata?.telefono || "";
}

/* -------- ACTUALIZAR PERFIL -------- */
document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById("profile-name").value.trim();
  const apellido = document.getElementById("profile-lastname").value.trim();
  const telefono = document.getElementById("profile-phone").value.trim();
  const newPassword = document.getElementById("profile-password").value;
  const msg = document.getElementById("profile-message");

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No hay sesión activa");

    await supabase.auth.updateUser({
      data: { nombre, apellido, telefono, full_name: `${nombre} ${apellido}` }
    });

    await supabase.from("usuarios").upsert({
      id: user.id,
      correo: user.email,
      nombre,
      apellido,
      telefono: telefono || null,
      actualizado_en: new Date().toISOString()
    });

    if (newPassword) {
      await supabase.auth.updateUser({ password: newPassword });
      document.getElementById("profile-password").value = "";
    }

    showMsg(msg, "✅ Perfil actualizado correctamente", true);

  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    showMsg(msg, "❌ " + err.message, false);
  }
});

/* -------- LOGOUT -------- */
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showSuccessModal("👋 Hasta pronto", "Has cerrado sesión correctamente.");
  document.getElementById("profile-view").classList.add("hidden");
  document.getElementById("login-view").classList.remove("hidden");
});

/* -------- MODAL registro -------- */
const signupModal = document.getElementById("signup-modal");
document.getElementById("signup-link")?.addEventListener("click", (e) => {
  e.preventDefault(); signupModal.style.display = "block";
});
document.getElementById("close-signup-modal")?.addEventListener("click", () => {
  signupModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === signupModal) signupModal.style.display = "none";
});

/* -------- Navegación entre login <-> forgot -------- */
document.getElementById("forgot-password-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.remove("hidden");
});
document.getElementById("back-to-login-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("login-view").classList.remove("hidden");
});

/* -------- Estado de sesión -------- */
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await loadProfile();
  }
});
