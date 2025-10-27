import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withPrincipalOnly } from '@/lib/middleware';

// GET - Get user by ID (Principal only)
export const GET = withPrincipalOnly(async (req, { params }) => {
  try {
    await dbConnect();

    const { id } = await params;

    const user = await User.findById(id).select('-password').populate('classId', 'name').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT - Update user (Principal only)
export const PUT = withPrincipalOnly(async (req, { params }) => {
  try {
    await dbConnect();

    const { id } = await params;
    const updateData = await req.json();

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.createdBy;

    // Handle password update
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Handle email update - check for duplicates
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // Handle phone update - check for duplicates
    if (updateData.phone) {
      const existingPhone = await User.findOne({ 
        phone: updateData.phone,
        _id: { $ne: id }
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Handle studentId update - check for duplicates
    if (updateData.studentId) {
      const existingStudentId = await User.findOne({ 
        studentId: updateData.studentId,
        _id: { $ne: id }
      });
      if (existingStudentId) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 400 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE - Delete user (Principal only)
export const DELETE = withPrincipalOnly(async (req, { params }) => {
  try {
    await dbConnect();

    const { id } = await params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of principal accounts
    if (user.role === 'principal') {
      return NextResponse.json(
        { error: 'Cannot delete principal accounts' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await User.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({
      message: 'User deactivated successfully',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});