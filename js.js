const header = document.getElementById('site-header');
const toggle = document.getElementById('menu-toggle');
const panel = document.getElementById('mobile-panel');
const form = document.getElementById('application-form');
const status = document.getElementById('form-status');
const emailInput = document.getElementById('email');
const yearNode = document.getElementById('year');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
});

if (toggle && panel) {
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('revealed'));
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (emailInput) {
  emailInput.addEventListener('input', () => {
    if (emailInput.value.trim() === '') {
      emailInput.setCustomValidity('');
      return;
    }
    emailInput.setCustomValidity(emailPattern.test(emailInput.value.trim()) ? '' : 'Wpisz poprawny adres e-mail.');
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!emailInput || !emailPattern.test(emailInput.value.trim())) {
      if (emailInput) {
        emailInput.setCustomValidity('Wpisz poprawny adres e-mail.');
        emailInput.reportValidity();
      }
      return;
    }

    if (emailInput) {
      emailInput.setCustomValidity('');
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      child_first_name: document.getElementById('child_first_name').value.trim(),
      child_last_name: document.getElementById('child_last_name').value.trim(),
      birth_date: document.getElementById('birth_date').value,
      parent_name: document.getElementById('parent_name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      start_date: document.getElementById('start_date').value,
      group_name: document.getElementById('group_name').value,
      message: document.getElementById('message').value.trim(),
      rodo_consent: document.getElementById('rodo_consent').checked ? 1 : 0,
      address: document.getElementById('address') ? document.getElementById('address').value.trim() : ''
    };

    try {
      const response = await fetch('api/submit_application.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!status) return;

      if (!result.success) {
        status.textContent = result.message || 'Wystąpił błąd.';
        status.classList.add('visible');
        setTimeout(() => status.classList.remove('visible'), 2500);
        return;
      }

      status.textContent = 'Dziękujemy! Zgłoszenie zostało wysłane.';
      status.classList.add('visible');
      form.reset();

      setTimeout(() => status.classList.remove('visible'), 2600);
    } catch (error) {
      if (!status) return;
      status.textContent = 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.';
      status.classList.add('visible');
      setTimeout(() => status.classList.remove('visible'), 2600);
    }
  });
}
