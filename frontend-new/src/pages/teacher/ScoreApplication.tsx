import React, { useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { ApplicationTable } from '../../components/tables/ApplicationTable';
import { ScoreFormModal } from '../../components/forms/ScoreFormModal';
import { useApi, usePagination, useModal } from '../../hooks';
import { applicationApi } from '../../api';
import { ScoreApplication as ScoreApplicationType } from '../../types';

const ScoreApplication: React.FC = () => {
  const { pagination, handlePageChange } = usePagination();
  const createModal = useModal();
  const {
    data: applicationsResponse,
    loading,
    execute: fetchApplications
  } = useApi(applicationApi.getTeacherApplications);
  const {
    loading: createLoading,
    execute: createApplication  } = useApi(applicationApi.createApplication, {
    onSuccess: () => {
      message.success('申请提交成功');
      createModal.hide();
      fetchApplications({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: ''
      });
    }
  });

  const handleCreate = () => {
    createModal.show();
  };

  const handleSubmit = async (values: Partial<ScoreApplicationType>) => {
    if (values.studentId && values.requestedScore && values.reason) {
      await createApplication({
        studentId: values.studentId,
        requestedScore: values.requestedScore,
        reason: values.reason
      });
    }
  };  useEffect(() => {
    fetchApplications({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: ''
    });
  }, [pagination.current, pagination.pageSize]);

  // 获取申请数据
  const applications = applicationsResponse?.data?.data || [];

  return (
    <div>
      <PageHeader
        title="分值申请"
        description="提交学生分值变更申请，等待管理员审批"
        extra={[
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建申请
          </Button>
        ]}
      />

      <Card>
        <ApplicationTable
          data={applications}
          loading={loading}
          showActions={true}
          onWithdraw={(record) => {
            // TODO: 实现撤销申请功能
            console.log('撤销申请:', record);
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: applicationsResponse?.data?.total || 0,
            onChange: handlePageChange
          }}
        />
      </Card>

      <ScoreFormModal
        visible={createModal.visible}
        title="新建分值申请"
        onCancel={createModal.hide}
        onSubmit={handleSubmit}
        loading={createLoading}
      />
    </div>
  );
};

export default ScoreApplication;
