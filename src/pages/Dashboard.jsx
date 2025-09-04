import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Grow,
  Container,
  Fade,
  Avatar,
  LinearProgress,
  Alert,
  Button,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Analytics,
  CalendarToday,
  AccessTime,
  Business,
  Refresh,
  Warning,
  Star,
  Timeline,
  TrendingDown,
  TrendingFlat,
  ExpandMore,
  ExpandLess,
  FilterList,
  GetApp,
  PictureAsPdf,
  TableChart,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats, getAulas, getFuncionarios, formatApiError, exportarRelatorio } from '../api/ApiService';
import Funcionarios from './Funcionarios';

// Cores para o gráfico de pizza
const CHART_COLORS = [
  '#1890FF', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarelo
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#06B6D4', // Ciano
  '#84CC16', // Lima
  '#F97316'  // Laranja
];

const getColorForIndex = (index) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

function StatCard({ title, value, subtitle, icon: Icon, trend, delay = 0, gradient, isLoading = false }) {
  if (isLoading) {
    return (
      <Grid item xs={12} sm={6} lg={3}>
        <Card sx={{ height: 160 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grow in={true} timeout={500 + delay}>
      <Grid item xs={12} sm={6} lg={3}>
        <Card
          sx={{
            height: 160,
            position: 'relative',
            background: gradient || 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: gradient || 'linear-gradient(90deg, #1890FF, #8B5CF6)',
              borderRadius: 0,
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, fontWeight: 500 }}>
                  {title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Avatar
                sx={{
                  bgcolor: 'rgba(24, 144, 255, 0.2)',
                  color: 'primary.main',
                  width: 56,
                  height: 56,
                }}
              >
                <Icon fontSize="medium" />
              </Avatar>
            </Box>
            {trend && (
              <Chip
                label={trend}
                size="small"
                icon={<TrendingUp sx={{ fontSize: '16px !important' }} />}
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grow>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedUnidade, setSelectedUnidade] = useState('todas');


  // Estados derivados dos dados reais
  const [chartData, setChartData] = useState([]);
  const [empresasData, setEmpresasData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [aulasPopularesData, setAulasPopularesData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  // Estados para filtros locais
  const [selectedDepartment, setSelectedDepartment] = useState('todos');
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [selectedChartMetric, setSelectedChartMetric] = useState('presencas');
  const [expandedCards, setExpandedCards] = useState({});
  const [drilldownData, setDrilldownData] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [unidadesData, setUnidadesData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar estatísticas e aulas em paralelo
      const [statsResponse, aulasResponse, funcionariosResponse] = await Promise.all([
        getDashboardStats(),
        getAulas(),
        getFuncionarios()
      ]);

      const statsData = statsResponse.data;
      const aulasData = aulasResponse.data;
      const funcionariosData = funcionariosResponse.data;
      setFuncionarios(funcionariosData) // ✅ Adicione esta linha  // ✅ Adicione esta linha
  // ✅ Adicione esta linha

      // Processar dados das estatísticas
      setStats({
        totalAulas: statsData.totalAulas,
        totalPresencas: statsData.totalPresencas,
        funcionariosUnicos: statsData.funcionariosUnicos,
        totalFuncionarios: statsData.totalFuncionarios,
        mediaParticipantes: Number(statsData.mediaParticipantes).toFixed(1),
        taxaEngajamento: statsData.taxaEngajamento,
        // Calcular taxa de presença (assumindo capacidade média de 10 por aula)
        taxaPresenca: statsData.totalAulas > 0 ? 
          Math.min(100, Math.round((statsData.totalPresencas / (statsData.totalAulas * 10)) * 100)) : 0
      });

      setAulas(aulasData);

      // Processar dados para gráficos
      processChartData(aulasData);
      processEmpresasData(aulasData);
      processAulasPopulares(aulasData);
      processTimeline(aulasData);
      processDepartmentData(statsData);
      processUnidadesData(statsData);

      setSnackbar({
        open: true,
        message: 'Dados carregados com sucesso!',
        severity: 'success'
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const errorMessage = formatApiError(error);
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: `Erro ao carregar dados: ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (aulasData) => {
    const monthlyData = {};
    
    aulasData.forEach(aula => {
      const date = new Date(aula.data_hora);
      const monthKey = date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          mes: monthKey,
          aulas: 0,
          presencas: 0
        };
      }
      
      monthlyData[monthKey].aulas += 1;
      monthlyData[monthKey].presencas += parseInt(aula.num_presencas) || 0;
    });

    setChartData(Object.values(monthlyData).sort((a, b) => new Date(a.mes) - new Date(b.mes)));
  };

  const processEmpresasData = (aulasData) => {
    const empresas = {};
    
    aulasData.forEach(aula => {
      const empresa = aula.empresa_nome || 'Não informado';
      
      if (!empresas[empresa]) {
        empresas[empresa] = {
          nome: empresa,
          totalAulas: 0,
          totalPresencas: 0
        };
      }
      
      empresas[empresa].totalAulas += 1;
      empresas[empresa].totalPresencas += parseInt(aula.num_presencas) || 0;
    });

    setEmpresasData(Object.values(empresas));
  };

  const processUnidadesData = (statsData) => {
  try {
    //const funcionariosResponse = await getFuncionarios();
    const funcionariosData = funcionarios;
    
    console.log('🔍 Dados dos funcionários:', funcionariosData); // Debug
    
    // Verificar se os funcionários têm unidade_planta preenchida
    const funcionariosComUnidade = funcionariosData.filter(f => f.unidade_planta);
    console.log('👥 Funcionários com unidade definida:', funcionariosComUnidade.length);
    
    // Agrupar funcionários por unidade_planta
    const unidadeStats = {};
    funcionariosData.forEach(funcionario => {
      const unidade = funcionario.unidade || 'Principal';
      console.log(`📍 Funcionário ${funcionario.nome_completo}: unidade = ${unidade}`); // Debug
      
      if (!unidadeStats[unidade]) {
        unidadeStats[unidade] = {
          nome: unidade,
          funcionarios_total: 0,
          participacoes_total: 0
        };
      }
      
      unidadeStats[unidade].funcionarios_total += 1;
      unidadeStats[unidade].participacoes_total += parseInt(funcionario.total_presencas) || 0;
    });

    console.log('📊 Stats por unidade:', unidadeStats); // Debug

    // Calcular taxa de participação e preparar dados para o gráfico
    const unidadesArray = Object.values(unidadeStats).map(unidade => {
      const denominador = unidade.funcionarios_total * (statsData.totalAulas || 1);
      const taxa = denominador > 0 ? Math.round((unidade.participacoes_total / denominador) * 100) : 0;
      
      return {
        unidade: unidade.nome,
        participacoes: unidade.participacoes_total,
        funcionarios: unidade.funcionarios_total,
        taxa: taxa
      };
    }).sort((a, b) => b.participacoes - a.participacoes);

    console.log('📈 Array final de unidades:', unidadesArray); // Debug
    setUnidadesData(unidadesArray);
    
  } catch (error) {
    console.error('Erro ao processar dados de unidades:', error);
    setUnidadesData([]);
  }
  };


  const processAulasPopulares = (aulasData) => {
    const horariosData = {};
    const tiposData = {};
    
    aulasData.forEach(aula => {
      const date = new Date(aula.data_hora);
      const hora = date.getHours();
      const presencas = parseInt(aula.num_presencas) || 0;
      
      // Categorizar por horário
      let periodoHora;
      if (hora >= 6 && hora < 12) periodoHora = 'Manhã (6h-12h)';
      else if (hora >= 12 && hora < 18) periodoHora = 'Tarde (12h-18h)';
      else periodoHora = 'Noite (18h-6h)';
      
      if (!horariosData[periodoHora]) {
        horariosData[periodoHora] = { 
          periodo: periodoHora, 
          aulas: 0, 
          presencas: 0, 
          mediaPresencas: 0 
        };
      }
      horariosData[periodoHora].aulas += 1;
      horariosData[periodoHora].presencas += presencas;
      
      // Categorizar por tipo (baseado na descrição)
      const tipo = aula.descricao || 'Ginástica Geral';
      if (!tiposData[tipo]) {
        tiposData[tipo] = { 
          tipo, 
          aulas: 0, 
          presencas: 0, 
          mediaPresencas: 0 
        };
      }
      tiposData[tipo].aulas += 1;
      tiposData[tipo].presencas += presencas;
    });
    
    // Calcular médias e ordenar
    const horariosArray = Object.values(horariosData).map(item => ({
      ...item,
      mediaPresencas: item.aulas > 0 ? (item.presencas / item.aulas).toFixed(1) : 0
    })).sort((a, b) => b.mediaPresencas - a.mediaPresencas);
    
    const tiposArray = Object.values(tiposData).map(item => ({
      ...item,
      mediaPresencas: item.aulas > 0 ? (item.presencas / item.aulas).toFixed(1) : 0
    })).sort((a, b) => b.mediaPresencas - a.mediaPresencas).slice(0, 5); // Top 5
    
    setAulasPopularesData({ horarios: horariosArray, tipos: tiposArray });
  };

  const processTimeline = (aulasData) => {
    if (!aulasData || aulasData.length === 0) {
      setTimelineData([]);
      return;
    }

    const sortedAulas = aulasData.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
    const primeiraAula = sortedAulas[0];
    const ultimaAula = sortedAulas[sortedAulas.length - 1];
    
    const monthlyStats = {};
    
    sortedAulas.forEach(aula => {
      const date = new Date(aula.data_hora);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          mes: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          data: date,
          aulas: 0,
          presencas: 0,
          tipo: 'normal'
        };
      }
      
      monthlyStats[monthKey].aulas += 1;
      monthlyStats[monthKey].presencas += parseInt(aula.num_presencas) || 0;
    });

    const timelineArray = Object.values(monthlyStats).sort((a, b) => a.data - b.data);
    
    // Identificar marcos importantes
    timelineArray.forEach((item, index) => {
      if (index === 0) {
        item.tipo = 'inicio';
        item.marco = 'Início do Programa';
      } else if (index === timelineArray.length - 1) {
        item.tipo = 'atual';
        item.marco = 'Situação Atual';
      } else {
        const prevItem = timelineArray[index - 1];
        const crescimento = ((item.presencas - prevItem.presencas) / Math.max(prevItem.presencas, 1)) * 100;
        
        if (crescimento > 50) {
          item.tipo = 'crescimento';
          item.marco = `+${Math.round(crescimento)}% crescimento`;
        } else if (crescimento < -25) {
          item.tipo = 'declinio';
          item.marco = `${Math.round(crescimento)}% declínio`;
        }
      }
    });

    setTimelineData(timelineArray);
  };

  const processDepartmentData = async (statsData) => {
    try {
      // Buscar dados dos funcionários para análise por cargo/departamento
      const funcionariosResponse = await getFuncionarios();
      const funcionariosData = funcionariosResponse.data;
      
      // Extrair lista de departamentos únicos para os filtros
      const departamentos = [...new Set(funcionariosData.map(f => f.cargo).filter(Boolean))].sort();
      setAvailableDepartments(departamentos);
      
      // Filtrar por departamento se selecionado
      const filteredFuncionarios = selectedDepartment === 'todos' 
        ? funcionariosData 
        : funcionariosData.filter(f => f.cargo === selectedDepartment);
      
      // Agrupar por cargo e contar participações
      const departmentStats = {};
      
      filteredFuncionarios.forEach(funcionario => {
        const cargo = funcionario.cargo || 'Não informado';
        const participacoes = parseInt(funcionario.total_presencas) || 0;
        
        if (!departmentStats[cargo]) {
          departmentStats[cargo] = {
            nome: cargo,
            funcionarios: 0,
            participacoes: 0
          };
        }
        
        departmentStats[cargo].funcionarios += 1;
        departmentStats[cargo].participacoes += participacoes;
      });

      // Converter para array e ordenar por participações
      let departmentArray = Object.values(departmentStats)
        .sort((a, b) => b.participacoes - a.participacoes)
        .filter(dept => dept.participacoes > 0); // Só departamentos com participações

      // Se visualizando todos os departamentos e tiver mais de 6, agrupar os menores em "Outros"
      if (selectedDepartment === 'todos' && departmentArray.length > 6) {
        const top5 = departmentArray.slice(0, 5);
        const others = departmentArray.slice(5);
        
        const outrosTotal = others.reduce((sum, dept) => ({
          nome: 'Outros',
          funcionarios: sum.funcionarios + dept.funcionarios,
          participacoes: sum.participacoes + dept.participacoes
        }), { nome: 'Outros', funcionarios: 0, participacoes: 0 });
        
        departmentArray = [...top5, outrosTotal];
      }

      setDepartmentData(departmentArray);
    } catch (error) {
      console.error('Erro ao processar dados de departamento:', error);
      setDepartmentData([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Reagir às mudanças nos filtros
  useEffect(() => {
    if (stats && aulas.length > 0) {
      processDepartmentData(stats);
      processAulasPopulares(aulas);
      processTimeline(aulas);
      processUnidadesData(stats);
    }
  }, [selectedDepartment, selectedPeriod, stats, aulas, funcionarios]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExportRelatorio = async (formato, tipo) => {
    try {
      const response = await exportarRelatorio(formato, tipo);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-engajamento-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: `Relatório ${formato.toUpperCase()} exportado com sucesso!`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Erro ao exportar relatório: ${formatApiError(error)}`,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="400px" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="600px" height={24} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} isLoading={true} />
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh} startIcon={<Refresh />}>
              Tentar Novamente
            </Button>
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" gutterBottom>
            Erro ao carregar Dashboard
          </Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Dashboard de Engajamento
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
              Acompanhe a participação dos seus funcionários no programa de ginástica laboral
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              startIcon={<PictureAsPdf />}
              variant="outlined"
              onClick={() => handleExportRelatorio('pdf', 'geral')}
              sx={{ borderRadius: 2 }}
              size="small"
            >
              PDF
            </Button>
            <Button
              startIcon={<TableChart />}
              variant="outlined"
              onClick={() => handleExportRelatorio('excel', 'geral')}
              sx={{ borderRadius: 2 }}
              size="small"
            >
              Excel
            </Button>
            <Button
              startIcon={<Refresh />}
              variant="outlined"
              onClick={handleRefresh}
              sx={{ borderRadius: 2 }}
            >
              Atualizar
            </Button>
          </Box>
        </Box>
      </Fade>



      <Grid container spacing={3}>
        <StatCard
          title="Aulas Realizadas"
          value={stats?.totalAulas || 0}
          subtitle="para sua empresa"
          icon={School}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          textColor="#FFFFFF"
        />
        
        <StatCard
          title="Participações Totais"
          value={stats?.totalPresencas || 0}
          subtitle="dos funcionários"
          icon={People}
          delay={100}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          textColor="#FFFFFF"
        />
        
        <StatCard
          title="Funcionários Ativos"
          value={stats?.funcionariosUnicos || 0}
          subtitle={`de ${stats?.totalFuncionarios || 0} cadastrados`}
          icon={Analytics}
          delay={200}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          textColor="#FFFFFF"
        />

        <StatCard
          title="Taxa de Engajamento"
          value={`${stats?.taxaEngajamento || 0}%`}
          subtitle="dos funcionários"
          icon={TrendingUp}
          delay={300}
          gradient="linear-gradient(135deg, #437c29ff 0%, #0d8640ff 100%)"
          textColor="#FFFFFF"
        />

        <StatCard
          title="Aulas Mensais"
          value={stats?.totalAulas > 0 && chartData.length > 0 ? 
            Math.round(stats.totalAulas / chartData.length) 
            : 0}
          subtitle="Média mensal"
          icon={CalendarToday}
          delay={500}
          gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
          isLoading={loading}
        />

        {/* Gráfico de Evolução */}
        <Grow in={true} timeout={1000}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 400, borderRadius: 2 }}>
              <CardContent sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Evolução das Participações
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Métrica</InputLabel>
                      <Select
                        value={selectedChartMetric}
                        label="Métrica"
                        onChange={(e) => setSelectedChartMetric(e.target.value)}
                        sx={{ borderRadius: 1 }}
                      >
                        <MenuItem value="presencas">Participações</MenuItem>
                        <MenuItem value="aulas">Aulas</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <InputLabel>Período</InputLabel>
                      <Select
                        value={selectedPeriod}
                        label="Período"
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        sx={{ borderRadius: 1 }}
                      >
                        <MenuItem value="3">3m</MenuItem>
                        <MenuItem value="6">6m</MenuItem>
                        <MenuItem value="12">1a</MenuItem>
                        <MenuItem value="24">2a</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPresencas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1890FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1890FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#B3B3B3"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#B3B3B3"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1A1A1D',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: '#FFFFFF' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={selectedChartMetric} 
                        stroke="#1890FF"
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPresencas)" 
                        onClick={(data, index) => {
                          if (data && data.payload) {
                            setDrilldownData({
                              mes: data.payload.mes,
                              aulas: data.payload.aulas,
                              presencas: data.payload.presencas
                            });
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 300,
                    color: 'text.secondary'
                  }}>
                    <Warning sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography>Não há dados suficientes para exibir o gráfico</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        {/* Gráfico de Participação por Departamento */}
        <Grow in={true} timeout={1100}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 400, borderRadius: 2 }}>
              <CardContent sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Participação por Departamento
                    </Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Filtro</InputLabel>
                    <Select
                      value={selectedDepartment}
                      label="Filtro"
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      {availableDepartments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept.length > 12 ? `${dept.substring(0, 12)}...` : dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {departmentData.length > 0 ? (
                  <Box sx={{ display: 'flex', height: 300 }}>
                    <Box sx={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="participacoes"
                            onClick={(data, index) => {
                              if (data && data.payload) {
                                setDrilldownData({
                                  departamento: data.payload.nome,
                                  funcionarios: data.payload.funcionarios,
                                  participacoes: data.payload.participacoes,
                                  tipo: 'departamento'
                                });
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {departmentData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={getColorForIndex(index)}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1A1A1D',
                              color: '#ffffff',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                              color: '#FFFFFF'
                            }}
                            labelStyle={{ color: '#FFFFFF' }}
                            itemStyle={{ color: '#FFFFFF' }}
                            formatter={(value, name, props) => [
                              `${value} participações`,
                              props.payload.nome
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ 
                      width: 140, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'flex-start',
                      maxHeight: 280,
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255,255,255,0.3)',
                        borderRadius: '2px',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.4)',
                        },
                      },
                    }}>
                      {departmentData.map((dept, index) => (
                        <Box key={dept.nome} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              backgroundColor: getColorForIndex(index),
                              borderRadius: '50%',
                              color: '#ffffff', 
                              mr: 1
                            }} 
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.primary',
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                display: 'block'
                              }}
                            >
                              {dept.nome.length > 15 ? `${dept.nome.substring(0, 15)}...` : dept.nome}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#ffffff',
                                fontSize: '0.65rem'
                              }}
                            >
                              {dept.participacoes}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 300,
                    color: '#ffffff'
                  }}>
                    <Warning sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography>Carregando dados dos departamentos...</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        {/* Gráfico de Aulas Populares - NOVO */}
        <Grow in={true} timeout={1200}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 350, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <People sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informações de Participação
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Funcionários Cadastrados
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {stats?.totalFuncionarios || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Funcionários Ativos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#10B981' }}>
                      {stats?.funcionariosUnicos || 0}
                    </Typography>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Taxa de Engajamento
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#3B82F6' }}>
                        {stats?.taxaEngajamento || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.taxaEngajamento || 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#3B82F6',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total de Participações
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#8B5CF6' }}>
                      {stats?.totalPresencas || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        {/* Timeline do Programa - NOVO */}
        <Grow in={true} timeout={1300}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Linha do Tempo do Programa
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Período</InputLabel>
                      <Select
                        value={selectedPeriod}
                        label="Período"
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        sx={{ borderRadius: 1 }}
                      >
                        <MenuItem value="3">3 meses</MenuItem>
                        <MenuItem value="6">6 meses</MenuItem>
                        <MenuItem value="12">1 ano</MenuItem>
                        <MenuItem value="24">2 anos</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Marcos importantes e evolução
                    </Typography>
                  </Box>
                </Box>
                {timelineData.length > 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    overflowX: 'auto', 
                    gap: 2, 
                    pb: 2,
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '3px',
                    },
                  }}>
                    {timelineData.map((item, index) => (
                      <Box 
                        key={item.mes}
                        sx={{ 
                          minWidth: 200,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: item.tipo === 'inicio' ? 'rgba(16, 185, 129, 0.1)' :
                                  item.tipo === 'atual' ? 'rgba(59, 130, 246, 0.1)' :
                                  item.tipo === 'crescimento' ? 'rgba(245, 158, 11, 0.1)' :
                                  item.tipo === 'declinio' ? 'rgba(239, 68, 68, 0.1)' :
                                  'rgba(255,255,255,0.03)',
                          border: `1px solid ${
                            item.tipo === 'inicio' ? 'rgba(16, 185, 129, 0.3)' :
                            item.tipo === 'atual' ? 'rgba(59, 130, 246, 0.3)' :
                            item.tipo === 'crescimento' ? 'rgba(245, 158, 11, 0.3)' :
                            item.tipo === 'declinio' ? 'rgba(239, 68, 68, 0.3)' :
                            'rgba(255,255,255,0.1)'
                          }`,
                          position: 'relative',
                          '&::before': index < timelineData.length - 1 ? {
                            content: '""',
                            position: 'absolute',
                            right: -16,
                            top: '50%',
                            width: 32,
                            height: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transform: 'translateY(-50%)',
                            zIndex: 0
                          } : {}
                        }}
                      >
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: item.tipo === 'inicio' ? '#10B981' :
                                   item.tipo === 'atual' ? '#3B82F6' :
                                   item.tipo === 'crescimento' ? '#F59E0B' :
                                   item.tipo === 'declinio' ? '#EF4444' :
                                   'text.primary',
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          {item.mes}
                        </Typography>
                        
                        {item.marco && (
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary', 
                            display: 'block',
                            mb: 1,
                            fontSize: '0.7rem'
                          }}>
                            {item.marco}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            <strong>{item.aulas}</strong> aulas
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            <strong>{item.presencas}</strong> participações
                          </Typography>
                        </Box>
                        
                        {item.tipo === 'crescimento' && (
                          <TrendingUp sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            fontSize: 16, 
                            color: '#F59E0B' 
                          }} />
                        )}
                        
                        {item.tipo === 'declinio' && (
                          <TrendingDown sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            fontSize: 16, 
                            color: '#EF4444' 
                          }} />
                        )}
                        
                        {item.tipo === 'inicio' && (
                          <Star sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            fontSize: 16, 
                            color: '#10B981' 
                          }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 120,
                    color: 'text.secondary'
                  }}>
                    <Timeline sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography>Histórico insuficiente para timeline</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grow>
          {/* NOVO: Gráfico de Análise por Unidade */}
        

        {/* Card de Resumo Rápido - CORRIGIDO */}
{/* Gráfico de Participações por Unidade - NOVO */}
{/* Gráfico de Participações por Unidade - SUBSTITUINDO Card de Resumo Rápido */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={2000}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <Business sx={{ mr: 1, color: '#1890FF' }} />
                    Participações por Unidade
                  </Typography>
                  {/* FILTRO ESPECÍFICO APENAS PARA ESTE GRÁFICO */}
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Filtro</InputLabel>
                    <Select
                      value={selectedUnidade}
                      onChange={(e) => setSelectedUnidade(e.target.value)} // ⭐ Estado independente
                      label="Filtro"
                      sx={{ borderRadius: 1 }}
                    >
                      <MenuItem value="todas">Todas</MenuItem>
                      {unidadesData.map((unidade) => (
                        <MenuItem key={unidade.unidade} value={unidade.unidade}>
                          {unidade.unidade.length > 12 ? `${unidade.unidade.substring(0, 12)}...` : unidade.unidade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {unidadesData.length > 0 ? (
                  <>
                    {/* Resumo dinâmico baseado no filtro */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(24, 144, 255, 0.08)', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedUnidade === 'todas' 
                          ? `${unidadesData.length} unidades ativas`
                          : `Unidade: ${selectedUnidade}`
                        }
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {selectedUnidade === 'todas' 
                          ? `${unidadesData.reduce((sum, u) => sum + u.participacoes, 0)} participações totais`
                          : `${unidadesData.find(u => u.unidade === selectedUnidade)?.participacoes || 0} participações`
                        }
                      </Typography>
                      {selectedUnidade === 'todas' && (
                        <Typography variant="body2" color="text.secondary">
                          {unidadesData.reduce((sum, u) => sum + u.funcionarios, 0)} funcionários distribuídos
                        </Typography>
                      )}
                    </Box>

                    {/* Gráfico que muda conforme o filtro */}
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={selectedUnidade === 'todas' 
                          ? unidadesData 
                          : unidadesData.filter(u => u.unidade === selectedUnidade)
                        } // ⭐ Dados filtrados apenas para este gráfico
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        onClick={(data) => {
                          if (data && data.activePayload) {
                            setDrilldownData({
                              unidade: data.activePayload[0].payload.unidade,
                              participacoes: data.activePayload[0].payload.participacoes,
                              funcionarios: data.activePayload[0].payload.funcionarios,
                              taxa: data.activePayload[0].payload.taxa,
                              tipo: 'unidade'
                            });
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="unidade" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} ${name === 'participacoes' ? 'participações' : name === 'funcionarios' ? 'funcionários' : name}`,
                            name === 'participacoes' ? 'Participações' : name === 'funcionarios' ? 'Funcionários' : 'Taxa (%)'
                          ]}
                          labelFormatter={(label) => `Unidade: ${label}`}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            color: '#1890FF',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                            
                          }}
                          
                        />
                        <Bar dataKey="participacoes" fill="#1890FF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Indicadores de performance por unidade */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Indicadores de Performance:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(selectedUnidade === 'todas' 
                          ? unidadesData 
                          : unidadesData.filter(u => u.unidade === selectedUnidade)
                        ).map((unidade, index) => (
                          <Chip
                            key={unidade.unidade}
                            label={`${unidade.unidade}: ${unidade.taxa}%`}
                            size="small"
                            sx={{
                              bgcolor: unidade.taxa > 70 ? 'rgba(16, 185, 129, 0.2)' : 
                                      unidade.taxa > 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: unidade.taxa > 70 ? '#10B981' : 
                                    unidade.taxa > 40 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Typography color="text.secondary">
                      Carregando dados das unidades...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>


        {/* Gráfico de Aulas por Mês }
        <Grow in={true} timeout={1400}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 350, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Aulas por Período
                  </Typography>
                </Box>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="mes" stroke="#B3B3B3" fontSize={12} />
                      <YAxis stroke="#B3B3B3" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1A1A1D',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: '#FFFFFF' }}
                      />
                      <Bar 
                        dataKey="aulas" 
                        fill="url(#gradient)" 
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#A78BFA" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 250,
                    color: 'text.secondary'
                  }}>
                    <Warning sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography>Não há dados para exibir</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        {/* Informações sobre Funcionários */}

      </Grid>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal de Drilldown - NOVO */}
      <Dialog
        open={!!drilldownData}
        onClose={() => setDrilldownData(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {drilldownData?.tipo === 'departamento' 
              ? `Departamento: ${drilldownData?.departamento}`
              : drilldownData?.tipo === 'unidade'
              ? `Unidade: ${drilldownData?.unidade}` 
              : `Detalhes - ${drilldownData?.mes}`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {drilldownData && (
            <>
              {drilldownData.tipo === 'departamento' ? (
                // Drilldown para departamento (existente)
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {drilldownData.funcionarios}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Funcionários ativos
                  </Typography>

                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {drilldownData.participacoes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total de participações
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Média de participações por funcionário:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {drilldownData.funcionarios > 0 ? (drilldownData.participacoes / drilldownData.funcionarios).toFixed(1) : '0.0'}
                  </Typography>
                </>
              ) : drilldownData.tipo === 'unidade' ? (
                // Drilldown para unidade (NOVO)
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1890FF' }}>
                    {drilldownData.participacoes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total de participações
                  </Typography>

                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {drilldownData.funcionarios}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Funcionários na unidade
                  </Typography>

                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: drilldownData.taxa > 70 ? '#10B981' : drilldownData.taxa > 40 ? '#F59E0B' : '#EF4444' }}>
                    {drilldownData.taxa}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Taxa de participação
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Média de participações por funcionário:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {drilldownData.funcionarios > 0 ? (drilldownData.participacoes / drilldownData.funcionarios).toFixed(1) : '0.0'}
                  </Typography>

                  {/* Indicador de performance */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(24, 144, 255, 0.08)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Status da Unidade:
                    </Typography>
                    <Chip
                      label={
                        drilldownData.taxa > 70 ? '✅ Excelente Performance' :
                        drilldownData.taxa > 40 ? '⚠️ Performance Média' : '🚨 Precisa de Atenção'
                      }
                      sx={{
                        mt: 1,
                        bgcolor: drilldownData.taxa > 70 ? 'rgba(16, 185, 129, 0.2)' : 
                                drilldownData.taxa > 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: drilldownData.taxa > 70 ? '#10B981' : 
                              drilldownData.taxa > 40 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </Box>
                </>
              ) : (
                // Drilldown para período (existente)
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {drilldownData.aulas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Aulas realizadas
                  </Typography>

                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {drilldownData.presencas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total de participações
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Média de participantes por aula:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {drilldownData.aulas > 0 ? (drilldownData.presencas / drilldownData.aulas).toFixed(1) : '0.0'}
                  </Typography>
                </>
              )}
            </>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrilldownData(null)} sx={{ borderRadius: 2 }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;