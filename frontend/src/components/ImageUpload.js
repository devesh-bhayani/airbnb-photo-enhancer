// ImageUpload.js
// Component for uploading images (single & batch). Future: Add drag & drop, batch upload, etc.
import React, { useState } from 'react';

function ImageUpload({ onUpload }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = () => {
    // TODO: Implement upload logic (call backend API)
    if (onUpload) onUpload(selectedFiles);
  };

  return (
    <div>
      <h3>Upload Property Photos</h3>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {/* Future: Show upload progress, batch preview, etc. */}
    </div>
  );
}

export default ImageUpload;
