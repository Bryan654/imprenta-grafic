/*
TemplateMo 595 3d coverflow
https://templatemo.com/tm-595-3d-coverflow
*/

// ===== VARIABLES GLOBALES OPTIMIZADAS =====
const items = document.querySelectorAll('.coverflow-item');
const dotsContainer = document.getElementById('dots');
const container = document.querySelector('.coverflow-container');
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
let currentIndex = 3;
let isAnimating = false;
let isMobile = window.innerWidth <= 768;
let isAndroid = /Android/i.test(navigator.userAgent);
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// ===== DETECCIÓN DE DISPOSITIVO Y NAVEGADOR =====
function detectDeviceAndBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detectar Android
    if (/android/.test(userAgent)) {
        document.body.classList.add('android-device');
        isAndroid = true;
        console.log('Dispositivo Android detectado');
    }
    
    // Detectar iOS
    if (/iphone|ipad|ipod/.test(userAgent)) {
        document.body.classList.add('ios-device');
        isIOS = true;
        console.log('Dispositivo iOS detectado');
    }
    
    // Detectar Chrome en Android (problemas específicos)
    if (/chrome/.test(userAgent) && /android/.test(userAgent)) {
        document.body.classList.add('android-chrome');
        console.log('Chrome en Android detectado - aplicando correcciones');
    }
    
    // Detectar Safari en iOS
    if (/safari/.test(userAgent) && !/chrome/.test(userAgent) && /iphone|ipad/.test(userAgent)) {
        document.body.classList.add('ios-safari');
        console.log('Safari en iOS detectado');
    }
    
    // Detectar conexión lenta
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.saveData === true || connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
            document.body.classList.add('slow-connection');
            console.log('Conexión lenta detectada - optimizando');
        }
    }
}

// ===== COVERFLOW FUNCTIONS OPTIMIZADAS =====

// Mobile menu toggle - OPTIMIZADO Y CORREGIDO
menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Toggle classes
    menuToggle.classList.toggle('active');
    mainMenu.classList.toggle('menu-open');
    
    // Update ARIA attributes
    const isExpanded = menuToggle.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isExpanded);
    menuToggle.setAttribute('aria-label', isExpanded ? 'Cerrar menú' : 'Abrir menú');
    
    // Lock scroll when menu is open
    document.body.style.overflow = isExpanded ? 'hidden' : '';
});

// Cerrar menú al hacer clic en items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        }
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && mainMenu.classList.contains('menu-open')) {
        if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        }
    }
});

// Cerrar menú con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.innerWidth <= 768 && mainMenu.classList.contains('menu-open')) {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
    }
});

