document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMain = document.querySelector('.nav-main');
  const dropdowns = document.querySelectorAll('.nav-dropdown > a');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  if (menuToggle && navMain) {
    menuToggle.addEventListener('click', () => {
      const open = navMain.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open);
    });
  }

  dropdowns.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Message Sent — We Will Be In Touch';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.textContent = original;
        btn.disabled = false;
      }, 4000);
    });
  }
});