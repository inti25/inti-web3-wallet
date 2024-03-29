import React, {useEffect, useState} from "react"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  CopyOutlined, MoreOutlined, EditOutlined
} from '@ant-design/icons';
import {Layout, Menu, Button, theme, MenuProps, Flex, Select, Tooltip, Popover, Avatar} from 'antd';
import './index.css'
import {GET_ACCOUNTS_EVENT, GET_NETWORKS_EVENT} from "../../utils/BridgeUtil";
import {Network} from "../../entities/network";
import AddNetworkModal from "../../modals/addNetworkModal";
import {Account} from "../../entities/account";
import AddNewAccount from "../../modals/addNewAccount";
import TokenList from "../tokenlist/tokenList";

const {Header, Sider, Content} = Layout;

const Main = () => {
  const ipcRenderer = (window as any).ipcRenderer;
  const [isOpenAddNetWorkModal, setOpenAddNetWorkModal] = useState(false);
  const [isOpenAddAccountModal, setOpenAddAccountModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentNetwork, setCurrentNetWork] = useState<Network>();
  const [currentAccount, setCurrentAccount] = useState<Account>();
  const [openMoreMenu, setOpenMoreMenu] = useState(false);
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
    if (result.length > 0) {
      setCurrentNetWork(result[0]);
    }
  }

  useEffect(() => {
    loadNetworks();
  }, [])

  async function loadAccounts() {
    const _accounts = await ipcRenderer.invoke(GET_ACCOUNTS_EVENT, currentNetwork.vmType);
    setAccounts(_accounts);
    if (_accounts.length > 0) {
      setCurrentAccount(_accounts[0]);
    }
  }

  useEffect(() => {
    if (currentNetwork) {
      loadAccounts();
    }
  }, [currentNetwork])

  const onClick: MenuProps['onClick'] = (e) => {
    if (e.key == '0') {
      setOpenAddNetWorkModal(true)
    } else {
      const cur = networks.filter(n => n.id == Number(e.key))[0];
      setCurrentAccount(null);
      setCurrentNetWork(cur);
    }
  };

  const onAccountChange = (value: string) => {
    const acc = accounts.filter(item => item.address == value)[0];
    setCurrentAccount(acc)
  };

  const moreMenu = (
    <Flex vertical gap={"small"}>
      <Button disabled={!currentAccount} icon={<CopyOutlined/>}>Copy Address</Button>
      <Button disabled={!currentAccount} icon={<EditOutlined/>}>Edit Account</Button>
      <Button icon={<PlusOutlined/>} onClick={() => {
        setOpenAddAccountModal(true)
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
          selectedKeys={[String(currentNetwork ? currentNetwork.id : 1)]}
          onClick={onClick}
          items={networks.map((item: Network) => {
            return {
              key: item.id,
              icon: item.id == 0 ? item.image : <Avatar src={item.image}>{item.name[0]}</Avatar>,
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
            size={"large"}
            style={{flex: 1}}
            value={currentAccount?.address}
            onChange={onAccountChange}
            options={accounts.map(item => {
              return {
                value: item.address,
                label: `${item.name}: ${item.address}`
              }
            })}
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
          <TokenList account={currentAccount} network={currentNetwork}/>
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
      <AddNewAccount
        isOpen={isOpenAddAccountModal}
        onCancel={() => {
          setOpenAddAccountModal(false)
        }}
        onSuccess={() => {
          setOpenAddAccountModal(false)
          loadAccounts()
        }}
        nameDefault={`Account ${accounts.length}`}
        vmType={currentNetwork?.vmType}
      />
    </Layout>
  )
}
export default Main
