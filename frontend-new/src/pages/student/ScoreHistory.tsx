import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Space, Input, Select, DatePicker, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '../../components/common/PageHeader';
import { recordApi } from '../../api';
import { ScoreRecord, ApiResponse, PaginatedResponse } from '../../types';
import { formatDate } from '../../utils/helpers';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const ScoreHistory: React.FC = () => {
  const [recordsData, setRecordsData] = useState<ApiResponse<PaginatedResponse<ScoreRecord>>>();
  const [loading, setLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [filters, setFilters] = useState({
    keyword: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        type: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      
      const response = await recordApi.getRecords(params);
      setRecordsData(response);
    } catch (error) {
      console.error('获取分数历史失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const columns: ColumnsType<ScoreRecord> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '分值变化',
      dataIndex: 'scoreChange',
      key: 'scoreChange',
      width: 100,
      render: (score: number) => (
        <Tag color={score >= 0 ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 8px' }}>
          {score >= 0 ? '+' : ''}{score}
        </Tag>
      ),
    },
    {
      title: '变更原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const types: Record<string, { text: string; color: string }> = {
          bonus: { text: '加分', color: 'green' },
          penalty: { text: '扣分', color: 'red' },
          adjustment: { text: '调整', color: 'blue' }
        };
        const typeInfo = types[type] || { text: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
    },
    {
      title: '发生时间',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      width: 160,
      render: (date: string) => formatDate(date),
    },
    {
      title: '记录时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDate(date),
    },
  ];

  const handleDateRangeChange = (_: any, dateStrings: [string, string]) => {
    setFilters(prev => ({ 
      ...prev, 
      startDate: dateStrings[0], 
      endDate: dateStrings[1]
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, type: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  const handleRefresh = () => {
    fetchRecords();
  };

  return (
    <div>
      <PageHeader
        title="分值记录"
        description="查看我的分值变更历史记录"
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Search
              placeholder="搜索原因或操作人"
              style={{ width: 200 }}
              onSearch={handleSearch}
              allowClear
            />
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
              style={{ width: 250 }}
            />
            <Select
              placeholder="操作类型"
              style={{ width: 120 }}
              allowClear
              onChange={handleTypeFilter}
            >
              <Option value="bonus">加分</Option>
              <Option value="penalty">扣分</Option>
              <Option value="adjustment">调整</Option>
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={recordsData?.data?.data || []}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: recordsData?.data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ScoreHistory;
