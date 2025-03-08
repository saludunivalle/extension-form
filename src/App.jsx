import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormPage from './pages/FormPage';
import Dashboard from './components/Dashboard';
import ResultsPage from './pages/ResultsPage';
import GoogleLogin from './components/GoogleLogin';
import Layout from './components/Layout'; 
import Cookies from 'js-cookie';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(token);
        setIsLogged(true);
        setUserInfo(decodedToken);
      } catch (error) {
        console.error('Error al parsear el token:', error);
        setIsLogged(false);
        setUserInfo(null);
      }
    }
  }, []);

 

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLogged ? (
              <Layout userData={userInfo}>
                <Dashboard userData={userInfo} />
              </Layout>
            ) : (
              <GoogleLogin setIsLogin={setIsLogged} setUserInfo={setUserInfo} />
            )
          }
        />
        <Route
          path="/form"
          element={
            isLogged ? (
              <Layout userData={userInfo}>
                <FormPage userData={userInfo} />
              </Layout>
            ) : (
              <GoogleLogin setIsLogin={setIsLogged} setUserInfo={setUserInfo} />
            )
          }
        />
        <Route
          path="/results"
          element={
            isLogged ? (
              <Layout userData={userInfo}>
                <ResultsPage userData={userInfo} />
              </Layout>
            ) : (
              <GoogleLogin setIsLogin={setIsLogged} setUserInfo={setUserInfo} />
            )
          }
        />
        <Route
          path="/formulario/:formId"
          element={
            isLogged ? (
              <Layout userData={userInfo}>
                <FormPage userData={userInfo} />
              </Layout>
            ) : (
              <GoogleLogin setIsLogin={setIsLogged} setUserInfo={setUserInfo} />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
