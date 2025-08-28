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
  CalendarToday,
  People,
  School,
  MoreVert,
  Download,
  Add,
  Visibility,
} from '@mui/icons-material';
import { getAulas } from '../api/ApiService';

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
          startIcon={<Add />}
          variant="contained"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Nova Aula
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

// Componente de status
function StatusChip({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'concluida':
        return { label: 'Concluída', color: '#10B981', bgcolor: 'rgba(16, 185, 129, 0.2)' };
      case 'em_andamento':
        return { label: 'Em Andamento', color: '#3B82F6', bgcolor: 'rgba(59, 130, 246, 0.2)' };
      case 'agendada':
        return { label: 'Agendada', color: '#8B5CF6', bgcolor: 'rgba(139, 92, 246, 0.2)' };
      default:
        return { label: 'Indefinido', color: '#6B7280', bgcolor: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
      }}
    />
  );
}

function Aulas() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    concluidas: 0,
    agendadas: 0,
    mediaPresencas: 0
  });

  useEffect(() => {
    // Simula delay de carregamento
    setTimeout(() => {
      getAulas()
        .then(response => {
          const aulasData = response.data.map((aula, index) => ({
            ...aula,
            id: aula.id || index,
            status: index % 3 === 0 ? 'concluida' : index % 3 === 1 ? 'agendada' : 'em_andamento'
          }));
          
          setAulas(aulasData);
          
          // Calcula estatísticas
          const concluidas = aulasData.filter(a => a.status === 'concluida').length;
          const agendadas = aulasData.filter(a => a.status === 'agendada').length;
          const mediaPresencas = aulasData.reduce((acc, aula) => acc + (aula.num_presencas || 0), 0) / aulasData.length;
          
          setStats({
            total: aulasData.length,
            concluidas,
            agendadas,
            mediaPresencas: mediaPresencas || 0
          });
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Erro ao carregar aulas:', err);
          // Dados mockados para demonstração
          const mockData = [
            { id: 1, data_hora: '2024-01-15T09:00:00', descricao: 'React Fundamentals', nome_empresa: 'TechCorp', professor_nome: 'Prof. João', num_presencas: 8, status: 'concluida' },
            { id: 2, data_hora: '2024-01-16T14:00:00', descricao: 'JavaScript Avançado', nome_empresa: 'DevInc', professor_nome: 'Prof. Maria', num_presencas: 12, status: 'agendada' },
            { id: 3, data_hora: '2024-01-17T10:00:00', descricao: 'Node.js Backend', nome_empresa: 'StartupXYZ', professor_nome: 'Prof. Carlos', num_presencas: 6, status: 'em_andamento' },
          ];
          setAulas(mockData);
          setStats({ total: 3, concluidas: 1, agendadas: 1, mediaPresencas: 8.7 });
          setLoading(false);
        });
    }, 1000);
  }, []);

  const handleMenuOpen = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRow(null);
  };

  const columns = [
    {
      field: 'data_hora',
      headerName: 'Data e Hora',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="body2">
            {params.value && new Date(params.value).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'descricao',
      headerName: 'Descrição da Aula',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'nome_empresa',
      headerName: 'Empresa',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            color: '#8B5CF6',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'professor_nome',
      headerName: 'Professor',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
            {params.value?.charAt(0) || 'P'}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'num_presencas',
      headerName: 'Presenças',
      type: 'number',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <StatusChip status={params.value} />,
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

  const filteredAulas = aulas.filter(aula =>
    aula.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.nome_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.professor_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Container maxWidth="xl">
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Histórico de Aulas
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
            Gerencie e acompanhe todas as suas aulas e sessões de treinamento
          </Typography>
        </Box>
      </Fade>

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Grow in={true} timeout={600}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Aulas
              </Typography>
            </CardContent>
          </Card>
        </Grow>

        <Grow in={true} timeout={800}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#10B981', mb: 1 }}>
                <School sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#10B981' }}>
                {stats.concluidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Concluídas
              </Typography>
            </CardContent>
          </Card>
        </Grow>

        <Grow in={true} timeout={1000}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#8B5CF6', mb: 1 }}>
                <CalendarToday sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#8B5CF6' }}>
                {stats.agendadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agendadas
              </Typography>
            </CardContent>
          </Card>
        </Grow>

        <Grow in={true} timeout={1200}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: '#3B82F6', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#3B82F6' }}>
                {stats.mediaPresencas.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Média de Presenças
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>

      {/* Barra de Busca */}
      <Grow in={true} timeout={1400}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: '16px !important' }}>
            <TextField
              fullWidth
              placeholder="Buscar por descrição, empresa ou professor..."
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </Grow>

      {/* Tabela de Dados */}
      <Grow in={true} timeout={1600}>
        <Card>
          <DataGrid
            rows={filteredAulas}
            columns={columns}
            loading={loading}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
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
                borderColor: 'rgba(255, 255, 255, 0.05)',
                py: 2,
                '&:focus': {
                  outline: 'none',
                },
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                '& .MuiDataGrid-columnHeader': {
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.primary',
                },
              },
              '& .MuiDataGrid-row': {
                borderColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(24, 144, 255, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(24, 144, 255, 0.12)',
                  },
                },
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              },
            }}
          />
        </Card>
      </Grow>

      {/* Menu de Ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            bgcolor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ mr: 2, fontSize: 20 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 2, fontSize: 20 }} />
          Relatório
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default Aulas;