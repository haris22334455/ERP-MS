// ─────────────────────────────────────────────────────────────────
// API Base URL Configuration
//
// LOCAL DEV:    Automatically uses window.location.hostname:5000
// PRODUCTION:   Set REACT_APP_API_URL in Vercel environment variables
//               e.g. REACT_APP_API_URL=https://erp-backend.up.railway.app
// ─────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : `http://${window.location.hostname}:5000`;

export default API_BASE_URL;
