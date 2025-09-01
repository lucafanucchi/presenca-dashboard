import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Aulas from './pages/Aulas';
import Funcionarios from './pages/Funcionarios';
import LoadingSpinner from './components/LoadingSpinner';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import theme from './theme';

// Estilos globais personalizados
const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap")',
      
      body: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        backgroundColor: '#0A0A0B',
        overflowX: 'hidden',
      },
      
      '*': {
        boxSizing: 'border-box',
      },
      
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      },
      
      '::selection': {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: '#FFFFFF',
      },
      
      '@keyframes fadeInUp': {
        from: {
          opacity: 0,
          transform: 'translateY(30px)',
        },
        to: {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      
      '@keyframes slideInRight': {
        from: {
          opacity: 0,
          transform: 'translateX(-30px)',
        },
        to: {
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
      
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
        },
        '50%': {
          transform: 'scale(1.05)',
        },
        '100%': {
          transform: 'scale(1)',
        },
      },
      
      'button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible': {
        outline: '2px solid #1890FF',
        outlineOffset: '2px',
        borderRadius: '8px',
      },
      
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
      
      '@media (max-width: 768px)': {
        body: {
          fontSize: '14px',
        },
      },
    }}
  />
);

// Componente de rota protegida
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Verificando autenticação..." />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal da aplicação autenticada
const AuthenticatedApp = () => {
  const { user, logout } = useAuth();

  // Determinar rotas baseadas no tipo de usuário
  const getAvailableRoutes = () => {
    const routes = [];

    // Rotas para todos os usuários autenticados
    routes.push(
      <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,
      <Route key="aulas" path="/aulas" element={<Aulas />} />
    );

    // Rotas específicas para clientes finais
    if (user?.tipo_usuario === 'cliente_final') {
      // Adicionar rota de funcionários para clientes
      routes.push(<Route key="funcionarios" path="/funcionarios" element={<Funcionarios />} />);
    }

    // Rotas específicas para admins
    if (user?.tipo_usuario === 'admin') {
      // Adicionar rotas administrativas
      // routes.push(<Route key="admin" path="/admin/*" element={<AdminPanel />} />);
    }

    return routes;
  };

  return (
    <AppLayout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {getAvailableRoutes()}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

// Componente principal do App
const AppContent = () => {
  const { loading, isAuthenticated, login } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando aplicação..." />;
  }

  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route
          path="/login"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={login} />
            )
          }
        />
        
        {/* Rotas Protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;