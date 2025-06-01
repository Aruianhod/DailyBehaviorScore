import React, { useEffect, useState } from 'react';

interface Notification {
  id: number;
  content: string;
  created_at: string;
}

const TeacherNotifications: React.FC<{ username: string }> = ({ username }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teacher/notifications?user=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  }, [username]);

  return (
    <div style={{ marginTop: 32, maxWidth: 1000, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e5e7eb', padding: '40px 56px' }}>
      <h4 style={{ textAlign: 'left', fontSize: 22, fontWeight: 700, marginBottom: 28 }}>站内信通知</h4>
      {loading ? <div style={{ fontSize: 16 }}>加载中...</div> : (
        notifications.length === 0 ? <div style={{ fontSize: 16 }}>暂无通知</div> : (
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {notifications.map(n => (
              <li key={n.id} style={{ marginBottom: 22, padding: '16px 24px', background: '#f8faff', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}>
                <span>{n.content}</span>
                <span style={{ color: '#888', marginLeft: 32, fontSize: 14 }}>{n.created_at}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

export default TeacherNotifications;
