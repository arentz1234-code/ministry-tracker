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
  const searchParams = request.nextUrl.searchParams;
  const completed = searchParams.get('completed');

  const where: any = {};

  if (role !== 'admin') {
    where.staffId = userId;
  }

  if (completed === 'true') {
    where.completed = true;
  } else if (completed === 'false') {
    where.completed = false;
  }

  const followUps = await prisma.followUp.findMany({
    where,
    include: { student: true, staff: true },
    orderBy: { dueDate: 'asc' },
  });

  return NextResponse.json(followUps);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any)?.id;
  const body = await request.json();

  const followUp = await prisma.followUp.create({
    data: {
      studentId: body.studentId,
      staffId: userId,
      dueDate: new Date(body.dueDate),
      priority: body.priority || 'medium',
      reason: body.reason || null,
    },
  });

  return NextResponse.json(followUp, { status: 201 });
}
