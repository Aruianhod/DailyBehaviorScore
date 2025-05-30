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
    <div style={{ marginTop: 24 }}>
      <h4>站内信通知</h4>
      {loading ? <div>加载中...</div> : (
        notifications.length === 0 ? <div>暂无通知</div> : (
          <ul>
            {notifications.map(n => (
              <li key={n.id}>
                <span>{n.content}</span>
                <span style={{ color: '#888', marginLeft: 12, fontSize: 12 }}>{n.created_at}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

export default TeacherNotifications;
