import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    const [
      clientsCount,
      templatesCount,
      campaignsCount,
      emailsSentCount,
    ] = await Promise.all([
      db.collection('clients').countDocuments({ tenantId: payload.tenantId }),
      db.collection('emailTemplates').countDocuments({ tenantId: payload.tenantId }),
      db.collection('emailCampaigns').countDocuments({ tenantId: payload.tenantId }),
      db.collection('emailCampaigns').aggregate([
        { $match: { tenantId: payload.tenantId } },
        { $group: { _id: null, total: { $sum: '$totalEmailsSent' } } },
      ]).toArray(),
    ]);

    return NextResponse.json({
      totalClients: clientsCount,
      totalTemplates: templatesCount,
      totalCampaigns: campaignsCount,
      totalEmailsSent: emailsSentCount[0]?.total || 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
