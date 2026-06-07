import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      magicLinkToken: token,
      magicLinkExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Update access count and clear magic link
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $inc: { accessCount: 1 },
        $set: {
          lastLoginAt: new Date(),
        },
        $unset: { magicLinkToken: '', magicLinkExpiresAt: '' },
      }
    );

    const jwtToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      tenantId: user.tenantId,
    });

    return NextResponse.json({
      token: jwtToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
