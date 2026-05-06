import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { username, email, password } = await req.json();

    console.log('📝 Signup attempt:', { username, email });

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get next user ID
    const userCount = await User.countDocuments();
    const userId = `USER_${String(userCount + 1).padStart(3, '0')}`;

    // Create new user
    const newUser = await User.create({
      userId: userId,
      username: username,
      email: email,
      passwordHash: hashedPassword,
      role: 'user',
      publicKey: null,
      lastKeySize: 512,
      loginCount: 0,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });

    console.log('✅ User created:', newUser.username);
    console.log('📦 Password hash stored:', newUser.passwordHash);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}