import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Class from '@/models/Class'
import { withPrincipalOnly } from '@/lib/middleware'

// GET /api/classes - Get all classes
export const GET = withPrincipalOnly(async (req: NextRequest) => {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    // Build search query
    const searchQuery = search
      ? { name: { $regex: search, $options: 'i' } }
      : {}
    
    // Get classes with pagination
    const classes = await Class.find(searchQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Class.countDocuments(searchQuery)
    
    return NextResponse.json({
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
})

// POST /api/classes - Create new class
export const POST = withPrincipalOnly(async (req: NextRequest) => {
  try {
    await dbConnect()
    
    const { name } = await req.json()
    
    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      )
    }
    
    // Check if class already exists
    const existingClass = await Class.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    })
    
    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this name already exists' },
        { status: 400 }
      )
    }
    
    // Create new class
    const newClass = new Class({
      name: name.trim()
    })
    
    await newClass.save()
    
    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
})