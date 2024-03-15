document.addEventListener("DOMContentLoaded", function() {
    // Obtener el formulario por su ID
    const form = document.getElementById('formulario');

    // Agregar un evento de escucha para el evento 'submit' del formulario
    form.addEventListener('submit', (event) => {
        // Comprobamos el formulario entero
        if (!form.checkValidity()) {
            event.preventDefault();
            // Podemos validar nosotros mismos lo que queramos y especificar un mensaje personalizado
            const edad = document.getElementById('edad');

            if (edad.value < 18) {
                edad.setCustomValidity('Debes ser mayor de 18 años para registrarte');
            } else {
                edad.setCustomValidity('');
            }
        }

        // Actualizar los mensajes de error
        const nombreError = document.getElementById('nombreError');
        const emailError = document.getElementById('emailError');
        nombreError.textContent = form.nombre.validationMessage;
        emailError.textContent = form.email.validationMessage;
    });
});
