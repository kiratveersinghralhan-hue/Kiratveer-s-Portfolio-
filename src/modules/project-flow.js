import { formatPrice, getCurrency } from '../data/pricing.js';

export const confirmationKey = 'kirat-project-received';
export function getFlowBudgetLabel({ label, min, max }, code = 'INR') {
  const currency = getCurrency(code).code;
  if (currency === 'INR' || (min === undefined && max === undefined)) return label;
  if (min === undefined) return `Below approx. ${formatPrice(max, currency)}`;
  if (max === undefined) return `Approx. ${formatPrice(min, currency)}+`;
  return `Approx. ${formatPrice(min, currency)}–${formatPrice(max, currency)}`;
}
export function getConfirmation(value, now = Date.now()) {
  try {
    const record = JSON.parse(value);
    if (!record || !Number.isFinite(record.at) || now - record.at > 1800000 || record.at > now || typeof record.name !== 'string') return null;
    return { name: record.name.trim().split(/\s+/)[0].slice(0, 60), contact: record.contact === 'whatsapp' ? 'WhatsApp' : 'email' };
  } catch { return null; }
}

function initConfirmation() {
  const main = document.querySelector('.flow-confirmation');
  if (!main) return;
  let confirmation;
  try { confirmation = getConfirmation(sessionStorage.getItem(confirmationKey)); } catch { return; }
  if (!confirmation) return;
  main.classList.add('is-received');
  main.querySelector('[data-confirmation-kicker]').textContent = 'PROJECT BRIEF / RECEIVED';
  const title = main.querySelector('[data-confirmation-title]');
  title.replaceChildren(document.createTextNode('Project'), document.createElement('br'), document.createTextNode('received.'));
  main.querySelector('[data-confirmation-message]').textContent = `Thanks${confirmation.name ? `, ${confirmation.name}` : ''}. I’ll review what you sent and get back to you through ${confirmation.contact}.`;
  main.querySelector('[data-confirmation-start]').hidden = true;
  main.querySelector('#confirmation-next-heading').textContent = 'What happens next';
}

