import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------- UTILIDADES UI --------------------
function showSuccessModal(title, message) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").textContent = message;
  document.getElementById("message-modal").style.display = "block";
}
document.getElementById("close-message-modal")?.addEventListener("click", () => {
  document.getElementById("message-modal").style.display = "none";
});

// Helpers para cambiar de vistas
function showLogin() {
  document.getElementById("login-view").classList.remove("hidden");
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("profile-view").classList.add("hidden");

  // 🔹 limpiar campos
  document.getElementById("login-form")?.reset();
}

function showForgot() {
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.remove("hidden");
  document.getElementById("profile-view").classList.add("hidden");

  // 🔹 limpiar campos
  document.getElementById("forgot-password-form")?.reset();
}

function showProfile() {
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("profile-view").classList.remove("hidden");
}

// -------------------- REGISTRO --------------------
const signupModal = document.getElementById("signup-modal");
document.getElementById("signup-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  signupModal.style.display = "block";
  document.getElementById("signup-form")?.reset(); // 🔹 limpiar
});
document.getElementById("close-signup-modal")?.addEventListener("click", () => {
  signupModal.style.display = "none";
  document.getElementById("signup-form")?.reset(); // 🔹 limpiar
});

document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("signup-name").value.trim();
  const apellido = document.getElementById("signup-lastname").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const telefono = document.getElementById("signup-phone").value.trim();

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, apellido, telefono } },
    });
    if (error) throw error;

    showSuccessModal(
      "✅ Usuario creado",
      `Bienvenido ${nombre}. Revisa tu correo para confirmar tu cuenta.`
    );
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Usuario no encontrado");

    e.target.reset(); // 🔹 limpiar al loguear
    await loadProfile();
  } catch (err) {
    showSuccessModal("❌ Error al iniciar sesión", err.message);
  }
});

// -------------------- PERFIL (solo lectura) --------------------
async function loadProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  document.getElementById("profile-name-view").textContent =
    user.user_metadata?.nombre || "";
  document.getElementById("profile-lastname-view").textContent =
    user.user_metadata?.apellido || "";
  document.getElementById("profile-email-view").textContent = user.email || "";
  document.getElementById("profile-phone-view").textContent =
    user.user_metadata?.telefono || "";

  showProfile();
}

// -------------------- FORGOT PASSWORD --------------------
document
  .getElementById("forgot-password-link")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showForgot();
  });

document
  .getElementById("back-to-login-link")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  });

document
  .getElementById("forgot-password-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://flyr-inspector.vercel.app/reset.html",
      });
      if (error) throw error;

      showSuccessModal(
        "📩 Revisa tu correo",
        "Te hemos enviado un enlace para restablecer tu contraseña."
      );
      e.target.reset(); // 🔹 limpiar después
    } catch (err) {
      showSuccessModal("❌ Error", err.message);
    }
  });

// -------------------- LOGOUT --------------------
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await supabase.auth.signOut();

  // 🔹 limpiar formularios al cerrar sesión
  document.getElementById("login-form")?.reset();
  document.getElementById("signup-form")?.reset();
  document.getElementById("forgot-password-form")?.reset();

  showLogin();
});
