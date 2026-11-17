const snippets = {
  html: {
    filename: 'index.html',
    intro: 'HTML gives the page a meaningful structure. Semantic elements pair a clear heading with an action, so both people and browsers understand the page quickly.',
    code: `<section class="hero" aria-labelledby="hero-title">
  <p class="eyebrow">Available for opportunities</p>
  <h1 id="hero-title">
    Building thoughtful digital experiences.
  </h1>
  <a class="button button-primary" href="#work">
    View my work <span aria-hidden="true">↗</span>
  </a>
</section>`
  },
  css: {
    filename: 'styles.css',
    intro: 'CSS turns the structure into a visual identity. Design tokens keep the palette consistent, while a media query makes the hero adapt to smaller screens.',
    code: `:root {
  --navy: #07111F;
  --surface: #162A46;
  --cyan: #22D3EE;
  --violet: #8B5CF6;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 4rem;
}

@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; }
}`
  },
  javascript: {
    filename: 'script.js',
    intro: 'JavaScript adds useful behavior without getting in the way. This listener gives the contact form a friendly success state after a valid submission.',
    code: `const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  status.textContent = 'Thanks — your message is ready to send.';
  status.dataset.state = 'success';
  form.reset();
});`
  }
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const menuToggle = $('#menu-toggle');
const navigation = $('#primary-navigation');
const navLinks = $$('[data-nav]');

function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuToggle.innerHTML = open
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12"></path><path d="m18 6-12 12"></path></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>';
}

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    setMenu(false);
    menuToggle.focus();
  }
});

const sectionIds = ['home', 'about', 'skills', 'work', 'services', 'code', 'contact'];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const active = link.dataset.nav === entry.target.id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sectionIds.forEach((id) => sectionObserver.observe(document.getElementById(id)));

const profileImage = $('#profile-image');
const profileFallback = $('#profile-fallback');
const profileUpload = $('#profile-upload');
function showProfileFallback() {
  profileImage.style.display = 'none';
  profileFallback.classList.add('is-visible');
  profileFallback.setAttribute('aria-hidden', 'false');
}
profileImage.addEventListener('error', showProfileFallback);
profileUpload.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    profileImage.src = reader.result;
    profileImage.style.display = 'block';
    profileFallback.classList.remove('is-visible');
    profileFallback.setAttribute('aria-hidden', 'true');
  });
  reader.readAsDataURL(file);
});

const snippetFilename = $('#snippet-filename');
const snippetCode = $('#snippet-code');
const snippetIntro = $('#snippet-intro');
const lineNumbers = $('#line-numbers');
const codePanel = $('#code-panel');
const copyButton = $('#copy-code');
let selectedSnippet = 'html';

function renderSnippet(name) {
  selectedSnippet = name;
  const snippet = snippets[name];
  snippetFilename.textContent = snippet.filename;
  snippetCode.textContent = snippet.code;
  snippetIntro.textContent = snippet.intro;
  lineNumbers.innerHTML = snippet.code.split('\n').map((_, index) => `<span>${String(index + 1).padStart(2, '0')}</span>`).join('');
  $$('.code-tabs [role="tab"]').forEach((tab) => {
    const active = tab.dataset.snippet === name;
    tab.classList.toggle('is-selected', active);
    tab.setAttribute('aria-selected', String(active));
  });
  codePanel.setAttribute('aria-labelledby', `tab-${name}`);
  copyButton.textContent = 'Copy code';
}

$$('[data-snippet]').forEach((tab) => tab.addEventListener('click', () => renderSnippet(tab.dataset.snippet)));
renderSnippet(selectedSnippet);

copyButton.addEventListener('click', async () => {
  const text = snippets[selectedSnippet].code;
  let success = false;
  try {
    await navigator.clipboard.writeText(text);
    success = true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    success = document.execCommand('copy');
    helper.remove();
  }
  copyButton.textContent = success ? 'Copied' : 'Select manually';
  window.setTimeout(() => { copyButton.textContent = 'Copy code'; }, 1800);
});

const contactForm = $('#contact-form');
const formStatus = $('#form-status');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();
  formStatus.className = 'form-status';
  if (!name || !email || !message) {
    formStatus.classList.add('error');
    formStatus.textContent = 'Please complete your name, email, and message.';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formStatus.classList.add('error');
    formStatus.textContent = 'Please enter a valid email address so I can reply.';
    return;
  }
  formStatus.classList.add('success');
  formStatus.textContent = '✓ Thanks — your message is ready to send. I’ll be in touch soon.';
  contactForm.reset();
});
