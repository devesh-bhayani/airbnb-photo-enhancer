// BeforeAfter.js
import React, { useContext, useState } from 'react';
import { ThemeContext } from '../App';

function BeforeAfter({ beforeSrc, afterSrc, showSplit }) {
  const { theme } = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => setExpanded(true);
  const handleClose = () => setExpanded(false);

  // Dynamic sizing for before/after images
  let beforeWidth = 170;
  let afterWidth = 170;
  if (showSplit && beforeSrc && afterSrc) {
    beforeWidth = 85;
    afterWidth = 255;
  }

  return (
    <div
      style={{
        background: theme === 'dark' ? '#23272f' : '#fff',
        borderRadius: 14,
        boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
        padding: 24,
        marginTop: 0,
        maxWidth: 600,
        margin: '0 auto',
        color: theme === 'dark' ? '#f4f4f4' : '#222',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      <h2 style={{
        textAlign: 'center',
        fontWeight: 700,
        color: theme === 'dark' ? '#fffbe7' : '#222',
        marginBottom: 18
      }}>Before / After Comparison</h2>
      <div style={{display:'flex', gap:32, justifyContent:'center', alignItems:'flex-end', flexWrap:'nowrap'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontWeight:600, marginBottom:6, color: theme === 'dark' ? '#bbb' : '#444'}}>Before</div>
          {beforeSrc ? (
            <img src={beforeSrc} alt="Before enhancement" style={{width:beforeWidth, height:beforeWidth * 0.7, borderRadius:8, objectFit:'cover', background: theme === 'dark' ? '#444' : '#ddd', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition:'width 0.4s, height 0.4s'}} onClick={handleExpand} />
          ) : (
            <div style={{width:beforeWidth, height:beforeWidth * 0.7, background: theme === 'dark' ? '#444' : '#eee', borderRadius:8}} />
          )}
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontWeight:600, marginBottom:6, color: theme === 'dark' ? '#bbb' : '#444'}}>After</div>
          {afterSrc ? (
            <img src={afterSrc} alt="After enhancement" style={{width:afterWidth, height:afterWidth * 0.7, borderRadius:8, objectFit:'cover', background: theme === 'dark' ? '#444' : '#ddd', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition:'width 0.4s, height 0.4s'}} onClick={handleExpand} />
          ) : (
            <div style={{width:afterWidth, height:afterWidth * 0.7, background: theme === 'dark' ? '#444' : '#eee', borderRadius:8}} />
          )}
        </div>
      </div>
      {/* Expanded modal unchanged */}
      {expanded && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={handleClose}>
          <div style={{ display: 'flex', gap: '2rem', background: theme === 'dark' ? '#23272f' : '#fff', padding: 16, borderRadius: 8 }} onClick={e => e.stopPropagation()}>
            <div>
              <p style={{ textAlign: 'center', fontWeight: 'bold', color: theme === 'dark' ? '#f4f4f4' : '#222' }}>Before</p>
              <img src={beforeSrc} alt="Before enhancement expanded" style={{ maxHeight: '80vh', maxWidth: '40vw', border: '2px solid #888', objectFit: 'contain', background: theme === 'dark' ? '#444' : '#fff' }} />
            </div>
            <div>
              <p style={{ textAlign: 'center', fontWeight: 'bold', color: theme === 'dark' ? '#f4f4f4' : '#222' }}>After</p>
              <img src={afterSrc} alt="After enhancement expanded" style={{ maxHeight: '80vh', maxWidth: '40vw', border: '2px solid #888', objectFit: 'contain', background: theme === 'dark' ? '#444' : '#fff' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BeforeAfter;
