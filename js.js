// ==================== LANGUAGE TOGGLE ====================
let currentLang = localStorage.getItem('lang') || 'ru';

function toggleLanguage() {
  currentLang = currentLang === 'ru' ? 'kk' : 'ru';
  localStorage.setItem('lang', currentLang);
  updateLanguage();
  
  // Update aria-label
  const langBtn = document.querySelector('.toggle-language');
  if (langBtn) {
    langBtn.setAttribute('aria-pressed', currentLang === 'kk' ? 'true' : 'false');
  }
}

function updateLanguage() {
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = currentLang === 'ru' ? 'RU' : 'KZ';
  }

  document.querySelectorAll('[data-lang]').forEach(el => {
    if (el.dataset.lang === currentLang) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

// ==================== MOBILE NAVIGATION ====================
function toggleMobileNav() {
  const mobileNav = document.getElementById('mobileNav');
  const burger = document.querySelector('.burger');
  
  if (!mobileNav || !burger) return;
  
  const isActive = mobileNav.classList.toggle('active');
  burger.classList.toggle('active');
  
  // Update aria attributes
  burger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  mobileNav.setAttribute('aria-hidden', isActive ? 'false' : 'true');

  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  updateLanguage();
  enableLazyLoadingForProductImages();
  
  // Animate cards on scroll
  document.querySelectorAll('.why-us-card, .preview-card, .catalog-product-card').forEach(card => {
    observer.observe(card);
  });
  
  // Mobile nav
  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      const mobileNav = document.getElementById('mobileNav');
      const burger = document.querySelector('.burger');
      if (mobileNav && burger) {
        mobileNav.classList.remove('active');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  });
  
  // Keyboard support for burger menu
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileNav();
      }
    });
  }

  // ==================== EMPLOYEES CAROUSEL ====================
  initEmployeesCarousel();
  
  // ==================== PRODUCT GALLERIES ====================
  initProductGalleries();

  // ==================== LIGHTBOX ====================
  initLightbox();
});

function initEmployeesCarousel() {
  const container = document.querySelector('.employees-carousel');
  if (!container) return;

  // Auto-scroll every 6s
  let timer = setInterval(() => {
    const step = container.offsetWidth * 0.8;
    const atEnd = Math.ceil(container.scrollLeft + container.offsetWidth) >= container.scrollWidth;
    if (atEnd) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: step, behavior: 'smooth' });
    }
  }, 6000);

  // Pause on hover
  container.addEventListener('mouseenter', () => clearInterval(timer));
  container.addEventListener('mouseleave', () => {
    timer = setInterval(() => {
      const step = container.offsetWidth * 0.8;
      const atEnd = Math.ceil(container.scrollLeft + container.offsetWidth) >= container.scrollWidth;
      if (atEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 6000);
  });
}

function scrollEmployees(direction) {
  const container = document.querySelector('.employees-carousel');
  if (!container) return;
  const card = container.querySelector('.employee-card');
  const step = card ? (card.offsetWidth + 16) : 320;
  container.scrollBy({ left: direction * step, behavior: 'smooth' });
}

function scrollEmployeesMobile(direction) {
  const container = document.querySelector('#employeesMobileCarousel');
  if (!container) return;
  const card = container.querySelector('.employee-card');
  const gap = parseFloat(window.getComputedStyle(container).columnGap || window.getComputedStyle(container).gap || 16);
  const step = card ? (card.offsetWidth + (Number.isFinite(gap) ? gap : 16)) : 280;
  container.scrollBy({ left: direction * step, behavior: 'smooth' });
}

function enableLazyLoadingForProductImages() {
  document.querySelectorAll('.product-gallery img').forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    img.setAttribute('decoding', 'async');
  });
}
// ==================== PRODUCT GALLERY & LIGHTBOX SYSTEM ====================
// Consolidated system for managing product galleries, swiping, and lightbox 

// State variables
let lightbox, lightboxTrack;
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function initProductGalleries() {
    // 1. Initialize DOM for all galleries
    document.querySelectorAll('.product-gallery').forEach(gallery => {
        setupGalleryDOM(gallery);
        setupGalleryInteraction(gallery);
    });

    // 2. Initialize Lightbox if not already present
    if (!document.getElementById('lightbox')) {
        setupLightboxDOM();
    }
}


