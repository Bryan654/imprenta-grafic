/* IMPRESIONES GRAFIC - JavaScript Optimizado */
/* Versión 2.0 - Totalmente funcional sin backend */

// ===== VARIABLES GLOBALES =====
const config = {
    coverflow: {
        itemWidth: 300,
        itemHeight: 300,
        spacing: 220,
        maxRotation: 60,
        perspective: 1200,
        autoplayInterval: 4000
    },
    whatsapp: {
        phone: '+59164793488',
        defaultMessage: 'Hola IMPRESIONES GRAFIC, quiero consultar sobre sus servicios'
    },
    social: {
        facebook: 'https://www.facebook.com/share/1GbzLQbdWL/?mibextid=wwXIfr',
        instagram: 'https://www.instagram.com/impresiones_grafic?igsh=MWNlcDBpbWVobG4yZQ%3D%3D&utm_source=qr',
        tiktok: 'https://www.tiktok.com/@impresiones_grafic?_r=1&_t=ZS-93OXcbIn8Sr'
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initLoading();
    initCoverflow();
    initPortfolio();
    initNavigation();
    initContact();
    initModals();
    initResponsive();
    initAnimations();
    
    // Mostrar página cuando todo esté cargado
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        showNotification('👋 ¡Bienvenido a IMPRESIONES GRAFIC!', 'info');
    }, 1000);
});

// ===== LOADING =====
function initLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        // Ocultar loading después de 1 segundo mínimo
        setTimeout(() => {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 300);
        }, 1000);
    }
}

// ===== COVERFLOW =====
let coverflowItems = [];
let currentCoverflowIndex = 0;
let isCoverflowAnimating = false;
let coverflowAutoplayInterval = null;
let isCoverflowPlaying = true;

function initCoverflow() {
    const coverflowContainer = document.querySelector('.coverflow');
    const dotsContainer = document.getElementById('dots');
    
    if (!coverflowContainer) return;
    
    // Datos de las imágenes del coverflow
    const coverflowData = [
        {
            image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop',
            alt: 'Tarjetas de Presentación IMPRESIONES GRAFIC',
            title: 'Tarjetas Personales'
        },
        {
            image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=600&fit=crop',
            alt: 'Reconocimientos y Diplomas',
            title: 'Reconocimientos'
        },
        {
            image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=600&fit=crop',
            alt: 'Invitaciones Elegantes',
            title: 'Invitaciones'
        },
        {
            image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=600&fit=crop',
            alt: 'Afiches Publicitarios',
            title: 'Afiches'
        },
        {
            image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=600&fit=crop',
            alt: 'Calendarios Personalizados',
            title: 'Calendarios'
        },
        {
            image: 'https://images.unsplash.com/photo-1558522195-e1201b090344?w=600&h=600&fit=crop',
            alt: 'Trofeos Exclusivos',
            title: 'Trofeos'
        },
        {
            image: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=600&h=600&fit=crop',
            alt: 'Material Corporativo',
            title: 'Material Corporativo'
        }
    ];
    
    // Crear elementos del coverflow
    coverflowData.forEach((item, index) => {
        const coverflowItem = document.createElement('div');
        coverflowItem.className = 'coverflow-item';
        coverflowItem.setAttribute('data-index', index);
        coverflowItem.setAttribute('aria-label', item.title);
        
        coverflowItem.innerHTML = `
            <div class="cover">
                <img src="${item.image}" 
                     alt="${item.alt}"
                     loading="lazy"
                     width="300"
                     height="300">
            </div>
        `;
        
        coverflowContainer.appendChild(coverflowItem);
        coverflowItems.push(coverflowItem);
        
        // Crear dots
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.setAttribute('data-index', index);
        dot.setAttribute('aria-label', `Ir a ${item.title}`);
        dot.addEventListener('click', () => goToCoverflowIndex(index));
        dotsContainer.appendChild(dot);
        
        // Click en el item
        coverflowItem.addEventListener('click', () => {
            goToCoverflowIndex(index);
            showNotification(`Ver detalles de ${item.title}`, 'info');
        });
    });
    
    // Inicializar navegación
    updateCoverflow();
    startCoverflowAutoplay();
    
    // Event listeners para navegación
    document.querySelector('.nav-button.prev')?.addEventListener('click', () => navigateCoverflow(-1));
    document.querySelector('.nav-button.next')?.addEventListener('click', () => navigateCoverflow(1));
    
    // Touch events para móviles
    initCoverflowTouch();
}

