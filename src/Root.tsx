import React from 'react';
import {createRoot} from 'react-dom/client';
import {App as AntApp, ConfigProvider, theme} from 'antd';
import App from "./App";
import './index.css';
// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(
  <ConfigProvider
    theme={{
    // 1. Use dark algorithm
    algorithm: theme.darkAlgorithm,

    // 2. Combine dark algorithm and compact algorithm
    // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
  }}>
    <AntApp notification={{placement: "bottom"}}>
      <App />
    </AntApp>
  </ConfigProvider>
);

// const root = createRoot(document.getElementById('root') as HTMLElement);
// root.render(
//     <App />
// );

// const root = createRoot(document.body);
// root.render(<App />);
