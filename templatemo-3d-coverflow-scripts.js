/*
IMPRESIONES GRAFIC - JavaScript Mejorado
Versión 2.0 - Optimizado para rendimiento y UX
*/

// ===== VARIABLES GLOBALES OPTIMIZADAS =====
const coverflowItems = document.querySelectorAll('.coverflow-item');
const dotsContainer = document.getElementById('dots');
const coverflowContainer = document.querySelector('.coverflow-container');
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
const currentSlideElement = document.getElementById('currentSlide');
const totalSlidesElement = document.getElementById('totalSlides');
const heroParticlesContainer = document.getElementById('heroParticles');

let currentCoverflowIndex = 3;
let isCoverflowAnimating = false;
let isMobile = window.innerWidth <= 768;
let autoplayInterval = null;
let isPlaying = true;
let lastScrollTop = 0;
let scrollDirection = 'down';

// ===== DETECCIÓN DE DISPOSITIVO Y NAVEGADOR =====
function detectDeviceAndBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detectar Android
    if (/android/.test(userAgent)) {
        document.body.classList.add('android-device');
        console.log('Android detectado - aplicando optimizaciones');
    }
    
    // Detectar iOS
    if (/iphone|ipad|ipod/.test(userAgent)) {
        document.body.classList.add('ios-device');
        console.log('iOS detectado - aplicando optimizaciones');
    }
    
    // Detectar conexión lenta
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.saveData === true || connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
            document.body.classList.add('slow-connection');
            console.log('Conexión lenta detectada - optimizando recursos');
            // Reducir animaciones en conexiones lentas
            reduceAnimationsForSlowConnection();
        }
    }
    
    // Detectar preferencia de movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        console.log('Movimiento reducido preferido - desactivando animaciones pesadas');
        reduceMotionAnimations();
    }
}

function reduceAnimationsForSlowConnection() {
    // Reducir o eliminar animaciones no esenciales
    const style = document.createElement('style');
    style.textContent = `
        .hero-particle,
        .decoration-circle,
        .scroll-dot,
        .preloader-progress-bar,
        .showcase-logo {
            animation: none !important;
        }
        
        .coverflow-item {
            transition-duration: 0.3s !important;
        }
        
        .servicio-card:hover,
        .catalogo-card:hover,
        .portfolio-item:hover {
            transform: none !important;
        }
    `;
    document.head.appendChild(style);
}

function reduceMotionAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(style);
}

// ===== COVERFLOW FUNCTIONS OPTIMIZADAS =====

