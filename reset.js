import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "TU_PUBLIC_ANON_KEY"; // ⚠️ pon aquí tu anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Guardamos el teléfono para usarlo luego
let currentPhone = "";

// ---- Paso 1: enviar OTP ----
document.getElementById("send-otp-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("phone").value.trim();
  const msg = document.getElementById("send-otp-msg");

  try {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;

    msg.textContent = "✅ Código enviado al teléfono.";
    msg.className = "text-green-600";

    currentPhone = phone;
    document.getElementById("verify-otp-form").classList.remove("hidden");
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500";
  }
});

// ---- Paso 2: verificar OTP ----
document.getElementById("verify-otp-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = document.getElementById("otp").value.trim();
  const msg = document.getElementById("verify-otp-msg");

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: currentPhone,
      token,
      type: "sms",
    });
    if (error) throw error;

    msg.textContent = "✅ Código verificado. Ahora ingresa tu nueva contraseña.";
    msg.className = "text-green-600";

    document.getElementById("reset-password-form").classList.remove("hidden");
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500";
  }
});

// ---- Paso 3: cambiar contraseña ----
document.getElementById("reset-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pass1 = document.getElementById("new-password").value;
  const pass2 = document.getElementById("confirm-password").value;
  const msg = document.getElementById("reset-password-msg");

  if (pass1 !== pass2) {
    msg.textContent = "❌ Las contraseñas no coinciden.";
    msg.className = "text-red-500";
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: pass1 });
    if (error) throw error;

    msg.textContent = "✅ Contraseña actualizada. Ya puedes iniciar sesión.";
    msg.className = "text-green-600";
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500";
  }
});
