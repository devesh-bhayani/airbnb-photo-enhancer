import React from 'react';

export default function UndoRedoControls({ onUndo, onRedo, canUndo, canRedo }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
      <button onClick={onUndo} disabled={!canUndo} style={{ fontWeight: 700, borderRadius: 8, padding: '6px 18px', background: canUndo ? '#f5b700' : '#ccc', color: '#222', border: 'none', cursor: canUndo ? 'pointer' : 'not-allowed' }}>Undo</button>
      <button onClick={onRedo} disabled={!canRedo} style={{ fontWeight: 700, borderRadius: 8, padding: '6px 18px', background: canRedo ? '#2d7ff9' : '#ccc', color: '#fff', border: 'none', cursor: canRedo ? 'pointer' : 'not-allowed' }}>Redo</button>
    </div>
  );
}
