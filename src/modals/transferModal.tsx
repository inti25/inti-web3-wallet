import {Account} from "../entities/account";
import {Token} from "../entities/token";
import {Network} from "../entities/network";
import {App, Button, Form, FormProps, Input, Modal, Result, Space, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {formatUnits, parseUnits} from "ethers";
import {transferToken} from "../utils/tokenUtils";

const TransferModal = (props: { isOpen: boolean, account: Account, token: Token, network: Network, onCancel: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form] = Form.useForm();
  const ipcRenderer = (window as any).ipcRenderer;
  const {message, notification, modal} = App.useApp();

  useEffect(() => {
    setIsModalOpen(props.isOpen)
  }, [props.isOpen])

  const onFinish: FormProps["onFinish"] = async (values) => {
    transfer(values.to, parseUnits(values.amount, props.token.decimal));
  };

  const onFinishFailed: FormProps<Network>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);

  };

  const setMaxAmount = () => {
    form.setFieldValue("amount", formatUnits(props.token.balance, props.token.decimal))
  }

  const closeModal = () => {
    form.resetFields();
    setResult(null);
    props.onCancel();
  }

  async function transfer(to: string, amount: bigint) {
    setLoading(true)
    const res = await transferToken(props.network, props.token, props.account, to, amount);
    setResult(res);
    setLoading(false)
  }


  return <Modal title={`Transfer ${props.token?.name}`} open={isModalOpen} onCancel={() => {closeModal()}} footer={null}>
    {result ?
      <Result
        status={ result.isSuccess ? "success" : "error"}
        title={result.isSuccess ? "Transaction Successful!" : "Transaction Failed!"}
        subTitle={result.isSuccess ? <a href={`${props.network.explorerUrl}/tx/${result.txnHash}`} target={"_blank"}>View on Scan</a> : result.error}
        extra={[
          <Button type="primary" key="console" onClick={() => {
            closeModal();
          }}>
            Close
          </Button>,
        ]}
      />
      :
      <Form
      form={form}
      labelCol={{span: 8}}
      wrapperCol={{span: 16}}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >

      <Form.Item
        label="To Address"
        name="to"
        rules={[{required: true, message: 'Enter receiver address!'}]}
      >
        <Input/>
      </Form.Item>
      <Form.Item
        label="Amount"
      >
        <Space style={{alignContent: "center"}}>
          <Form.Item
            name="amount"
            noStyle
            rules={[{required: true, message: 'Amount is require!'}]}
          >
            <Input placeholder={'0.0'} suffix={<Button type={"link"} onClick={() => {
              setMaxAmount()
            }}>MAX</Button>}/>
          </Form.Item>
          <div>{props.token?.symbol}</div>
        </Space>
      </Form.Item>


      <Form.Item wrapperCol={{offset: 8, span: 16}}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Transfer
          </Button>
        </Space>
      </Form.Item>
    </Form>
    }
  </Modal>
}
export default TransferModal