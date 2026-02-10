'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

const yearOptions = [
  { value: 'Freshman', label: 'Freshman' },
  { value: 'Sophomore', label: 'Sophomore' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Grad', label: 'Graduate' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'transferred', label: 'Transferred' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    year: 'Freshman',
    major: '',
    address: '',
    status: 'active',
    tags: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create student');
      }

      const student = await res.json();
      router.push(`/students/${student.id}`);
    } catch (err) {
      setError('Failed to create student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/students" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Student</h1>
          <p className="text-slate-500">Enter the student's information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <Select
                label="Gender *"
                options={genderOptions}
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
              <Select
                label="Year *"
                options={yearOptions}
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
              />
              <Input
                label="Major"
                value={formData.major}
                onChange={(e) => handleChange('major', e.target.value)}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Location</h2>
            <Input
              label="Dorm / Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g., Smith Hall Room 204 or 123 Main St"
            />
          </div>

          {/* Tags */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Tags</h2>
            <Input
              label="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="e.g., new believer, leader, small group"
            />
            <p className="text-xs text-slate-500 mt-1">
              Suggested: new believer, leader, small group, athlete, international
            </p>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Notes</h2>
            <Textarea
              label="Initial Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional information about this student..."
              rows={4}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" loading={loading}>
              Create Student
            </Button>
            <Link href="/students">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
