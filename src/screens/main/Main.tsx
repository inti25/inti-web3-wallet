import React, {useEffect, useState} from "react"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  CopyOutlined
} from '@ant-design/icons';
import {Layout, Menu, Button, theme, Image, MenuProps, Flex, Select, Tooltip} from 'antd';
import './index.css'
import {GET_NETWORKS_EVENT, GET_PASSWORD_EVENT} from "../../utils/BridgeUtil";
import {Network} from "../../entities/network";

const {Header, Sider, Content} = Layout;

const Main = () => {
  const ipcRenderer = (window as any).ipcRenderer;
  const [collapsed, setCollapsed] = useState(false);
  const [networks, setNetworks] = useState([]);
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

  async function loadNetworks() {
    const result = await ipcRenderer.invoke(GET_NETWORKS_EVENT, null);
    result.push({
      id: 0,
      image: <PlusOutlined/>,
      name: 'Add Network'
    })
    setNetworks(result);
  }

  useEffect(() => {
    loadNetworks();
  }, [])

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  return (
    <Layout className={'main-container'}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        {/*<div className="demo-logo-vertical" />*/}
        <Menu
          style={{flex: "auto"}}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          onClick={onClick}
          items={networks.map((item: Network) => {
            return {
              key: item.id,
              icon: item.id == 0 ? item.image : <img alt={"1"} width={24} height={24} src={item.image}/>,
              label: item.name
            }
          })}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: 0,
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Select
            style={{flex: 1}}
            defaultValue="lucy"
            onChange={handleChange}
            options={[
              {value: 'jack', label: 'Jack'},
              {value: 'lucy', label: 'Lucy'},
              {value: 'Yiminghe', label: 'yiminghe'},
              {value: 'disabled', label: 'Disabled', disabled: true},
            ]}
          />
          <Tooltip title="Copy Account Address">
            <Button
              type="text"
              icon={<CopyOutlined/>}
              onClick={() => {
                console.log('Copy Account Address')
              }}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Tooltip>
          <Tooltip title="Add Account">
            <Button
              type="text"
              icon={<PlusOutlined/>}
              onClick={() => {
                console.log('Add Account')
              }}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Tooltip>
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