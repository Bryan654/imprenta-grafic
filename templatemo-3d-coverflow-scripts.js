/*

TemplateMo 595 3d coverflow

https://templatemo.com/tm-595-3d-coverflow

*/

// JavaScript Document

// ===== VARIABLES GLOBALES =====
const items = document.querySelectorAll('.coverflow-item');
const dotsContainer = document.getElementById('dots');
const container = document.querySelector('.coverflow-container');
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
let currentIndex = 3;
let isAnimating = false;

// ===== COVERFLOW FUNCTIONS =====

// Mobile menu toggle - MEJORADO
menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menuToggle.classList.toggle('active');
    mainMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
});

// Close mobile menu when clicking on menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }
});

// Close mobile menu on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.innerWidth <= 768) {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// Create dots
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

const dots = document.querySelectorAll('.dot');
let autoplayInterval = null;
let isPlaying = true;
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

function updateCoverflow() {
    if (isAnimating) return;
    isAnimating = true;

    items.forEach((item, index) => {
        let offset = index - currentIndex;
        
        if (offset > items.length / 2) {
            offset = offset - items.length;
        }
        else if (offset < -items.length / 2) {
            offset = offset + items.length;
        }
        
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);
        
        let translateX = offset * 200;
        let translateZ = -absOffset * 180;
        let rotateY = -sign * Math.min(absOffset * 60, 60);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.08);

        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 700;
        }

        item.style.transform = `
            translateX(${translateX}px) 
            translateZ(${translateZ}px) 
            rotateY(${rotateY}deg)
            scale(${scale})
        `;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;

        item.classList.toggle('active', index === currentIndex);
        item.setAttribute('aria-hidden', index !== currentIndex);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
        dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
    });

    setTimeout(() => {
        isAnimating = false;
    }, 600);
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

// Keyboard navigation
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

// Click on items to select
items.forEach((item, index) => {
    item.addEventListener('click', () => goToIndex(index));
});

// Touch/swipe support - MEJORADO
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;

container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    isSwiping = true;
}, { passive: true });

container.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    e.preventDefault();
}, { passive: false });

container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    handleSwipe();
    isSwiping = false;
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        handleUserInteraction();
        
        if (diffX > 0) {
            navigate(1);
        } else {
            navigate(-1);
        }
    }
}

// Initialize images and reflections
items.forEach((item, index) => {
    const img = item.querySelector('img');
    const reflection = item.querySelector('.reflection');
    
    if (img.complete) {
        img.parentElement.classList.remove('image-loading');
        if (reflection) {
            reflection.style.backgroundImage = `url(${img.src})`;
            reflection.style.backgroundSize = 'cover';
            reflection.style.backgroundPosition = 'center';
        }
    } else {
        img.onload = function() {
            this.parentElement.classList.remove('image-loading');
            if (reflection) {
                reflection.style.backgroundImage = `url(${this.src})`;
                reflection.style.backgroundSize = 'cover';
                reflection.style.backgroundPosition = 'center';
            }
        };
        
        img.onerror = function() {
            this.parentElement.classList.add('image-loading');
        };
    }
});

// Autoplay functionality
function startAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
    }
    
    autoplayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCoverflow();
    }, 4000);
    
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

// Add event listeners to stop autoplay on manual navigation
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

// ===== NUEVAS FUNCIONALIDADES =====

// 1. FILTRO DE PORTAFOLIO
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            // Add active class to clicked button
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    if (item.getAttribute('data-category') === filterValue) {
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
                }
            });
        });
        
        // Keyboard support for filter buttons
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// 2. SCROLL TO CONTACT
function scrollToContact(service = '') {
    const contactSection = document.getElementById('contact');
    
    // Scroll a la sección de contacto
    contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Si se especificó un servicio, llenar el campo correspondiente
    if (service && service !== '') {
        setTimeout(() => {
            const serviceSelect = document.getElementById('service');
            if (serviceSelect) {
                // Buscar opción que coincida con el servicio
                const options = Array.from(serviceSelect.options);
                const matchingOption = options.find(option => 
                    option.text.toLowerCase().includes(service.toLowerCase())
                );
                
                if (matchingOption) {
                    serviceSelect.value = matchingOption.value;
                }
                
                // Enfocar el formulario
                serviceSelect.focus();
            }
        }, 500);
    }
    
    // Mostrar notificación
    showNotification(`Perfecto! Te llevamos al formulario de contacto para ${service || 'tu consulta'}`, 'info');
}

