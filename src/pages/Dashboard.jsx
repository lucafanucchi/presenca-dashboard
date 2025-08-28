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
  Chip,
  LinearProgress,
  Alert,
  Button,
  Snackbar,
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
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { getDashboardStats, getAulas, formatApiError } from '../api/ApiService';

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
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: gradient || 'linear-gradient(90deg, #1890FF, #8B5CF6)',
              borderRadius: '16px 16px 0 0',
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                  {title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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

  // Estados derivados dos dados reais
  const [chartData, setChartData] = useState([]);
  const [empresasData, setEmpresasData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar estatísticas e aulas em paralelo
      const [statsResponse, aulasResponse] = await Promise.all([
        getDashboardStats(),
        getAulas()
      ]);

      const statsData = statsResponse.data;
      const aulasData = aulasResponse.data;

      // Processar dados das estatísticas
      setStats({
        totalAulas: statsData.totalAulas,
        totalPresencas: statsData.totalPresencas,
        mediaParticipantes: Number(statsData.mediaParticipantes).toFixed(1),
        // Calcular taxa de presença (assumindo capacidade média de 10 por aula)
        taxaPresenca: statsData.totalAulas > 0 ? 
          Math.min(100, Math.round((statsData.totalPresencas / (statsData.totalAulas * 10)) * 100)) : 0
      });

      setAulas(aulasData);

      // Processar dados para gráficos
      processChartData(aulasData);
      processEmpresasData(aulasData);

      setSnackbar({
        open: true,
        message: 'Dados carregados com sucesso!',
        severity: 'success'
      });

    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      const errorMessage = formatApiError(err);
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

  // Processar dados para o gráfico de evolução temporal
  const processChartData = (aulasData) => {
    if (!aulasData || aulasData.length === 0) {
      setChartData([]);
      return;
    }

    // Agrupar aulas por mês
    const monthlyData = {};
    
    aulasData.forEach(aula => {
      const date = new Date(aula.data_hora);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          mes: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          aulas: 0,
          presencas: 0
        };
      }
      
      monthlyData[monthKey].aulas += 1;
      monthlyData[monthKey].presencas += parseInt(aula.num_presencas) || 0;
    });

    // Converter para array e ordenar
    const chartDataArray = Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);

    setChartData(chartDataArray);
  };

  // Processar dados por empresa
  const processEmpresasData = (aulasData) => {
    if (!aulasData || aulasData.length === 0) {
      setEmpresasData([]);
      return;
    }

    const empresas = {};
    
    aulasData.forEach(aula => {
      const empresa = aula.nome_empresa;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          <Button
            startIcon={<Refresh />}
            variant="outlined"
            onClick={handleRefresh}
            sx={{ borderRadius: 2 }}
          >
            Atualizar
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        <StatCard
          title="Aulas Realizadas"
          value={stats?.totalAulas || 0}
          subtitle="para sua empresa"
          icon={School}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        
        <StatCard
          title="Participações Totais"
          value={stats?.totalPresencas || 0}
          subtitle="dos funcionários"
          icon={People}
          delay={100}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        
        <StatCard
          title="Funcionários Ativos"
          value={stats?.funcionariosUnicos || 0}
          subtitle={`de ${stats?.totalFuncionarios || 0} cadastrados`}
          icon={Analytics}
          delay={200}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />

        <StatCard
          title="Taxa de Engajamento"
          value={`${stats?.taxaEngajamento || 0}%`}
          subtitle="dos funcionários"
          icon={TrendingUp}
          delay={300}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />

        {/* Gráfico de Evolução */}
        <Grow in={true} timeout={1000}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Evolução das Participações
                  </Typography>
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
                        dataKey="presencas" 
                        stroke="#1890FF"
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPresencas)" 
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

        {/* Resumo por Empresas */}
        <Grow in={true} timeout={1200}>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Business sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Programa de Ginástica
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {empresasData.length > 0 ? (
                    empresasData.map((empresa, index) => (
                      <Box key={empresa.nome} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                          {empresa.nome}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Aulas: {empresa.totalAulas}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Presenças: {empresa.totalPresencas}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (empresa.totalPresencas / Math.max(empresa.totalAulas * 10, 1)) * 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#1890FF',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Warning sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
                      <Typography color="text.secondary">
                        Nenhuma empresa encontrada
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        {/* Gráfico de Aulas por Mês */}
        <Grow in={true} timeout={1400}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 350 }}>
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

        {/* Card de Resumo Rápido */}
        <Grow in={true} timeout={1600}>
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: 350 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Resumo Rápido
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', mb: 2 }}>
                    <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 700, mb: 1 }}>
                      {aulas.length > 0 ? 
                        `${Math.round((aulas.filter(a => parseInt(a.num_presencas) > 5).length / aulas.length) * 100)}%` 
                        : '0%'
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      das aulas tiveram boa participação (acima de 5 pessoas)
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', mb: 2 }}>
                    <Typography variant="h4" sx={{ color: '#3B82F6', fontWeight: 700, mb: 1 }}>
                      {empresasData.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      empresas sendo atendidas atualmente
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)' }}>
                    <Typography variant="h4" sx={{ color: '#8B5CF6', fontWeight: 700, mb: 1 }}>
                      {stats?.totalAulas > 0 && chartData.length > 0 ? 
                        Math.round(stats.totalAulas / chartData.length) 
                        : 0
                      }
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      aulas realizadas por mês em média
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grow>
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
    </Container>
  );
}

export default Dashboard;