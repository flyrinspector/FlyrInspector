// Importación de Supabase
const SUPABASE_URL = 'https://your-supabase-url.supabase.co'; // REEMPLAZA ESTO
const SUPABASE_KEY = 'your-supabase-anon-key'; // REEMPLAZA ESTO
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// UI elements
const loginView = document.getElementById('login-view');
const profileView = document.getElementById('profile-view');
const forgotPasswordView = document.getElementById('forgot-password-view');
const signupModal = document.getElementById('signup-modal');
const messageModal = document.getElementById('message-modal');

// Forms
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const profileForm = document.getElementById('profile-form');

// Buttons and links
const signupLink = document.getElementById('signup-link');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const closeSignupModalBtn = document.getElementById('close-signup-modal');
const backToLoginLink = document.getElementById('back-to-login-link');
const logoutButton = document.getElementById('logout-button');
const closeMessageModalBtn = document.getElementById('close-message-modal');

// Functions to show/hide views and modals
function showView(viewId) {
    loginView.classList.add('hidden');
    profileView.classList.add('hidden');
    forgotPasswordView.classList.add('hidden');
    document.getElementById(viewId).classList.remove('hidden');
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showMessageModal(title, body) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = body;
    showModal('message-modal');
}

// Event listeners for navigation
signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('signup-modal');
});

closeSignupModalBtn.addEventListener('click', () => hideModal('signup-modal'));
closeMessageModalBtn.addEventListener('click', () => hideModal('message-modal'));

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('forgot-password-view');
});

backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('login-view');
});

logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    // onAuthStateChange se encarga de cambiar la vista
});

// Supabase authentication logic
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMessageDiv = document.getElementById('login-error-message');
    
    errorMessageDiv.textContent = '';
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMessageDiv.textContent = 'Credenciales inválidas. ' + (error.message.includes('not found') ? '¿No tienes una cuenta?' : 'Intenta de nuevo.');
        errorMessageDiv.classList.remove('hidden');
    } else {
        // Supabase gestiona la sesión, el listener de auth state se encarga de cambiar la vista
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const lastname = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;
    const messageDiv = document.getElementById('signup-message');
    
    messageDiv.textContent = 'Registrando...';
    messageDiv.classList.remove('text-green-500', 'text-red-500');

    // 1. Registrar usuario en la autenticación de Supabase
    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        messageDiv.textContent = 'Error al registrar: ' + error.message;
        messageDiv.classList.add('text-red-500');
        return;
    }

    // 2. Guardar datos adicionales en la tabla 'usuarios'
    const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
            id: user.id,
            nombre: name,
            apellido: lastname,
            correo: email,
            telefono: phone
        }]);

    if (insertError) {
        // Si falla la inserción, es una buena práctica borrar el usuario de auth
        await supabase.auth.admin.deleteUser(user.id);
        messageDiv.textContent = 'Error al guardar datos adicionales. Intenta de nuevo.';
        messageDiv.classList.add('text-red-500');
    } else {
        showMessageModal('Registro Exitoso', '¡Bienvenido! Revisa tu correo electrónico para confirmar tu cuenta.');
        hideModal('signup-modal');
        // Simular envío de notificaciones (requiere configuración de Supabase)
        console.log('Simulando envío de correo de bienvenida a:', email);
        console.log('Simulando envío de SMS de confirmación a:', phone);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const messageDiv = document.getElementById('forgot-message');
    
    messageDiv.textContent = 'Verificando y enviando...';
    messageDiv.classList.remove('text-green-500', 'text-red-500');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });

    if (error) {
        messageDiv.textContent = 'Error al enviar el correo de recuperación: ' + error.message;
        messageDiv.classList.add('text-red-500');
    } else {
        messageDiv.textContent = 'Se ha enviado un correo con un link para restablecer la contraseña. Revisa tu bandeja de entrada.';
        messageDiv.classList.add('text-green-500');
        // En un caso real, aquí iría la lógica para enviar el SMS, si tienes la configuración de Supabase.
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('profile-name').value;
    const newLastname = document.getElementById('profile-lastname').value;
    const newPassword = document.getElementById('profile-password').value;
    const newPhone = document.getElementById('profile-phone').value;
    const messageDiv = document.getElementById('profile-message');
    
    messageDiv.textContent = 'Actualizando...';
    messageDiv.classList.remove('text-green-500', 'text-red-500');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showMessageModal('Error', 'Debes iniciar sesión para actualizar tu perfil.');
        return;
    }

    // Actualizar datos en la tabla 'usuarios'
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            nombre: newName,
            apellido: newLastname,
            telefono: newPhone,
            actualizado_en: new Date().toISOString()
        })
        .eq('id', user.id);

    if (updateError) {
        messageDiv.textContent = 'Error al actualizar los datos: ' + updateError.message;
        messageDiv.classList.add('text-red-500');
        return;
    }

    // Actualizar contraseña en la autenticación de Supabase si se proporciona
    if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) {
            messageDiv.textContent = 'Error al actualizar la contraseña: ' + passwordError.message;
            messageDiv.classList.add('text-red-500');
            return;
        }
    }

    messageDiv.textContent = 'Datos actualizados con éxito.';
    messageDiv.classList.add('text-green-500');
    document.getElementById('profile-password').value = '';
}

// Listener para cambios en el estado de autenticación
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        showView('profile-view');
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (data) {
            document.getElementById('profile-name').value = data.nombre || '';
            document.getElementById('profile-lastname').value = data.apellido || '';
            document.getElementById('profile-email').value = data.correo || '';
            document.getElementById('profile-phone').value = data.telefono || '';
        } else if (error) {
            console.error('Error al cargar datos del usuario:', error);
        }
    } else {
        showView('login-view');
    }
});
    
// Agregar listeners a los formularios
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
forgotPasswordForm.addEventListener('submit', handleForgotPassword);
profileForm.addEventListener('submit', handleProfileUpdate);