// 3. FORM SUBMISSION HANDLER
function handleSubmit(event, formType = 'consulta') {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    const formData = new FormData(form);
    
    // Validar formulario antes de enviar
    if (!validateForm(form)) {
        showNotification('Por favor, completa todos los campos requeridos correctamente.', 'error');
        return;
    }
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simular envío (en producción aquí iría fetch a backend)
    setTimeout(() => {
        // Mostrar mensaje de éxito
        showNotification('✅ Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
        
        // Reset form
        form.reset();
        
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Enviar evento a Google Analytics (si está configurado)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'contact',
                'event_label': formType
            });
        }
    }, 1500);
}

// 4. NOTIFICATION SYSTEM - MEJORADO
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon" aria-hidden="true">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
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
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
    `;
    
    // Add CSS for animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
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
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Close on ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeNotification(notification);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Auto-remove after 5 seconds
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification);
        }
    }, 5000);
    
    // Pause auto-remove on hover
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
}

function closeNotification(notification) {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Obtener color de notificación por tipo
function getNotificationColor(type) {
    const colors = {
        'success': 'rgba(81, 207, 102, 0.95)',
        'error': 'rgba(255, 107, 107, 0.95)',
        'warning': 'rgba(255, 193, 7, 0.95)',
        'info': 'rgba(78, 205, 196, 0.95)'
    };
    
    return colors[type] || colors.info;
}

// 5. VIEW DETAILS MODAL FOR PORTFOLIO CON DESCRIPCIONES DETALLADAS
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
            
            // DESCRIPCIONES DETALLADAS PARA CADA PROYECTO
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
            
            // Obtener la descripción detallada según el índice
            const detailedInfo = detailedDescriptions[index] || {
                title: title,
                description: shortDescription,
                features: ["Calidad garantizada", "Diseño personalizado", "Entrega puntual", "Atención personalizada"],
                price: "Consultar",
                delivery: "Variable"
            };
            
            // Create modal
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
            
            // Add styles for the enhanced modal
            if (!document.querySelector('#modal-styles')) {
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
            
            // Add to DOM
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Focus trap for modal
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            if (firstFocusableElement) {
                setTimeout(() => firstFocusableElement.focus(), 100);
            }
            
            // Close modal functionality
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
        });
        
        // Keyboard support for view details buttons
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// 6. FORM VALIDATION FUNCTIONS - MEJORADO
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        setupFormValidation(form);
    });
}

// Configurar validación de formulario
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
        
        // Submit on Enter for textareas (but allow Shift+Enter for new lines)
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Find the submit button and click it
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.click();
                    }
                }
            });
        }
    });
}

// Validar formulario completo
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

// Validar input individual
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
    
    if (input.id === 'quantity' && value) {
        const quantityRegex = /^\d+\s*[a-zA-Z]*$/;
        if (!quantityRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ej: 1000 tarjetas, 200 invitaciones';
        }
    }
    
    if (!isValid) {
        showInputError(input, errorMessage);
    } else {
        clearError(input);
    }
    
    return isValid;
}

// Mostrar error en input
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
    
    // Focus the input if it's the first error
    if (!document.querySelector('.input-error:first-of-type')) {
        input.focus();
    }
}

// Limpiar error de input
function clearError(input) {
    const error = input.parentNode.querySelector('.input-error');
    if (error) {
        error.remove();
    }
    input.style.borderColor = '';
    input.style.boxShadow = '';
}

// 7. SMOOTH SCROLLING AND ACTIVE MENU ITEM - MEJORADO
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

// Throttle scroll event for performance
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
        
        // Check if it's an internal link (starts with #)
        if (targetId && targetId.startsWith('#') && targetId !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    menuToggle.classList.remove('active');
                    mainMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
                
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without page reload
                history.pushState(null, null, targetId);
            }
        }
        // External links will open normally in new tab
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

// ===== VISOR DE PDF MEJORADO =====
function openPdfViewer(pdfUrl, title = 'Catálogo') {
    // Crear el modal del visor PDF
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
    
    // Agregar al DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Bloquear scroll
    
    // Funcionalidades
    const closeBtn = modal.querySelector('.btn-close-pdf');
    const fullscreenBtn = modal.querySelector('.btn-fullscreen');
    const overlay = modal.querySelector('.pdf-modal-overlay');
    const iframe = modal.querySelector('iframe');
    
    // Focus trap for modal
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element
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
    
    // Focus trap
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
    
    // Enfocar el iframe para permitir navegación con teclado
    setTimeout(() => iframe.focus(), 300);
}

// 8. INITIALIZE EVERYTHING - MEJORADO
function initAll() {
    // Initialize coverflow
    updateCoverflow();
    container.setAttribute('tabindex', '0');
    container.focus();
    startAutoplay();
    
    // Initialize new features
    initPortfolioFilter();
    initPortfolioModals();
    initFormValidation();
    
    // Initial active menu item update
    updateActiveMenuItem();
    
    // Add loading class to body and remove when everything is loaded
    document.body.classList.add('loaded');
    
    // Initialize touch event improvements
    initTouchEvents();
    
    // Set ARIA attributes for interactive elements
    setAriaAttributes();
}

// Initialize touch events improvements
function initTouchEvents() {
    // Prevent double tap zoom on buttons
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            // Add active state for touch feedback
            button.classList.add('touch-active');
            setTimeout(() => {
                button.classList.remove('touch-active');
            }, 300);
        }, { passive: true });
    });
    
    // Improve scroll performance on mobile
    let lastTouchY = 0;
    document.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const currentTouchY = e.touches[0].clientY;
        const diff = currentTouchY - lastTouchY;
        
        // If user is scrolling up/down significantly, stop coverflow autoplay
        if (Math.abs(diff) > 10) {
            handleUserInteraction();
        }
        
        lastTouchY = currentTouchY;
    }, { passive: true });
}

// Set ARIA attributes for better accessibility
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
        card.setAttribute('aria-label', `Servicio ${index + 1}`);
    });
    
    // Portfolio items
    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.setAttribute('role', 'article');
        item.setAttribute('aria-label', `Proyecto ${index + 1}`);
    });
    
    // Catalog cards
    document.querySelectorAll('.catalogo-card').forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Abrir catálogo ${index + 1}`);
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

