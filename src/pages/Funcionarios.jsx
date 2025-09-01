import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Fade,
  Grow,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
  Search,
  FilterList,
  People,
  WorkOutline,
  Email,
  CalendarToday,
  TrendingUp,
  PersonAdd,
  MoreVert,
  Download,
  Business,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { getFuncionarios, formatApiError } from '../api/ApiService';

// Componente personalizado da toolbar
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 2, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarFilterButton
          sx={{
            color: 'text.primary',
            '& .MuiButton-startIcon': { color: 'primary.main' },
          }}
        />
        <GridToolbarDensitySelector
          sx={{
            color: 'text.primary',
            '& .MuiButton-startIcon': { color: 'primary.main' },
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          startIcon={<PersonAdd />}
          variant="contained"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Adicionar Funcionário
        </Button>
        <GridToolbarExport
          sx={{
            color: 'text.primary',
            '& .MuiButton-startIcon': { color: 'primary.main' },
          }}
        />
      </Box>
    </GridToolbarContainer>
  );
}

// Componente para mostrar nível de engajamento
function EngajamentoChip({ totalPresencas }) {
  const getEngajamentoConfig = (presencas) => {
    if (presencas >= 10) {
      return { label: 'Alto', color: '#10B981', bgcolor: 'rgba(16, 185, 129, 0.2)', icon: <TrendingUp /> };
    } else if (presencas >= 5) {
      return { label: 'Médio', color: '#F59E0B', bgcolor: 'rgba(245, 158, 11, 0.2)', icon: <TrendingUp /> };
    } else if (presencas > 0) {
      return { label: 'Baixo', color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.2)', icon: <TrendingUp /> };
    } else {
      return { label: 'Inativo', color: '#6B7280', bgcolor: 'rgba(107, 114, 128, 0.2)', icon: <Cancel /> };
    }
  };

  const config = getEngajamentoConfig(totalPresencas);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 500,
        fontSize: '0.75rem',
      }}
    />
  );
}

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unidadeFiltro, setUnidadeFiltro] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);

  // Estados para estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    mediaPresencas: 0,
  });

  const fetchFuncionarios = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getFuncionarios();
      const funcionariosData = response.data;
      
      setFuncionarios(funcionariosData);
      
      // Calcular estatísticas
      const total = funcionariosData.length;
      const ativos = funcionariosData.filter(f => f.total_presencas > 0).length;
      const inativos = total - ativos;
      const totalPresencas = funcionariosData.reduce((sum, f) => sum + (f.total_presencas || 0), 0);
      const mediaPresencas = total > 0 ? totalPresencas / total : 0;

      setStats({
        total,
        ativos,
        inativos,
        mediaPresencas,
      });

    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      const errorMessage = formatApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const handleMenuOpen = (event, funcionario) => {
    setAnchorEl(event.currentTarget);
    setSelectedFuncionario(funcionario);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFuncionario(null);
  };

  // Obter lista única de unidades para o filtro (filtrando valores vazios/nulos)
  const unidades = [...new Set(funcionarios.map(f => f.unidade).filter(Boolean))].sort();

  // Colunas da tabela
  const columns = [
    {
      field: 'nome_completo',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {params.value?.charAt(0)?.toUpperCase() || 'F'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'cargo',
      headerName: 'Cargo',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WorkOutline sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="body2">
            {params.value || 'Não informado'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'unidade',
      headerName: 'Unidade',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business sx={{ fontSize: 16, color: 'info.main' }} />
          <Typography variant="body2">
            {params.value || 'Principal'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'total_presencas',
      headerName: 'Participações',
      type: 'number',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'engajamento',
      headerName: 'Engajamento',
      width: 120,
      renderCell: (params) => (
        <EngajamentoChip totalPresencas={params.row.total_presencas || 0} />
      ),
    },
    {
      field: 'ultima_participacao',
      headerName: 'Última Participação',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">
            {params.value 
              ? new Date(params.value).toLocaleDateString('pt-BR')
              : 'Nunca'
            }
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  // Filtrar funcionários
  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = 
      funcionario.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnidade = 
      !unidadeFiltro || 
      funcionario.unidade === unidadeFiltro ||
      (!funcionario.unidade && unidadeFiltro === 'Principal');

    return matchesSearch && matchesUnidade;
  });

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="300px" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="500px" height={24} />
        </Box>
        
        {/* Stats Skeletons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width={200} height={100} />
          ))}
        </Box>
        
        {/* Table Skeleton */}
        <Skeleton variant="rounded" height={600} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Funcionários
          </Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography color="error">
              Erro ao carregar dados: {error}
            </Typography>
            <Button 
              onClick={fetchFuncionarios} 
              sx={{ mt: 2 }}
              variant="outlined"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Funcionários
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
            Gerencie e acompanhe o engajamento dos funcionários no programa de ginástica laboral
          </Typography>
        </Box>
      </Fade>

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Grow in={true} timeout={600}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Funcionários
              </Typography>
            </CardContent>
          </Card>
        </Grow>

        <Grow in={true} timeout={800}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#10B981', mb: 1 }}>
                <CheckCircle sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#10B981' }}>
                {stats.ativos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funcionários Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grow>

        <Grow in={true} timeout={1000}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#EF4444', mb: 1 }}>
                <Cancel sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#EF4444' }}>
                {stats.inativos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funcionários Inativos
              </Typography>
            </CardContent>
          </Card>
        </Grow>

        <Grow in={true} timeout={1200}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#3B82F6', mb: 1 }}>
                <TrendingUp sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#3B82F6' }}>
                {stats.mediaPresencas.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Média de Participações
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>

      {/* Filtros */}
      <Grow in={true} timeout={1400}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Buscar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  },
                }}
              />
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Unidade</InputLabel>
                <Select
                  value={unidadeFiltro}
                  onChange={(e) => setUnidadeFiltro(e.target.value)}
                  label="Filtrar por Unidade"
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <MenuItem value="">
                    <em>Todas as Unidades</em>
                  </MenuItem>
                  <MenuItem value="Principal">Principal</MenuItem>
                  {unidades.map((unidade) => (
                    <MenuItem key={unidade} value={unidade}>
                      {unidade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </Grow>

      {/* Tabela de Dados */}
      <Grow in={true} timeout={1600}>
        <Card>
          <DataGrid
            rows={filteredFuncionarios}
            columns={columns}
            loading={loading}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: {
                sortModel: [{ field: 'total_presencas', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              toolbar: CustomToolbar,
            }}
            sx={{
              border: 'none',
              minHeight: 600,
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderColor: 'rgba(255,255,255,0.05)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.05)',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(255,255,255,0.02)',
              },
              '& .MuiDataGrid-footerContainer': {
                borderColor: 'rgba(255,255,255,0.05)',
              },
            }}
          />
        </Card>
      </Grow>

      {/* Menu de Ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <People sx={{ mr: 1, fontSize: 18 }} />
          Ver Detalhes
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Email sx={{ mr: 1, fontSize: 18 }} />
          Enviar Email
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 1, fontSize: 18 }} />
          Exportar Dados
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default Funcionarios;