import React from 'react';
import { Typography, Button, Space, Breadcrumb } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumb?: Array<{ title: string; href?: string }>;
  extra?: React.ReactNode;
  onBack?: () => void;
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumb,
  extra,
  onBack,
  description
}) => {
  return (
    <div className="page-header" style={{ marginBottom: 24 }}>
      {breadcrumb && (
        <Breadcrumb style={{ marginBottom: 16 }}>
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.href ? <a href={item.href}>{item.title}</a> : item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{ marginRight: 8 }}
            />
          )}
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {title}
            </Title>
            {description && (
              <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                {description}
              </Typography.Text>
            )}
          </div>
        </div>
        
        {extra && <Space>{extra}</Space>}
      </div>
    </div>
  );
};
