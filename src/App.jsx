import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Aulas from './pages/Aulas'; // Importa a nova página

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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