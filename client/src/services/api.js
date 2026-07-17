// Centralized API configuration
const API_BASE_URL = 'https://audio-analysis-3wya.onrender.com';

/**
 * Sends an audio file to the deployed FastAPI backend for analysis.
 * 
 * @param {File} file - The audio file to upload and analyze.
 * @returns {Promise<Object>} The JSON analysis result from Gemini.
 */
export async function analyzeAudio(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/analyze-audio`, {
    method: 'POST',
    body: formData,
    // Note: Do NOT set the 'Content-Type' header here.
    // The browser needs to automatically set it with the multipart boundary.
  });

  if (!response.ok) {
    let errorMessage = 'Upload failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Fallback if the server didn't respond with valid JSON
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}