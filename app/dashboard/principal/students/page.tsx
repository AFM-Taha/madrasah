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
  Tabs,
  Tab,
} from '@mui/material'
import {
  Search,
  Add,
  Edit,
  Delete,
  PersonAdd,
  School,
  Class,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import AddStudentForm from './components/AddStudentForm'
import AddClassForm from './components/AddClassForm'
import ManageClassesModal from './components/ManageClassesModal'

interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  studentId?: string
  classId?: {
    _id: string
    name: string
  }
  isActive: boolean
  createdAt: string
}

interface Class {
  _id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface StudentsResponse {
  users: Student[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface ClassesResponse {
  classes: Class[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function StudentsPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  // Tab state
  const [activeTab, setActiveTab] = useState(0) // 0 = Students, 1 = Classes

  // Students data
  const [students, setStudents] = useState<Student[]>([])
  const [totalStudents, setTotalStudents] = useState(0)

  // Classes data
  const [classes, setClasses] = useState<Class[]>([])
  const [totalClasses, setTotalClasses] = useState(0)

  // Class filter data
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all') // 'all' or class._id

  // Common states
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  // Dialog states
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [addClassOpen, setAddClassOpen] = useState(false)
  const [manageClassesOpen, setManageClassesOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  })

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const fetchStudents = async () => {
    if (!token) return

    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        role: 'student',
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchTerm,
      })

      // Add class filter if a specific class is selected
      if (selectedClassFilter !== 'all') {
        params.append('class', selectedClassFilter)
      }

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data: StudentsResponse = await response.json()
      setStudents(data.users || [])
      setTotalStudents(data.pagination.total)
    } catch (error) {
      console.error('Error fetching students:', error)
      showSnackbar('Failed to fetch students', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/classes?page=${
          page + 1
        }&limit=${rowsPerPage}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch classes')
      }

      const data: ClassesResponse = await response.json()
      setClasses(data.classes || [])
      setTotalClasses(data.pagination.total)
    } catch (error) {
      console.error('Error fetching classes:', error)
      showSnackbar('Failed to fetch classes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllClasses = async () => {
    if (!token) return

    try {
      const response = await fetch(
        `/api/classes?page=1&limit=100&search=`, // Fetch all classes without pagination
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch all classes')
      }

      const data: ClassesResponse = await response.json()
      setAllClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching all classes:', error)
      showSnackbar('Failed to fetch all classes', 'error')
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setPage(0)
    setSearchTerm('')
  }

  const handleClassFilterChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedClassFilter(newValue)
    setPage(0) // Reset to first page when filter changes
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/users/${studentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete student')
      }

      showSnackbar('Student deleted successfully', 'success')
      fetchStudents()
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    } catch (error) {
      console.error('Error deleting student:', error)
      showSnackbar('Failed to delete student', 'error')
    }
  }

  const handleStudentAdded = () => {
    setAddStudentOpen(false)
    fetchStudents()
    showSnackbar('Student added successfully', 'success')
  }

  const handleClassAdded = () => {
    setAddClassOpen(false)
    fetchAllClasses() // Refresh class filter tabs
    showSnackbar('Class added successfully', 'success')
  }

  const handleClassesUpdated = () => {
    showSnackbar('Classes updated successfully', 'success')
    fetchStudents() // Refresh to show updated class names
    fetchAllClasses() // Refresh class filter tabs
  }

  // Fetch all classes on component mount for filter tabs
  useEffect(() => {
    if (token) {
      fetchAllClasses()
    }
  }, [token])

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    if (activeTab === 0) {
      fetchStudents()
    } else {
      fetchClasses()
    }
  }, [page, rowsPerPage, searchTerm, token, activeTab, selectedClassFilter])

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Manage Students
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant='outlined'
            startIcon={<Class />}
            onClick={() => setAddClassOpen(true)}
            sx={{ minWidth: 'auto' }}
          >
            Add New Class
          </Button>
          <Button
            variant='outlined'
            startIcon={<School />}
            onClick={() => setManageClassesOpen(true)}
            sx={{ minWidth: 'auto' }}
          >
            Manage Classes
          </Button>
          <Button
            variant='contained'
            startIcon={<PersonAdd />}
            onClick={() => setAddStudentOpen(true)}
            sx={{ minWidth: 'auto' }}
          >
            Add New Student
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        >
          <Tab label='Students' />
          <Tab label='Classes' />
        </Tabs>
      </Box>

      {/* Search and Stats */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <TextField
                placeholder={
                  activeTab === 0
                    ? 'Search students by name, email, or student ID...'
                    : 'Search classes by name...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
              <Typography variant='body2' color='text.secondary'>
                {activeTab === 0
                  ? `Total Students: ${totalStudents}`
                  : `Total Classes: ${totalClasses}`}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Class Filter Tabs - Only show when Students tab is active */}
      {activeTab === 0 && (
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={selectedClassFilter}
            onChange={handleClassFilterChange}
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                py: 1,
                fontSize: '0.875rem',
              },
              '& .MuiTabs-indicator': {
                height: 2,
              },
            }}
          >
            <Tab label='All Students' value='all' />
            {allClasses.map((classItem) => (
              <Tab
                key={classItem._id}
                label={classItem.name}
                value={classItem._id}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Data Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {activeTab === 0 ? (
                  // Students Table Headers
                  <>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </>
                ) : (
                  // Classes Table Headers
                  <>
                    <TableCell>Class Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={activeTab === 0 ? 7 : 5} align='center'>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : activeTab === 0 ? (
                // Students Table Body
                students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id} hover>
                      <TableCell>{student.studentId || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight='medium'>
                          {student.firstName} {student.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {student.classId ? (
                          <Chip
                            label={student.classId.name}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        ) : (
                          'No Class'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.isActive ? 'Active' : 'Inactive'}
                          size='small'
                          color={student.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <IconButton
                            size='small'
                            onClick={() =>
                              router.push(
                                `/dashboard/principal/students/edit/${student._id}`
                              )
                            }
                            color='primary'
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setStudentToDelete(student)
                              setDeleteDialogOpen(true)
                            }}
                            color='error'
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : // Classes Table Body
              classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem._id} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {classItem.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={classItem.isActive ? 'Active' : 'Inactive'}
                        size='small'
                        color={classItem.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(classItem.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(classItem.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align='center'>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          size='small'
                          color='primary'
                          title='Edit Class'
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          title='Delete Class'
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component='div'
          count={activeTab === 0 ? totalStudents : totalClasses}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Add Student Dialog */}
      <Dialog
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd />
            Add New Student
          </Box>
        </DialogTitle>
        <DialogContent>
          <AddStudentForm
            onSuccess={handleStudentAdded}
            onCancel={() => setAddStudentOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog
        open={addClassOpen}
        onClose={() => setAddClassOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Class />
            Add New Class
          </Box>
        </DialogTitle>
        <DialogContent>
          <AddClassForm
            onSuccess={handleClassAdded}
            onCancel={() => setAddClassOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Manage Classes Dialog */}
      <ManageClassesModal
        open={manageClassesOpen}
        onClose={() => setManageClassesOpen(false)}
        onClassesUpdated={handleClassesUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete student &quot;
            {studentToDelete?.firstName} {studentToDelete?.lastName}&quot;? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              studentToDelete && handleDeleteStudent(studentToDelete._id)
            }
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
