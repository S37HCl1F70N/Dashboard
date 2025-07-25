document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeStylesheet = document.getElementById("theme-stylesheet");
  const html = document.documentElement;

  const THEME_KEY = "preferredTheme";
  const CRT_THEME = "crt-theme";
  const DARK_THEME = "dark-theme";

  // Determine correct path to CSS (adjust if structure changes)
  function getThemePath(theme) {
    return `../css/themes/${theme}.css`;
  }

  // Apply theme to <html> and stylesheet link
  function applyTheme(themeName) {
    html.classList.remove(CRT_THEME, DARK_THEME);
    html.classList.add(themeName);
    themeStylesheet.href = getThemePath(themeName);
    localStorage.setItem(THEME_KEY, themeName);
  }

  // Toggle logic
  function toggleTheme() {
    const currentTheme = html.classList.contains(CRT_THEME) ? CRT_THEME : DARK_THEME;
    const newTheme = currentTheme === CRT_THEME ? DARK_THEME : CRT_THEME;
    applyTheme(newTheme);
  }

  // Restore on load
  const savedTheme = localStorage.getItem(THEME_KEY) || CRT_THEME;
  applyTheme(savedTheme);

  // Attach event
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
});
