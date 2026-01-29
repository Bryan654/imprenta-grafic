/*
IMPRESIONES GRAFIC - JavaScript Mejorado
Versión 2.0 - Optimizado para rendimiento y UX
*/

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

function detectDeviceAndBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
        document.body.classList.add('android-device');
        console.log('Android detectado - aplicando optimizaciones');
    }
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
        document.body.classList.add('ios-device');
        console.log('iOS detectado - aplicando optimizaciones');
    }
    
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.saveData === true || connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
            document.body.classList.add('slow-connection');
            console.log('Conexión lenta detectada - optimizando recursos');
            reduceAnimationsForSlowConnection();
        }
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        console.log('Movimiento reducido preferido - desactivando animaciones pesadas');
        reduceMotionAnimations();
    }
}

function reduceAnimationsForSlowConnection() {
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
        
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToCoverflowIndex(index);
            }
        });
        
        dotsContainer.appendChild(dot);
    });
    
    if (totalSlidesElement) {
        totalSlidesElement.textContent = coverflowItems.length;
    }
    updateCoverflowCounter();
}

function updateCoverflowCounter() {
    if (currentSlideElement) {
        currentSlideElement.textContent = currentCoverflowIndex + 1;
    }
}

function updateCoverflow() {
    if (isCoverflowAnimating) return;
    isCoverflowAnimating = true;

    const isMobileView = window.innerWidth <= 768;
    const centerOffset = isMobileView ? 160 : 200;
    const zOffset = isMobileView ? 120 : 180;
    const rotation = isMobileView ? 40 : 60;

    coverflowItems.forEach((item, index) => {
        let offset = index - currentCoverflowIndex;
        
        if (offset > coverflowItems.length / 2) {
            offset = offset - coverflowItems.length;
        } else if (offset < -coverflowItems.length / 2) {
            offset = offset + coverflowItems.length;
        }
        
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);
        
        let translateX = offset * centerOffset;
        let translateZ = -absOffset * zOffset;
        let rotateY = -sign * Math.min(absOffset * rotation, rotation);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.08);

        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 700;
        }

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

        item.classList.toggle('active', index === currentCoverflowIndex);
        item.setAttribute('aria-hidden', index !== currentCoverflowIndex);
        item.setAttribute('tabindex', index === currentCoverflowIndex ? '0' : '-1');
    });

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCoverflowIndex);
        dot.setAttribute('aria-current', index === currentCoverflowIndex ? 'true' : 'false');
    });

    updateCoverflowCounter();

    setTimeout(() => {
        isCoverflowAnimating = false;
    }, isMobileView ? 400 : 600);
}

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

coverflowItems.forEach((item, index) => {
    item.addEventListener('click', () => goToCoverflowIndex(index));
});

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;
const SWIPE_THRESHOLD = 50;
const SWIPE_VERTICAL_THRESHOLD = 100;

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

function startAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
    
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
    setTimeout(startAutoplay, 10000);
}

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

function initMobileMenu() {
    if (!menuToggle || !mainMenu) return;
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && mainMenu.classList.contains('active')) {
            if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth <= 768 && mainMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
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

function initScrollAnimations() {
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
    
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
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

function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterBtns.length === 0 || portfolioItems.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            const filterValue = this.getAttribute('data-filter');
            
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
            
            announceFilterChange(filterValue);
        });
        
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

function initSmoothScrolling() {
    window.addEventListener('scroll', throttle(updateActiveMenuItem, 100));
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                smoothScrollTo(targetElement);
                
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
    
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
    
    if (header) {
        const currentScrollTop = window.pageYOffset;
        
        if (currentScrollTop > 50) {
            header.classList.add('scrolled');
            
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

function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    scrollToTopBtn.addEventListener('click', () => {
        smoothScrollTo(document.body);
    });
    
    scrollToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTopBtn.click();
        }
    });
}

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

function adjustForScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    isMobile = width <= 768;
    
    if (menuToggle && mainMenu) {
        if (isMobile) {
            menuToggle.style.display = 'flex';
            if (!mainMenu.classList.contains('active')) {
                mainMenu.style.display = 'none';
            }
        } else {
            menuToggle.style.display = 'none';
            mainMenu.style.display = 'flex';
            mainMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
    
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
    
    if (coverflowContainer) {
        if (isMobile && width > height) {
            coverflowContainer.style.height = '250px';
        } else {
            coverflowContainer.style.height = isMobile ? '300px' : '400px';
        }
    }
    
    updateCoverflow();
}

window.addEventListener('resize', debounce(() => {
    adjustForScreenSize();
    
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}, 250));

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

function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        setupRealTimeValidation(form);
        form.addEventListener('submit', handleFormSubmit);
        improveInputUX(form);
    });
    
    initUrgencyButtons();
}

function setupRealTimeValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
        
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
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
        
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
            urgencyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            urgencyInput.value = this.getAttribute('data-value');
        });
        
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
    
    if (!validateForm(form)) {
        alert('❌ Por favor, corrige los errores en el formulario.');
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
        return false;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());
    
    try {
        await simulateFormSubmission(formObject);
        
        alert('✅ Solicitud enviada correctamente. Te contactaremos en menos de 2 horas.');
        
        form.reset();
        
        const urgencyBtns = form.querySelectorAll('.urgency-btn');
        urgencyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'normal') {
                btn.classList.add('active');
            }
        });
        
    } catch (error) {
        alert('❌ Error al enviar la solicitud. Por favor, inténtalo de nuevo o contáctanos directamente.');
        console.error('Form submission error:', error);
        
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: 'Form submitted successfully' };
}

function initAll() {
    console.log('🚀 Inicializando IMPRESIONES GRAFIC...');
    
    detectDeviceAndBrowser();
    
    createCoverflowDots();
    updateCoverflow();
    initMobileMenu();
    initPortfolioFilter();
    initFormHandling();
    initSmoothScrolling();
    initScrollToTop();
    initScrollAnimations();
    
    setAriaAttributes();
    
    adjustForScreenSize();
    
    setTimeout(() => {
        startAutoplay();
    }, 1000);
    
    if (!isMobile) {
        loadParticles();
    }
    
    document.body.classList.add('loaded');
    
    console.log('✅ Sitio inicializado correctamente');
}

function setAriaAttributes() {
    if (menuToggle) {
        menuToggle.setAttribute('aria-label', 'Abrir menú');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-controls', 'mainMenu');
    }
    
    if (mainMenu) {
        mainMenu.setAttribute('aria-label', 'Menú principal');
    }
    
    if (coverflowContainer) {
        coverflowContainer.setAttribute('aria-label', 'Galería de trabajos');
        coverflowContainer.setAttribute('aria-roledescription', 'carousel');
        coverflowContainer.setAttribute('aria-live', 'polite');
    }
    
    const prevBtn = document.querySelector('.nav-button.prev');
    const nextBtn = document.querySelector('.nav-button.next');
    
    if (prevBtn) prevBtn.setAttribute('aria-label', 'Imagen anterior');
    if (nextBtn) nextBtn.setAttribute('aria-label', 'Siguiente imagen');
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Reproducir presentación automática');
    
    document.querySelectorAll('.servicio-card').forEach((card, index) => {
        card.setAttribute('role', 'article');
        const title = card.querySelector('h3');
        if (title) {
            card.setAttribute('aria-label', `Servicio: ${title.textContent}`);
        }
    });
    
    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.setAttribute('role', 'article');
        const title = item.querySelector('h4');
        if (title) {
            item.setAttribute('aria-label', `Proyecto: ${title.textContent}`);
        }
    });
    
    document.querySelectorAll('.catalogo-card').forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        const title = card.querySelector('h3');
        if (title) {
            card.setAttribute('aria-label', `Abrir catálogo: ${title.textContent}`);
        }
    });
    
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

window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
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
                
                initAll();
                
                setTimeout(() => {
                    alert('🎨 ¡Bienvenido a IMPRESIONES GRAFIC! Descubre 25 años de experiencia en diseño e impresión.');
                }, 1000);
                
                document.body.classList.add('fully-loaded');
                
            }, 500);
        }, 800);
    } else {
        initAll();
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        detectDeviceAndBrowser();
        adjustForScreenSize();
        createCoverflowDots();
        updateCoverflow();
    });
} else {
    detectDeviceAndBrowser();
    adjustForScreenSize();
    createCoverflowDots();
    updateCoverflow();
}

window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});

window.navigate = navigateCoverflow;
window.toggleAutoplay = toggleAutoplay;

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
        
        const resources = window.performance.getEntriesByType('resource');
        console.log(`📦 Recursos cargados: ${resources.length} items`);
    });
}

function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
        document.body.classList.add('android');
    }
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
        document.body.classList.add('ios');
    }
}

