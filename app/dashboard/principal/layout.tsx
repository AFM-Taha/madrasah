'use client';

import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/Sidebar';

interface PrincipalLayoutProps {
  children: React.ReactNode;
}

export default function PrincipalLayout({ children }: PrincipalLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          marginLeft: '280px', // Account for fixed sidebar width
          backgroundColor: (theme) => theme.palette.grey[50],
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}