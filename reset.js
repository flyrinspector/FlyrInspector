import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://yoxwbxtntqrlioezfubv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveHdieHRudHFybGlvZXpmdWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTcyMzIsImV4cCI6MjA3MTI5MzIzMn0.jKpB-kabRwKcJzMbjmrKoTrN9SrzYZwRHxtZcSWjpgo"; // ⚠️ reemplaza con tu anon key
const supabase = createClient(supabaseUrl, supabaseKey);

let currentPhone = "";

// ---- Enviar OTP ----
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

// ---- Verificar OTP ----
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

    msg.textContent = "✅ Verificación exitosa.";
    msg.className = "text-green-600";

    document.getElementById("profile-phone").textContent = "Teléfono: " + currentPhone;
    document.getElementById("profile-view").classList.remove("hidden");
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-500";
  }
});

// ---- Logout ----
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});