detectDevice();

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const pdfModal = document.getElementById('pdfModal');
        const portfolioModal = document.getElementById('portfolioModal');
        
        if (pdfModal && pdfModal.style.display === 'flex') {
            window.closePdfViewer();
        }
        
        if (portfolioModal && portfolioModal.style.display === 'flex') {
            window.closePortfolioModal();
        }
    }
});

document.addEventListener('click', function(e) {
    const pdfModal = document.getElementById('pdfModal');
    const portfolioModal = document.getElementById('portfolioModal');
    
    if (pdfModal && pdfModal.style.display === 'flex' && e.target === pdfModal) {
        window.closePdfViewer();
    }
    
    if (portfolioModal && portfolioModal.style.display === 'flex' && e.target === portfolioModal) {
        window.closePortfolioModal();
    }
});

// Exportar funciones globales para uso desde HTML
window.openPdfViewer = function(catalogoTipo) {
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('pdfModalTitle');
    const modalContent = document.getElementById('pdfModalContent');
    
    const catalogoMap = {
        'invitaciones': {
            title: 'Catálogo de Invitaciones Elegantes',
            pdfUrl: 'catalogos/catalogo-invitaciones.pdf',
            description: 'Diseños exclusivos para bodas, cumpleaños, eventos corporativos y ocasiones especiales'
        },
        'medallas': {
            title: 'Catálogo de Medallas y Accesorios en Acrílico',
            pdfUrl: 'catalogos/catalogo-medallas-accesorios-acrilico.pdf',
            description: 'Medallas de alta calidad para eventos deportivos y reconocimientos'
        },
        'pines': {
            title: 'Catálogo de Pines Personalizados',
            pdfUrl: 'catalogos/catalogo-pines.pdf',
            description: 'Pines de alta calidad para identificación corporativa, eventos y coleccionables'
        },
        'porta-certificados': {
            title: 'Catálogo de Porta Certificados',
            pdfUrl: 'catalogos/catalogo-porta-certificados.pdf',
            description: 'Elegantes portadores para diplomas, certificados y documentos importantes'
        },
        'reconocimientos': {
            title: 'Catálogo de Reconocimientos en Acrílico',
            pdfUrl: 'catalogos/catalogo-reconocimientos-acrilico.pdf',
            description: 'Reconocimientos y diplomas personalizados en acrílico de alta calidad'
        },
        'indumentaria-1': {
            title: 'Catálogo de Indumentaria Minimalista - Parte 1',
            pdfUrl: 'catalogos/catalogo-indumentaria-minimalista-1.pdf',
            description: 'Diseños minimalistas de primera calidad para uniformes corporativos'
        },
        'indumentaria-2': {
            title: 'Catálogo de Indumentaria Minimalista - Parte 2',
            pdfUrl: 'catalogos/catalogo-indumentaria-minimalista-2.pdf',
            description: 'Más diseños minimalistas exclusivos para empresas e instituciones'
        }
    };
    
    const catalogo = catalogoMap[catalogoTipo] || {
        title: 'Catálogo',
        pdfUrl: '',
        description: 'Catálogo no disponible temporalmente'
    };
    
    modalTitle.textContent = catalogo.title;
    
    let content = '';
    
    if (catalogo.pdfUrl) {
        content = `
            <div style="text-align: center;">
                <h4 style="color: #5E56E7; margin-bottom: 20px;">${catalogo.title}</h4>
                <p style="margin-bottom: 20px; color: rgba(255,255,255,0.8);">${catalogo.description}</p>
                
                <div class="pdf-viewer-wrapper" style="height: 400px; overflow: auto; border-radius: 8px; background: rgba(0,0,0,0.3); padding: 10px;">
                    <object data="${catalogo.pdfUrl}" 
                            type="application/pdf" 
                            width="100%" 
                            height="100%"
                            style="border-radius: 6px;">
                        <div style="padding: 40px; text-align: center;">
                            <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">No se puede mostrar el PDF. Por favor, descárgalo para verlo.</p>
                            <a href="${catalogo.pdfUrl}" 
                               download="${catalogo.title.replace(/\s+/g, '-').toLowerCase()}.pdf"
                               style="background: #5E56E7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">
                                <i class="fas fa-download" aria-hidden="true"></i> Descargar PDF
                            </a>
                        </div>
                    </object>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <a href="${catalogo.pdfUrl}" 
                       target="_blank" 
                       style="background: rgba(255,255,255,0.1); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);">
                        <i class="fas fa-external-link-alt" aria-hidden="true"></i> Abrir en nueva pestaña
                    </a>
                    
                    <a href="${catalogo.pdfUrl}" 
                       download="${catalogo.title.replace(/\s+/g, '-').toLowerCase()}.pdf"
                       style="background: #4ECDC4; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fas fa-download" aria-hidden="true"></i> Descargar catálogo
                    </a>
                    
                    <button onclick="window.scrollToContact('${catalogoTipo}')" 
                            style="background: #FF6B8B; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fas fa-quote-right" aria-hidden="true"></i> Solicitar cotización
                    </button>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(78, 205, 196, 0.1); border-radius: 8px; border: 1px solid rgba(78, 205, 196, 0.2);">
                    <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.9rem;">
                        <i class="fas fa-info-circle" aria-hidden="true"></i> 
                        <strong>Nota:</strong> Los precios pueden variar según personalización y cantidad. Para una cotización exacta, contáctanos directamente.
                    </p>
                </div>
            </div>
        `;
    } else {
        content = `
            <div style="text-align: center; padding: 40px 0;">
                <h4 style="color: #5E56E7; margin-bottom: 20px;">${catalogo.title}</h4>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">${catalogo.description}</p>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 30px;">Este catálogo no está disponible temporalmente en línea.</p>
                <button onclick="window.scrollToContact('${catalogoTipo}')" 
                        style="background: linear-gradient(135deg, #5E56E7, #4a43d4); color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-envelope" aria-hidden="true"></i> Solicitar catálogo por correo
                </button>
            </div>
        `;
    }
    
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closePdfViewer = function() {
    const modal = document.getElementById('pdfModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
};

window.openPortfolioModal = function(index) {
    const modal = document.getElementById('portfolioModal');
    const modalTitle = document.getElementById('portfolioModalTitle');
    const modalContent = document.getElementById('portfolioModalContent');
    
    const portfolioDetails = [
        {
            title: "Tarjetas Personales Corporativas",
            description: "En IMPRESIONES GRAFIC diseñamos tarjetas de presentación que no solo transmiten información, sino que cuentan la historia de tu marca. Utilizamos materiales premium como cartulina couché de 300g, acabados en relieve, troquelados especiales y barniz UV selectivo para crear piezas que dejan una impresión duradera.",
            features: ["Diseño personalizado con 3 revisiones", "Materiales premium (cartulina 300g)", "Acabados especiales (relieve, troquelado)", "Impresión full color de alta resolución", "Entrega en 48 horas hábiles", "Mínimo 100 unidades"],
            price: "Desde Bs. 150",
            delivery: "48 horas",
            image: "images/cascading-waterfall.jpg"
        },
        {
            title: "Reconocimientos Personalizados",
            description: "Nuestros reconocimientos y diplomas son diseñados para premiar la excelencia. Trabajamos con papeles especiales como pergamino, texturizados y con marcas de agua, incorporando elementos gráficos que reflejan la importancia del logro. Cada pieza es única y diseñada según la institución o evento.",
            features: ["Diseño elegante y formal", "Papeles especiales (pergamino, texturizados)", "Marcos de madera o acrílico opcional", "Personalización completa de textos", "Numeración y validación oficial", "Embalaje protector premium"],
            price: "Desde Bs. 80",
            delivery: "72 horas",
            image: "images/forest-path.jpg"
        },
        {
            title: "Trofeos Exclusivos",
            description: "Creamos trofeos que se convierten en símbolos de logro y reconocimiento. Combinamos diferentes materiales como cristal tallado, acrílico láser, metal cromado y bases de mármol sintético para piezas realmente memorables. Cada trofeo cuenta una historia de triunfo.",
            features: ["Combinación de materiales premium", "Grabado láser personalizado", "Bases estables y elegantes", "Diseño exclusivo para cada evento", "Embalaje de lujo con espuma", "Instalación en evento (opcional)"],
            price: "Desde Bs. 200",
            delivery: "5-7 días",
            image: "images/snowy-mountain-peaks.jpg"
        },
        {
            title: "Invitaciones Elegantes",
            description: "Transformamos tus momentos especiales en recuerdos tangibles. Diseñamos invitaciones que anticipan la magia de tu evento, utilizando técnicas como letterpress, foil stamping, cortes láser y papeles especiales importados. Cada detalle es cuidadosamente considerado.",
            features: ["Diseño único para cada evento", "Papeles importados de alta calidad", "Técnicas especiales (foil, relieve)", "Sobres personalizados y lacrados", "Coordinación completa del diseño", "Muestras físicas antes de producción"],
            price: "Desde Bs. 3 por unidad",
            delivery: "5 días",
            image: "images/mountain-landscape.jpg"
        },
        {
            title: "Afiches Publicitarios",
            description: "Diseñamos afiches que no solo informan, sino que impactan y persuaden. Trabajamos con impresión de gran formato hasta 150x100cm, materiales resistentes a la intemperie y técnicas de visualización estratégica para maximizar el alcance de tu mensaje.",
            features: ["Gran formato hasta 150x100cm", "Materiales resistentes a la intemperie", "Impresión en alta resolución", "Diseño optimizado para visualización", "Instalación profesional incluida", "Resistencia UV para exteriores"],
            price: "Desde Bs. 50",
            delivery: "24-48 horas",
            image: "images/ocean-sunset-golden-hour.jpg"
        },
        {
            title: "Certificados Institucionales",
            description: "Documentos oficiales que otorgan validez y prestigio. Diseñamos certificados con elementos de seguridad, numeración serial, marcas de agua y firmas digitales, garantizando autenticidad y profesionalismo para instituciones educativas, empresas y organizaciones.",
            features: ["Elementos de seguridad integrados", "Numeración serial consecutiva", "Marcas de agua y fondos seguridad", "Papeles de calidad archivística", "Validación oficial y firmas", "Diseño acorde a normativa institucional"],
            price: "Desde Bs. 25 por unidad",
            delivery: "3 días",
            image: "images/rolling-sand-dunes.jpg"
        }
    ];

    const detail = portfolioDetails[index] || portfolioDetails[0];
    
    modalTitle.textContent = detail.title;
    
    let content = `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div style="text-align: center;">
                    <img src="${detail.image}" alt="${detail.title}" style="width: 100%; max-width: 400px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #5E56E7; margin-bottom: 15px;">${detail.title}</h3>
                </div>
                
                <div>
                    <h4 style="color: white; margin-bottom: 10px; border-bottom: 2px solid #5E56E7; padding-bottom: 5px;">Descripción del Proyecto</h4>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6;">${detail.description}</p>
                </div>
                
                <div>
                    <h4 style="color: white; margin-bottom: 10px; border-bottom: 2px solid #5E56E7; padding-bottom: 5px;">Características Principales</h4>
                    <ul style="color: rgba(255,255,255,0.8); line-height: 1.6; padding-left: 20px;">
                        ${detail.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: rgba(94, 86, 231, 0.1); padding: 20px; border-radius: 8px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 5px;">PRECIO</div>
                        <div style="font-size: 1.5rem; color: #5E56E7; font-weight: bold;">${detail.price}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 5px;">TIEMPO DE ENTREGA</div>
                        <div style="font-size: 1.5rem; color: #4ECDC4; font-weight: bold;">${detail.delivery}</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.scrollToContact('${detail.title.toLowerCase().split(' ')[0]}')" style="background: linear-gradient(135deg, #5E56E7, #4a43d4); color: white; border: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.3s ease;">
                        Solicitar Presupuesto para este Proyecto
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closePortfolioModal = function() {
    const modal = document.getElementById('portfolioModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
};

window.handleSubmit = function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span>Enviando...</span><i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('✅ Solicitud enviada correctamente. Te contactaremos en menos de 2 horas.');
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        form.reset();
        
        const urgencyBtns = form.querySelectorAll('.urgency-btn');
        urgencyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'normal') {
                btn.classList.add('active');
            }
        });
        
    }, 1500);
    
    return false;
};

window.scrollToContact = function(service = '') {
    const contactSection = document.getElementById('contact');
    const header = document.getElementById('header');
    
    if (contactSection) {
        if (window.innerWidth <= 768) {
            const menuToggle = document.getElementById('menuToggle');
            const mainMenu = document.getElementById('mainMenu');
            if (menuToggle && mainMenu) {
                menuToggle.classList.remove('active');
                mainMenu.classList.remove('active');
            }
        }
        
        const headerHeight = header ? header.offsetHeight : 90;
        const targetPosition = contactSection.offsetTop - headerHeight + 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        if (service && service !== '') {
            setTimeout(() => {
                const serviceSelect = document.getElementById('service');
                if (serviceSelect) {
                    const serviceKey = service.toLowerCase();
                    const options = Array.from(serviceSelect.options);
                    const matchingOption = options.find(option => 
                        option.value.toLowerCase() === serviceKey
                    );
                    
                    if (matchingOption) {
                        serviceSelect.value = matchingOption.value;
                        
                        const event = new Event('change', { bubbles: true });
                        serviceSelect.dispatchEvent(event);
                    }
                }
            }, 500);
        }
    }
};
