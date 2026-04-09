import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FormPage from './pages/FormPage';
import Dashboard from './components/Dashboard';
import ResultsPage from './pages/ResultsPage';
import GoogleLogin from './components/GoogleLogin';
import Layout from './components/Layout'; 
import Cookies from 'js-cookie';
import {config} from './config';
function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userData, setUserData] = useState();

  const syncUserFromCookie = () => {
    const token = Cookies.get('token');
    const savedUserData = localStorage.getItem('user_data');
    const parsedSavedUserData = savedUserData ? JSON.parse(savedUserData) : null;

    if (token) {
      try {
        const decodedToken = JSON.parse(token);
        const user = decodedToken.sub
          ? {
              id: decodedToken.sub,
              name: decodedToken.name,
              email: decodedToken.email,
              role: decodedToken.role || parsedSavedUserData?.role || ''
            }
          : decodedToken;
        console.log("User obtenido:", user);
        
        setIsLogged(true);
        setUserData(user);
      } catch (error) {
        console.error('Error al parsear el token:', error);
        setIsLogged(false);
        setUserData(null);
      }
    } else {
      setIsLogged(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    syncUserFromCookie();
  }, []);

  useEffect(() => {
    if (!userData && isLogged) {
      syncUserFromCookie();
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
