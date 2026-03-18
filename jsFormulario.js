document.addEventListener('DOMContentLoaded', function () {
  const form      = document.getElementById('formulario');
  const successEl = document.getElementById('success-msg');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre');
    const email  = document.getElementById('email');
    const edad   = document.getElementById('edad');

    const nombreError = document.getElementById('nombreError');
    const emailError  = document.getElementById('emailError');
    const edadError   = document.getElementById('edadError');

    // Clear previous errors
    nombreError.textContent = '';
    emailError.textContent  = '';
    edadError.textContent   = '';

    let valid = true;

    if (!nombre.value.trim() || nombre.value.trim().length < 2) {
      nombreError.textContent = 'Name must be at least 2 characters.';
      valid = false;
    }

    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      emailError.textContent = 'Enter a valid email address.';
      valid = false;
    }

    if (!edad.value || parseInt(edad.value) < 18) {
      edadError.textContent = 'You must be 18 or older to register.';
      valid = false;
    }

    if (!valid) return;

    // Save to localStorage
    localStorage.setItem('player_name',  nombre.value.trim());
    localStorage.setItem('player_email', email.value.trim());

    // Show success
    form.style.display   = 'none';
    successEl.classList.remove('hidden');
  });
});
