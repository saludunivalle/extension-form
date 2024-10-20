import React, { useState, useEffect } from 'react';
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
      setIsLogged(true);
      const decodedToken = JSON.parse(token);
      setUserInfo(decodedToken);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLogged ? (
              <Layout>
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
              <Layout>
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
              <Layout>
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
              <Layout>
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
