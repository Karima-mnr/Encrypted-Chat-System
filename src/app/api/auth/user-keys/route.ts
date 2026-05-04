import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate next key size (progressively larger)
    const currentSize = user.lastKeySize || 512;
    const nextSize = Math.min(currentSize + 512, 4096);

    return NextResponse.json({
      username: user.username,
      publicKey: user.publicKey,
      lastKeySize: currentSize,
      nextKeySize: nextSize,
      loginCount: user.loginCount,
      hasKeys: !!user.publicKey
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}