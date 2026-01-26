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

// ===== COVERFLOW FUNCTIONS (EXISTENTE) =====

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mainMenu.classList.toggle('active');
});

// Close mobile menu when clicking on menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
        menuToggle.classList.remove('active');
        mainMenu.classList.remove('active');
    }
});

// Create dots
items.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.onclick = () => goToIndex(index);
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
        
        let translateX = offset * 220;
        let translateZ = -absOffset * 200;
        let rotateY = -sign * Math.min(absOffset * 60, 60);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.1);

        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 800;
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
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
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
}

function goToIndex(index) {
    if (isAnimating || index === currentIndex) return;
    currentIndex = index;
    updateCoverflow();
}

// Keyboard navigation
container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
});

// Click on items to select
items.forEach((item, index) => {
    item.addEventListener('click', () => goToIndex(index));
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;
let swipeTimeout = null;

container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isSwiping = true;
}, { passive: true });

container.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    
    const currentX = e.changedTouches[0].screenX;
    const diff = currentX - touchStartX;
    
    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}, { passive: false });

container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    
    if (swipeTimeout) clearTimeout(swipeTimeout);
    swipeTimeout = setTimeout(handleSwipe, 100);
    
    isSwiping = false;
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 30;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
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
    
    img.onload = function() {
        this.parentElement.classList.remove('image-loading');
        reflection.style.setProperty('--bg-image', `url(${this.src})`);
        reflection.style.backgroundImage = `url(${this.src})`;
        reflection.style.backgroundSize = 'cover';
        reflection.style.backgroundPosition = 'center';
    };
    
    img.onerror = function() {
        this.parentElement.classList.add('image-loading');
    };
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
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
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
});

document.querySelector('.nav-button.prev').addEventListener('click', handleUserInteraction);
document.querySelector('.nav-button.next').addEventListener('click', handleUserInteraction);

dots.forEach((dot) => {
    dot.addEventListener('click', handleUserInteraction);
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
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
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
    });
}

