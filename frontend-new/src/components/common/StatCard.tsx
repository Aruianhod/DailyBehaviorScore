import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  loading = false,
  color = '#1890ff'
}) => {
  return (
    <Card loading={loading} bordered={false} style={{ height: '100%' }}>
      <Row>
        <Col span={16}>
          <Statistic
            title={title}
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ color }}
          />
          {trend && (
            <div style={{ marginTop: 8 }}>
              <Text type={trend.isPositive ? 'success' : 'danger'}>
                {trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(trend.value)}%
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                与上月相比
              </Text>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
};
