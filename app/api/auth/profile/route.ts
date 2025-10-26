import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withAllRoles } from '@/lib/middleware';

// GET - Get current user profile
export const GET = withAllRoles(async (req) => {
  try {
    await dbConnect();

    const user = await User.findById(req.user?.userId).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT - Update current user profile (limited fields)
export const PUT = withAllRoles(async (req) => {
  try {
    await dbConnect();

    const updateData = await req.json();
    const userId = req.user?.userId;

    // Only allow certain fields to be updated by users themselves
    const allowedFields = ['firstName', 'lastName', 'phone'];
    const filteredData: any = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Handle password change
    if (updateData.currentPassword && updateData.newPassword) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const { comparePassword } = await import('@/lib/auth');
      const isCurrentPasswordValid = await comparePassword(updateData.currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      filteredData.password = await hashPassword(updateData.newPassword);
    }

    // Handle phone update - check for duplicates
    if (filteredData.phone) {
      const existingPhone = await User.findOne({ 
        phone: filteredData.phone,
        _id: { $ne: userId }
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});