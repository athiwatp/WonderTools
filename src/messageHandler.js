"use strict";

const commandManager = require('./core/command/commandManager');
const viewerManager = require('./core/viewer/viewerManager');
const variableManager = require('./core/variable/variableManager');
const pointsManager = require('./points/pointsManager');

// -----
//  Fields
// -----

const PARAMS_REGEX = /"([^"]+)"|(\w+)/g;

// -----
//  Private
// -----

// _parseMessage()
const _parseMessage = function _parseMessage(text, messageType) {
  const split = text.split(' ');
  const paramString = split.splice(1).join(' ');
  const commandText = split[0];

  const command = commandManager.getOne(commandText, messageType);
  if ( command != null ) {
    let params = {};
    if ( Array.isArray(command.params) && command.params.length > 0 ) {
      const matches = paramString.match(PARAMS_REGEX);

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
}; //- _parseMessage()

// _getViewerInfo()
const _getViewerInfo = function _getViewerInfo(request, data) {
  const username = request.username;
  const channel = request.channel;

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

// _getViewer()
const _getViewer = function _getViewer(request, userState) {
  if ( request.viewer == null ) {
    const data = {
      userId: userState['user-id'],
      isModerator: userState.mod,
      isSubscriber: userState.subscriber,
      isBroadcaster: userState['user-type'] === 'broadcaster',
      displayName: userState['display-name'],
      channel: request.channel, 
      username: request.username
    };

    return _getViewerInfo(request, data);
  }
  else {
    return Promise.resolve(request.viewer);
  }
}; //- _getViewer()

// _wrapReply()
const _wrapReply = function _wrapReply(request, reply) {
  return function wrappedReply(message) {
    variableManager.resolve(message, request)
      .then((result) => {
        reply(result);
      })
      .catch((error) => {
        console.error(error);
      });
  };
}; //- _wrapReply()

// _callAction()
const _callAction = function _callAction(command, request, reply) {
  command._trackCooldown(request.username);
  
  let result = command.action.call(command, request, _wrapReply(request, reply));
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

// -----
//  Public
// -----

// handleMessage()
const handleMessage = function handleMessage(request, userState, reply) {
  const message = request.message;
  const messageType = request.messageType;
  const username = request.username;

  const parsed = _parseMessage(message, messageType);
  if ( parsed != null ) {
    _getViewer(request, userState)
      .then((viewer) => {
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
}; //- handleMessage()

// Exports
module.exports = handleMessage;