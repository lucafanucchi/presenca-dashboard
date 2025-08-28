import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Aulas from './pages/Aulas';
// import Funcionarios from './pages/Funcionarios'; // Descomentar quando criar a página

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import theme from './theme';

// Estilos globais personalizados
const globalStyles = (
  <GlobalStyles
    styles={{
      // Importa a fonte Inter do Google Fonts
      '@import': 'url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap")',
      
      // Estilos para o body
      body: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        backgroundColor: '#0A0A0B',
        overflowX: 'hidden',
      },
      
      // Reset para todos os elementos
      '*': {
        boxSizing: 'border-box',
      },
      
      // Estilos para scrollbar personalizados
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
      
      // Estilos para seleção de texto
      '::selection': {
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        color: '#FFFFFF',
      },
      
      // Animações personalizadas
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
      
      '@keyframes shimmer': {
        '0%': {
          backgroundPosition: '-200px 0',
        },
        '100%': {
          backgroundPosition: 'calc(200px + 100%) 0',
        },
      },
      
      // Estilos para elementos focados
      'button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible': {
        outline: '2px solid #1890FF',
        outlineOffset: '2px',
        borderRadius: '8px',
      },
      
      // Melhorias de acessibilidade
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
      
      // Estilos responsivos
      '@media (max-width: 768px)': {
        body: {
          fontSize: '14px',
        },
      },
    }}
  />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/aulas" element={<Aulas />} />
            {/* <Route path="/funcionarios" element={<Funcionarios />} /> */}
          </Routes>
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;