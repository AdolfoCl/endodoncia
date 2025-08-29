/**
 * Dynamic Animations & Lazy Loading System
 * Inspired by msendo.com functionality
 */

// Configuration
const CONFIG = {
  // Intersection Observer options
  observerOptions: {
    root: null,
    rootMargin: '20px',
    threshold: 0.1
  },
  
  // Animation settings
  animationDelay: 100, // ms between staggered animations
  lazyImageOptions: {
    rootMargin: '50px'
  }
};

// Main Animation Controller
class AnimationController {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupAnimations();
        this.setupLazyLoading();
        this.setupScrollProgress();
      });
    } else {
      this.setupAnimations();
      this.setupLazyLoading();
      this.setupScrollProgress();
    }
  }

  // Setup scroll-triggered animations
  setupAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.fallbackAnimations();
      return;
    }

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, index * CONFIG.animationDelay);
          
          animationObserver.unobserve(entry.target);
        }
      });
    }, CONFIG.observerOptions);

    // Observe all animation elements
    const animationElements = document.querySelectorAll(
      '.animate-on-scroll, .fade-in, .fade-in-left, .fade-in-right, .fade-in-up, .slide-in-left, .scale-in'
    );

    animationElements.forEach(el => {
      animationObserver.observe(el);
    });
  }

  // Setup lazy loading for images
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      this.fallbackLazyLoading();
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, CONFIG.lazyImageOptions);

    // Find all lazy images
    const lazyImages = document.querySelectorAll('img[data-src], .lazy-image');
    lazyImages.forEach(img => {
      img.classList.add('lazy-image');
      imageObserver.observe(img);
    });
  }

  // Load individual image
  loadImage(img) {
    if (img.dataset.src) {
      const image = new Image();
      image.onload = () => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      };
      image.onerror = () => {
        img.classList.add('loaded'); // Remove loading state even on error
      };
      image.src = img.dataset.src;
    } else {
      // For non-data-src lazy images, just add loaded class
      img.classList.add('loaded');
    }
  }

  // Setup scroll progress indicator
  setupScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      
      progressBar.style.width = Math.min(100, Math.max(0, scrollPercent)) + '%';
    };

    // Throttled scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress(); // Initial call
  }

  // Fallback for browsers without IntersectionObserver
  fallbackAnimations() {
    const elements = document.querySelectorAll(
      '.animate-on-scroll, .fade-in, .fade-in-left, .fade-in-right, .fade-in-up, .slide-in-left, .scale-in'
    );
    
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animated');
      }, index * CONFIG.animationDelay);
    });
  }

  // Fallback lazy loading
  fallbackLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      img.classList.add('loaded');
    });
  }
}

// Enhanced Form Interactions
class FormEnhancer {
  constructor() {
    this.setupFormAnimations();
  }

  setupFormAnimations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add loading states to form submissions
      form.addEventListener('submit', (e) => {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.classList.add('loading');
          submitBtn.disabled = true;
          
          // Reset after 3 seconds (adjust based on your form handling)
          setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
          }, 3000);
        }
      });

      // Enhanced input focus effects
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          input.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', () => {
          input.parentElement.classList.remove('input-focused');
          if (input.value.trim() !== '') {
            input.parentElement.classList.add('input-has-value');
          } else {
            input.parentElement.classList.remove('input-has-value');
          }
        });

        // Check initial state
        if (input.value.trim() !== '') {
          input.parentElement.classList.add('input-has-value');
        }
      });
    });
  }
}

// Advanced Form Validator
class FormValidator {
  constructor() {
    this.validators = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
      name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/
    };
    
