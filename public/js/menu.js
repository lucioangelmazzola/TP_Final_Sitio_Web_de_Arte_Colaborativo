// Contenedor principal de navegación
const menuButton = document.getElementById('drawer-toggle');
const drawer = document.getElementById('side-drawer');
const backdrop = document.getElementById('drawer-backdrop');

function setMenuOpen(isOpen) {
    drawer.classList.toggle('translate-x-full', !isOpen);
    drawer.classList.toggle('translate-x-0', isOpen);

    backdrop.classList.toggle('opacity-0', !isOpen);
    backdrop.classList.toggle('opacity-100', isOpen);
    backdrop.classList.toggle('pointer-events-none', !isOpen);

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    drawer.setAttribute('aria-hidden', String(!isOpen));
    drawer.inert = !isOpen;
}

menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
});

backdrop.addEventListener('click', () => {
    setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.focus();
    }
});

drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        setMenuOpen(false);
    });
});