import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '../../components/common/PageHeader';
import { useApi, usePagination } from '../../hooks';
import { applicationApi } from '../../api';
import { ScoreApplication } from '../../types';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

const { Search } = Input;

const ApplicationHistory: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  
  const { pagination, handlePageChange, setPagination } = usePagination();

  const {
    data: applicationsResponse,
    loading,
    execute: fetchApplications
  } = useApi(applicationApi.getTeacherApplications);

  const columns: ColumnsType<ScoreApplication> = [
    {
      title: '学生信息',
      key: 'student',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.studentName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.studentId}</div>
        </div>
      ),
    },
    {
      title: '当前分值',
      dataIndex: 'currentScore',
      key: 'currentScore',
      width: 100,
      render: (score: number) => <span>{score}</span>,
    },
    {
      title: '申请分值',
      dataIndex: 'requestedScore',
      key: 'requestedScore',
      width: 100,
      render: (score: number, record: ScoreApplication) => {
        const change = score - record.currentScore;
        return (
          <div>
            <div>{score}</div>            <Tag color={change >= 0 ? 'green' : 'red'}>
              {change >= 0 ? '+' : ''}{change}
            </Tag>
          </div>
        );
      },
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'pending' | 'approved' | 'rejected') => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDate(date),
    },
    {
      title: '审批意见',
      dataIndex: 'reviewComment',
      key: 'reviewComment',
      ellipsis: true,
      render: (comment: string) => comment || '-',
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchApplications({
      page: 1,
      pageSize: pagination.pageSize,
      keyword: value
    });
    setPagination({ current: 1 });
  };

  useEffect(() => {
    fetchApplications({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchText
    });
  }, [pagination.current, pagination.pageSize]);

  const applications = applicationsResponse?.data?.data || [];

  return (
    <div>
      <PageHeader
        title="申请历史"
        description="查看我提交的所有分值申请记录"
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索学生姓名、学号"
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: applicationsResponse?.data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ApplicationHistory;
