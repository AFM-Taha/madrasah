'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

interface AddClassFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddClassForm({ onSuccess, onCancel }: AddClassFormProps) {
  const { token } = useAuth()
  const [className, setClassName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!className.trim()) {
      setError('Class name is required')
      return
    }

    if (!token) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: className.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create class')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating class:', error)
      setError(error instanceof Error ? error.message : 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Class Name"
          value={className}
          onChange={(e) => {
            setClassName(e.target.value)
            if (error) setError('')
          }}
          placeholder="e.g., Grade 1A, Class 10B, etc."
          required
          fullWidth
          autoFocus
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !className.trim()}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            }}
          >
            <CircularProgress 
              size={16} 
              sx={{ 
                visibility: loading ? 'visible' : 'hidden',
                width: loading ? 16 : 0,
                transition: 'width 0.2s ease'
              }} 
            />
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}