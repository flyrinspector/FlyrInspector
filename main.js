import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

function showMsg(el, text, ok=false) {
  el.textContent = text;
  el.classList.remove("text-red-500","text-blue-500","text-green-500");
  el.classList.add(ok ? "text-green-500" : "text-blue-500");
}

/* -------- Función para mostrar modal de éxito -------- */
function showSuccessModal(title, message) {
  const modal = document.getElementById("message-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  
  modalTitle.textContent = title;
  modalBody.textContent = message;
  modal.style.display = "block";
}

/* -------- SIGNUP -------- */
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Creando...";

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
      options: { 
        data: { 
          nombre, 
          apellido, 
          telefono,
          full_name: `${nombre} ${apellido}` 
        } 
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData?.user) {
      throw new Error("No se pudo crear el usuario");
    }

    if (authData.user && !authData.session) {
      showMsg(msg, "✅ Usuario creado. Revisa tu email para confirmar la cuenta.", true);
      showSuccessModal("📧 Registro exitoso", `¡Hola ${nombre}! Tu cuenta ha sido creada, pero necesitas confirmar tu email. Revisa tu bandeja de entrada (y spam).`);
      document.getElementById("login-email").value = email;
    } else if (authData.user && authData.session) {
      try {
        const { error: dbError } = await supabase
          .from("usuarios")
          .insert([{
            id: authData.user.id,
            correo: email,
            nombre: nombre,
            apellido: apellido,
            telefono: telefono || null,
            creado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
          }]);

        if (dbError) {
          console.warn("⚠️ No se pudo insertar en tabla usuarios:", dbError.message);
        }
      } catch (dbErr) {
        console.warn("⚠️ Error al insertar en tabla usuarios:", dbErr.message);
      }

      showMsg(msg, "✅ ¡Usuario creado exitosamente!", true);
      showSuccessModal("🎉 Registro exitoso", `¡Bienvenido ${nombre}! Tu cuenta ha sido creada y ya puedes usarla.`);
      await loadProfile();
    }

    document.getElementById("signup-form").reset();
    document.getElementById("signup-modal").style.display = "none";

  } catch (err) {
    console.error("❌ Error en signup:", err);
    showMsg(msg, `❌ Error al registrar: ${err.message}`, false);
    msg.classList.remove("text-blue-500", "text-green-500");
    msg.classList.add("text-red-500");
    showSuccessModal("❌ Error al registrar", err.message);
  }

  btn.disabled = false;
  btn.textContent = "Crear cuenta";
});

/* -------- LOGIN -------- */
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Ingresando...";

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errEl = document.getElementById("login-error-message");

  errEl.classList.add("hidden");
  errEl.textContent = "";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let errorMessage = "No fue posible iniciar sesión";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Demasiados intentos. Espera unos minutos.";
      } else {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }

    if (!data?.user) {
      throw new Error("No se recibieron datos de usuario");
    }

    if (!data.session) {
      throw new Error("Tu cuenta existe pero necesitas confirmar tu email. Revisa tu bandeja de entrada.");
    }

    const userName = data.user.user_metadata?.nombre || 
                    data.user.user_metadata?.full_name?.split(' ')[0] ||
                    data.user.email.split('@')[0];

    const emailConfirmed = data.user.email_confirmed_at ? "✅ Confirmado" : "⚠️ Sin confirmar";

    showSuccessModal("🎉 Login exitoso", `¡Bienvenido de nuevo, ${userName}! Tu sesión ha iniciado correctamente. ${emailConfirmed}`);

    document.getElementById("login-form").reset();
    await loadProfile();

  } catch (err) {
    console.error("❌ Error completo en login:", err);
    errEl.textContent = `❌ ${err.message}`;
    errEl.classList.remove("hidden");
    showSuccessModal("❌ Error al iniciar sesión", err.message);
  }

  btn.disabled = false;
  btn.textContent = originalText;
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

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset.html",
    });

    if (error) {
      throw new Error(error.message);
    }

    showMsg(msg, "✅ Te enviamos un correo con el link para cambiar contraseña.", true);
  } catch (err) {
    showMsg(msg, `❌ Error: ${err.message}`, false);
  }
});

/* -------- UPDATE PERFIL -------- */
document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre   = document.getElementById("profile-name").value.trim();
  const apellido = document.getElementById("profile-lastname").value.trim();
  const telefono = document.getElementById("profile-phone").value.trim();
  const newPassword = document.getElementById("profile-password").value;
  const msg = document.getElementById("profile-message");

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      throw new Error("No hay sesión activa");
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { 
        nombre, 
        apellido, 
        telefono,
        full_name: `${nombre} ${apellido}`
      }
    });

    if (metaError) {
      console.warn("⚠️ Error actualizando metadata:", metaError.message);
    }

    try {
      const { error: dbError } = await supabase
        .from("usuarios")
        .upsert({ 
          id: user.id,
          correo: user.email,
          nombre, 
          apellido, 
          telefono: telefono || null,
          actualizado_en: new Date().toISOString() 
        });

      if (dbError) {
        console.warn("⚠️ Error actualizando tabla usuarios:", dbError.message);
      }
    } catch (dbErr) {
      console.warn("⚠️ Tabla usuarios no existe o no accesible:", dbErr.message);
    }

    if (newPassword) {
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
      if (pwErr) {
        throw new Error(`Datos guardados, pero falló contraseña: ${pwErr.message}`);
      }
      document.getElementById("profile-password").value = "";
    }

    showMsg(msg, "✅ Perfil actualizado correctamente", true);

  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    showMsg(msg, `❌ ${err.message}`, false);
    msg.classList.add("text-red-500");
  }
});

/* -------- LOGOUT -------- */
document.getElementById("logout-button")?.addEventListener("click", async () => {
  try {
    await supabase.auth.signOut();
    showSuccessModal("👋 Hasta pronto", "Has cerrado sesión correctamente.");
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    showSuccessModal("❌ Error al cerrar sesión", err.message);
  }
});

/* -------- Función cargar perfil -------- */
async function loadProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error("No se pudo obtener la información del usuario");
    }
    if (!user) {
      throw new Error("No hay sesión activa");
    }

    let profileData = null;
    try {
      const { data: dbData, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!dbError && dbData) {
        profileData = dbData;
      }
    } catch {}

    if (!profileData) {
      profileData = {
        nombre: user.user_metadata?.nombre || "",
        apellido: user.user_metadata?.apellido || "",
        correo: user.email,
        telefono: user.user_metadata?.telefono || ""
      };
    }

    document.getElementById("profile-name").value = profileData.nombre || "";
    document.getElementById("profile-lastname").value = profileData.apellido || "";
    document.getElementById("profile-email").value = profileData.correo || user.email;
    document.getElementById("profile-phone").value = profileData.telefono || "";

    document.getElementById("login-view").classList.add("hidden");
    document.getElementById("forgot-password-view").classList.add("hidden");
    document.getElementById("profile-view").classList.remove("hidden");

  } catch (err) {
    showSuccessModal("❌ Error cargando perfil", err.message);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    await loadProfile();
  } else {
    document.getElementById("profile-view").classList.add("hidden");
    document.getElementById("forgot-password-view").classList.add("hidden");
    document.getElementById("login-view").classList.remove("hidden");
  }
});

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

document.getElementById("close-message-modal")?.addEventListener("click", () => {
  document.getElementById("message-modal").style.display = "none";
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

window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await loadProfile();
  }
});
