"use strict";

const Command = require('../core/command/Command');
const commandManager = require('../core/command/commandManager');

// -----
//  Private
// -----

// _parseParams()
const _parseParams = function _parseParams(str) {
  const params = [];
  let readingPart = false;
  let part = '';

  for ( var i = 0; i <= str.length - 1; i++ ) {        
    if ( str.charAt(i) === ' ' && !readingPart ) {
      if ( part.length > 0 ) { 
        params.push(part);
      }
      part = '';
    } 
    else {
      if ( str.charAt(i) === '"' ) {
        readingPart = !readingPart;
      } 
      else {
        part += str.charAt(i);
      }
    }
  }

  if ( part != null && part.length > 0 ) {
    params.push(part);
  }

  params.flags = {};
  params.forEach((param) => {
    if ( param.startsWith('--') ) {
      const split = param.split('=');
      const paramName = split[0].replace('--', '');
      let paramValue = true;

      if ( split.length > 1 ) {
        paramValue = split[1];
      }

      params.flags[paramName] = paramValue;
    }
  });

  return params;
}; //- _parseParams()

// _resolve()
const _resolve = function _resolve(text, messageType) {
  const split = text.split(' ');
  const paramString = split.splice(1).join(' ');
  const commandText = split[0];

  const command = commandManager.getOne(commandText, messageType);
  if ( command != null ) {
    const params = _parseParams(paramString);
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