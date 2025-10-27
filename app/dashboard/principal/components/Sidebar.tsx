'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as TeacherIcon,
  Groups as StudentsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../../../../contexts/AuthContext';

interface SidebarProps {
  open?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open = true }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { logout, user } = useAuth();

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard/principal',
      active: pathname === '/dashboard/principal'
    },
    {
      text: 'Manage Teachers',
      icon: <TeacherIcon />,
      path: '/dashboard/principal/teachers',
      active: pathname.startsWith('/dashboard/principal/teachers')
    },
    {
      text: 'Manage Students',
      icon: <StudentsIcon />,
      path: '/dashboard/principal/students',
      active: pathname.startsWith('/dashboard/principal/students')
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/dashboard/principal/settings',
      active: pathname.startsWith('/dashboard/principal/settings'),
      disabled: true // Future feature
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: open ? 280 : 0,
        height: '100vh',
        zIndex: 1200,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'hidden',
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{
          height: '100vh',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AdminIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" component="div" fontWeight="bold">
              Madrasah Admin
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Welcome, {user?.firstName || 'Principal'}
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flex: 1, py: 2 }}>
          <List sx={{ px: 1 }}>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => !item.disabled && handleNavigation(item.path)}
                  disabled={item.disabled}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    backgroundColor: item.active 
                      ? alpha(theme.palette.common.white, 0.15)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.08),
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: item.active ? 600 : 400,
                    }}
                  />
                  {item.disabled && (
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      Soon
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.common.white, 0.12) }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.error.light,
                  minWidth: 40,
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  color: theme.palette.error.light,
                }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;