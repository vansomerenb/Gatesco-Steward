// Site interactions + hardened contact form (FormSubmit AJAX)
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
      e.stopPropagation();
      const isOpen = navMain.classList.toggle('is-active');
      menuToggle.setAttribute('aria-expanded', isOpen);
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
    const formReadyAt = Date.now();
    const minFillMs = parseInt(form.getAttribute('data-min-fill-ms') || '3000', 10);
    const turnstileSiteKey = (form.getAttribute('data-turnstile-sitekey') || '').trim();
    const turnstileSlot = document.getElementById('cf-turnstile');
    let turnstileWidgetId = null;
    let lastSubmitAt = 0;

    // Optional Cloudflare Turnstile (set data-turnstile-sitekey on the form)
    // Note: FormSubmit cannot verify Turnstile tokens server-side.
    // Prefer Cloudflare WAF managed challenges + this client check, or migrate the form backend.
    if (turnstileSiteKey && turnstileSlot) {
      turnstileSlot.hidden = false;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        if (window.turnstile) {
          turnstileWidgetId = window.turnstile.render(turnstileSlot, {
            sitekey: turnstileSiteKey,
            theme: 'light',
          });
        }
      };
      document.head.appendChild(script);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const status = document.getElementById('form-status');
      const original = btn.textContent;
      const endpoint = form.getAttribute('action') || 'https://formsubmit.co/ajax/info@gatescosp.com';

      const showError = (message) => {
        btn.textContent = original;
        btn.disabled = false;
        if (status) {
          status.hidden = false;
          status.className = 'form-status form-status--error';
          status.textContent = message;
        }
      };

      // Client-side bot signals
      const honey = form.querySelector('[name="_honey"]');
      const decoy = form.querySelector('[name="company_fax"]');
      if ((honey && honey.value.trim()) || (decoy && decoy.value.trim())) {
        // Silent success for bots that fill honeypots
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
        return;
      }

      const elapsed = Date.now() - formReadyAt;
      if (elapsed < minFillMs) {
        showError('Please take a moment to complete the form, then try again.');
        return;
      }

      // Simple client rate limit (one real attempt every 15s)
      if (Date.now() - lastSubmitAt < 15000) {
        showError('Please wait a few seconds before sending another message.');
        return;
      }

      if (turnstileSiteKey && window.turnstile) {
        const token =
          (turnstileWidgetId !== null && window.turnstile.getResponse(turnstileWidgetId)) ||
          form.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!token) {
          showError('Please complete the security check before sending.');
          return;
        }
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      if (status) {
        status.hidden = true;
        status.textContent = '';
        status.className = 'form-status';
      }

      try {
        const body = new FormData(form);
        // Never send the decoy field to FormSubmit
        body.delete('company_fax');

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Unable to send message. Please email info@gatescosp.com.');
        }

        lastSubmitAt = Date.now();
        btn.textContent = 'Message Sent — We Will Be In Touch';
        form.reset();
        if (turnstileWidgetId !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId);
        }
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
        if (turnstileWidgetId !== null && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId);
        }
        showError(err.message || 'Something went wrong. Please email info@gatescosp.com directly.');
      }
    });
  }

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (navMain && navMain.classList.contains('is-active')) {
      if (!navMain.contains(e.target) && !menuToggle.contains(e.target)) {
        navMain.classList.remove('is-active');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
        }
        dropdowns.forEach((trigger) => {
          trigger.parentElement.classList.remove('open');
        });
      }
    }
  });
});
