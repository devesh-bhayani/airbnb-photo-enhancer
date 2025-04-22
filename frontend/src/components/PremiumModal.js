// PremiumModal.js
import React from 'react';
import './PremiumModal.css';

export default function PremiumModal({ onClose }) {
  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <h2>Premium Feature</h2>
        <p>This feature is available for premium users only.</p>
        <button onClick={onClose} className="close-btn">Close</button>
        {/* In the future: Add payment/upgrade button here */}
      </div>
    </div>
  );
}