// 2. SCROLL TO CONTACT
function scrollToContact(service = '') {
    const contactSection = document.getElementById('contact');
    
    // Scroll a la sección de contacto
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
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

// 4. NOTIFICATION SYSTEM
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
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
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Obtener color de notificación por tipo
function getNotificationColor(type) {
    const colors = {
        'success': 'rgba(81, 207, 102, 0.9)',
        'error': 'rgba(255, 107, 107, 0.9)',
        'warning': 'rgba(255, 193, 7, 0.9)',
        'info': 'rgba(78, 205, 196, 0.9)'
    };
    
    return colors[type] || colors.info;
}

// 5. VIEW DETAILS MODAL FOR PORTFOLIO CON DESCRIPCIONES DETALLADAS
function initPortfolioModals() {
    const viewDetailsBtns = document.querySelectorAll('.view-details');
    
    viewDetailsBtns.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
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
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <img src="${imageSrc}" alt="${detailedInfo.title}">
                    <div class="modal-info">
                        <h3>${detailedInfo.title}</h3>
                        <p class="modal-description">${detailedInfo.description}</p>
                        
                        <div class="modal-features">
                            <h4><i class="fas fa-check-circle"></i> Características del servicio:</h4>
                            <ul>
                                ${detailedInfo.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="modal-details-grid">
                            <div class="detail-item">
                                <i class="fas fa-tag"></i>
                                <div>
                                    <h5>Precio aproximado</h5>
                                    <p class="price">${detailedInfo.price}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-shipping-fast"></i>
                                <div>
                                    <h5>Tiempo de entrega</h5>
                                    <p>${detailedInfo.delivery}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-palette"></i>
                                <div>
                                    <h5>Diseño incluido</h5>
                                    <p>3 revisiones</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-award"></i>
                                <div>
                                    <h5>Garantía</h5>
                                    <p>100% satisfacción</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button class="btn-primary" onclick="scrollToContact('${detailedInfo.title.split(' ')[0].toLowerCase()}')">
                                <i class="fas fa-comments"></i> Solicitar presupuesto personalizado
                            </button>
                            <button class="btn-secondary" onclick="this.closest('.portfolio-modal').remove()">
                                <i class="fas fa-times"></i> Cerrar
                            </button>
                        </div>
                        
                        <p class="modal-note"><i class="fas fa-info-circle"></i> Los precios pueden variar según cantidad, materiales y especificaciones del proyecto.</p>
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
                    }
                    .modal-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.8);
                        backdrop-filter: blur(10px);
                    }
                    .modal-content {
                        position: relative;
                        background: #1a1a2e;
                        border-radius: 20px;
                        max-width: 800px;
                        width: 90%;
                        max-height: 90vh;
                        overflow-y: auto;
                        animation: modalFadeIn 0.3s ease;
                    }
                    @keyframes modalFadeIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
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
                        height: 400px;
                        object-fit: cover;
                        border-radius: 20px 20px 0 0;
                    }
                    .modal-info {
                        padding: 30px;
                    }
                    .modal-info h3 {
                        color: white;
                        margin-bottom: 15px;
                        font-size: 1.8rem;
                    }
                    .modal-description {
                        color: rgba(255,255,255,0.8);
                        line-height: 1.6;
                        margin-bottom: 25px;
                        font-size: 1.1rem;
                    }
                    .modal-features {
                        margin-bottom: 30px;
                    }
                    .modal-features h4 {
                        color: white;
                        margin-bottom: 15px;
                        font-size: 1.2rem;
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
                    }
                    .modal-features li i {
                        color: var(--secondary-color);
                        font-size: 0.9rem;
                    }
                    .modal-details-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
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
                        font-size: 1.2rem;
                        color: white;
                    }
                    .detail-item h5 {
                        color: rgba(255,255,255,0.9);
                        font-size: 0.9rem;
                        margin-bottom: 5px;
                        font-weight: 600;
                    }
                    .detail-item p {
                        color: rgba(255,255,255,0.7);
                        font-size: 0.9rem;
                        margin: 0;
                    }
                    .detail-item .price {
                        color: var(--accent-color);
                        font-weight: 700;
                        font-size: 1.1rem;
                    }
                    .modal-actions {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 20px;
                    }
                    .btn-primary {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 15px 25px;
                        border-radius: 30px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    }
                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                    }
                    .btn-secondary {
                        background: rgba(255,255,255,0.1);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.2);
                        padding: 15px 25px;
                        border-radius: 30px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    }
                    .btn-secondary:hover {
                        background: rgba(255,255,255,0.2);
                    }
                    .modal-note {
                        color: rgba(255,255,255,0.5);
                        font-size: 0.85rem;
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
                `;
                document.head.appendChild(style);
            }
            
            // Add to DOM
            document.body.appendChild(modal);
            
            // Close modal functionality
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                modal.remove();
            });
            
            // Close on ESC key
            document.addEventListener('keydown', function closeModalOnEsc(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeModalOnEsc);
                }
            });
        });
    });
}

// 6. FORM VALIDATION FUNCTIONS
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
    });
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
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ingresa un teléfono válido';
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
    error.style.cssText = `
        color: var(--accent-color);
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    `;
    
    input.parentNode.appendChild(error);
    input.style.borderColor = 'var(--accent-color)';
    input.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
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

// 7. SMOOTH SCROLLING AND ACTIVE MENU ITEM
const sections = document.querySelectorAll('.section');
const menuItems = document.querySelectorAll('.menu-item');
const header = document.getElementById('header');
const scrollToTopBtn = document.getElementById('scrollToTop');

// Update active menu item on scroll
function updateActiveMenuItem() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            menuItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Find the corresponding menu item
            const sectionId = section.getAttribute('id');
            const correspondingMenuItem = document.querySelector(`.menu-item[href="#${sectionId}"]`);
            if (correspondingMenuItem) {
                correspondingMenuItem.classList.add('active');
            }
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
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateActiveMenuItem);

// Smooth scroll to section
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('href');
        
        // Check if it's an internal link (starts with #)
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        // External links will open normally in new tab
    });
});

// Logo click to scroll to top
document.querySelector('.logo-container').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll to top button
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== VISOR DE PDF (NUEVA FUNCIONALIDAD) =====
function openPdfViewer(pdfUrl, title = 'Catálogo') {
    // Crear el modal del visor PDF
    const modal = document.createElement('div');
    modal.className = 'pdf-viewer-modal';
    modal.innerHTML = `
        <div class="pdf-modal-overlay"></div>
        <div class="pdf-modal-content">
            <div class="pdf-modal-header">
                <h3>${title}</h3>
                <div class="pdf-modal-actions">
                    <button class="btn-fullscreen" title="Pantalla completa">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="btn-close-pdf" title="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="pdf-viewer-container">
                <iframe 
                    src="${pdfUrl}" 
                    frameborder="0"
                    title="Visor de PDF - ${title}"
                    allowfullscreen
                ></iframe>
            </div>
            <div class="pdf-modal-footer">
                <p><i class="fas fa-mouse-pointer"></i> Usa las flechas para navegar • <i class="fas fa-search-plus"></i> Rueda del mouse para zoom</p>
                <p class="pdf-note"><i class="fas fa-info-circle"></i> Catálogo de solo visualización</p>
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
            .pdf-modal-header {
                padding: 20px 30px;
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
                font-size: 1.5rem;
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
                min-height: 500px;
            }
            .pdf-viewer-container iframe {
                width: 100%;
                height: 100%;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .pdf-modal-footer {
                padding: 15px 30px;
                border-top: 1px solid rgba(255,255,255,0.1);
                text-align: center;
                background: rgba(0,0,0,0.3);
                border-radius: 0 0 20px 20px;
            }
            .pdf-modal-footer p {
                color: rgba(255,255,255,0.7);
                font-size: 0.9rem;
                margin-bottom: 5px;
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
    
    // Agregar al DOM
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Bloquear scroll
    
    // Funcionalidades
    const closeBtn = modal.querySelector('.btn-close-pdf');
    const fullscreenBtn = modal.querySelector('.btn-fullscreen');
    const overlay = modal.querySelector('.pdf-modal-overlay');
    const iframe = modal.querySelector('iframe');
    
    // Cerrar modal
    const closeModal = () => {
        modal.style.animation = 'modalSlideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }, 300);
        
        // Crear animación de salida
        if (!document.querySelector('#modal-slide-out')) {
            const style = document.createElement('style');
            style.id = 'modal-slide-out';
            style.textContent = `
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
            `;
            document.head.appendChild(style);
        }
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
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = 'Pantalla completa';
        }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('fullscreen')) {
                modal.classList.remove('fullscreen');
                fullscreenBtn.querySelector('i').className = 'fas fa-expand';
            } else {
                closeModal();
                document.removeEventListener('keydown', closeOnEsc);
            }
        }
    });
    
    // Enfocar el iframe para permitir navegación con teclado
    setTimeout(() => iframe.focus(), 300);
}

// 8. INITIALIZE EVERYTHING
function initAll() {
    // Initialize coverflow
    updateCoverflow();
    container.focus();
    startAutoplay();
    
    // Initialize new features
    initPortfolioFilter();
    initPortfolioModals();
    initFormValidation();
    
    // Initial active menu item update
    updateActiveMenuItem();
}

// 9. LOADING ANIMATION
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
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('👋 ¡Bienvenido a IMPRESIONES GRAFIC! Explora nuestros servicios de diseño e impresión.', 'info');
    }, 1000);
});

// 10. RESPONSIVE ADJUSTMENTS
function adjustCoverflowForScreen() {
    const width = window.innerWidth;
    
    if (width < 768) {
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
            item.style.width = '300px';
            item.style.height = '300px';
        });
    }
    updateCoverflow();
}

window.addEventListener('resize', adjustCoverflowForScreen);

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// ===== EXPORT FUNCIONES GLOBALES =====
// Estas funciones deben estar disponibles globalmente para los onclick en HTML
window.scrollToContact = scrollToContact;
window.handleSubmit = handleSubmit;
window.navigate = navigate;
window.goToIndex = goToIndex;
window.toggleAutoplay = toggleAutoplay;
window.openPdfViewer = openPdfViewer;