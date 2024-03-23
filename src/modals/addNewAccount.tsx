import {App, Button, Form, FormProps, Input, Modal, Select, Space} from "antd";
import {Account} from "../entities/account";
import React, {useEffect, useState} from "react";
import {Network} from "../entities/network";
import {SAVE_ACCOUNT_EVENT} from "../utils/BridgeUtil";

const AddNewAccount = (props: {vmType: string, nameDefault: string, isOpen: boolean, onCancel: () => void, onSuccess: (nw: Account) => void}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const ipcRenderer = (window as any).ipcRenderer;
  const { message, notification, modal } = App.useApp();

  useEffect(() => {
    setIsModalOpen(props.isOpen)
  }, [props.isOpen])

  useEffect(() => {
    form.setFieldValue("accountName", props.nameDefault)
  }, [props.nameDefault])

  const onFinish: FormProps["onFinish"] = async (values) => {
    setLoading(true)
    values.vmType = props.vmType;
    try {
      const result = await ipcRenderer.invoke(SAVE_ACCOUNT_EVENT, values)
      props.onSuccess(result);
    } catch (e) {
      message.error(e.message)
    }
    setLoading(false)
  };

  const onFinishFailed: FormProps<Network>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);

  };

  return <Modal title="Add Account" open={isModalOpen} onCancel={props.onCancel} footer={null}>
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{
        accountName: props.nameDefault
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >

      <Form.Item
        label="Account Name"
        name="accountName"
        rules={[{ required: true, message: 'Account Name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Account
          </Button>
          <Button htmlType="button" onClick={() => { form.resetFields() }}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
}
export default AddNewAccount
