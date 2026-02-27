import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import RouterConfig from './routes';
import GlobalToast from './components/ui/GlobalToast';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <RouterConfig />
            <GlobalToast />
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
