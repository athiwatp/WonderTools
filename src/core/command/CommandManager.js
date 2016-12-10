"use strict";

const path = require('path');

const glob = require('glob');

const Command = require('./Command');

// -----
//  Fields
// -----

const PARAM_NAME_REGEX = /\w+/g;

// -----
//  CommandManager
// -----

class CommandManager {
  constructor() {
    this._commands = [];
    this._commandsByType = {};
  }

  // -----
  //  Private
  // -----

  _parseCommandString(text) {
    const split = text.split(' ');
    const command = split[0];
    const paramsarr = split.splice(1);

    const params = [];
    if ( paramsarr != null && paramsarr.length > 0 ) {
      paramsarr.forEach((param) => {
        const matches = param.match(PARAM_NAME_REGEX);
        if ( matches.length > 0 ) {
          const name = matches[0];
          const quoted = param.indexOf('"') === 0;

          params.push({ name, quoted });
        }
      });
    }

    return { command, params };
  }

  _register(command) {
    if ( command == null || (command.command == null || command.command.length === 0) ) {
      throw new Error('Command not provided!');
    }

    if ( typeof(command.action) !== 'function' ) {
      throw new Error('The command must have an action!');
    }

    let messageTypes = command.messageTypes;
    if ( !Array.isArray(messageTypes) || messageTypes.length === 0 ) {
      messageTypes = [ 'chat' ];
    }

    // Register command
    this._commands = this._commands.filter(cmd => cmd.command !== command.command);
    this._commands.push(command);

    // Register command by message type
    messageTypes.forEach((mt) => {
      if ( this._commandsByType[mt] == null ) {
        this._commandsByType[mt] = {};
      }

      this._commandsByType[mt][command.command] = command;
    });
  }

  // -----
  //  Public
  // -----

  getOne(command, messageType) {
    const cmds = this._commandsByType[messageType];
    if ( cmds != null ) {
      return cmds[command];
    }
  }

  load() {
    this._commands = [];
    this._commandsByType = {};

    return new Promise((resolve, reject) => {
      const root = path.join(path.resolve(__dirname, '..', '..'), '**', '*Command.js');
      glob(root, (error, files) => {
        if ( error != null ) return reject(error);

        let err = null;
        files.forEach((file) => {
          try {
            const cmdClass = require(file);
            if ( (cmdClass.prototype instanceof Command) === true ) {
              const cmd = new cmdClass();

              const parsed = this._parseCommandString(cmd.usage);
              cmd._command = parsed.command;
              cmd._params = parsed.params;

              this._register(cmd);
            }
          } 
          catch ( e ) {
            err = e;
            return;
          }
        });

        if ( err != null ) {
          reject(err);
        } 
        else {
          resolve();
        }
      });
    });
  }
};

// Exports
module.exports = new CommandManager();