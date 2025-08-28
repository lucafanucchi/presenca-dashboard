import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://apipresenca.digitalsix.com.br',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ========================================================================
// IMPORTANTE: Este ApiService é APENAS para o DASHBOARD WEB
// Usado pelo RH da BASF, Nestlé, etc. (clientes finais)
// 
// O APP MOBILE dos professores usa endpoints diferentes:
// - APP: X-Professor-Id → /aulas (POST)
// - WEB: X-Empresa-Cliente-Id → /cliente/* (GET)
// ========================================================================

// Interceptor para identificar qual EMPRESA CLIENTE está acessando o dashboard
// Por enquanto fixo como BASF (ID 1), depois virá do sistema de login
apiClient.interceptors.request.use(config => {
  // Header que identifica a empresa cliente (BASF, Nestlé, etc.)
  config.headers['X-Empresa-Cliente-Id'] = '1'; // BASF
  
  return config;
});

// Tratamento de erros focado no cliente final
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na API:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          console.error('Acesso negado - empresa não autorizada');
          break;
        case 404:
          console.error('Dados não encontrados para sua empresa');
          break;
        case 500:
          console.error('Erro no servidor - contate o suporte');
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
// FUNÇÕES PARA O DASHBOARD WEB (Cliente Final - BASF, Nestlé, etc.)
// Todas mostram dados APENAS da empresa que está logada
// ========================================================================

/**
 * Busca estatísticas de engajamento da empresa cliente
 * Retorna: total de aulas, participações, funcionários ativos, etc.
 */
export const getDashboardStats = () => {
  return apiClient.get('/cliente/stats');
};

/**
 * Busca histórico de aulas realizadas para a empresa cliente  
 * Retorna: lista de aulas com data, professor, número de participantes
 */
export const getAulas = () => {
  return apiClient.get('/cliente/aulas');
};

/**
 * Busca funcionários da empresa cliente e suas participações
 * Retorna: lista de funcionários com estatísticas de presença
 */
export const getFuncionarios = () => {
  return apiClient.get('/cliente/funcionarios');
};

/**
 * Busca relatórios mensais de engajamento
 * @param {string} periodo - Número de meses (ex: '6', '12')
 */
export const getRelatorios = (periodo = '6') => {
  return apiClient.get(`/cliente/relatorios?periodo=${periodo}`);
};

/**
 * Busca dados para gráfico de evolução temporal
 */
export const getEvolutionData = () => {
  return apiClient.get('/cliente/evolucao');
};

/**
 * Exporta relatório em PDF ou CSV
 * @param {string} formato - 'pdf' ou 'csv'
 * @param {string} tipo - 'geral', 'funcionarios', 'aulas'
 */
export const exportarRelatorio = (formato, tipo) => {
  return apiClient.get(`/cliente/export/${tipo}?format=${formato}`, {
    responseType: 'blob' // Para download de arquivo
  });
};

/**
 * Verifica se a API está funcionando
 */
export const checkApiStatus = () => {
  return apiClient.get('/');
};

/**
 * Formata mensagens de erro para exibição amigável ao cliente
 */
export const formatApiError = (error) => {
  if (error.response?.status === 401) {
    return 'Acesso não autorizado. Entre em contato com o suporte.';
  } else if (error.response?.status === 404) {
    return 'Dados não encontrados para sua empresa.';
  } else if (error.response?.status === 500) {
    return 'Erro interno. Nosso time foi notificado.';
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.request) {
    return 'Erro de conexão. Verifique sua internet.';
  } else {
    return 'Erro desconhecido. Tente novamente.';
  }
};

/**
 * Informações sobre qual empresa está logada (para debug)
 */
export const getEmpresaInfo = () => {
  return {
    id: 1,
    nome: 'BASF', // Depois virá da API de autenticação
    tipo: 'cliente_final'
  };
};