"use strict";

const tmi = require('tmi.js');
const moment = require('moment');

const commandManager = require('./core/command/commandManager');
const systemManager = require('./core/system/systemManager');
const variableManager = require('./core/variable/variableManager');
const viewerManager = require('./core/viewer/viewerManager');
const pointsManager = require('./points/pointsManager');
const Request = require('./Request');

const commandResolver = require('./resolvers/commandResolver');
const variableResolver = require('./resolvers/variableResolver');

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

let interval = null;

// -----
//  Private
// -----

// _connect()
const _connect = function _connect() {
  if ( client.readyState() === 'OPEN' ) {
    return client.disconnect().connect();
  }

  return client.connect();
}; //- _connect()

// _wrapReply()
const _wrapReply = function _wrapReply(request, reply) {
  return function wrappedReply(message) {
    variableResolver.resolve(message, request)
      .then((result) => {
        reply(request.channel, result);
      })
      .catch((error) => {
        console.error(error);
      });
  };
}; //- _wrapReply()

// _getReply()
const _getReply = function _getReply(request) {
  const messageType = request.messageType;

  let reply = client[messageType];
  if ( messageType === 'chat' ) reply = client.say;

  const wrappedReply = _wrapReply(request, reply.bind(client));

  wrappedReply.say = _wrapReply(request, client.say.bind(client));
  wrappedReply.whisper = _wrapReply(request, client.whisper.bind(client));

  return wrappedReply;
}; //- _getReply()

// _handleRequest()
const _handleRequest = function _handleRequest(request) {
  const message = request.message;
  const messageType = request.messageType;
  const username = request.username;
  const viewer = request.viewer;

  const parsed = commandResolver.resolve(message, messageType);
  const reply = _getReply(request);

  if ( parsed == null ) {    
    const modSystem = systemManager.getOne('$ModSystem');

    if ( modSystem.hasLinks(message, viewer) === true ) {
      const linksConfig = modSystem.config;

      reply(`/timeout $user ${ linksConfig.linkTimeoutLength }`);
      reply(`Hey $user, we don't allow that kind 'round here! (Link timeout: ${ linksConfig.linkTimeoutLength }s)`);

      return;
    }
  }

  if ( parsed != null && parsed.command.metadata.enabled !== false ) {
    const cooldown = parsed.command.onCooldown(viewer);
    if ( cooldown !== false && moment.isDuration(cooldown) ) {
      const secs = Math.round(cooldown.asSeconds());
      reply(`Hey $user, you have another ${ secs }s to wait before you can execute that again!`);
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
    if ( parsed.command.canExecute(viewer) ) {
      request._command = parsed.commandText;
      request._params = parsed.params;
      request._metadata = parsed.command.metadata;

      commandResolver.execute(parsed.command, request, reply);
    }
  }
}; //- _handleRequest()

// _setupListeners()
const _setupListeners = function _setupListeners() {
  return new Promise((resolve, reject) => {
    // join
    client.on('join', (channel, user) => {
      viewerManager._trackActive(user, channel.replace('#', ''), true);

      if ( user === me ) {
        if ( !client.isMod(channel, me) && channel !== `#${ me }`) {
          console.warn(`[ WT ] [ WARN ] Not a mod in channel ${ channel }`)
        }
      }
    });
    //- join

    // part
    client.on('part', (channel, user) => {
      viewerManager._trackActive(user, channel.replace('#', ''), false);
    });
    //- part

    // message
    client.on('message', (channel, userState, message, isSelf) => {
      if ( userState.username.toLowerCase() === clientConfig.identity.username.toLowerCase() ) return;

      const messageType = userState['message-type'];
      const userData = {
        username: userState.username,
        userId: userState['user-id'],
        displayName: userState['display-name'],
        isBroadcaster: userState['user-type'] === 'broadcaster',
        isModerator: userState.mod,
        isSubscriber: userState.subscriber
      };
      viewerManager._trackActive(userData.username, channel.replace('#', ''), true, userData, true)
        .then((viewer) => {
          return pointsManager.getOne(userData.username, channel)
            .then((points) => {
              viewer.points = points;
              return Promise.resolve(viewer);
            });
        })
        .then((viewer) => {
          const request = new Request(channel, message, messageType, viewer);
          _handleRequest(request);
        });
    }); //- message

    // Start Loop
    interval = setInterval(function() {
      systemManager.notify('tick', {
        time: moment().valueOf(),
        channel: clientConfig.channel,
        reply: _getReply(new Request(clientConfig.channel, "", "chat", {}))
      });
    }, 60000);
    
    systemManager.notify('tick', {
      time: moment().valueOf(),
      channel: clientConfig.channel,
      reply: _getReply(new Request(clientConfig.channel, "", "chat", {}))
    });

    resolve();
  });
}; //- _setupListeners()

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