// Crear dots del coverflow
function createCoverflowDots() {
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    coverflowItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Ir a la imagen ${index + 1}`);
        dot.onclick = () => goToCoverflowIndex(index);
        
        // Soporte para teclado
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToCoverflowIndex(index);
            }
        });
        
        dotsContainer.appendChild(dot);
    });
    
    // Actualizar contador de slides
    if (totalSlidesElement) {
        totalSlidesElement.textContent = coverflowItems.length;
    }
    updateCoverflowCounter();
}

// Actualizar contador
function updateCoverflowCounter() {
    if (currentSlideElement) {
        currentSlideElement.textContent = currentCoverflowIndex + 1;
    }
}

// Función optimizada para actualizar el coverflow
function updateCoverflow() {
    if (isCoverflowAnimating) return;
    isCoverflowAnimating = true;

    const isMobileView = window.innerWidth <= 768;
    const centerOffset = isMobileView ? 160 : 200;
    const zOffset = isMobileView ? 120 : 180;
    const rotation = isMobileView ? 40 : 60;

    coverflowItems.forEach((item, index) => {
        let offset = index - currentCoverflowIndex;
        
        // Ajustar para vista circular
        if (offset > coverflowItems.length / 2) {
            offset = offset - coverflowItems.length;
        } else if (offset < -coverflowItems.length / 2) {
            offset = offset + coverflowItems.length;
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

        // Aplicar transformaciones
        const transform = `
            translateX(${translateX}px) 
            translateZ(${translateZ}px) 
            rotateY(${rotateY}deg)
            scale(${scale})
        `;
        
        item.style.transform = transform;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;
        item.style.pointerEvents = absOffset > 2 ? 'none' : 'auto';

        // Actualizar clases
        item.classList.toggle('active', index === currentCoverflowIndex);
        item.setAttribute('aria-hidden', index !== currentCoverflowIndex);
        item.setAttribute('tabindex', index === currentCoverflowIndex ? '0' : '-1');
    });

    // Actualizar dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCoverflowIndex);
        dot.setAttribute('aria-current', index === currentCoverflowIndex ? 'true' : 'false');
    });

    // Actualizar contador
    updateCoverflowCounter();

    // Permitir siguiente animación
    setTimeout(() => {
        isCoverflowAnimating = false;
    }, isMobileView ? 400 : 600);
}

// Navegación del coverflow
function navigateCoverflow(direction) {
    if (isCoverflowAnimating) return;
    
    currentCoverflowIndex = currentCoverflowIndex + direction;
    
    if (currentCoverflowIndex < 0) {
        currentCoverflowIndex = coverflowItems.length - 1;
    } else if (currentCoverflowIndex >= coverflowItems.length) {
        currentCoverflowIndex = 0;
    }
    
    updateCoverflow();
    handleUserInteraction();
}

function goToCoverflowIndex(index) {
    if (isCoverflowAnimating || index === currentCoverflowIndex) return;
    currentCoverflowIndex = index;
    updateCoverflow();
    handleUserInteraction();
}

// Navegación con teclado para el coverflow
if (coverflowContainer) {
    coverflowContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateCoverflow(-1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateCoverflow(1);
        }
        if (e.key === 'Home') {
            e.preventDefault();
            goToCoverflowIndex(0);
        }
        if (e.key === 'End') {
            e.preventDefault();
            goToCoverflowIndex(coverflowItems.length - 1);
        }
        if (e.key === ' ') {
            e.preventDefault();
            toggleAutoplay();
        }
    });
}

// Click en items del coverflow
coverflowItems.forEach((item, index) => {
    item.addEventListener('click', () => goToCoverflowIndex(index));
});

// ===== TOUCH/SWIPE SUPPORT OPTIMIZADO =====
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;
const SWIPE_THRESHOLD = 50;
const SWIPE_VERTICAL_THRESHOLD = 100;

// Eventos táctiles optimizados
if (coverflowContainer) {
    coverflowContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = true;
    }, { passive: true });

    coverflowContainer.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        e.preventDefault();
    }, { passive: false });

    coverflowContainer.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Solo procesar si el swipe fue más horizontal que vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
            handleUserInteraction();
            
            if (diffX > 0) {
                navigateCoverflow(1);
            } else {
                navigateCoverflow(-1);
            }
        }
        
        isSwiping = false;
    }, { passive: true });
}

// ===== AUTOPLAY FUNCTIONS OPTIMIZADAS =====
function startAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
    
    // Intervalo más lento en móvil o conexiones lentas
    const interval = isMobile || document.body.classList.contains('slow-connection') ? 5000 : 4000;
    
    autoplayInterval = setInterval(() => {
        currentCoverflowIndex = (currentCoverflowIndex + 1) % coverflowItems.length;
        updateCoverflow();
    }, interval);
    
    isPlaying = true;
    updatePlayPauseButton();
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.setAttribute('aria-label', 'Pausar presentación automática');
    }
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    isPlaying = false;
    updatePlayPauseButton();
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.setAttribute('aria-label', 'Reproducir presentación automática');
    }
}

function toggleAutoplay() {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function updatePlayPauseButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
}

function handleUserInteraction() {
    stopAutoplay();
    // Reiniciar autoplay después de 10 segundos de inactividad
    setTimeout(startAutoplay, 10000);
}

// Event listeners para detener autoplay al interactuar
coverflowItems.forEach((item) => {
    item.addEventListener('click', handleUserInteraction);
    item.addEventListener('touchstart', handleUserInteraction);
});

const prevBtn = document.querySelector('.nav-button.prev');
const nextBtn = document.querySelector('.nav-button.next');

if (prevBtn) {
    prevBtn.addEventListener('click', handleUserInteraction);
    prevBtn.addEventListener('touchstart', handleUserInteraction);
}

if (nextBtn) {
    nextBtn.addEventListener('click', handleUserInteraction);
    nextBtn.addEventListener('touchstart', handleUserInteraction);
}

const dots = document.querySelectorAll('.dot');
dots.forEach((dot) => {
    dot.addEventListener('click', handleUserInteraction);
    dot.addEventListener('touchstart', handleUserInteraction);
});

if (coverflowContainer) {
    coverflowContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            handleUserInteraction();
        }
    });
}

// ===== MENÚ MOBILE MEJORADO =====
function initMobileMenu() {
    if (!menuToggle || !mainMenu) return;
    
    // Toggle del menú
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Cerrar menú al hacer clic en enlaces
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && mainMenu.classList.contains('active')) {
            if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    
    // Cerrar menú con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth <= 768 && mainMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Prevenir scroll cuando el menú está abierto
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (mainMenu.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        });
    });
    
    observer.observe(mainMenu, { attributes: true });
}

function toggleMobileMenu() {
    menuToggle.classList.toggle('active');
    mainMenu.classList.toggle('active');
    
    const isExpanded = menuToggle.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isExpanded);
    menuToggle.setAttribute('aria-label', isExpanded ? 'Cerrar menú' : 'Abrir menú');
}

function closeMobileMenu() {
    menuToggle.classList.remove('active');
    mainMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Animación de números (estadísticas)
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                const suffix = statNumber.textContent.includes('%') ? '%' : '';
                animateNumber(statNumber, 0, target, 1500, suffix);
                observer.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
    
    // Animación de elementos al hacer scroll
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observar elementos que deben animarse
    document.querySelectorAll('.servicio-card, .portfolio-item, .catalogo-card, .benefit-item, .proceso-step').forEach(el => {
        animateOnScroll.observe(el);
    });
}

function animateNumber(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== FILTRO DE PORTAFOLIO MEJORADO =====
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterBtns.length === 0 || portfolioItems.length === 0) return;
    
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
            
            // Filtrar items con animación
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
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
            
            // Anunciar cambio para lectores de pantalla
            announceFilterChange(filterValue);
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

function announceFilterChange(filterValue) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    
    let message = 'Mostrando todos los proyectos';
    if (filterValue !== 'all') {
        message = `Mostrando proyectos de ${filterValue}`;
    }
    
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ===== SCROLL TO CONTACT MEJORADO =====
function scrollToContact(service = '') {
    const contactSection = document.getElementById('contact');
    const header = document.getElementById('header');
    
    if (!contactSection) return;
    
    // Cerrar menú móvil si está abierto
    if (window.innerWidth <= 768) {
        closeMobileMenu();
    }
    
    // Calcular posición con offset del header
    const headerHeight = header ? header.offsetHeight : 90;
    const targetPosition = contactSection.offsetTop - headerHeight + 20;
    
    // Scroll suave
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Si se especificó un servicio, llenar el campo después de un delay
    if (service && service !== '') {
        setTimeout(() => {
            const serviceSelect = document.getElementById('service');
            if (serviceSelect) {
                const options = Array.from(serviceSelect.options);
                const matchingOption = options.find(option => 
                    option.value.toLowerCase() === service.toLowerCase() ||
                    option.text.toLowerCase().includes(service.toLowerCase())
                );
                
                if (matchingOption) {
                    serviceSelect.value = matchingOption.value;
                    
                    // Disparar evento change para actualizar UI
                    const event = new Event('change', { bubbles: true });
                    serviceSelect.dispatchEvent(event);
                    
                    // Enfocar el select en móvil
                    if (isMobile) {
                        setTimeout(() => serviceSelect.focus(), 300);
                    }
                }
            }
            
            // Mostrar notificación
            showNotification(`Perfecto! Te llevamos al formulario para ${getServiceName(service)}.`, 'success');
        }, 500);
    }
}

function getServiceName(serviceKey) {
    const services = {
        'tarjetas': 'Tarjetas Personales',
        'reconocimientos': 'Reconocimientos y Trofeos',
        'invitaciones': 'Invitaciones Especiales',
        'afiches': 'Afiches y Calendarios',
        'volantes': 'Volantes y Folletos',
        'diseno': 'Diseño Gráfico',
        'otros': 'otros servicios'
    };
    
    return services[serviceKey] || serviceKey;
}

// ===== NOTIFICATION SYSTEM MEJORADO =====
function showNotification(message, type = 'info', duration = 5000) {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        closeNotification(notification);
    });
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');
    
    // Íconos para cada tipo
    const icons = {
        'success': '✓',
        'error': '✗',
        'warning': '⚠',
        'info': 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon" aria-hidden="true">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: ${isMobile ? '80px' : '100px'};
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 90vw;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Configurar funcionalidades
    setupNotificationFunctionality(notification, duration);
    
    return notification;
}

function getNotificationColor(type) {
    const colors = {
        'success': 'rgba(81, 207, 102, 0.95)',
        'error': 'rgba(255, 107, 107, 0.95)',
        'warning': 'rgba(255, 193, 7, 0.95)',
        'info': 'rgba(94, 86, 231, 0.95)'
    };
    return colors[type] || colors.info;
}

function setupNotificationFunctionality(notification, duration) {
    const closeBtn = notification.querySelector('.notification-close');
    
    // Cerrar al hacer clic en el botón
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto-cerrar después de la duración
    let autoCloseTimer = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Pausar auto-cerrar al hover
    notification.addEventListener('mouseenter', () => {
        clearTimeout(autoCloseTimer);
    });
    
    notification.addEventListener('mouseleave', () => {
        autoCloseTimer = setTimeout(() => {
            closeNotification(notification);
        }, 3000);
    });
    
    // Cerrar con ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeNotification(notification);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

function closeNotification(notification) {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// ===== FORM HANDLING MEJORADO =====
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Validación en tiempo real
        setupRealTimeValidation(form);
        
        // Manejo de envío
        form.addEventListener('submit', handleFormSubmit);
        
        // Mejorar UX de inputs
        improveInputUX(form);
    });
    
    // Inicializar botones de urgencia
    initUrgencyButtons();
    
    // Inicializar file upload
    initFileUpload();
}

function setupRealTimeValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Validar al salir del campo
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        // Limpiar errores al escribir
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
        
        // Validar campos requeridos al cambiar
        if (input.hasAttribute('required')) {
            input.addEventListener('change', () => {
                validateField(input);
            });
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones básicas
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo es requerido';
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ingresa un email válido';
        }
    }
    
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Ingresa un teléfono válido (8-20 dígitos)';
        }
    }
    
    if (field.id === 'message' && value.length < 10) {
        isValid = false;
        errorMessage = 'Por favor, proporciona más detalles (mínimo 10 caracteres)';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
        showFieldSuccess(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.id = `${field.id}-error`;
    
    field.parentNode.appendChild(error);
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', error.id);
}

function showFieldSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    field.setAttribute('aria-invalid', 'false');
    
    // Remover clase success después de 2 segundos
    setTimeout(() => {
        field.classList.remove('success');
    }, 2000);
}

function clearFieldError(field) {
    const error = field.parentNode.querySelector('.error-message');
    if (error) {
        error.remove();
    }
    field.classList.remove('error');
    field.removeAttribute('aria-describedby');
}

function improveInputUX(form) {
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Auto-expand textarea
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
        
        // Formatear teléfono mientras se escribe
        if (input.type === 'tel') {
            input.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 0) {
                    value = '+' + value;
                }
                this.value = value;
            });
        }
    });
}

function initUrgencyButtons() {
    const urgencyBtns = document.querySelectorAll('.urgency-btn');
    const urgencyInput = document.getElementById('urgency');
    
    if (!urgencyBtns.length || !urgencyInput) return;
    
    urgencyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            urgencyBtns.forEach(b => b.classList.remove('active'));
            
            // Agregar active al clickeado
            this.classList.add('active');
            
            // Actualizar valor del input hidden
            urgencyInput.value = this.getAttribute('data-value');
        });
        
        // Establecer normal como activo por defecto
        if (btn.getAttribute('data-value') === 'normal') {
            btn.classList.add('active');
        }
    });
}

function initFileUpload() {
    const fileInputs = document.querySelectorAll('.file-input');
    
    fileInputs.forEach(input => {
        const label = input.nextElementSibling;
        
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileNames = Array.from(this.files)
                    .map(file => file.name)
                    .join(', ');
                
                label.innerHTML = `
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    <span>${this.files.length} archivo(s) seleccionado(s)</span>
                    <span class="file-hint">${fileNames}</span>
                `;
                label.classList.add('has-files');
            } else {
                label.innerHTML = `
                    <i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>
                    <span>Sube imágenes de referencia</span>
                    <span class="file-hint">PNG, JPG o PDF (máx. 5MB cada uno)</span>
                `;
                label.classList.remove('has-files');
            }
        });
        
        // Drag and drop
        label.addEventListener('dragover', (e) => {
            e.preventDefault();
            label.classList.add('dragover');
        });
        
        label.addEventListener('dragleave', () => {
            label.classList.remove('dragover');
        });
        
        label.addEventListener('drop', (e) => {
            e.preventDefault();
            label.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    if (!submitBtn) return false;
    
    // Validar formulario
    if (!validateForm(form)) {
        showNotification('Por favor, corrige los errores en el formulario.', 'error');
        // Enfocar el primer campo con error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
        return false;
    }
    
    // Mostrar estado de carga
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Preparar datos del formulario
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    
    try {
        // Simular envío a servidor (reemplazar con tu endpoint real)
        await simulateFormSubmission(formObject);
        
        // Éxito
        showNotification('✅ Solicitud enviada correctamente. Te contactaremos en menos de 2 horas.', 'success');
        
        // Reset form
        form.reset();
        
        // Reset file upload labels
        form.querySelectorAll('.file-label').forEach(label => {
            label.innerHTML = `
                <i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>
                <span>Sube imágenes de referencia</span>
                <span class="file-hint">PNG, JPG o PDF (máx. 5MB cada uno)</span>
            `;
            label.classList.remove('has-files');
        });
        
        // Reset urgency buttons
        const urgencyBtns = form.querySelectorAll('.urgency-btn');
        urgencyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'normal') {
                btn.classList.add('active');
            }
        });
        
        // Enviar evento a analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'contact',
                'event_label': 'solicitud_presupuesto'
            });
        }
        
    } catch (error) {
        // Error
        showNotification('❌ Error al enviar la solicitud. Por favor, inténtalo de nuevo o contáctanos directamente.', 'error');
        console.error('Form submission error:', error);
        
    } finally {
        // Restaurar botón
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Scroll al inicio del formulario
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    return false;
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

async function simulateFormSubmission(data) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular respuesta exitosa
    return { success: true, message: 'Form submitted successfully' };
}

// ===== SMOOTH SCROLLING AND ACTIVE MENU =====
function initSmoothScrolling() {
    // Actualizar menú activo al hacer scroll
    window.addEventListener('scroll', throttle(updateActiveMenuItem, 100));
    
    // Smooth scroll para anclas internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                smoothScrollTo(targetElement);
                
                // Actualizar URL sin recargar
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
    
    // Logo click para ir al inicio
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo(document.body);
            
            if (history.pushState) {
                history.pushState(null, null, window.location.pathname);
            }
        });
    }
}

function smoothScrollTo(element) {
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 90;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

function updateActiveMenuItem() {
    const sections = document.querySelectorAll('.section');
    const menuItems = document.querySelectorAll('.menu-item');
    const header = document.getElementById('header');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;
    
    // Determinar sección actual
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Actualizar items del menú
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
    if (header) {
        const currentScrollTop = window.pageYOffset;
        
        if (currentScrollTop > 50) {
            header.classList.add('scrolled');
            
            // Determinar dirección del scroll
            if (currentScrollTop > lastScrollTop) {
                scrollDirection = 'down';
                header.style.transform = 'translateY(-100%)';
            } else {
                scrollDirection = 'up';
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    }
    
    // Mostrar/ocultar botón "subir"
    if (scrollToTopBtn) {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
            scrollToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            scrollToTopBtn.classList.remove('visible');
            scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }
    }
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    scrollToTopBtn.addEventListener('click', () => {
        smoothScrollTo(document.body);
    });
    
    // Soporte para teclado
    scrollToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTopBtn.click();
        }
    });
}

// ===== PDF VIEWER MEJORADO =====
function openPdfViewer(pdfUrl, title = 'Catálogo') {
    // Verificar si el PDF está disponible
    if (!pdfUrl || pdfUrl === '#') {
        showNotification('El catálogo no está disponible en este momento. Por favor, contáctanos directamente.', 'error');
        return;
    }
    
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
                <div class="pdf-loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando catálogo...</p>
                </div>
                <iframe 
                    src="${pdfUrl}" 
                    frameborder="0"
                    title="Visor de PDF - ${title}"
                    allowfullscreen
                    loading="lazy"
                    aria-label="Visor de documento PDF"
                    onload="hidePdfLoader(this)"
                    onerror="handlePdfError(this)"
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

function hidePdfLoader(iframe) {
    const loader = iframe.parentNode.querySelector('.pdf-loading');
    if (loader) {
        loader.style.display = 'none';
    }
    iframe.style.display = 'block';
}

function handlePdfError(iframe) {
    const loader = iframe.parentNode.querySelector('.pdf-loading');
    if (loader) {
        loader.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning);"></i>
            <p>Error al cargar el catálogo. Por favor, inténtalo de nuevo o contáctanos.</p>
            <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">
                Reintentar
            </button>
        `;
    }
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
            background: var(--card-bg);
            border-radius: var(--border-radius-xl);
            width: 95%;
            max-width: 1200px;
            height: 90vh;
            display: flex;
            flex-direction: column;
            animation: modalSlideIn 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: var(--shadow-xl);
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
            background: var(--danger);
            transform: scale(1.1);
        }
        
        .pdf-viewer-container {
            flex: 1;
            padding: 20px;
            min-height: 400px;
            position: relative;
        }
        
        .pdf-loading {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--card-bg);
            z-index: 1;
        }
        
        .pdf-viewer-container iframe {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: none;
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
            color: var(--accent);
            margin-right: 8px;
        }
        
        .pdf-note {
            color: var(--warning) !important;
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
    `;
    document.head.appendChild(style);
}

function setupPdfViewerFunctionality(modal, title) {
    const closeBtn = modal.querySelector('.btn-close-pdf');
    const fullscreenBtn = modal.querySelector('.btn-fullscreen');
    const overlay = modal.querySelector('.pdf-modal-overlay');
    const iframe = modal.querySelector('iframe');
    
    if (!closeBtn) return;
    
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
    if (overlay) overlay.addEventListener('click', closeModal);
    
    // Pantalla completa
    if (fullscreenBtn) {
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
    }
    
    // Focus trap y teclado
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('fullscreen')) {
                modal.classList.remove('fullscreen');
                if (fullscreenBtn) {
                    fullscreenBtn.querySelector('i').className = 'fas fa-expand';
                    fullscreenBtn.title = 'Pantalla completa';
                    fullscreenBtn.setAttribute('aria-label', 'Pantalla completa');
                }
            } else {
                closeModal();
            }
        }
        
        if (e.key === 'Tab' && focusableElements.length > 1) {
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
    
    // Enfocar iframe después de cargar
    if (iframe) {
        iframe.addEventListener('load', () => {
            setTimeout(() => iframe.focus(), 300);
        });
    }
}

// ===== PORTFOLIO MODALS =====
function initPortfolioModals() {
    const viewDetailsBtns = document.querySelectorAll('.view-details');
    
    viewDetailsBtns.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const portfolioItem = this.closest('.portfolio-item');
            if (!portfolioItem) return;
            
            const image = portfolioItem.querySelector('img');
            const titleElement = portfolioItem.querySelector('h4');
            const descriptionElement = portfolioItem.querySelector('p');
            
            if (!image || !titleElement) return;
            
            const imageSrc = image.src;
            const title = titleElement.textContent;
            const shortDescription = descriptionElement ? descriptionElement.textContent : '';
            
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

// ===== UTILITY FUNCTIONS =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== AJUSTES RESPONSIVE =====
function adjustForScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    isMobile = width <= 768;
    
    // Ajustar menú según tamaño
    if (menuToggle && mainMenu) {
        if (isMobile) {
            // MÓVIL: Mostrar hamburguesa
            menuToggle.style.display = 'flex';
            if (!mainMenu.classList.contains('active')) {
                mainMenu.style.display = 'none';
            }
        } else {
            // DESKTOP: Ocultar hamburguesa, mostrar menú
            menuToggle.style.display = 'none';
            mainMenu.style.display = 'flex';
            mainMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
    
    // Ajustar tamaño de items del coverflow
    if (width < 480) {
        coverflowItems.forEach(item => {
            item.style.width = '170px';
            item.style.height = '170px';
        });
    } else if (width < 768) {
        coverflowItems.forEach(item => {
            item.style.width = '200px';
            item.style.height = '200px';
        });
    } else if (width < 1024) {
        coverflowItems.forEach(item => {
            item.style.width = '240px';
            item.style.height = '240px';
        });
    } else {
        coverflowItems.forEach(item => {
            item.style.width = '280px';
            item.style.height = '280px';
        });
    }
    
    // Ajustar altura del contenedor del coverflow
    if (coverflowContainer) {
        if (isMobile && width > height) {
            // Landscape en móvil
            coverflowContainer.style.height = '250px';
        } else {
            coverflowContainer.style.height = isMobile ? '300px' : '400px';
        }
    }
    
    // Actualizar coverflow
    updateCoverflow();
}

// Throttle resize event
window.addEventListener('resize', debounce(() => {
    adjustForScreenSize();
    
    // Cerrar menú móvil al cambiar a desktop
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}, 250));

// ===== LOAD PARTICLES =====
function loadParticles() {
    if (!heroParticlesContainer || isMobile) return;
    
    const particleCount = 30;
    heroParticlesContainer.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        const opacity = Math.random() * 0.3 + 0.1;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}%;
            top: ${posY}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            background: rgba(94, 86, 231, ${opacity});
        `;
        
        heroParticlesContainer.appendChild(particle);
    }
}

