'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material'
import { Search, Add, Edit, Delete, PersonAdd } from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import AddTeacherForm from './components/AddTeacherForm'

interface Teacher {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
}

interface TeachersResponse {
  users: Teacher[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function TeachersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [addTeacherOpen, setAddTeacherOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchTerm,
        role: 'teacher',
      })

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data: TeachersResponse = await response.json()
        setTeachers(data.users || [])
        setTotalTeachers(data.pagination?.total || 0)
      } else {
        console.error('Failed to fetch teachers')
        showSnackbar('Failed to fetch teachers', 'error')
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      showSnackbar('Error fetching teachers', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${teacherToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        showSnackbar('Teacher deleted successfully', 'success')
        fetchTeachers()
      } else {
        showSnackbar('Failed to delete teacher', 'error')
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
      showSnackbar('Error deleting teacher', 'error')
    } finally {
      setDeleteDialogOpen(false)
      setTeacherToDelete(null)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleTeacherAdded = () => {
    setAddTeacherOpen(false)
    fetchTeachers()
    showSnackbar('Teacher added successfully', 'success')
  }

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchTeachers()
  }, [page, rowsPerPage, searchTerm])

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Manage Teachers
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => setAddTeacherOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add New Teacher
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder='Search teachers by name or phone number...'
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2 }}
          />
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Phone Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center'>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center'>
                      No teachers found
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher) => (
                    <TableRow key={teacher._id} hover>
                      <TableCell>
                        {teacher.firstName} {teacher.lastName}
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={teacher.isActive ? 'Active' : 'Inactive'}
                          size='small'
                          color={teacher.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() =>
                            router.push(
                              `/dashboard/principal/teachers/edit/${teacher._id}`
                            )
                          }
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => {
                            setTeacherToDelete(teacher)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component='div'
            count={totalTeachers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Add Teacher Dialog */}
      <Dialog
        open={addTeacherOpen}
        onClose={() => setAddTeacherOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd />
            Add New Teacher
          </Box>
        </DialogTitle>
        <DialogContent>
          <AddTeacherForm
            onSuccess={handleTeacherAdded}
            onCancel={() => setAddTeacherOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete teacher &quot
            {teacherToDelete?.firstName} {teacherToDelete?.lastName}&quot? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteTeacher}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}