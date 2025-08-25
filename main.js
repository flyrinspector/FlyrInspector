import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; // ⚠️ reemplaza por tu anon key
const supabase = createClient(supabaseUrl, supabaseKey);

function showSuccessModal(title, message) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").textContent = message;
  document.getElementById("message-modal").style.display = "block";
}
document.getElementById("close-message-modal")?.addEventListener("click", () => {
  document.getElementById("message-modal").style.display = "none";
});

// -------------------- REGISTRO --------------------
const signupModal = document.getElementById("signup-modal");
document.getElementById("signup-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  signupModal.style.display = "block";
});
document.getElementById("close-signup-modal")?.addEventListener("click", () => {
  signupModal.style.display = "none";
});

document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById("signup-name").value.trim();
  const apellido = document.getElementById("signup-lastname").value.trim();
  const email    = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const telefono = document.getElementById("signup-phone").value.trim();

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, telefono } }
    });
    if (authError) throw authError;

    showSuccessModal("✅ Usuario creado", `Bienvenido ${nombre}, revisa tu correo para confirmar tu cuenta.`);
    e.target.reset();
    signupModal.style.display = "none";
  } catch (err) {
    showSuccessModal("❌ Error al registrar", err.message);
  }
});

// -------------------- LOGIN --------------------
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Usuario no encontrado");

    await loadProfile();
  } catch (err) {
    showSuccessModal("❌ Error al iniciar sesión", err.message);
  }
});

// -------------------- PERFIL SOLO LECTURA --------------------
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("profile-view").classList.remove("hidden");

  document.getElementById("profile-name-view").textContent = user.user_metadata?.nombre || "";
  document.getElementById("profile-lastname-view").textContent = user.user_metadata?.apellido || "";
  document.getElementById("profile-email-view").textContent = user.email || "";
  document.getElementById("profile-phone-view").textContent = user.user_metadata?.telefono || "";
}

// -------------------- EDITAR PERFIL --------------------
const editProfileModal = document.getElementById("edit-profile-modal");
document.getElementById("edit-profile-button")?.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  document.getElementById("edit-name").value = user.user_metadata?.nombre || "";
  document.getElementById("edit-lastname").value = user.user_metadata?.apellido || "";
  document.getElementById("edit-phone").value = user.user_metadata?.telefono || "";
  document.getElementById("edit-password").value = "";

  editProfileModal.style.display = "block";
});
document.getElementById("close-edit-profile")?.addEventListener("click", () => {
  editProfileModal.style.display = "none";
});

document.getElementById("edit-profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById("edit-name").value.trim();
  const apellido = document.getElementById("edit-lastname").value.trim();
  const telefono = document.getElementById("edit-phone").value.trim();
  const nuevaPass = document.getElementById("edit-password").value;

  try {
    const { error: metaError } = await supabase.auth.updateUser({ data: { nombre, apellido, telefono } });
    if (metaError) throw metaError;

    if (nuevaPass) {
      const { error: passError } = await supabase.auth.updateUser({ password: nuevaPass });
      if (passError) throw passError;
    }

    showSuccessModal("✅ Perfil actualizado", "Tus cambios se han guardado con éxito.");
    editProfileModal.style.display = "none";
    await loadProfile();
  } catch (err) {
    showSuccessModal("❌ Error al guardar", err.message);
  }
});

// -------------------- RECUPERAR CONTRASEÑA --------------------
document.getElementById("forgot-password-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  if (!email) return;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset.html"
    });
    if (error) throw error;
    showSuccessModal("✅ Correo enviado", "Revisa tu bandeja de entrada para cambiar tu contraseña.");
  } catch (err) {
    showSuccessModal("❌ Error", err.message);
  }
});

// -------------------- LOGOUT --------------------
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showSuccessModal("👋 Hasta pronto", "Has cerrado sesión correctamente.");
  document.getElementById("profile-view").classList.add("hidden");
  document.getElementById("login-view").classList.remove("hidden");
});

// -------------------- SESIÓN --------------------
window.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) await loadProfile();
});
