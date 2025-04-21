// DragDropUpload.js
import React, { useRef, useContext } from 'react';
import { ThemeContext } from '../App';

function DragDropUpload({ onUpload, disabled }) {
  const { theme } = useContext(ThemeContext);
  const inputRef = useRef();

  const handleDrop = e => {
    e.preventDefault();
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(Array.from(files));
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: `2px dashed ${theme === 'dark' ? '#90caf9' : '#2d7ff9'}`,
        borderRadius: 12,
        padding: 24,
        background: disabled ? (theme === 'dark' ? '#2b2e36' : '#f3f3f3') : (theme === 'dark' ? '#263142' : '#eaf1fb'),
        textAlign: 'center',
        color: theme === 'dark' ? '#90caf9' : '#2d7ff9',
        fontWeight: 500,
        fontSize: 18,
        opacity: disabled ? 0.6 : 1,
        marginBottom: 20,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s, opacity 0.2s',
      }}
      onClick={() => !disabled && inputRef.current && inputRef.current.click()}
    >
      <div style={{marginBottom:8}}>Drag & Drop your image here<br/>or click to select</div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{display:'none'}}
        onChange={e => {
          if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
          }
        }}
        disabled={disabled}
      />
    </div>
  );
}

export default DragDropUpload;
