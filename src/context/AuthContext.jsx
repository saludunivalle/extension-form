import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';
import { setAuthHeader as setClientAuthHeader } from '../services/api/client';
import axios from 'axios';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../config/constants';
import { syncHeaders } from '../services/api/client';
// Añadir imports para el diálogo
import { 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
  Button, Box, CircularProgress 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';

/**
 * Contexto para gestionar la autenticación a través de la aplicación
 */
const AuthContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Contexto de autenticación con métodos y estado
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

/**
 * Provider que encapsula la lógica de autenticación
 */
export const AuthProvider = ({ children }) => {
  // Unificar el estado de autenticación en un solo objeto para mejor consistencia
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userData: null,
    isLoading: true
  });
  
  // Estados para el diálogo de salida
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentFormNumber, setCurrentFormNumber] = useState(1); // Para saber qué reporte generar

  /**
   * Establece el token de autenticación en las peticiones axios
   * @param {string} userId - ID del usuario para auth headers
   */
  const setAuthHeader = useCallback((userId) => {
    if (userId) {
      console.log("🔐 Configurando header de autenticación con ID:", userId);
      
      // Configurar en ambas instancias de axios
      axios.defaults.headers.common['X-User-Id'] = userId;
      
      // Usar la función del cliente para configurar apiClient
      setClientAuthHeader(userId);
    } else {
      delete axios.defaults.headers.common['X-User-Id'];
      setClientAuthHeader(null);
    }
  }, []);

  /**
   * Guarda el token en cookies y establece el header
   * @param {Object} tokenData - Datos del token a guardar
   */
  const setAuthToken = useCallback((tokenData) => {
    console.log("💾 Guardando token de autenticación");
    // Almacenar token en cookies (5 días de expiración)
    Cookies.set('token', JSON.stringify(tokenData), { 
      expires: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000) 
    });
    
    // Establecer header para peticiones futuras
    if (tokenData && tokenData.sub) {
      setAuthHeader(tokenData.sub);
    }
  }, [setAuthHeader]);

  /**
   * Guarda usuario en el servidor
   * @param {Object} userData - Datos del usuario a guardar
   */
  const saveUser = useCallback(async (userData) => {
    console.log("👤 Guardando información de usuario en servidor");
    try {
      await axios.post(`${API_BASE_URL}/saveUser`, userData);
      console.log("✅ Usuario guardado exitosamente");
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
      // No lanzar error para que no interrumpa el flujo de autenticación
    }
  }, []);

  /**
   * Actualiza el estado de autenticación basado en el token almacenado
   */
  useEffect(() => {
    const checkAuth = () => {
      console.log("🔍 Verificando token existente...");
      const token = Cookies.get('token');
      
      if (token) {
        try {
          const tokenData = JSON.parse(token);
          console.log("✅ Token encontrado:", tokenData.email);
          
          // Usar estructura de datos consistente en toda la app
          const userData = {
            id: tokenData.sub,            // ID para API
            id_usuario: tokenData.sub,    // ID para backwards compatibility
            email: tokenData.email,
            name: tokenData.name
          };
          
          setAuthHeader(tokenData.sub);  // Establecer para futuras peticiones
          
          setAuthState({
            isAuthenticated: true,
            userData: userData,
            isLoading: false
          });
          syncHeaders();
        } catch (error) {
          console.error("❌ Error al procesar token:", error);
          logout(); // Limpiar estado si el token es inválido
        }
      } else {
        console.log("⚠️ No se encontró token");
        setAuthState({
          isAuthenticated: false,
          userData: null,
          isLoading: false
        });
      }
    };
    
    checkAuth();
  }, [setAuthHeader]);

  /**
   * Procesa la respuesta de Google y autentica al usuario
   */
  const loginWithGoogle = useCallback(async (response) => {
    try {
      console.log("🔐 Procesando inicio de sesión con Google");
      const data_decode = decodeToken(response.credential);
      
      // Validar dominio de correo institucional
      if (!data_decode.email.endsWith('@correounivalle.edu.co')) {
        console.error("❌ Correo no institucional:", data_decode.email);
        throw new Error('Por favor ingrese con el correo institucional de la Universidad del Valle');
      }

      // Usar estructura de datos consistente
      const userInfo = {
        id: data_decode.sub,
        id_usuario: data_decode.sub,  // Mantener compatibilidad con código existente
        email: data_decode.email,
        name: data_decode.name,
      };

      // Guardar usuario en el servidor
      await saveUser(userInfo);
      
      // Guardar token y configurar headers
      setAuthToken(data_decode);

      // Actualizar estado local
      setAuthState({
        isAuthenticated: true,
        userData: userInfo,
        isLoading: false
      });
      
      console.log("✅ Inicio de sesión exitoso:", userInfo.email);
      return userInfo;
    } catch (error) {
      console.error('❌ Error en la autenticación:', error);
      throw error;
    }
  }, [saveUser, setAuthToken]);

  /**
   * Cierra la sesión del usuario
   */
  const logout = useCallback(() => {
    console.log("🚪 Cerrando sesión");
    // Eliminar cookie
    Cookies.remove('token');
    
    // Eliminar headers de autenticación
    setAuthHeader(null);
    
    // Limpiar estado
    setAuthState({
      isAuthenticated: false,
      userData: null,
      isLoading: false
    });
    
    console.log("✅ Sesión cerrada");
  }, [setAuthHeader]);

  /**
   * Verifica si el token del usuario sigue siendo válido
   */
  const verifyToken = useCallback(async () => {
    console.log("🔄 Verificando validez del token");
    const token = Cookies.get('token');
    if (!token) {
      console.log("❌ No hay token para verificar");
      logout();
      return false;
    }

    try {
      // Por ahora solo verificamos que el token exista y sea parseable
      const tokenData = JSON.parse(token);
      console.log("✅ Token válido para:", tokenData.email);
      return true;
    } catch (error) {
      console.error('❌ Error al verificar token:', error);
      logout();
      return false;
    }
  }, [logout]);

  /**
   * Abre el diálogo de salida
   * @param {number} formNumber - Número del formulario actual (para generar el reporte correcto)
   */
  const handleExitClick = useCallback((formNumber = 1) => {
    setCurrentFormNumber(formNumber);
    setShowExitDialog(true);
  }, []);

  /**
   * Cierra el diálogo de salida
   */
  const handleCloseExitDialog = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  /**
   * Genera el reporte del formulario actual
   */
  const handleGenerateAndExit = useCallback(async () => {
    try {
      setIsGeneratingReport(true);
      const idSolicitud = localStorage.getItem('id_solicitud');
      
      // Llamar a la API para generar el reporte
      const response = await axios.post(`${API_BASE_URL}/generateReport`, {
        solicitudId: idSolicitud,
        formNumber: currentFormNumber
      });
      
      // Si hay un link en la respuesta, abrirlo
      if (response.data?.link) {
        window.open(response.data.link, '_blank');
      }
      
      // Redirigir al inicio
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Error al generar el reporte:', error);
      alert('Hubo un problema al generar el reporte');
    } finally {
      setIsGeneratingReport(false);
      setShowExitDialog(false);
    }
  }, [currentFormNumber]);

  // Proporcionar los valores y métodos del contexto
  const value = {
    ...authState,  // Descomponer para mantener compatibilidad (isAuthenticated, userData, isLoading)
    handleGoogleResponse: loginWithGoogle,  // Mantener nombre para compatibilidad
    loginWithGoogle,  // Nuevo nombre más descriptivo
    logout,
    verifyToken,
    // Añadir funciones para el diálogo
    handleExitClick,
    handleCloseExitDialog,
    showExitDialog,
    isGeneratingReport,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Diálogo de salida */}
      <Dialog 
        open={showExitDialog} 
        onClose={handleCloseExitDialog}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: '320px',
            maxWidth: '450px',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #f0f0f0', 
          pb: 2,
          backgroundColor: '#f9f9f9',
          display: 'flex',
          alignItems: 'center'
        }}>
          <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
          Formulario Completado
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Los datos del formulario han sido guardados correctamente. ¿Qué desea hacer a continuación?
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          p: 2,
          borderTop: '1px solid #f0f0f0',
          gap: 1
        }}>
          <Button onClick={() => window.location.href = '/'} color="secondary" variant="outlined">
            Salir
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={handleGenerateAndExit} 
              color="primary" 
              variant="contained"
              disabled={isGeneratingReport}
              startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
            >
              {isGeneratingReport ? 'Generando...' : 'Generar reporte y salir'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;