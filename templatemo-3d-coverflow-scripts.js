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

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    if (!submitBtn) return false;
    
    // Validar formulario
    if (!validateForm(form)) {
        alert('❌ Por favor, corrige los errores en el formulario.');
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
        alert('✅ Solicitud enviada correctamente. Te contactaremos en menos de 2 horas.');
        
        // Reset form
        form.reset();
        
        // Reset urgency buttons
        const urgencyBtns = form.querySelectorAll('.urgency-btn');
        urgencyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'normal') {
                btn.classList.add('active');
            }
        });
        
    } catch (error) {
        // Error
        alert('❌ Error al enviar la solicitud. Por favor, inténtalo de nuevo o contáctanos directamente.');
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
                    alert('🎨 ¡Bienvenido a IMPRESIONES GRAFIC! Descubre 25 años de experiencia en diseño e impresión.');
                }, 1000);
                
                // Marcar como completamente cargado
                document.body.classList.add('fully-loaded');
                
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
        createCoverflowDots();
        updateCoverflow();
    });
} else {
    // DOM ya está listo
    detectDeviceAndBrowser();
    adjustForScreenSize();
    createCoverflowDots();
    updateCoverflow();
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});

// ===== EXPORT FUNCIONES GLOBALES =====
window.navigate = navigateCoverflow;
window.toggleAutoplay = toggleAutoplay;

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

// Detectar dispositivo y aplicar clases específicas
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
        document.body.classList.add('android');
    }
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
        document.body.classList.add('ios');
    }
}

// Llamar detección de dispositivo
detectDevice();

// Cerrar modales con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const pdfModal = document.getElementById('pdfModal');
        const portfolioModal = document.getElementById('portfolioModal');
        
        if (pdfModal && pdfModal.style.display === 'flex') {
            closePdfViewer();
        }
        
        if (portfolioModal && portfolioModal.style.display === 'flex') {
            closePortfolioModal();
        }
    }
});

// Cerrar modales haciendo clic fuera del contenido
document.addEventListener('click', function(e) {
    const pdfModal = document.getElementById('pdfModal');
    const portfolioModal = document.getElementById('portfolioModal');
    
    if (pdfModal && pdfModal.style.display === 'flex' && e.target === pdfModal) {
        closePdfViewer();
    }
    
    if (portfolioModal && portfolioModal.style.display === 'flex' && e.target === portfolioModal) {
        closePortfolioModal();
    }
});