// Crear dots
function createDots() {
    items.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Ir a la imagen ${index + 1}`);
        dot.onclick = () => goToIndex(index);
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToIndex(index);
            }
        });
        dotsContainer.appendChild(dot);
    });
}

const dots = document.querySelectorAll('.dot');
let autoplayInterval = null;
let isPlaying = true;
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

// Función optimizada para dispositivos móviles
function updateCoverflow() {
    if (isAnimating) return;
    isAnimating = true;

    const isMobileView = window.innerWidth <= 768;
    const centerOffset = isMobileView ? 160 : 200; // Menor offset en móvil
    const zOffset = isMobileView ? 120 : 180; // Menor profundidad en móvil
    const rotation = isMobileView ? 40 : 60; // Menor rotación en móvil

    items.forEach((item, index) => {
        let offset = index - currentIndex;
        
        // Ajustar para vista circular
        if (offset > items.length / 2) {
            offset = offset - items.length;
        } else if (offset < -items.length / 2) {
            offset = offset + items.length;
        }
        
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);
        
        // Calcular transformaciones
        let translateX = offset * centerOffset;
        let translateZ = -absOffset * zOffset;
        let rotateY = -sign * Math.min(absOffset * rotation, rotation);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.08);

        // Ocultar elementos muy lejos
        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 700;
        }

        // Aplicar transformaciones optimizadas
        const transform = `
            translateX(${translateX}px) 
            translateZ(${translateZ}px) 
            rotateY(${rotateY}deg)
            scale(${scale})
        `;
        
        item.style.transform = transform;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;
        item.style.willChange = 'transform, opacity';

        item.classList.toggle('active', index === currentIndex);
        item.setAttribute('aria-hidden', index !== currentIndex);
    });

    // Actualizar dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
        dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
    });

    // Permitir siguiente animación
    setTimeout(() => {
        isAnimating = false;
    }, isMobileView ? 400 : 600); // Animación más rápida en móvil
}

function navigate(direction) {
    if (isAnimating) return;
    
    currentIndex = currentIndex + direction;
    
    if (currentIndex < 0) {
        currentIndex = items.length - 1;
    } else if (currentIndex >= items.length) {
        currentIndex = 0;
    }
    
    updateCoverflow();
    handleUserInteraction();
}

function goToIndex(index) {
    if (isAnimating || index === currentIndex) return;
    currentIndex = index;
    updateCoverflow();
    handleUserInteraction();
}

// Navegación con teclado optimizada
container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
    }
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
    }
    if (e.key === 'Home') {
        e.preventDefault();
        goToIndex(0);
    }
    if (e.key === 'End') {
        e.preventDefault();
        goToIndex(items.length - 1);
    }
});

// Click en items
items.forEach((item, index) => {
    item.addEventListener('click', () => goToIndex(index));
});

// ===== TOUCH/SWIPE SUPPORT OPTIMIZADO =====
let touchStartX = 0;
let touchEndX = 0;
let touchStartTime = 0;
let isSwiping = false;
const swipeThreshold = 50;
const swipeTimeThreshold = 300;

// Eventos táctiles optimizados
container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isSwiping = true;
}, { passive: true });

container.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    e.preventDefault();
}, { passive: false });

container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    
    touchEndX = e.changedTouches[0].clientX;
    const touchEndTime = Date.now();
    
    const diffX = touchStartX - touchEndX;
    const diffTime = touchEndTime - touchStartTime;
    
    // Solo procesar swipe si fue rápido
    if (Math.abs(diffX) > swipeThreshold && diffTime < swipeTimeThreshold) {
        handleUserInteraction();
        
        if (diffX > 0) {
            navigate(1); // Swipe izquierda = siguiente
        } else {
            navigate(-1); // Swipe derecha = anterior
        }
    }
    
    isSwiping = false;
}, { passive: true });

// ===== INICIALIZACIÓN DE IMÁGENES OPTIMIZADA =====
function initializeImages() {
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        const reflection = item.querySelector('.reflection');
        
        if (img.complete) {
            handleImageLoad(img, reflection);
        } else {
            img.onload = () => handleImageLoad(img, reflection);
            img.onerror = () => {
                img.parentElement.classList.add('image-loading');
                console.warn(`Error cargando imagen ${index + 1}`);
            };
        }
    });
}

function handleImageLoad(img, reflection) {
    img.parentElement.classList.remove('image-loading');
    if (reflection) {
        reflection.style.backgroundImage = `url(${img.src})`;
        reflection.style.backgroundSize = 'cover';
        reflection.style.backgroundPosition = 'center';
    }
}

// ===== AUTOPLAY FUNCTIONS OPTIMIZADAS =====
function startAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
    
    // Intervalo más lento en móvil
    const interval = isMobile ? 5000 : 4000;
    
    autoplayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCoverflow();
    }, interval);
    
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    document.getElementById('playPauseBtn').setAttribute('aria-label', 'Pausar presentación automática');
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    document.getElementById('playPauseBtn').setAttribute('aria-label', 'Reproducir presentación automática');
}

function toggleAutoplay() {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function handleUserInteraction() {
    stopAutoplay();
}

// Event listeners para detener autoplay
items.forEach((item) => {
    item.addEventListener('click', handleUserInteraction);
    item.addEventListener('touchstart', handleUserInteraction);
});

document.querySelector('.nav-button.prev').addEventListener('click', handleUserInteraction);
document.querySelector('.nav-button.next').addEventListener('click', handleUserInteraction);

dots.forEach((dot) => {
    dot.addEventListener('click', handleUserInteraction);
    dot.addEventListener('touchstart', handleUserInteraction);
});

container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        handleUserInteraction();
    }
});

// ===== FILTRO DE PORTAFOLIO OPTIMIZADO =====
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos los botones
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            
            // Agregar active al botón clickeado
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filtrar items con animación suave
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    // Forzar reflow para animación
                    void item.offsetWidth;
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        if (category !== filterValue && filterValue !== 'all') {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
        
        // Soporte para teclado
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// ===== SCROLL TO CONTACT OPTIMIZADO =====
function scrollToContact(service = '') {
    const contactSection = document.getElementById('contact');
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 80;
    
    // Scroll suave a la sección de contacto
    window.scrollTo({
        top: contactSection.offsetTop - headerHeight,
        behavior: 'smooth'
    });
    
    // Si se especificó un servicio, llenar el campo
    if (service && service !== '') {
        setTimeout(() => {
            const serviceSelect = document.getElementById('service');
            if (serviceSelect) {
                const options = Array.from(serviceSelect.options);
                const matchingOption = options.find(option => 
                    option.text.toLowerCase().includes(service.toLowerCase()) ||
                    option.value.toLowerCase().includes(service.toLowerCase())
                );
                
                if (matchingOption) {
                    serviceSelect.value = matchingOption.value;
                    
                    // Desplegar el select en móvil
                    if (isMobile) {
                        serviceSelect.focus();
                    }
                }
            }
        }, 500);
    }
    
    // Mostrar notificación
    showNotification(`Perfecto! Te llevamos al formulario de contacto para ${service || 'tu consulta'}`, 'info');
}

// ===== FORM SUBMISSION HANDLER OPTIMIZADO =====
function handleSubmit(event, formType = 'consulta') {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    const formData = new FormData(form);
    
    // Validar formulario
    if (!validateForm(form)) {
        showNotification('Por favor, completa todos los campos requeridos correctamente.', 'error');
        return false;
    }
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simular envío (en producción esto sería fetch a backend)
    setTimeout(() => {
        // Éxito
        showNotification('✅ Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
        
        // Reset form
        form.reset();
        
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Enviar evento a analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'contact',
                'event_label': formType
            });
        }
        
        // Scroll al inicio del formulario
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    }, 1500);
    
    return false;
}

// ===== NOTIFICATION SYSTEM OPTIMIZADO =====
function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon" aria-hidden="true">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
    `;
    
    // Estilos inline para rendimiento
    notification.style.cssText = `
        position: fixed;
        top: ${isMobile ? '80px' : '90px'};
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 280px;
        max-width: 90%;
        animation: notificationSlideIn 0.3s ease;
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    // Agregar estilos CSS si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notificationSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin-left: 15px;
                line-height: 1;
                min-width: 30px;
                min-height: 30px;
                opacity: 0.8;
            }
            .notification-close:hover {
                opacity: 1;
            }
            @media (max-width: 480px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: calc(100% - 40px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Funcionalidad del botón cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Cerrar con ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeNotification(notification);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Auto-remover después de 5 segundos
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification);
        }
    }, 5000);
    
    // Pausar auto-remove al hover
    notification.addEventListener('mouseenter', () => {
        clearTimeout(autoRemove);
    });
    
    notification.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (notification.parentNode) {
                closeNotification(notification);
            }
        }, 3000);
    });
    
    return notification;
}

function closeNotification(notification) {
    notification.style.animation = 'notificationSlideOut 0.3s ease';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        'success': 'rgba(81, 207, 102, 0.95)',
        'error': 'rgba(255, 107, 107, 0.95)',
        'warning': 'rgba(255, 193, 7, 0.95)',
        'info': 'rgba(78, 205, 196, 0.95)'
    };
    return colors[type] || colors.info;
}

// ===== PORTFOLIO MODALS OPTIMIZADOS =====
function initPortfolioModals() {
    const viewDetailsBtns = document.querySelectorAll('.view-details');
    
    viewDetailsBtns.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const portfolioItem = this.closest('.portfolio-item');
            const imageSrc = portfolioItem.querySelector('img').src;
            const title = portfolioItem.querySelector('h4').textContent;
            const shortDescription = portfolioItem.querySelector('p').textContent;
            
            // Descripciones detalladas
            const detailedDescriptions = [
                {
                    title: "Tarjetas Personales Corporativas",
                    description: "En IMPRESIONES GRAFIC diseñamos tarjetas de presentación que no solo transmiten información, sino que cuentan la historia de tu marca. Utilizamos materiales premium como cartulina couché de 300g, acabados en relieve, troquelados especiales y barniz UV selectivo para crear piezas que dejan una impresión duradera.",
                    features: ["Diseño personalizado con 3 revisiones", "Materiales premium (cartulina 300g)", "Acabados especiales (relieve, troquelado)", "Impresión full color de alta resolución", "Entrega en 48 horas hábiles", "Mínimo 100 unidades"],
                    price: "Desde Bs. 150",
                    delivery: "48 horas"
                },
                {
                    title: "Reconocimientos Personalizados",
                    description: "Nuestros reconocimientos y diplomas son diseñados para premiar la excelencia. Trabajamos con papeles especiales como pergamino, texturizados y con marcas de agua, incorporando elementos gráficos que reflejan la importancia del logro. Cada pieza es única y diseñada según la institución o evento.",
                    features: ["Diseño elegante y formal", "Papeles especiales (pergamino, texturizados)", "Marcos de madera o acrílico opcional", "Personalización completa de textos", "Numeración y validación oficial", "Embalaje protector premium"],
                    price: "Desde Bs. 80",
                    delivery: "72 horas"
                },
                {
                    title: "Trofeos Exclusivos",
                    description: "Creamos trofeos que se convierten en símbolos de logro y reconocimiento. Combinamos diferentes materiales como cristal tallado, acrílico láser, metal cromado y bases de mármol sintético para piezas realmente memorables. Cada trofeo cuenta una historia de triunfo.",
                    features: ["Combinación de materiales premium", "Grabado láser personalizado", "Bases estables y elegantes", "Diseño exclusivo para cada evento", "Embalaje de lujo con espuma", "Instalación en evento (opcional)"],
                    price: "Desde Bs. 200",
                    delivery: "5-7 días"
                },
                {
                    title: "Invitaciones Elegantes",
                    description: "Transformamos tus momentos especiales en recuerdos tangibles. Diseñamos invitaciones que anticipan la magia de tu evento, utilizando técnicas como letterpress, foil stamping, cortes láser y papeles especiales importados. Cada detalle es cuidadosamente considerado.",
                    features: ["Diseño único para cada evento", "Papeles importados de alta calidad", "Técnicas especiales (foil, relieve)", "Sobres personalizados y lacrados", "Coordinación completa del diseño", "Muestras físicas antes de producción"],
                    price: "Desde Bs. 3 por unidad",
                    delivery: "5 días"
                },
                {
                    title: "Afiches Publicitarios",
                    description: "Diseñamos afiches que no solo informan, sino que impactan y persuaden. Trabajamos con impresión de gran formato hasta 150x100cm, materiales resistentes a la intemperie y técnicas de visualización estratégica para maximizar el alcance de tu mensaje.",
                    features: ["Gran formato hasta 150x100cm", "Materiales resistentes a la intemperie", "Impresión en alta resolución", "Diseño optimizado para visualización", "Instalación profesional incluida", "Resistencia UV para exteriores"],
                    price: "Desde Bs. 50",
                    delivery: "24-48 horas"
                },
                {
                    title: "Certificados Institucionales",
                    description: "Documentos oficiales que otorgan validez y prestigio. Diseñamos certificados con elementos de seguridad, numeración serial, marcas de agua y firmas digitales, garantizando autenticidad y profesionalismo para instituciones educativas, empresas y organizaciones.",
                    features: ["Elementos de seguridad integrados", "Numeración serial consecutiva", "Marcas de agua y fondos seguridad", "Papeles de calidad archivística", "Validación oficial y firmas", "Diseño acorde a normativa institucional"],
                    price: "Desde Bs. 25 por unidad",
                    delivery: "3 días"
                }
            ];
            
            // Obtener descripción detallada
            const detailedInfo = detailedDescriptions[index] || {
                title: title,
                description: shortDescription,
                features: ["Calidad garantizada", "Diseño personalizado", "Entrega puntual", "Atención personalizada"],
                price: "Consultar",
                delivery: "Variable"
            };
            
            // Crear modal
            const modal = createPortfolioModal(detailedInfo, imageSrc);
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            // Configurar funcionalidades del modal
            setupModalFunctionality(modal);
        });
        
        // Soporte para teclado
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

function createPortfolioModal(detailedInfo, imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'portfolio-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
        <div class="modal-overlay" tabindex="-1"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="Cerrar modal">&times;</button>
            <img src="${imageSrc}" alt="${detailedInfo.title}" loading="lazy">
            <div class="modal-info">
                <h3 id="modal-title">${detailedInfo.title}</h3>
                <p class="modal-description">${detailedInfo.description}</p>
                
                <div class="modal-features">
                    <h4><i class="fas fa-check-circle" aria-hidden="true"></i> Características del servicio:</h4>
                    <ul>
                        ${detailedInfo.features.map(feature => `<li><i class="fas fa-check" aria-hidden="true"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="modal-details-grid">
                    <div class="detail-item">
                        <i class="fas fa-tag" aria-hidden="true"></i>
                        <div>
                            <h5>Precio aproximado</h5>
                            <p class="price">${detailedInfo.price}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-shipping-fast" aria-hidden="true"></i>
                        <div>
                            <h5>Tiempo de entrega</h5>
                            <p>${detailedInfo.delivery}</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-palette" aria-hidden="true"></i>
                        <div>
                            <h5>Diseño incluido</h5>
                            <p>3 revisiones</p>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-award" aria-hidden="true"></i>
                        <div>
                            <h5>Garantía</h5>
                            <p>100% satisfacción</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-primary" onclick="scrollToContact('${detailedInfo.title.split(' ')[0].toLowerCase()}')">
                        <i class="fas fa-comments" aria-hidden="true"></i> Solicitar presupuesto personalizado
                    </button>
                    <button class="btn-secondary modal-close-btn">
                        <i class="fas fa-times" aria-hidden="true"></i> Cerrar
                    </button>
                </div>
                
                <p class="modal-note"><i class="fas fa-info-circle" aria-hidden="true"></i> Los precios pueden variar según cantidad, materiales y especificaciones del proyecto.</p>
            </div>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#modal-styles')) {
        addModalStyles();
    }
    
    return modal;
}

