'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';
import { Bell, Check, Calendar, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

interface FollowUp {
  id: string;
  dueDate: string;
  priority: string;
  reason: string | null;
  completed: boolean;
  student: { id: string; name: string };
  staff: { id: string; name: string; color: string };
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchFollowUps = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === 'pending') params.set('completed', 'false');
    if (filter === 'completed') params.set('completed', 'true');

    const res = await fetch(`/api/follow-ups?${params}`);
    const data = await res.json();
    setFollowUps(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFollowUps();
  }, [filter]);

  const handleComplete = async (id: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    fetchFollowUps();
  };

  const overdue = followUps.filter((f) => !f.completed && isPast(new Date(f.dueDate)) && !isToday(new Date(f.dueDate)));
  const today = followUps.filter((f) => !f.completed && isToday(new Date(f.dueDate)));
  const upcoming = followUps.filter((f) => !f.completed && !isPast(new Date(f.dueDate)) && !isToday(new Date(f.dueDate)));
  const completed = followUps.filter((f) => f.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      default: return 'badge-gray';
    }
  };

  const FollowUpCard = ({ followUp }: { followUp: FollowUp }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: followUp.staff?.color || '#3b82f6' }}
          >
            {followUp.student?.name.charAt(0)}
          </div>
          <div>
            <Link
              href={`/students/${followUp.student?.id}`}
              className="font-semibold text-slate-800 hover:text-primary-600"
            >
              {followUp.student?.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className={`text-sm ${
                isPast(new Date(followUp.dueDate)) && !followUp.completed
                  ? 'text-red-600 font-medium'
                  : 'text-slate-500'
              }`}>
                {format(new Date(followUp.dueDate), 'MMM d, yyyy')}
              </span>
              <span className={getPriorityColor(followUp.priority)}>{followUp.priority}</span>
            </div>
            {followUp.reason && (
              <p className="text-sm text-slate-600 mt-2">{followUp.reason}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Assigned to {followUp.staff?.name}
            </p>
          </div>
        </div>
        {!followUp.completed && (
          <Button size="sm" variant="success" onClick={() => handleComplete(followUp.id)}>
            <Check className="w-4 h-4 mr-1" />
            Done
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Follow-Ups</h1>
          <p className="text-slate-500">Manage your student follow-up reminders</p>
        </div>
        <Select
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'all', label: 'All' },
          ]}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No follow-ups found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Overdue ({overdue.length})
              </h2>
              <div className="space-y-4">
                {overdue.map((f) => <FollowUpCard key={f.id} followUp={f} />)}
              </div>
            </div>
          )}

          {/* Today */}
          {today.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-orange-600 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Due Today ({today.length})
              </h2>
              <div className="space-y-4">
                {today.map((f) => <FollowUpCard key={f.id} followUp={f} />)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-4">
                {upcoming.map((f) => <FollowUpCard key={f.id} followUp={f} />)}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && filter !== 'pending' && (
            <div>
              <h2 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Completed ({completed.length})
              </h2>
              <div className="space-y-4 opacity-60">
                {completed.map((f) => <FollowUpCard key={f.id} followUp={f} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
