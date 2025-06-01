import React, { useState } from 'react';

interface ApplicationForm {
  students: { id: string; name: string }[];
  delta: number;
  reason: string;
  date: string;
}

const TeacherApply: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState<Omit<ApplicationForm, 'students'> & { studentId: string; studentName: string; students: { id: string; name: string }[] }>({
    studentId: '',
    studentName: '',
    students: [],
    delta: 0,
    reason: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  // 获取所有学生用于自动补全
  React.useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students?.map((s: any) => ({ id: s.student_id, name: s.name })) || []);
      });
  }, []);

  // 自动补全
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    const match = students.find((s) => s.id === id);
    setForm((f) => ({ ...f, studentId: id, studentName: match ? match.name : f.studentName }));
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const match = students.find((s) => s.name === name);
    setForm((f) => ({ ...f, studentName: name, studentId: match ? match.id : f.studentId }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 添加到本次申请学生列表
  const handleAddStudent = () => {
    if (!form.studentId || !form.studentName) {
      setMessage('请先输入完整学号和姓名');
      return;
    }
    if (form.students.some((s) => s.id === form.studentId)) {
      setMessage('该学生已在列表中');
      return;
    }
    setForm((f) => ({
      ...f,
      students: [...f.students, { id: f.studentId, name: f.studentName }],
      studentId: '',
      studentName: '',
    }));
    setMessage('');
  };

  // 移除学生
  const handleRemoveStudent = (id: string) => {
    setForm((f) => ({ ...f, students: f.students.filter((s) => s.id !== id) }));
  };

  const handleSubmit = async () => {
    if (!form.students.length || !form.reason || isNaN(Number(form.delta))) {
      setMessage('请添加至少一名学生，并填写分值与原因');
      return;
    }
    const currentUser = localStorage.getItem('currentUser') || 'teacher1';
    const submitData: ApplicationForm & { teacher: string } = {
      students: form.students,
      delta: Number(form.delta),
      reason: form.reason,
      date: form.date,
      teacher: currentUser,
    };
    
    console.log('提交的数据:', submitData);
    
    try {
      const res = await fetch('/api/teacher/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const result = await res.json();
      
      console.log('服务器响应:', result);
      console.log('响应状态:', res.status);
      
      setMessage(result.message);
      if (res.ok && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('提交申请时发生错误:', error);
      setMessage('提交失败：网络错误');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #eee', padding: 32 }}>
      <h3>提交分值修改申请</h3>
      <div style={{ marginBottom: 12 }}>
        <label>目标学生学号：
          <input name="studentId" list="student-ids" value={form.studentId} onChange={handleIdChange} style={{ width: 180, marginLeft: 8 }} />
          <datalist id="student-ids">
            {students.map((s) => (
              <option key={`id-${s.id}`} value={s.id}>{s.name}</option>
            ))}
          </datalist>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>目标学生姓名：
          <input name="studentName" list="student-names" value={form.studentName} onChange={handleNameChange} style={{ width: 180, marginLeft: 8 }} />
          <datalist id="student-names">
            {students.map((s) => (
              <option key={`name-${s.id}`} value={s.name}>{s.id}</option>
            ))}
          </datalist>
        </label>
        <button type="button" style={{ marginLeft: 12 }} onClick={handleAddStudent}>添加到列表</button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div>本次申请学生列表：</div>
        <ul style={{ paddingLeft: 20 }}>
          {form.students.map((s) => (
            <li key={`selected-${s.id}`}>
              {s.id} - {s.name} <button type="button" onClick={() => handleRemoveStudent(s.id)} style={{ color: 'red', marginLeft: 8 }}>移除</button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          分值变动：<input name="delta" type="number" value={form.delta} onChange={handleChange} style={{ width: 120, marginLeft: 8 }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          原因：<textarea name="reason" value={form.reason} onChange={handleChange} style={{ width: 260, marginLeft: 8 }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          日期：<input name="date" type="date" value={form.date} onChange={handleChange} style={{ width: 160, marginLeft: 8 }} />
        </label>
      </div>
      <button style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 32px', borderRadius: 4, fontWeight: 600 }} onClick={handleSubmit}>
        提交申请
      </button>
      {message && <div style={{ color: message.includes('成功') ? 'green' : 'red', marginTop: 8 }}>{message}</div>}
    </div>
  );
};

export default TeacherApply;
