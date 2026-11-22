import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FormPage from './pages/FormPage';
import Dashboard from './components/Dashboard';
import ResultsPage from './pages/ResultsPage';
import GoogleLogin from './components/GoogleLogin';
import Layout from './components/Layout'; 
import Cookies from 'js-cookie';
import {config} from './config';
import { clearAuthSession, getAuthToken, isTokenExpired } from './services/authToken';
import { userService } from './services/api';
function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState();

  const syncUserFromSession = () => {
    const authToken = getAuthToken();
    const savedUserData = localStorage.getItem('user_data');
    let user = null;

    if (savedUserData) {
      try {
        user = JSON.parse(savedUserData);
      } catch (e) {
        console.error('Error al parsear user_data:', e);
      }
    }

    if (!user) {
      const token = Cookies.get('token');
      if (token) {
        try {
          const decodedToken = JSON.parse(token);
          user = decodedToken.sub
            ? {
                id: decodedToken.sub,
                name: decodedToken.name,
                email: decodedToken.email,
                role: decodedToken.role || ''
              }
            : decodedToken;
        } catch (e) {
          console.error('Error al parsear token de cookie:', e);
        }
      }
    }

    if (authToken && user && !isTokenExpired(authToken)) {
      setIsLogged(true);
      setUserData(user);

      // Verificación pasiva en el backend para refrescar rol si hubo cambios
      userService.verifySession()
        .then((res) => {
          const freshRole = res?.userInfo?.role;
          if (freshRole && freshRole !== user.role) {
            const updatedUser = { ...user, role: freshRole };
            setUserData(updatedUser);
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
          }
        })
        .catch((err) => {
          console.warn('Verificación pasiva de sesión:', err?.response?.status || err?.message);
        });
    } else {
      if (authToken || user) {
        clearAuthSession();
      }
      setIsLogged(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    syncUserFromSession();
  }, []);

  useEffect(() => {
    if (!userData && isLogged) {
      syncUserFromSession();
    }
  }, [isLogged, userData]);
  
useEffect(() => {
  fetch(`${config.API_URL}/health`)
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => {
      console.log('✅ Backend activo:', data);
    })
    .catch(err => {
      console.error('❌ Backend NO disponible en', config.API_URL, err);
    });
}, []);

  if (userData === undefined) {
    return <div style={{textAlign: 'center', marginTop: '100px'}}>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            userData && userData.id ? (
              <Layout userData={userData}>
                <Dashboard userData={userData} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            userData && userData.id ? (
              <Navigate to="/" replace />
            ) : (
              <GoogleLogin setIsLogin={setIsLogged} setUserData={setUserData} />
            )
          }
        />
        <Route
          path="/form"
          element={
            isLogged ? (
              <Layout userData={userData}>
                <FormPage userData={userData} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/results"
          element={
            isLogged ? (
              <Layout userData={userData}>
                <ResultsPage userData={userData} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/formulario/:formId"
          element={
            isLogged ? (
              <Layout userData={userData}>
                <FormPage userData={userData} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
