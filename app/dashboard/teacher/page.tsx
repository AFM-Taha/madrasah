'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  School,
  MenuBook,
  Class,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function TeacherDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Redirect if not authenticated or not teacher
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'teacher') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <School sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Madrasah Management - Teacher Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Avatar sx={{ mr: 2, width: 24, height: 24 }} />
              {user.fullName}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Typography variant="h4" gutterBottom>
          Welcome, {user.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your classes and students effectively.
        </Typography>

        {/* Profile Card */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: 'primary.main' }}>
                  {user.firstName[0]}{user.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5">{user.fullName}</Typography>
                  <Typography color="text.secondary">{user.email}</Typography>
                  <Chip label="Teacher" color="primary" size="small" sx={{ mt: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MenuBook sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Quick Actions</Typography>
                  <Typography color="text.secondary">
                    Class management features will be available soon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Coming Soon Section */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Class sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Teacher Features Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're working on exciting features for teachers including:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              justifyContent: 'center' 
            }}>
              <Chip label="Class Management" variant="outlined" />
              <Chip label="Student Attendance" variant="outlined" />
              <Chip label="Grade Management" variant="outlined" />
              <Chip label="Assignment Tracking" variant="outlined" />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}