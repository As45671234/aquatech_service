// ==================== LANGUAGE TOGGLE ====================
let currentLang = localStorage.getItem('lang') || 'ru';

function toggleLanguage() {
  currentLang = currentLang === 'ru' ? 'kk' : 'ru';
  localStorage.setItem('lang', currentLang);
  updateLanguage();
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
  
  mobileNav.classList.toggle('active');
  burger.classList.toggle('active');

  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      burger.classList.remove('active');
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
      }
    });
  });
});
