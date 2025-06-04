import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { ScoreApplication } from '../../types';
import { APPLICATION_TYPES } from '../../utils/constants';

const { TextArea } = Input;
const { Option } = Select;

interface ScoreFormModalProps {
  visible: boolean;
  title: string;
  initialValues?: Partial<ScoreApplication>;
  onCancel: () => void;
  onSubmit: (values: Partial<ScoreApplication>) => Promise<void>;
  loading?: boolean;
}

export const ScoreFormModal: React.FC<ScoreFormModalProps> = ({
  visible,
  title,
  initialValues,
  onCancel,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <Form.Item
          name="studentId"
          label="学号"
          rules={[
            { required: true, message: '请输入学号' },
            { pattern: /^\d{10,12}$/, message: '学号格式不正确' }
          ]}
        >
          <Input placeholder="请输入学生学号" />
        </Form.Item>

        <Form.Item
          name="studentName"
          label="学生姓名"
          rules={[{ required: true, message: '请输入学生姓名' }]}
        >
          <Input placeholder="请输入学生姓名" />
        </Form.Item>

        <Form.Item
          name="type"
          label="申请类型"
          rules={[{ required: true, message: '请选择申请类型' }]}
        >
          <Select placeholder="请选择申请类型">
            {Object.entries(APPLICATION_TYPES).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="scoreChange"
          label="分值变化"
          rules={[
            { required: true, message: '请输入分值变化' },
            { type: 'number', min: -100, max: 100, message: '分值变化范围为 -100 到 100' }
          ]}
        >
          <InputNumber            placeholder="请输入分值变化"
            style={{ width: '100%' }}
            formatter={(value) => value ? (Number(value) > 0 ? `+${value}` : `${value}`) : ''}
            parser={(value) => value ? parseInt(value.replace(/[^\d-]/g, '')) : 0}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="申请原因"
          rules={[
            { required: true, message: '请输入申请原因' },
            { min: 10, message: '申请原因至少10个字符' },
            { max: 500, message: '申请原因不能超过500个字符' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="请详细描述申请原因..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="evidence"
          label="证明材料"
        >
          <TextArea
            rows={3}
            placeholder="请提供相关证明材料的描述或链接..."
            showCount
            maxLength={300}
          />
        </Form.Item>

        <Form.Item
          name="occurredAt"
          label="发生时间"
          rules={[{ required: true, message: '请选择发生时间' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择发生时间"
            showTime
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
