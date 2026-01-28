/*
TemplateMo 595 3d coverflow
https://templatemo.com/tm-595-3d-coverflow
*/

// ===== CONFIGURACIÓN SUPABASE =====
const SUPABASE_URL = 'https://gsqzlzswyrdvenxiqtci.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcXpsenN3eXJkdmVueGlxdGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTY4NTcsImV4cCI6MjA1NDI3Mjg1N30.ZmlAn6CRnWnl-l3fJcFiy4u1mANPhPV1sDqbYhPrprI';

// Inicializar Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

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
    
    if (/android/.test(userAgent)) {
        document.body.classList.add('android-device');
        isAndroid = true;
    }
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
        document.body.classList.add('ios-device');
        isIOS = true;
    }
    
    if (/chrome/.test(userAgent) && /android/.test(userAgent)) {
        document.body.classList.add('android-chrome');
    }
    
    if (/safari/.test(userAgent) && !/chrome/.test(userAgent) && /iphone|ipad/.test(userAgent)) {
        document.body.classList.add('ios-safari');
    }
    
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.saveData === true || connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
            document.body.classList.add('slow-connection');
        }
    }
}

// ===== COVERFLOW FUNCTIONS OPTIMIZADAS =====
if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        if (mainMenu) {
            mainMenu.classList.toggle('active');
        }
        const isExpanded = menuToggle.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        menuToggle.setAttribute('aria-label', isExpanded ? 'Cerrar menú' : 'Abrir menú');
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    });
}

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menú');
            }
            if (mainMenu) {
                mainMenu.classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    });
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && mainMenu && mainMenu.classList.contains('active')) {
        if (menuToggle && !menuToggle.contains(e.target) && !mainMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.innerWidth <= 768 && mainMenu && mainMenu.classList.contains('active')) {
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menú');
        }
        if (mainMenu) {
            mainMenu.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
});

// Crear dots
function createDots() {
    if (!dotsContainer) return;
    
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

function updateCoverflow() {
    if (isAnimating) return;
    isAnimating = true;

    const isMobileView = window.innerWidth <= 768;
    const centerOffset = isMobileView ? 160 : 200;
    const zOffset = isMobileView ? 120 : 180;
    const rotation = isMobileView ? 40 : 60;

    items.forEach((item, index) => {
        let offset = index - currentIndex;
        
        if (offset > items.length / 2) {
            offset = offset - items.length;
        } else if (offset < -items.length / 2) {
            offset = offset + items.length;
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
        item.style.willChange = 'transform, opacity';

        item.classList.toggle('active', index === currentIndex);
        item.setAttribute('aria-hidden', index !== currentIndex);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
        dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
    });

    setTimeout(() => {
        isAnimating = false;
    }, isMobileView ? 400 : 600);
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

if (container) {
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
}

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

if (container) {
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
        
        if (Math.abs(diffX) > swipeThreshold && diffTime < swipeTimeThreshold) {
            handleUserInteraction();
            
            if (diffX > 0) {
                navigate(1);
            } else {
                navigate(-1);
            }
        }
        
        isSwiping = false;
    }, { passive: true });
}

// ===== INICIALIZACIÓN DE IMÁGENES OPTIMIZADA =====
function initializeImages() {
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        const reflection = item.querySelector('.reflection');
        
        if (img && img.complete) {
            handleImageLoad(img, reflection);
        } else if (img) {
            img.onload = () => handleImageLoad(img, reflection);
            img.onerror = () => {
                if (img.parentElement) {
                    img.parentElement.classList.add('image-loading');
                }
            };
        }
    });
}

function handleImageLoad(img, reflection) {
    if (img && img.parentElement) {
        img.parentElement.classList.remove('image-loading');
    }
    if (reflection && img) {
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
    
    const interval = isMobile ? 5000 : 4000;
    
    autoplayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCoverflow();
    }, interval);
    
    isPlaying = true;
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Pausar presentación automática');
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    isPlaying = false;
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Reproducir presentación automática');
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

items.forEach((item) => {
    item.addEventListener('click', handleUserInteraction);
    item.addEventListener('touchstart', handleUserInteraction);
});

const prevBtn = document.querySelector('.nav-button.prev');
const nextBtn = document.querySelector('.nav-button.next');

if (prevBtn) prevBtn.addEventListener('click', handleUserInteraction);
if (nextBtn) nextBtn.addEventListener('click', handleUserInteraction);

