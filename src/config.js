// Configuración de la aplicación
export const config = {
  // URL de la API - en desarrollo usa localhost, en producción usa Vercel
  API_URL: import.meta.env.VITE_API_URL || (
    import.meta.env.DEV 
      ? 'http://localhost:3001' 
      : 'https://siac-extension-server.vercel.app'
  ),
  
  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '199688357069-hoo21kd8p8c1iolqm5imf14qb7306mgc.apps.googleusercontent.com',
  
  // Configuración de timeout para requests
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Configuración de CORS
  CORS_OPTIONS: {
    credentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  }
}; 