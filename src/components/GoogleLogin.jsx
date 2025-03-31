/* global google */
import { useEffect, useCallback } from 'react';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PropTypes from "prop-types";

const GoogleLogin = ({ setIsLogin, setUserInfo }) => {
  const navigate = useNavigate();

  // Modificar la función handleCredentialResponse
  const handleCredentialResponse = useCallback(async (response) => {
    try {
      const data_decode = decodeToken(response.credential);
      
      // Verificación del dominio de correo
      if (!data_decode.email.endsWith('@correounivalle.edu.co')) {
        alert('Por favor ingrese con el correo institucional de la Universidad del Valle');
        return;
      }

      const userInfo = {
        id: data_decode.sub,
        email: data_decode.email,
        name: data_decode.name,
      };

      // IMPORTANTE: Guardar el token y el email en localStorage para autenticación
      localStorage.setItem('google_token', response.credential);
      localStorage.setItem('email', data_decode.email);
      localStorage.setItem('user_id', data_decode.sub); // Guardar el ID inmediatamente
      
      // Guardar usuario en el backend
      const backendResponse = await axios.post('https://siac-extension-server.vercel.app/saveUser', userInfo);
      
      // Si el backend devuelve un ID específico, actualizarlo
      if (backendResponse.data?.userId) {
        localStorage.setItem('user_id', backendResponse.data.userId);
      }

      setUserInfo(userInfo);
      setIsLogin(true);

      Cookies.set('token', JSON.stringify(data_decode), { 
        expires: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000) 
      });

      navigate('/'); 
    } catch (error) {
      console.error('Error en el login:', error);
      alert(error.response?.data?.message || 'Error en la autenticación');
    }
  }, [navigate, setIsLogin, setUserInfo]);

  // Después de una autenticación exitosa con Google
  const handleGoogleSignIn = async (response) => {
    try {
      // Guardar el token de Google en localStorage
      localStorage.setItem('google_token', response.credential);
      localStorage.setItem('email', response.email);
      
      // Si tienes un ID de usuario después de verificar en tu backend
      if (backendResponse.data?.userId) {
        localStorage.setItem('user_id', backendResponse.data.userId);
      }
      
      // Continuar con el proceso de login...
    } catch (error) {
      console.error('Error en autenticación:', error);
    }
  };

  useEffect(() => {
    let script;
    const initializeGoogleAuth = () => {
      try {
        google.accounts.id.initialize({
          client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          hosted_domain: 'correounivalle.edu.co'
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
    >
      <div id="google-button-container" style={{ minWidth: '300px' }}></div>
    </Box>
  );
};

GoogleLogin.propTypes = {
  setIsLogin: PropTypes.func.isRequired,
  setUserInfo: PropTypes.func.isRequired,
};

export default GoogleLogin;
