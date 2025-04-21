import React from 'react';
import './ModeToggle.css';

// Props: mode ('single' | 'multiple'), onChange(mode)
export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle-container">
      <span className={mode === 'single' ? 'active-label' : ''}>Single Edit</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={mode === 'multiple'}
          onChange={e => onChange(e.target.checked ? 'multiple' : 'single')}
        />
        <span className="slider round"></span>
      </label>
      <span className={mode === 'multiple' ? 'active-label' : ''}>Multiple Edit</span>
    </div>
  );
}