dots.forEach((dot) => {
    dot.addEventListener('click', handleUserInteraction);
    dot.addEventListener('touchstart', handleUserInteraction);
});

if (container) {
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            handleUserInteraction();
        }
    });
}

// ===== FILTRO DE PORTAFOLIO OPTIMIZADO =====
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
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
    
    if (!contactSection) return;
    
    window.scrollTo({
        top: contactSection.offsetTop - headerHeight,
        behavior: 'smooth'
    });
    
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
                    
                    if (isMobile) {
                        serviceSelect.focus();
                    }
                }
            }
        }, 500);
    }
    
    showNotification(`Perfecto! Te llevamos al formulario de contacto para ${service || 'tu consulta'}`, 'info');
}

// ===== FORM SUBMISSION HANDLER MODIFICADO CON SUPABASE =====
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    if (!submitBtn) return false;
    
    const originalText = submitBtn.innerHTML;
    
    // Mostrar loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Generar código único
    const codigo = 'COT-' + Date.now().toString().slice(-8);
    
    // Preparar datos para Supabase
    const cotizacionData = {
        nombre: form.name.value.trim(),
        email: form.email.value.trim(),
        telefono: form.phone.value.trim(),
        empresa: form.company.value.trim() || null,
        servicio: form.service.value,
        cantidad: form.quantity.value.trim() || null,
        descripcion: form.message.value.trim(),
        newsletter: form.newsletter.checked,
        codigo: codigo,
        estado: 'NUEVO'
    };
    
    // Validación
    if (!cotizacionData.nombre || !cotizacionData.email || !cotizacionData.telefono) {
        showNotification('❌ Completa los campos obligatorios (*)', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return false;
    }
    
    try {
        // 1. GUARDAR EN SUPABASE
        console.log('Enviando datos a Supabase...', cotizacionData);
        const { data, error } = await supabaseClient
            .from('cotizaciones')
            .insert([cotizacionData])
            .select();
        
        if (error) {
            console.error('Error Supabase:', error);
            throw error;
        }
        
        console.log('Datos guardados en Supabase:', data);
        
        // 2. Enviar notificación por WhatsApp (opcional)
        enviarNotificacionWhatsApp(cotizacionData);
        
        // 3. Mostrar éxito
        showNotification(
            `✅ Cotización #${codigo} registrada en nuestro sistema. Te contactaremos en <strong>menos de 2 horas</strong>.`,
            'success'
        );
        
        // 4. Mostrar comprobante
        mostrarComprobante(codigo, cotizacionData);
        
        // 5. Resetear formulario
        setTimeout(() => {
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error completo:', error);
        
        // Fallback: Enviar por WhatsApp directamente
        showNotification('⚠️ Redirigiendo a WhatsApp para enviar tu solicitud...', 'warning');
        
        const mensajeWhatsApp = `*SOLICITUD DE COTIZACIÓN*%0A%0A
👤 *Nombre:* ${cotizacionData.nombre}%0A
📧 *Email:* ${cotizacionData.email}%0A
📱 *Teléfono:* ${cotizacionData.telefono}%0A
${cotizacionData.empresa ? `🏢 *Empresa:* ${cotizacionData.empresa}%0A` : ''}
🛠 *Servicio:* ${cotizacionData.servicio}%0A
📦 *Cantidad:* ${cotizacionData.cantidad || 'Por definir'}%0A%0A
💬 *Descripción:*%0A${cotizacionData.descripcion}%0A%0A
*URGENTE: Contactar en menos de 2 horas*`;
        
        setTimeout(() => {
            window.open(`https://wa.me/59164793488?text=${encodeURIComponent(mensajeWhatsApp)}`, '_blank');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            form.reset();
        }, 1500);
    }
    
    return false;
}

// Función para mostrar comprobante
function mostrarComprobante(codigo, datos) {
    const comprobanteHTML = `
        <div class="comprobante">
            <div class="comprobante-header">
                <i class="fas fa-check-circle"></i>
                <h3>¡Solicitud Registrada!</h3>
            </div>
            <div class="comprobante-body">
                <p><strong>Número de seguimiento:</strong> ${codigo}</p>
                <p><strong>Cliente:</strong> ${datos.nombre}</p>
                <p><strong>Servicio:</strong> ${datos.servicio}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-BO')}</p>
                <p><strong>Estado:</strong> <span class="estado-nuevo">EN REVISIÓN</span></p>
            </div>
            <div class="comprobante-footer">
                <p><small>Guarda este número para referencia. Te contactaremos en menos de 2 horas.</small></p>
                <button onclick="window.open('https://wa.me/59164793488?text=Consulta%20cotización%20${codigo}', '_blank')" 
                        class="whatsapp-btn-small">
                    <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                </button>
            </div>
        </div>
    `;
    
    // Insertar después del formulario
    const formSection = document.querySelector('.contact-form-section');
    const existingComprobante = formSection.querySelector('.comprobante');
    if (existingComprobante) existingComprobante.remove();
    
    formSection.insertAdjacentHTML('beforeend', comprobanteHTML);
    
    // Agregar estilos CSS para el comprobante
    if (!document.querySelector('#comprobante-styles')) {
        const style = document.createElement('style');
        style.id = 'comprobante-styles';
        style.textContent = `
            .comprobante {
                background: rgba(102, 126, 234, 0.1);
                border: 2px solid rgba(102, 126, 234, 0.3);
                border-radius: 15px;
                padding: 25px;
                margin-top: 25px;
                animation: fadeIn 0.5s ease;
            }
            .comprobante-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }
            .comprobante-header i {
                color: #51cf66;
                font-size: 2rem;
            }
            .comprobante-header h3 {
                color: white;
                margin: 0;
                font-size: 1.5rem;
            }
            .comprobante-body p {
                color: rgba(255,255,255,0.9);
                margin-bottom: 10px;
                font-size: 0.95rem;
            }
            .estado-nuevo {
                background: #667eea;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
            }
            .comprobante-footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            .comprobante-footer p {
                color: rgba(255,255,255,0.7);
                font-size: 0.85rem;
                margin-bottom: 15px;
            }
            .whatsapp-btn-small {
                background: #25D366;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 30px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                transition: all 0.3s ease;
            }
            .whatsapp-btn-small:hover {
                background: #1da851;
                transform: translateY(-2px);
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Función para enviar notificación por WhatsApp
function enviarNotificacionWhatsApp(datos) {
    const mensaje = `*🚨 NUEVA COTIZACIÓN AUTOMÁTICA*%0A%0A
📋 *Código:* ${datos.codigo}%0A
👤 *Cliente:* ${datos.nombre}%0A
📱 *Teléfono:* ${datos.telefono}%0A
📧 *Email:* ${datos.email}%0A
🏢 *Empresa:* ${datos.empresa || 'No especificada'}%0A
🛠 *Servicio:* ${datos.servicio}%0A
📦 *Cantidad:* ${datos.cantidad || 'Por definir'}%0A
📝 *Newsletter:* ${datos.newsletter ? 'SÍ' : 'NO'}%0A%0A
💬 *Descripción:*%0A${datos.descripcion}%0A%0A
⏰ *URGENTE: Contactar en menos de 2 horas*%0A
📅 ${new Date().toLocaleString('es-BO')}`;
    
    // Esta función podría llamar a una API para enviar WhatsApp automático
    // Por ahora solo creamos el enlace
    console.log('Mensaje WhatsApp preparado:', mensaje);
    
    // Para enviar automáticamente necesitarías un servicio como Twilio
    // Por ahora el operador deberá hacer click manualmente
}

// ===== NOTIFICATION SYSTEM OPTIMIZADO =====
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
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
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            closeNotification(notification);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification);
        }
    }, 5000);
    
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
            if (!portfolioItem) return;
            
            const image = portfolioItem.querySelector('img');
            const titleElement = portfolioItem.querySelector('h4');
            const descriptionElement = portfolioItem.querySelector('p');
            
            if (!image || !titleElement) return;
            
            const imageSrc = image.src;
            const title = titleElement.textContent;
            const shortDescription = descriptionElement ? descriptionElement.textContent : '';
            
            const detailedDescriptions = [
                {
                    title: "Tarjetas Personales Corporativas",
                    description: "En IMPRESIONES GRAFIC diseñamos tarjetas de presentación que no solo transmiten información, sino que cuentan la historia de tu marca.",
                    features: ["Diseño personalizado con 3 revisiones", "Materiales premium (cartulina 300g)", "Acabados especiales", "Impresión full color de alta resolución"],
                    price: "Desde Bs. 150",
                    delivery: "48 horas"
                },
                {
                    title: "Reconocimientos Personalizados",
                    description: "Nuestros reconocimientos y diplomas son diseñados para premiar la excelencia.",
                    features: ["Diseño elegante y formal", "Papeles especiales", "Personalización completa", "Numeración oficial"],
                    price: "Desde Bs. 80",
                    delivery: "72 horas"
                },
                {
                    title: "Trofeos Exclusivos",
                    description: "Creamos trofeos que se convierten en símbolos de logro y reconocimiento.",
                    features: ["Combinación de materiales premium", "Grabado láser personalizado", "Diseño exclusivo", "Embalaje de lujo"],
                    price: "Desde Bs. 200",
                    delivery: "5-7 días"
                },
                {
                    title: "Invitaciones Elegantes",
                    description: "Transformamos tus momentos especiales en recuerdos tangibles.",
                    features: ["Diseño único para cada evento", "Papeles importados", "Técnicas especiales", "Sobres personalizados"],
                    price: "Desde Bs. 3 por unidad",
                    delivery: "5 días"
                },
                {
                    title: "Afiches Publicitarios",
                    description: "Diseñamos afiches que no solo informan, sino que impactan y persuaden.",
                    features: ["Gran formato hasta 150x100cm", "Materiales resistentes", "Impresión alta resolución", "Instalación profesional"],
                    price: "Desde Bs. 50",
                    delivery: "24-48 horas"
                },
                {
                    title: "Certificados Institucionales",
                    description: "Documentos oficiales que otorgan validez y prestigio.",
                    features: ["Elementos de seguridad", "Numeración serial", "Marcas de agua", "Validación oficial"],
                    price: "Desde Bs. 25 por unidad",
                    delivery: "3 días"
                }
            ];
            
            const detailedInfo = detailedDescriptions[index] || {
                title: title,
                description: shortDescription,
                features: ["Calidad garantizada", "Diseño personalizado", "Entrega puntual", "Atención personalizada"],
                price: "Consultar",
                delivery: "Variable"
            };
            
            const modal = createPortfolioModal(detailedInfo, imageSrc);
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            setupModalFunctionality(modal);
        });
        
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
                </div>
                
                <div class="modal-actions">
                    <button class="btn-primary" onclick="scrollToContact('${detailedInfo.title.split(' ')[0].toLowerCase()}')">
                        <i class="fas fa-comments" aria-hidden="true"></i> Solicitar presupuesto
                    </button>
                    <button class="btn-secondary modal-close-btn">
                        <i class="fas fa-times" aria-hidden="true"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
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
        }
        .modal-features ul {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 25px;
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
        .modal-details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 25px;
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
        }
        .detail-item p {
            color: rgba(255,255,255,0.7);
            font-size: 0.85rem;
            margin: 0;
        }
        .detail-item .price {
            color: #FF6B6B;
            font-weight: 700;
            font-size: 1rem;
        }
        .modal-actions {
            display: flex;
            gap: 15px;
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
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .btn-secondary {
            background: rgba(255,255,255,0.1);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 14px 20px;
            border-radius: 30px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
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
    
    const closeBtn = modal.querySelector('.modal-close');
    const closeBtn2 = modal.querySelector('.modal-close-btn');
    const overlay = modal.querySelector('.modal-overlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        if (firstFocusableElement) {
            setTimeout(() => firstFocusableElement.focus(), 100);
        }
        
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
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
    }
}

// ===== FORM VALIDATION =====
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Ya tenemos handleSubmit global
        });
        setupFormValidation(form);
    });
}

function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateInput(input);
        });
        
        input.addEventListener('input', () => {
            clearError(input);
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
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
        color: #FF6B6B;
        font-size: 0.85rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    `;
    
    input.parentNode.appendChild(error);
    input.style.borderColor = '#FF6B6B';
}

function clearError(input) {
    const error = input.parentNode.querySelector('.input-error');
    if (error) {
        error.remove();
    }
    input.style.borderColor = '';
}

// ===== SMOOTH SCROLLING AND ACTIVE MENU ITEM =====
const sections = document.querySelectorAll('.section');
const menuItems = document.querySelectorAll('.menu-item');
const header = document.getElementById('header');
const scrollToTopBtn = document.getElementById('scrollToTop');

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

    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    if (scrollToTopBtn) {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
            scrollToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            scrollToTopBtn.classList.remove('visible');
            scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }
    }
}

let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            scrollTimeout = null;
            updateActiveMenuItem();
        }, 100);
    }
});

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('href');
        
        if (targetId && targetId.startsWith('#') && targetId !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                if (window.innerWidth <= 768) {
                    if (menuToggle) {
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                        menuToggle.setAttribute('aria-label', 'Abrir menú');
                    }
                    if (mainMenu) {
                        mainMenu.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
                
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                history.pushState(null, null, targetId);
            }
        }
    });
});

