import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {Button, Form, FormProps, Input, Flex} from 'antd';
const { TextArea } = Input;
import './index.css'
import {ethers} from "ethers";
import {SAVE_PASSWORD_EVENT} from "../../utils/BridgeUtil";

type FieldType = {
  mnemonic?: string;
  password?: string;
};

const ImportMnemonic = () => {
  const { pathname } = useLocation();
  const [form] = Form.useForm();
  const ipcRenderer = (window as any).ipcRenderer;
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log('Success:', values);
    ipcRenderer.invoke(SAVE_PASSWORD_EVENT, values).then((result: any) => {
      console.log('result', result)
    })
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);

  };

  useEffect(() => {
    if (pathname == "/CreateWallet") {
      const wallet = ethers.Wallet.createRandom();
      form.setFieldValue("mnemonic", wallet.mnemonic.phrase)
    }
  }, [pathname])

  return (
    <div className={'ImportMnemonicContainer'}>
      <Form
        name="mnemonicForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ minWidth: 600 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="mMnemonic"
          name="mnemonic"
          rules={[{ required: true, message: 'Please input your mnemonic!' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>

  )
}

export default ImportMnemonic
