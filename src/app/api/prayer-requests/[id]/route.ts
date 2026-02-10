import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const prayerRequest = await prisma.prayerRequest.update({
    where: { id: params.id },
    data: {
      content: body.content,
      category: body.category,
      status: body.status,
      isPrivate: body.isPrivate,
    },
  });

  return NextResponse.json(prayerRequest);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.prayerRequest.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
