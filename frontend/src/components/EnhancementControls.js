// EnhancementControls.js
// Controls for adjusting enhancement strength and options
import React, { useContext, useRef, useEffect, useState } from 'react';
import { ThemeContext } from '../App';

const defaultValues = {
  strength: 1.0,
  vignetteStrength: 0.5,
  warmth: 1.02,
  saturation: 1.10,
  sharpness: 1.0,
  floorSharpness: 1.0,
};

function getBubbleLeft(inputRef, value, min, max) {
  if (!inputRef.current) return '0px';
  const percent = (value - min) / (max - min);
  const sliderWidth = inputRef.current.offsetWidth;
  // Center bubble: subtract half the bubble width (assume ~40px, can adjust)
  const thumbWidth = 16;
  const bubbleWidth = 40;
  const left = percent * (sliderWidth - thumbWidth) + thumbWidth / 2 - bubbleWidth / 2;
  return `${left}px`;
}

function EnhancementControls({ strength, setStrength, vignetteStrength, setVignetteStrength, warmth, setWarmth, saturation, setSaturation, sharpness, setSharpness, floorSharpness, setFloorSharpness, onRestoreDefaults, disabled }) {
  const { theme } = useContext(ThemeContext);
  // Refs for each slider
  const strengthRef = useRef();
  const vignetteRef = useRef();
  const warmthRef = useRef();
  const saturationRef = useRef();
  const sharpnessRef = useRef();
  const floorSharpnessRef = useRef();
  // State to trigger re-render on resize
  const [sliderDims, setSliderDims] = useState(0);
  useEffect(() => {
    const handleResize = () => setSliderDims(d => d + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      background: theme === 'dark' ? '#23272f' : '#fff',
      color: theme === 'dark' ? '#f4f4f4' : '#222',
      borderRadius: 12,
      boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      padding: 18,
      marginBottom: 18,
      marginTop: 12,
      transition: 'background 0.2s, color 0.2s',
    }}>
      {/* Enhancement Strength Slider */}
      <div style={{ marginBottom: 24 }}>
        <div className="slider-bar-container" style={{ position: 'relative' }}>
          <span className="slider-label">Enhancement Strength</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center', position: 'relative' }}>
            <input
              id="strength"
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={strength}
              onChange={e => setStrength(Number(e.target.value))}
              disabled={disabled}
              className="slider-bar"
              style={{ position: 'relative', zIndex: 1 }}
              ref={strengthRef}
            />
            <span
              className="slider-value-bubble"
              style={{
                position: 'absolute',
                left: getBubbleLeft(strengthRef, strength, 0.5, 3),
                top: 34,
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#f4f4f4' : '#222',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: '2px 8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                minWidth: 32,
                textAlign: 'center',
                zIndex: 2,
                transition: 'left 0.1s',
              }}
            >
              {strength}
            </span>
            <button className="reset-btn" onClick={() => setStrength(defaultValues.strength)} disabled={disabled}>Reset</button>
          </div>
        </div>
      </div>
      {/* Vignette Strength Slider */}
      <div style={{ marginBottom: 24 }}>
        <div className="slider-bar-container" style={{ position: 'relative' }}>
          <span className="slider-label">Vignette Strength</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center', position: 'relative' }}>
            <input
              id="vignetteStrength"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vignetteStrength}
              onChange={e => setVignetteStrength(Number(e.target.value))}
              disabled={disabled}
              className="slider-bar"
              style={{ position: 'relative', zIndex: 1 }}
              ref={vignetteRef}
            />
            <span
              className="slider-value-bubble"
              style={{
                position: 'absolute',
                left: getBubbleLeft(vignetteRef, vignetteStrength, 0, 1),
                top: 34,
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#f4f4f4' : '#222',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: '2px 8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                minWidth: 32,
                textAlign: 'center',
                zIndex: 2,
                transition: 'left 0.1s',
              }}
            >
              {vignetteStrength}
            </span>
            <button className="reset-btn" onClick={() => setVignetteStrength(defaultValues.vignetteStrength)} disabled={disabled}>Reset</button>
          </div>
        </div>
      </div>
      {/* Warmth Slider */}
      <div style={{ marginBottom: 24 }}>
        <div className="slider-bar-container" style={{ position: 'relative' }}>
          <span className="slider-label">Warmth</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center', position: 'relative' }}>
            <input
              id="warmth"
              type="range"
              min={0.8}
              max={1.5}
              step={0.01}
              value={warmth}
              onChange={e => setWarmth(Number(e.target.value))}
              disabled={disabled}
              className="slider-bar"
              style={{ position: 'relative', zIndex: 1 }}
              ref={warmthRef}
            />
            <span
              className="slider-value-bubble"
              style={{
                position: 'absolute',
                left: getBubbleLeft(warmthRef, warmth, 0.8, 1.5),
                top: 34,
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#f4f4f4' : '#222',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: '2px 8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                minWidth: 32,
                textAlign: 'center',
                zIndex: 2,
                transition: 'left 0.1s',
              }}
            >
              {warmth}
            </span>
            <button className="reset-btn" onClick={() => setWarmth(defaultValues.warmth)} disabled={disabled}>Reset</button>
          </div>
        </div>
      </div>
      {/* Saturation Slider */}
      <div style={{ marginBottom: 24 }}>
        <div className="slider-bar-container" style={{ position: 'relative' }}>
          <span className="slider-label">Saturation</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center', position: 'relative' }}>
            <input
              id="saturation"
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={saturation}
              onChange={e => setSaturation(Number(e.target.value))}
              disabled={disabled}
              className="slider-bar"
              style={{ position: 'relative', zIndex: 1 }}
              ref={saturationRef}
            />
            <span
              className="slider-value-bubble"
              style={{
                position: 'absolute',
                left: getBubbleLeft(saturationRef, saturation, 0.5, 2),
                top: 34,
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#f4f4f4' : '#222',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: '2px 8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                minWidth: 32,
                textAlign: 'center',
                zIndex: 2,
                transition: 'left 0.1s',
              }}
            >
              {saturation}
            </span>
            <button className="reset-btn" onClick={() => setSaturation(defaultValues.saturation)} disabled={disabled}>Reset</button>
          </div>
        </div>
      </div>
      {/* Sharpness Slider */}
      <div style={{ marginBottom: 24 }}>
        <div className="slider-bar-container" style={{ position: 'relative' }}>
          <span className="slider-label">Sharpness</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center', position: 'relative' }}>
            <input
              id="sharpness"
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={sharpness}
              onChange={e => setSharpness(Number(e.target.value))}
              disabled={disabled}
              className="slider-bar"
              style={{ position: 'relative', zIndex: 1 }}
              ref={sharpnessRef}
            />
            <span
              className="slider-value-bubble"
              style={{
                position: 'absolute',
                left: getBubbleLeft(sharpnessRef, sharpness, 0.5, 2),
                top: 34,
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#f4f4f4' : '#222',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: '2px 8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                minWidth: 32,
                textAlign: 'center',
                zIndex: 2,
                transition: 'left 0.1s',
              }}
            >
              {sharpness}
            </span>
            <button className="reset-btn" onClick={() => setSharpness(defaultValues.sharpness)} disabled={disabled}>Reset</button>
          </div>
        </div>
      </div>
      {/* Floor Sharpness Slider */}
      <div style={{ marginBottom: 24 }}>
        <div className="slider-bar-container" style={{ position: 'relative' }}>
          <span className="slider-label">Floor Sharpness</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center', position: 'relative' }}>
            <input
              id="floor-sharpness"
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={floorSharpness}
              onChange={e => setFloorSharpness(Number(e.target.value))}
              disabled={disabled}
              className="slider-bar"
              style={{ position: 'relative', zIndex: 1 }}
              ref={floorSharpnessRef}
            />
            <span
              className="slider-value-bubble"
              style={{
                position: 'absolute',
                left: getBubbleLeft(floorSharpnessRef, floorSharpness, 0, 2),
                top: 34,
                background: theme === 'dark' ? '#23272f' : '#fff',
                color: theme === 'dark' ? '#f4f4f4' : '#222',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                padding: '2px 8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                pointerEvents: 'none',
                minWidth: 32,
                textAlign: 'center',
                zIndex: 2,
                transition: 'left 0.1s',
              }}
            >
              {floorSharpness.toFixed(2)}
            </span>
            <button className="reset-btn" onClick={() => setFloorSharpness(defaultValues.floorSharpness)} disabled={disabled}>Reset</button>
          </div>
        </div>
      </div>
      <br />
      <button className="restore-btn" onClick={onRestoreDefaults} disabled={disabled}>Restore All Defaults</button>
      {/* Future: Add toggles for lighting, color, watermarking, etc. */}
    </div>
  );
}

export default EnhancementControls;
