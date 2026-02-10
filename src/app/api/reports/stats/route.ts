import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const dateFilter = startDate && endDate ? {
    date: {
      gte: new Date(startDate),
      lte: new Date(endDate + 'T23:59:59'),
    },
  } : {};

  const [
    totalInteractions,
    totalStudents,
    activeStudents,
    interactionsByType,
    interactionsByStaff,
  ] = await Promise.all([
    prisma.interaction.count({ where: dateFilter }),
    prisma.student.count(),
    prisma.student.count({ where: { status: 'active' } }),
    prisma.interaction.groupBy({
      by: ['type'],
      _count: true,
      where: dateFilter,
      orderBy: { _count: { type: 'desc' } },
    }),
    prisma.interaction.groupBy({
      by: ['staffId'],
      _count: true,
      where: dateFilter,
      orderBy: { _count: { staffId: 'desc' } },
    }),
  ]);

  // Get staff details for the grouped results
  const staffIds = interactionsByStaff.map(i => i.staffId);
  const staffMembers = await prisma.staff.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, name: true, color: true },
  });

  const staffMap = new Map(staffMembers.map(s => [s.id, s]));

  const interactionsByStaffWithDetails = interactionsByStaff.map(item => ({
    staff: staffMap.get(item.staffId) || { name: 'Unknown', color: '#6b7280' },
    _count: item._count,
  }));

  return NextResponse.json({
    totalInteractions,
    totalStudents,
    activeStudents,
    interactionsByType: interactionsByType.map(item => ({
      type: item.type,
      _count: item._count,
    })),
    interactionsByStaff: interactionsByStaffWithDetails,
  });
}
