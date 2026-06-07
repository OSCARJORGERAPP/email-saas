import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { generateMagicLinkToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const token = generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          email,
          magicLinkToken: token,
          magicLinkExpiresAt: expiresAt,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          tenantId: new ObjectId().toString(),
        },
      },
      { upsert: true }
    );

    // In production, send email via Mailhog or email service
    // For now, log it
    console.log('\n' + '='.repeat(60));
    console.log('🔑 MAGIC LINK ENVIADO');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log(`Token: ${token}`);
    console.log(`Link: http://localhost:3000/auth/verify?token=${token}`);
    console.log('Expira en: 15 minutos');
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({
      message: 'Magic link sent to email',
      token, // For testing only, remove in production
    });
  } catch (error) {
    console.error('Send magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
