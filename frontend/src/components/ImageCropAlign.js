import React, { useRef, useState, useEffect } from 'react';

/**
 * ImageCropAlign allows cropping and alignment before enhancement.
 * Props:
 *   src: image URL
 *   onCropAlign: function(croppedDataUrl)
 */
export default function ImageCropAlign({ src, onCropAlign }) {
  const containerRef = useRef();
  const canvasRef = useRef();
  const imgRef = useRef();
  const [imgDims, setImgDims] = useState({ width: 300, height: 200 });
  const [naturalDims, setNaturalDims] = useState({ width: 300, height: 200 });
  const [crop, setCrop] = useState({ x: 50, y: 20, w: 200, h: 120 });
  const [drag, setDrag] = useState(null);
  const [resizing, setResizing] = useState(null); // {corner: 'tl'|'tr'|'bl'|'br', startX, startY, startCrop}
  const [align, setAlign] = useState('center');
  const [confirming, setConfirming] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      setImgDims({ width: img.offsetWidth, height: img.offsetHeight });
      setNaturalDims({ width: img.naturalWidth, height: img.naturalHeight });
    }
  }, [src, align]);

  // Improved event handling: use window listeners for mousemove/mouseup for smoothness
  useEffect(() => {
    if (!mouseDown) return;
    const handleMove = e => {
      const bounding = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - bounding.left;
      const offsetY = e.clientY - bounding.top;
      if (drag) {
        let newX = offsetX - drag.x;
        let newY = offsetY - drag.y;
        newX = Math.max(0, Math.min(imgDims.width - crop.w, newX));
        newY = Math.max(0, Math.min(imgDims.height - crop.h, newY));
        setCrop(c => ({ ...c, x: newX, y: newY }));
      } else if (resizing) {
        const dx = offsetX - resizing.startX;
        const dy = offsetY - resizing.startY;
        let { x, y, w, h } = resizing.startCrop;
        if (resizing.corner === 'tl') {
          x = Math.max(0, x + dx);
          y = Math.max(0, y + dy);
          w = w - dx;
          h = h - dy;
        } else if (resizing.corner === 'tr') {
          y = Math.max(0, y + dy);
          w = w + dx;
          h = h - dy;
        } else if (resizing.corner === 'bl') {
          x = Math.max(0, x + dx);
          w = w - dx;
          h = h + dy;
        } else if (resizing.corner === 'br') {
          w = w + dx;
          h = h + dy;
        }
        w = Math.max(32, Math.min(imgDims.width - x, w));
        h = Math.max(32, Math.min(imgDims.height - y, h));
        setCrop({ x, y, w, h });
      }
    };
    const handleUp = () => {
      setDrag(null);
      setResizing(null);
      setMouseDown(false);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [mouseDown, drag, resizing, imgDims, crop]);

  const handleMouseDown = e => {
    e.preventDefault();
    if (e.target.dataset.corner) {
      setResizing({
        corner: e.target.dataset.corner,
        startX: e.nativeEvent.offsetX,
        startY: e.nativeEvent.offsetY,
        startCrop: { ...crop },
      });
      setMouseDown(true);
    } else {
      setDrag({ x: e.nativeEvent.offsetX - crop.x, y: e.nativeEvent.offsetY - crop.y });
      setMouseDown(true);
    }
  };

  const handleCrop = () => setConfirming(true);
  const handleConfirmCrop = () => {
    // Map crop rectangle from displayed image to natural image size
    const scaleX = naturalDims.width / imgDims.width;
    const scaleY = naturalDims.height / imgDims.height;
    const sx = Math.round(crop.x * scaleX);
    const sy = Math.round(crop.y * scaleY);
    const sw = Math.round(crop.w * scaleX);
    const sh = Math.round(crop.h * scaleY);
    const canvas = canvasRef.current;
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, sw, sh);
    onCropAlign(canvas.toDataURL());
  };

  const handleAlign = dir => setAlign(dir);

  return (
    <div style={{ marginBottom: 14 }}>
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', userSelect: 'none', background: '#222', width: 300, height: 200, overflow: 'hidden' }}>
        <img
          src={src}
          ref={imgRef}
          alt="To crop"
          style={{ width: 300, height: 200, objectFit: 'cover', objectPosition: align }}
          draggable={false}
        />
        {/* Crop rectangle overlay */}
        <div
          style={{
            position: 'absolute',
            left: crop.x,
            top: crop.y,
            width: crop.w,
            height: crop.h,
            border: '2px dashed #2d7ff9',
            cursor: drag ? 'grabbing' : (resizing ? 'nwse-resize' : 'move'),
            background: 'rgba(45,127,249,0.05)',
            zIndex: 2,
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Resize handles */}
          <div data-corner="tl" style={{ position: 'absolute', left: -6, top: -6, width: 12, height: 12, background: '#2d7ff9', borderRadius: 6, cursor: 'nwse-resize' }} />
          <div data-corner="tr" style={{ position: 'absolute', right: -6, top: -6, width: 12, height: 12, background: '#2d7ff9', borderRadius: 6, cursor: 'nesw-resize' }} />
          <div data-corner="bl" style={{ position: 'absolute', left: -6, bottom: -6, width: 12, height: 12, background: '#2d7ff9', borderRadius: 6, cursor: 'nesw-resize' }} />
          <div data-corner="br" style={{ position: 'absolute', right: -6, bottom: -6, width: 12, height: 12, background: '#2d7ff9', borderRadius: 6, cursor: 'nwse-resize' }} />
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={() => handleAlign('left')}>Align Left</button>
        <button onClick={() => handleAlign('center')}>Align Center</button>
        <button onClick={() => handleAlign('right')}>Align Right</button>
        <button onClick={handleCrop} style={{ marginLeft: 12 }}>Crop</button>
      </div>
      {confirming && (
        <div style={{ marginTop: 16, background: '#fffbe7', border: '1px solid #e0b800', padding: 14, borderRadius: 8 }}>
          <div style={{ marginBottom: 10 }}>Are you sure you want to crop the image as selected?</div>
          <button onClick={handleConfirmCrop} style={{ background: '#2d7ff9', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '5px 18px', marginRight: 8 }}>Yes, Crop</button>
          <button onClick={() => setConfirming(false)} style={{ background: '#eee', color: '#444', fontWeight: 700, border: 'none', borderRadius: 6, padding: '5px 18px' }}>Cancel</button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
