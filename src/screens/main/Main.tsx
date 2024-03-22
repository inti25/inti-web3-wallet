import React, {useEffect, useState} from "react"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  CopyOutlined, MoreOutlined, EditOutlined
} from '@ant-design/icons';
import {Layout, Menu, Button, theme, Image, MenuProps, Flex, Select, Tooltip, Popover} from 'antd';
import './index.css'
import {GET_NETWORKS_EVENT, GET_PASSWORD_EVENT} from "../../utils/BridgeUtil";
import {Network} from "../../entities/network";
import AddNetworkModal from "../../modals/addNetworkModal";

const {Header, Sider, Content} = Layout;

const Main = () => {
  const ipcRenderer = (window as any).ipcRenderer;
  const [isOpenAddNetWorkModal, setOpenAddNetWorkModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [openMoreMenu, setOpenMoreMenu] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
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
    if (e.key == '0') {
      setOpenAddNetWorkModal(true)
    }
  };

  const onAccountChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const moreMenu = (
    <Flex vertical gap={"small"}>
      <Button disabled={!selectedAccount} icon={<CopyOutlined/>}>Copy Address</Button>
      <Button disabled={!selectedAccount} icon={<EditOutlined/>}>Edit Account</Button>
      <Button icon={<PlusOutlined/>} onClick={() => {
        setOpenMoreMenu(false)
      }}>Add Account</Button>
    </Flex>
  );

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
              label: item.name,
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
            onChange={onAccountChange}
            options={[]}
          />
          <Popover
            content={moreMenu}
            trigger="click"
            open={openMoreMenu}
          >
            <Button
              type="text"
              icon={<MoreOutlined/>}
              onClick={() => {
                setOpenMoreMenu((prevState => !prevState))
              }}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Popover>

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
      <AddNetworkModal
        isOpen={isOpenAddNetWorkModal}
        onAddNetworkSuccess={(nw => {
          setOpenAddNetWorkModal(false)
          loadNetworks()
        })}
        onCancel={() => {
          setOpenAddNetWorkModal(false)
        }}/>
    </Layout>
  )
}
export default Main