import React from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import Main from "./screens/main/Main";
import Unlock from "./screens/Unlock";

function App() {

  return (
      <>
          <Router future={{ v7_startTransition: true }}>
            <Routes>
              <Route path={'/'} element={<Main />} />
              <Route path={'/unlock'} element={<Unlock />} />
            </Routes>
          </Router>
      </>
  );
}

export default App;