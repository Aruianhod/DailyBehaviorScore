import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Input, Select, message, Modal, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '../../components/common/PageHeader';
import { applicationApi } from '../../api';
import { ScoreApplication, ApiResponse, PaginatedResponse } from '../../types';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const ApplicationReview: React.FC = () => {
  const [applicationsData, setApplicationsData] = useState<ApiResponse<PaginatedResponse<ScoreApplication>>>();
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ScoreApplication | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await applicationApi.getApplications({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        status: filters.status,
      });
      setApplicationsData(response);
    } catch (error) {
      console.error('获取申请列表失败:', error);
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  const handleReviewApplication = async (action: 'approve' | 'reject') => {
    if (!selectedApplication) return;
    
    try {
      await applicationApi.reviewApplication(selectedApplication.id, action, reviewReason);
      message.success(`${action === 'approve' ? '通过' : '拒绝'}申请成功`);
      setApproveModalVisible(false);
      setRejectModalVisible(false);
      setReviewReason('');
      fetchApplications();
    } catch (error) {
      message.error(`${action === 'approve' ? '通过' : '拒绝'}申请失败`);
    }
  };

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
    },
    {
      title: '申请分值',
      dataIndex: 'requestedScore',
      key: 'requestedScore',
      width: 100,
    },
    {
      title: '分值变化',
      key: 'scoreChange',
      width: 100,
      render: (_, record) => {
        const change = record.requestedScore - record.currentScore;
        return (
          <Tag color={change >= 0 ? 'green' : 'red'}>
            {change >= 0 ? '+' : ''}{change}
          </Tag>
        );
      },
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      width: 200,
    },
    {
      title: '申请教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,      render: (status: string) => (
        <Tag color={getStatusColor(status as 'pending' | 'approved' | 'rejected')}>
          {getStatusText(status as 'pending' | 'approved' | 'rejected')}
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
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
                danger
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleViewDetail = (application: ScoreApplication) => {
    setSelectedApplication(application);
    setDetailModalVisible(true);
  };

  const handleApprove = (application: ScoreApplication) => {
    setSelectedApplication(application);
    setApproveModalVisible(true);
  };

  const handleReject = (application: ScoreApplication) => {
    setSelectedApplication(application);
    setRejectModalVisible(true);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div>
      <PageHeader
        title="申请审批"
        description="审批学生和老师提交的分值变更申请"
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Search
              placeholder="搜索学生姓名、教师姓名"
              onSearch={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="筛选状态"
              style={{ width: 120 }}
              allowClear
              onChange={handleStatusFilter}
            >
              <Option value="pending">待审批</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={applicationsData?.data?.data || []}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: applicationsData?.data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedApplication && (
          <div>
            <p><strong>学生：</strong>{selectedApplication.studentName} ({selectedApplication.studentId})</p>
            <p><strong>申请教师：</strong>{selectedApplication.teacherName}</p>
            <p><strong>当前分值：</strong>{selectedApplication.currentScore}</p>
            <p><strong>申请分值：</strong>{selectedApplication.requestedScore}</p>
            <p><strong>分值变化：</strong>
              <Tag color={(selectedApplication.requestedScore - selectedApplication.currentScore) >= 0 ? 'green' : 'red'}>
                {(selectedApplication.requestedScore - selectedApplication.currentScore) >= 0 ? '+' : ''}
                {selectedApplication.requestedScore - selectedApplication.currentScore}
              </Tag>
            </p>
            <p><strong>申请原因：</strong></p>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              {selectedApplication.reason}
            </div>
            <p style={{ marginTop: 16 }}><strong>申请时间：</strong>{formatDate(selectedApplication.createdAt)}</p>
            {selectedApplication.reviewComment && (
              <>
                <p><strong>审批意见：</strong></p>
                <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 6 }}>
                  {selectedApplication.reviewComment}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 通过模态框 */}
      <Modal
        title="确认通过申请"
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setReviewReason('');
        }}
        onOk={() => handleReviewApplication('approve')}
      >
        <p>确定要通过该申请吗？</p>
        <TextArea
          rows={4}
          placeholder="请输入审批意见（可选）"
          value={reviewReason}
          onChange={(e) => setReviewReason(e.target.value)}
        />
      </Modal>

      {/* 拒绝模态框 */}
      <Modal
        title="确认拒绝申请"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setReviewReason('');
        }}
        onOk={() => handleReviewApplication('reject')}
      >
        <p>确定要拒绝该申请吗？</p>
        <TextArea
          rows={4}
          placeholder="请输入拒绝原因"
          value={reviewReason}
          onChange={(e) => setReviewReason(e.target.value)}
          required
        />
      </Modal>
    </div>
  );
};

export default ApplicationReview;
