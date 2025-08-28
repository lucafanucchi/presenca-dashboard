import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://apipresenca.digitalsix.com.br', // Sua URL de produção
});

// Adiciona um "interceptor" para colocar o ID do professor em todas as requisições
// Por enquanto, vamos "chumbar" o ID 1, simulando o Prof. João logado.
apiClient.interceptors.request.use(config => {
  config.headers['X-Professor-Id'] = '1'; 
  return config;
});

// Funções para cada endpoint
export const getDashboardStats = () => apiClient.get('/stats');
// ... (função getDashboardStats)
export const getAulas = () => apiClient.get('/aulas');
// ...
// ... outras funções virão aqui ...