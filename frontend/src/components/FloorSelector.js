import React, { useRef, useState } from 'react';

/**
 * FloorSelector allows the user to draw a polygon over the image to select the floor region.
 * Props:
 *   imageUrl: string (image to annotate)
 *   onMaskChange: function (mask as array of points)
 */
const SNAP_DISTANCE = 14; // pixels (image space)

export default function FloorSelector({ imageUrl, onMaskChange }) {
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const imgRef = useRef();

  // Helper: distance between two points
  const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  // Add point on click (with snapping to first point)
  const handleImageClick = (e) => {
    if (dragIndex !== null) return;
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imgRef.current.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * imgRef.current.naturalHeight;
    let newPoint = { x, y };
    // Snap to first point if close
    if (points.length > 1 && dist(newPoint, points[0]) < SNAP_DISTANCE) {
      newPoint = { ...points[0] };
    }
    setPoints([...points, newPoint]);
    setIsDrawing(true);
  };

  // Drag logic (with snapping to first point)
  const handleMouseDown = (i, e) => {
    e.stopPropagation();
    setDragIndex(i);
  };
  const handleMouseMove = (e) => {
    if (dragIndex === null || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * imgRef.current.naturalWidth;
    let y = ((e.clientY - rect.top) / rect.height) * imgRef.current.naturalHeight;
    let newPoint = { x, y };
    // Snap to first point if dragging last point and close
    if (points.length > 2 && dragIndex === points.length - 1 && dist(newPoint, points[0]) < SNAP_DISTANCE) {
      newPoint = { ...points[0] };
    }
    setPoints(points => points.map((p, idx) => idx === dragIndex ? newPoint : p));
  };
  const handleMouseUp = () => {
    setDragIndex(null);
  };

  // Undo last point
  const handleUndo = () => {
    setPoints(points => points.slice(0, -1));
    setIsDrawing(points.length > 1);
  };

  // Finish polygon
  const handleFinish = () => {
    setIsDrawing(false);
    if (points.length > 2) {
      onMaskChange(points);
    }
  };

  // Reset
  const handleReset = () => {
    setPoints([]);
    setIsDrawing(false);
    onMaskChange([]);
  };

  // Draw overlay polygon and points
  const renderPolygon = () => {
    if (!imgRef.current) return null;
    const width = imgRef.current.width;
    const height = imgRef.current.height;
    if (points.length === 0) return null;
    const pointsAttr = points.map(p => `${p.x * width / imgRef.current.naturalWidth},${p.y * height / imgRef.current.naturalHeight}`).join(' ');
    return (
      <svg
        style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 2 }}
        width={width}
        height={height}
      >
        {points.length > 1 && (
          <polyline points={pointsAttr} fill="rgba(255,200,0,0.18)" stroke="#ffb300" strokeWidth={2} />
        )}
        {points.length > 2 && (
          <polygon points={pointsAttr} fill="rgba(255,200,0,0.28)" stroke="#ffb300" strokeWidth={2} />
        )}
        {points.map((p, i) => (
          <g key={i} style={{ pointerEvents: 'auto' }}>
            <circle
              cx={p.x * width / imgRef.current.naturalWidth}
              cy={p.y * height / imgRef.current.naturalHeight}
              r={9}
              fill={dragIndex === i ? '#ffb300' : '#fff'}
              stroke="#ffb300"
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
              onMouseDown={e => handleMouseDown(i, e)}
            />
            <text
              x={p.x * width / imgRef.current.naturalWidth + 10}
              y={p.y * height / imgRef.current.naturalHeight - 10}
              fill="#222"
              fontSize={14}
              fontWeight={700}
              stroke="#fff"
              strokeWidth={0.6}
            >{i + 1}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={imageUrl}
        ref={imgRef}
        style={{ maxWidth: 400, maxHeight: 300, border: '2px dashed #ffb300', cursor: 'crosshair', display: 'block' }}
        onClick={handleImageClick}
        alt="Select floor"
        draggable={false}
      />
      {renderPolygon()}
      <div style={{ marginTop: 8 }}>
        <button onClick={handleFinish} disabled={points.length < 3 || !isDrawing}>Finish Selection</button>
        <button onClick={handleUndo} disabled={points.length === 0}>Undo</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
        Click to mark floor corners. Drag points to adjust. Undo removes last point.<br />
        <span style={{ color: '#ffb300', fontWeight: 600 }}>{points.length} point{points.length === 1 ? '' : 's'} selected</span>
        <br /><span style={{ color: '#888', fontSize: 12 }}>Points snap to the first point when close to help close the region.</span>
      </div>
    </div>
  );
}
