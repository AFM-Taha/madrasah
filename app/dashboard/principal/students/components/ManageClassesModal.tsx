'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Chip
} from '@mui/material'
import { Edit, Delete, Save, Cancel, School } from '@mui/icons-material'

interface ManageClassesModalProps {
  open: boolean
  onClose: () => void
  onClassesUpdated: () => void
}

interface Class {
  _id: string
  name: string
  isActive: boolean
  createdAt: string
}

export default function ManageClassesModal({ open, onClose, onClassesUpdated }: ManageClassesModalProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/classes?limit=100', {
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
      setError('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchClasses()
    }
  }, [open])

  const handleEdit = (classItem: Class) => {
    setEditingId(classItem._id)
    setEditingName(classItem.name)
    setError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setError('')
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      setError('Class name cannot be empty')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/classes/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingName.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update class')
      }

      setEditingId(null)
      setEditingName('')
      setError('')
      fetchClasses()
      onClassesUpdated()
    } catch (error) {
      console.error('Error updating class:', error)
      setError(error instanceof Error ? error.message : 'Failed to update class')
    }
  }

  const handleDelete = async (classId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete class')
      }

      setDeleteConfirm(null)
      fetchClasses()
      onClassesUpdated()
    } catch (error) {
      console.error('Error deleting class:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete class')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School />
          Manage Classes
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : classes.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No classes found. Create your first class to get started.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem._id} hover>
                    <TableCell>
                      {editingId === classItem._id ? (
                        <TextField
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          size="small"
                          fullWidth
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit()
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" fontWeight="medium">
                          {classItem.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={classItem.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={classItem.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(classItem.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {editingId === classItem._id ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={handleSaveEdit}
                            color="primary"
                          >
                            <Save />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            color="default"
                          >
                            <Cancel />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(classItem)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm(classItem._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this class? This action cannot be undone.
            Students assigned to this class will need to be reassigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}