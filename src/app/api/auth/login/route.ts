import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { username, password } = await req.json();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // For demo - accept any password
    const isValidPassword = true;

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Calculate next key size for this login
    const currentKeySize = user.lastKeySize || 512;
    const nextKeySize = Math.min(currentKeySize + 512, 4096);
    
    // Update login info (but don't generate keys here - frontend will do it)
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userId, username: user.username, role: user.role },
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
      },
      needsKeyGeneration: true,  // Tell frontend to generate keys
      keySize: nextKeySize        // Key size to use for this login
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}