    this.init();
  }

  init() {
    // Handle form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.classList.contains('modal-form') || form.classList.contains('hero-form')) {
        e.preventDefault();
        this.handleFormSubmission(form);
      }
    });

    // Real-time validation
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.validateField(e.target);
      }
    });

    // Enhanced validation on blur
    document.addEventListener('blur', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.validateField(e.target, true);
      }
    }, true);
  }

  validateField(field, showErrors = false) {
    const formGroup = field.closest('.form-group') || field.parentElement;
    const fieldType = field.type || field.tagName.toLowerCase();
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    // Clear previous states
    formGroup.classList.remove('error', 'success');
    this.clearFieldMessage(formGroup);

    // Skip validation if field is empty and not required
    if (!value && !isRequired) return true;

    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (isRequired && !value) {
      isValid = false;
      errorMessage = 'Este campo es obligatorio';
    }
    // Email validation
    else if (fieldType === 'email' && value && !this.validators.email.test(value)) {
      isValid = false;
      errorMessage = 'Por favor, ingrese un email válido';
    }
    // Phone validation
    else if (fieldType === 'tel' && value && !this.validators.phone.test(value)) {
      isValid = false;
      errorMessage = 'Por favor, ingrese un teléfono válido';
    }
    // Name validation
    else if (field.name === 'name' && value && !this.validators.name.test(value)) {
      isValid = false;
      errorMessage = 'El nombre debe tener al menos 2 caracteres';
    }
    // Textarea minimum length
    else if (fieldType === 'textarea' && value && value.length < 10) {
      isValid = false;
      errorMessage = 'Por favor, proporcione más detalles (mínimo 10 caracteres)';
    }

    // Apply validation styles
    if (showErrors || !isValid) {
      if (isValid) {
        formGroup.classList.add('success');
        this.showFieldMessage(formGroup, '✓', 'success');
      } else {
        formGroup.classList.add('error');
        this.showFieldMessage(formGroup, errorMessage, 'error');
      }
    }

    return isValid;
  }

  validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;

    fields.forEach(field => {
      const isFieldValid = this.validateField(field, true);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  showFieldMessage(formGroup, message, type) {
    const existingMessage = formGroup.querySelector('.form-error, .form-success');
    if (existingMessage) {
      existingMessage.remove();
    }

    if (message) {
      const messageElement = document.createElement('div');
      messageElement.className = type === 'error' ? 'form-error' : 'form-success';
      messageElement.textContent = message;
      formGroup.appendChild(messageElement);
    }
  }

  clearFieldMessage(formGroup) {
    const existingMessage = formGroup.querySelector('.form-error, .form-success');
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  async handleFormSubmission(form) {
    // Validate form
    if (!this.validateForm(form)) {
      this.showFormError(form, 'Por favor, corrija los errores antes de continuar');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Simulate API call (replace with actual endpoint)
      await this.submitFormData(data, form.id);
      
      // Success state
      this.showFormSuccess(form, '¡Mensaje enviado exitosamente! Nos contactaremos contigo pronto.');
      form.reset();
      
      // Close modal if it's a modal form
      if (form.closest('.modal-overlay')) {
        setTimeout(() => {
          window.modalSystem?.closeModal();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormError(form, 'Ha ocurrido un error. Por favor, intente nuevamente.');
    } finally {
      // Reset button state
      setTimeout(() => {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }, 2000);
    }
  }

  async submitFormData(data, formId) {
    // This is where you would integrate with your backend
    // For now, we'll simulate a network request
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success (90% chance)
        if (Math.random() > 0.1) {
          resolve({ success: true, message: 'Form submitted successfully' });
        } else {
          reject(new Error('Network error'));
        }
      }, 1500);
    });
  }

  showFormError(form, message) {
    this.clearFormMessages(form);
    const errorElement = document.createElement('div');
    errorElement.className = 'form-message form-error';
    errorElement.textContent = message;
    form.insertBefore(errorElement, form.firstChild);
  }

  showFormSuccess(form, message) {
    this.clearFormMessages(form);
    const successElement = document.createElement('div');
    successElement.className = 'form-message form-success';
    successElement.textContent = message;
    form.insertBefore(successElement, form.firstChild);
  }

  clearFormMessages(form) {
    const existingMessages = form.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
  }
}

// Smooth Scrolling for Anchor Links
class SmoothScroll {
  constructor() {
    this.setupSmoothScrolling();
  }

  setupSmoothScrolling() {
    // Handle anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      
      const offsetTop = target.offsetTop - 100; // Account for fixed header
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Update URL without jumping
      history.pushState(null, null, href);
    });
  }
}

// Performance Optimizations
class PerformanceOptimizer {
  constructor() {
    this.optimizeImages();
    this.preloadCriticalResources();
  }

