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

// ─── Users & Profile ──────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * GET /users/me  (requires Bearer token)
   * @returns {Promise<{ success, data: { user } }>}
   */
  getMyProfile: (token) =>
    request('/users/me', { method: 'GET' }, token),

  /**
   * PATCH /users/me  (requires Bearer token)
   * @param {object} payload - { fullName?: string, phone?: string }
   * @returns {Promise<{ success, message, data: { user } }>}
   */
  updateMyProfile: (payload, token) =>
    request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token),

  /**
   * GET /users/:id  (requires Bearer token)
   * @returns {Promise<{ success, data: { user } }>}
   */
  getUserById: (id, token) =>
    request(`/users/${id}`, { method: 'GET' }, token),
};

// ─── Vehicles ────────────────────────────────────────────────────────────────

export const vehiclesApi = {
  /**
   * GET /vehicles  (requires Bearer token)
   * @returns {Promise<{ success, count, data: { vehicles } }>}
   */
  getMyVehicles: (token) =>
    request('/vehicles', { method: 'GET' }, token),

  /**
   * GET /vehicles/:id  (requires Bearer token)
   * @returns {Promise<{ success, data: { vehicle } }>}
   */
  getVehicleById: (id, token) =>
    request(`/vehicles/${id}`, { method: 'GET' }, token),

  /**
   * POST /vehicles  (requires Bearer token)
   * @param {object} payload - { plateNumber: string, vehicleType: string, makeModel?: string }
   * @returns {Promise<{ success, message, data: { vehicle } }>}
   */
  createVehicle: (payload, token) =>
    request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),

  /**
   * PATCH /vehicles/:id  (requires Bearer token)
   * @param {string|number} id
   * @param {object} payload - { plateNumber?: string, vehicleType?: string, makeModel?: string }
   * @returns {Promise<{ success, message, data: { vehicle } }>}
   */
  updateVehicle: (id, payload, token) =>
    request(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token),

  /**
   * DELETE /vehicles/:id  (requires Bearer token)
   * @param {string|number} id
   * @returns {Promise<{ success, message, data }>}
   */
  deleteVehicle: (id, token) =>
    request(`/vehicles/${id}`, { method: 'DELETE' }, token),
};

// ─── Parking Lots & Slots ────────────────────────────────────────────────────

export const parkingApi = {
  // Lots
  getLots: (params = {}, token = null) => {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? `?${searchParams}` : '';
    return request(`/parking/lots${query}`, { method: 'GET' }, token);
  },

  getLotById: (lotId, token = null) =>
    request(`/parking/lots/${lotId}`, { method: 'GET' }, token),

  getSlotsInLot: (lotId, token = null) =>
    request(`/parking/lots/${lotId}/slots`, { method: 'GET' }, token),

  createLot: (payload, token) =>
    request('/parking/lots', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),

  updateLot: (lotId, payload, token) =>
    request(`/parking/lots/${lotId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token),

  deleteLot: (lotId, token) =>
    request(`/parking/lots/${lotId}`, { method: 'DELETE' }, token),

  // Slots
  getSlots: (params = {}, token = null) => {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? `?${searchParams}` : '';
    return request(`/parking/slots${query}`, { method: 'GET' }, token);
  },

  getSlotById: (slotId, token = null) =>
    request(`/parking/slots/${slotId}`, { method: 'GET' }, token),

  createSlot: (payload, token) =>
    request('/parking/slots', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),

  updateSlot: (slotId, payload, token) =>
    request(`/parking/slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token),

  deleteSlot: (slotId, token) =>
    request(`/parking/slots/${slotId}`, { method: 'DELETE' }, token),

  // Day 12: Availability Queries
  getAvailableSlots: (params = {}, token = null) => {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? `?${searchParams}` : '';
    return request(`/parking/slots/availability${query}`, { method: 'GET' }, token);
  },

  checkSlotAvailability: (slotId, params = {}, token = null) => {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? `?${searchParams}` : '';
    return request(`/parking/slots/${slotId}/availability${query}`, { method: 'GET' }, token);
  },
};

// ─── Reservations ────────────────────────────────────────────────────────────

export const reservationsApi = {
  getReservations: (params = {}, token) => {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? `?${searchParams}` : '';
    return request(`/reservations${query}`, { method: 'GET' }, token);
  },

  getMyReservations: (token) =>
    request('/reservations/my', { method: 'GET' }, token),

  getReservationById: (id, token) =>
    request(`/reservations/${id}`, { method: 'GET' }, token),

  createReservation: (payload, token) =>
    request('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),

  cancelReservation: (id, token) =>
    request(`/reservations/${id}/cancel`, {
      method: 'PATCH',
    }, token),

  updateReservationStatus: (id, status, token) =>
    request(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token),
};




