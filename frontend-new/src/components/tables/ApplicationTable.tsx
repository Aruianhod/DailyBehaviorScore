import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ScoreApplication } from '../../types';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

const { Text } = Typography;

interface ApplicationTableProps {
  data: ScoreApplication[];
  loading?: boolean;
  showActions?: boolean;
  onView?: (record: ScoreApplication) => void;
  onEdit?: (record: ScoreApplication) => void;
  onDelete?: (record: ScoreApplication) => void;
  onWithdraw?: (record: ScoreApplication) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  data,
  loading = false,
  showActions = false,
  onView,
  onEdit,
  onDelete,
  onWithdraw,
  pagination
}) => {
  const columns: ColumnsType<ScoreApplication> = [
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
    },
    {
      title: '当前分值',
      dataIndex: 'currentScore',
      key: 'currentScore',
      width: 100,
      render: (score: number) => (
        <Text>{score}</Text>
      ),
    },
    {
      title: '申请分值',
      dataIndex: 'requestedScore',
      key: 'requestedScore',
      width: 100,
      render: (score: number, record: ScoreApplication) => {
        const change = score - record.currentScore;
        return (
          <Text type={change >= 0 ? 'success' : 'danger'}>
            {score} ({change >= 0 ? '+' : ''}{change})
          </Text>
        );
      },
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: {
        showTitle: false,
      },
      render: (reason: string) => (
        <Tooltip title={reason}>
          {reason}
        </Tooltip>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'teacherName',
      key: 'teacherName',
      width: 120,
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
  ];

  if (showActions) {
    columns.push({
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {onView && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            >
              查看
            </Button>
          )}
          {onEdit && record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
          )}
          {onWithdraw && record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => onWithdraw(record)}
            >
              撤销
            </Button>
          )}
          {onDelete && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={pagination ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        onChange: pagination.onChange,
      } : false}
      scroll={{ x: 1200 }}    />
  );
};

export default ApplicationTable;