function setupGalleryDOM(gallery) {
    let imagesStr = gallery.getAttribute('data-images');
    const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');

    // If data-images is missing or empty, handle existing DOM
    if (!imagesStr || imagesStr.trim() === '') {
        const slidesFallback = Array.from(gallery.querySelectorAll('.gallery-slide'));
        slidesFallback.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === 0);
            const img = slide.querySelector('img');
            if(img) img.style.cursor = 'zoom-in';
        });

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slidesFallback.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.className = 'dot' + (idx === 0 ? ' active' : '');
                dot.onclick = (e) => {
                    e.stopPropagation();
                    currentSlide(dot, idx);
                };
                dotsContainer.appendChild(dot);
            });
        }
        return;
    }

    // Process data-images
    const images = imagesStr.split(',').map(img => img.trim());
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    // Load images
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        if (img && images[index]) {
            img.src = 'img/product/' + images[index];
            img.style.cursor = 'zoom-in';
        }
    });

    // Adjust dots
    const dotsNeeded = images.length;
    if (dots.length < dotsNeeded) {
        for (let i = dots.length; i < dotsNeeded; i++) {
            const newDot = document.createElement('span');
            newDot.className = 'dot';
            newDot.onclick = (e) => {
                e.stopPropagation();
                currentSlide(newDot, i);
            };
            dotsContainer.appendChild(newDot);
        }
    } else if (dots.length > dotsNeeded) {
        for (let i = dotsNeeded; i < dots.length; i++) {
            dots[i].remove();
        }
    }

    // Add extra slides if needed
    if (slides.length < dotsNeeded) {
        for (let i = slides.length; i < dotsNeeded; i++) {
            const newSlide = document.createElement('div');
            newSlide.className = 'gallery-slide';
            const img = document.createElement('img');
            img.src = 'img/product/' + images[i];
            img.alt = 'Product image ' + (i + 1);
            img.style.cursor = 'zoom-in';
            newSlide.appendChild(img);
            gallery.appendChild(newSlide);
        }
    }

    // Initialize state
    const allSlides = gallery.querySelectorAll('.gallery-slide');
    const allDots = dotsContainer.querySelectorAll('.dot');

    allSlides.forEach(s => s.classList.remove('active'));
    allDots.forEach(d => d.classList.remove('active'));

    if (allSlides.length > 0) allSlides[0].classList.add('active');
    if (allDots.length > 0) allDots[0].classList.add('active');
}

function setupGalleryInteraction(gallery) {
    const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');
    
    // Pointer/Touch Logic for Swipe & Tap
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isPointerDown = false;
    
    // Prevent native drag
    gallery.querySelectorAll('img').forEach(img => {
        img.ondragstart = () => false;
    });

    const onPointerDown = (e) => {
        // Only left click or touch
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        
        isPointerDown = true;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        
        // Ensure we capture pointer for swiping
        if (gallery.setPointerCapture) {
            gallery.setPointerCapture(e.pointerId);
        }
    };

    const onPointerUp = (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        
        // Release capture
        if (gallery.releasePointerCapture) {
            gallery.releasePointerCapture(e.pointerId);
        }

        const endX = e.clientX;
        const endY = e.clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        const duration = Date.now() - startTime;
        
        // Detect click/tap (minimal movement, short duration)
        // Increased tolerance for "tap" detection to fix user reports of unclickable images
        if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15 && duration < 500) {
            // It's a tap - Open Lightbox
            // Find currently active image src
            const activeSlide = gallery.querySelector('.gallery-slide.active img');
            if (activeSlide) {
                openLightbox(activeSlide.src, gallery); // Pass gallery info for navigation
            }
            return;
        }

        // Detect Horizontal Swipe
        if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
            const direction = diffX > 0 ? 1 : -1; // 1 = next, -1 = prev
            changeSlideByOffset(gallery, direction);
        }
    };

    // Attach unified events
    if (window.PointerEvent) {
        gallery.addEventListener('pointerdown', onPointerDown);
        gallery.addEventListener('pointerup', onPointerUp);
        // We don't strictly need pointermove for this simple implementation
    } else {
        // Fallback for older touch devices
        gallery.addEventListener('touchstart', (e) => {
            if(e.changedTouches.length < 1) return;
            onPointerDown({
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY,
                pointerType: 'touch',
                pointerId: 0 // dummy
            });
        }, {passive: true});

        gallery.addEventListener('touchend', (e) => {
            if(e.changedTouches.length < 1) return;
            onPointerUp({
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY,
                pointerId: 0 // dummy
            });
        }, {passive: true});
    }

    // Setup arrow buttons locally to avoid inline onclick issues
    const prevBtn = gallery.parentElement.querySelector('.gallery-prev');
    const nextBtn = gallery.parentElement.querySelector('.gallery-next');

    // Remove inline handlers if any (via clone) or just override
    // Simple override:
    if (prevBtn) {
        prevBtn.onclick = (e) => { e.stopPropagation(); changeSlideByOffset(gallery, -1); };
    }
    if (nextBtn) {
        nextBtn.onclick = (e) => { e.stopPropagation(); changeSlideByOffset(gallery, 1); };
    }
}

