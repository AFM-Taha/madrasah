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
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  School,
  Person,
  Assignment,
  Grade,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
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

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <School sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Madrasah Management - Student Portal
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
          Access your academic information and assignments.
        </Typography>

        {/* Student Profile Card */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4,
          '& > *': { 
            flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 12px)' },
            minWidth: { xs: '100%', md: '400px' }
          }
        }}>
          <Card sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 12px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: 'secondary.main' }}>
                  {user.firstName[0]}{user.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5">{user.fullName}</Typography>
                  <Typography color="text.secondary">{user.email}</Typography>
                  <Chip label="Student" color="secondary" size="small" sx={{ mt: 1 }} />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                '& > *': { 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                  minWidth: { xs: '100%', sm: '150px' }
                }
              }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Student ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.studentId || 'Not assigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Grade
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.grade || 'Not assigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Section
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.section || 'Not assigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 12px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Academic Info</Typography>
                  <Typography color="text.secondary">
                    View your academic progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Coming Soon Section */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Student Features Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're developing exciting features for students including:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              justifyContent: 'center' 
            }}>
              <Chip label="View Assignments" variant="outlined" />
              <Chip label="Check Grades" variant="outlined" />
              <Chip label="Class Schedule" variant="outlined" />
              <Chip label="Attendance Record" variant="outlined" />
              <Chip label="Submit Homework" variant="outlined" />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}