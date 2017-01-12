import path from 'path';
import { connect } from 'camo';

import { app, Menu } from 'electron';

import { editMenuTemplate } from './menu/edit_menu_template';
import { devMenuTemplate } from './menu/dev_menu_template';
import createWindow from './helpers/window';
import Client from './bot/Client.js';

import envFunc from './env';
const env = envFunc(__dirname);

let mainWindow;

const setApplicationMenu = function () {
  const menus = [ {}, editMenuTemplate ];

  if ( env.name !== 'production' ) {
    menus.push(devMenuTemplate);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

if ( env.name !== 'production' ) {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

const dataPath = app.getPath('userData');
const uri = `nedb://${ path.join(dataPath, 'data') }`;

app.on('ready', function () {
  setApplicationMenu();

  connect(uri)
    .then(() => {
      app.botClient = new Client();
      return app.botClient._loadConfig();
    })
    .then(() => {
      mainWindow = createWindow('main', {
        width: 1366,
        height: 768,
        resizable: false,
      });
      
      app.botClient._mainWindow = mainWindow;
      mainWindow.loadURL('file://' + __dirname + '/ui/views/app.html');
    });
});

app.on('window-all-closed', () => {
  app.quit();
});