function addModalStyles() {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .portfolio-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .modal-content {
            position: relative;
            background: #1a1a2e;
            border-radius: 20px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalFadeIn 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes modalFadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 1;
            transition: all 0.3s ease;
        }
        .modal-close:hover {
            background: rgba(255,255,255,0.2);
            transform: rotate(90deg);
        }
        .modal-content img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 20px 20px 0 0;
        }
        .modal-info {
            padding: 25px;
        }
        .modal-info h3 {
            color: white;
            margin-bottom: 15px;
            font-size: 1.6rem;
        }
        .modal-description {
            color: rgba(255,255,255,0.8);
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 1rem;
        }
        .modal-features {
            margin-bottom: 25px;
        }
        .modal-features h4 {
            color: white;
            margin-bottom: 15px;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .modal-features h4 i {
            color: var(--accent-color);
        }
        .modal-features ul {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        @media (max-width: 768px) {
            .modal-features ul {
                grid-template-columns: 1fr;
            }
        }
        .modal-features li {
            color: rgba(255,255,255,0.7);
            padding: 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
        }
        .modal-features li i {
            color: var(--secondary-color);
            font-size: 0.8rem;
        }
        .modal-details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 25px;
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 480px) {
            .modal-details-grid {
                grid-template-columns: 1fr;
            }
        }
        .detail-item {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .detail-item i {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            color: white;
        }
        .detail-item h5 {
            color: rgba(255,255,255,0.9);
            font-size: 0.85rem;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .detail-item p {
            color: rgba(255,255,255,0.7);
            font-size: 0.85rem;
            margin: 0;
        }
        .detail-item .price {
            color: var(--accent-color);
            font-weight: 700;
            font-size: 1rem;
        }
        .modal-actions {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        @media (max-width: 480px) {
            .modal-actions {
                flex-direction: column;
            }
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 14px 20px;
            border-radius: 30px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 0.95rem;
            min-height: 48px;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 14px 20px;
            border-radius: 30px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 0.95rem;
            min-height: 48px;
        }
        .btn-secondary:hover {
            background: rgba(255,255,255,0.2);
        }
        .modal-note {
            color: rgba(255,255,255,0.5);
            font-size: 0.8rem;
            text-align: center;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .modal-note i {
            color: var(--secondary-color);
        }
        @media (max-width: 768px) {
            .portfolio-modal {
                padding: 10px;
            }
            .modal-content img {
                height: 200px;
            }
            .modal-info {
                padding: 20px;
            }
            .modal-info h3 {
                font-size: 1.3rem;
            }
        }
    `;
    document.head.appendChild(style);
}

function setupModalFunctionality(modal) {
    const closeModal = () => {
        modal.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    if (firstFocusableElement) {
        setTimeout(() => firstFocusableElement.focus(), 100);
    }
    
    // Teclado
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
        
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
}

// ===== FORM VALIDATION OPTIMIZADA =====
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        setupFormValidation(form);
    });
}

function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Validación en tiempo real
        input.addEventListener('blur', () => {
            validateInput(input);
        });
        
        // Limpiar errores al escribir
        input.addEventListener('input', () => {
            clearError(input);
        });
        
        // Submit con Enter en textarea
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.click();
                    }
                }
            });
        }
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones básicas
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo es requerido';
    }
    
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ingresa un email válido';
        }
    }
    
    if (input.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Ingresa un teléfono válido (8-20 dígitos)';
        }
    }
    
    if (!isValid) {
        showInputError(input, errorMessage);
    } else {
        clearError(input);
    }
    
    return isValid;
}

function showInputError(input, message) {
    clearError(input);
    
    const error = document.createElement('div');
    error.className = 'input-error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    error.style.cssText = `
        color: var(--accent-color);
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    `;
    
    input.parentNode.appendChild(error);
    input.style.borderColor = 'var(--accent-color)';
    input.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
    
    // Enfocar el input si es el primer error
    if (!document.querySelector('.input-error:first-of-type')) {
        setTimeout(() => input.focus(), 100);
    }
}

function clearError(input) {
    const error = input.parentNode.querySelector('.input-error');
    if (error) {
        error.remove();
    }
    input.style.borderColor = '';
    input.style.boxShadow = '';
}

// ===== SMOOTH SCROLLING AND ACTIVE MENU ITEM OPTIMIZADO =====
const sections = document.querySelectorAll('.section');
const menuItems = document.querySelectorAll('.menu-item');
const header = document.getElementById('header');
const scrollToTopBtn = document.getElementById('scrollToTop');

// Update active menu item on scroll
function updateActiveMenuItem() {
    const scrollPosition = window.scrollY + 100;
    let currentSection = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    menuItems.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-current', 'false');
        
        const href = item.getAttribute('href');
        if (href === `#${currentSection}`) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        }
    });

    // Header background on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Show/hide scroll to top button
    if (window.scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
        scrollToTopBtn.setAttribute('aria-hidden', 'false');
    } else {
        scrollToTopBtn.classList.remove('visible');
        scrollToTopBtn.setAttribute('aria-hidden', 'true');
    }
}

// Throttle scroll event
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            updateActiveMenuItem();
        }, 100);
    }
});

