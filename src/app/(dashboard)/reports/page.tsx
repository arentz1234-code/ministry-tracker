'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Download, FileText, Users, MessageSquare, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState<string | null>(null);

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
      const res = await fetch('/api/students');
      const students = await res.json();

      const exportData = students.map((s: any) => ({
        Name: s.name,
        Email: s.email || '',
        Phone: s.phone || '',
        Year: s.year,
        Major: s.major || '',
        Status: s.status,
        Address: s.address || '',
        Tags: s.tags || '',
        Interactions: s._count?.interactions || 0,
        'Active Follow-ups': s._count?.followUps || 0,
        'Prayer Requests': s._count?.prayerRequests || 0,
        'Created At': format(new Date(s.createdAt), 'yyyy-MM-dd'),
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

  const reports = [
    {
      id: 'students',
      title: 'Student List',
      description: 'Export all students with their contact info, status, and activity counts',
      icon: Users,
      action: exportStudents,
    },
    {
      id: 'interactions',
      title: 'Interaction Summary',
      description: 'Export all interactions within the selected date range',
      icon: MessageSquare,
      action: exportInteractions,
      useDateRange: true,
    },
    {
      id: 'followups',
      title: 'Follow-Up Report',
      description: 'Export all follow-ups with completion status',
      icon: Calendar,
      action: exportFollowUps,
    },
    {
      id: 'prayers',
      title: 'Prayer Requests',
      description: 'Export all prayer requests (excluding private content for non-admins)',
      icon: FileText,
      action: exportPrayerRequests,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500">Export data and generate reports</p>
      </div>

      {/* Date Range */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Date Range (for interactions)</h2>
        <div className="flex gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{report.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                  <Button
                    className="mt-4"
                    onClick={report.action}
                    loading={loading === report.id}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
