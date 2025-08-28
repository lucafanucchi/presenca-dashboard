import React from 'react';
import { AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar } from '@mui/material';
// 1. Importa o componente Link do React Router
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

function AppLayout({ children }) {
  // 2. Cria uma lista de objetos para o menu, associando texto com o caminho da rota
  const menuItems = [
    { text: 'Dashboard', path: '/' },
    { text: 'Aulas', path: '/aulas' },
    { text: 'Funcionários', path: '/funcionarios' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          boxShadow: '0px 1px 5px rgba(0,0,0,0.3)',
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <img 
            src="/logo-digital-six.png" 
            alt="Digital Six Logo" 
            style={{ 
              height: '48px', 
              marginRight: '16px' 
            }} 
          />
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)'
          },
        }}
      >
        <Toolbar sx={{ height: 64 }} />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* 3. Mapeia a lista de objetos para criar os links do menu */}
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                {/* 4. O ListItemButton agora funciona como um Link para a rota definida em 'to' */}
                <ListItemButton component={RouterLink} to={item.path}>
                  <ListItemText primary={item.text} sx={{ color: 'text.primary' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar sx={{ height: 64 }} />
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;