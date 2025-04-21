import React from 'react';
import './ThemeToggle.css';

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <div className={`theme-navbar-toggle ${theme}`}> 
      <div className="slider-bg" />
      <button
        className={`theme-btn${theme === 'light' ? ' active' : ''}`}
        onClick={() => setTheme('light')}
        aria-label="Switch to light mode"
        tabIndex={theme === 'light' ? -1 : 0}
      >
        <span className="theme-icon sun-navbar">&#9728;&#65039;</span>
        Light
      </button>
      <button
        className={`theme-btn${theme === 'dark' ? ' active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-label="Switch to dark mode"
        tabIndex={theme === 'dark' ? -1 : 0}
      >
        <span className="theme-icon moon-navbar">&#127769;</span>
        Dark
      </button>
    </div>
  );
}
