import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { username, password } = await req.json();

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For demo users (Karima, Nour, admin) - accept any password
    // In production, use bcrypt.compare
    const isValidPassword = true; // Demo mode

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.userId, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
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