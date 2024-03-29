import React, {useEffect, useState} from "react"
import {Network} from "../../entities/network";
import {Account} from "../../entities/account";
import {Avatar, Button, Flex, Image, Space, Table, TableProps} from "antd";
import {getNativeTokenInfo, getTokenBalance} from "../../utils/tokenUtils";
import {formatCurrencyUSD} from "../../utils/formatUtil";
import AddTokenModal from "../../modals/addTokenModal";
import {GET_NETWORKS_EVENT, GET_TOKENS_EVENT} from "../../utils/BridgeUtil";
import {Token} from "../../entities/token";


const TokenList = (props: { network: Network, account: Account }) => {
  const ipcRenderer = (window as any).ipcRenderer;
  const [tokens, setTokens] = useState([]);
  const [openAddTokenModal, setOpenAddTokenModal] = useState(false);

  const columns: TableProps<Token>['columns'] = [
    {
      title: 'Image',
      dataIndex: 'image',
      align: 'center',
      render: (_, record) => (
        <Avatar  key={record.image} size={"default"} src={record.image}>{record.symbol}</Avatar>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      align: 'right',
      render: (text) => formatCurrencyUSD(text),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <a>Transfer</a>
        </Space>
      ),
    },
  ];


  useEffect(() => {
    if (props.network && props.account) {
      getTokens();
    }
  }, [props.network, props.account])

  async function getTokens() {
    const result = await ipcRenderer.invoke(GET_TOKENS_EVENT, props.network);
    for (let i = 0; i < result.length; i++) {
      result[i].key = result[i].address;
      result[i].balance = await getTokenBalance(props.account.address, result[i], props.network);
    }
    setTokens([await getNativeTokenInfo(props.account.address, props.network), ...result])
  }

  return (
    <div>
      <AddTokenModal
        isOpen={openAddTokenModal}
        network={props.network}
        onCancel={() => {
          setOpenAddTokenModal(false)
        }}
        onAddTokenSuccess={() => {
          getTokens();
          setOpenAddTokenModal(false);
        }}/>
      <Flex justify={"space-between"} style={{marginBottom: 16}}>
        <div>TokenList</div>
        <Button onClick={() => {setOpenAddTokenModal(true)}}>Import Token</Button>
      </Flex>

      <Table columns={columns} dataSource={tokens}/>
    </div>
  )
}
export default TokenList