// Smooth scroll to section
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('href');
        
        if (targetId && targetId.startsWith('#') && targetId !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Cerrar menú móvil si está abierto
                if (window.innerWidth <= 768) {
                    menuToggle.classList.remove('active');
                    mainMenu.classList.remove('menu-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Abrir menú');
                    document.body.style.overflow = '';
                }
                
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Actualizar URL sin recargar
                history.pushState(null, null, targetId);
            }
        }
    });
});

// Logo click to scroll to top
document.querySelector('.logo-container').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, null, window.location.pathname);
});

// Scroll to top button
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Keyboard support for scroll to top
scrollToTopBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTopBtn.click();
    }
});

// ===== PDF VIEWER OPTIMIZADO =====
function openPdfViewer(pdfUrl, title = 'Catálogo') {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'pdf-viewer-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'pdf-modal-title');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="pdf-modal-overlay" tabindex="-1"></div>
        <div class="pdf-modal-content">
            <div class="pdf-modal-header">
                <h3 id="pdf-modal-title">${title}</h3>
                <div class="pdf-modal-actions">
                    <button class="btn-fullscreen" title="Pantalla completa" aria-label="Pantalla completa">
                        <i class="fas fa-expand" aria-hidden="true"></i>
                    </button>
                    <button class="btn-close-pdf" title="Cerrar" aria-label="Cerrar visor de PDF">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div class="pdf-viewer-container">
                <iframe 
                    src="${pdfUrl}" 
                    frameborder="0"
                    title="Visor de PDF - ${title}"
                    allowfullscreen
                    loading="lazy"
                    aria-label="Visor de documento PDF"
                ></iframe>
            </div>
            <div class="pdf-modal-footer">
                <p><i class="fas fa-mouse-pointer" aria-hidden="true"></i> Usa las flechas para navegar • <i class="fas fa-search-plus" aria-hidden="true"></i> Rueda del mouse para zoom</p>
                <p class="pdf-note"><i class="fas fa-info-circle" aria-hidden="true"></i> Catálogo de solo visualización</p>
            </div>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#pdf-viewer-styles')) {
        addPdfViewerStyles();
    }
    
    // Agregar al DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Configurar funcionalidades
    setupPdfViewerFunctionality(modal, title);
}

