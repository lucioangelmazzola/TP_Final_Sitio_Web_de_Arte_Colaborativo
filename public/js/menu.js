// 1. Seleccionamos los elementos del HTML por su ID
const menuButton = document.getElementById('drawer-toggle');  // Botón hamburguesa (3 rayas)
const drawer = document.getElementById('side-drawer'); // Panel lateral del menú
const backdrop = document.getElementById('drawer-backdrop'); // Fondo oscuro detrás del menú

// 2. Función principal que abre (isOpen = true) o cierra (isOpen = false) el menú
function setMenuOpen(isOpen) {
    // Mueve el menú fuera de pantalla a la derecha (cerrado) o a su lugar (abierto)
    drawer.classList.toggle('translate-x-full', !isOpen);
    drawer.classList.toggle('translate-x-0', isOpen);

    // Muestra u oculta suavemente el fondo oscuro transparente
    backdrop.classList.toggle('opacity-0', !isOpen);
    backdrop.classList.toggle('opacity-100', isOpen);
    // Permite hacer clic en la página de atrás cuando el menú está cerrado
    backdrop.classList.toggle('pointer-events-none', !isOpen);

    // Actualiza etiquetas de accesibilidad para lectores de pantalla y teclado
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    drawer.setAttribute('aria-hidden', String(!isOpen));
    // Evita que se seleccionen los enlaces con la tecla Tab cuando el menú está cerrado
    drawer.inert = !isOpen;
}

// 3. Al hacer clic en el botón hamburguesa, invierte el estado actual (abre o cierra)
menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
});

// 4. Al hacer clic en el fondo oscuro (afuera del menú), lo cierra
backdrop.addEventListener('click', () => {
    setMenuOpen(false);
});

// 5. Al presionar la tecla Escape (Esc), cierra el menú y devuelve el foco al botón
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.focus();
    }
});

// 6. Al hacer clic en cualquiera de los enlaces del menú, lo cierra automáticamente
drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        setMenuOpen(false);
    });
});