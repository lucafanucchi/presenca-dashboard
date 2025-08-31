import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUserData = localStorage.getItem('user_data');

        if (savedToken && savedUserData) {
          // Verificar se o token ainda é válido
          const response = await fetch('https://apipresenca.digitalsix.com.br/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(savedToken);
          } else {
            // Token inválido, limpar dados
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, limpar dados locais
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Chamar endpoint de logout se houver token
      if (token) {
        await fetch('https://apipresenca.digitalsix.com.br/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar estado e localStorage
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const isAdmin = () => {
    return user?.tipo_usuario === 'admin';
  };

  const isCliente = () => {
    return user?.tipo_usuario === 'cliente_final';
  };

  const getAuthHeader = () => {
    return token ? `Bearer ${token}` : null;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isCliente,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;