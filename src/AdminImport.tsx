import React, { useRef, useState } from 'react';
import './App.css';
import StudentTable from './StudentTable';

interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
}

const AdminImport: React.FC<{ onImportSuccess?: () => void }> = ({ onImportSuccess }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'direct' | 'excel' | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const handleDirectImport = async () => {
    const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
    const data: Student[] = [];
    for (const line of lines) {
      // 支持格式：年级 班级 学号 姓名
      const [grade, classNo, id, name] = line.split(/\s+/);
      if (/^\d{4}$/.test(grade) && /^\d+$/.test(classNo) && /^\d{10}$/.test(id) && name) {
        data.push({ id, name, grade, class: classNo });
      }
    }
    if (data.length === 0) {
      setMessage('无有效数据，请检查格式应为：年级 班级 学号 姓名');
      return;
    }
    const res = await fetch('/api/admin/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: data })
    });
    const result = await res.json();
    setMessage(result.message);
    setStudents(result.students || []);
    if (result.message.includes('成功') && onImportSuccess) onImportSuccess();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setExcelFile(file || null);
  };
  const handleExcelImport = async () => {
    if (!excelFile) return;
    const formData = new FormData();
    formData.append('file', excelFile);
    const res = await fetch('/api/admin/import-excel', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    setMessage(result.message);
    setStudents(result.students || []);
    if (result.message.includes('成功') && onImportSuccess) onImportSuccess();
    setExcelFile(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMode('direct')} style={{ marginRight: 16 }}>手动输入</button>
        <button onClick={() => setMode('excel')}>Excel导入</button>
      </div>
      {mode === 'direct' && (
        <div>
          <div style={{ marginBottom: 8 }}>每行格式：年级 班级 学号 姓名（如 2022 2204103 2025000001 张三）</div>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={8} style={{ width: 400, marginBottom: 8 }} placeholder="2022 2204103 2025000001 张三\n2022 2204103 2025000002 李四" />
          <br />
          <button onClick={handleDirectImport}>确认导入</button>
        </div>
      )}
      {mode === 'excel' && (
        <div style={{ marginBottom: 16 }}>
          <h4>Excel 导入</h4>
          <input type="file" accept=".xlsx,.xls" ref={fileInput} onChange={handleFileChange} />
          <button
            style={{ marginLeft: 12, background: '#4caf50', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: 4, fontWeight: 600, cursor: excelFile ? 'pointer' : 'not-allowed', opacity: excelFile ? 1 : 0.5 }}
            disabled={!excelFile}
            onClick={handleExcelImport}
          >确认导入</button>
        </div>
      )}
      {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
      {students.length > 0 && (
        <div>
          <h4>已导入学生：</h4>
          <ul>
            {students.map(s => (
              <li key={s.id}>{s.id} - {s.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminImport;
