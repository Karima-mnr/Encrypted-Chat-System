import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { userId, username, publicKey, keySize } = body;

    console.log('==========================================');
    console.log('📝 API CALLED: /api/auth/generate-keys');
    console.log('   userId:', userId);
    console.log('   username:', username);
    console.log('   keySize:', keySize);
    console.log('   publicKey length:', publicKey?.length);
    console.log('==========================================');

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key required' }, { status: 400 });
    }

    let user = await User.findOne({ userId: userId });
    if (!user) {
      user = await User.findOne({ username: username });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user
    user.publicKey = publicKey;
    user.lastKeySize = keySize;
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    console.log('✅ Updated user:', user.username);
    console.log('   publicKey saved:', !!user.publicKey);
    console.log('   lastKeySize:', user.lastKeySize);
    console.log('   loginCount:', user.loginCount);

    return NextResponse.json({
      success: true,
      keySize: user.lastKeySize,
      loginCount: user.loginCount
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}