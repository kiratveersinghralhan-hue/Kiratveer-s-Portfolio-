// Inlined by the renderer before stylesheets, so the first paint uses the right palette.
export function initializeTheme() {
  let preference;
  try { preference = localStorage.getItem('kirat-theme'); } catch { /* Storage is optional. */ }
  const theme = ['day', 'night'].includes(preference) ? preference : matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'day' ? 'light' : 'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'day' ? '#F3EFE7' : '#08090B');
}

export function initTheme() {
  const system = matchMedia('(prefers-color-scheme: light)');
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];
  let chosen;
  try { chosen = localStorage.getItem('kirat-theme'); } catch { /* Retain the choice in memory. */ }
  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'day' ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'day' ? '#F3EFE7' : '#08090B');
    buttons.forEach(button => {
      button.setAttribute('aria-label', `Switch to ${theme === 'day' ? 'night' : 'day'} mode`);
      button.setAttribute('aria-pressed', String(theme === 'day'));
      button.querySelector('[data-theme-label]').textContent = theme.toUpperCase();
    });
    window.dispatchEvent(new CustomEvent('kirat:theme', { detail: { theme } }));
  };
  const toggle = () => {
    chosen = document.documentElement.dataset.theme === 'day' ? 'night' : 'day';
    try { localStorage.setItem('kirat-theme', chosen); } catch { /* Theme still works without persistence. */ }
    apply(chosen);
  };
  const onSystem = () => { if (!['day', 'night'].includes(chosen)) apply(system.matches ? 'day' : 'night'); };
  const onStorage = event => {
    if (event.key !== 'kirat-theme' && event.key !== null) return;
    chosen = event.newValue;
    apply(['day', 'night'].includes(chosen) ? chosen : system.matches ? 'day' : 'night');
  };
  apply(document.documentElement.dataset.theme || (system.matches ? 'day' : 'night'));
  buttons.forEach(button => button.addEventListener('click', toggle));
  system.addEventListener('change', onSystem);
  window.addEventListener('storage', onStorage);
  return () => {
    buttons.forEach(button => button.removeEventListener('click', toggle));
    system.removeEventListener('change', onSystem);
    window.removeEventListener('storage', onStorage);
  };
}
