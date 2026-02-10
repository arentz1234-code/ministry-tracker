'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  Bell,
  Heart,
  CheckSquare,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Lock,
  Calendar,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useSession } from 'next-auth/react';

interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  year: string;
  major: string | null;
  address: string | null;
  status: string;
  tags: string | null;
  notes: string | null;
  interactions: any[];
  followUps: any[];
  prayerRequests: any[];
  actionItems: any[];
}

const interactionTypes = [
  { value: '1-on-1', label: '1-on-1' },
  { value: 'Small group', label: 'Small Group' },
  { value: 'Event', label: 'Event' },
  { value: 'Phone call', label: 'Phone Call' },
  { value: 'Text', label: 'Text' },
  { value: 'Other', label: 'Other' },
];

const topics = ['Gospel', 'Discipleship', 'Struggles', 'Questions', 'Growth'];

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('interactions');

  // Modal states
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [interactionForm, setInteractionForm] = useState({
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: '1-on-1',
    location: '',
    notes: '',
    isConfidential: false,
    topics: [] as string[],
  });

  const [followUpForm, setFollowUpForm] = useState({
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium',
    reason: '',
  });

  const [prayerForm, setPrayerForm] = useState({
    content: '',
    category: 'other',
    isPrivate: false,
  });

  const [newNote, setNewNote] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    content: '',
  });
  const [savingNote, setSavingNote] = useState(false);

  const fetchStudent = async () => {
    const res = await fetch(`/api/students/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setStudent(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudent();
  }, [params.id]);

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student?.id,
        ...interactionForm,
        topics: interactionForm.topics.join(','),
      }),
    });

    if (res.ok) {
      setShowInteractionModal(false);
      setInteractionForm({
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: '1-on-1',
        location: '',
        notes: '',
        isConfidential: false,
        topics: [],
      });
      fetchStudent();
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/follow-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student?.id,
        ...followUpForm,
      }),
    });

    if (res.ok) {
      setShowFollowUpModal(false);
      setFollowUpForm({
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        priority: 'medium',
        reason: '',
      });
      fetchStudent();
    }
  };

  const handleAddPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/prayer-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student?.id,
        ...prayerForm,
      }),
    });

    if (res.ok) {
      setShowPrayerModal(false);
      setPrayerForm({ content: '', category: 'other', isPrivate: false });
      fetchStudent();
    }
  };

  const handleCompleteFollowUp = async (id: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    fetchStudent();
  };

  const handleDeleteStudent = async () => {
    const res = await fetch(`/api/students/${student?.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/students');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    setSavingNote(true);
    const noteEntry = `[${newNote.date}] ${newNote.content.trim()}`;
    const updatedNotes = student?.notes
      ? `${noteEntry}\n${student.notes}`
      : noteEntry;

    const res = await fetch(`/api/students/${student?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: updatedNotes }),
    });

    if (res.ok) {
      setNewNote({ date: format(new Date(), 'yyyy-MM-dd'), content: '' });
      fetchStudent();
    }
    setSavingNote(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  if (!student) {
    return <div className="text-center py-12 text-slate-500">Student not found</div>;
  }

  // Parse notes into dated entries
  const parseNotes = (notesStr: string | null): { date: string; content: string }[] => {
    if (!notesStr) return [];
    const entries: { date: string; content: string }[] = [];
    const lines = notesStr.split('\n');
    let currentDate = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const dateMatch = line.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*(.*)/);
      if (dateMatch) {
        if (currentDate && currentContent.length > 0) {
          entries.push({ date: currentDate, content: currentContent.join('\n').trim() });
        }
        currentDate = dateMatch[1];
        currentContent = dateMatch[2] ? [dateMatch[2]] : [];
      } else if (currentDate) {
        currentContent.push(line);
      } else if (line.trim()) {
        // Legacy note without date
        entries.push({ date: '', content: line.trim() });
      }
    }
    if (currentDate && currentContent.length > 0) {
      entries.push({ date: currentDate, content: currentContent.join('\n').trim() });
    }
    return entries;
  };

  const notesEntries = parseNotes(student.notes);

  const tabs = [
    { id: 'interactions', label: 'Interactions', count: student.interactions.length },
    { id: 'followups', label: 'Follow-Ups', count: student.followUps.length },
    { id: 'prayers', label: 'Prayer Requests', count: student.prayerRequests.length },
    { id: 'notes', label: 'Notes', count: notesEntries.length },
  ];

  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/students" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <span className="text-sm text-slate-500">Back to Students</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-primary-600">{student.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{student.name}</h1>
                <span className={`badge ${
                  student.status === 'active' ? 'badge-success' :
                  student.status === 'inactive' ? 'badge-warning' :
                  student.status === 'graduated' ? 'badge-primary' : 'badge-gray'
                }`}>
                  {student.status}
                </span>
              </div>
              <p className="text-sm text-slate-500">{student.year} • {student.major || 'No major listed'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/students/${student.id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            {isAdmin && (
              <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="flex-1 sm:flex-none">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {student.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${student.email}`} className="text-primary-600 hover:underline">
                    {student.email}
                  </a>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${student.phone}`} className="text-primary-600 hover:underline">
                    {student.phone}
                  </a>
                </div>
              )}
              {student.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{student.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{student.year} - {student.major || 'Undeclared'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {student.tags && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {student.tags.split(',').map((tag) => (
                  <span key={tag} className="badge-primary">{tag.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={() => setShowInteractionModal(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Log Interaction
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setShowFollowUpModal(true)}>
                <Bell className="w-4 h-4 mr-2" />
                Schedule Follow-Up
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setShowPrayerModal(true)}>
                <Heart className="w-4 h-4 mr-2" />
                Add Prayer Request
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 mb-6 -mx-6 px-6 sm:mx-0 sm:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className="ml-1">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
              <div className="space-y-4">
                {student.interactions.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No interactions yet</p>
                ) : (
                  student.interactions.map((interaction) => (
                    <div key={interaction.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="badge-gray">{interaction.type}</span>
                          {interaction.isConfidential && (
                            <span className="badge-danger flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Confidential
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-500">
                          {format(new Date(interaction.date), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {interaction.location && (
                        <p className="text-sm text-slate-500 mb-2">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {interaction.location}
                        </p>
                      )}
                      {interaction.notes && (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{interaction.notes}</p>
                      )}
                      {interaction.topics && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {interaction.topics.split(',').map((topic: string) => (
                            <span key={topic} className="badge-primary text-xs">{topic.trim()}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        Logged by {interaction.staff?.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Follow-Ups Tab */}
            {activeTab === 'followups' && (
              <div className="space-y-4">
                {student.followUps.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No follow-ups scheduled</p>
                ) : (
                  student.followUps.map((followUp) => (
                    <div key={followUp.id} className={`p-4 rounded-lg ${
                      followUp.completed ? 'bg-green-50' : 'bg-slate-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">
                              {format(new Date(followUp.dueDate), 'MMM d, yyyy')}
                            </span>
                            <span className={`badge ${
                              followUp.priority === 'high' ? 'badge-danger' :
                              followUp.priority === 'medium' ? 'badge-warning' : 'badge-gray'
                            }`}>
                              {followUp.priority}
                            </span>
                            {followUp.completed && <span className="badge-success">Completed</span>}
                          </div>
                          {followUp.reason && (
                            <p className="text-sm text-slate-600">{followUp.reason}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            Assigned to {followUp.staff?.name}
                          </p>
                        </div>
                        {!followUp.completed && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCompleteFollowUp(followUp.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Prayer Requests Tab */}
            {activeTab === 'prayers' && (
              <div className="space-y-4">
                {student.prayerRequests.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No prayer requests</p>
                ) : (
                  student.prayerRequests.map((prayer) => (
                    <div key={prayer.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-primary">{prayer.category}</span>
                        <span className={`badge ${
                          prayer.status === 'answered' ? 'badge-success' :
                          prayer.status === 'ongoing' ? 'badge-warning' : 'badge-gray'
                        }`}>
                          {prayer.status}
                        </span>
                        {prayer.isPrivate && (
                          <span className="badge-danger flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">{prayer.content}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(prayer.date), 'MMM d, yyyy')} by {prayer.staff?.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={newNote.date}
                      onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                    <input
                      type="text"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button type="submit" size="sm" disabled={savingNote || !newNote.content.trim()}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </form>

                {/* Notes List */}
                {notesEntries.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No notes yet</p>
                ) : (
                  notesEntries.map((note, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        {note.date && (
                          <div className="flex-shrink-0 px-2 py-1 bg-white rounded border border-slate-200 text-xs font-medium text-slate-600">
                            {format(new Date(note.date + 'T12:00:00'), 'MMM d, yyyy')}
                          </div>
                        )}
                        <p className="text-sm text-slate-700 whitespace-pre-wrap flex-1">{note.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Interaction Modal */}
      <Modal
        isOpen={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        title="Log Interaction"
        size="lg"
      >
        <form onSubmit={handleAddInteraction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date & Time"
              type="datetime-local"
              value={interactionForm.date}
              onChange={(e) => setInteractionForm({ ...interactionForm, date: e.target.value })}
              required
            />
            <Select
              label="Type"
              options={interactionTypes}
              value={interactionForm.type}
              onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}
            />
          </div>
          <Input
            label="Location"
            value={interactionForm.location}
            onChange={(e) => setInteractionForm({ ...interactionForm, location: e.target.value })}
            placeholder="e.g., Campus Coffee Shop"
          />
          <Textarea
            label="Notes"
            value={interactionForm.notes}
            onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
            placeholder="What did you discuss?"
            rows={4}
          />
          <div>
            <label className="label">Topics Discussed</label>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <label key={topic} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interactionForm.topics.includes(topic)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInteractionForm({ ...interactionForm, topics: [...interactionForm.topics, topic] });
                      } else {
                        setInteractionForm({ ...interactionForm, topics: interactionForm.topics.filter((t) => t !== topic) });
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">{topic}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={interactionForm.isConfidential}
              onChange={(e) => setInteractionForm({ ...interactionForm, isConfidential: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm">Mark as confidential (only visible to you and admins)</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowInteractionModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Interaction</Button>
          </div>
        </form>
      </Modal>

      {/* Add Follow-Up Modal */}
      <Modal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        title="Schedule Follow-Up"
      >
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={followUpForm.dueDate}
              onChange={(e) => setFollowUpForm({ ...followUpForm, dueDate: e.target.value })}
              required
            />
            <Select
              label="Priority"
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              value={followUpForm.priority}
              onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })}
            />
          </div>
          <Textarea
            label="Reason / Notes"
            value={followUpForm.reason}
            onChange={(e) => setFollowUpForm({ ...followUpForm, reason: e.target.value })}
            placeholder="Why do you need to follow up?"
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowFollowUpModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Add Prayer Request Modal */}
      <Modal
        isOpen={showPrayerModal}
        onClose={() => setShowPrayerModal(false)}
        title="Add Prayer Request"
      >
        <form onSubmit={handleAddPrayer} className="space-y-4">
          <Select
            label="Category"
            options={[
              { value: 'personal', label: 'Personal' },
              { value: 'family', label: 'Family' },
              { value: 'academic', label: 'Academic' },
              { value: 'spiritual', label: 'Spiritual' },
              { value: 'health', label: 'Health' },
              { value: 'other', label: 'Other' },
            ]}
            value={prayerForm.category}
            onChange={(e) => setPrayerForm({ ...prayerForm, category: e.target.value })}
          />
          <Textarea
            label="Prayer Request"
            value={prayerForm.content}
            onChange={(e) => setPrayerForm({ ...prayerForm, content: e.target.value })}
            placeholder="What would you like to pray for?"
            rows={4}
            required
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prayerForm.isPrivate}
              onChange={(e) => setPrayerForm({ ...prayerForm, isPrivate: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm">Private (only visible to you and admins)</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowPrayerModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Request</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete <strong>{student.name}</strong>? This will also delete all their interactions, follow-ups, and prayer requests. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteStudent}>
              Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
