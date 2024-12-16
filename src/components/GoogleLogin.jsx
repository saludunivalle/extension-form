import React, { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

const GoogleLogin = ({ setIsLogin, setUserInfo }) => {
  const navigate = useNavigate();
  const [showLoginButton, setShowLoginButton] = useState(true);

  const handleCredentialResponse = async (response) => {
    const data_decode = decodeToken(response.credential);

    try {
      const userInfo = {
        id: data_decode.sub,
        email: data_decode.email,
        name: data_decode.name,
      };

      const userResponse = await axios.post('https://siac-extension-form.vercel.app/saveUser', userInfo);

      console.log('Respuesta del servidor al guardar usuario:', userResponse.data);

      setUserInfo(userInfo);
      setIsLogin(true);

      const expiracion = new Date();
      expiracion.setDate(expiracion.getDate() + 5);
      Cookies.set('token', JSON.stringify(data_decode), { expires: expiracion });
      setShowLoginButton(false);
      navigate('/'); 
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const _get_auth = async () => {
    try {
      google.accounts.id.initialize({
        client_id: '340874428494-ot9uprkvvq4ha529arl97e9mehfojm5b.apps.googleusercontent.com',
        callback: (response) => handleCredentialResponse(response),
      });

      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", text: "login_with_google" }
      );

      google.accounts.id.prompt();
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    const _root = document.getElementById('root');
    const script_id = document.getElementById('google-login');

    if (script_id) {
      _root.removeChild(script_id);
    }

    const _script = document.createElement('script');
    _script.src = 'https://accounts.google.com/gsi/client';
    _script.async = true;
    _script.id = 'google-login';
    _script.defer = true;
    _root.appendChild(_script);

    _script.onload = _get_auth;
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      {showLoginButton && <div id="buttonDiv"></div>}
    </Box>
  );
};

export default GoogleLogin;
