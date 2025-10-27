'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  People,
  School,
  PersonAdd,
  Search,
  Add,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  studentId?: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Stats {
  totalTeachers: number;
  totalStudents: number;
  totalUsers: number;
}

export default function PrincipalDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState<Stats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalUsers: 0,
  });

  // Fetch users and stats
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/users?${queryParams}`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.users);
        setTotalUsers(data.pagination.total);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch teachers
      const teachersResponse = await fetch('/api/users?role=teacher&limit=1', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      // Fetch students
      const studentsResponse = await fetch('/api/users?role=student&limit=1', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (teachersResponse.ok && studentsResponse.ok) {
        const teachersData = await teachersResponse.json();
        const studentsData = await studentsResponse.json();
        
        setStats({
          totalTeachers: teachersData.pagination.total,
          totalStudents: studentsData.pagination.total,
          totalUsers: teachersData.pagination.total + studentsData.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'primary';
      case 'student':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!user || user.role !== 'principal') {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Principal Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName}! Manage your madrasah efficiently.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ minWidth: 200, flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <People sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Users</Typography>
            </Box>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registered users in system
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Teachers</Typography>
            </Box>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {users.filter(user => user.role === 'teacher').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active teaching staff
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200, flex: '1 1 300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonAdd sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Students</Typography>
            </Box>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {users.filter(user => user.role === 'student').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enrolled students
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => router.push('/dashboard/principal/users/create')}
            >
              Add New User
            </Button>
            <Button
              variant="outlined"
              startIcon={<School />}
              onClick={() => router.push('/dashboard/principal/teachers')}
            >
              Manage Teachers
            </Button>
            <Button
              variant="outlined"
              startIcon={<People />}
              disabled
            >
              Manage Students (Coming Soon)
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Recent Users</Typography>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={
                            user.role === 'principal' ? 'error' :
                            user.role === 'teacher' ? 'primary' :
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => router.push('/dashboard/principal/users/create')}
      >
        <Add />
      </Fab>
    </Box>
  );
}