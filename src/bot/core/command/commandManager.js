"use strict";

import path from 'path';
import glob from 'glob';

import Command from './Command.js';
import CustomCommand from './CustomCommand.js';

import builtInCommands from './commands.js';

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

  _register(command) {
    return new Promise((resolve, reject) => {
      if ( command == null || (command.command == null || command.command.length === 0) ) {
        reject(new Error('Command not provided!'));
      }

      if ( typeof(command.action) !== 'function' ) {
        reject( new Error('The command must have an action!'));
      }

      if ( this._commands.find(c => c.command === command.command) != null ) {
        reject(new Error(`A ${ command.command } command already exists!`));
      }

      let messageTypes = command.messageTypes;
      if ( !Array.isArray(messageTypes) || messageTypes.length === 0 ) {
        messageTypes = [ 'chat' ];
      }

      command._loadMetadata()
        .then(() => {
          // Register command
          this._commands.push(command);

          // Register command by message type
          messageTypes.forEach((mt) => {
            if ( this._commandsByType[mt] == null ) {
              this._commandsByType[mt] = {};
            }

            this._commandsByType[mt][command.command] = command;
          });

          resolve();
        });
    });
  }

  _createCustomCommand(data) {
    const customCommand = CustomCommand.create(data);
    return this._register(customCommand._toCommand())
      .then(() => {
        return customCommand.save();
      });
  }

  _removeCustomCommand(name) {
    return new Promise((resolve, reject) => {
      CustomCommand.deleteOne({ command: name })
        .then((numDeleted) => {
          if ( numDeleted > 0 ) {
            this._commands = this._commands.filter((c) => c.command !== name);

            for ( let key in this._commandsByType ) {
              delete this._commandsByType[key][name];
            }

            return resolve(true);
          } 

          reject(false);
        });
    });
  }

  _loadCustom() {
    return CustomCommand.find({})
      .then((commands) => {
        return Promise.all(commands.map((cmd) => {
          return this._register(cmd._toCommand());
        }));
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
      const promises = [];
      builtInCommands.forEach((command) => {
        try {
          promises.push(this._register(new command()));
        }
        catch ( e ) {
          promises.push(Promise.reject(e));
        }
      });

      promises.push(this._loadCustom());

      Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  }
};

// Exports
export default new CommandManager();