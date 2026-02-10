import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const staff = await prisma.staff.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      color: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(staff);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();

  const existingStaff = await prisma.staff.findUnique({
    where: { email: body.email },
  });

  if (existingStaff) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  const hashedPassword = await hash(body.password, 12);

  const staff = await prisma.staff.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'staff',
      color: body.color || '#3b82f6',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      color: true,
    },
  });

  return NextResponse.json(staff, { status: 201 });
}
