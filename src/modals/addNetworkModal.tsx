import {Button, Form, FormProps, Input, InputNumber, Modal, Select} from "antd";
import React, {useEffect,useState} from "react";
import {VMTYPE} from "../utils/constains";
import {Network} from "../entities/network";
import {SAVE_NETWORKS_EVENT} from "../utils/BridgeUtil";

const AddNetworkModal = (props: {isOpen : boolean, onCancel: () => void, onAddNetworkSuccess: (nw: Network) => void}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const ipcRenderer = (window as any).ipcRenderer;
  useEffect(() => {
    setIsModalOpen(props.isOpen)
  }, [props.isOpen])

  const onFinish: FormProps<Network>["onFinish"] = async (values) => {
    console.log('onFinish', values);
    setLoading(true)
    const result = await ipcRenderer.invoke(SAVE_NETWORKS_EVENT, values)
    setLoading(false)
    props.onAddNetworkSuccess(result);
  };

  const onFinishFailed: FormProps<Network>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);

  };

  const onTypeChange = (value: string) => {
    form.setFieldValue("vmType", value)
    console.log('onTypeChange', value)
  }

  return (
    <Modal title="Add Network" open={isModalOpen} onCancel={props.onCancel} footer={null}>
      <Form
        name="mnemonicForm"
        initialValues={{
          vmType: VMTYPE.EVM
        }}
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<Network> name={"vmType"} label="VM Type">
          <Select defaultValue={VMTYPE.EVM} onChange={onTypeChange}>
            <Select.Option value={VMTYPE.EVM}>{VMTYPE.EVM}</Select.Option>
            <Select.Option value={VMTYPE.SOLANA}>{VMTYPE.SOLANA}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item<Network>
          label="Network Name"
          name="name"
          rules={[{ required: true, message: 'Please input Network Name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Network>
          label="Image"
          name="image"
        >
          <Input />
        </Form.Item>

        <Form.Item<Network>
          label="Public RPC"
          name="rpcUrl"
          rules={[{ required: true, message: 'Please input public RPC' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Network>
          label="Chain Id"
          name="chainId"
        >
          <InputNumber />
        </Form.Item>

        <Form.Item<Network>
          label="Symbol"
          name="currencySymbol"
          rules={[{ required: true, message: 'Please input Currency Symbol' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Network>
          label="Explorer"
          name="explorerUrl"
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Network
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default AddNetworkModal