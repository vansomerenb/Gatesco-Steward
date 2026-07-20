// Updated main.js
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMain = document.querySelector('.nav-main');
  const dropdowns = document.querySelectorAll('.nav-dropdown > a');

  // Scroll header effect
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Hamburger menu
  if (menuToggle && navMain) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents the click from instantly triggering the click-outside close listener
      const isOpen = navMain.classList.toggle('is-active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      
      // Removed body scroll lock for now
      // document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Mobile dropdowns
  dropdowns.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  // Fade-in observer
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

  // Contact form → FormSubmit → info@gatescosp.com
  const form = document.querySelector('#contact-form') || document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const status = document.getElementById('form-status');
      const original = btn.textContent;
      const endpoint = form.getAttribute('action') || 'https://formsubmit.co/ajax/info@gatescosp.com';

      btn.disabled = true;
      btn.textContent = 'Sending…';
      if (status) {
        status.hidden = true;
        status.textContent = '';
        status.className = 'form-status';
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: new FormData(form),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Unable to send message. Please email info@gatescosp.com.');
        }

        btn.textContent = 'Message Sent — We Will Be In Touch';
        form.reset();
        if (status) {
          status.hidden = false;
          status.className = 'form-status form-status--success';
          status.textContent = 'Thank you. Your message was sent to our team.';
        }
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
          if (status) status.hidden = true;
        }, 5000);
      } catch (err) {
        btn.textContent = original;
        btn.disabled = false;
        if (status) {
          status.hidden = false;
          status.className = 'form-status form-status--error';
          status.textContent =
            err.message || 'Something went wrong. Please email info@gatescosp.com directly.';
        }
      }
    });
  }

  // UPDATED: Changed from window to document listener to guarantee iPhone compatibility
  document.addEventListener('click', (e) => {
    if (navMain && navMain.classList.contains('is-active')) {
      // Check if the click happened outside BOTH the navigation pane and the hamburger button
      if (!navMain.contains(e.target) && !menuToggle.contains(e.target)) {
        navMain.classList.remove('is-active');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
        }
        
        // OPTIONAL: Closes open dropdown accordions inside the menu when closing the drawer
        dropdowns.forEach((trigger) => {
          trigger.parentElement.classList.remove('open');
        });
      }
    }
  });
});
