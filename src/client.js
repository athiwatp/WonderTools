"use strict";

const tmi = require('tmi.js');
const moment = require('moment');

const CommandManager = require('./command/CommandManager');
const SystemManager = require('./system/SystemManager');
const ViewerManager = require('./viewer/ViewerManager');
const PointsManager = require('./points/PointsManager');
const VariableManager = require('./variable/VariableManager');
const Request = require('./Request');

const config = require('../config.json');
const clientConfig =  config.client;

const me = clientConfig.identity.username;

// -----
//  Fields
// -----

const client = new tmi.client({
  options: clientConfig.options,
  connection: clientConfig.connection,
  identity: clientConfig.identity,
  channels: [ clientConfig.channel ]
});

const commandManager = new CommandManager();
const systemManager = new SystemManager();
const viewerManager = new ViewerManager();
const pointsManager = new PointsManager();
const variableManager = new VariableManager();

const plugins = {
  commandManager, systemManager,
  viewerManager, pointsManager
};

let interval = null;

// -----
//  Private
// -----

// _parseCommand()
const _parseCommand = function _parseCommand(text, messageType) {
  const split = text.split(' ');
  const paramString = split.splice(1).join(' ');
  const commandText = split[0];
  const command = commandManager.getOne(commandText, messageType);

  if ( command != null ) {
    let params = {};
    if ( Array.isArray(command.params) && command.params.length > 0 ) {
      const matches = paramString.match(CommandManager.PARAMS_REGEX);

      if ( matches != null && matches.length >= command.params.length ) {
        params = command.params.reduce((previous, current, index) => {
          previous[current.name] = matches[index].replace('"', '');
          return previous;
        }, {});
      }
      else {
        params = false;
      }
    }

    return { commandText, command, params };
  }
}; //- _parseCommand()

// _connect()
const _connect = function _connect() {
  if ( client.readyState() === 'OPEN' ) {
    return client.disconnect().connect();
  }

  return client.connect();
}; //- _connect()

// _callAction()
const _callAction = function _callAction(command, request, reply) {
  let result = command.action.call(command, request, reply);
  if ( !(result instanceof Promise) ) {
    if ( result instanceof Error ) {
      result = Promise.reject(result);
    }
    else {
      result = Promise.resolve(result || true);
    }
  }

  result.then((res) => {
    if ( res === false ) return;

    if ( command.pointCost != null && command.pointCost > 0 ) {
      const points = request.viewer.points;
      points.remove(command.pointCost);
    }
  })
  .catch((error) => {
    console.error(error);
  });
}; //- _callAction()

// _getViewerInfo()
const _getViewerInfo = function _getViewerInfo(username, channel, data) {
  return new Promise((resolve, reject) => {
    viewerManager.getOne(username, channel, data)
      .then((viewer) => {
        pointsManager.getOne(username, channel)
          .then((points) => {
            viewer.points = points;
            resolve(viewer);
          })
          .catch((error) => {
            reject(error);
          })
      })
      .catch((error) => {
        reject(error);
      })
  });
}; //- _getViewerInfo()

// _setupListeners()
const _setupListeners = function _setupListeners() {
  return new Promise((resolve, reject) => {
    // join
    client.on('join', (channel, user) => {
      if ( user === me ) {
        if ( !client.isMod(channel, me) && channel !== `#${ me }`) {
          console.warn(`[ WT ] [ WARN ] Not a mod in channel ${ channel }`)
        }
      }
    });
    //- join

    // message
    // TODO: Clean this up, it's a mess.
    client.on('message', (channel, userState, message, isSelf) => {
      const messageType = userState['message-type'];
      const userId = userState['user-id'];
      const username = userState.username;

      if ( username.toLowerCase() === clientConfig.identity.username.toLowerCase() ) return;

      const newPlugins = Object.assign({}, plugins);
      const request = new Request(channel, message, messageType, username, newPlugins);
      
      const parsed = _parseCommand(message, messageType);
      if ( parsed != null ) {
        const data = {
          userId: userId,
          isModerator: userState.mod,
          isSubscriber: userState.subscriber,
          isBroadcaster: userState['user-type'] === 'broadcaster',
          displayName: userState['display-name'],
          channel, username
        };

        _getViewerInfo(username, channel, data)
          .then((viewer) => {
            const reply = _getReply(channel, messageType, parsed.command, username, request);

            // Ensure the command isn't on cooldown
            const cooldown = parsed.command.onCooldown(username);
            if ( cooldown !== false && moment.isDuration(cooldown) ) {
              const secs = Math.round(cooldown.asSeconds());
              reply(`Hey ${ viewer.displayName }, you have another ${ secs }s to wait before you can execute that again!`);
              return;
            }

            // Ensure we can afford the command
            if ( parsed.command.pointCost != null && parsed.command.pointCost > 0 ) {
              if ( viewer.points.amount < parsed.command.pointCost ) {
                reply(`Hey ${ viewer.displayName }, you can't afford that action! FeelsBadMan`);
                return;
              }
            }

            // Ensure we have a high enough access level
            if ( parsed.command.canExecute(viewer, userState) ) {
              if ( parsed.params === false ){
                reply(`USAGE: ${ parsed.command.usage }`);
                return;
              }

              request._viewer = viewer;
              request._command = parsed.commandText;
              request._params = parsed.params;

              _callAction(parsed.command, request, reply);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }); //- message

    // Start Loop
    interval = setInterval(function() {
      systemManager.notify('tick', {
        time: moment().valueOf(),
        channel: clientConfig.channel,
        plugins: Object.assign({}, plugins),
      });
    }, 60000);
    
    systemManager.notify('tick', {
      time: moment().valueOf(),
      channel: clientConfig.channel,
      plugins: Object.assign({}, plugins),
    });

    resolve();
  });
}; //- _setupListeners()

// _getReply()
const _getReply = function _getReply(channel, messageType, command, username, request) {
  let reply = client[messageType];
  if ( messageType === 'chat' ) reply = client.say;

  return function(message) {
    command._trackCooldown(username);

    variableManager.resolve(message, request)
      .then((result) => {
        reply.call(client, channel, result);
      });
  };
}; //- _getReply()

// -----
//  Public
// -----

// connect()
const connect = function connect() {
  return commandManager.load()
    .then(systemManager.load.bind(systemManager))
    .then(variableManager.load.bind(variableManager))
    .then(_connect)
    .then(_setupListeners)
    .then(() => {
      // variableManager.resolve("a test $user", { viewer: { displayName: 'WonderToys' } })
      //   .then((result) => {
      //     console.log(result);
      //   });
      console.info('[ WT ] [ INFO ] Bot online.');
    })
    .catch((e) => { 
      throw e; 
    });
}; //- connect()

// disconnect()
const disconnect = function disconnect() {
  if ( interval != null ) {
    clearInterval(interval);
  }
  return client.disconnect();
}; //- disconnect()

// Exports
module.exports = {
  connect, disconnect
};