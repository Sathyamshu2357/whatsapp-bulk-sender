// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const venom = require('venom-bot');
const { parsePhoneNumber } = require('libphonenumber-js');


require('electron-reload')(__dirname);

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


let venomClient;

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      qrData = base64Qr;
      mainWindow.webContents.send('qr', qrData)
    },
    (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
      if (statusSession === "inChat" || statusSession === "inLogged") {
        console.log("venom session is logged-in");
        mainWindow.webContents.send('connected')
      }
    },
    {
      logQR: false,
      autoClose: false
    }
  )
  .then((client) => venomClient = client)
  .catch(console.error);


const sendText = async (number, msg) => {
  const parsedNumber = parsePhoneNumber(number, "IN").number;
  console.log(parsedNumber, msg);
  const respoonse = await venomClient.sendText(`${parsedNumber}@c.us`, msg);
  return respoonse;
}

const test = () => {
  return new Promise((resolve) => setTimeout(() => resolve("ome"), 5000))
}

const rendererCallables = {
  "send": sendText,
  "test": test
};

ipcMain.handle('call', async (event, method, ...args) => {
  let returnValue;
  console.log(`handling call ${method}`)
  const callable = rendererCallables[method];
  if (typeof callable === "function") {
    returnValue = await rendererCallables[method](...args);
  }
  return returnValue;
})
