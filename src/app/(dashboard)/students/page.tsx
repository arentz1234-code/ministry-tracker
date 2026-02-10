'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, User, MessageSquare, Bell, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  year: string;
  major: string | null;
  status: string;
  tags: string | null;
  _count: {
    interactions: number;
    followUps: number;
    prayerRequests: number;
  };
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'transferred', label: 'Transferred' },
];

const yearOptions = [
  { value: 'all', label: 'All Years' },
  { value: 'Freshman', label: 'Freshman' },
  { value: 'Sophomore', label: 'Sophomore' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Grad', label: 'Graduate' },
];

const genderOptions = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const fetchStudents = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (yearFilter !== 'all') params.set('year', yearFilter);
    if (genderFilter !== 'all') params.set('gender', genderFilter);

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter, yearFilter, genderFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-warning';
      case 'graduated':
        return 'badge-primary';
      case 'transferred':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  const getYearBadge = (year: string) => {
    switch (year) {
      case 'Freshman':
        return 'badge-freshman';
      case 'Sophomore':
        return 'badge-sophomore';
      case 'Junior':
        return 'badge-junior';
      case 'Senior':
        return 'badge-senior';
      case 'Grad':
        return 'badge-grad';
      default:
        return 'badge-gray';
    }
  };

  const getAvatarClass = (gender: string | null) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'avatar-male';
      case 'female':
        return 'avatar-female';
      default:
        return 'bg-primary-100 text-primary-600';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500">{students.length} students in database</p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or major..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={yearOptions}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={genderOptions}
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Student Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No students found</p>
          <Link href="/students/new">
            <Button className="mt-4">Add Your First Student</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="card hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarClass(student.gender)}`}>
                  <span className="text-lg font-semibold">
                    {student.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 truncate">{student.name}</h3>
                    <span className={getStatusBadge(student.status)}>{student.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {student.gender && (
                      <span className={student.gender.toLowerCase() === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                        {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                      </span>
                    )}
                    {student.gender && <span>•</span>}
                    <span className={getYearBadge(student.year)}>{student.year}</span>
                    <span>•</span>
                    <span>{student.major || 'No major'}</span>
                  </div>
                  {student.email && (
                    <p className="text-sm text-slate-400 truncate">{student.email}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {student.tags && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {student.tags.split(',').map((tag) => (
                    <span key={tag} className="badge-primary text-xs">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{student._count.interactions}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  <span>{student._count.followUps}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{student._count.prayerRequests}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
