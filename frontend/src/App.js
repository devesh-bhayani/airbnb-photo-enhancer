// App.js
// Main React app for Airbnb Photo Enhancer
import React, { useState, useRef, createContext, useEffect } from 'react';
import './App.css';
import BeforeAfter from './components/BeforeAfter';
import EnhancementControls from './components/EnhancementControls';
import Auth from './components/Auth';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DragDropUpload from './components/DragDropUpload';
import FloorSelector from './components/FloorSelector';
import ModeToggle from './components/ModeToggle';
import ThemeToggle from './components/ThemeToggle';
import './components/ModeToggle.css';
import ImageCropAlign from './components/ImageCropAlign';
import UndoRedoControls from './components/UndoRedoControls';
import PremiumModal from './components/PremiumModal';
import { enhanceImage, login, fetchAnalytics } from './api';

export const ThemeContext = createContext();

const DEFAULTS = {
  strength: 1.0,
  vignetteStrength: 0.5,
  warmth: 1.02,
  saturation: 1.10,
  sharpness: 1.0,
  floorSharpness: 0
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [strength, setStrength] = useState(DEFAULTS.strength);
  const [vignetteStrength, setVignetteStrength] = useState(DEFAULTS.vignetteStrength);
  const [warmth, setWarmth] = useState(DEFAULTS.warmth);
  const [saturation, setSaturation] = useState(DEFAULTS.saturation);
  const [sharpness, setSharpness] = useState(DEFAULTS.sharpness);
  const [beforeImg, setBeforeImg] = useState(null);
  const [afterImg, setAfterImg] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [theme, setTheme] = useState('light');
  const [floorSharpness, setFloorSharpness] = useState(DEFAULTS.floorSharpness);
  const [floorMask, setFloorMask] = useState([]);
  const [selectingFloor, setSelectingFloor] = useState(false);
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState('single'); // 'single' or 'multiple'
  const [staged, setStaged] = useState({
    strength: DEFAULTS.strength,
    vignetteStrength: DEFAULTS.vignetteStrength,
    warmth: DEFAULTS.warmth,
    saturation: DEFAULTS.saturation,
    sharpness: DEFAULTS.sharpness,
    floorSharpness: DEFAULTS.floorSharpness,
    floorMask: []
  });
  const [history, setHistory] = useState([]); // [{beforeImg, afterImg, params...}]
  const [redoStack, setRedoStack] = useState([]);
  const [cropStage, setCropStage] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // Premium state
  const [showPremiumModal, setShowPremiumModal] = useState(false); // Modal state
  const latestFileRef = useRef(null);
  const debounceTimeout = useRef(null);

  const handleLogin = async (username, password) => {
    try {
      const result = await login(username, password);
      if (result.message === 'Login functionality coming soon!') {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        setError(null);
      } else {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  // Live enhancement when sliders change
  const triggerEnhancement = (file) => {
    if (!file) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      pushHistory({ beforeImg, afterImg, strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, floorMask });
      setRedoStack([]);
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const enhancedUrl = await enhanceImage(file, strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, false, floorMask);
        setAfterImg(enhancedUrl);
        setSuccess('Enhancement successful!');
      } catch (e) {
        setAfterImg(null);
        setError('Enhancement failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleUpload = async (files) => {
    if (files.length > 0) {
      const file = files[0];
      setFile(file);
      setBeforeImg(URL.createObjectURL(file));
      latestFileRef.current = file;
      setCropStage(true);
    }
  };

  React.useEffect(() => {
    if (latestFileRef.current) {
      // triggerEnhancement(latestFileRef.current);
    }
    // eslint-disable-next-line
  }, [strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, floorMask]);

  const handleFetchAnalytics = async () => {
    const data = await fetchAnalytics();
    setAnalytics(data);
  };

  const handleRestoreDefaults = () => {
    setStrength(DEFAULTS.strength);
    setVignetteStrength(DEFAULTS.vignetteStrength);
    setWarmth(DEFAULTS.warmth);
    setSaturation(DEFAULTS.saturation);
    setSharpness(DEFAULTS.sharpness);
    setFloorSharpness(DEFAULTS.floorSharpness);
    setFloorMask([]);
  };

  const handleDownload = () => {
    if (afterImg) {
      const link = document.createElement('a');
      link.href = afterImg;
      link.download = 'enhanced-photo.jpg';
      link.click();
    }
  };

  const handleRemoveGlare = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const enhancedUrl = await enhanceImage(file, strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, true, floorMask);
      setAfterImg(enhancedUrl);
      setSuccess('Glare removal applied!');
    } catch (e) {
      setAfterImg(null);
      setError('Glare removal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key, value) => {
    if (editMode === 'single') {
      // Immediate update
      eval('set' + key.charAt(0).toUpperCase() + key.slice(1))(value);
    } else {
      setStaged(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleApplyStaged = () => {
    setStrength(staged.strength);
    setVignetteStrength(staged.vignetteStrength);
    setWarmth(staged.warmth);
    setSaturation(staged.saturation);
    setSharpness(staged.sharpness);
    setFloorSharpness(staged.floorSharpness);
    setFloorMask(staged.floorMask);
  };

  const handleCancelStaged = () => {
    setStaged({
      strength,
      vignetteStrength,
      warmth,
      saturation,
      sharpness,
      floorSharpness,
      floorMask
    });
  };

  useEffect(() => {
    if (editMode === 'multiple') {
      setStaged({
        strength,
        vignetteStrength,
        warmth,
        saturation,
        sharpness,
        floorSharpness,
        floorMask
      });
    }
  }, [editMode]);

  const controlsProps = editMode === 'single'
    ? {
        strength, setStrength: v => handleParamChange('strength', v),
        vignetteStrength, setVignetteStrength: v => handleParamChange('vignetteStrength', v),
        warmth, setWarmth: v => handleParamChange('warmth', v),
        saturation, setSaturation: v => handleParamChange('saturation', v),
        sharpness, setSharpness: v => handleParamChange('sharpness', v),
        floorSharpness, setFloorSharpness: v => handleParamChange('floorSharpness', v),
        onRestoreDefaults: handleRestoreDefaults,
        disabled: loading
      }
    : {
        strength: staged.strength, setStrength: v => handleParamChange('strength', v),
        vignetteStrength: staged.vignetteStrength, setVignetteStrength: v => handleParamChange('vignetteStrength', v),
        warmth: staged.warmth, setWarmth: v => handleParamChange('warmth', v),
        saturation: staged.saturation, setSaturation: v => handleParamChange('saturation', v),
        sharpness: staged.sharpness, setSharpness: v => handleParamChange('sharpness', v),
        floorSharpness: staged.floorSharpness, setFloorSharpness: v => handleParamChange('floorSharpness', v),
        onRestoreDefaults: handleRestoreDefaults,
        disabled: loading
      };

  const handleCropAlign = (croppedDataUrl) => {
    setBeforeImg(croppedDataUrl);
    setCropStage(false);
    setHistory([]);
    setRedoStack([]);
    setAfterImg(null);
    setFile(null);
  };

  const pushHistory = (state) => setHistory(h => [...h, state]);
  const handleUndo = () => {
    if (history.length > 0) {
      setRedoStack(r => [
        { beforeImg, afterImg, strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, floorMask },
        ...r
      ]);
      const prev = history[history.length - 1];
      setBeforeImg(prev.beforeImg);
      setAfterImg(prev.afterImg);
      setStrength(prev.strength);
      setVignetteStrength(prev.vignetteStrength);
      setWarmth(prev.warmth);
      setSaturation(prev.saturation);
      setSharpness(prev.sharpness);
      setFloorSharpness(prev.floorSharpness);
      setFloorMask(prev.floorMask);
      setHistory(h => h.slice(0, -1));
    }
  };
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      pushHistory({ beforeImg, afterImg, strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, floorMask });
      setBeforeImg(next.beforeImg);
      setAfterImg(next.afterImg);
      setStrength(next.strength);
      setVignetteStrength(next.vignetteStrength);
      setWarmth(next.warmth);
      setSaturation(next.saturation);
      setSharpness(next.sharpness);
      setFloorSharpness(next.floorSharpness);
      setFloorMask(next.floorMask);
      setRedoStack(r => r.slice(1));
    }
  };

  // Premium AI Enhancement Handler
  const handlePremiumEnhance = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Simulate premium AI enhancement by passing a premium flag (or use a special endpoint in the future)
      const enhancedUrl = await enhanceImage(file, strength, vignetteStrength, warmth, saturation, sharpness, floorSharpness, false, floorMask, true);
      setAfterImg(enhancedUrl);
      setSuccess('Premium AI Enhancement applied!');
    } catch (e) {
      setAfterImg(null);
      setError('Premium enhancement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <div className="login-container">
          <div className="login-panel">
            <h2>Sign in</h2>
            <Auth onLogin={handleLogin} loading={loading} error={error} />
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`main-container ${theme}`}>
        <div className="topbar-controls">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        <button onClick={handleLogout} className="logout-btn top-right">Logout</button>
        <div className="controls-panel">
          <h1>Airbnb Photo Enhancer</h1>
          <p>Make your listings shine. Instantly enhance your real estate photos with AI-powered filters.</p>
          <DragDropUpload onUpload={handleUpload} theme={theme} loading={loading} />
          <ModeToggle mode={editMode} onChange={setEditMode} />
          <EnhancementControls {...controlsProps} />
          {editMode === 'multiple' && (
            <div style={{marginTop: 10, display: 'flex', gap: '10px'}}>
              <button className="action-btn" onClick={handleApplyStaged}>Apply</button>
              <button className="action-btn" onClick={handleCancelStaged}>Cancel</button>
            </div>
          )}
          <button onClick={() => setIsPremiumUser(true)} className="premium-btn">Become Premium (Demo)</button>
          <button onClick={() => {
            if (isPremiumUser) {
              handleFetchAnalytics();
            } else {
              setShowPremiumModal(true);
            }
          }} className="analytics-btn">
            Show Analytics {isPremiumUser ? '' : <span style={{color:'#d99d00',marginLeft:6}}>&#128274; Premium</span>}
          </button>
          <button onClick={handleRemoveGlare} className="glare-btn" disabled={!file || loading}>Remove Glare (Beta)</button>
          <button onClick={() => setSelectingFloor(true)} className="floor-btn">Select Floor Region</button>
          <button
            className="premium-btn"
            style={{width:'100%',marginTop:10,background:'#ffd700',color:'#333',fontWeight:700}}
            onClick={() => {
              if (isPremiumUser) {
                handlePremiumEnhance();
              } else {
                setShowPremiumModal(true);
              }
            }}
            disabled={!file || loading}
          >
            Premium AI Enhance {isPremiumUser ? '' : <span style={{color:'#d99d00',marginLeft:6}}>&#128274; Premium</span>}
          </button>
        </div>
        <div className="preview-panel">
          {/* Undo/Redo Controls */}
          <UndoRedoControls onUndo={handleUndo} onRedo={handleRedo} canUndo={history.length > 0} canRedo={redoStack.length > 0} />
          {/* Crop/Align before enhancement */}
          {beforeImg && cropStage && (
            <ImageCropAlign src={beforeImg} onCropAlign={handleCropAlign} />
          )}
          {/* Show crop/align button if image uploaded and not cropping */}
          {beforeImg && !cropStage && (
            <button style={{marginBottom: 10}} onClick={() => setCropStage(true)}>Crop / Align Image</button>
          )}
          <BeforeAfter beforeSrc={beforeImg} afterSrc={afterImg} showSplit={!!afterImg} theme={theme} />
          <button onClick={handleDownload} className="download-btn" disabled={!afterImg || loading}>Download Enhanced Image</button>
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
        </div>
      </div>
      {selectingFloor && (
        <div className="floor-selector-overlay">
          <div className="floor-selector-panel">
            <h3>Select Floor Region</h3>
            <FloorSelector imageUrl={beforeImg} onMaskChange={mask => setFloorMask(mask)} />
            <button onClick={() => setSelectingFloor(false)} className="done-btn">Done</button>
          </div>
        </div>
      )}
      {analytics && <div className="analytics-dashboard"><AnalyticsDashboard data={analytics} /></div>}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      <footer className="footer">
        &copy; {new Date().getFullYear()} Airbnb Photo Enhancer &mdash; Crafted with <span className="heart-icon">&#10084;</span> for hosts.
      </footer>
    </ThemeContext.Provider>
  );
}

export default App;
