import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  Bell,
  Calendar,
  Heart,
  CheckSquare,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

async function getDashboardStats(userId: string, role: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    recentInteractions,
    overdueFollowUps,
    upcomingFollowUps,
    activePrayerRequests,
    pendingActionItems,
  ] = await Promise.all([
    prisma.student.count({ where: { status: 'active' } }),
    prisma.interaction.count({
      where: { date: { gte: sevenDaysAgo } },
    }),
    prisma.followUp.count({
      where: {
        completed: false,
        dueDate: { lt: now },
        ...(role !== 'admin' ? { staffId: userId } : {}),
      },
    }),
    prisma.followUp.findMany({
      where: {
        completed: false,
        dueDate: { gte: now, lte: endOfWeek },
        ...(role !== 'admin' ? { staffId: userId } : {}),
      },
      include: { student: true, staff: true },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.prayerRequest.count({
      where: {
        status: 'active',
        ...(role !== 'admin' ? { OR: [{ staffId: userId }, { isPrivate: false }] } : {}),
      },
    }),
    prisma.actionItem.count({
      where: {
        status: { in: ['pending', 'in_progress'] },
        ...(role !== 'admin' ? { staffId: userId } : {}),
      },
    }),
  ]);

  const recentInteractionsList = await prisma.interaction.findMany({
    where: role !== 'admin' ? { staffId: userId } : {},
    include: { student: true, staff: true },
    orderBy: { date: 'desc' },
    take: 5,
  });

  return {
    totalStudents,
    recentInteractions,
    overdueFollowUps,
    upcomingFollowUps,
    activePrayerRequests,
    pendingActionItems,
    recentInteractionsList,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role || 'staff';

  const stats = await getDashboardStats(userId, role);

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', href: '/students' },
    { label: 'Recent Interactions', value: stats.recentInteractions, icon: MessageSquare, color: 'bg-green-500', href: '/students' },
    { label: 'Overdue Follow-Ups', value: stats.overdueFollowUps, icon: Bell, color: stats.overdueFollowUps > 0 ? 'bg-red-500' : 'bg-slate-400', href: '/follow-ups' },
    { label: 'Active Prayer Requests', value: stats.activePrayerRequests, icon: Heart, color: 'bg-purple-500', href: '/prayer-requests' },
    { label: 'Pending Tasks', value: stats.pendingActionItems, icon: CheckSquare, color: 'bg-orange-500', href: '/follow-ups' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-slate-500">Here's what's happening with your ministry</p>
        </div>
        <div className="flex gap-3">
          <Link href="/students/new" className="btn-primary flex items-center gap-2 text-sm sm:text-base">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Interactions</h2>
            <Link href="/students" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stats.recentInteractionsList.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInteractionsList.map((interaction) => (
                <Link
                  key={interaction.id}
                  href={`/students/${interaction.studentId}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: interaction.staff?.color || '#3b82f6' }}
                  >
                    {interaction.student?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {interaction.student?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {interaction.type} • {format(new Date(interaction.date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <span className="badge-gray">{interaction.type}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No recent interactions</p>
          )}
        </div>

        {/* Upcoming Follow-Ups */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Follow-Ups</h2>
            <Link href="/follow-ups" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stats.upcomingFollowUps.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingFollowUps.map((followUp) => (
                <Link
                  key={followUp.id}
                  href={`/students/${followUp.studentId}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: followUp.staff?.color || '#3b82f6' }}
                  >
                    {followUp.student?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {followUp.student?.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {followUp.reason || 'Follow-up scheduled'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">
                      {format(new Date(followUp.dueDate), 'MMM d')}
                    </p>
                    <span className={`badge ${
                      followUp.priority === 'high' ? 'badge-danger' :
                      followUp.priority === 'medium' ? 'badge-warning' : 'badge-gray'
                    }`}>
                      {followUp.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No upcoming follow-ups</p>
          )}
        </div>
      </div>
    </div>
  );
}
