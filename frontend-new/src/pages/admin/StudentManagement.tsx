import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Input, Select, message, Modal, Tag } from 'antd';
import { PlusOutlined, ExportOutlined, ImportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '../../components/common/PageHeader';
import { studentApi } from '../../api';
import { Student, ApiResponse, PaginatedResponse } from '../../types';

const { Search } = Input;
const { Option } = Select;

const StudentManagement: React.FC = () => {
  const [studentsData, setStudentsData] = useState<ApiResponse<PaginatedResponse<Student>>>();
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  
  const [filters, setFilters] = useState({
    grade: '',
    class: '',
    keyword: '',
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudents({
        page: pagination.current,
        pageSize: pagination.pageSize,
        grade: filters.grade,
        class: filters.class,
        keyword: filters.keyword,
      });
      setStudentsData(response);
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error('获取学生列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await studentApi.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('获取班级列表失败:', error);
    }
  }, []);

  const columns: ColumnsType<Student> = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
    },
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
      width: 120,
    },
    {
      title: '当前分值',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score: number) => (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'}>
          {score}
        </Tag>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleClassFilter = (value: string) => {
    setFilters(prev => ({ ...prev, class: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleGradeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, grade: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleEdit = (_student: Student) => {
    message.info('编辑功能正在开发中');
  };

  const handleDelete = (student: Student) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除学生 ${student.name}(${student.studentId}) 吗？`,
      onOk: async () => {
        try {
          await studentApi.deleteStudent(student.id);
          message.success('删除成功');
          fetchStudents();
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的学生');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 名学生吗？`,
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => studentApi.deleteStudent(id as string)));
          message.success('批量删除成功');
          fetchStudents();
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  const handleImport = () => {
    message.info('导入功能正在开发中');
  };

  const handleExport = () => {
    message.info('导出功能正在开发中');
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div>
      <PageHeader
        title="学生管理"
        description="管理学生信息，包括学生的基本信息、分值记录等"
        extra={[
          <Button key="import" icon={<ImportOutlined />} onClick={handleImport}>
            导入学生
          </Button>,
          <Button key="export" icon={<ExportOutlined />} onClick={handleExport}>
            导出数据
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            添加学生
          </Button>
        ]}
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Search
              placeholder="搜索学号、姓名"
              onSearch={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="选择年级"
              style={{ width: 120 }}
              allowClear
              onChange={handleGradeFilter}
            >
              <Option value="2021">2021级</Option>
              <Option value="2022">2022级</Option>
              <Option value="2023">2023级</Option>
              <Option value="2024">2024级</Option>
            </Select>
            <Select
              placeholder="选择班级"
              style={{ width: 150 }}
              allowClear
              onChange={handleClassFilter}
            >
              {classes.map(cls => (
                <Option key={cls} value={cls}>{cls}</Option>
              ))}
            </Select>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger 
                onClick={handleBatchDelete}
                loading={loading}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={studentsData?.data?.data || []}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: studentsData?.data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default StudentManagement;
