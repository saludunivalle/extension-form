import Cookies from 'js-cookie';

export const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

/**
 * Obtiene el token de autenticación principal (token de sesión propio o fallback de google)
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('google_token');
};

/**
 * Alias de compatibilidad
 */
export const getStoredGoogleToken = getAuthToken;

/**
 * Verifica si el token ha expirado según su payload JWT (exp en segundos).
 */
export const isTokenExpired = (token = getAuthToken()) => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  // Margen de 30 segundos
  return payload.exp * 1000 <= Date.now() + 30_000;
};

/**
 * Alias de compatibilidad
 */
export const isGoogleTokenExpired = isTokenExpired;

/**
 * Guarda la sesión completa en localStorage y Cookie con vigencia de 30 días.
 */
export const saveAuthSession = (sessionToken, userData) => {
  if (sessionToken) {
    localStorage.setItem('auth_token', sessionToken);
  }
  if (userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
    if (userData.id) localStorage.setItem('user_id', userData.id);
    if (userData.email) localStorage.setItem('email', userData.email);

    // Cookie persistente por 30 días
    Cookies.set('token', JSON.stringify(userData), { expires: 30 });
  }
};

/**
 * Limpia todos los datos de la sesión almacenados en el navegador.
 */
export const clearAuthSession = () => {
  Cookies.remove('token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('google_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
};

export const redirectToLogin = () => {
  clearAuthSession();
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};
