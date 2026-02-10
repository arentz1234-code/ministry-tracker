import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      interactions: {
        orderBy: { date: 'desc' },
        include: { staff: true },
      },
      followUps: {
        orderBy: { dueDate: 'asc' },
        include: { staff: true },
      },
      prayerRequests: {
        orderBy: { date: 'desc' },
        include: { staff: true },
      },
      actionItems: {
        orderBy: { createdAt: 'desc' },
        include: { staff: true },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Filter confidential interactions for non-admin/non-creator
  const userId = (session.user as any)?.id;
  const role = (session.user as any)?.role;

  if (role !== 'admin') {
    student.interactions = student.interactions.filter(
      (i) => !i.isConfidential || i.staffId === userId
    );
    student.prayerRequests = student.prayerRequests.filter(
      (p) => !p.isPrivate || p.staffId === userId
    );
  }

  return NextResponse.json(student);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const student = await prisma.student.update({
    where: { id: params.id },
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      year: body.year,
      major: body.major || null,
      address: body.address || null,
      status: body.status,
      photo: body.photo || null,
      tags: body.tags || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(student);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can delete students' }, { status: 403 });
  }

  await prisma.student.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
