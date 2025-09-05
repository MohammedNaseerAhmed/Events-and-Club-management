import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RouterConfig from './routes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RouterConfig />
      </AuthProvider>
    </Router>
  );
}

export default App;
