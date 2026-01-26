export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#2a2a2a',
        'bg-tertiary': '#3a3a3a',
        'text-primary': '#ffffff',
        'text-secondary': '#b0b0b0',
        'border': '#404040',
        'accent': '#3b82f6',
        'accent-hover': '#2563eb',
        'danger': '#ef4444',
        'success': '#10b981',
      }
    }
  },
  plugins: []
};
