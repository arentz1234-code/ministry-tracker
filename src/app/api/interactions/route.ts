import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any)?.id;
  const role = (session.user as any)?.role;

  const interactions = await prisma.interaction.findMany({
    include: { student: true, staff: true },
    orderBy: { date: 'desc' },
  });

  // Filter confidential interactions
  const filtered = role === 'admin'
    ? interactions
    : interactions.filter((i) => !i.isConfidential || i.staffId === userId);

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any)?.id;
  const body = await request.json();

  const interaction = await prisma.interaction.create({
    data: {
      studentId: body.studentId,
      staffId: userId,
      date: new Date(body.date),
      type: body.type,
      location: body.location || null,
      notes: body.notes || null,
      isConfidential: body.isConfidential || false,
      topics: body.topics || null,
      attachments: body.attachments || null,
    },
  });

  return NextResponse.json(interaction, { status: 201 });
}
