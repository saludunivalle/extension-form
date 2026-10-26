import Cookies from 'js-cookie';

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getStoredGoogleToken = () => localStorage.getItem('google_token');

export const isGoogleTokenExpired = (token = getStoredGoogleToken()) => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  // Margen pequeño para evitar enviar tokens que expiran durante la petición.
  return payload.exp * 1000 <= Date.now() + 30_000;
};

export const clearAuthSession = () => {
  Cookies.remove('token');
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
