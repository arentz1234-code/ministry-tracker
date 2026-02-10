'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Heart, Lock, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

interface PrayerRequest {
  id: string;
  date: string;
  content: string;
  category: string;
  status: string;
  isPrivate: boolean;
  student: { id: string; name: string };
  staff: { id: string; name: string; color: string };
}

const statusOptions = [
  { value: 'all', label: 'All Requests' },
  { value: 'active', label: 'Active' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'answered', label: 'Answered' },
];

const categoryLabels: Record<string, string> = {
  personal: 'Personal',
  family: 'Family',
  academic: 'Academic',
  spiritual: 'Spiritual',
  health: 'Health',
  other: 'Other',
};

export default function PrayerRequestsPage() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  const fetchPrayerRequests = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);

    const res = await fetch(`/api/prayer-requests?${params}`);
    const data = await res.json();
    setPrayerRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrayerRequests();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/prayer-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchPrayerRequests();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-primary';
      case 'ongoing': return 'badge-warning';
      case 'answered': return 'badge-success';
      default: return 'badge-gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-700';
      case 'family': return 'bg-purple-100 text-purple-700';
      case 'academic': return 'bg-green-100 text-green-700';
      case 'spiritual': return 'bg-yellow-100 text-yellow-700';
      case 'health': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prayer Requests</h1>
          <p className="text-slate-500">Track and pray for student needs</p>
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : prayerRequests.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No prayer requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prayerRequests.map((prayer) => (
            <div key={prayer.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`badge ${getCategoryColor(prayer.category)}`}>
                    {categoryLabels[prayer.category] || prayer.category}
                  </span>
                  <span className={getStatusBadge(prayer.status)}>{prayer.status}</span>
                  {prayer.isPrivate && (
                    <span className="badge-danger flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Private
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {format(new Date(prayer.date), 'MMM d, yyyy')}
                </span>
              </div>

              <Link
                href={`/students/${prayer.student?.id}`}
                className="font-semibold text-slate-800 hover:text-primary-600"
              >
                {prayer.student?.name}
              </Link>

              <p className="text-sm text-slate-600 mt-2">{prayer.content}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Added by {prayer.staff?.name}
                </p>
                {prayer.status !== 'answered' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleUpdateStatus(prayer.id, 'answered')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Answered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
