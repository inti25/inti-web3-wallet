import React, {useEffect, useState} from "react"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  CopyOutlined, MoreOutlined, EditOutlined, SettingOutlined, DeleteOutlined
} from '@ant-design/icons';
import {Layout, Menu, Button, theme, MenuProps, Flex, Select, Tooltip, Popover, Avatar, Dropdown, App} from 'antd';
import './index.css'
import {DELETE_NETWORKS_EVENT, GET_ACCOUNTS_EVENT, GET_NETWORKS_EVENT} from "../../utils/BridgeUtil";
import {Network} from "../../entities/network";
import AddNetworkModal from "../../modals/addNetworkModal";
import {Account} from "../../entities/account";
import AddNewAccount from "../../modals/addNewAccount";
import TokenList from "../tokenlist/tokenList";

const {Header, Sider, Content} = Layout;

const Main = () => {
  const ipcRenderer = (window as any).ipcRenderer;
  const clipboard = (window as any).clipboard;
  const { message, notification, modal } = App.useApp();
  const [isOpenAddNetWorkModal, setOpenAddNetWorkModal] = useState(false);
  const [isOpenEditNetworkModal, setOpenEditNetworkModal] = useState(false);
  const [isOpenAddAccountModal, setOpenAddAccountModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentNetwork, setCurrentNetWork] = useState<Network>(null);
  const [currentAccount, setCurrentAccount] = useState<Account>(null);
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      label: 'Edit Network',
      key: '0',
      icon: <EditOutlined />,
      disabled: !currentNetwork,
      onClick: handleOnclickMenuItem
    },
    {
      label: 'Delete Network',
      key: '1',
      danger: true,
      disabled: !currentNetwork,
      icon: <DeleteOutlined />,
      onClick: handleOnclickMenuItem
    },
  ];

  const accMenuItem : MenuProps['items'] = [
    {
      label: 'Copy Address',
      key: '3',
      icon: <CopyOutlined />,
      disabled: !currentAccount,
      onClick: handleOnclickMenuItem
    },
    {
      label: 'Edit Account',
      key: '4',
      disabled: !currentAccount,
      icon: <EditOutlined />,
      onClick: handleOnclickMenuItem
    },
    {
      label: 'Add Account',
      key: '5',
      icon: <PlusOutlined />,
      onClick: handleOnclickMenuItem
    },
  ];

  async function handleOnclickMenuItem(info : any) {
    console.log('handleOnclickMenuItem', info)
    switch (info.key) {
      case '0':
        setOpenEditNetworkModal(true);
        break;
      case '1':
        await ipcRenderer.invoke(DELETE_NETWORKS_EVENT, currentNetwork?.id);
        setCurrentNetWork(null);
        setCurrentAccount(null);
        loadNetworks();
        break;
      case '3':
        clipboard.writeText(currentAccount?.address);
        message.success('Address is copied to clipboard!');
        break;
      case '5':
        setOpenAddAccountModal(true);
        break;
      default:
        break;
    }
  }

  async function loadNetworks() {
    const result = await ipcRenderer.invoke(GET_NETWORKS_EVENT, null);
    result.push({
      id: 0,
      image: <PlusOutlined/>,
      name: 'Add Network'
    })
    setNetworks(result);
    if (result.length > 0 && currentAccount == null) {
      setCurrentNetWork(result[0]);
    }
  }

  useEffect(() => {
    loadNetworks();
  }, [])

  async function loadAccounts() {
    const _accounts = await ipcRenderer.invoke(GET_ACCOUNTS_EVENT, currentNetwork.vmType);
    setAccounts(_accounts);
    if (_accounts.length > 0 && currentAccount == null) {
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
          <div style={{flex: 1}}>{currentNetwork?.name}</div>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Dropdown>
        </Header>
        <div
          style={{
            margin: '24px 16px 0 16px',
            paddingLeft: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
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
          <Dropdown menu={{ items: accMenuItem }} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined/>}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Dropdown>
        </div>
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
          setNetworks([...networks, nw]);
          loadNetworks()
        })}
        onCancel={() => {
          setOpenAddNetWorkModal(false)
        }}/>
      <AddNetworkModal
        isOpen={isOpenEditNetworkModal}
        network={currentNetwork}
        onAddNetworkSuccess={(nw => {
          setOpenEditNetworkModal(false)
          loadNetworks().then(() => {
            setCurrentNetWork(nw);
          })
        })}
        onCancel={() => {
          setOpenEditNetworkModal(false)
        }}/>
      <AddNewAccount
        isOpen={isOpenAddAccountModal}
        onCancel={() => {
          setOpenAddAccountModal(false)
        }}
        onSuccess={(acc) => {
          setOpenAddAccountModal(false)
          loadAccounts().then(() => {
            setCurrentAccount(acc);
          })
        }}
        nameDefault={`Account ${accounts.length}`}
        vmType={currentNetwork?.vmType}
      />
    </Layout>
  )
}
export default Main