export function initProjectFlow({ track = () => {} } = {}) {
  initConfirmation();
  const form = document.querySelector('#project-enquiry');
  if (!form) return () => {};
  form.noValidate = true;
  form.classList.add('is-enhanced');
  const steps = [...form.querySelectorAll('[data-flow-step]')];
  const jumps = [...document.querySelectorAll('[data-flow-jump]')];
  const next = form.querySelector('[data-flow-next]');
  const previous = form.querySelector('[data-flow-prev]');
  const submit = form.querySelector('[type="submit"]');
  const status = form.querySelector('#flow-status');
  const review = form.querySelector('[data-flow-review]');
  const currency = form.querySelector('#currency-select');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const eventController = new AbortController();
  const { signal } = eventController;
  let active = 0;
  let furthest = 0;
  let sending = false;
  let requestController;
  let anim;
  const value = name => String(new FormData(form).get(name) || '').trim();
  const selectedServices = () => [...form.querySelectorAll('[name="services"]:checked')].map(input => input.value);
  const clearError = index => {
    steps[index].querySelector('[data-step-error]').textContent = '';
    steps[index].querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  };

  function validate(index) {
    clearError(index);
    const step = steps[index];
    let invalid = [...step.querySelectorAll('input, textarea, select')].find(field => !field.checkValidity());
    let message = invalid?.validationMessage;
    if (index === 0 && !value('name')) { invalid = form.elements.name; message = 'Please enter your name.'; }
    if (index === 1 && !selectedServices().length) { invalid = step.querySelector('input'); message = 'Choose at least one direction, or select “Not sure yet”.'; }
    if (index === 5 && value('message').length < 10) { invalid = form.elements.message; message = 'Share a little more about the idea — at least 10 characters.'; }
    if (index === 6 && value('preferred_contact') === 'whatsapp' && value('phone').replace(/\D/g, '').length < 7) { invalid = form.elements.phone; message = 'Add your WhatsApp number, including the country code, or choose an email reply.'; }
    if (index === 6 && value('preferred_call_time') && !value('call_timezone')) { invalid = form.elements.call_timezone; message = 'Add the timezone for your preferred call time.'; }
    if (!invalid) return true;
    if (invalid.closest('details')) invalid.closest('details').open = true;
    step.querySelector('[data-step-error]').textContent = message || 'Please check this answer before continuing.';
    invalid.setAttribute('aria-invalid', 'true');
    invalid.focus({ preventScroll: true });
    invalid.scrollIntoView({ block: 'center', behavior: 'auto' });
    return false;
  }

  function updateBudgets() {
    const code = getCurrency(currency?.value).code;
    for (const input of form.querySelectorAll('[name="budget"]')) {
      const label = getFlowBudgetLabel({ label: input.dataset.inrLabel, ...(input.dataset.min === undefined ? {} : { min: Number(input.dataset.min) }), ...(input.dataset.max === undefined ? {} : { max: Number(input.dataset.max) }) }, code);
      input.nextElementSibling.textContent = label;
    }
  }

  function renderReview() {
    const chosenBudget = form.querySelector('[name="budget"]:checked');
    const entries = [
      ['You', [value('name'), value('business'), value('location')].filter(Boolean).join(' / ')],
      ['The work', selectedServices().join(', ')],
      ['Your business', [value('website'), value('business_context')].filter(Boolean).join('\n') || 'We’ll discuss this together.'],
      ['Investment', `${chosenBudget?.nextElementSibling.textContent || 'Not selected'} (${getCurrency(currency?.value).code})`],
      ['Timing', value('timeline')],
      ['The idea', [value('message'), value('references')].filter(Boolean).join('\n\nReferences: ')],
      ['Contact', [value('email'), value('phone'), `Preferred reply: ${value('preferred_contact') === 'whatsapp' ? 'WhatsApp' : 'Email'}`, value('preferred_call_time') ? `Preferred call: ${value('preferred_call_time').replace('T', ' ')} / ${value('call_timezone')} (to be confirmed)` : ''].filter(Boolean).join('\n')],
    ];
    review.replaceChildren(...entries.map(([label, text], index) => {
      const row = document.createElement('div'); row.className = 'flow-review-row';
      const title = document.createElement('h3'); title.textContent = label;
      const content = document.createElement('p'); content.textContent = text;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Edit ↗'; button.dataset.editStep = index; button.setAttribute('aria-label', `Edit ${label.toLowerCase()}`);
      row.append(title, content, button); return row;
    }));
  }

  function showStep(index, { focus = true } = {}) {
    if (sending || index < 0 || index >= steps.length) return;
    const direction = index >= active ? 1 : -1;
    active = index; furthest = Math.max(furthest, active);
    steps.forEach((step, position) => { step.hidden = position !== active; });
    previous.hidden = active === 0;
    next.hidden = active === steps.length - 1;
    submit.hidden = active !== steps.length - 1;
    document.querySelector('[data-flow-count]').textContent = `${String(active + 1).padStart(2, '0')} / 08`;
    jumps.forEach((jump, position) => {
      jump.disabled = position > furthest;
      jump.classList.toggle('is-complete', position < active);
      if (position === active) jump.setAttribute('aria-current', 'step'); else jump.removeAttribute('aria-current');
    });
    const root = document.querySelector('.project-flow');
    root.style.setProperty('--flow-progress', (active + 1) / steps.length);
    root.classList.toggle('has-progress', active > 0);
    if (active === steps.length - 1) renderReview();
    if (focus) {
      const heading = steps[active].querySelector('h2');
      heading.focus({ preventScroll: true });
      if (innerWidth < 900 || document.querySelector('.flow-workspace').getBoundingClientRect().top < 55) heading.scrollIntoView({ block: 'start', behavior: 'auto' });
      anim?.cancel();
      if (!media.matches) anim = steps[active].animate([{ opacity: 0, transform: `translate(${direction * 22}px, 8px)`, filter: 'blur(3px)' }, { opacity: 1, transform: 'translate(0, 0)', filter: 'blur(0)' }], { duration: 430, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    track('enquiry:step', { step: active + 1 });
  }

  function goNext() { if (validate(active)) showStep(active + 1); }
  next.addEventListener('click', goNext, { signal });
  previous.addEventListener('click', () => showStep(active - 1), { signal });
  jumps.forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.flowJump)), { signal }));
  review.addEventListener('click', event => { const button = event.target.closest('[data-edit-step]'); if (button) showStep(Number(button.dataset.editStep)); }, { signal });
  currency?.addEventListener('change', updateBudgets, { signal });
  form.addEventListener('input', () => { clearError(active); if (!sending) status.textContent = ''; }, { signal });
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.matches('input:not([type="radio"]):not([type="checkbox"])') && active < 7) { event.preventDefault(); goNext(); }
  }, { signal });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    if (active !== 7) { goNext(); return; }
    for (let index = 0; index < 7; index += 1) {
      showStep(index, { focus: false });
      if (!validate(index)) return;
    }
    showStep(7, { focus: false });
    if (value('_gotcha')) { status.textContent = 'The brief could not be sent. Please use WhatsApp or email.'; return; }
    sending = true;
    form.setAttribute('aria-busy', 'true');
    const controls = [...document.querySelectorAll('.flow-controls button, .flow-progress button, .flow-review button')];
    controls.forEach(control => { control.disabled = true; });
    submit.textContent = 'Sending your brief…';
    status.textContent = 'Sending securely. Keep this page open for confirmation.';
    requestController = new AbortController();
    const timeout = setTimeout(() => requestController.abort(), 20000);
    try {
      const data = new FormData(form);
      data.set('service', selectedServices().join(', '));
      data.set('budget_label', form.querySelector('[name="budget"]:checked')?.nextElementSibling.textContent || 'Not specified');
      data.set('billing_currency', getCurrency(currency?.value).code);
      const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: requestController.signal });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.errors || result.ok === false) throw new Error('Delivery not confirmed');
      const firstName = value('name').split(/\s+/)[0].slice(0, 60);
      const contact = value('preferred_contact') === 'whatsapp' ? 'whatsapp' : 'email';
      try { sessionStorage.setItem(confirmationKey, JSON.stringify({ at: Date.now(), name: firstName, contact })); } catch { /* The form still succeeds when browser storage is unavailable. */ }
      track('form:submitted');
      location.assign(`/thank-you/?${new URLSearchParams({ name: firstName, contact })}`);
    } catch {
      sending = false;
      form.removeAttribute('aria-busy');
      controls.forEach(control => { control.disabled = false; });
      submit.innerHTML = 'Send project brief <span aria-hidden="true">↗</span>';
      status.textContent = 'Delivery could not be confirmed. Your answers are still here. Try again, or contact Kirat on WhatsApp or email.';
      status.focus();
    } finally { clearTimeout(timeout); }
  }, { signal });
  const requested = new URLSearchParams(location.search).get('service');
  if (requested) {
    const mapped = { 'Launch Experience': 'Website', 'Business Growth': 'Website', 'Premium Experience': 'Premium interactive website', Commerce: 'E-commerce', 'AI / Digital Product': 'AI product / MVP' }[requested] || requested;
    const option = [...form.querySelectorAll('[name="services"]')].find(input => input.value === mapped);
    if (option) option.checked = true;
    if (requested === 'Digital presence audit') { form.elements.message.value = 'I would like a complimentary digital presence audit for a new website or product project.'; }
  }
  updateBudgets();
  showStep(0, { focus: false });
  return () => { eventController.abort(); requestController?.abort(); anim?.cancel(); };
}
