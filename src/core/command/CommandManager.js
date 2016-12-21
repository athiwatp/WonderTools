"use strict";

const path = require('path');

const glob = require('glob');

const Command = require('./Command');
const CustomCommand = require('./CustomCommand');

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
      const root = path.join(path.resolve(__dirname, '..', '..'), '**', '*Command.js');
      glob(root, (error, files) => {
        if ( error != null ) return reject(error);

        const promises = [];
        files.forEach((file) => {
          try {
            const cmdClass = require(file);
            if ( (cmdClass.prototype instanceof Command) === true ) {
              const cmd = new cmdClass();
              promises.push(this._register(cmd));
            }
          } 
          catch ( e ) {
            promises.push(Promise.reject(e));
            return;
          }
        });

        promises.push(this._loadCustom());

        Promise.all(promises)
          .then(resolve)
          .catch(reject);
      });
    });
  }
};

// Exports
module.exports = new CommandManager();