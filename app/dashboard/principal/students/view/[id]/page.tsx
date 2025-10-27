'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Chip,
  Divider
} from '@mui/material'
import { ArrowBack, Edit, Delete } from '@mui/icons-material'
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
  createdAt: string
  updatedAt: string
}

interface Class {
  _id: string
  name: string
  isActive: boolean
}

export default function ViewStudentPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [studentClass, setStudentClass] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        const response = await fetch(`/api/users/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch student data')
        }

        const data = await response.json()
        setStudent(data.user)

        // Fetch class data if student has a class
        if (data.user.classId) {
          const classResponse = await fetch(`/api/classes/${data.user.classId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (classResponse.ok) {
            const classData = await classResponse.json()
            setStudentClass(classData.class)
          }
        }

      } catch (error) {
        console.error('Error fetching student:', error)
        setError('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const handleEdit = () => {
    router.push(`/dashboard/principal/students/edit/${studentId}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete student')
      }

      alert('Student deleted successfully')
      router.push('/dashboard/principal/students')

    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !student) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Student not found or you don\'t have permission to view this student.'}
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
          View Student
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard/principal/students')}
            variant="outlined"
          >
            Back to Students
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {student.firstName} {student.lastName}
          </Typography>
          <Chip
            label={student.isActive ? 'Active' : 'Inactive'}
            color={student.isActive ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<Edit />}
            onClick={handleEdit}
            variant="contained"
          >
            Edit
          </Button>
          <Button
            startIcon={<Delete />}
            onClick={handleDelete}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Student Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Student Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Personal Information */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  First Name
                </Typography>
                <Typography variant="body1">
                  {student.firstName}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Name
                </Typography>
                <Typography variant="body1">
                  {student.lastName}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1">
                  {student.email}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {student.phone || 'Not provided'}
                </Typography>
              </Box>
            </Box>

            {/* Academic Information */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Student ID
                </Typography>
                <Typography variant="body1">
                  {student.studentId || 'Not assigned'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Class
                </Typography>
                <Typography variant="body1">
                  {studentClass ? studentClass.name : 'Not assigned'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={student.isActive ? 'Active' : 'Inactive'}
                  color={student.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* System Information */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            System Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(student.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(student.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}