function updateCoverflow() {
    if (isCoverflowAnimating) return;
    isCoverflowAnimating = true;
    
    const totalItems = coverflowItems.length;
    
    coverflowItems.forEach((item, index) => {
        let offset = index - currentCoverflowIndex;
        
        // Ajustar offset circular
        if (offset > totalItems / 2) offset = offset - totalItems;
        else if (offset < -totalItems / 2) offset = offset + totalItems;
        
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);
        
        // Calcular transformaciones
        let translateX = offset * config.coverflow.spacing;
        let translateZ = -absOffset * 200;
        let rotateY = -sign * Math.min(absOffset * config.coverflow.maxRotation, config.coverflow.maxRotation);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.1);
        
        // Ocultar items muy lejanos
        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 800;
        }
        
        // Aplicar transformaciones
        item.style.transform = `
            translateX(${translateX}px) 
            translateZ(${translateZ}px) 
            rotateY(${rotateY}deg)
            scale(${scale})
        `;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;
        
        // Marcar item activo
        item.classList.toggle('active', index === currentCoverflowIndex);
    });
    
    // Actualizar dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCoverflowIndex);
    });
    
    // Reset animation flag
    setTimeout(() => {
        isCoverflowAnimating = false;
    }, 600);
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
    pauseCoverflowAutoplay();
    setTimeout(() => resumeCoverflowAutoplay(), 3000);
}

function goToCoverflowIndex(index) {
    if (isCoverflowAnimating || index === currentCoverflowIndex) return;
    currentCoverflowIndex = index;
    updateCoverflow();
    pauseCoverflowAutoplay();
    setTimeout(() => resumeCoverflowAutoplay(), 3000);
}

// Touch support para coverflow
function initCoverflowTouch() {
    const container = document.querySelector('.coverflow-container');
    if (!container) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                navigateCoverflow(1); // Swipe izquierda
            } else {
                navigateCoverflow(-1); // Swipe derecha
            }
        }
    }, { passive: true });
}

// Autoplay del coverflow
function startCoverflowAutoplay() {
    if (coverflowAutoplayInterval) clearInterval(coverflowAutoplayInterval);
    
    coverflowAutoplayInterval = setInterval(() => {
        currentCoverflowIndex = (currentCoverflowIndex + 1) % coverflowItems.length;
        updateCoverflow();
    }, config.coverflow.autoplayInterval);
    
    isCoverflowPlaying = true;
    updatePlayPauseButton();
}

function pauseCoverflowAutoplay() {
    if (coverflowAutoplayInterval) {
        clearInterval(coverflowAutoplayInterval);
        coverflowAutoplayInterval = null;
    }
    isCoverflowPlaying = false;
    updatePlayPauseButton();
}

function resumeCoverflowAutoplay() {
    if (!isCoverflowPlaying) {
        startCoverflowAutoplay();
    }
}

function toggleCoverflowAutoplay() {
    if (isCoverflowPlaying) {
        pauseCoverflowAutoplay();
    } else {
        startCoverflowAutoplay();
    }
}

function updatePlayPauseButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
        if (isCoverflowPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
}

// ===== PORTAFOLIO =====
function initPortfolio() {
    initPortfolioFilter();
    initPortfolioGrid();
    initViewExamples();
}

function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    if (!filterButtons.length || !portfolioGrid) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar active al botón clickeado
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            filterPortfolioItems(filterValue);
        });
    });
}

