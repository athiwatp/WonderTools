"use strict";

import tmi from 'tmi.js';
import moment from 'moment';

import { Document } from 'camo';

import commandManager from './core/command/commandManager.js';
import systemManager from './core/system/systemManager.js';
import variableManager from './core/variable/variableManager.js';
import viewerManager from './core/viewer/viewerManager.js';
import pointsManager from './points/pointsManager.js';
import Request from './Request.js';

import commandResolver from './resolvers/commandResolver.js';
import variableResolver from './resolvers/variableResolver.js';

// -----
//  ClientConfig
// -----

class ClientConfig extends Document {
  constructor() {
    super();
    
    this.username = String;
    this.password = String;
    this.channel = String;
  }
};

// -----
//  Client
// -----

class Client {
  constructor() {
    this._interval = null;
    this._client = null;

    this._loadConfig();
  }

  // -----
  //  Properties
  // -----

  get canConnect() {
    return this._config != null && this._config.username != null && this._config.password != null;
  }

  get isConnected() {
    return this._client != null && this._client.readyState() === 'OPEN'
  }

  // -----
  //  Private
  // -----

  _connect() {
    if ( this._client == null ) {
      this._client = new tmi.client({
        options: { debug: true },
        connection: { reconnect: true },
        identity: { 
          username: this._config.username, 
          password: this._config.password 
        },
        channels: [ this._config.channel ]
      });
    }

    if ( this.isConnected ) {
      this.disconnect();
    }

    return Promise.resolve(this._client.connect());
  }

  // _wrapReply()
  _wrapReply(request, reply) {
    return function wrappedReply(message) {
      variableResolver.resolve(message, request)
        .then((result) => {
          reply(request.channel, result);
        })
        .catch((error) => {
          console.error(error);
        });
    };
  } //- _wrapReply()

  // _getReply()
  _getReply(request) {
    const messageType = request.messageType;
    const client = this._client;

    let reply = client[messageType];
    if ( messageType === 'chat' ) reply = client.say;

    const wrappedReply = this._wrapReply(request, reply.bind(client));

    wrappedReply.say = this._wrapReply(request, client.say.bind(client));
    wrappedReply.whisper = this._wrapReply(request, client.whisper.bind(client));

    return wrappedReply;
  } //- _getReply()

  // _handleRequest()
  _handleRequest(request) {
    const message = request.message;
    const messageType = request.messageType;
    const username = request.username;
    const viewer = request.viewer;

    const parsed = commandResolver.resolve(message, messageType);
    const reply = this._getReply(request);

    if ( parsed == null ) {    
      const modSystem = systemManager.getOne('$ModSystem');

      if ( modSystem.hasLinks(message, viewer) === true ) {
        const linksConfig = modSystem.metadata;

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
  } //- _handleRequest()

  // _setupListeners()
  _setupListeners() {
    const client = this._client;

    // join
    client.on('join', (channel, user) => {
      viewerManager._trackActive(user, channel.replace('#', ''), true);

      if ( user.toLowerCase() == this._config.username.toLowerCase() ) {
        if ( !client.isMod(channel, this._config.username) && channel !== `#${ this._config.username }`) {
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
      // Notify UI
      if ( this._mainWindow != null ) {
        this._mainWindow.send('botClient:chatMessage', {
          username: userState['display-name'] || userState.username,
          color: userState.color,
          text: message
        });
      };

      // Parse Message
      if ( userState.username.toLowerCase() === this._config.username.toLowerCase() ) return;
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
          this._handleRequest(request);
        });
    }); //- message

    // Start Loop
    this._interval = setInterval(() => {
      systemManager.notify('tick', {
        time: moment().valueOf(),
        channel: this._config.channel,
        reply: this._getReply(new Request(this._config.channel, "", "chat", {}))
      });
    }, 60000);
    
    systemManager.notify('tick', {
      time: moment().valueOf(),
      channel: this._config.channel,
      reply: this._getReply(new Request(this._config.channel, "", "chat", {}))
    });

    return Promise.resolve(true);
  } //- _setupListeners()

  // _loadConfig()
  _loadConfig() {
    return ClientConfig.findOne({})
      .then((config) => {
        if ( config != null ) {
          this._config = config;
          return Promise.resolve(config);
        }
        else {
          return ClientConfig.create({})
            .save()
            .then((config) => {
              this._config = config;
              return Promise.resolve(config);
            });
        }
      });
  } //- _loadConfig()

  // _loadManagers()
  _loadManagers() {
    return systemManager.load()
      .then(commandManager.load.bind(commandManager))
      .then(variableManager.load.bind(variableManager));
  }; //- _loadManagers()

  // -----
  //  Public
  // -----

  // connect()
  connect() {
    if ( !this.canConnect ) {
      return Promise.reject(new Error('Unable to connect. You are likely missing credentials for the bot!'));
    }

    return this._connect()
      .then(() => this._setupListeners())
      .then(() => {
        console.info('[ WT ] [ INFO ] Bot online.');
      })
      .catch((e) => { 
        throw e; 
      });
  } //- connect()

  // disconnect()
  disconnect() {
    if ( this._interval != null ) {
      clearInterval(this._interval);
    }

    this._client.disconnect();
    this._client = null;

    return this;
  } //- disconnect()
}; //- Client

// Exports 
export default Client;