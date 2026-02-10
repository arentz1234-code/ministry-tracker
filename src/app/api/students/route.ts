import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');
  const year = searchParams.get('year');
  const tag = searchParams.get('tag');

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { major: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  if (year && year !== 'all') {
    where.year = year;
  }

  if (tag) {
    where.tags = { contains: tag };
  }

  const students = await prisma.student.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          interactions: true,
          followUps: true,
          prayerRequests: true,
        },
      },
    },
  });

  return NextResponse.json(students);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const student = await prisma.student.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      year: body.year,
      major: body.major || null,
      address: body.address || null,
      status: body.status || 'active',
      photo: body.photo || null,
      tags: body.tags || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(student, { status: 201 });
}
