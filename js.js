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