// ===== INICIALIZACIÓN COMPLETA =====
function initAll() {
    console.log('🚀 Inicializando IMPRESIONES GRAFIC...');
    
    // Detectar dispositivo y aplicar optimizaciones
    detectDeviceAndBrowser();
    
    // Inicializar componentes
    createCoverflowDots();
    updateCoverflow();
    initMobileMenu();
    initPortfolioFilter();
    initPortfolioModals();
    initFormHandling();
    initSmoothScrolling();
    initScrollToTop();
    initScrollAnimations();
    
    // Configurar ARIA attributes
    setAriaAttributes();
    
    // Ajustar para tamaño de pantalla actual
    adjustForScreenSize();
    
    // Iniciar autoplay
    setTimeout(() => {
        startAutoplay();
    }, 1000);
    
    // Cargar partículas (solo en desktop)
    if (!isMobile) {
        loadParticles();
    }
    
    // Marcar como cargado
    document.body.classList.add('loaded');
    
    console.log('✅ Sitio inicializado correctamente');
}

// Configurar ARIA attributes
function setAriaAttributes() {
    // Menu toggle
    if (menuToggle) {
        menuToggle.setAttribute('aria-label', 'Abrir menú');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', 'mainMenu');
    }
    
    // Main menu
    if (mainMenu) {
        mainMenu.setAttribute('aria-label', 'Menú principal');
    }
    
    // Coverflow
    if (coverflowContainer) {
        coverflowContainer.setAttribute('aria-label', 'Galería de trabajos');
        coverflowContainer.setAttribute('aria-roledescription', 'carousel');
        coverflowContainer.setAttribute('aria-live', 'polite');
    }
    
    // Navigation buttons
    const prevBtn = document.querySelector('.nav-button.prev');
    const nextBtn = document.querySelector('.nav-button.next');
    
    if (prevBtn) prevBtn.setAttribute('aria-label', 'Imagen anterior');
    if (nextBtn) nextBtn.setAttribute('aria-label', 'Siguiente imagen');
    
    // Play/Pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Reproducir presentación automática');
    
    // Service cards
    document.querySelectorAll('.servicio-card').forEach((card, index) => {
        card.setAttribute('role', 'article');
        const title = card.querySelector('h3');
        if (title) {
            card.setAttribute('aria-label', `Servicio: ${title.textContent}`);
        }
    });
    
    // Portfolio items
    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.setAttribute('role', 'article');
        const title = item.querySelector('h4');
        if (title) {
            item.setAttribute('aria-label', `Proyecto: ${title.textContent}`);
        }
    });
    
    // Catalog cards
    document.querySelectorAll('.catalogo-card').forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        const title = card.querySelector('h3');
        if (title) {
            card.setAttribute('aria-label', `Abrir catálogo: ${title.textContent}`);
        }
    });
    
    // Form elements
    const form = document.getElementById('consultaForm');
    if (form) {
        form.setAttribute('aria-label', 'Formulario de solicitud de presupuesto');
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
    // Remover preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Asegurar que la barra de progreso llegue al 100%
        const progressBar = preloader.querySelector('.preloader-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        setTimeout(() => {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');
            
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.style.display = 'none';
                }
                
                // Inicializar todo
                initAll();
                
                // Mostrar notificación de bienvenida
                setTimeout(() => {
                    showNotification(
                        '🎨 ¡Bienvenido a IMPRESIONES GRAFIC! Descubre 25 años de experiencia en diseño e impresión.',
                        'info',
                        4000
                    );
                }, 1000);
                
                // Marcar como completamente cargado
                document.body.classList.add('fully-loaded');
                
                // Enviar evento de carga completa a analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_view', {
                        'page_title': 'IMPRESIONES GRAFIC - Inicio',
                        'page_location': window.location.href
                    });
                }
                
            }, 500);
        }, 800);
    } else {
        // Si no hay preloader, inicializar directamente
        initAll();
    }
});

