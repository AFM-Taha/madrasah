'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material'

interface AddStudentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface Class {
  _id: string
  name: string
  isActive: boolean
}

export default function AddStudentForm({ onSuccess, onCancel }: AddStudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    classId: '',
    isActive: true
  })

  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [classesLoading, setClassesLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/classes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch classes')
        }

        const data = await response.json()
        setClasses(data.classes || [])
      } catch (error) {
        console.error('Error fetching classes:', error)
        setSubmitError('Failed to load classes. Please try again.')
      } finally {
        setClassesLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required'
    if (!formData.classId) newErrors.classId = 'Class selection is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Check if classes are available
    if (classes.length === 0) {
      setSubmitError('Please add a class before adding new students.')
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          studentId: formData.studentId.trim() || undefined,
          classId: formData.classId,
          role: 'student',
          isActive: formData.isActive
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student account')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating student:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create student account')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching classes
  if (classesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show message if no classes available
  if (classes.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Please add a class before adding new students.
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Close
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Name Fields */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            key="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
            fullWidth
          />
          <TextField
            key="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
            fullWidth
          />
        </Box>

        {/* Contact Fields */}
        <TextField
          key="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          required
          fullWidth
        />

        <TextField
          key="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={!!errors.phone}
          helperText={errors.phone}
          required
          fullWidth
        />

        {/* Student ID (Optional) */}
        <TextField
          key="studentId"
          label="Student ID (Optional)"
          value={formData.studentId}
          onChange={(e) => handleInputChange('studentId', e.target.value)}
          helperText="Leave empty to auto-generate"
          fullWidth
        />

        {/* Class Selection */}
        <FormControl key="classId" fullWidth required error={!!errors.classId}>
          <InputLabel>Class</InputLabel>
          <Select
            value={formData.classId}
            onChange={(e) => handleInputChange('classId', e.target.value)}
            label="Class"
          >
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.name}
              </MenuItem>
            ))}
          </Select>
          {errors.classId && <FormHelperText>{errors.classId}</FormHelperText>}
        </FormControl>

        {/* Password Fields */}
        <TextField
          key="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          required
          fullWidth
        />

        <TextField
          key="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          required
          fullWidth
        />

        {/* Status Selection */}
        <FormControl key="isActive" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
            label="Status"
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button key="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            key="submit-btn"
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}
          >
            <CircularProgress 
              size={16} 
              sx={{ 
                color: 'inherit',
                mr: 0.5,
                visibility: loading ? 'visible' : 'hidden',
                width: loading ? 16 : 0,
                transition: 'width 0.2s ease, visibility 0.2s ease'
              }} 
            />
            {loading ? 'Creating...' : 'Create Student'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}