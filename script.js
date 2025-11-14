(function(){
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  function applyTheme(theme){
    if(theme === 'dark'){
      root.classList.add('dark');
      toggleBtn.setAttribute('aria-pressed','true');
      if(themeLabel) themeLabel.textContent = 'Dark Mode';
    } else {
      root.classList.remove('dark');
      toggleBtn.setAttribute('aria-pressed','false');
      if(themeLabel) themeLabel.textContent = 'Light Mode';
    }
  }

  const saved = localStorage.getItem('bc-theme');
  if(saved){
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(e){
      const isDark = document.documentElement.classList.toggle('dark');
      const theme = isDark ? 'dark' : 'light';
      localStorage.setItem('bc-theme', theme);
      applyTheme(theme);
    });
  }
    // --- Highlight current navigation link ---
  document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav a.link').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  });

})();