  optimizeImages() {
    // Add loading="lazy" to images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      // Skip images that are likely above the fold
      const rect = img.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        img.loading = 'lazy';
      }
    });
  }

  preloadCriticalResources() {
    // Preload important images that might be needed soon
    const criticalImages = [
      '/assets/root-canal-illustration.svg',
      '/assets/hero-bg.svg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// Smart Navigation (Headroom.js behavior)
class SmartNavigation {
  constructor() {
    this.lastScrollY = window.pageYOffset;
    this.navbar = document.querySelector('.main-navbar');
    this.threshold = 100; // pixels to scroll before hiding
    this.isHidden = false;
    
    if (this.navbar) {
      this.init();
    }
  }

  init() {
    // Add necessary CSS classes
    this.navbar.classList.add('smart-nav');
    
    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.pageYOffset;
    const scrollDifference = currentScrollY - this.lastScrollY;

    // Don't hide navbar if we're at the top
    if (currentScrollY < this.threshold) {
      this.showNavbar();
    } 
    // Hide navbar when scrolling down
    else if (scrollDifference > 0 && !this.isHidden) {
      this.hideNavbar();
    }
    // Show navbar when scrolling up
    else if (scrollDifference < -5 && this.isHidden) {
      this.showNavbar();
    }

    this.lastScrollY = currentScrollY;
  }

  hideNavbar() {
    if (this.isHidden) return;
    
    this.navbar.classList.add('nav-hidden');
    this.navbar.classList.remove('nav-visible');
    this.isHidden = true;
  }

  showNavbar() {
    if (!this.isHidden && this.navbar.classList.contains('nav-visible')) return;
    
    this.navbar.classList.remove('nav-hidden');
    this.navbar.classList.add('nav-visible');
    this.isHidden = false;
  }
}

// Enhanced Modal System
class ModalSystem {
  constructor() {
    this.activeModal = null;
    this.setupModalTriggers();
    this.createModalContainer();
  }

  createModalContainer() {
    if (document.querySelector('.modal-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title"></h3>
          <button class="modal-close" aria-label="Cerrar modal">×</button>
        </div>
        <div class="modal-content"></div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close modal events
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal();
      }
    });
    
    overlay.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal();
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  setupModalTriggers() {
    // Setup triggers for modal links
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal]');
      if (!trigger) return;
      
      e.preventDefault();
      const modalType = trigger.dataset.modal;
      this.openModal(modalType, trigger);
    });
  }

  openModal(type, trigger) {
    const overlay = document.querySelector('.modal-overlay');
    const container = overlay.querySelector('.modal-container');
    const title = overlay.querySelector('.modal-title');
    const content = overlay.querySelector('.modal-content');
    
    // Set modal content based on type
    switch (type) {
      case 'contact':
        title.textContent = 'Contactar Especialista';
        content.innerHTML = this.getContactModalContent();
        break;
      case 'appointment':
        title.textContent = 'Reservar Consulta';
        content.innerHTML = this.getAppointmentModalContent();
        break;
      case 'info':
        title.textContent = trigger.dataset.title || 'Información';
        content.innerHTML = trigger.dataset.content || 'Contenido no disponible';
        break;
    }
    
    // Show modal with animation
    overlay.classList.add('modal-active');
    container.classList.add('modal-enter');
    
    // Lock body scroll
    document.body.classList.add('modal-open');
    
    this.activeModal = type;
    
    // Focus management
    const firstFocusable = container.querySelector('input, button, textarea, select');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
  }

  closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    const container = overlay.querySelector('.modal-container');
    
    container.classList.remove('modal-enter');
    container.classList.add('modal-exit');
    
    setTimeout(() => {
      overlay.classList.remove('modal-active');
      container.classList.remove('modal-exit');
      document.body.classList.remove('modal-open');
      this.activeModal = null;
    }, 300);
  }

  getContactModalContent() {
    return `
      <form class="modal-form" id="contactModal">
        <div class="form-row">
          <div class="form-group">
            <label for="modal-name">Nombre completo</label>
            <input type="text" id="modal-name" name="name" required>
          </div>
          <div class="form-group">
            <label for="modal-email">Email</label>
            <input type="email" id="modal-email" name="email" required>
          </div>
        </div>
        <div class="form-group">
          <label for="modal-phone">Teléfono</label>
          <input type="tel" id="modal-phone" name="phone">
        </div>
        <div class="form-group">
          <label for="modal-message">Mensaje</label>
          <textarea id="modal-message" name="message" rows="4" required></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-modern secondary-btn" onclick="window.modalSystem.closeModal()">
            Cancelar
          </button>
          <button type="submit" class="btn-modern primary-btn">
            Enviar Mensaje
          </button>
        </div>
      </form>
    `;
  }

  getAppointmentModalContent() {
    return `
      <form class="modal-form" id="appointmentModal">
        <div class="form-row">
          <div class="form-group">
            <label for="appt-name">Nombre completo</label>
            <input type="text" id="appt-name" name="name" required>
          </div>
          <div class="form-group">
            <label for="appt-email">Email</label>
            <input type="email" id="appt-email" name="email" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="appt-phone">Teléfono</label>
            <input type="tel" id="appt-phone" name="phone" required>
          </div>
          <div class="form-group">
            <label for="appt-date">Fecha preferida</label>
            <input type="date" id="appt-date" name="preferred_date">
          </div>
        </div>
        <div class="form-group">
          <label for="appt-service">Tipo de servicio</label>
          <select id="appt-service" name="service_type">
            <option value="">Seleccionar servicio</option>
            <option value="root-canal">Tratamiento de Conductos</option>
            <option value="retreatment">Retratamiento</option>
            <option value="microsurgery">Microcirugía</option>
            <option value="trauma">Trauma Dental</option>
            <option value="bleaching">Blanqueamiento Interno</option>
          </select>
        </div>
        <div class="form-group">
          <label for="appt-details">Detalles adicionales</label>
          <textarea id="appt-details" name="details" rows="3" placeholder="Describe tu situación actual"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-modern secondary-btn" onclick="window.modalSystem.closeModal()">
            Cancelar
          </button>
          <button type="submit" class="btn-modern primary-btn">
            Solicitar Cita
          </button>
        </div>
      </form>
    `;
  }
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
  new AnimationController();
  new FormEnhancer();
  new FormValidator();
  new SmoothScroll();
  new PerformanceOptimizer();
  new SmartNavigation();
  
  // Make modal system globally accessible
  window.modalSystem = new ModalSystem();
});

// Export for potential external use
window.EndodonciaAnimations = {
  AnimationController,
  FormEnhancer,
  SmoothScroll,
  PerformanceOptimizer
};