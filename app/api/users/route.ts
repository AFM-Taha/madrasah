import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withPrincipalOnly } from '@/lib/middleware';

// GET - List all users (Principal only)
export const GET = withPrincipalOnly(async (req) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build query
    let query: any = {};
    
    if (role && ['teacher', 'student'].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST - Create new user (Principal only)
export const POST = withPrincipalOnly(async (req) => {
  try {
    await dbConnect();

    const userData = await req.json();
    const {
      email,
      phone,
      password,
      role,
      firstName,
      lastName,
      subjects,
      studentId,
      grade,
      section,
      parentContact,
    } = userData;

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, role, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either teacher or student' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Check if studentId already exists (for students)
    if (role === 'student' && studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user object
    const newUserData: any = {
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      createdBy: req.user?.userId,
    };

    // Add role-specific fields
    if (role === 'teacher') {
      newUserData.subjects = subjects || [];
    } else if (role === 'student') {
      newUserData.studentId = studentId;
      newUserData.grade = grade;
      newUserData.section = section;
      newUserData.parentContact = parentContact;
    }

    // Create user
    const user = new User(newUserData);
    await user.save();

    // Return user data (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});