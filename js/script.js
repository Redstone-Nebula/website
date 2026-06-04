const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 60) {
    // 滚动时：红石红高亮边框
    nav.style.borderBottomColor = '#ff3a3a';
    nav.style.boxShadow = '0 2px 0 #ff8080, 0 6px 0 rgba(255, 58, 58, 0.3)';
  } else {
    // 顶部时：默认黑色边框
    nav.style.borderBottomColor = '#0a0a0a';
    nav.style.boxShadow = '0 2px 0 #5a5a5a, 0 6px 0 rgba(0, 0, 0, 0.5)';
  }
}, { passive: true });