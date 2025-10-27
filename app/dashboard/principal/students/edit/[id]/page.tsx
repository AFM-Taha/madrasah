'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'

interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  studentId?: string
  classId?: string
  isActive: boolean
}

interface Class {
  _id: string
  name: string
  isActive: boolean
}

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    classId: '',
    isActive: true
  })

  // Fetch student data and classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        // Fetch student data
        const studentResponse = await fetch(`/api/users/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!studentResponse.ok) {
          throw new Error('Failed to fetch student data')
        }

        const studentData = await studentResponse.json()
        setStudent(studentData.user)
        
        // Set form data
        setFormData({
          firstName: studentData.user.firstName || '',
          lastName: studentData.user.lastName || '',
          email: studentData.user.email || '',
          phone: studentData.user.phone || '',
          studentId: studentData.user.studentId || '',
          classId: studentData.user.classId || '',
          isActive: studentData.user.isActive !== false
        })

        // Fetch classes
        const classesResponse = await fetch('/api/classes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!classesResponse.ok) {
          throw new Error('Failed to fetch classes')
        }

        const classesData = await classesResponse.json()
        setClasses(classesData.classes || [])

      } catch (error) {
        console.error('Error fetching data:', error)
        setSubmitError('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (successMessage) setSuccessMessage('')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    setSubmitError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          studentId: formData.studentId.trim() || undefined,
          classId: formData.classId,
          isActive: formData.isActive
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student')
      }

      setSuccessMessage('Student updated successfully!')
      
      // Refresh student data
      setStudent(data.user)

    } catch (error) {
      console.error('Error updating student:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to update student')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!student) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Student not found or you don't have permission to view this student.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => router.push('/dashboard/principal/students')}
          sx={{ textDecoration: 'none' }}
        >
          Students
        </Link>
        <Typography variant="body2" color="text.primary">
          Edit Student
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/principal/students')}
          variant="outlined"
        >
          Back to Students
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Edit Student: {student.firstName} {student.lastName}
        </Typography>
      </Box>

      {/* Form */}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Name Fields */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  fullWidth
                />
                <TextField
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
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                required
                fullWidth
              />

              {/* Student ID */}
              <TextField
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                helperText="Leave empty to auto-generate"
                fullWidth
              />

              {/* Class Selection */}
              <FormControl fullWidth required error={!!errors.classId}>
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

              {/* Status Selection */}
              <FormControl fullWidth>
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
                <Button
                  onClick={() => router.push('/dashboard/principal/students')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}