// Ajustar la opacidad del fondo al hacer scroll
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const opacity = Math.max(0.4, 0.8 - (scrolled / maxScroll) * 0.4);
    document.documentElement.style.setProperty('--scroll-opacity', opacity);
});

// Seguimiento del mouse para el efecto de brillo
document.querySelectorAll('.section').forEach(section => {
    section.addEventListener('mousemove', e => {
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty('--x', `${x}%`);
        section.style.setProperty('--y', `${y}%`);
    });
});

// Agregar transiciones de página
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a:not([target="_blank"])');
    
    links.forEach(link => {
        link.addEventListener('click', e => {
            if (link.href && link.href.indexOf(window.location.origin) === 0) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                
                setTimeout(() => {
                    window.location.href = link.href;
                }, 400);
            }
        });
    });
}); 