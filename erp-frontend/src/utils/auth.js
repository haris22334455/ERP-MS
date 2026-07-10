/**
 * Decodes the JWT token and extracts the user role.
 * 
 * @param {string} token - The JWT token from localStorage
 * @returns {string|null} - The user role (e.g., 'admin', 'staff', 'shopkeeper') or null if invalid
 */
export const decodeJwtRole = (token) => {
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.role || null;
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
};
