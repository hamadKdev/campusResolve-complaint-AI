import React, { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatApiErrorMessage } from '../services/apiClient';
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setErrorMsg(formatApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (nid: string) => {
    try {
      await notificationService.markAsRead(nid, true);
      setNotifications((prev) =>
        prev.map((n) => (n.id === nid ? { ...n, is_read: true } : n))
      );
      success('Notification Updated', 'Marked as read.');
    } catch (err) {
      error('Failed to mark notification', formatApiErrorMessage(err));
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    try {
      await Promise.all(unread.map((n) => notificationService.markAsRead(n.id, true)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      success('All Read', 'Marked all notifications as read.');
    } catch (err) {
      error('Update Error', formatApiErrorMessage(err));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B4CC] mt-0.5">
            Real-time notifications regarding complaint triage, department assignments, and follow-ups.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151F35] hover:bg-[#1C2942] text-cyan-300 hover:text-white transition-colors border border-white/5 text-xs font-medium self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadNotifications} />}

      <div className="rounded-2xl bg-[#10182B] border border-white/5 p-6">
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are completely up to date. When there is activity on your tickets or assigned queues, notices will appear here."
            icon={Bell}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  item.is_read
                    ? 'bg-[#151F35]/40 border-white/5 text-[#A7B4CC]'
                    : 'bg-[#151F35] border-cyan-500/20 text-[#F1F5F9] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.is_read
                        ? 'bg-[#1C2942] text-[#A7B4CC]'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold truncate text-[#F1F5F9]">
                        {item.title || 'Complaint System Update'}
                      </h4>
                      {!item.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#A7B4CC] mt-1 leading-relaxed break-words">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#A7B4CC]/70 tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 p-1 font-medium"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
