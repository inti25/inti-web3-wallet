import React, {useEffect} from "react"
import { Button, Result } from 'antd';
import {GET_PASSWORD_EVENT, SAVE_PASSWORD_EVENT} from "../../utils/BridgeUtil";
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const ipcRenderer = (window as any).ipcRenderer;
  const navigate = useNavigate();
  async function loadData() {
    ipcRenderer.invoke(GET_PASSWORD_EVENT, null).then((result: any) => {
      if (result) {
        navigate('/unlock');
      } else {
        navigate('/getStarted');
      }
    })
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <Result
      className={'fullScreen'}
      status="403"
      title=""
      subTitle="Loading..."
    />
  )
}

export default SplashScreen