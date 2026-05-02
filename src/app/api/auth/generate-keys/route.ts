import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, publicKey } = await req.json();

    // Update user with public key
    const user = await User.findOneAndUpdate(
      { userId: userId },
      { publicKey: publicKey },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Public key stored successfully'
    });
  } catch (error) {
    console.error('Error saving public key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}