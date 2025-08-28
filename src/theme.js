import { createTheme } from '@mui/material/styles';

const primaryColor = '#00A3A3';
const darkBlueColor = '#172139';
const blackColor = '#040404';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: primaryColor },
    background: {
      default: blackColor,
      paper: darkBlueColor,
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
  },
  // ADICIONANDO REFINAMENTOS
  shape: {
    borderRadius: 12, // Bordas mais arredondadas para um look moderno
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    button: {
        textTransform: 'none', // Botões sem CAIXA ALTA
        fontWeight: 'bold',
    }
  },
  // Sobrescrevendo o estilo padrão de alguns componentes
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          // Adiciona uma sombra sutil e uma borda para destacar os cards
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }
      }
    },
    MuiPaper: { // Paper é usado pelo Drawer e Cards
        styleOverrides: {
            root: {
                backgroundImage: 'none', // Remove gradientes padrão que o MUI pode adicionar
            }
        }
    }
  }
});

export default theme;