import React, { useEffect, useState } from 'react';
import AlertDialog from './components/AlertDialog';
import { useDialog } from './hooks/useDialog';

interface Student {
  id?: number;
  student_id: string;
  name: string;
  grade: string;
  class: string;
  score: number;
}

interface ScoreRecord {
  id: number;
  student_id: string;
  student_name: string;
  delta: number;
  reason: string;
  date: string;
  created_at?: string;
  status: string;
  reviewer?: string;
  operator?: string;
}

const TeacherViewStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // 使用自定义弹窗
  const { showAlert, alertState, closeAlert } = useDialog();

  // 获取年级选项
  useEffect(() => {
    fetch('/api/admin/class-options')
      .then(res => res.json())
      .then(data => {
        setGrades(data.grades || []);
      })
      .catch(err => {
        console.error('获取年级数据失败:', err);
        setGrades(['2021', '2022', '2023', '2024']);
      });
  }, []);

  // 当年级改变时，获取对应的班级选项
  useEffect(() => {
    if (selectedGrade) {
      fetch(`/api/admin/class-options?grade=${selectedGrade}`)
        .then(res => res.json())
        .then(data => {
          setClasses(data.classes || []);
          setSelectedClass(''); // 重置班级选择
        })
        .catch(err => {
          console.error('获取班级数据失败:', err);
          setClasses([]);
        });
    } else {
      // 如果没有选择年级，获取所有班级
      fetch('/api/admin/class-options')
        .then(res => res.json())
        .then(data => {
          setClasses(data.classes || []);
        })
        .catch(err => {
          console.error('获取班级数据失败:', err);
         //setClasses(['1班', '2班', '3班', '4班', '5班']);
        });
    }
  }, [selectedGrade]);  // 自动加载学生数据 - 只有在有筛选条件时才加载
  useEffect(() => {
    if (selectedGrade || selectedClass) {
      loadStudents();
    } else {
      // 如果没有筛选条件，清空数据
      setStudents([]);
    }
  }, [selectedGrade, selectedClass]);

  // 加载学生数据
  const loadStudents = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/students';
      const params = new URLSearchParams();
      
      if (selectedGrade) {
        params.append('grade', selectedGrade);
      }
      if (selectedClass) {
        params.append('class', selectedClass);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();
      
      const studentData = data.students || [];
      setStudents(studentData);
    } catch (err) {
      console.error('获取学生数据失败:', err);
    } finally {
      setLoading(false);
    }
  };
  // 获取学生的分值变更记录
  const fetchStudentRecords = async (studentId: string) => {
    try {
      console.log('获取学生记录，studentId:', studentId); // 调试日志
      const response = await fetch(`/api/student/score-records?student_id=${encodeURIComponent(studentId)}`);
      const data = await response.json();
      console.log('获取到的记录数据:', data); // 调试日志
      setScoreRecords(data.records || []);
    } catch (err) {
      console.error('获取学生记录失败:', err);
      setScoreRecords([]);
    }
  };

  // 查看学生详情
  const viewStudentDetail = (student: Student) => {
    setSelectedStudent(student);
    console.log('查看学生详情:', student); // 调试日志
    if (student.student_id) {
      fetchStudentRecords(student.student_id);
    } else {
      console.error('学生ID为空:', student);
      setScoreRecords([]);
    }
  };  // 导出Excel
  const exportToExcel = async () => {    if (!selectedClass) {
      showAlert('请先选择要导出的班级！', '请选择班级', 'warning');
      return;
    }

    setExporting(true);
    try {
      // 获取选定班级的学生数据
      const studentsToExport = students.filter(s => s.class === selectedClass);
        if (studentsToExport.length === 0) {
        showAlert('选定班级没有学生数据！', '无数据', 'warning');
        setExporting(false);
        return;
      }

      // 发送导出请求
      console.log('导出的学生数据:', studentsToExport); // 调试日志
      const exportData = {
        class_name: selectedClass,
        students: studentsToExport.map(student => ({
          student_id: student.student_id,
          name: student.name,
          grade: student.grade,
          class_name: student.class, // 将class映射为class_name
          score: student.score
        }))
      };
      console.log('发送到后端的数据:', exportData); // 调试日志
      
      const response = await fetch('/api/teacher/export-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        // 下载文件
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedClass}_学生信息_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);        showAlert('文件已成功下载到本地', '导出成功', 'success');
      } else {
        const errorData = await response.json();
        console.error('导出失败:', errorData);
        showAlert(errorData.message || '未知错误', '导出失败', 'error');
      }
    } catch (err) {
      console.error('导出失败:', err);
      showAlert('网络错误，请重试！', '导出失败', 'error');
    }
    setExporting(false);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f7f7f7' }}>
      {!selectedStudent ? (
        // 学生列表页面
        <div style={{ 
          width: '100%', 
          background: '#fff', 
          margin: '0 24px', 
          borderRadius: 8, 
          boxShadow: '0 2px 12px #e0e0e0', 
          padding: '32px 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 28, 
              letterSpacing: 2, 
              color: '#1a237e',
              margin: 0
            }}>
              学生信息查看
            </h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>              <select 
                value={selectedGrade} 
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass(''); // 重置班级选择
                }}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  border: '1px solid #ddd',
                  fontSize: 14,
                  minWidth: 120
                }}
              >
                <option value="">所有年级</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}级</option>
                ))}
              </select>
              
              <select 
                value={selectedClass} 
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                }}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  border: '1px solid #ddd',
                  fontSize: 14,
                  minWidth: 120
                }}
              >
                <option value="">所有班级</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>              <button 
                onClick={exportToExcel}
                disabled={!selectedClass || exporting}
                style={{ 
                  background: selectedClass ? '#1976d2' : '#ccc', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '8px 16px', 
                  cursor: selectedClass ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {exporting ? '导出中...' : '导出Excel'}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', fontSize: 20, color: '#888', margin: '60px 0' }}>
              加载中...
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              overflowX: 'auto',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8
            }}>
              <table style={{ 
                width: '100%', 
                minWidth: 800, 
                borderCollapse: 'separate', 
                borderSpacing: 0, 
                fontSize: 15, 
                background: '#fff'
              }}>                <thead>
                  <tr style={{ 
                    background: '#f8faff', 
                    borderBottom: '2px solid #e3f2fd', 
                    textAlign: 'center', 
                    height: 50 
                  }}>
                    <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '12%' }}>学号</th>
                    <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '15%' }}>姓名</th>
                    <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '10%' }}>年级</th>
                    <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '15%' }}>班级</th>
                    <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '13%' }}>当前分值</th>
                    <th style={{ fontSize: 15, fontWeight: 600, color: '#1976d2', padding: '12px 8px', width: '35%' }}>操作</th>
                  </tr>
                </thead>                <tbody>
                  {students.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={6} style={{ 
                        textAlign: 'center', 
                        padding: 60, 
                        color: '#bbb', 
                        fontSize: 16 
                      }}>
                        {selectedGrade || selectedClass ? '未找到符合条件的学生数据' : '请选择筛选条件查看学生信息'}
                      </td>
                    </tr>
                  ) : null}{students.map(student => (
                    <tr 
                      key={student.student_id} 
                      style={{ 
                        borderBottom: '1px solid #eee', 
                        textAlign: 'center', 
                        height: 48, 
                        transition: 'background-color 0.2s' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8faff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>
                        {student.student_id}
                      </td>
                      <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>
                        {student.name}
                      </td>
                      <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>
                        {student.grade}级
                      </td>
                      <td style={{ fontSize: 14, color: '#333', padding: '8px' }}>
                        {student.class}
                      </td>
                      <td style={{ 
                        fontSize: 15, 
                        fontWeight: 600,
                        color: student.score >= 80 ? '#388e3c' : student.score >= 60 ? '#1976d2' : '#d32f2f', 
                        padding: '8px' 
                      }}>
                        {student.score}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button 
                          onClick={() => viewStudentDetail(student)}
                          style={{ 
                            background: '#1976d2', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4, 
                            padding: '6px 12px', 
                            cursor: 'pointer',
                            fontSize: 13
                          }}
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // 学生详情页面
        <div style={{ 
          width: '100%', 
          background: '#fff', 
          margin: '0 24px', 
          borderRadius: 8, 
          boxShadow: '0 2px 12px #e0e0e0', 
          padding: '32px 24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ marginBottom: 24 }}>
            <button 
              onClick={() => setSelectedStudent(null)}
              style={{ 
                background: '#1976d2', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '8px 16px', 
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              ← 返回列表
            </button>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 24, 
              color: '#1a237e',
              marginBottom: 16
            }}>
              学生详细信息
            </h2>            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div><strong>学号：</strong>{selectedStudent.student_id}</div>
              <div><strong>姓名：</strong>{selectedStudent.name}</div>
              <div><strong>年级：</strong>{selectedStudent.grade}级</div>
              <div><strong>班级：</strong>{selectedStudent.class}</div>
              <div><strong>当前分值：</strong><span style={{ 
                fontWeight: 600,
                color: selectedStudent.score >= 80 ? '#388e3c' : selectedStudent.score >= 60 ? '#1976d2' : '#d32f2f' 
              }}>{selectedStudent.score}</span></div>
            </div>
          </div>

          <h3 style={{ 
            fontWeight: 600, 
            fontSize: 18, 
            color: '#1a237e',
            marginBottom: 16
          }}>
            分值变更记录
          </h3>
          
          <div style={{ 
            width: '100%', 
            overflowX: 'auto',
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 8
          }}>
            <table style={{ 
              width: '100%', 
              minWidth: 800, 
              borderCollapse: 'separate', 
              borderSpacing: 0, 
              fontSize: 14, 
              background: '#fff'
            }}>
              <thead>
                <tr style={{ 
                  background: '#f8faff', 
                  borderBottom: '2px solid #e3f2fd', 
                  textAlign: 'center', 
                  height: 45 
                }}>
                  <th style={{ fontSize: 14, fontWeight: 600, color: '#1976d2', padding: '8px', width: '15%' }}>分值变动</th>
                  <th style={{ fontSize: 14, fontWeight: 600, color: '#1976d2', padding: '8px', width: '30%' }}>原因</th>
                  <th style={{ fontSize: 14, fontWeight: 600, color: '#1976d2', padding: '8px', width: '15%' }}>变更时间</th>
                  <th style={{ fontSize: 14, fontWeight: 600, color: '#1976d2', padding: '8px', width: '15%' }}>状态</th>
                  <th style={{ fontSize: 14, fontWeight: 600, color: '#1976d2', padding: '8px', width: '15%' }}>处理人</th>
                </tr>
              </thead>
              <tbody>
                {scoreRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      textAlign: 'center', 
                      padding: 40, 
                      color: '#bbb', 
                      fontSize: 14 
                    }}>
                      暂无分值变更记录
                    </td>
                  </tr>
                ) : (
                  scoreRecords.map(record => (
                    <tr 
                      key={record.id} 
                      style={{ 
                        borderBottom: '1px solid #eee', 
                        textAlign: 'center', 
                        height: 40 
                      }}
                    >
                      <td style={{ 
                        fontWeight: 600,
                        color: record.delta > 0 ? '#1976d2' : '#d32f2f', 
                        padding: '8px' 
                      }}>
                        {record.delta > 0 ? '+' : ''}{record.delta}
                      </td>
                      <td style={{ 
                        fontSize: 13, 
                        color: '#555', 
                        padding: '8px', 
                        textAlign: 'left' 
                      }}>
                        {record.reason}
                      </td>                      <td style={{ fontSize: 13, color: '#666', padding: '8px' }}>
                        {(() => {
                          const dateValue = record.date || record.created_at;
                          return dateValue ? new Date(dateValue).toLocaleDateString('zh-CN') : '-';
                        })()}
                      </td>
                      <td style={{ 
                        fontSize: 13, 
                        fontWeight: 600,
                        color: record.status === '已通过' ? '#388e3c' : record.status === '已驳回' ? '#d32f2f' : '#1976d2',
                        padding: '8px' 
                      }}>
                        {record.status}
                      </td>
                      <td style={{ fontSize: 13, color: '#333', padding: '8px' }}>
                        {record.reviewer || record.operator || '系统'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>          </div>
        </div>
      )}
      
      {/* 对话框组件 */}
      <AlertDialog
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </div>
  );
};

export default TeacherViewStudents;
