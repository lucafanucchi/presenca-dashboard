import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
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
  TextField,
  InputAdornment,
  Button,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
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
  CalendarToday,
  People,
  School,
  Download,
  Close,
  PictureAsPdf,
  TableChart,
  InsertDriveFile,
  MoreVert,
  Visibility,
} from '@mui/icons-material';
import { getAulas, exportarRelatorio, getParticipantesAula, formatApiError } from '../api/ApiService';

// Função para gerar PDF usando jsPDF
// Função para gerar PDF usando jsPDF
const generatePDF = (data, filename) => {
  // ✅ AGORA USE DIRETAMENTE (sem import dinâmico)
  const doc = new jsPDF();
  
  // Título do relatório
  doc.setFontSize(18);
  doc.text('Relatório de Aulas', 20, 20);
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
  
  // Preparar dados da tabela
  const tableData = data.map(aula => [
    new Date(aula.data_hora).toLocaleString('pt-BR'),
    aula.descricao,
    aula.professor_nome || 'N/A',
    aula.num_presencas || 0,
    getStatusLabel(aula.status)
  ]);
  
  // ✅ AGORA FUNCIONA
  doc.autoTable({
    head: [['Data/Hora', 'Descrição', 'Professor', 'Presenças', 'Status']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  doc.save(filename);
};

// Função para gerar Excel usando SheetJS
const generateExcel = (data, filename) => {
  import('xlsx').then(XLSX => {
    const ws_data = [
      ['Data/Hora', 'Descrição', 'Professor', 'Presenças', 'Status'],
      ...data.map(aula => [
        new Date(aula.data_hora).toLocaleString('pt-BR'),
        aula.descricao,
        aula.professor_nome || 'N/A',
        aula.num_presencas || 0,
        getStatusLabel(aula.status)
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aulas');
    
    XLSX.writeFile(wb, filename);
  });
};

// Função para obter o label do status
const getStatusLabel = (status) => {
  switch (status) {
    case 'concluida': return 'Concluída';
    case 'em_andamento': return 'Em Andamento';
    case 'agendada': return 'Agendada';
    default: return 'Indefinido';
  }
};


// Componente personalizado da toolbar
function CustomToolbar({ onExportPDF, onExportExcel }) {
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
          startIcon={<PictureAsPdf />}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
          onClick={onExportPDF}
        >
          PDF
        </Button>
        <Button
          startIcon={<TableChart />}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
          onClick={onExportExcel}
        >
          Excel
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
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    concluidas: 0,
    mediaPresencas: 0
  });
  
  // Estados para modal e menu
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAulaMenu, setSelectedAulaMenu] = useState(null);

  // Carregar dados reais da API
  useEffect(() => {
    const carregarAulas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAulas();
        const aulasData = response.data;
        
        if (!Array.isArray(aulasData)) {
          throw new Error('Dados de aulas inválidos recebidos da API');
        }
        
        // Processar dados e adicionar status baseado na data
        const aulasProcessadas = aulasData.map(aula => ({
          ...aula,
          status: determinarStatus(aula.data_hora)
        }));
        
        setAulas(aulasProcessadas);
        
        // Calcular estatísticas reais
        const concluidas = aulasProcessadas.filter(a => a.status === 'concluida').length;
        const totalPresencas = aulasProcessadas.reduce((acc, aula) => acc + (parseInt(aula.num_presencas) || 0), 0);
        const mediaPresencas = aulasProcessadas.length > 0 ? totalPresencas / aulasProcessadas.length : 0;
        
        setStats({
          total: aulasProcessadas.length,
          concluidas,
          mediaPresencas: Math.round(mediaPresencas * 10) / 10
        });
        
      } catch (err) {
        console.error('Erro ao carregar aulas:', err);
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    };

    carregarAulas();
  }, []);

  // Função para determinar status baseado na data
  const determinarStatus = (dataHora) => {
    const agora = new Date();
    const dataAula = new Date(dataHora);
    
    if (dataAula < agora) {
      return 'concluida';
    } else if (dataAula > agora) {
      return 'agendada';
    } else {
      return 'em_andamento';
    }
  };

// Handlers para modal
const handleOpenModal = async (aula) => {
  setSelectedAula(aula);
  setModalOpen(true);
  setLoadingParticipantes(true);
  
  try {
    console.log('Buscando participantes para aula ID:', aula.id); // Debug
    const response = await getParticipantesAula(aula.id);
    console.log('Resposta completa:', response.data); // Debug
    
    // ✅ CORRETO: Acessar o array dentro de response.data.participantes
    const participantesData = response.data.participantes || [];
    console.log('Participantes encontrados:', participantesData); // Debug
    
    setParticipantes(participantesData);
  } catch (err) {
    console.error('Erro ao carregar participantes:', err);
    setParticipantes([]);
  } finally {
    setLoadingParticipantes(false);
  }
};

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAula(null);
    setParticipantes([]);
  };

  // Handlers para menu de ações
  const handleMenuOpen = (event, aula) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAulaMenu(aula);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAulaMenu(null);
  };

  // Handlers para exportação geral
  const handleExportPDF = () => {
    generatePDF(filteredAulas, 'historico_aulas.pdf');
  };

  const handleExportExcel = () => {
    generateExcel(filteredAulas, 'historico_aulas.xlsx');
  };

  // Handlers para exportação de detalhes da aula
  const handleExportAulaDetalhesPDF = () => {
    if (!selectedAula || participantes.length === 0) return;
    
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(16);
        doc.text(`Detalhes da Aula: ${selectedAula.descricao}`, 20, 20);
        
        // Informações da aula
        doc.setFontSize(12);
        doc.text(`Data: ${new Date(selectedAula.data_hora).toLocaleString('pt-BR')}`, 20, 35);
        doc.text(`Professor: ${selectedAula.professor_nome}`, 20, 45);
        doc.text(`Participantes: ${participantes.length}`, 20, 55);
        
        // Tabela de participantes
        const tableData = participantes.map(p => [
          p.nome_completo,
          p.cargo || 'N/A',
          p.nfc_tag_id || 'N/A'
        ]);
        
        doc.autoTable({
          head: [['Nome', 'Cargo', 'NFC ID']],
          body: tableData,
          startY: 65,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        
        doc.save(`aula_${selectedAula.id}_detalhes.pdf`);
      });
    });
  };

  const handleExportAulaDetalhesExcel = () => {
    if (!selectedAula || participantes.length === 0) return;
    
    import('xlsx').then(XLSX => {
      const ws_data = [
        ['Detalhes da Aula'],
        ['Descrição:', selectedAula.descricao],
        ['Data:', new Date(selectedAula.data_hora).toLocaleString('pt-BR')],
        ['Professor:', selectedAula.professor_nome],
        ['Total de Participantes:', participantes.length],
        [],
        ['Nome', 'Cargo', 'NFC ID'],
        ...participantes.map(p => [
          p.nome_completo,
          p.cargo || 'N/A',
          p.nfc_tag_id || 'N/A'
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Detalhes da Aula');
      
      XLSX.writeFile(wb, `aula_${selectedAula.id}_detalhes.xlsx`);
    });
  };

  // Configuração das colunas do DataGrid
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
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
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StatusChip status={params.value} />
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
      filterable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuOpen(e, params.row)}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  // Filtrar aulas baseado no termo de busca
  const filteredAulas = aulas.filter(aula =>
    aula.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.professor_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render de loading
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="300px" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="500px" height={24} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width={200} height={100} />
          ))}
        </Box>
        
        <Skeleton variant="rounded" height={600} />
      </Container>
    );
  }

  // Render de erro
  if (error) {
    return (
      <Container maxWidth="xl">
        <Card sx={{ mt: 4, p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Erro ao carregar dados
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Histórico de Aulas
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
              Gerencie e acompanhe todas as suas aulas e sessões de treinamento
            </Typography>
          </Box>
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
              <People sx={{ fontSize: 40, color: '#3B82F6', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#3B82F6' }}>
                {stats.mediaPresencas}
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
              placeholder="Buscar por descrição ou professor..."
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
              toolbar: () => <CustomToolbar onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />,
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
        <MenuItem onClick={() => { 
          handleOpenModal(selectedAulaMenu); 
          handleMenuClose(); 
        }}>
          <Visibility sx={{ mr: 2, fontSize: 20 }} />
          Ver Detalhes
        </MenuItem>
      </Menu>

      {/* Modal de Detalhes da Aula */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detalhes da Aula
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedAula && (
            <Box>
              {/* Informações da Aula */}
              <Card sx={{ mb: 3, bgcolor: 'rgba(24, 144, 255, 0.05)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    {selectedAula.descricao}
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Data/Hora:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedAula.data_hora).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Professor:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedAula.professor_nome}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <StatusChip status={selectedAula.status} />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Participações:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedAula.num_presencas} pessoas
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Lista de Participantes */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Lista de Participantes ({participantes.length})
              </Typography>
              
              {loadingParticipantes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography color="text.secondary">Carregando participantes...</Typography>
                </Box>
              ) : participantes.length > 0 ? (
                <Card>
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {participantes.map((participante, index) => (
                      <React.Fragment key={participante.id || index}>
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                              {participante.nome_completo?.charAt(0) || 'F'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={participante.nome_completo || 'Nome não disponível'}
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  NFC: {participante.nfc_tag_id || 'N/A'} • {participante.cargo || 'Funcionário'}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < participantes.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              ) : (
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Nenhum participante encontrado para esta aula
                  </Typography>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            startIcon={<PictureAsPdf />}
            variant="outlined"
            onClick={handleExportAulaDetalhesPDF}
            disabled={!selectedAula || participantes.length === 0}
            sx={{ borderRadius: 2 }}
          >
            Exportar PDF
          </Button>
          <Button
            startIcon={<InsertDriveFile />}
            variant="outlined"
            onClick={handleExportAulaDetalhesExcel}
            disabled={!selectedAula || participantes.length === 0}
            sx={{ borderRadius: 2 }}
          >
            Exportar Excel
          </Button>
          <Button onClick={handleCloseModal} sx={{ borderRadius: 2 }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Aulas;