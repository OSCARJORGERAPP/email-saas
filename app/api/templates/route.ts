import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
    const templates = await db
      .collection('emailTemplates')
      .find({ tenantId: payload.tenantId })
      .toArray();

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Fetch templates error:', error);
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

    const { name, subject, handlebarsTemplate } = await request.json();

    if (!name || !subject || !handlebarsTemplate) {
      return NextResponse.json(
        { error: 'Name, subject, and template are required' },
        { status: 400 }
      );
    }

    // Extract variables from Handlebars template
    const variableRegex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(handlebarsTemplate)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const db = await getDatabase();
    const result = await db.collection('emailTemplates').insertOne({
      tenantId: payload.tenantId,
      name,
      subject,
      handlebarsTemplate,
      variables,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        _id: result.insertedId,
        name,
        subject,
        handlebarsTemplate,
        variables,
        createdAt: new Date(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
