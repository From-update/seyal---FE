'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Bell, CheckCheck, X, Clock, ExternalLink } from 'lucide-react';

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  return (
    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 shadow-xl rounded-2xl z-50 overflow-hidden text-xs">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-neutral-50">
        <div className="flex items-center space-x-1.5 font-bold text-gray-900">
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] text-blue-600 hover:underline font-semibold"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 italic">No notifications yet</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`p-3 transition cursor-pointer hover:bg-neutral-50 ${n.is_read ? 'opacity-70' : 'bg-blue-50/30'}`}
            >
              <div className="flex items-start justify-between">
                <h5 className="font-semibold text-gray-900 mb-0.5">{n.title}</h5>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-gray-600 text-[11px] leading-snug">{n.message}</p>
              <div className="flex items-center justify-between mt-1.5 text-[9px] text-gray-400">
                <span className="capitalize">{n.type}</span>
                <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

