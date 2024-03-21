import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import Unlock from "./screens/Unlock";
import GetStarted from "./screens/GetStarted/GetStarted";
import ImportMnemonic from "./screens/mnemonic/ImportMnemonic";
import SplashScreen from "./screens/splashScreen/SplashScreen";
import Main from "./screens/main/Main";

function App() {

  return (
      <>
          <Router future={{ v7_startTransition: true }}>
            <Routes>
              <Route path={'/'} element={<SplashScreen />} />
              <Route path={'/getStarted'} element={<GetStarted />} />
              <Route path={'/ImportMnemonic'} element={<ImportMnemonic />} />
              <Route path={'/CreateWallet'} element={<ImportMnemonic />} />
              <Route path={'/unlock'} element={<Unlock />} />
              <Route path={'/main'} element={<Main />} />
            </Routes>
          </Router>
      </>
  );
}

export default App;
