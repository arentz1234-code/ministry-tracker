'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  Download,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ReportStats {
  totalInteractions: number;
  totalStudents: number;
  activeStudents: number;
  interactionsByType: { type: string; _count: number }[];
  interactionsByStaff: { staff: { name: string; color: string }; _count: number }[];
  recentActivity: { date: string; count: number }[];
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState<string | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/reports/stats?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    setStatsLoading(false);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((h) => {
          const value = row[h];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportStudents = async () => {
    setLoading('students');
    try {
      const res = await fetch('/api/students?limit=1000');
      const data = await res.json();
      const students = data.students || data;

      const exportData = students.map((s: any) => ({
        Name: s.name,
        Email: s.email || '',
        Phone: s.phone || '',
        Gender: s.gender || '',
        Year: s.year,
        Major: s.major || '',
        Status: s.status,
        Address: s.address || '',
        Tags: s.tags || '',
        Interactions: s._count?.interactions || 0,
        'Active Follow-ups': s._count?.followUps || 0,
        'Prayer Requests': s._count?.prayerRequests || 0,
        'Created At': s.createdAt ? format(new Date(s.createdAt), 'yyyy-MM-dd') : '',
      }));

      downloadCSV(exportData, 'students');
    } finally {
      setLoading(null);
    }
  };

  const exportInteractions = async () => {
    setLoading('interactions');
    try {
      const res = await fetch('/api/interactions');
      const interactions = await res.json();

      const filtered = interactions.filter((i: any) => {
        const date = new Date(i.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      const exportData = filtered.map((i: any) => ({
        Date: format(new Date(i.date), 'yyyy-MM-dd HH:mm'),
        Student: i.student?.name || '',
        Staff: i.staff?.name || '',
        Type: i.type,
        Location: i.location || '',
        Topics: i.topics || '',
        Confidential: i.isConfidential ? 'Yes' : 'No',
        Notes: i.notes || '',
      }));

      downloadCSV(exportData, 'interactions');
    } finally {
      setLoading(null);
    }
  };

  const exportFollowUps = async () => {
    setLoading('followups');
    try {
      const res = await fetch('/api/follow-ups');
      const followUps = await res.json();

      const exportData = followUps.map((f: any) => ({
        'Due Date': format(new Date(f.dueDate), 'yyyy-MM-dd'),
        Student: f.student?.name || '',
        Staff: f.staff?.name || '',
        Priority: f.priority,
        Reason: f.reason || '',
        Completed: f.completed ? 'Yes' : 'No',
        'Completed At': f.completedAt ? format(new Date(f.completedAt), 'yyyy-MM-dd') : '',
      }));

      downloadCSV(exportData, 'follow_ups');
    } finally {
      setLoading(null);
    }
  };

  const exportPrayerRequests = async () => {
    setLoading('prayers');
    try {
      const res = await fetch('/api/prayer-requests');
      const prayers = await res.json();

      const exportData = prayers.map((p: any) => ({
        Date: format(new Date(p.date), 'yyyy-MM-dd'),
        Student: p.student?.name || '',
        Staff: p.staff?.name || '',
        Category: p.category,
        Status: p.status,
        Private: p.isPrivate ? 'Yes' : 'No',
        Content: p.content,
      }));

      downloadCSV(exportData, 'prayer_requests');
    } finally {
      setLoading(null);
    }
  };

  const maxStaffCount = stats?.interactionsByStaff
    ? Math.max(...stats.interactionsByStaff.map(s => s._count), 1)
    : 1;

  const maxTypeCount = stats?.interactionsByType
    ? Math.max(...stats.interactionsByType.map(t => t._count), 1)
    : 1;

  const reports = [
    { id: 'students', title: 'Student List', description: 'All students with contact info and stats', icon: Users, action: exportStudents },
    { id: 'interactions', title: 'Interactions', description: 'Interactions within date range', icon: MessageSquare, action: exportInteractions },
    { id: 'followups', title: 'Follow-Ups', description: 'All follow-ups with status', icon: Calendar, action: exportFollowUps },
    { id: 'prayers', title: 'Prayer Requests', description: 'Prayer requests (non-private)', icon: FileText, action: exportPrayerRequests },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Track ministry engagement and export data</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
          />
          <span className="text-slate-400">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalInteractions || 0}</p>
              <p className="text-xs text-slate-500">Interactions</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.activeStudents || 0}</p>
              <p className="text-xs text-slate-500">Active Students</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalStudents || 0}</p>
              <p className="text-xs text-slate-500">Total Students</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {stats && stats.totalInteractions > 0 && stats.activeStudents > 0
                  ? (stats.totalInteractions / stats.activeStudents).toFixed(1)
                  : '0'}
              </p>
              <p className="text-xs text-slate-500">Avg/Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* By Staff */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Interactions by Staff
          </h2>
          {statsLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : stats?.interactionsByStaff && stats.interactionsByStaff.length > 0 ? (
            <div className="space-y-3">
              {stats.interactionsByStaff.map((item) => (
                <div key={item.staff.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                    style={{ backgroundColor: item.staff.color }}
                  >
                    {item.staff.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">{item.staff.name}</span>
                      <span className="text-sm text-slate-500">{item._count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item._count / maxStaffCount) * 100}%`,
                          backgroundColor: item.staff.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No data for this period</p>
          )}
        </div>

        {/* By Type */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-400" />
            Interactions by Type
          </h2>
          {statsLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : stats?.interactionsByType && stats.interactionsByType.length > 0 ? (
            <div className="space-y-3">
              {stats.interactionsByType.map((item, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                const color = colors[index % colors.length];
                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{item.type}</span>
                        <span className="text-sm text-slate-500">{item._count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(item._count / maxTypeCount) * 100}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No data for this period</p>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-400" />
          Export Data
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={report.action}
                disabled={loading === report.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-slate-800">{report.title}</span>
                </div>
                <p className="text-xs text-slate-500">{report.description}</p>
                {loading === report.id && (
                  <p className="text-xs text-primary-600 mt-2">Exporting...</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
