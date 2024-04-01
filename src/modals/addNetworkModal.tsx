import {App, Button, Form, FormProps, Input, InputNumber, Modal, Select, Space} from "antd";
import React, {useEffect,useState} from "react";
import {VMTYPE} from "../utils/constains";
import {Network} from "../entities/network";
import {SAVE_NETWORKS_EVENT} from "../utils/BridgeUtil";

const AddNetworkModal = (props: {isOpen : boolean, onCancel: () => void, onAddNetworkSuccess: (nw: Network) => void, network? :Network}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const ipcRenderer = (window as any).ipcRenderer;
  const { message, notification, modal } = App.useApp();
  useEffect(() => {
    setIsModalOpen(props.isOpen)
  }, [props.isOpen])

  const onFinish: FormProps<Network>["onFinish"] = async (values) => {
    console.log('onFinish', values);
    setLoading(true)
    try {
      if (props.network) {
        values.id = props.network.id;
      }
      const result = await ipcRenderer.invoke(SAVE_NETWORKS_EVENT, values)
      props.onAddNetworkSuccess(result);
    } catch (e) {
      message.error(e.message)
    }
    setLoading(false)
  };

  const onFinishFailed: FormProps<Network>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);

  };

  const onTypeChange = (value: string) => {
    form.setFieldValue("vmType", value)
    console.log('onTypeChange', value)
  }

  return (
    <Modal title={props.network ? "Edit Network" : "Add Network"} open={isModalOpen} onCancel={props.onCancel} footer={null}>
      <Form
        name="mnemonicForm"
        initialValues={ props.network ? props.network : {
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
          <Select onChange={onTypeChange}>
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
          rules={[{ type: 'url', warningOnly: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Network>
          label="Public RPC"
          name="rpcUrl"
          rules={[{ required: true, message: 'Please input public RPC' }, { type: 'url', warningOnly: true }]}
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
          label="Currency Image URL"
          name="currencyImage"
          rules={[{ type: 'url', warningOnly: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Network>
          label="Explorer"
          name="explorerUrl"
          rules={[{ type: 'url', warningOnly: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {props.network ? "Save" : "Add Network"}
            </Button>
            <Button htmlType="button" onClick={() => { form.resetFields() }}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default AddNetworkModal