function initPortfolioGrid() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;
    
    const portfolioData = [
        {
            image: 'https://i.ibb.co/m5hNpSyn/Tarjetas-Personales-Corporativas.png',
            category: 'tarjetas',
            title: 'Tarjetas Personales',
            description: 'Diseño corporativo premium'
        },
        {
            image: 'https://i.ibb.co/F40gmXP5/Reconocimientos-Personalizados.png',
            category: 'reconocimientos',
            title: 'Reconocimientos',
            description: 'Diplomas y certificados'
        },
        {
            image: 'https://i.ibb.co/cS2cFRZV/Trofeos-Exclusivos.jpg',
            category: 'trofeos',
            title: 'Trofeos Exclusivos',
            description: 'Diseños únicos para eventos'
        },
        {
            image: 'https://i.ibb.co/67pqHvw7/Invitaciones-Elegantes.jpg',
            category: 'invitaciones',
            title: 'Invitaciones',
            description: 'Bodas y eventos especiales'
        },
        {
            image: 'https://i.ibb.co/1YX1QJpH/Afiches-Publicitarios.jpg',
            category: 'afiches',
            title: 'Afiches Publicitarios',
            description: 'Gran formato impactante'
        },
        {
            image: 'https://i.ibb.co/Y7KJ5BBz/Certificados-Institucionales-D.jpg',
            category: 'reconocimientos',
            title: 'Certificados',
            description: 'Documentos institucionales'
        }
    ];
    
    portfolioData.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.setAttribute('data-category', item.category);
        
        portfolioItem.innerHTML = `
            <img src="${item.image}" 
                 alt="${item.title} - IMPRESIONES GRAFIC"
                 loading="lazy"
                 width="400"
                 height="300">
            <div class="portfolio-overlay">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <button class="btn btn-outline view-portfolio-detail" 
                        data-title="${item.title}"
                        data-image="${item.image}">
                    <i class="fas fa-eye"></i> Ver detalles
                </button>
            </div>
        `;
        
        portfolioGrid.appendChild(portfolioItem);
    });
    
    // Event listeners para ver detalles
    document.querySelectorAll('.view-portfolio-detail').forEach(button => {
        button.addEventListener('click', function() {
            const title = this.getAttribute('data-title');
            const image = this.getAttribute('data-image');
            showPortfolioDetail(title, image);
        });
    });
}

function filterPortfolioItems(category) {
    const items = document.querySelectorAll('.portfolio-item');
    
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

function initViewExamples() {
    document.querySelectorAll('.view-examples').forEach(button => {
        button.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            showServiceExamples(service);
        });
    });
}

