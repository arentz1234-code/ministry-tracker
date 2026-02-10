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

  const updateData: any = {};

  if (body.completed !== undefined) {
    updateData.completed = body.completed;
    if (body.completed) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }
  }

  if (body.dueDate) updateData.dueDate = new Date(body.dueDate);
  if (body.priority) updateData.priority = body.priority;
  if (body.reason !== undefined) updateData.reason = body.reason;

  const followUp = await prisma.followUp.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(followUp);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.followUp.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
