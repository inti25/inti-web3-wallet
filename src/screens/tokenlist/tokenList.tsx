import React, {useEffect, useState} from "react"
import {Network} from "../../entities/network";
import {Account} from "../../entities/account";
import {Avatar, Button, Flex, Space, Table, TableProps} from "antd";
import {getNativeTokenInfo, getSolanaSPLToken, getTokenBalance} from "../../utils/tokenUtils";
import {formatCurrencyUSD} from "../../utils/formatUtil";
import AddTokenModal from "../../modals/addTokenModal";
import TransferModal from "../../modals/transferModal";
import {DELETE_TOKEN_EVENT, GET_TOKENS_EVENT} from "../../utils/BridgeUtil";
import {Token} from "../../entities/token";
import {VMTYPE} from "../../utils/constains";
import {formatUnits} from "ethers";


const TokenList = (props: { network: Network, account: Account }) => {
  const ipcRenderer = (window as any).ipcRenderer;
  const [tokens, setTokens] = useState([]);
  const [openAddTokenModal, setOpenAddTokenModal] = useState(false);
  const [transferToken, setTransferToken] = useState<Token>(null);
  const [isOpenTransferModal, setTransferModel] = useState(false);

  const columns: TableProps<Token>['columns'] = [
    {
      title: 'Image',
      dataIndex: 'image',
      align: 'center',
      render: (_, record) => (
        <Avatar key={record.image} size={"default"} src={record.image}>{record.symbol}</Avatar>
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
      render: (_, record) => (
        <>{formatCurrencyUSD(formatUnits(record.balance, record.decimal))}</>
      )
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size={"middle"}>
          <Flex justify={"space-between"}>
            <Button type="link" onClick={() => {
              setTransferToken(record);
              setTransferModel(true);
            }}>Transfer</Button>
            { record.address && props.network.vmType == VMTYPE.EVM && <Button  type="text" onClick={() => {deleteToken(record)}} danger>Hide</Button>}
          </Flex>
        </Space>
      ),
    },
  ];

  async function deleteToken(token: Token) {
    await ipcRenderer.invoke(DELETE_TOKEN_EVENT, token);
    getTokens();
  }

  useEffect(() => {
    if (props.network && props.network.rpcUrl && props.account && props.account.address) {
      console.log('props.network', props.network.name)
      console.log('props.account', props.account.address)
      getTokens();
    } else {
      setTokens([]);
    }
  }, [props.network, props.account])

  async function getTokens() {
    if (props.network.vmType == VMTYPE.SOLANA) {
      const sol = await getNativeTokenInfo(props.account.address, props.network)
      setTokens([sol])
      const tokens = await getSolanaSPLToken(props.account.address, props.network.rpcUrl);
      setTokens([sol, ...tokens])
    } else if (props.network.vmType == VMTYPE.EVM) {
      const result = await ipcRenderer.invoke(GET_TOKENS_EVENT, props.network);
      for (let i = 0; i < result.length; i++) {
        result[i].key = result[i].address;
        result[i].balance = await getTokenBalance(props.account.address, result[i], props.network);
      }
      setTokens([await getNativeTokenInfo(props.account.address, props.network), ...result])
    }
  }

  return (
    <div>
      <TransferModal network={props.network} account={props.account} token={transferToken} isOpen={isOpenTransferModal} onCancel={() => {setTransferModel(false)}} />
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
        <Button onClick={() => {
          setOpenAddTokenModal(true)
        }}>Import Token</Button>
      </Flex>

      <Table columns={columns} dataSource={tokens}/>
    </div>
  )
}
export default TokenList
