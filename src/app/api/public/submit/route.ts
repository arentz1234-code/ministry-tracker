import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, gender, year, major, prayerRequest } = body;

    // Validate required fields
    if (!name || !phone || !year || !gender) {
      return NextResponse.json(
        { error: 'Name, phone, gender, and year are required' },
        { status: 400 }
      );
    }

    // Check if student already exists by phone or email
    let student = await prisma.student.findFirst({
      where: {
        OR: [
          { phone: phone },
          ...(email ? [{ email: email }] : []),
        ],
      },
    });

    if (student) {
      // Update existing student
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name,
          email: email || student.email,
          phone,
          gender: gender || student.gender,
          year,
          major: major || student.major,
        },
      });
    } else {
      // Create new student
      student = await prisma.student.create({
        data: {
          name,
          email: email || null,
          phone,
          gender: gender || null,
          year,
          major: major || null,
          status: 'active',
          tags: 'new,form submission',
          notes: `Submitted via public form on ${new Date().toLocaleDateString()}`,
        },
      });
    }

    // If there's a prayer request, create it
    if (prayerRequest && prayerRequest.trim()) {
      // Get the first admin or staff member to assign the prayer request
      const staff = await prisma.staff.findFirst({
        where: { role: 'admin' },
      });

      if (staff) {
        await prisma.prayerRequest.create({
          data: {
            studentId: student.id,
            staffId: staff.id,
            content: prayerRequest.trim(),
            category: 'other',
            status: 'active',
            isPrivate: false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    console.error('Public form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
