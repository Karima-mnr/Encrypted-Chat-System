import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    console.log(' Fetching public key for username:', username);

    const user = await User.findOne({ username });

    if (!user) {
      console.error(' User not found:', username);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(' Found user:', user.username);
    console.log(' Has public key:', !!user.publicKey);
    console.log(' Public key length:', user.publicKey?.length || 0);

    return NextResponse.json({
      username: user.username,
      publicKey: user.publicKey,
      hasKeys: !!user.publicKey
    });
  } catch (error) {
    console.error('Error fetching public key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}