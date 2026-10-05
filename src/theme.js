export function initializeTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = root.dataset.themePreference || 'system';

  function applyTheme(theme) {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content =
      getComputedStyle(root).getPropertyValue('--background').trim();
  }

  toggle.addEventListener('click', () => {
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.themePreference = preference;
    applyTheme(preference);
    // Save only the appearance preference; quiz answers and scores stay in memory.
    try { localStorage.setItem('kaeru-kanji-theme', preference); } catch {}
  });

  systemTheme.addEventListener('change', event => {
    if (preference === 'system') applyTheme(event.matches ? 'dark' : 'light');
  });

  applyTheme(root.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));
}
