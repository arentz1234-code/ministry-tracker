export type Role = 'admin' | 'staff' | 'volunteer';
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type Year = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Grad';
export type InteractionType = '1-on-1' | 'Small group' | 'Event' | 'Phone call' | 'Text' | 'Other';
export type Priority = 'high' | 'medium' | 'low';
export type PrayerCategory = 'personal' | 'family' | 'academic' | 'spiritual' | 'health' | 'other';
export type PrayerStatus = 'active' | 'answered' | 'ongoing';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  year: Year;
  major?: string | null;
  address?: string | null;
  status: StudentStatus;
  photo?: string | null;
  tags?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  studentId: string;
  staffId: string;
  date: Date;
  type: InteractionType;
  location?: string | null;
  notes?: string | null;
  isConfidential: boolean;
  topics?: string | null;
  attachments?: string | null;
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
  staff?: Staff;
}

export interface FollowUp {
  id: string;
  studentId: string;
  staffId: string;
  dueDate: Date;
  priority: Priority;
  reason?: string | null;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
  staff?: Staff;
}

export interface PrayerRequest {
  id: string;
  studentId: string;
  staffId: string;
  date: Date;
  content: string;
  category: PrayerCategory;
  status: PrayerStatus;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  student?: Student;
  staff?: Staff;
}

export interface ActionItem {
  id: string;
  studentId?: string | null;
  staffId: string;
  interactionId?: string | null;
  description: string;
  dueDate?: Date | null;
  status: ActionStatus;
  createdAt: Date;
  updatedAt: Date;
  student?: Student | null;
  staff?: Staff;
  interaction?: Interaction | null;
}

export interface DashboardStats {
  totalStudents: number;
  recentInteractions: number;
  overdueFollowUps: number;
  upcomingMeetings: number;
  activePrayerRequests: number;
  pendingActionItems: number;
}
