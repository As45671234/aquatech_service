// ==================== THEME TOGGLE ====================
function toggleTheme() {
  document.body.classList.toggle('light');
  const icon = document.getElementById('theme-icon');
  const isLight = document.body.classList.contains('light');
  // Assuming icon1.png is dark icon (for light bg) and icon2.png is light icon (for dark bg)
  icon.src = isLight ? 'img/icon1.png' : 'img/icon2.png';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// ==================== LANGUAGE TOGGLE ====================
let currentLang = localStorage.getItem('lang') || 'ru'; // Default to RU as per request context

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ru' : 'en';
  document.getElementById('lang-label').textContent = currentLang.toUpperCase();
  updateLanguage();
  localStorage.setItem('lang', currentLang);
}

function updateLanguage() {
  document.querySelectorAll('[data-lang]').forEach(el => {
    // Check if the element is inside a hidden tab or mobile nav, we still toggle it
    // But we use style.display = 'none' for hiding.
    // The issue is that style.display = '' might conflict with flex/grid layouts if not careful.
    // However, for text elements it's usually fine.
    // For blocks that should be hidden, we need to be careful.
    
    if (el.dataset.lang === currentLang) {
        // If it was hidden by lang toggle, show it.
        // We need to respect if it's hidden by other means (like tabs), but here we just toggle lang visibility.
        // The simplest way for this project is to just set display to none or remove inline style.
        el.style.display = ''; 
    } else {
        el.style.display = 'none';
    }
  });
}

// ==================== MOBILE NAV TOGGLE ====================
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  const burger = document.querySelector('.burger');
  
  if (nav.classList.contains('active')) {
    nav.classList.remove('active');
    burger.classList.remove('active');
    setTimeout(() => {
      nav.style.display = 'none';
    }, 300);
  } else {
    nav.style.display = 'flex';
    // Force reflow
    void nav.offsetWidth;
    nav.classList.add('active');
    burger.classList.add('active');
  }
}

// Close mobile nav when clicking on a link
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.getElementById('mobileNav');
    const burger = document.querySelector('.burger');
    nav.classList.remove('active');
    burger.classList.remove('active');
    setTimeout(() => {
      nav.style.display = 'none';
    }, 300);
  });
});

// ==================== PORTFOLIO TABS ====================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Get the clicked button (handle click on span inside button)
    const targetBtn = e.target.closest('.tab-btn');
    if (!targetBtn) return;

    const tabName = targetBtn.getAttribute('data-tab');
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    targetBtn.classList.add('active');
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Show target tab content
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  });
});

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Set language
  document.getElementById('lang-label').textContent = currentLang.toUpperCase();
  updateLanguage();
  
  // Set theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.src = 'img/icon1.png';
  }
});
