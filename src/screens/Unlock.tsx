import {Button, Flex, Input, Result, App } from "antd"
import React, {useState} from "react"
import {VERIFY_PASSWORD_EVENT} from "../utils/BridgeUtil";
import { useNavigate } from 'react-router-dom';


const Unlock = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const ipcRenderer = (window as any).ipcRenderer;
  const navigate = useNavigate();
  const { message, notification, modal } = App.useApp();


  function onInputChanged(value: string) {
    setPassword(value);
  }

  async function unlock() {
    setLoading(true);
    const result = await ipcRenderer.invoke(VERIFY_PASSWORD_EVENT, password);
    setLoading(false);
    if (result) {
      navigate('/main')
    } else {
      modal.error({ title: 'Incorrect Password!' });
    }
  }

  return (
    <Flex className={'fullScreen'} justify={"center"} align={"center"}>
      <Result
        status="403"
        title="Unlock your wallet!"
        subTitle=""
        extra={
          <Flex gap={"middle"}>
            <Input.Password placeholder="input password" onChange={event => onInputChanged(event.target.value)} />
            <Button disabled={!password} loading={loading} type={"primary"} onClick={() => {unlock()}}>Unlock</Button>
          </Flex>
        }
      />
    </Flex>
  )
}
export default Unlock