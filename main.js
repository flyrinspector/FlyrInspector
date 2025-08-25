import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Configura Supabase
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; // ⚠️ usa la anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------- UTILIDADES --------------------
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

// -------------------- REGISTRO --------------------
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

    await supabase.from("usuarios").upsert({
      id: authData.user.id,
      correo: email,
      nombre,
      apellido,
      telefono: telefono || null,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    });

    if (telefono) {
      await supabase.auth.signInWithOtp({ phone: telefono });
      showMsg(msg, "✅ Usuario creado, revisa el SMS con tu código", true);
    } else {
      showMsg(msg, "✅ Registro exitoso! Ahora inicia sesión.", true);
    }

    showSuccessModal("🎉 Bienvenido", `¡Hola ${nombre}! Tu cuenta está lista.`);
    e.target.reset();
    document.getElementById("signup-modal").style.display = "none";
  } catch (err) {
    console.error("❌ Error en signup:", err);
    showMsg(msg, "❌ " + err.message, false);
    showSuccessModal("❌ Error al registrar", err.message);
  }

  btn.disabled = false; btn.textContent = "Crear cuenta";
});

// -------------------- LOGIN --------------------
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
    showMsg(msg, "❌ " + err.message, false);
    showSuccessModal("❌ Error al iniciar sesión", err.message);
  }

  btn.disabled = false; btn.textContent = "Login";
});

// -------------------- RECUPERAR CONTRASEÑA --------------------
document.getElementById("forgot-password-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  const msg = document.getElementById("forgot-message");
  if (!email) return showMsg(msg, "Ingresa tu correo", false);

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://flyr-inspector.vercel.app/reset.html"
    });
    if (error) throw error;
    showMsg(msg, "✅ Te enviamos un correo con el link para cambiar tu contraseña.", true);
  } catch (err) {
    showMsg(msg, "❌ " + err.message, false);
  }
});

// -------------------- PERFIL --------------------
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

// Guardar cambios de perfil (incluye cambio de contraseña)
document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("profile-message");
  showMsg(msg, "Guardando cambios...");

  const nombre   = document.getElementById("profile-name").value.trim();
  const apellido = document.getElementById("profile-lastname").value.trim();
  const telefono = document.getElementById("profile-phone").value.trim();
  const nuevaPass = document.getElementById("profile-password").value;

  try {
    // 1️⃣ Actualizar metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: { nombre, apellido, telefono }
    });
    if (metaError) throw metaError;

    // 2️⃣ Si hay contraseña nueva, actualizar
    if (nuevaPass) {
      const { error: passError } = await supabase.auth.updateUser({
        password: nuevaPass
      });
      if (passError) throw passError;
    }

    showMsg(msg, "✅ Cambios guardados correctamente.", true);
    showSuccessModal("✅ Perfil actualizado", "Tus cambios se han guardado con éxito.");
    document.getElementById("profile-password").value = ""; // limpiar campo
  } catch (err) {
    showMsg(msg, "❌ " + err.message, false);
    showSuccessModal("❌ Error al guardar", err.message);
  }
});

// -------------------- LOGOUT --------------------
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showSuccessModal("👋 Hasta pronto", "Has cerrado sesión correctamente.");
  document.getElementById("profile-view").classList.add("hidden");
  document.getElementById("login-view").classList.remove("hidden");
});

// -------------------- NAVEGACIÓN --------------------
const signupModal = document.getElementById("signup-modal");
document.getElementById("signup-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  signupModal.style.display = "block";
});
document.getElementById("close-signup-modal")?.addEventListener("click", () => {
  signupModal.style.display = "none";
});

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

// -------------------- ESTADO DE SESIÓN --------------------
window.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) await loadProfile();
});
