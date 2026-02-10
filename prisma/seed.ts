import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hash('changeme', 12);
  const admin = await prisma.staff.upsert({
    where: { email: 'admin@ministry.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@ministry.local',
      password: adminPassword,
      role: 'admin',
      color: '#3b82f6',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create a staff member
  const staffPassword = await hash('password123', 12);
  const staff = await prisma.staff.upsert({
    where: { email: 'john@ministry.local' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'john@ministry.local',
      password: staffPassword,
      role: 'staff',
      color: '#22c55e',
    },
  });
  console.log('✅ Created staff user:', staff.email);

  // Create sample students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        phone: '555-0101',
        year: 'Junior',
        major: 'Biology',
        address: 'Smith Hall Room 204',
        status: 'active',
        tags: 'small group,leader',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Michael Chen',
        email: 'michael.chen@university.edu',
        phone: '555-0102',
        year: 'Freshman',
        major: 'Computer Science',
        address: 'Johnson Hall Room 112',
        status: 'active',
        tags: 'new believer',
      },
    }),
    prisma.student.create({
      data: {
        name: 'Emily Davis',
        email: 'emily.davis@university.edu',
        phone: '555-0103',
        year: 'Senior',
        major: 'Psychology',
        address: 'Off Campus - 123 Main St',
        status: 'active',
        tags: 'leader,small group',
      },
    }),
  ]);
  console.log('✅ Created', students.length, 'sample students');

  // Create sample interactions
  const interactions = await Promise.all([
    prisma.interaction.create({
      data: {
        studentId: students[0].id,
        staffId: admin.id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: '1-on-1',
        location: 'Campus Coffee Shop',
        notes: 'Great conversation about her leadership journey. Discussed challenges with balancing school and ministry.',
        topics: 'Discipleship,Growth',
      },
    }),
    prisma.interaction.create({
      data: {
        studentId: students[1].id,
        staffId: staff.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        type: 'Small group',
        location: 'Student Center',
        notes: 'First small group meeting. Michael seemed engaged and asked good questions.',
        topics: 'Gospel,Questions',
      },
    }),
  ]);
  console.log('✅ Created', interactions.length, 'sample interactions');

  // Create sample follow-ups
  const followUps = await Promise.all([
    prisma.followUp.create({
      data: {
        studentId: students[1].id,
        staffId: staff.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'high',
        reason: 'Follow up on questions from small group - potential new believer',
      },
    }),
    prisma.followUp.create({
      data: {
        studentId: students[2].id,
        staffId: admin.id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
        priority: 'medium',
        reason: 'Check in about graduation plans and continued involvement',
      },
    }),
  ]);
  console.log('✅ Created', followUps.length, 'sample follow-ups');

  // Create sample prayer requests
  const prayerRequests = await Promise.all([
    prisma.prayerRequest.create({
      data: {
        studentId: students[0].id,
        staffId: admin.id,
        content: 'Praying for wisdom in balancing leadership responsibilities with academics',
        category: 'academic',
        status: 'active',
      },
    }),
    prisma.prayerRequest.create({
      data: {
        studentId: students[1].id,
        staffId: staff.id,
        content: 'Family situation - parents going through a difficult time',
        category: 'family',
        status: 'ongoing',
        isPrivate: true,
      },
    }),
  ]);
  console.log('✅ Created', prayerRequests.length, 'sample prayer requests');

  // Create sample action items
  const actionItems = await Promise.all([
    prisma.actionItem.create({
      data: {
        staffId: admin.id,
        studentId: students[0].id,
        description: 'Send Sarah leadership training resources',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    }),
    prisma.actionItem.create({
      data: {
        staffId: staff.id,
        description: 'Prepare welcome packets for new students',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
    }),
  ]);
  console.log('✅ Created', actionItems.length, 'sample action items');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin@ministry.local / changeme');
  console.log('   Staff: john@ministry.local / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
