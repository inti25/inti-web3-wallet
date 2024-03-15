import React, {useEffect, useState} from "react"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {Layout, Menu, Button, theme, Image} from 'antd';
import './index.css'
const { Header, Sider, Content } = Layout;

const Main = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const ipcRenderer = (window as any).ipcRenderer;
  useEffect(() => {
    ipcRenderer.invoke('some-name', "someArgument").then((result: any) => {
      // ...
      console.log('result', result)
    })
  }, [])

  return (
    <Layout className={'main-container'}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        {/*<div className="demo-logo-vertical" />*/}
        <Menu
          style={{ flex: "auto" }}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <img alt={"1"} width={24} height={24} src={'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png'} />,
              label: 'nav 1',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'nav 2',
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'nav 3',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Content
        </Content>
      </Layout>
    </Layout>
  )
}
export default Main