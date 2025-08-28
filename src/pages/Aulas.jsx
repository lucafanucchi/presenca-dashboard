import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
// --- CORREÇÃO APLICADA AQUI ---
import { DataGrid } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales'; // A tradução vem deste pacote específico
// ---------------------------------
import { getAulas } from '../api/ApiService';

function Aulas() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAulas()
      .then(response => {
        setAulas(response.data.map(aula => ({ ...aula, id: aula.id })));
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const columns = [
    {
      field: 'data_hora',
      headerName: 'Data e Hora',
      width: 180,
      valueGetter: (value) => value && new Date(value).toLocaleString('pt-BR'),
    },
    { field: 'descricao', headerName: 'Descrição da Aula', width: 300 },
    { field: 'nome_empresa', headerName: 'Empresa Atendida', width: 200 },
    { field: 'professor_nome', headerName: 'Professor', width: 180 },
    {
      field: 'num_presencas',
      headerName: 'Nº de Presenças',
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Histórico de Aulas
      </Typography>
      <DataGrid
        rows={aulas}
        columns={columns}
        loading={loading}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        sx={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
        }}
      />
    </Box>
  );
}

export default Aulas;