const logoContainer = document.querySelector('.logo-container');
if (logoContainer) {
    logoContainer.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, null, window.location.pathname);
    });
}

if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTopBtn.click();
        }
    });
}

// ===== PDF VIEWER =====
function openPdfViewer(pdfUrl, title = 'Catálogo') {
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
                ></iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    setupPdfViewerFunctionality(modal, title);
}

function setupPdfViewerFunctionality(modal, title) {
    const closeBtn = modal.querySelector('.btn-close-pdf');
    const overlay = modal.querySelector('.pdf-modal-overlay');
    
    if (!closeBtn) return;
    
    setTimeout(() => closeBtn.focus(), 100);
    
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
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ===== AJUSTES RESPONSIVE =====
function adjustCoverflowForScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    isMobile = width <= 768;
    
    if (menuToggle && mainMenu) {
        if (width <= 768) {
            menuToggle.style.display = 'flex';
            if (!mainMenu.classList.contains('active')) {
                mainMenu.style.display = 'none';
            }
        } else {
            menuToggle.style.display = 'none';
            mainMenu.style.display = 'flex';
            mainMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }
    }
    
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
    
    if (isMobile && width > height) {
        if (container) container.style.height = '250px';
    } else {
        if (container) container.style.height = isMobile ? '250px' : '350px';
    }
    
    updateCoverflow();
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        adjustCoverflowForScreen();
        
        if (window.innerWidth > 768) {
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menú');
            }
            if (mainMenu) {
                mainMenu.classList.remove('active');
                mainMenu.style.display = 'flex';
            }
            document.body.style.overflow = '';
        }
        
        isMobile = window.innerWidth <= 768;
    }, 250);
});

