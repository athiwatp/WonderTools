"use strict";

const Command = require('../core/command/Command');
const commandManager = require('../core/command/commandManager');

const PARAMS_REGEX = /"([^"]+)"|(\w+)/g;

// -----
//  Private
// -----

// _resolve()
const _resolve = function _resolve(text, messageType) {
  const split = text.split(' ');
  const paramString = split.splice(1).join(' ');
  const commandText = split[0];

  const command = commandManager.getOne(commandText, messageType);
  if ( command != null ) {
    let params = [];
    if ( Array.isArray(command.params) && command.params.length > 0 ) {
      const matches = paramString.match(PARAMS_REGEX);

      if ( matches != null ) {
        params = matches.map((item) => {
          return item.replace('"', '');
        });
      }
    }

    return { commandText, command, params };
  }
}; //- _resolve()

// _execute()
const _execute = function _execute(command, request, reply) {
  command._trackCooldown(request.username);
  if ( command.counterType === Command.COUNTER_AUTOMATIC ) {
    command._trackCounter();
  }
  
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
}; //- _execute()

// Exports
module.exports = {
  resolve: _resolve, execute: _execute
};