// Inicializar en DOM ready si el load event ya pasó
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Configuración inicial básica
        detectDeviceAndBrowser();
        adjustForScreenSize();
    });
} else {
    // DOM ya está listo
    detectDeviceAndBrowser();
    adjustForScreenSize();
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
    
    // Enviar error a analytics si está disponible
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            'description': e.error.message,
            'fatal': false
        });
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});

// ===== EXPORT FUNCIONES GLOBALES =====
window.scrollToContact = scrollToContact;
window.handleSubmit = handleSubmit;
window.navigate = navigateCoverflow;
window.goToIndex = goToCoverflowIndex;
window.toggleAutoplay = toggleAutoplay;
window.openPdfViewer = openPdfViewer;
window.showNotification = showNotification;

// Performance monitoring
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('📊 Performance Metrics:', {
                    'DOM Loaded': (perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart).toFixed(2) + 'ms',
                    'Load Complete': (perfData.loadEventEnd - perfData.loadEventStart).toFixed(2) + 'ms',
                    'Total Time': (perfData.loadEventEnd - perfData.fetchStart).toFixed(2) + 'ms'
                });
            }
        }
        
        // Log de recursos cargados
        const resources = window.performance.getEntriesByType('resource');
        console.log(`📦 Recursos cargados: ${resources.length} items`);
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

// Web App Manifest
if ('standalone' in navigator || window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('standalone');
}

// Online/Offline detection
window.addEventListener('online', () => {
    showNotification('✅ Conexión restablecida', 'success', 3000);
});

window.addEventListener('offline', () => {
    showNotification('⚠️ Estás trabajando sin conexión', 'warning', 5000);
});
