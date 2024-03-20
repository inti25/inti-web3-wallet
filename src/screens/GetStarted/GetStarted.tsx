import {Button, Card, Flex, Typography} from "antd";
import React from "react";
import { useNavigate } from 'react-router-dom';

const GetStarted = () => {
  const navigate = useNavigate();
  const cardStyle: React.CSSProperties = {
    width: 620,
  };

  const imgStyle: React.CSSProperties = {
    display: 'block',
    width: 273,
  };

  return (
    <Flex align={"center"} style={{ width: '100%', height: '100vh'}} justify={"center"} >
    <Card hoverable style={cardStyle} styles={{ body: { padding: 0, overflow: 'hidden' } }}>
      <Flex justify="space-between">
        <img
          alt="avatar"
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          style={imgStyle}
        />
        <Flex vertical align="flex-end" justify="space-between" gap={16} style={{ padding: 32 }}>
          <Typography.Title level={3}>
            “antd is an enterprise-class UI design language and React UI library.”
          </Typography.Title>
          <Button type="primary" onClick={() =>{
            navigate('/ImportMnemonic', {replace: true})
          }}>
            Import Wallet
          </Button>

          <Button type="default" onClick={() =>{
            navigate('/CreateWallet', {replace: true})
          }}>
            Create New Wallet
          </Button>
        </Flex>
      </Flex>
    </Card>
    </Flex>
  )
}

export default GetStarted
