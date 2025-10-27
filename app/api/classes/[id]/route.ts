import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import User from '@/models/User'
import { withPrincipalOnly } from '@/lib/middleware'

// GET /api/classes/[id] - Get single class
export const GET = withPrincipalOnly(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    
    const { id } = await params
    const classData = await Class.findById(id).lean()
    
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ class: classData })
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    )
  }
})

// PUT /api/classes/[id] - Update class
export const PUT = withPrincipalOnly(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    
    const { id } = await params
    const { name, isActive } = await req.json()
    
    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      )
    }
    
    // Check if class exists
    const existingClass = await Class.findById(id)
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }
    
    // Check if another class with the same name exists (excluding current class)
    const duplicateClass = await Class.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name.trim()}$`, $options: 'i' }
    })
    
    if (duplicateClass) {
      return NextResponse.json(
        { error: 'Class with this name already exists' },
        { status: 400 }
      )
    }
    
    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { 
        name: name.trim(),
        isActive: isActive !== undefined ? isActive : existingClass.isActive
      },
      { new: true, runValidators: true }
    )
    
    return NextResponse.json({
      message: 'Class updated successfully',
      class: updatedClass
    })
    
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    )
  }
})

// DELETE /api/classes/[id] - Delete class
export const DELETE = withPrincipalOnly(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect()
    
    const { id } = await params
    
    // Check if class exists
    const existingClass = await Class.findById(id)
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }
    
    // Check if any students are assigned to this class
    const studentsInClass = await User.countDocuments({
      role: 'student',
      classId: id
    })
    
    if (studentsInClass > 0) {
      return NextResponse.json(
        { error: `Cannot delete class. ${studentsInClass} student(s) are assigned to this class.` },
        { status: 400 }
      )
    }
    
    // Delete class
    await Class.findByIdAndDelete(id)
    
    return NextResponse.json({
      message: 'Class deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    )
  }
})