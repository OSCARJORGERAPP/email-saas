import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const campaigns = await db
      .collection('emailCampaigns')
      .find({ tenantId: payload.tenantId })
      .toArray();

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Fetch campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, templateId, clientList } = await request.json();

    if (!name || !templateId || !clientList || clientList.length === 0) {
      return NextResponse.json(
        { error: 'Name, template, and clients are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get template
    const template = await db.collection('emailTemplates').findOne({
      _id: new ObjectId(templateId),
      tenantId: payload.tenantId,
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get client details
    interface Client {
      _id: ObjectId;
      email: string;
      name: string;
    }
    const clients = (await db
      .collection('clients')
      .find({
        _id: { $in: clientList.map((id: string) => new ObjectId(id)) },
        tenantId: payload.tenantId,
      })
      .toArray()) as Client[];

    // Simulate sending emails (in production, queue to email service)
    interface ClientResult {
      clientId: string;
      email: string;
      status: string;
      timestamp: Date;
    }
    const results: ClientResult[] = clients.map((client) => ({
      clientId: String(client._id),
      email: client.email,
      status: 'sent',
      timestamp: new Date(),
    }));

    // Log campaign details
    console.log('\n' + '='.repeat(60));
    console.log(`📧 CAMPAÑA ENVIADA: "${name}"`);
    console.log('='.repeat(60));
    console.log(`Template: ${template.name}`);
    console.log(`Asunto: ${template.subject}`);
    console.log(`Clientes: ${clients.length}`);
    console.log('\nEmails enviados a:');
    clients.forEach((client) => {
      console.log(`  ✓ ${client.name} <${client.email}>`);
    });
    console.log('='.repeat(60) + '\n');

    // Create campaign record
    const result = await db.collection('emailCampaigns').insertOne({
      tenantId: payload.tenantId,
      name,
      templateId: new ObjectId(templateId),
      clientList: clientList.map((id: string) => new ObjectId(id)),
      status: 'sent',
      totalEmailsSent: clients.length,
      sentCount: clients.length,
      results,
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        _id: result.insertedId,
        name,
        status: 'sent',
        clientCount: clientList.length,
        sentCount: clients.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
