/**
 * ParkEase API Client
 * Centralised fetch wrapper that attaches Bearer token and handles JSON responses.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';


/**
 * Core request helper.
 * @param {string} endpoint  - e.g. '/auth/register'
 * @param {object} options   - fetch options (method, body, headers…)
 * @param {string|null} token - JWT to send as Bearer (optional)
 * @returns {Promise<object>} - parsed JSON response
 * @throws  {Error}          - with .message from server or generic network error
 */
async function request(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unexpected server response. Please try again.');
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /auth/register
   * @returns {Promise<{ success, data: { user, token } }>}
   */
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * POST /auth/login
   * @returns {Promise<{ success, data: { user, token } }>}
   */
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * GET /auth/me  (requires Bearer token)
   * @returns {Promise<{ success, data: { user } }>}
   */
  getMe: (token) =>
    request('/auth/me', { method: 'GET' }, token),
};
