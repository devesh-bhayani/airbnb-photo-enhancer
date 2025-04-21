// api.js
// Helper functions to interact with backend API

const API_BASE = 'http://localhost:8000'; // Change if deploying

export async function enhanceImage(file, strength = 1.0, vignetteStrength = 0.5, warmth = 1.02, saturation = 1.10, sharpness = 1.0, floorSharpness = 1.0, removeGlare = false, floorMask = []) {
  // Upload image for enhancement
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enhancement_strength', strength);
  formData.append('vignette_strength', vignetteStrength);
  formData.append('warmth', warmth);
  formData.append('saturation', saturation);
  formData.append('sharpness', sharpness);
  formData.append('floor_sharpness', floorSharpness);
  formData.append('remove_glare', removeGlare);
  // Send floor mask as JSON if present
  if (floorMask && floorMask.length > 2) {
    formData.append('floor_mask', JSON.stringify(floorMask));
  }
  const response = await fetch(`${API_BASE}/enhance`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Enhancement failed');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function login(username, password) {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    body: formData,
  });
  console.log('Login response:', response);
  return response.json();
}

export async function fetchAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`);
  return response.json();
}