function addPdfViewerStyles() {
    const style = document.createElement('style');
    style.id = 'pdf-viewer-styles';
    style.textContent = `
        .pdf-viewer-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .pdf-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .pdf-modal-content {
            position: relative;
            background: #1a1a2e;
            border-radius: 20px;
            width: 95%;
            max-width: 1200px;
            height: 90vh;
            display: flex;
            flex-direction: column;
            animation: modalSlideIn 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(50px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        @keyframes modalSlideOut {
            from {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            to {
                opacity: 0;
                transform: translateY(50px) scale(0.95);
            }
        }
        .pdf-modal-header {
            padding: 20px 25px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0,0,0,0.3);
            border-radius: 20px 20px 0 0;
        }
        .pdf-modal-header h3 {
            color: white;
            margin: 0;
            font-size: 1.4rem;
        }
        .pdf-modal-actions {
            display: flex;
            gap: 10px;
        }
        .btn-fullscreen, .btn-close-pdf {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-fullscreen:hover {
            background: rgba(255,255,255,0.2);
            transform: scale(1.1);
        }
        .btn-close-pdf:hover {
            background: var(--accent-color);
            transform: scale(1.1);
        }
        .pdf-viewer-container {
            flex: 1;
            padding: 20px;
            min-height: 400px;
        }
        .pdf-viewer-container iframe {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .pdf-modal-footer {
            padding: 15px 25px;
            border-top: 1px solid rgba(255,255,255,0.1);
            text-align: center;
            background: rgba(0,0,0,0.3);
            border-radius: 0 0 20px 20px;
        }
        .pdf-modal-footer p {
            color: rgba(255,255,255,0.7);
            font-size: 0.9rem;
            margin-bottom: 8px;
        }
        .pdf-modal-footer i {
            color: var(--secondary-color);
            margin-right: 8px;
        }
        .pdf-note {
            color: var(--accent-color) !important;
            font-weight: 600;
            font-size: 0.85rem !important;
        }
        
        /* Modo pantalla completa */
        .pdf-viewer-modal.fullscreen .pdf-modal-content {
            width: 100%;
            height: 100vh;
            max-width: none;
            border-radius: 0;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .pdf-viewer-modal {
                padding: 10px;
            }
            .pdf-modal-content {
                width: 100%;
                height: 100vh;
                border-radius: 0;
            }
            .pdf-viewer-container {
                padding: 10px;
            }
            .pdf-modal-header {
                padding: 15px 20px;
            }
            .pdf-modal-header h3 {
                font-size: 1.2rem;
            }
            .pdf-modal-footer p {
                font-size: 0.8rem;
            }
        }
        
        @media (max-width: 480px) {
            .pdf-modal-header {
                padding: 12px 15px;
            }
            .pdf-modal-header h3 {
                font-size: 1.1rem;
            }
            .btn-fullscreen, .btn-close-pdf {
                width: 36px;
                height: 36px;
                font-size: 1rem;
            }
            .pdf-viewer-container {
                padding: 8px;
            }
            .pdf-modal-footer {
                padding: 12px 15px;
            }
        }
    `;
    document.head.appendChild(style);
}

