import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Badge,
  Tooltip,
  Fade,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  School,
  People,
  Notifications,
  Settings,
  Logout,
  Menu as MenuIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const drawerWidth = 280;

function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: Dashboard },
    { text: 'Aulas', path: '/aulas', icon: School },
    { text: 'Funcionários', path: '/funcionarios', icon: People },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            DS
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Digital Six
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Presença Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <List sx={{ padding: 0 }}>
          {menuItems.map((item, index) => (
            <Fade in={true} timeout={300 + (index * 100)} key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(24, 144, 255, 0.15)',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(24, 144, 255, 0.25)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.08)',
            },
          }}
          onClick={handleUserMenuOpen}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              mr: 2,
            }}
            src="/avatar-placeholder.jpg"
          >
            PJ
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Prof. João
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Professor
            </Typography>
          </Box>
          <KeyboardArrowDown sx={{ color: 'text.secondary' }} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { lg: `${drawerWidth}px` },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: 3 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notifications */}
          <Tooltip title="Notificações">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error" variant="dot">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Configurações">
            <IconButton color="inherit" sx={{ mr: 2 }}>
              <Settings />
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              borderRadius: 2,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
            onClick={handleUserMenuOpen}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                mr: 1,
              }}
              src="/avatar-placeholder.jpg"
            >
              PJ
            </Avatar>
            {!isMobile && (
              <Typography variant="body2" sx={{ mr: 1 }}>
                Prof. João
              </Typography>
            )}
            <KeyboardArrowDown />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }} />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            bgcolor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
        }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Configurações</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default AppLayout;