import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, 'userId username role');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}