// Global functions for inline HTML calls (backwards compatibility)
window.changeSlide = function(btn, dir) {
    if (!btn) return;
    const gallery = btn.closest('.catalog-product-image').querySelector('.product-gallery');
    changeSlideByOffset(gallery, dir);
}

window.currentSlide = function(dot, index) {
    if (!dot) return;
    const gallery = dot.closest('.catalog-product-image').querySelector('.product-gallery');
    setActiveSlide(gallery, index);
}

// Core Logic
function changeSlideByOffset(gallery, offset) {
    const slides = gallery.querySelectorAll('.gallery-slide');
    let currentIndex = 0;
    slides.forEach((slide, i) => {
        if (slide.classList.contains('active')) currentIndex = i;
    });
    
    setActiveSlide(gallery, currentIndex + offset);
}

function setActiveSlide(gallery, newIndex) {
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    
    if (slides.length === 0) return;

    // Wrap around
    const index = (newIndex % slides.length + slides.length) % slides.length;

    // Slide the gallery track
    gallery.style.transform = `translateX(-${index * 100}%)`;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// ==================== LIGHTBOX LOGIC ====================
// Variables are shared with the top of the file or declared here if missing
// (Ensuring no redeclaration errors)


// ==================== LIGHTBOX LOGIC ====================
// Variables are shared with the top of the file or declared here if missing

function setupLightboxDOM() {
    if (document.getElementById('lightbox')) return;

    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div id="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev" aria-label="Previous">❮</button>
            <img id="lightbox-img" src="" alt="Fullscreen View">
            <button class="lightbox-next" aria-label="Next">❯</button>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    // Close events
    const closeAction = () => closeLightbox();
    closeBtn.onclick = closeAction;
    
    // Close on click outside (but not on nav buttons or image)
    lightbox.onclick = (e) => {
        if (e.target === lightbox || e.target.id === 'lightbox-content') {
            closeAction();
        }
    };

    // Navigation events
    prevBtn.onclick = (e) => { e.stopPropagation(); changeLightboxSlide(-1); };
    nextBtn.onclick = (e) => { e.stopPropagation(); changeLightboxSlide(1); };

    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeAction();
        if (e.key === 'ArrowLeft') changeLightboxSlide(-1);
        if (e.key === 'ArrowRight') changeLightboxSlide(1);
    });

    // Simple Swipe Detection (No Dragging)
    setupLightboxSwipe();
}

function setupLightboxSwipe() {
    let startX = 0;
    
    const onTouchStart = (e) => {
        if (e.changedTouches.length === 0) return;
        startX = e.changedTouches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (e.changedTouches.length === 0) return;
        const diffX = startX - e.changedTouches[0].clientX;

        if (Math.abs(diffX) > 50) {
            if (diffX > 0) changeLightboxSlide(1); // Swipe left -> Next
            else changeLightboxSlide(-1);          // Swipe right -> Prev
        }
    };

    lightbox.addEventListener('touchstart', onTouchStart, {passive: true});
    lightbox.addEventListener('touchend', onTouchEnd, {passive: true});
}

function openLightbox(src, gallerySource) {
    if (!document.getElementById('lightbox')) setupLightboxDOM();
    
    // Collect images
    currentLightboxImages = [];
    if (gallerySource) {
        gallerySource.querySelectorAll('.gallery-slide img').forEach(img => {
            currentLightboxImages.push(img.src);
        });
    } else {
        currentLightboxImages = [src];
    }

    // Determine starting index
    currentLightboxIndex = currentLightboxImages.findIndex(s => s.endsWith(src) || src.endsWith(s) || s === src);
    if (currentLightboxIndex === -1) currentLightboxIndex = 0;

    updateLightboxImage();
    
    // Activate
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function changeLightboxSlide(dir) {
    if (currentLightboxImages.length <= 1) return;
    
    currentLightboxIndex += dir;
    
    // Wrap around for better experience in simple mode
    if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxImages.length - 1;
    if (currentLightboxIndex >= currentLightboxImages.length) currentLightboxIndex = 0;
    
    updateLightboxImage();
}

function updateLightboxImage() {
    if (!lightboxImg) return;
    
    // Simple fade effect
    lightboxImg.style.opacity = '0.5';
    
    setTimeout(() => {
        lightboxImg.src = currentLightboxImages[currentLightboxIndex];
        lightboxImg.style.opacity = '1';
    }, 150);

    updateLightboxButtons();
}

function updateLightboxButtons() {
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    if (currentLightboxImages.length <= 1) {
        if(prevBtn) prevBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'none';
    } else {
        if(prevBtn) prevBtn.style.display = '';
        if(nextBtn) nextBtn.style.display = '';
    }
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Clear content after animation
    setTimeout(() => {
        if(lightboxImg) lightboxImg.src = '';
    }, 300);
}

// Compatibility helper
function initLightbox() {
    // No-op, managed by openLightbox logic
}
