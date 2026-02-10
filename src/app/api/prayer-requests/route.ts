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
  const status = searchParams.get('status');

  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  const prayerRequests = await prisma.prayerRequest.findMany({
    where,
    include: { student: true, staff: true },
    orderBy: { date: 'desc' },
  });

  // Filter private requests
  const filtered = role === 'admin'
    ? prayerRequests
    : prayerRequests.filter((p) => !p.isPrivate || p.staffId === userId);

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any)?.id;
  const body = await request.json();

  const prayerRequest = await prisma.prayerRequest.create({
    data: {
      studentId: body.studentId,
      staffId: userId,
      content: body.content,
      category: body.category || 'other',
      isPrivate: body.isPrivate || false,
    },
  });

  return NextResponse.json(prayerRequest, { status: 201 });
}
