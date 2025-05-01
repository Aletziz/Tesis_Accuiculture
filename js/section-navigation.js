// Configuración de las secciones por capítulo
const chapterSections = {
    'capitulo1': [
        'capitulo1-ecosistema.html',
        'capitulo1-caracteristicas.html',
        'capitulo1-paisaje.html',
        'capitulo1-mitigacion.html'
    ],
    'capitulo4': [
        'enfrentamiento-cambio-climatico.html',
        'tarea-vida.html',
        'seguridad-alimentaria.html',
        'diversidad-biologica.html',
        'conservacion-bd-cubana.html',
        'salud.html',
        'co2.html',
        'capa-ozono.html',
        'globalizacion.html'
    ]
};

// Función para inicializar la navegación
function initSectionNavigation() {
    // Obtener el nombre del archivo actual
    const currentFile = window.location.pathname.split('/').pop();
    
    // Determinar el capítulo actual
    let currentChapter = null;
    let currentIndex = -1;
    
    for (const chapter in chapterSections) {
        const index = chapterSections[chapter].indexOf(currentFile);
        if (index !== -1) {
            currentChapter = chapter;
            currentIndex = index;
            break;
        }
    }
    
    if (currentChapter && currentIndex !== -1) {
        const sections = chapterSections[currentChapter];
        
        // Crear botones de navegación
        const navButtons = document.createElement('div');
        navButtons.className = 'section-navigation';
        
        // Botón anterior
        if (currentIndex > 0) {
            const prevButton = document.createElement('a');
            prevButton.href = sections[currentIndex - 1];
            prevButton.className = 'nav-button';
            prevButton.textContent = '← Sección Anterior';
            navButtons.appendChild(prevButton);
        }
        
        // Botón siguiente
        if (currentIndex < sections.length - 1) {
            const nextButton = document.createElement('a');
            nextButton.href = sections[currentIndex + 1];
            nextButton.className = 'nav-button';
            nextButton.textContent = 'Siguiente Sección →';
            navButtons.appendChild(nextButton);
        }
        
        // Insertar los botones en la página
        const contentBox = document.querySelector('.content-box');
        if (contentBox) {
            contentBox.appendChild(navButtons);
        }
    }
}

// Inicializar la navegación cuando el documento esté listo
document.addEventListener('DOMContentLoaded', initSectionNavigation); 