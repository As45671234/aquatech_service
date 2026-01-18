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
    // Set initial slide and position (centered)
    setActiveSlide(gallery, 0);
}

function setupGalleryInteraction(gallery) {
    const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');
    
    // Pointer/Touch Logic for Swipe & Tap
    let startX = 0;
    let startY = 0;
    let isPointerDown = false;
    let isSwiping = false;
    let swipeTimeout = null;
    
    // Prevent native drag
    gallery.querySelectorAll('img').forEach(img => {
        img.ondragstart = () => false;
    });

    // Improved Click Handler: Use native click for reliability for opening Lightbox
    // This allows the browser to handle "what is a tap" vs "what is a scroll/drag"
    gallery.addEventListener('click', (e) => {
        // If we just performed a swipe action, ignore this click
        if (isSwiping) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Open Lightbox
        // Find specific image that was clicked or fallback to active
        const activeSlide = gallery.querySelector('.gallery-slide.active img');
        if (activeSlide) {
            openLightbox(activeSlide.src, gallery);
        }
    });

    const onPointerDown = (e) => {
        // Only left click or touch
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        
        // Clear any pending timeout
        if (swipeTimeout) {
            clearTimeout(swipeTimeout);
            swipeTimeout = null;
        }
        
        // Reset everything at the start of new gesture
        isSwiping = false;
        isPointerDown = true;
        startX = e.clientX;
        startY = e.clientY;
    };

    const onPointerUp = (e) => {
        if (!isPointerDown) return;
        
        const endX = e.clientX;
        const endY = e.clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Reset pointer down immediately
        isPointerDown = false;
        
        // Detect Horizontal Swipe
        // Sensitivity: > 20px difference
        if (Math.abs(diffX) > 20 && Math.abs(diffX) > Math.abs(diffY)) {
            isSwiping = true; // Mark as swipe to prevent click
            const direction = diffX > 0 ? 1 : -1; // 1 = next, -1 = prev
            changeSlideByOffset(gallery, direction);
            
            // Clear isSwiping flag after animation completes
            swipeTimeout = setTimeout(() => {
                isSwiping = false;
                swipeTimeout = null;
            }, 200);
        } else {
            // Not a swipe, clear immediately
            isSwiping = false;
        }
    };

    // Attach unified events
    if (window.PointerEvent) {
        gallery.addEventListener('pointerdown', onPointerDown);
        gallery.addEventListener('pointerup', onPointerUp);
        gallery.addEventListener('pointercancel', () => {
            isPointerDown = false;
            isSwiping = false;
            if (swipeTimeout) {
                clearTimeout(swipeTimeout);
                swipeTimeout = null;
            }
        });
    } else {
        // Fallback for older touch devices
        gallery.addEventListener('touchstart', (e) => {
            if(e.changedTouches.length < 1) return;
            onPointerDown({
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY,
                pointerType: 'touch',
                pointerId: 0,
                preventDefault: () => {},
                stopPropagation: () => {}
            });
        }, {passive: true});

        gallery.addEventListener('touchend', (e) => {
            if(e.changedTouches.length < 1) return;
            onPointerUp({
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY,
                pointerId: 0,
                preventDefault: () => {},
                stopPropagation: () => {}
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

    // Dynamically calculate centering based on actual slide width in %
    // This allows CSS to change (85% or 100%) without breaking JS
    const slide = slides[0];
    const galleryWidth = gallery.offsetWidth;
    // Fallback to 85 if not renderable yet, assuming default CSS
    let slideWidthPercent = 85; 
    
    if (galleryWidth > 0 && slide) {
         slideWidthPercent = (slide.offsetWidth / galleryWidth) * 100;
         // Clean up potentially tiny fractional errors
         if (Math.abs(slideWidthPercent - 85) < 1) slideWidthPercent = 85;
         if (Math.abs(slideWidthPercent - 100) < 1) slideWidthPercent = 100;
    }

    const offset = 50 - (slideWidthPercent / 2); // Center active slide
    const translateVal = -index * slideWidthPercent + offset;

    gallery.style.transform = `translateX(${translateVal}%)`;

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

function setupLightboxDOM() {
    if (document.getElementById('lightbox')) return;

    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-top-bar">
            <div class="lightbox-counter" id="lightbox-counter">1 / 1</div>
            <button class="lightbox-close" aria-label="Close">&times;</button>
        </div>
        <div id="lightbox-content">
            <button class="lightbox-prev" aria-label="Previous">❮</button>
            <img id="lightbox-img" src="" alt="View" draggable="false">
            <button class="lightbox-next" aria-label="Next">❯</button>
        </div>
        <div id="lightbox-thumbnails"></div>
    `;
    document.body.appendChild(lightbox);
    
    lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    // Close events
    const closeAction = () => closeLightbox();
    closeBtn.onclick = closeAction;
    
    // Close on click outside (but not on content)
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
        // Reset zoom on navigation
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') resetZoom();
    });

    setupLightboxSwipe();
    setupZoom();
}

// ==================== ZOOM & SWIPE LOGIC (UNIFIED) ====================
let currentScale = 1;
let translateX = 0, translateY = 0;
let isDragging = false;
let startX = 0, startY = 0;
let initialPinchDistance = 0;
let initialScale = 1;

function setupZoom() {
    const img = document.getElementById('lightbox-img');
    
    // --- MOUSE INTERACTIONS (Desktop) ---
    
    // Wheel Zoom
    img.addEventListener('wheel', (e) => {
        if(!lightbox.classList.contains('active')) return;
        e.preventDefault();
        
        const delta = e.deltaY * -0.005;
        const newScale = Math.min(Math.max(1, currentScale + delta), 4);
        
        if(newScale === 1) {
            translateX = 0;
            translateY = 0;
        }
        
        currentScale = newScale;
        updateTransform();
    }, {passive: false});

    // Mouse Drag (Pan)
    img.addEventListener('mousedown', (e) => {
        if (currentScale <= 1) return;
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        img.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
        if(img) img.style.cursor = currentScale > 1 ? 'grab' : 'default';
    });
    
    // Double Click Zoom
    img.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (currentScale > 1) {
            resetZoom();
        } else {
            currentScale = 2.5; 
            updateTransform();
        }
    });

    // --- TOUCH INTERACTIONS (Mobile) ---
    
    let touchStartX = 0;
    let touchStartY = 0; 
    let isPanning = false;

    lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // Single touch: Swipe or Pan
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            if (currentScale > 1) {
                isPanning = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
            }
        } else if (e.touches.length === 2) {
            // Two finger pinch
            isPanning = false;
            initialPinchDistance = getDistance(e.touches);
            initialScale = currentScale;
        }
    }, {passive: false});

    lightbox.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            if (currentScale > 1 && isPanning) {
                // Pan
                e.preventDefault(); // Prevent scrolling background
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                updateTransform();
            }
        } else if (e.touches.length === 2) {
            // Pinch
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            if (initialPinchDistance > 0) {
                const pinchScale = currentDistance / initialPinchDistance;
                currentScale = Math.min(Math.max(1, initialScale * pinchScale), 4);
                updateTransform();
            }
        }
    }, {passive: false});

    lightbox.addEventListener('touchend', (e) => {
        isPanning = false;
        
        // Swipe Dectection (only if not zoomed)
        if (currentScale === 1 && e.changedTouches.length === 1) {
            const diffX = touchStartX - e.changedTouches[0].clientX;
            const diffY = touchStartY - e.changedTouches[0].clientY;
            
            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
               if (diffX > 0) changeLightboxSlide(1); 
               else changeLightboxSlide(-1);
            }
        }
    });
}

function getDistance(touches) {
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
}

function setupLightboxSwipe() {
    // Deprecated: merged into setupZoom
}

function updateTransform() {
    const img = document.getElementById('lightbox-img');
    if(!img) return;
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
}

function resetZoom() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
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

    resetZoom();
    updateLightboxImage();
    renderThumbnails();
    
    // Activate
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderThumbnails() {
    const thumbContainer = document.getElementById('lightbox-thumbnails');
    if (!thumbContainer) return;

    thumbContainer.innerHTML = '';
    
    if (currentLightboxImages.length <= 1) {
        thumbContainer.style.display = 'none';
        return;
    }
    thumbContainer.style.display = 'flex';

    currentLightboxImages.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `lightbox-thumb ${idx === currentLightboxIndex ? 'active' : ''}`;
        thumb.onclick = (e) => {
            e.stopPropagation();
            currentLightboxIndex = idx;
            resetZoom();
            updateLightboxImage();
        };
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Thumb ${idx + 1}`;
        
        thumb.appendChild(img);
        thumbContainer.appendChild(thumb);
    });
}

function changeLightboxSlide(dir) {
    if (currentLightboxImages.length <= 1) return;
    
    currentLightboxIndex += dir;
    
    // Wrap around for better experience in simple mode
    if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxImages.length - 1;
    if (currentLightboxIndex >= currentLightboxImages.length) currentLightboxIndex = 0;
    
    resetZoom();
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

    // Update Counter
    const counter = document.getElementById('lightbox-counter');
    if (counter) {
        counter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxImages.length}`;
    }

    // Update Active Thumbnail
    const thumbs = document.querySelectorAll('.lightbox-thumb');
    thumbs.forEach((t, i) => {
        if (i === currentLightboxIndex) {
            t.classList.add('active');
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        else t.classList.remove('active');
    });

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
    resetZoom();
    // Clear content after animation
    setTimeout(() => {
        if(lightboxImg) lightboxImg.src = '';
    }, 300);
}


// Compatibility helper
function initLightbox() {
    // No-op, managed by openLightbox logic
}
