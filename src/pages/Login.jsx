import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  AdminPanelSettings,
  Business,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dados dos usuários demo para facilitar o teste
  const demoUsers = [
    {
      email: 'luca@digitalsix.com.br',
      senha: 'Digital@2025',
      tipo: 'admin',
      label: 'Admin - Digital Six'
    },
    {
      email: 'teste@basf.com.br',
      senha: 'teste1234',
      tipo: 'cliente',
      label: 'RH - BASF'
    }
  ];

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpar erros ao digitar
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://apipresenca.digitalsix.com.br/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      setSuccess('Login realizado com sucesso!');
      
      // Chamar callback de sucesso após um pequeno delay
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 1000);

    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoUser) => {
    setFormData({
      email: demoUser.email,
      senha: demoUser.senha
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A0B 0%, #1A1A1D 50%, #2A2A2D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'rgba(26, 26, 29, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                      background: 'linear-gradient(135deg, #1890FF 0%, #8B5CF6 100%)',
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Bem-vindo
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Acesse sua conta para visualizar relatórios e estatísticas
                  </Typography>
                </Box>

                {/* Demo Users */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Contas de demonstração:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {demoUsers.map((user) => (
                      <Chip
                        key={user.email}
                        label={user.label}
                        icon={user.tipo === 'admin' ? <AdminPanelSettings /> : <Business />}
                        onClick={() => handleDemoLogin(user)}
                        sx={{
                          bgcolor: user.tipo === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(24, 144, 255, 0.2)',
                          color: user.tipo === 'admin' ? '#8B5CF6' : '#1890FF',
                          '&:hover': {
                            bgcolor: user.tipo === 'admin' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(24, 144, 255, 0.3)',
                          },
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Alerts */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={handleChange('senha')}
                    disabled={loading}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      height: 56,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1890FF 0%, #8B5CF6 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #40A9FF 0%, #A78BFA 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </Box>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Plataforma de Gestão de Presença
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Digital Six © 2025
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;