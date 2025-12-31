'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { SessionService } from '@/services/session.service';
import { ClientService } from '@/services/client.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatTime } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  MapPin,
  User,
  Filter,
  Search,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Session, SessionStatus } from '@/types/database.types';

// Session calendar event component
function SessionCalendar({ sessions, onEventClick }: { sessions: Session[]; onEventClick: (session: Session) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');

  // Get days in current view
  const getDaysInView = () => {
    if (view === 'day') {
      return [currentDate];
    } else if (view === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        return day;
      });
    } else {
      // Month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      return Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(year, month, i + 1);
      });
    }
  };

  const days = getDaysInView();
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 10 PM

  const getSessionsForDay = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduled_at);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            →
          </Button>
          <h3 className="ml-4 text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Week/Day View */}
      {(view === 'week' || view === 'day') && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-8 border-b">
            <div className="p-2 text-xs font-medium text-gray-500 bg-gray-50">Time</div>
            {days.map((day, i) => (
              <div
                key={i}
                className={`p-2 text-center border-l ${
                  day.toDateString() === new Date().toDateString()
                    ? 'bg-brand-primary-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    day.toDateString() === new Date().toDateString()
                      ? 'text-brand-primary-600'
                      : 'text-gray-900'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                <div className="p-2 text-xs text-gray-500 bg-gray-50">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {days.map((day, i) => {
                  const daySessions = getSessionsForDay(day).filter((s) => {
                    const sessionHour = new Date(s.scheduled_at).getHours();
                    return sessionHour === hour;
                  });
                  return (
                    <div key={i} className="border-l p-1 relative">
                      {daySessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => onEventClick(session)}
                          className={`p-2 rounded border-l-4 mb-1 cursor-pointer hover:shadow-md transition-shadow text-xs ${getStatusColor(
                            session.status
                          )}`}
                        >
                          <div className="font-semibold truncate">{session.title}</div>
                          <div className="text-xs opacity-75">
                            {formatTime(session.scheduled_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const daySessions = getSessionsForDay(day);
              return (
                <div
                  key={i}
                  className={`min-h-[120px] border-b border-r p-2 ${
                    day.toDateString() === new Date().toDateString() ? 'bg-brand-primary-50' : ''
                  }`}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      day.toDateString() === new Date().toDateString()
                        ? 'text-brand-primary-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {daySessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => onEventClick(session)}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(
                          session.status
                        )}`}
                      >
                        {formatTime(session.scheduled_at)} {session.title}
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{daySessions.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);

      if (currentUser?.organization_id) {
        // Fetch all sessions
        const allSessions = await SessionService.getAll(currentUser.organization_id);
        setSessions(allSessions || []);

        // Fetch clients for dropdown
        const { clients: allClients } = await ClientService.search(currentUser.organization_id, {
          limit: 1000,
        });
        setClients(allClients || []);
      }

      setLoading(false);
    };

    init();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesSearch =
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.session_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: SessionStatus) => {
    const variants: Record<SessionStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-orange-100 text-orange-700',
      rescheduled: 'bg-yellow-100 text-yellow-700',
    };

    return (
      <Badge className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="spinner h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and schedule coaching sessions with your clients
          </p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SessionStatus | 'all')}
              className="w-full sm:w-48"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <SessionCalendar
          sessions={filteredSessions}
          onEventClick={(session) => {
            setSelectedSession(session);
            setShowSessionDialog(true);
          }}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid gap-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No sessions found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Get started by scheduling your first session
                </p>
                <Link href="/dashboard/sessions/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Client name here</span>
                        </div>
                        {session.meeting_url && (
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <a
                              href={session.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary-600 hover:underline"
                            >
                              Join Video Call
                            </a>
                          </div>
                        )}
                        {session.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                      {session.session_notes && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {session.session_notes}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {sessions.filter((s) => s.status === 'scheduled' || s.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {sessions.filter((s) => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {sessions.filter((s) => s.status === 'cancelled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">No Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {sessions.filter((s) => s.status === 'no_show').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
