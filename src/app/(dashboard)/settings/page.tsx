'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'volunteer', label: 'Volunteer' },
];

const colorOptions = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    color: '#3b82f6',
  });

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchStaff();
  }, [isAdmin]);

  const fetchStaff = async () => {
    const res = await fetch('/api/staff');
    const data = await res.json();
    setStaff(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
    const method = editingStaff ? 'PUT' : 'POST';

    const body: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      color: formData.color,
    };

    if (formData.password) {
      body.password = formData.password;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingStaff(null);
      setFormData({ name: '', email: '', password: '', role: 'staff', color: '#3b82f6' });
      fetchStaff();
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      role: staffMember.role,
      color: staffMember.color,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    fetchStaff();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Manage staff accounts and permissions</p>
        </div>
        <Button onClick={() => {
          setEditingStaff(null);
          setFormData({ name: '', email: '', password: '', role: 'staff', color: '#3b82f6' });
          setShowModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Staff List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Staff Members
        </h2>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="text-sm text-slate-500">{s.email}</p>
                  </div>
                  <span className={`badge ${
                    s.role === 'admin' ? 'badge-danger' :
                    s.role === 'staff' ? 'badge-primary' : 'badge-gray'
                  }`}>
                    {s.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {s.id !== (session?.user as any)?.id && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStaff(null);
        }}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={editingStaff ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingStaff}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? 'border-slate-800' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStaff ? 'Save Changes' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
