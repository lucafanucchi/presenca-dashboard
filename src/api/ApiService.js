import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://apipresenca.digitalsix.com.br',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ========================================================================
// INTERCEPTOR DE AUTENTICAÇÃO JWT
// Adiciona automaticamente o token Bearer em todas as requisições
// ========================================================================

apiClient.interceptors.request.use(config => {
  // Pegar token do localStorage
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para tratamento de erros com redirecionamento de login
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na API:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token inválido ou expirado - fazer logout automático
          console.error('Token inválido - fazendo logout...');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.reload(); // Recarregar para mostrar tela de login
          break;
        case 403:
          console.error('Acesso negado para este recurso');
          break;
        case 404:
          console.error('Recurso não encontrado');
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
        default:
          console.error('Erro:', status, data);
      }
    } else if (error.request) {
      console.error('Erro de conexão - verifique sua internet');
    } else {
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ========================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ========================================================================

/**
 * Fazer login
 * @param {string} email 
 * @param {string} senha 
 */
export const login = (email, senha) => {
  return apiClient.post('/auth/login', { email, senha });
};

/**
 * Verificar se o token atual ainda é válido
 */
export const verifyToken = () => {
  return apiClient.get('/auth/me');
};

/**
 * Fazer logout
 */
export const logout = () => {
  return apiClient.post('/auth/logout');
};

// ========================================================================
// FUNÇÕES PARA CLIENTES FINAIS (BASF, Nestlé, etc.)
// Automaticamente autenticadas via JWT
// ========================================================================

/**
 * Busca estatísticas de engajamento da empresa do usuário logado
 */
export const getDashboardStats = () => {
  return apiClient.get('/cliente/stats');
};

/**
 * Busca histórico de aulas da empresa do usuário logado
 */
export const getAulas = () => {
  return apiClient.get('/cliente/aulas');
};

/**
 * Busca funcionários da empresa do usuário logado
 */
export const getFuncionarios = () => {
  return apiClient.get('/cliente/funcionarios');
};

/**
 * Busca relatórios mensais
 * @param {string} periodo - Número de meses (ex: '6', '12')
 */
export const getRelatorios = (periodo = '6') => {
  return apiClient.get(`/cliente/relatorios?periodo=${periodo}`);
};

/**
 * Exporta relatório
 * @param {string} formato - 'pdf' ou 'csv'
 * @param {string} tipo - 'geral', 'funcionarios', 'aulas'
 */
export const exportarRelatorio = (formato, tipo) => {
  return apiClient.get(`/cliente/export/${tipo}?format=${formato}`, {
    responseType: 'blob'
  });
};

// ========================================================================
// FUNÇÕES ADMINISTRATIVAS (apenas para admins)
// ========================================================================

/**
 * Busca todos os usuários do sistema (admin only)
 */
export const getUsuarios = () => {
  return apiClient.get('/admin/usuarios');
};

/**
 * Busca estatísticas gerais do sistema (admin only)
 */
export const getAdminStats = () => {
  return apiClient.get('/admin/stats');
};

/**
 * Criar novo usuário (admin only)
 * @param {Object} userData - Dados do usuário
 */
export const criarUsuario = (userData) => {
  return apiClient.post('/admin/usuarios', userData);
};

/**
 * Atualizar usuário (admin only)
 * @param {number} id - ID do usuário
 * @param {Object} userData - Dados atualizados
 */
export const atualizarUsuario = (id, userData) => {
  return apiClient.put(`/admin/usuarios/${id}`, userData);
};

/**
 * Desativar usuário (admin only)
 * @param {number} id - ID do usuário
 */
export const desativarUsuario = (id) => {
  return apiClient.patch(`/admin/usuarios/${id}/desativar`);
};

// ========================================================================
// FUNÇÕES UTILITÁRIAS
// ========================================================================

/**
 * Verifica se a API está funcionando
 */
export const checkApiStatus = () => {
  return apiClient.get('/');
};

/**
 * Formata erros da API para exibição
 */
export const formatApiError = (error) => {
  if (error.response?.status === 401) {
    return 'Sessão expirada. Faça login novamente.';
  } else if (error.response?.status === 403) {
    return 'Acesso negado para este recurso.';
  } else if (error.response?.status === 404) {
    return 'Recurso não encontrado.';
  } else if (error.response?.status === 500) {
    return 'Erro interno do servidor.';
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.request) {
    return 'Erro de conexão. Verifique sua internet.';
  } else {
    return 'Erro desconhecido. Tente novamente.';
  }
};

/**
 * Pega informações do usuário logado do localStorage
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao pegar dados do usuário:', error);
    return null;
  }
};

/**
 * Verifica se o usuário atual é admin
 */
export const isCurrentUserAdmin = () => {
  const user = getCurrentUser();
  return user?.tipo_usuario === 'admin';
};

/**
 * Verifica se o usuário atual é cliente final
 */
export const isCurrentUserCliente = () => {
  const user = getCurrentUser();
  return user?.tipo_usuario === 'cliente_final';
};

export default apiClient;