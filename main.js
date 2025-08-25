import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

// Utilidades
function showSuccessModal(title, message) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").textContent = message;
  document.getElementById("message-modal").style.display = "block";
}
document.getElementById("close-message-modal")?.addEventListener("click", () => {
  document.getElementById("message-modal").style.display = "none";
});

// -------------------- LOGIN --------------------
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true; btn.textContent = "Ingresando...";

  try {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Usuario no encontrado");

    await loadProfile();
  } catch (err) {
    showSuccessModal("❌ Error al iniciar sesión", err.message);
  }

  btn.disabled = false; btn.textContent = "Login";
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
    const { error: metaError } = await supabase.auth.updateUser({
      data: { nombre, apellido, telefono }
    });
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
