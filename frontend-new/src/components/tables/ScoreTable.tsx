import React from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ScoreRecord, ApplicationStatus } from '../../types';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

const { Text } = Typography;

interface ScoreTableProps {
  data: ScoreRecord[];
  loading?: boolean;
  showActions?: boolean;
  onView?: (record: ScoreRecord) => void;
  onEdit?: (record: ScoreRecord) => void;
  onDelete?: (record: ScoreRecord) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const ScoreTable: React.FC<ScoreTableProps> = ({
  data,
  loading = false,
  showActions = false,
  onView,
  onEdit,
  onDelete,
  pagination
}) => {
  const columns: ColumnsType<ScoreRecord> = [
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
      title: '分值变化',
      dataIndex: 'scoreChange',
      key: 'scoreChange',
      width: 100,
      render: (score: number) => (
        <Text type={score >= 0 ? 'success' : 'danger'}>
          {score >= 0 ? '+' : ''}{score}
        </Text>
      ),
    },
    {
      title: '变更原因',
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
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ApplicationStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
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
          {onEdit && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              编辑
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
      scroll={{ x: 1000 }}
    />
  );
};
