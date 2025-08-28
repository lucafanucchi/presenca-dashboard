import React, { useEffect, useState } from 'react';
// 1. Importa os componentes Grow (para animação) e Skeleton (para o loading)
import { Box, Grid, Card, CardContent, Typography, Skeleton, Grow } from '@mui/material';
import { getDashboardStats } from '../api/ApiService';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Adiciona um pequeno delay para que a animação seja mais perceptível
    setTimeout(() => {
      getDashboardStats()
        .then(response => {
          setStats(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar estatísticas:", err);
          setError("Não foi possível carregar os dados.");
          setLoading(false);
        });
    }, 1000); // 1 segundo de delay
  }, []);

  // 2. TELA DE CARREGAMENTO (LOADING) MODERNA COM SKELETONS
  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          <Skeleton width="40%" />
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}><Skeleton variant="rounded" height={100} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Skeleton variant="rounded" height={100} /></Grid>
          <Grid item xs={12} sm={6} md={4}><Skeleton variant="rounded" height={100} /></Grid>
          <Grid item xs={12}><Skeleton variant="rounded" height={300} /></Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Insights
      </Typography>
      <Grid container spacing={3}>
        {/* 3. CORREÇÃO: O <Grow> agora ENVOLVE o <Grid item> */}
        <Grow in={true} timeout={500}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography sx={{ color: 'text.secondary' }} gutterBottom>Total de Aulas (Mês)</Typography>
                <Typography variant="h4" component="h2">{stats.totalAulas}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={700}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography sx={{ color: 'text.secondary' }} gutterBottom>Total de Presenças (Mês)</Typography>
                <Typography variant="h4" component="h2">{stats.totalPresencas}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={900}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography sx={{ color: 'text.secondary' }} gutterBottom>Média por Aula</Typography>
                <Typography variant="h4" component="h2">{stats.mediaParticipantes.toFixed(1)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1100}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Engajamento ao Longo do Tempo</Typography>
                <Box sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: 'rgba(0,0,0,0.1)' 
                }}>
                  (Espaço reservado para o gráfico)
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grow>
      </Grid>
    </Box>
  );
}

export default Dashboard;