import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Configura tus credenciales
const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo";
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("reset-form");
const msg = document.getElementById("reset-message");
const submitBtn = document.getElementById("reset-submit");
const resendContainer = document.getElementById("resend-container");
const resendForm = document.getElementById("resend-form");

// Función para mostrar mensajes
function showMessage(text, isError = false) {
  msg.textContent = text;
  msg.className = `text-center text-sm mt-4 ${isError ? 'text-red-500' : 'text-green-600'}`;
}

// Función para verificar coincidencia de contraseñas
function checkPasswordsMatch() {
  const password = document.getElementById("new-password").value;
  const confirm = document.getElementById("confirm-password").value;
  const isValid = password.length >= 6 && password === confirm;
  submitBtn.disabled = !isValid;
  return isValid;
}

// Listeners para verificar contraseñas en tiempo real
document.getElementById("new-password").addEventListener("input", checkPasswordsMatch);
document.getElementById("confirm-password").addEventListener("input", checkPasswordsMatch);

// ✅ Verificar sesión al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Esperar un momento para que Supabase procese la URL automáticamente
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error obteniendo sesión:", error);
      showMessage("❌ Error al verificar la sesión. El enlace puede haber expirado.", true);
      submitBtn.disabled = true;
      resendContainer.classList.remove("hidden");
      return;
    }

    if (!session) {
      console.log("No hay sesión activa");
      showMessage("❌ El enlace ha expirado o no es válido. Solicita un nuevo enlace.", true);
      submitBtn.disabled = true;
      resendContainer.classList.remove("hidden");
      return;
    }

    console.log("✅ Sesión válida encontrada:", session.user.email);
    showMessage("✅ Enlace válido. Puedes cambiar tu contraseña.", false);
    submitBtn.disabled = false;

  } catch (err) {
    console.error("❌ Error inesperado:", err);
    showMessage("❌ Error al procesar el enlace. Intenta solicitar uno nuevo.", true);
    submitBtn.disabled = true;
    resendContainer.classList.remove("hidden");
  }
});

// ✅ Manejar el envío del formulario para cambiar contraseña
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const password = document.getElementById("new-password").value;
  const confirm = document.getElementById("confirm-password").value;

  if (password !== confirm) {
    showMessage("❌ Las contraseñas no coinciden", true);
    return;
  }

  if (password.length < 6) {
    showMessage("❌ La contraseña debe tener al menos 6 caracteres", true);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";
  showMessage("Actualizando contraseña...", false);

  try {
    // Verificar que tenemos una sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("La sesión ha expirado. Solicita un nuevo enlace.");
    }

    const { error } = await supabase.auth.updateUser({ 
      password: password 
    });
    
    if (error) throw error;

    showMessage("✅ Contraseña actualizada correctamente. Redirigiendo al login...", false);
    
    // Cerrar sesión para que el usuario haga login con la nueva contraseña
    await supabase.auth.signOut();

    setTimeout(() => {
      window.location.href = "/"; // Redirigir al login
    }, 2000);

  } catch (err) {
    console.error("❌ Error al actualizar contraseña:", err);
    showMessage("❌ " + err.message, true);
    
    if (err.message.includes("expirado") || err.message.includes("sesión")) {
      resendContainer.classList.remove("hidden");
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar contraseña";
  }
});

// ✅ Manejar reenvío de enlace de restablecimiento
resendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("resend-email").value.trim();
  const resendBtn = resendForm.querySelector("button[type=submit]");
  
  if (!email) {
    alert("Por favor ingresa tu correo electrónico");
    return;
  }

  resendBtn.disabled = true;
  resendBtn.textContent = "Enviando...";

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset.html",
    });
    
    if (error) throw error;
    
    showMessage("✅ Nuevo enlace enviado a tu correo. Revisa tu bandeja de entrada.", false);
    resendContainer.classList.add("hidden");
    
  } catch (err) {
    console.error("❌ Error al reenviar enlace:", err);
    showMessage("❌ " + err.message, true);
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = "Reenviar link";
  }
});