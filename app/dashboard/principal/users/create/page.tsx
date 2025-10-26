'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  School,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateUserPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    // Teacher fields
    subjects: [] as string[],
    // Student fields
    studentId: '',
    grade: '',
    section: '',
    parentContact: {
      fatherName: '',
      motherName: '',
      fatherPhone: '',
      motherPhone: '',
      address: '',
    },
  });

  const [currentSubject, setCurrentSubject] = useState('');

  // Redirect if not authenticated or not principal
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'principal') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('parentContact.')) {
      const parentField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        parentContact: {
          ...prev.parentContact,
          [parentField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSubject = () => {
    if (currentSubject.trim() && !formData.subjects.includes(currentSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, currentSubject.trim()],
      }));
      setCurrentSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User created successfully!');
        setTimeout(() => {
          router.push('/dashboard/principal');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'principal') {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/dashboard/principal')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <School sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Create New User
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Add New User
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a new teacher or student account
            </Typography>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Basic Information */}
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3, 
                mb: 3,
                '& > *': { 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
                  minWidth: { xs: '100%', sm: '250px' }
                }
              }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  helperText="Minimum 6 characters"
                />
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Teacher-specific fields */}
              {formData.role === 'teacher' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Teacher Information
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3,
                    '& > *': { 
                      flex: '1 1 100%'
                    }
                  }}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Subjects
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <TextField
                          label="Add Subject"
                          value={currentSubject}
                          onChange={(e) => setCurrentSubject(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                        />
                        <Button variant="outlined" onClick={handleAddSubject}>
                          Add
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.subjects.map((subject) => (
                          <Chip
                            key={subject}
                            label={subject}
                            onDelete={() => handleRemoveSubject(subject)}
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                </>
              )}

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Student Information
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3, 
                    mb: 3,
                    '& > *': { 
                      flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' },
                      minWidth: { xs: '100%', sm: '200px' }
                    }
                  }}>
                    <TextField
                      fullWidth
                      label="Student ID"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Grade"
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Section"
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Parent/Guardian Information
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3, 
                    mb: 3,
                    '& > *': { 
                      flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' },
                      minWidth: { xs: '100%', sm: '250px' }
                    }
                  }}>
                    <TextField
                      fullWidth
                      label="Father's Name"
                      value={formData.parentContact.fatherName}
                      onChange={(e) => handleInputChange('parentContact.fatherName', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Mother's Name"
                      value={formData.parentContact.motherName}
                      onChange={(e) => handleInputChange('parentContact.motherName', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Father's Phone"
                      value={formData.parentContact.fatherPhone}
                      onChange={(e) => handleInputChange('parentContact.fatherPhone', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Mother's Phone"
                      value={formData.parentContact.motherPhone}
                      onChange={(e) => handleInputChange('parentContact.motherPhone', e.target.value)}
                    />
                    <Box sx={{ flex: '1 1 100%' }}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={3}
                        value={formData.parentContact.address}
                        onChange={(e) => handleInputChange('parentContact.address', e.target.value)}
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                </>
              )}

              {/* Submit Button */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/dashboard/principal')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}