// ===== INICIALIZACIÓN COMPLETA =====
function initAll() {
    console.log('Inicializando IMPRESIONES GRAFIC con Supabase...');
    
    detectDeviceAndBrowser();
    
    const width = window.innerWidth;
    
    if (menuToggle && mainMenu) {
        if (width <= 768) {
            menuToggle.style.display = 'flex';
            mainMenu.style.display = 'none';
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        } else {
            menuToggle.style.display = 'none';
            mainMenu.style.display = 'flex';
            mainMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
    
    createDots();
    initializeImages();
    updateCoverflow();
    
    if (container) {
        container.setAttribute('tabindex', '0');
        container.setAttribute('aria-label', 'Galería de trabajos - Use flechas para navegar');
    }
    
    setTimeout(() => {
        startAutoplay();
    }, 1000);
    
    initPortfolioFilter();
    initPortfolioModals();
    initFormValidation();
    
    updateActiveMenuItem();
    setAriaAttributes();
    adjustCoverflowForScreen();
    
    document.body.classList.add('loaded');
    
    console.log('Sitio inicializado correctamente con Supabase');
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
    
    if (container) {
        container.setAttribute('aria-label', 'Galería de trabajos');
        container.setAttribute('aria-roledescription', 'carousel');
        container.setAttribute('aria-live', 'polite');
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
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
    
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
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            loadingElement.remove();
        }, 300);
    }
    
    initAll();
    
    setTimeout(() => {
        showNotification('👋 ¡Bienvenido a IMPRESIONES GRAFIC! Explora nuestros servicios de diseño e impresión.', 'info');
    }, 2000);
    
    document.body.classList.add('fully-loaded');
});

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

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});

// Optimizaciones para Android
if (isAndroid) {
    document.documentElement.style.setProperty('--transition-normal', '0.25s ease');
    document.documentElement.style.setProperty('--transition-slow', '0.4s ease');
    
    if (document.body.classList.contains('slow-connection')) {
        stopAutoplay();
    }
}

// Optimizaciones para iOS
if (isIOS) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.webkitOverflowScrolling = 'touch';
    });
}
