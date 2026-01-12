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
// ==================== PRODUCT GALLERY ==================== 
function initProductGalleries() {
  document.querySelectorAll('.product-gallery').forEach(gallery => {
    let imagesStr = gallery.getAttribute('data-images');
    const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');
    
    if (!imagesStr || imagesStr.trim() === '') {
      // Fallback для галерей без data-images атрибута
      const slidesFallback = Array.from(gallery.querySelectorAll('.gallery-slide'));
      
      slidesFallback.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === 0);
      });

      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slidesFallback.forEach((_, idx) => {
          const dot = document.createElement('span');
          dot.className = 'dot' + (idx === 0 ? ' active' : '');
          dot.onclick = function() { currentSlide(this, idx); };
          dotsContainer.appendChild(dot);
        });
      }
      
      // Добавить свайп
      addSwipeSupport(gallery);
      return;
    }
    
    const images = imagesStr.split(',').map(img => img.trim());
    const slides = gallery.querySelectorAll('.gallery-slide');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    
    // Load images into slides
    slides.forEach((slide, index) => {
      const img = slide.querySelector('img');
      if (img && images[index]) {
        img.src = 'img/product/' + images[index];
      }
    });
    
    // Adjust number of dots and slides
    const dotsNeeded = images.length;
    if (dots.length < dotsNeeded) {
      for (let i = dots.length; i < dotsNeeded; i++) {
        const newDot = document.createElement('span');
        newDot.className = 'dot';
        newDot.onclick = function() { currentSlide(this, i); };
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
        newSlide.appendChild(img);
        gallery.appendChild(newSlide);
      }
    }
    
    // Show first slide
    const allSlides = gallery.querySelectorAll('.gallery-slide');
    const allDots = dotsContainer.querySelectorAll('.dot');
    
    allSlides.forEach(s => s.classList.remove('active'));
    allDots.forEach(d => d.classList.remove('active'));
    
    if (allSlides.length > 0) {
      allSlides[0].classList.add('active');
    }
    if (allDots.length > 0) {
      allDots[0].classList.add('active');
    }
    
    // Keyboard support for gallery navigation
    const prevBtn = gallery.parentElement.querySelector('.gallery-prev');
    const nextBtn = gallery.parentElement.querySelector('.gallery-next');
    
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          changeSlide(prevBtn, -1);
        }
      });
      
      nextBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          changeSlide(nextBtn, 1);
        }
      });
    }

    // Добавить свайп
    addSwipeSupport(gallery);
  });
}

function getCurrentSlideIndex(gallery) {
  let currentIndex = 0;
  gallery.querySelectorAll('.gallery-slide').forEach((slide, index) => {
    if (slide.classList.contains('active')) {
      currentIndex = index;
    }
  });
  return currentIndex;
}

function setActiveSlide(gallery, dotsContainer, newIndex) {
  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
  if (!slides.length) return;

  const normalizedIndex = ((newIndex % slides.length) + slides.length) % slides.length;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === normalizedIndex);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === normalizedIndex);
  });
}

function changeSlide(button, direction) {
  const gallery = button.closest('.gallery-controls').previousElementSibling;
  const dotsContainer = button.closest('.catalog-product-image').querySelector('.gallery-dots');
  const currentIndex = getCurrentSlideIndex(gallery);
  setActiveSlide(gallery, dotsContainer, currentIndex + direction);
}

function currentSlide(dot, index) {
  const dotsContainer = dot.parentElement;
  const gallery = dotsContainer.previousElementSibling;
  setActiveSlide(gallery, dotsContainer, index);
}

function addSwipeSupport(gallery) {
  const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');
  let startX = 0;
  let startY = 0;
   let lastX = 0;
   let lastY = 0;
  let isPointerActive = false;
  const swipeThreshold = 25;

  const handleStart = (x, y) => {
    startX = x;
    startY = y;
    lastX = x;
    lastY = y;
    isPointerActive = true;
  };

  const handleMove = (x, y) => {
    if (!isPointerActive) return;
    lastX = x;
    lastY = y;
  };

  const handleEnd = (x, y) => {
    if (!isPointerActive) return;
    isPointerActive = false;

    const deltaX = (x ?? lastX) - startX;
    const deltaY = (y ?? lastY) - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      const currentIndex = getCurrentSlideIndex(gallery);
      const direction = deltaX > 0 ? -1 : 1;
      setActiveSlide(gallery, dotsContainer, currentIndex + direction);
    }
  };

  if ('PointerEvent' in window) {
    gallery.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
      if (gallery.setPointerCapture) {
        gallery.setPointerCapture(e.pointerId);
      }
    });

    gallery.addEventListener('pointermove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    gallery.addEventListener('pointerup', (e) => {
      handleEnd(e.clientX, e.clientY);
      if (gallery.releasePointerCapture) {
        gallery.releasePointerCapture(e.pointerId);
      }
    });

    gallery.addEventListener('pointercancel', () => {
      handleEnd(lastX, lastY);
    });
    gallery.addEventListener('pointerleave', () => {
      handleEnd(lastX, lastY);
    });
  } else {
    gallery.addEventListener('touchstart', (e) => {
      if (!e.changedTouches.length) return;
      const touch = e.changedTouches[0];
      handleStart(touch.clientX, touch.clientY);
    }, { passive: true });

    gallery.addEventListener('touchmove', (e) => {
      if (!e.changedTouches.length) return;
      const touch = e.changedTouches[0];
      handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    gallery.addEventListener('touchend', (e) => {
      if (!e.changedTouches.length) return;
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    }, { passive: true });
  }

  // Disable native drag on images so swipe works with mouse drag
  gallery.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', (evt) => evt.preventDefault());
  });
}
