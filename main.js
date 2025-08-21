import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; // ⚠️ reemplázalo con tu anon key real
const supabase = createClient(supabaseUrl, supabaseKey);

function showMsg(el, text, ok=false) {
  el.textContent = text;
  el.classList.remove("text-red-500","text-blue-500","text-green-500");
  el.classList.add(ok ? "text-green-500" : "text-blue-500");
}

/* -------- SIGNUP -------- */
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById("signup-name").value.trim();
  const apellido = document.getElementById("signup-lastname").value.trim();
  const email    = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const telefono = document.getElementById("signup-phone").value.trim();
  const msg = document.getElementById("signup-message");

  showMsg(msg, "Creando cuenta...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, apellido, telefono } }
  });

  if (error) {
    msg.textContent = "Error al registrar: " + error.message;
    msg.classList.add("text-red-500");
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    msg.textContent = "Error: sesión no iniciada.";
    msg.classList.add("text-red-500");
    return;
  }

  const { error: insertError } = await supabase.from("usuarios").insert([
    { id: userId, nombre, apellido, correo: email, telefono }
  ]);

  if (insertError) {
    console.error("Error en insert:", insertError);
    msg.textContent = "Error al guardar datos: " + insertError.message;
    msg.classList.add("text-red-500");
    return;
  }

  showMsg(msg, "✅ Usuario creado con éxito y sesión iniciada.", true);

  setTimeout(() => {
    document.getElementById("signup-modal").style.display = "none";
  }, 2000);
});

/* -------- LOGIN -------- */
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const err = document.getElementById("login-error-message");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    err.textContent = "Error en login: " + error.message;
    err.classList.remove("hidden");
    return;
  }
  err.classList.add("hidden");
  alert("Login exitoso");
});

/* -------- FORGOT PASSWORD -------- */
document.getElementById("forgot-password-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  const msg = document.getElementById("forgot-message");

  if (!email) {
    showMsg(msg, "Ingresa tu correo", false);
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset.html",
  });

  if (error) {
    showMsg(msg, "Error: " + error.message, false);
    return;
  }

  showMsg(msg, "✅ Te enviamos un correo con el link para cambiar contraseña.", true);
});

/* -------- UPDATE PERFIL -------- */
document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById("profile-name").value.trim();
  const apellido = document.getElementById("profile-lastname").value.trim();
  const telefono = document.getElementById("profile-phone").value.trim();
  const newPassword = document.getElementById("profile-password").value;
  const msg = document.getElementById("profile-message");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { alert("No hay sesión"); return; }

  const { error: upErr } = await supabase
    .from("usuarios")
    .update({ nombre, apellido, telefono, actualizado_en: new Date().toISOString() })
    .eq("id", user.id);

  if (upErr) {
    msg.textContent = "Error al actualizar: " + upErr.message;
    msg.classList.add("text-red-500");
    return;
  }

  if (newPassword) {
    const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
    if (pwErr) {
      msg.textContent = "Datos guardados, pero falló contraseña: " + pwErr.message;
      msg.classList.add("text-red-500");
      return;
    }
    document.getElementById("profile-password").value = "";
  }

  msg.textContent = "✅ Perfil actualizado";
  msg.classList.add("text-green-500");
});

/* -------- LOGOUT -------- */
document.getElementById("logout-button")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  alert("Sesión cerrada");
});

/* -------- Sesión activa -------- */
supabase.auth.onAuthStateChange(async (_evt, session) => {
  if (session?.user) {
    console.log("Sesión activa con:", session.user.email);
  } else {
    console.log("No hay sesión activa");
  }
});

/* -------- Modal Signup -------- */
const signupModal = document.getElementById("signup-modal");
const signupLink = document.getElementById("signup-link");
const closeSignupBtn = document.getElementById("close-signup-modal");

signupLink?.addEventListener("click", (e) => {
  e.preventDefault();
  signupModal.style.display = "block";
});

closeSignupBtn?.addEventListener("click", () => {
  signupModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === signupModal) {
    signupModal.style.display = "none";
  }
});