function showServiceExamples(service) {
    const examples = {
        tarjetas: [
            'https://i.ibb.co/m5hNpSyn/Tarjetas-Personales-Corporativas.png',
            'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=400&fit=crop'
        ],
        reconocimientos: [
            'https://i.ibb.co/F40gmXP5/Reconocimientos-Personalizados.png',
            'https://i.ibb.co/Y7KJ5BBz/Certificados-Institucionales-D.jpg'
        ],
        invitaciones: [
            'https://i.ibb.co/67pqHvw7/Invitaciones-Elegantes.jpg',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop'
        ],
        afiches: [
            'https://i.ibb.co/1YX1QJpH/Afiches-Publicitarios.jpg',
            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop'
        ]
    };
    
    const serviceNames = {
        tarjetas: 'Tarjetas Personales',
        reconocimientos: 'Reconocimientos',
        invitaciones: 'Invitaciones',
        afiches: 'Afiches Publicitarios'
    };
    
    const serviceData = examples[service] || [];
    if (serviceData.length === 0) return;
    
    // Crear modal de ejemplos
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'examplesModal';
    
    let imagesHTML = '';
    serviceData.forEach((img, index) => {
        imagesHTML += `
            <div class="example-image">
                <img src="${img}" 
                     alt="Ejemplo ${index + 1} de ${serviceNames[service]}"
                     loading="lazy">
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <h3>Ejemplos de ${serviceNames[service]}</h3>
            <div class="examples-grid">
                ${imagesHTML}
            </div>
            <p>¿Te gustaría personalizar tu diseño?</p>
            <a href="https://wa.me/${config.whatsapp.phone}?text=Hola,%20quiero%20un%20diseño%20personalizado%20para%20${encodeURIComponent(serviceNames[service])}" 
               class="btn btn-whatsapp" target="_blank">
                <i class="fab fa-whatsapp"></i> COTIZAR DISEÑO PERSONALIZADO
            </a>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Estilos para el modal de ejemplos
    const style = document.createElement('style');
    style.textContent = `
        .examples-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .example-image {
            border-radius: 12px;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.1);
        }
        
        .example-image img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .example-image:hover img {
            transform: scale(1.05);
        }
    `;
    
    document.head.appendChild(style);
}

function showPortfolioDetail(title, image) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'portfolioDetailModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <img src="${image}" 
                 alt="${title} - IMPRESIONES GRAFIC"
                 class="detail-image">
            <h3>${title}</h3>
            <p>Este es un ejemplo de nuestro trabajo en ${title}. Podemos personalizar completamente el diseño según tus necesidades.</p>
            
            <div class="detail-features">
                <div class="feature">
                    <i class="fas fa-palette"></i>
                    <span>Diseño personalizado</span>
                </div>
                <div class="feature">
                    <i class="fas fa-star"></i>
                    <span>Calidad garantizada</span>
                </div>
                <div class="feature">
                    <i class="fas fa-shipping-fast"></i>
                    <span>Entrega rápida</span>
                </div>
            </div>
            
            <div class="detail-actions">
                <a href="https://wa.me/${config.whatsapp.phone}?text=Hola,%20me%20interesa%20el%20servicio%20de%20${encodeURIComponent(title)}" 
                   class="btn btn-whatsapp" target="_blank">
                    <i class="fab fa-whatsapp"></i> COTIZAR ESTE PROYECTO
                </a>
                <button class="btn btn-outline" onclick="closeModal()">
                    VER MÁS EJEMPLOS
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Estilos para el detalle
    const style = document.createElement('style');
    style.textContent = `
        .detail-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .detail-features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .feature {
            text-align: center;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
        }
        
        .feature i {
            font-size: 24px;
            color: var(--secondary);
            margin-bottom: 8px;
        }
        
        .feature span {
            display: block;
            font-size: 0.9rem;
        }
        
        .detail-actions {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        
        @media (max-width: 768px) {
            .detail-features {
                grid-template-columns: 1fr;
            }
            
            .detail-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ===== NAVEGACIÓN =====
function initNavigation() {
    initMenuToggle();
    initSmoothScroll();
    initActiveMenu();
    initScrollToTop();
}

function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const mainMenu = document.getElementById('mainMenu');
    
    if (!menuToggle || !mainMenu) return;
    
    menuToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        this.classList.toggle('active');
        mainMenu.classList.toggle('active');
        
        // Prevenir scroll cuando el menú está abierto
        document.body.style.overflow = mainMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

function initSmoothScroll() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Logo click para ir al inicio
    document.querySelector('.logo-container')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initActiveMenu() {
    const sections = document.querySelectorAll('.section');
    const menuItems = document.querySelectorAll('.menu-item');
    const header = document.getElementById('header');
    
    function updateActiveSection() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Actualizar item activo del menú
                menuItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
        
        // Header con scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Scroll to top button
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
    }
    
    window.addEventListener('scroll', updateActiveSection);
    updateActiveSection(); // Ejecutar inicialmente
}

function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ===== CONTACTO =====
function initContact() {
    initQuickRequest();
    initSocialLinks();
    initContactCards();
}

function initQuickRequest() {
    const quickRequestBtn = document.querySelector('.contact-request .btn-primary');
    
    if (quickRequestBtn) {
        quickRequestBtn.addEventListener('click', sendQuickRequest);
    }
}

function sendQuickRequest() {
    const name = document.getElementById('quickName').value.trim();
    const phone = document.getElementById('quickPhone').value.trim();
    const message = document.getElementById('quickMessage').value.trim();
    const service = document.getElementById('quickService').value;
    
    // Validación básica
    if (!name || !phone) {
        showNotification('Por favor completa tu nombre y teléfono', 'warning');
        return;
    }
    
    // Construir mensaje para WhatsApp
    let whatsappMessage = `*Nueva solicitud de contacto:*%0A%0A`;
    whatsappMessage += `*Nombre:* ${name}%0A`;
    whatsappMessage += `*Teléfono:* ${phone}%0A`;
    
    if (service) {
        const serviceText = {
            tarjetas: 'Tarjetas personales',
            reconocimientos: 'Reconocimientos',
            invitaciones: 'Invitaciones',
            afiches: 'Afiches',
            otros: 'Otros servicios'
        }[service] || 'Servicio no especificado';
        whatsappMessage += `*Servicio:* ${serviceText}%0A`;
    }
    
    if (message) {
        whatsappMessage += `*Mensaje:* ${message}%0A`;
    }
    
    whatsappMessage += `%0A_Enviado desde el sitio web_`;
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${config.whatsapp.phone}?text=${whatsappMessage}`, '_blank');
    
    // Mostrar modal de confirmación
    showRequestConfirmation(name);
    
    // Limpiar formulario
    document.getElementById('quickName').value = '';
    document.getElementById('quickPhone').value = '';
    document.getElementById('quickMessage').value = '';
    document.getElementById('quickService').value = '';
}

function showRequestConfirmation(name) {
    const modal = document.getElementById('quickContactModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function initSocialLinks() {
    // Asegurar que todos los enlaces sociales se abran en nueva pestaña
    document.querySelectorAll('a[href*="facebook"], a[href*="instagram"], a[href*="tiktok"]').forEach(link => {
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function initContactCards() {
    // Añadir funcionalidad a las tarjetas de contacto
    document.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Si el click fue en un botón o enlace, no hacer nada
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || 
                e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            
            // Enfocar el elemento principal de la tarjeta
            const mainAction = this.querySelector('a, button');
            if (mainAction) {
                mainAction.click();
            }
        });
    });
}

// ===== MODALES =====
function initModals() {
    initPdfViewer();
}

function initPdfViewer() {
    // Esta función se ejecutará cuando se haga clic en los botones de catálogo
    // Los catálogos reales deberían estar en /catalogos/
}

function openPdfViewer(pdfType) {
    const pdfTitles = {
        invitaciones: 'Catálogo de Invitaciones',
        reconocimientos: 'Catálogo de Reconocimientos',
        medallas: 'Catálogo de Medallas y Accesorios',
        indumentaria: 'Catálogo de Indumentaria'
    };
    
    const title = pdfTitles[pdfType] || 'Catálogo';
    
    // Crear modal de PDF (simulado)
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'pdfModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="pdf-viewer-placeholder">
                <i class="fas fa-file-pdf"></i>
                <h3>${title}</h3>
                <p>Para ver nuestros catálogos completos, contáctanos directamente por WhatsApp.</p>
                <p>Te enviaremos los catálogos actualizados con todos nuestros diseños.</p>
                <a href="https://wa.me/${config.whatsapp.phone}?text=Hola,%20quiero%20ver%20el%20catálogo%20completo%20de%20${encodeURIComponent(title)}" 
                   class="btn btn-whatsapp" target="_blank">
                    <i class="fab fa-whatsapp"></i> SOLICITAR CATÁLOGO COMPLETO
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Estilos para el placeholder del PDF
    const style = document.createElement('style');
    style.textContent = `
        .pdf-viewer-placeholder {
            text-align: center;
            padding: 40px 20px;
        }
        
        .pdf-viewer-placeholder i {
            font-size: 80px;
            color: var(--accent);
            margin-bottom: 20px;
        }
        
        .pdf-viewer-placeholder h3 {
            margin-bottom: 15px;
        }
        
        .pdf-viewer-placeholder p {
            margin-bottom: 10px;
        }
    `;
    
    document.head.appendChild(style);
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    document.body.style.overflow = '';
}

// ===== RESPONSIVE =====
function initResponsive() {
    initResponsiveCoverflow();
    initTouchOptimizations();
    initOrientationChange();
}

function initResponsiveCoverflow() {
    function adjustCoverflowSize() {
        const width = window.innerWidth;
        let itemSize = 300;
        
        if (width < 768) {
            itemSize = 200;
            config.coverflow.spacing = 180;
        } else if (width < 1024) {
            itemSize = 250;
            config.coverflow.spacing = 200;
        } else {
            itemSize = 300;
            config.coverflow.spacing = 220;
        }
        
        config.coverflow.itemWidth = itemSize;
        config.coverflow.itemHeight = itemSize;
        
        // Actualizar tamaño de los items
        document.querySelectorAll('.coverflow-item').forEach(item => {
            item.style.width = `${itemSize}px`;
            item.style.height = `${itemSize}px`;
        });
        
        if (coverflowItems.length > 0) {
            updateCoverflow();
        }
    }
    
    window.addEventListener('resize', adjustCoverflowSize);
    adjustCoverflowSize(); // Ejecutar inicialmente
}

function initTouchOptimizations() {
    // Mejorar experiencia táctil
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
        
        // Aumentar área de toque para botones importantes
        const importantButtons = document.querySelectorAll('.btn-primary, .btn-whatsapp, .nav-button');
        importantButtons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
    }
}

function initOrientationChange() {
    let previousOrientation = window.orientation;
    
    window.addEventListener('orientationchange', function() {
        // Pequeño delay para que se complete el cambio de orientación
        setTimeout(() => {
            if (window.orientation !== previousOrientation) {
                previousOrientation = window.orientation;
                
                // Forzar reflow en elementos críticos
                if (coverflowItems.length > 0) {
                    setTimeout(() => updateCoverflow(), 100);
                }
                
                // Scroll suave al cambio de orientación
                setTimeout(() => {
                    window.scrollTo({ top: window.scrollY, behavior: 'smooth' });
                }, 200);
            }
        }, 100);
    });
}

// ===== ANIMACIONES Y EFECTOS =====
function initAnimations() {
    initIntersectionObserver();
    initParallaxEffect();
    initHoverEffects();
}

function initIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animar
    document.querySelectorAll('.servicio-card, .portfolio-item, .catalogo-card, .value, .benefit').forEach(el => {
        observer.observe(el);
    });
}

function initParallaxEffect() {
    const heroBackground = document.querySelector('.hero-background');
    
    if (!heroBackground) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroBackground) {
            heroBackground.style.transform = `translate3d(0, ${rate}px, 0)`;
        }
    });
}

function initHoverEffects() {
    // Efectos de hover mejorados para dispositivos con mouse
    if (window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.servicio-card, .catalogo-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    // Eliminar notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Estilos para la notificación
    const style = document.createElement('style');
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--bg-card);
                border-left: 4px solid;
                border-radius: var(--border-radius-md);
                padding: 15px 20px;
                color: var(--text-primary);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: var(--z-toast);
                box-shadow: var(--shadow-lg);
                animation: slideIn 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .notification-success { border-color: var(--success); }
            .notification-error { border-color: var(--danger); }
            .notification-warning { border-color: var(--warning); }
            .notification-info { border-color: var(--secondary); }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
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
                color: var(--text-muted);
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin-left: 15px;
                line-height: 1;
                transition: color 0.3s ease;
            }
            
            .notification-close:hover {
                color: var(--text-primary);
            }
            
            @media (max-width: 768px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Botón para cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Animación de salida
    if (!document.querySelector('#notification-slide-out')) {
        const slideOutStyle = document.createElement('style');
        slideOutStyle.id = 'notification-slide-out';
        slideOutStyle.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(slideOutStyle);
    }
}

// ===== FUNCIONES GLOBALES =====
// Exportar funciones que necesitan ser accesibles desde HTML
window.navigate = navigateCoverflow;
window.toggleAutoplay = toggleCoverflowAutoplay;
window.openPdfViewer = openPdfViewer;
window.closeModal = closeModal;
window.sendQuickRequest = sendQuickRequest;

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce para eventos de scroll y resize
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

// Aplicar debounce a eventos pesados
window.addEventListener('scroll', debounce(updateActiveSection, 10));
window.addEventListener('resize', debounce(adjustCoverflowSize, 100));

// ===== PWA READINESS (OPCIONAL) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// ===== ANALYTICS (OPCIONAL) =====
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Track interno
    console.log(`Track: ${category} - ${action} - ${label}`);
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Error capturado:', e.error);
    
    // Mostrar error amigable al usuario si es crítico
    if (e.error.message.includes('Critical')) {
        showNotification('Ha ocurrido un error. Por favor recarga la página.', 'error');
    }
});

// ===== OFFLINE DETECTION =====
window.addEventListener('online', () => {
    showNotification('¡Conexión restablecida!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Sin conexión a internet. Algunas funciones pueden no estar disponibles.', 'warning');
});

// ===== INITIAL CHECK =====
// Verificar estado inicial
if (!navigator.onLine) {
    showNotification('Estás navegando sin conexión. Algunas funciones pueden no estar disponibles.', 'warning');
}

// Verificar compatibilidad
if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver no soportado, algunas animaciones pueden no funcionar');
}

// ===== EXPORT CONFIGURATION =====
// Para uso en otras partes del código
window.IMPRESIONES_GRAFIC_CONFIG = config;
