/* global google */
import { useEffect, useCallback, useState } from 'react';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from "prop-types";
import { config } from '../config';
import { userService, checkServerHealth } from '../services/api';

const GoogleLogin = ({ setIsLogin, setUserData }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Modificar la función handleCredentialResponse
  const handleCredentialResponse = useCallback(async (response) => {
    setIsLoading(true);
    try {
      const data_decode = decodeToken(response.credential);
      console.log('Token decodificado:', data_decode);
      // Verificación del dominio de correo
      if (!data_decode.email.endsWith('@correounivalle.edu.co')) {
        alert('Por favor ingrese con el correo institucional de la Universidad del Valle');
        setIsLoading(false);
        return;
      }

      const authenticatedUser = {
        id: data_decode.sub,
        email: data_decode.email,
        name: data_decode.name,
        role: '',
      };

      // IMPORTANTE: Guardar el token y el email en localStorage para autenticación
      localStorage.setItem('google_token', response.credential);
      localStorage.setItem('email', data_decode.email);
      localStorage.setItem('user_id', data_decode.sub); // Guardar el ID inmediatamente
      
      // Verificar si el servidor está disponible antes de intentar guardar
      const serverAvailable = await checkServerHealth();
      
      if (serverAvailable) {
        try {
          const authResponse = await userService.authGoogle(response.credential);
          console.log('Respuesta de autenticación backend:', authResponse);
          const backendUser = authResponse?.userInfo;

          if (backendUser?.id) {
            authenticatedUser.id = backendUser.id;
            localStorage.setItem('user_id', backendUser.id);
          }

          if (backendUser?.email) {
            authenticatedUser.email = backendUser.email;
            localStorage.setItem('email', backendUser.email);
          }

          if (backendUser?.name) {
            authenticatedUser.name = backendUser.name;
          }

          if (backendUser?.role) {
            authenticatedUser.role = backendUser.role;
          }
        } catch (backendError) {
          console.warn('Error al autenticar usuario en backend:', backendError);

          // Fallback de compatibilidad con el flujo previo
          try {
            const backendResponse = await userService.saveUser(authenticatedUser);
            if (backendResponse?.userId) {
              authenticatedUser.id = backendResponse.userId;
              localStorage.setItem('user_id', backendResponse.userId);
            }
            if (backendResponse?.role) {
              authenticatedUser.role = backendResponse.role;
            }
          } catch (saveUserError) {
            console.warn('Error al guardar usuario en backend:', saveUserError);
          }
        }
      } else {
        console.warn('Servidor no disponible - continuando sin guardar en backend');
      }

      if (!authenticatedUser.role && data_decode.role) {
        authenticatedUser.role = data_decode.role;
      }

      localStorage.setItem('user_data', JSON.stringify(authenticatedUser));
      setUserData(authenticatedUser);
      setIsLogin(true);

      Cookies.set('token', JSON.stringify(data_decode), { 
        expires: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000) 
      });

      navigate('/'); 
    } catch (error) {
      console.error('Error en el login:', error);
      alert(error.response?.data?.message || 'Error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setIsLogin, setUserData]);

  useEffect(() => {
    let script;
    const initializeGoogleAuth = () => {
      try {
        google.accounts.id.initialize({
          client_id: config.GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          hosted_domain: 'correounivalle.edu.co',
          auto_select: false, // Evitar selección automática para mejor rendimiento
          cancel_on_tap_outside: true
        });

        google.accounts.id.renderButton(
          document.getElementById("google-button-container"),
          { 
            theme: "outline", 
            size: "large", 
            type: "standard",
            shape: "rectangular",
            text: "signin_with",
            width: 300
          }
        );
      } catch (error) {
        console.log('Error inicializando Google Auth:', error);
      }
    };

    if (!document.getElementById('google-auth-script')) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true; // Agregar defer para mejor rendimiento
      script.id = 'google-auth-script';
      script.onload = initializeGoogleAuth;
      document.body.appendChild(script);
    } else {
      initializeGoogleAuth();
    }

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
      const googleButton = document.getElementById("google-button-container");
      if (googleButton) googleButton.innerHTML = '';
    };
  }, [handleCredentialResponse]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
      gap={2}
    >
      {isLoading && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Iniciando sesión...
          </Typography>
        </Box>
      )}
      <div id="google-button-container" style={{ minWidth: '300px' }}></div>
    </Box>
  );
};

GoogleLogin.propTypes = {
  setIsLogin: PropTypes.func.isRequired,
  setUserData: PropTypes.func.isRequired,
};

export default GoogleLogin;
