import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET(request: Request) {
  // Check for seed secret (optional security)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // If AUTH_SECRET is set, require it to seed
  if (process.env.AUTH_SECRET && secret !== process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized. Add ?secret=YOUR_AUTH_SECRET to seed.' },
      { status: 401 }
    );
  }

  // Check if database already has data
  const existingStaff = await prisma.staff.findFirst();
  if (existingStaff) {
    return NextResponse.json({
      message: 'Database already seeded',
      hint: 'Delete all data first if you want to reseed'
    });
  }

  try {
    // Create admin user
    const adminPassword = await hash('changeme', 12);
    const admin = await prisma.staff.create({
      data: {
        name: 'Admin User',
        email: 'admin@ministry.local',
        password: adminPassword,
        role: 'admin',
        color: '#ef4444',
      },
    });

    // Create staff user
    const staffPassword = await hash('password123', 12);
    const staffUser = await prisma.staff.create({
      data: {
        name: 'John Smith',
        email: 'john@ministry.local',
        password: staffPassword,
        role: 'staff',
        color: '#3b82f6',
      },
    });

    // Create sample students
    const students = await Promise.all([
      prisma.student.create({
        data: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          phone: '555-0101',
          year: 'Junior',
          major: 'Psychology',
          status: 'active',
          tags: 'small group leader,worship team',
          notes: 'Very involved in campus ministry. Leading a small group this semester.',
        },
      }),
      prisma.student.create({
        data: {
          name: 'Michael Chen',
          email: 'michael.chen@university.edu',
          phone: '555-0102',
          year: 'Sophomore',
          major: 'Computer Science',
          status: 'active',
          tags: 'new believer,interested in serving',
          notes: 'Became a Christian last semester. Eager to grow in faith.',
        },
      }),
      prisma.student.create({
        data: {
          name: 'Emily Davis',
          email: 'emily.davis@university.edu',
          phone: '555-0103',
          year: 'Senior',
          major: 'Nursing',
          status: 'active',
          tags: 'mentor,graduating soon',
          notes: 'Strong faith. Mentoring younger students. Graduating in May.',
        },
      }),
    ]);

    // Create sample interactions
    await prisma.interaction.create({
      data: {
        studentId: students[0].id,
        staffId: staffUser.id,
        date: new Date(),
        type: '1-on-1',
        location: 'Campus Coffee Shop',
        notes: 'Great conversation about her small group. She is feeling confident about leading.',
        topics: 'Leadership,Small Groups',
      },
    });

    await prisma.interaction.create({
      data: {
        studentId: students[1].id,
        staffId: staffUser.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        type: '1-on-1',
        location: 'Student Center',
        notes: 'Followed up on his baptism decision. He wants to get baptized next month!',
        topics: 'Gospel,Baptism,Growth',
      },
    });

    // Create sample follow-ups
    await prisma.followUp.create({
      data: {
        studentId: students[1].id,
        staffId: staffUser.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high',
        reason: 'Follow up about baptism preparation',
      },
    });

    await prisma.followUp.create({
      data: {
        studentId: students[2].id,
        staffId: staffUser.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        priority: 'medium',
        reason: 'Discuss post-graduation plans and staying connected',
      },
    });

    // Create sample prayer requests
    await prisma.prayerRequest.create({
      data: {
        studentId: students[0].id,
        staffId: staffUser.id,
        content: 'Pray for wisdom in leading her small group through a difficult study.',
        category: 'spiritual',
        status: 'active',
      },
    });

    await prisma.prayerRequest.create({
      data: {
        studentId: students[1].id,
        staffId: staffUser.id,
        content: 'Pray for his family to be supportive of his faith decision.',
        category: 'family',
        status: 'active',
        isPrivate: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        staff: 2,
        students: 3,
        interactions: 2,
        followUps: 2,
        prayerRequests: 2,
      },
      credentials: {
        admin: { email: 'admin@ministry.local', password: 'changeme' },
        staff: { email: 'john@ministry.local', password: 'password123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
