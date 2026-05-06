import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';  // Use bcryptjs (already installed)
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { username, password } = await req.json();

    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // bcryptjs works with $2a$ hashes
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user.userId, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'my_secret_key',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}