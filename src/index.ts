import {app, BrowserWindow, contextBridge, ipcMain, ipcRenderer} from 'electron';
import {SqliteHelper} from "./helper/sqliteHelper";
import {
  DELETE_NETWORKS_EVENT, DELETE_TOKEN_EVENT, GET_ACCOUNTS_EVENT,
  GET_NETWORKS_EVENT,
  GET_PASSWORD_EVENT, GET_TOKENS_EVENT, SAVE_ACCOUNT_EVENT,
  SAVE_NETWORKS_EVENT,
  SAVE_PASSWORD_EVENT, SAVE_TOKEN_EVENT,
  VERIFY_PASSWORD_EVENT
} from "./utils/BridgeUtil";
import {Network} from "./entities/network";
import {decrypt} from "./utils/encryptionUtil";
import {VMTYPE} from "./utils/constains";
import {getEtherPrivateKey, getSolanaPrivateKey} from "./utils/walletUtil";
import {encodeBase58, ethers} from "ethers";
import {Keypair} from "@solana/web3.js";
import {GlobalCache} from "./utils/GlobalCache";
import {Token} from "./entities/token";
import {fixCors} from "./utils/headerUtils";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const dbHelper = new SqliteHelper();
const globalCache = new GlobalCache();
const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
    },
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...fixCors(details.responseHeaders)
      },
    });
  });
  registerBridgeEvent();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function registerBridgeEvent() {
  ipcMain.handle(GET_PASSWORD_EVENT, async (event, someArgument) => {
    return await dbHelper.getPasswordHash();
  })

  ipcMain.handle(SAVE_PASSWORD_EVENT, async (event, someArgument) => {
    await dbHelper.savePassword(someArgument.password);
    await dbHelper.saveMnemonic(someArgument.mnemonic ,someArgument.password);
    return true
  })

  ipcMain.handle(VERIFY_PASSWORD_EVENT, async (event, password) => {
    const result = await dbHelper.verifyPassword(password);
    if (result) {
      globalCache.password = password;
    }
    return result
  })

  ipcMain.handle(GET_NETWORKS_EVENT, async (event, args) => {
    return await dbHelper.getNetworks();
  })

  ipcMain.handle(SAVE_NETWORKS_EVENT, async (event, nw) => {
    return await dbHelper.saveNetwork(nw as Network)
  })

  ipcMain.handle(DELETE_NETWORKS_EVENT, async (event, id) => {
    return await dbHelper.deleteNetwork(Number(id))
  })

  ipcMain.handle(GET_ACCOUNTS_EVENT, async (event, vmType) => {
    const accs = await dbHelper.getAccounts(vmType);
    for (let i = 0; i < accs.length; i++) {
      const {privateKey, address} = await getAddressKey(vmType, accs[i].accountIndex);
      accs[i].privateKey = privateKey;
      accs[i].address = address;
    }

    return accs;
  })

  ipcMain.handle(SAVE_ACCOUNT_EVENT, async (event, args) => {
    const acc =  await dbHelper.createAccount(args.vmType, args.accountName);
    const {privateKey, address} = await getAddressKey(args.vmType, acc.accountIndex);
    acc.privateKey = privateKey;
    acc.address = address;
    return acc;
  })

  ipcMain.handle(GET_TOKENS_EVENT, async (event, network) => {
    return await dbHelper.getTokens(network as Network);
  })

  ipcMain.handle(SAVE_TOKEN_EVENT, async (event, token) => {
    return await dbHelper.saveToken(token as Token)
  })

  ipcMain.handle(DELETE_TOKEN_EVENT, async (event, token) => {
    return await dbHelper.removeToken(token as Token)
  })
}

async function getAddressKey(vmType: string, index: number) {
  const _password = globalCache.password;
  if (!_password) return {
    address: null,
    privateKey: null
  }
  const mn = await dbHelper.getMnemonic();
  const mnemonic = decrypt(mn, _password);
  let _private = null;
  let _public = null;
  if (vmType == VMTYPE.EVM) {
    _private = getEtherPrivateKey(mnemonic, index);
    const wallet = new ethers.Wallet(_private);
    _public = await wallet.getAddress();
  } else if (vmType == VMTYPE.SOLANA) {
    const key = await getSolanaPrivateKey(mnemonic, index);
    const keypair = Keypair.fromSeed(key);
    _private = encodeBase58(keypair.secretKey);
    _public = keypair.publicKey.toString();
  }
  return  {
    address: _public,
    privateKey: _private
  }
}
