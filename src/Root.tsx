import React from 'react';
import {createRoot} from 'react-dom/client';
import App from "./App";
import './index.css';
// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(<App />);

// const root = createRoot(document.getElementById('root') as HTMLElement);
// root.render(
//     <App />
// );

// const root = createRoot(document.body);
// root.render(<App />);