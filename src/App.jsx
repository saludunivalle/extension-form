import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FormPage from './pages/FormPage';
import Dashboard from './components/Dashboard';
import ResultsPage from './pages/ResultsPage';
import GoogleLogin from './components/GoogleLogin';
import Layout from './components/Layout'; 
import Cookies from 'js-cookie';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userData, setUserData] = useState();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(token);
        const user = decodedToken.sub
          ? { id: decodedToken.sub, name: decodedToken.name, email: decodedToken.email }
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
      setUserData(null);
    }
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
            <GoogleLogin setIsLogin={setIsLogged} setUserInfo={setUserInfo} />
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
