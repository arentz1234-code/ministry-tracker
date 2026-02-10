'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    type: 'interaction' | 'followup' | 'actionitem';
    studentId?: string;
    studentName?: string;
    staffName?: string;
    details?: string;
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchEvents = async () => {
    setLoading(true);

    const [interactionsRes, followUpsRes] = await Promise.all([
      fetch('/api/interactions'),
      fetch('/api/follow-ups?completed=false'),
    ]);

    const interactions = await interactionsRes.json();
    const followUps = await followUpsRes.json();

    const calendarEvents: CalendarEvent[] = [
      ...interactions.map((i: any) => ({
        id: `interaction-${i.id}`,
        title: `${i.type}: ${i.student?.name}`,
        start: i.date,
        backgroundColor: i.staff?.color || '#3b82f6',
        borderColor: i.staff?.color || '#3b82f6',
        extendedProps: {
          type: 'interaction' as const,
          studentId: i.studentId,
          studentName: i.student?.name,
          staffName: i.staff?.name,
          details: i.notes,
        },
      })),
      ...followUps.map((f: any) => ({
        id: `followup-${f.id}`,
        title: `Follow-up: ${f.student?.name}`,
        start: f.dueDate,
        backgroundColor: f.priority === 'high' ? '#ef4444' : f.priority === 'medium' ? '#f59e0b' : '#6b7280',
        borderColor: f.priority === 'high' ? '#ef4444' : f.priority === 'medium' ? '#f59e0b' : '#6b7280',
        extendedProps: {
          type: 'followup' as const,
          studentId: f.studentId,
          studentName: f.student?.name,
          staffName: f.staff?.name,
          details: f.reason,
        },
      })),
    ];

    setEvents(calendarEvents);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      ...info.event.toPlainObject(),
      extendedProps: info.event.extendedProps,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
        <p className="text-slate-500">View interactions and follow-ups</p>
      </div>

      {/* Legend */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm text-slate-600">Interactions (staff color)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-slate-600">High Priority Follow-up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-sm text-slate-600">Medium Priority Follow-up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500" />
            <span className="text-sm text-slate-600">Low Priority Follow-up</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading calendar...</div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEvents={3}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Details'}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Type</p>
              <p className="font-medium capitalize">{selectedEvent.extendedProps?.type}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Student</p>
              <Link
                href={`/students/${selectedEvent.extendedProps?.studentId}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {selectedEvent.extendedProps?.studentName}
              </Link>
            </div>
            <div>
              <p className="text-sm text-slate-500">Staff</p>
              <p className="font-medium">{selectedEvent.extendedProps?.staffName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-medium">
                {format(new Date(selectedEvent.start), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
            {selectedEvent.extendedProps?.details && (
              <div>
                <p className="text-sm text-slate-500">Details</p>
                <p className="text-slate-700">{selectedEvent.extendedProps.details}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
