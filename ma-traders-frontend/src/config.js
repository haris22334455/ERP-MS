// Automatically detect the API URL based on the current browser address
const hostname = window.location.hostname;

// If we are on localhost, use localhost. If on a network IP, use that IP.
// We assume the backend is always on port 5000.
const API_BASE_URL = `http://${hostname}:5000`;

export default API_BASE_URL;