function setupPdfViewerFunctionality(modal, title) {
    const closeBtn = modal.querySelector('.btn-close-pdf');
    const fullscreenBtn = modal.querySelector('.btn-fullscreen');
    const overlay = modal.querySelector('.pdf-modal-overlay');
    const iframe = modal.querySelector('iframe');
    
    // Enfocar botón cerrar
    setTimeout(() => closeBtn.focus(), 100);
    
    // Cerrar modal
    const closeModal = () => {
        modal.style.animation = 'modalSlideOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Pantalla completa
    fullscreenBtn.addEventListener('click', () => {
        modal.classList.toggle('fullscreen');
        const icon = fullscreenBtn.querySelector('i');
        if (modal.classList.contains('fullscreen')) {
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = 'Salir de pantalla completa';
            fullscreenBtn.setAttribute('aria-label', 'Salir de pantalla completa');
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = 'Pantalla completa';
            fullscreenBtn.setAttribute('aria-label', 'Pantalla completa');
        }
    });
    
    // Focus trap y teclado
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('fullscreen')) {
                modal.classList.remove('fullscreen');
                fullscreenBtn.querySelector('i').className = 'fas fa-expand';
                fullscreenBtn.title = 'Pantalla completa';
                fullscreenBtn.setAttribute('aria-label', 'Pantalla completa');
            } else {
                closeModal();
            }
        }
    });
    
    // Enfocar iframe después de un momento
    setTimeout(() => iframe.focus(), 300);
}

