// Dynamic favicon that uses existing logo
// The logo SVG will automatically adapt if it has CSS media queries
export const updateFavicon = () => {
  // The Asset 7.svg logo already adapts to theme
  // This function is kept for future enhancements
  // You can add custom logic here if needed

  // Optional: Force reload favicon to apply theme changes
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    const href = favicon.href;
    favicon.href = '';
    setTimeout(() => {
      favicon.href = href;
    }, 10);
  }
};

// Initialize favicon based on system preference
export const initFavicon = () => {
  // Logo already adapts, but we can listen for changes
  if (window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        updateFavicon(e.matches);
      });
  }
};