// 9. LOADING ANIMATION - MEJORADO
window.addEventListener('load', function() {
    // Remove loading state if any
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            loadingElement.remove();
        }, 300);
    }
    
    // Initialize everything
    initAll();
    
    // Show welcome notification after a delay
    setTimeout(() => {
        showNotification('👋 ¡Bienvenido a IMPRESIONES GRAFIC! Explora nuestros servicios de diseño e impresión.', 'info');
    }, 1500);
    
    // Add loaded class to body for any post-load animations
    document.body.classList.add('fully-loaded');
});

// 10. RESPONSIVE ADJUSTMENTS - MEJORADO
function adjustCoverflowForScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    
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
    
    // Adjust container height for mobile landscape
    if (isLandscape && width < 1024) {
        container.style.height = '250px';
    } else {
        container.style.height = '350px';
    }
    
    updateCoverflow();
}

// Throttle resize event
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        adjustCoverflowForScreen();
        
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }, 250);
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// Adjust coverflow on initial load
setTimeout(adjustCoverflowForScreen, 100);

// ===== EXPORT FUNCIONES GLOBALES =====
// Estas funciones deben estar disponibles globalmente para los onclick en HTML
window.scrollToContact = scrollToContact;
window.handleSubmit = handleSubmit;
window.navigate = navigate;
window.goToIndex = goToIndex;
window.toggleAutoplay = toggleAutoplay;
window.openPdfViewer = openPdfViewer;

// Error handling
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});

// Performance monitoring (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Tiempo de carga:', {
                    'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
                    'Total Time': perfData.loadEventEnd - perfData.fetchStart
                });
            }
        }
    });
}

// Service Worker registration (opcional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

// Detect slow network
if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection) {
        if (connection.saveData === true || connection.effectiveType.includes('2g')) {
            // Reduce animations for slow connections
            document.documentElement.style.setProperty('--transition-normal', '0.2s ease');
            document.documentElement.style.setProperty('--transition-slow', '0.3s ease');
            stopAutoplay(); // Stop autoplay on slow connections
        }
    }
}

// Prevent pinch zoom on iOS (optional)
document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Add CSS for touch feedback
const touchStyles = document.createElement('style');
touchStyles.textContent = `
    .touch-active {
        opacity: 0.8 !important;
        transform: scale(0.98) !important;
    }
    
    @media (hover: none) and (pointer: coarse) {
        button, a, .menu-item, .filter-btn, .servicio-btn, .view-details, 
        .btn-ver-catalogo, .submit-btn, .whatsapp-btn, .social-btn, 
        .cta-button, .badge, .catalogo-card {
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
        }
    }
    
    /* Improve scrolling on iOS */
    .section, .coverflow-container, .portfolio-grid, .catalogos-grid {
        -webkit-overflow-scrolling: touch;
    }
    
    /* Prevent text size adjustment on orientation change */
    html {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
    }
`;
document.head.appendChild(touchStyles);