// ===== AJUSTES RESPONSIVE =====
function adjustCoverflowForScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    isMobile = width <= 768;
    
    // Ajustar tamaño de items según dispositivo
    if (width < 480) {
        items.forEach(item => {
            item.style.width = '160px';
            item.style.height = '160px';
        });
    } else if (width < 768) {
        items.forEach(item => {
            item.style.width = '180px';
            item.style.height = '180px';
        });
    } else if (width < 1024) {
        items.forEach(item => {
            item.style.width = '220px';
            item.style.height = '220px';
        });
    } else {
        items.forEach(item => {
            item.style.width = '260px';
            item.style.height = '260px';
        });
    }
    
    // Ajustar altura del contenedor
    if (isMobile && width > height) { // Landscape en móvil
        container.style.height = '250px';
    } else {
        container.style.height = isMobile ? '250px' : '350px';
    }
    
    updateCoverflow();
}

// Throttle resize event
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        adjustCoverflowForScreen();
        
        // Cerrar menú móvil al cambiar a desktop
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        }
        
        // Actualizar detección de dispositivo
        isMobile = window.innerWidth <= 768;
    }, 250);
});

// ===== INICIALIZACIÓN COMPLETA =====
function initAll() {
    console.log('Inicializando IMPRESIONES GRAFIC...');
    
    // Detectar dispositivo
    detectDeviceAndBrowser();
    
    // Inicializar componentes en orden
    createDots();
    initializeImages();
    updateCoverflow();
    
    // Configurar coverflow
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', 'Galería de trabajos - Use flechas para navegar');
    
    // Inicializar autoplay (más lento en móvil)
    setTimeout(() => {
        startAutoplay();
    }, 1000);
    
    // Inicializar otras funcionalidades
    initPortfolioFilter();
    initPortfolioModals();
    initFormValidation();
    
    // Actualizar menú activo
    updateActiveMenuItem();
    
    // Configurar ARIA attributes
    setAriaAttributes();
    
    // Ajustar coverflow para pantalla actual
    adjustCoverflowForScreen();
    
    // Marcar como cargado
    document.body.classList.add('loaded');
    
    console.log('Sitio inicializado correctamente');
}

