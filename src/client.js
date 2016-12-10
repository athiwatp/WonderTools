"use strict";

const tmi = require('tmi.js');
const moment = require('moment');

const commandManager = require('./core/command/commandManager');
const systemManager = require('./core/system/systemManager');
const variableManager = require('./core/variable/variableManager');
const Request = require('./Request');

const config = require('../config.json');
const clientConfig =  config.client;

const messageHandler = require('./messageHandler');

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

// _getReply()
const _getReply = function _getReply(channel, messageType) {
  let reply = client[messageType];
  if ( messageType === 'chat' ) reply = client.say;

  return function(message) {
    reply.call(client, channel, message);
  };
}; //- _getReply()

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

      const request = new Request(channel, message, messageType, username);
      messageHandler(request, userState, _getReply(channel, messageType));
    }); //- message

    // Start Loop
    interval = setInterval(function() {
      systemManager.notify('tick', {
        time: moment().valueOf(),
        channel: clientConfig.channel
      });
    }, 60000);
    
    systemManager.notify('tick', {
      time: moment().valueOf(),
      channel: clientConfig.channel
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