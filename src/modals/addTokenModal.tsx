import {App, Button, Form, FormProps, Input, InputNumber, Modal, Select, Space} from "antd";
import React, {useEffect,useState} from "react";
import {SAVE_TOKEN_EVENT} from "../utils/BridgeUtil";
import {Token} from "../entities/token";
import {Network} from "../entities/network";
import {ethers} from "ethers";
import {getTokenInfo} from "../utils/tokenUtils";

const AddTokenModal = (props: {isOpen : boolean, network:Network, onCancel: () => void, onAddTokenSuccess: (token: Token) => void}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTokenAddress, setIsTokenAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const ipcRenderer = (window as any).ipcRenderer;
  const { message, notification, modal } = App.useApp();
  useEffect(() => {
    setIsModalOpen(props.isOpen)
  }, [props.isOpen])

  const onFinish: FormProps<Token>["onFinish"] = async (values) => {
    console.log('onFinish', values);
    setLoading(true)
    try {
      values.network = props.network;
      const result = await ipcRenderer.invoke(SAVE_TOKEN_EVENT, values)
      props.onAddTokenSuccess(result);
    } catch (e) {
      message.error(e.message)
    }
    setLoading(false)
  };

  const onFinishFailed: FormProps<Token>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);

  };

  const onAddressChange = async (value: string) => {
    if (ethers.isAddress(value)) {
      setIsTokenAddress(true);
      const {name, symbol, decimal} = await getTokenInfo(value, props.network);
      form.setFieldValue("name", name)
      form.setFieldValue("symbol", symbol)
      form.setFieldValue("decimal", decimal)
    } else {
      setIsTokenAddress(false);
    }
  }

  return (
    <Modal title="Add Token" open={isModalOpen} onCancel={props.onCancel} footer={null}>
      <Form
        name="addTokenForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >

        <Form.Item<Token>
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please input Token Address!' }, ({ getFieldValue }) => ({
            validator(_, value) {
              if (ethers.isAddress(value)) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Invalid Token Address !'));
            },
          }),]}
        >
          <Input onChange={(event => {
            onAddressChange(event.target.value)
          })} />
        </Form.Item>

        <Form.Item<Token>
          label="Token Name"
          name="name"
          rules={[{ required: true, message: 'Please input Token Name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Token>
          label="Symbol"
          name="symbol"
          rules={[{ required: true, message: 'Please input Token Symbol' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<Token>
          label="Decimal"
          name="decimal"
          rules={[{ required: true, message: 'Please input Token Decimal' }]}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item<Token>
          label="Image"
          name="image"
          rules={[{ type: 'url', warningOnly: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Token
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
export default AddTokenModal