// Configurar ARIA attributes
function setAriaAttributes() {
    // Menu toggle
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'mainMenu');
    
    // Main menu
    mainMenu.setAttribute('aria-label', 'Menú principal');
    
    // Coverflow container
    container.setAttribute('aria-label', 'Galería de trabajos');
    container.setAttribute('aria-roledescription', 'carousel');
    container.setAttribute('aria-live', 'polite');
    
    // Navigation buttons
    document.querySelector('.nav-button.prev').setAttribute('aria-label', 'Imagen anterior');
    document.querySelector('.nav-button.next').setAttribute('aria-label', 'Siguiente imagen');
    
    // Play/Pause button
    document.getElementById('playPauseBtn').setAttribute('aria-label', 'Reproducir presentación automática');
    
    // Service cards
    document.querySelectorAll('.servicio-card').forEach((card, index) => {
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Servicio: ${card.querySelector('h3').textContent}`);
    });
    
    // Portfolio items
    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.setAttribute('role', 'article');
        item.setAttribute('aria-label', `Proyecto: ${item.querySelector('h4').textContent}`);
    });
    
    // Catalog cards
    document.querySelectorAll('.catalogo-card').forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Abrir catálogo: ${card.querySelector('h3').textContent}`);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
    
    // Form elements
    const form = document.getElementById('consultaForm');
    if (form) {
        form.setAttribute('aria-label', 'Formulario de contacto');
        form.querySelectorAll('input, textarea, select').forEach(input => {
            if (!input.id) {
                const name = input.getAttribute('name');
                if (name) {
                    input.id = `input-${name}`;
                    const label = input.parentNode.querySelector('label');
                    if (label) {
                        label.setAttribute('for', input.id);
                    }
                }
            }
        });
    }
}

// ===== LOADING Y WELCOME =====
window.addEventListener('load', function() {
    // Remover estado de carga si existe
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            loadingElement.remove();
        }, 300);
    }
    
    // Inicializar todo
    initAll();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        showNotification('👋 ¡Bienvenido a IMPRESIONES GRAFIC! Explora nuestros servicios de diseño e impresión.', 'info');
    }, 2000);
    
    // Marcar como completamente cargado
    document.body.classList.add('fully-loaded');
});

// Inicializar en DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// ===== EXPORT FUNCIONES GLOBALES =====
window.scrollToContact = scrollToContact;
window.handleSubmit = handleSubmit;
window.navigate = navigate;
window.goToIndex = goToIndex;
window.toggleAutoplay = toggleAutoplay;
window.openPdfViewer = openPdfViewer;

// ===== ERROR HANDLING Y PERFORMANCE =====
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
    // En producción, enviar a servicio de tracking
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});

// Performance monitoring
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Performance:', {
                    'DOM Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
                    'Total Time': perfData.loadEventEnd - perfData.fetchStart
                });
            }
        }
    });
}

// Optimizaciones para Android específicas
if (isAndroid) {
    console.log('Aplicando optimizaciones específicas para Android');
    
    // Reducir animaciones en Android
    document.documentElement.style.setProperty('--transition-normal', '0.25s ease');
    document.documentElement.style.setProperty('--transition-slow', '0.4s ease');
    
    // Detener autoplay en conexiones lentas
    if (document.body.classList.contains('slow-connection')) {
        stopAutoplay();
    }
}

// Optimizaciones para iOS específicas
if (isIOS) {
    console.log('Aplicando optimizaciones específicas para iOS');
    
    // Mejorar scroll en iOS
    document.querySelectorAll('.section').forEach(section => {
        section.style.webkitOverflowScrolling = 'touch';
    });
}

// Service Worker (opcional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker no registrado:', error);
        });
    });
}
